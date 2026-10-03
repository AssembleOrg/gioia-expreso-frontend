import 'server-only';
import { API_BASE_URL } from '@/shared/constants/api';
import type { Preorder } from '@/domain/dispatch/types';
import { RumboError } from './rumbo-api.server';

/*
 * Lecturas de Gioia para el seguimiento. Rumbo se entera de los cambios
 * por el backend (rumbo_outbox); esta app sólo lee y valida sesiones.
 */

async function gioia<T>(path: string, token?: string): Promise<T | null> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  // Un cuerpo sin leer deja el socket tomado hasta el GC.
  if (!res.ok) await res.body?.cancel().catch(() => undefined);
  if (res.status === 404) return null;
  if (res.status === 401 || res.status === 403) throw new RumboError('Sesión de Gioia no válida.', 401);
  if (!res.ok) throw new RumboError(`Gioia respondió ${res.status}`, 502);
  const json = await res.json();
  return (json?.data ?? json) as T;
}

/** La preorden (endpoint público de Gioia). null si no existe o se borró. */
export function leerPreorden(id: string): Promise<Preorder | null> {
  return gioia<Preorder>(`/voucher/preorders/${encodeURIComponent(id)}`).catch(() => null);
}

/** Valida que el token sea de una sesión real de Gioia. */
export async function validarSesion(token: string): Promise<void> {
  await gioia('/voucher/preorders?limit=1', token);
}

/** Token Bearer del pedido, o null. */
export function tokenDe(req: Request): string | null {
  return req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || null;
}
