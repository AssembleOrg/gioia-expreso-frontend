import 'server-only';
import { rumbo, rumboConfigured, RumboError } from './rumbo-api.server';
import { leerPreorden } from './gioia.server';
import type { Preorder } from '@/domain/dispatch/types';
import type { RumboTracking } from './types';

/**
 * Seguimiento de una preorden para /seguimiento/{id}. `tracking: null` si
 * todavía no está en Rumbo (preorden anterior a la integración o recién
 * creada) o si Rumbo no responde.
 */
export async function seguimientoDePreorden(
  id: string,
): Promise<{ tracking: RumboTracking | null; preorden: Preorder | null }> {
  const preorden = await leerPreorden(id);
  if (!rumboConfigured()) return { tracking: null, preorden };
  try {
    const tracking = await rumbo<RumboTracking>(`/api/envios/${encodeURIComponent(id)}/seguimiento`);
    return { tracking, preorden };
  } catch (e) {
    if (!(e instanceof RumboError && e.status === 404)) console.error('[rumbo] seguimiento', e);
    return { tracking: null, preorden };
  }
}
