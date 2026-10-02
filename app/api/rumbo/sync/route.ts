import { NextResponse } from 'next/server';
import { rumboConfigured, RumboError } from '@/infrastructure/rumbo/rumbo-api.server';
import {
  cancelarSiExiste,
  leerPreorden,
  leerReparto,
  objetivoDePreorden,
  objetivoDeReparto,
  reconciliar,
  validarSesion,
} from '@/infrastructure/rumbo/sync.server';

export const dynamic = 'force-dynamic';

interface Pedido {
  /** Preórdenes que cambiaron (alta, aprobación, estado, edición). */
  preorderIds?: string[];
  /** Reparto que cambió de estado o recibió preórdenes. */
  containerId?: string;
  /** Sólo estas preórdenes del reparto (al sumarlas). Sin esto, todas. */
  containerPreorderIds?: string[];
  /** Preórdenes sacadas de un reparto: vuelven a depósito. */
  removedFromContainer?: string[];
}

/**
 * Lleva a Rumbo lo que cambió en Gioia. El navegador sólo dice QUÉ cambió;
 * el estado se calcula acá leyendo Gioia, con la sesión del usuario.
 */
export async function POST(req: Request) {
  if (!rumboConfigured()) return NextResponse.json({ ok: true, skipped: 'sin-configurar' });
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ ok: false, error: 'Sin sesión.' }, { status: 401 });

  let body: Pedido;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Pedido inválido.' }, { status: 400 });
  }

  const resultados: { id: string; ok: boolean; status?: string; error?: string }[] = [];
  const hacer = async (id: string, fn: () => Promise<{ status: string } | null>) => {
    try {
      const r = await fn();
      resultados.push({ id, ok: true, status: r?.status });
    } catch (e) {
      resultados.push({ id, ok: false, error: e instanceof Error ? e.message : 'Error' });
    }
  };

  try {
    await validarSesion(token);

    for (const id of new Set(body.preorderIds ?? [])) {
      await hacer(id, async () => {
        const p = await leerPreorden(id);
        // Borrada en Gioia: si llegó a Rumbo, se cancela ahí.
        if (!p) return cancelarSiExiste(id);
        return reconciliar(p, objetivoDePreorden(p));
      });
    }

    for (const id of new Set(body.removedFromContainer ?? [])) {
      await hacer(id, async () => {
        const p = await leerPreorden(id);
        if (!p) return null;
        const obj = objetivoDePreorden(p);
        return reconciliar(p, { ...obj, modo: 'exacto' });
      });
    }

    if (body.containerId) {
      const reparto = await leerReparto(body.containerId, token);
      const filtro = body.containerPreorderIds ? new Set(body.containerPreorderIds) : null;
      for (const { preorder } of reparto?.preorders ?? []) {
        if (filtro && !filtro.has(preorder.id)) continue;
        await hacer(preorder.id, () => reconciliar(preorder, objetivoDeReparto(preorder, reparto!.status)));
      }
    }
  } catch (e) {
    const status = e instanceof RumboError ? e.status : 500;
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Error' }, { status });
  }

  const fallas = resultados.filter((r) => !r.ok);
  if (fallas.length) console.error('[rumbo] sincronización con fallas', fallas);
  return NextResponse.json({ ok: fallas.length === 0, resultados });
}
