import { NextResponse } from 'next/server';
import { rumboRaw } from '@/infrastructure/rumbo/rumbo-api.server';

export const dynamic = 'force-dynamic';

/** QR del seguimiento de una preorden (abre transportegioia.com.ar/seguimiento/…). */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const formato = new URL(req.url).searchParams.get('formato') === 'png' ? 'png' : 'svg';
  try {
    const res = await rumboRaw(`/api/envios/${encodeURIComponent(id)}/qr?formato=${formato}`);
    if (!res.ok) {
      await res.body?.cancel().catch(() => undefined);
      return new NextResponse(res.status === 404 ? 'Ese envío todavía no está en seguimiento.' : 'No se pudo generar el QR.', {
        status: res.status === 404 ? 404 : 502,
      });
    }
    return new NextResponse(await res.arrayBuffer(), {
      headers: {
        'Content-Type': res.headers.get('content-type') ?? (formato === 'png' ? 'image/png' : 'image/svg+xml'),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return new NextResponse('No se pudo generar el QR.', { status: 502 });
  }
}
