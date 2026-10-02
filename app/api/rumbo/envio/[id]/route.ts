import { NextResponse } from 'next/server';
import { RumboError } from '@/infrastructure/rumbo/rumbo-api.server';
import { leerPreorden, objetivoDePreorden, reconciliar, validarSesion } from '@/infrastructure/rumbo/sync.server';

export const dynamic = 'force-dynamic';

/**
 * Para el panel: código, link de seguimiento y mensaje/link de WhatsApp de
 * una preorden. Sólo con sesión de Gioia (el envío completo tiene datos del
 * destinatario).
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ ok: false, error: 'Sin sesión.' }, { status: 401 });
  const { id } = await ctx.params;
  try {
    await validarSesion(token);
    const p = await leerPreorden(id);
    if (!p) return NextResponse.json({ ok: false, error: 'No encontramos ese envío.' }, { status: 404 });
    const s = await reconciliar(p, objetivoDePreorden(p));
    return NextResponse.json({
      ok: true,
      data: {
        code: s.codeDisplay,
        status: s.status,
        statusLabel: s.statusLabel,
        trackingUrl: s.trackingUrl,
        whatsapp: s.whatsapp,
      },
    });
  } catch (e) {
    const status = e instanceof RumboError ? e.status : 500;
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Error' }, { status });
  }
}
