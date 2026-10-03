import { API_BASE_URL } from '@/shared/constants/api';
import { translateError } from '@/shared/utils/error-translator';

/*
 * Agenda: clientes (quien manda; tabla clients del backend, únicos por email)
 * y destinatarios (quien recibe; /recipients). Sólo para el personal.
 */

export interface Pagina<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface Cliente {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  cuit: string | null;
  address: string;
  quantityVouchers?: number;
  _count?: { preorders: number };
}
export type DatosCliente = Pick<Cliente, 'fullname' | 'email' | 'phone' | 'address'> & { cuit?: string };

export interface Destinatario {
  id: string;
  fullname: string;
  dni: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  notes: string | null;
  clientId: string | null;
}
export type DatosDestinatario = Partial<Omit<Destinatario, 'id' | 'fullname' | 'address'>> & {
  fullname: string;
  address: string;
};

function headers(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function pedir<T>(path: string, init: RequestInit, porDefecto: string, crudo = false): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: headers() });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const m = json?.message;
      throw new Error(Array.isArray(m) ? m.join('. ') : m || porDefecto);
    }
    return (crudo ? json : json?.data ?? json) as T;
  } catch (e) {
    throw new Error(translateError(e, porDefecto));
  }
}

function query(p: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) if (v !== undefined && v !== '') q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : '';
}

/** Lista paginada: el backend responde { data, meta } en la raíz. */
async function pagina<T>(path: string, porDefecto: string): Promise<Pagina<T>> {
  const j = await pedir<{ data: T[]; meta: Pagina<T>['meta'] }>(path, { method: 'GET' }, porDefecto, true);
  return { data: j.data ?? [], meta: j.meta ?? { total: 0, page: 1, limit: 0, totalPages: 1 } };
}

export const AgendaClient = {
  clientes: (p: { search?: string; page?: number; limit?: number } = {}) =>
    pagina<Cliente>(`/voucher/clients${query(p)}`, 'No se pudieron cargar los clientes'),
  crearCliente: (d: DatosCliente) =>
    pedir<Cliente>('/voucher/clients', { method: 'POST', body: JSON.stringify(d) }, 'No se pudo crear el cliente'),
  editarCliente: (id: string, d: Partial<DatosCliente>) =>
    pedir<Cliente>(`/voucher/clients/${id}`, { method: 'PUT', body: JSON.stringify(d) }, 'No se pudo guardar el cliente'),
  borrarCliente: (id: string) =>
    pedir<unknown>(`/voucher/clients/${id}`, { method: 'DELETE' }, 'No se pudo borrar el cliente'),

  destinatarios: (p: { search?: string; clientId?: string; page?: number; limit?: number } = {}) =>
    pagina<Destinatario>(`/recipients${query(p)}`, 'No se pudieron cargar los destinatarios'),
  crearDestinatario: (d: DatosDestinatario) =>
    pedir<Destinatario>('/recipients', { method: 'POST', body: JSON.stringify(d) }, 'No se pudo crear el destinatario'),
  editarDestinatario: (id: string, d: Partial<DatosDestinatario>) =>
    pedir<Destinatario>(`/recipients/${id}`, { method: 'PUT', body: JSON.stringify(d) }, 'No se pudo guardar el destinatario'),
  borrarDestinatario: (id: string) =>
    pedir<unknown>(`/recipients/${id}`, { method: 'DELETE' }, 'No se pudo borrar el destinatario'),
};
