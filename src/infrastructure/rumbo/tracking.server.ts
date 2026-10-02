import 'server-only';
import { rumbo, rumboConfigured, RumboError } from './rumbo-api.server';
import { leerPreorden, objetivoDePreorden, reconciliar } from './sync.server';
import type { Preorder } from '@/domain/dispatch/types';
import type { RumboTracking } from './types';

/**
 * Seguimiento de una preorden para la página pública. Si todavía no está en
 * Rumbo (preorden anterior a la integración), se carga en el momento.
 * `null` si Rumbo no está configurado o no responde: la página muestra la
 * vista anterior, armada sólo con datos de Gioia.
 */
export async function seguimientoDePreorden(
  id: string,
): Promise<{ tracking: RumboTracking; preorden: Preorder | null } | null> {
  if (!rumboConfigured()) return null;
  const preorden = await leerPreorden(id).catch(() => null);
  const pedir = () => rumbo<RumboTracking>(`/api/envios/${encodeURIComponent(id)}/seguimiento`);
  try {
    return { tracking: await pedir(), preorden };
  } catch (e) {
    if (!(e instanceof RumboError) || e.status !== 404 || !preorden) {
      if (!(e instanceof RumboError && e.status === 404)) console.error('[rumbo] seguimiento', e);
      return null;
    }
  }
  try {
    await reconciliar(preorden, objetivoDePreorden(preorden));
    return { tracking: await pedir(), preorden };
  } catch (e) {
    console.error('[rumbo] alta en el momento', e);
    return null;
  }
}
