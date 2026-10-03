import type { Preorder, PreorderStatus } from '@/domain/dispatch/types';
import { API_BASE_URL } from '@/shared/constants/api';
import { translateError } from '@/shared/utils/error-translator';

/** Cliente completo (GET /voucher/clients/:id). */
export interface ClienteGioia {
  id: string;
  fullname: string;
  phone: string;
  email: string;
  cuit: string | null;
  address: string;
}

export interface CambiosEnvio {
  status?: PreorderStatus;
  origin?: string;
  originPostal?: string;
  destination?: string;
  destinationPostal?: string;
  notes?: string;
}

export type CambiosCliente = Partial<Omit<ClienteGioia, 'id'>>;

function headers(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function pedir<T>(path: string, init: RequestInit, porDefecto: string): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: headers() });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const m = json?.message;
      throw new Error(Array.isArray(m) ? m.join('. ') : m || porDefecto);
    }
    return (json?.data ?? json) as T;
  } catch (e) {
    throw new Error(translateError(e, porDefecto));
  }
}

/**
 * Lo que usa la sección Seguimiento para ver y editar envíos y clientes.
 * Pega a los mismos endpoints del backend que el resto del panel; los
 * cambios de estado llegan a Rumbo solos (rumbo_outbox).
 */
export const SeguimientoClient = {
  envio: (id: string) => pedir<Preorder>(`/voucher/preorders/${id}`, { method: 'GET' }, 'No se pudo cargar el envío'),
  editarEnvio: (id: string, cambios: CambiosEnvio) =>
    pedir<Preorder>(`/voucher/preorders/${id}`, { method: 'PUT', body: JSON.stringify(cambios) }, 'No se pudo guardar el envío'),
  eliminarEnvio: (id: string) =>
    pedir<unknown>(`/voucher/preorders/${id}`, { method: 'DELETE' }, 'No se pudo eliminar el envío'),
  comprobante: async (id: string): Promise<Blob> => {
    const res = await fetch(`${API_BASE_URL}/voucher/preorders/${id}/pdf`, { headers: headers() });
    if (!res.ok) throw new Error('No se pudo descargar el comprobante');
    return res.blob();
  },
  cliente: (id: string) => pedir<ClienteGioia>(`/voucher/clients/${id}`, { method: 'GET' }, 'No se pudo cargar el cliente'),
  editarCliente: (id: string, cambios: CambiosCliente) =>
    pedir<ClienteGioia>(`/voucher/clients/${id}`, { method: 'PUT', body: JSON.stringify(cambios) }, 'No se pudo guardar el cliente'),
};
