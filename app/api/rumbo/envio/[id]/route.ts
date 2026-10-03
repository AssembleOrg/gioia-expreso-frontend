import { NextResponse } from 'next/server';
import { rumbo, RumboError } from '@/infrastructure/rumbo/rumbo-api.server';
import { tokenDe, validarSesion } from '@/infrastructure/rumbo/gioia.server';
import type { RumboShipment } from '@/infrastructure/rumbo/types';

export const dynamic = 'force-dynamic';

/**
 * Para el panel: código, link de seguimiento y WhatsApp de una preorden.
 * Sólo con sesión de Gioia (el envío completo tiene datos del destinatario).
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const token = tokenDe(req);
  if (!token) return NextResponse.json({ ok: false, error: 'Sin sesión.' }, { status: 401 });
  const { id } = await ctx.params;
  try {
    await validarSesion(token);
    const s = await rumbo<RumboShipment>(`/api/envios/${encodeURIComponent(id)}`);
    return NextResponse.json({
      ok: true,
      data: { code: s.codeDisplay, status: s.status, statusLabel: s.statusLabel, trackingUrl: s.trackingUrl, whatsapp: s.whatsapp },
    });
  } catch (e) {
    const status = e instanceof RumboError ? e.status : 500;
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Error' }, { status });
  }
}
