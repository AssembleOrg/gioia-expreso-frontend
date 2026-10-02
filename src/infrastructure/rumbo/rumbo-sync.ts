'use client';

import { notifications } from '@mantine/notifications';

interface Cambio {
  preorderIds?: string[];
  containerId?: string;
  containerPreorderIds?: string[];
  removedFromContainer?: string[];
}

/**
 * Avisa que algo cambió en Gioia para que el seguimiento (Rumbo) lo refleje.
 * No frena nada: la operación en Gioia ya se hizo. Si el seguimiento no se
 * pudo actualizar, se muestra un aviso y se puede reintentar repitiendo la
 * acción o abriendo el seguimiento (se pone al día solo).
 */
export function avisarSeguimiento(cambio: Cambio): void {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('auth_token');
  if (!token) return;
  void fetch('/api/rumbo/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(cambio),
    keepalive: true,
  })
    .then(async (r) => {
      const json = await r.json().catch(() => null);
      if (!r.ok || json?.ok === false) throw new Error(json?.error ?? 'error');
    })
    .catch(() => {
      notifications.show({
        color: 'yellow',
        title: 'Seguimiento sin actualizar',
        message: 'El cambio se guardó, pero el seguimiento del cliente no se actualizó. Se pondrá al día al abrirlo.',
      });
    });
}
