import 'server-only';
import { API_BASE_URL } from '@/shared/constants/api';
import type { ContainerStatus, Preorder, PreorderStatus } from '@/domain/dispatch/types';
import { rumbo, RumboError } from './rumbo-api.server';
import type { RumboShipment, RumboStatus } from './types';

/**
 * Sincronización Gioia → Rumbo.
 *
 * Gioia sigue siendo el dueño de los datos (preórdenes y repartos en su
 * backend). Rumbo es el seguimiento: estados que ve el comprador, QR, link y
 * WhatsApp. Cada acción del panel le pide a esta capa que lleve a Rumbo el
 * estado que corresponde según Gioia; nunca se confía en un estado que mande
 * el navegador.
 *
 * Mapeo (acordado con Gioia):
 *   preorden creada / pendiente / confirmada → EN_DEPOSITO
 *   reparto en carga (ON_LOAD)               → EN_PREPARACION
 *   reparto viajando (TRAVELLING)            → EN_DISTRIBUCION ("En camino")
 *   reparto llegó (ARRIVED)                  → EN_DISTRIBUCION + novedad "Llegó a la sucursal de destino"
 *   preorden completada                      → ENTREGADO
 *   preorden cancelada (o borrada)           → CANCELADO
 */

const ORDEN: Record<RumboStatus, number> = {
  EN_DEPOSITO: 0,
  EN_PREPARACION: 1,
  EN_DISTRIBUCION: 2,
  NO_ENTREGADO: 2,
  ENTREGADO: 3,
  CANCELADO: 4,
};
const FINAL = new Set<RumboStatus>(['ENTREGADO', 'CANCELADO']);
export const NOTA_LLEGO = 'Llegó a la sucursal de destino.';

const CONTAINER_A_RUMBO: Record<ContainerStatus, RumboStatus> = {
  ON_LOAD: 'EN_PREPARACION',
  TRAVELLING: 'EN_DISTRIBUCION',
  ARRIVED: 'EN_DISTRIBUCION',
};

function desdePreorden(status: PreorderStatus): RumboStatus {
  if (status === 'COMPLETED') return 'ENTREGADO';
  if (status === 'CANCELLED') return 'CANCELADO';
  return 'EN_DEPOSITO';
}

// ---- Lectura de Gioia -------------------------------------------------------

async function gioia<T>(path: string, token?: string): Promise<T | null> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  // Un cuerpo sin leer deja el socket tomado hasta el GC: se descarta antes
  // de cada salida temprana.
  if (!res.ok) await res.body?.cancel().catch(() => undefined);
  if (res.status === 404) return null;
  if (res.status === 401 || res.status === 403) throw new RumboError('Sesión de Gioia no válida.', 401);
  if (!res.ok) throw new RumboError(`Gioia respondió ${res.status}`, 502);
  const json = await res.json();
  return (json?.data ?? json) as T;
}

/** La preorden (endpoint público de Gioia). null si no existe o se borró. */
export function leerPreorden(id: string): Promise<Preorder | null> {
  return gioia<Preorder>(`/voucher/preorders/${encodeURIComponent(id)}`);
}

/** Valida que el token sea de una sesión real de Gioia. */
export async function validarSesion(token: string): Promise<void> {
  await gioia('/voucher/preorders?limit=1', token);
}

export function leerReparto(id: string, token: string) {
  return gioia<{ id: string; status: ContainerStatus; preorders?: { preorder: Preorder }[] }>(
    `/containers/${encodeURIComponent(id)}`,
    token,
  );
}

// ---- Armado del envío ------------------------------------------------------

/** "Destinatario: Laura Pérez - DNI: 123 - Tel: 11 4444 5555" → nombre y tel. */
function destinatarioDeNotas(notes: string | null): { nombre?: string; tel?: string } {
  const m = notes?.match(/Destinatario:\s*([^|]+?)\s*-\s*DNI:[^|]*?-\s*Tel:\s*([^|]+)/i);
  if (!m) return {};
  return { nombre: m[1].trim(), tel: m[2].trim() };
}

function campoDeNotas(notes: string | null, campo: string): string | undefined {
  const m = notes?.match(new RegExp(`${campo}:\\s*([^|]+)`, 'i'));
  return m?.[1].trim() || undefined;
}

/** "Mitre 100, Lanús, Buenos Aires" → localidad y provincia. */
function lugar(direccion: string): { ciudad: string; provincia: string | null } {
  const partes = direccion.split(',').map((p) => p.trim()).filter(Boolean);
  if (partes.length >= 3) return { ciudad: partes[partes.length - 2], provincia: partes[partes.length - 1] };
  if (partes.length === 2) return { ciudad: partes[1], provincia: null };
  return { ciudad: partes[0] || 'A confirmar', provincia: null };
}

function altaDesdePreorden(p: Preorder, estado: RumboStatus) {
  const dest = destinatarioDeNotas(p.notes);
  const { ciudad, provincia } = lugar(p.destination);
  const bultos = p.packages?.reduce((n, pk) => n + (pk.quantity || 0), 0) || 1;
  const tipos = [...new Set(p.packages?.map((pk) => pk.packageType?.name).filter(Boolean))];
  const origen = campoDeNotas(p.notes, 'Sucursal origen');
  return {
    externalRef: p.id,
    senderName: p.client?.fullname ?? null,
    recipientName: dest.nombre || p.client?.fullname || 'Destinatario',
    recipientPhone: dest.tel || p.client?.phone || null,
    addressLine: p.destination,
    city: ciudad,
    province: provincia,
    postalCode: p.destinationPostal && p.destinationPostal !== '0000' ? p.destinationPostal : null,
    itemsSummary: [`Guía ${p.voucherNumber}`, tipos.length ? tipos.join(', ') : null].filter(Boolean).join(' · '),
    packages: Math.min(Math.max(bultos, 1), 999),
    // Un envío nuevo arranca en depósito, preparación o distribución.
    status: estado === 'EN_PREPARACION' || estado === 'EN_DISTRIBUCION' ? estado : 'EN_DEPOSITO',
    location: origen ?? null,
    note: origen ? `Ingresó a ${origen}.` : 'Ingresó al depósito de Transportes Gioia.',
  };
}

// ---- Reconciliación ---------------------------------------------------------

async function buscar(ref: string): Promise<RumboShipment | null> {
  try {
    return await rumbo<RumboShipment>(`/api/envios/${encodeURIComponent(ref)}`);
  } catch (e) {
    if (e instanceof RumboError && e.status === 404) return null;
    throw e;
  }
}

async function mover(ref: string, status: RumboStatus, note?: string) {
  return rumbo<RumboShipment>(`/api/envios/${encodeURIComponent(ref)}/eventos`, { body: { status, note } });
}

async function deshacer(ref: string) {
  return rumbo<RumboShipment>(`/api/envios/${encodeURIComponent(ref)}/eventos/deshacer`, { method: 'POST' });
}

export interface Objetivo {
  status: RumboStatus;
  /**
   * `minimo`: si Rumbo ya va más adelante (por un reparto), se deja.
   * `exacto`: se lleva justo a ese estado, deshaciendo pasos si hace falta.
   */
  modo: 'minimo' | 'exacto';
  /** Novedad a dejar si todavía no figura (p. ej. "Llegó a la sucursal"). */
  nota?: string;
}

/**
 * Lleva el envío de Rumbo al objetivo. Crea el envío si no existe (por eso
 * necesita la preorden). Devuelve el envío como queda.
 */
export async function reconciliar(p: Preorder, obj: Objetivo): Promise<RumboShipment> {
  let s = await buscar(p.id);
  if (!s) {
    const r = await rumbo<{ shipment: RumboShipment }>('/api/envios', { body: altaDesdePreorden(p, obj.status) });
    s = await buscar(p.id) ?? r.shipment;
  }

  // Gioia lo tiene activo pero Rumbo terminado (se reabrió o se corrigió):
  // se deshacen pasos hasta salir del estado final.
  let vueltas = 0;
  while (FINAL.has(s.status) && s.status !== obj.status && vueltas++ < 4) {
    s = await deshacer(p.id);
  }

  if (obj.status === 'CANCELADO') {
    if (s.status !== 'CANCELADO') s = await mover(p.id, 'CANCELADO', 'El envío se canceló.');
    return s;
  }

  const actual = ORDEN[s.status];
  const meta = ORDEN[obj.status];
  if (meta > actual) {
    s = await mover(p.id, obj.status, obj.status === 'ENTREGADO' ? undefined : obj.nota);
    return s;
  }
  if (meta < actual && obj.modo === 'exacto') {
    while (ORDEN[s.status] > meta && vueltas++ < 6) {
      try {
        s = await deshacer(p.id);
      } catch {
        break;
      }
    }
    if (s.status !== obj.status && ORDEN[s.status] < meta) s = await mover(p.id, obj.status);
  }
  if (obj.nota && s.status === obj.status) {
    const ultima = s.events?.[s.events.length - 1];
    if (ultima?.note !== obj.nota) s = await mover(p.id, obj.status, obj.nota);
  }
  return s;
}

/** La preorden se borró en Gioia: si estaba en Rumbo, se cancela ahí. */
export async function cancelarSiExiste(ref: string): Promise<RumboShipment | null> {
  const s = await buscar(ref);
  if (!s || s.status === 'CANCELADO') return s;
  return mover(ref, 'CANCELADO', 'El envío se canceló.');
}

/** Estado según la preorden sola (sin mirar repartos). */
export function objetivoDePreorden(p: Preorder): Objetivo {
  const status = desdePreorden(p.status);
  // Completada o cancelada manda siempre; si sigue activa, un reparto puede
  // tenerla más adelante y eso no se pisa.
  return { status, modo: status === 'EN_DEPOSITO' ? 'minimo' : 'exacto' };
}

/** Estado según el reparto en el que viaja (salvo que ya esté terminada). */
export function objetivoDeReparto(p: Preorder, reparto: ContainerStatus): Objetivo {
  const propio = desdePreorden(p.status);
  if (propio !== 'EN_DEPOSITO') return { status: propio, modo: 'exacto' };
  return {
    status: CONTAINER_A_RUMBO[reparto],
    modo: 'exacto',
    nota: reparto === 'ARRIVED' ? NOTA_LLEGO : undefined,
  };
}
