import { NextResponse } from 'next/server';
import { rumboRaw } from '@/infrastructure/rumbo/rumbo-api.server';
import { leerPreorden, objetivoDePreorden, reconciliar } from '@/infrastructure/rumbo/sync.server';

export const dynamic = 'force-dynamic';

/**
 * QR del seguimiento de una preorden (abre transportegioia.com.ar/tracking/…).
 * Si la preorden todavía no está en Rumbo (anterior a la integración), se
 * carga en el momento con lo que Gioia muestra públicamente.
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const formato = new URL(req.url).searchParams.get('formato') === 'png' ? 'png' : 'svg';
  const pedir = () => rumboRaw(`/api/envios/${encodeURIComponent(id)}/qr?formato=${formato}`);
  try {
    let res = await pedir();
    if (res.status === 404) {
      const p = await leerPreorden(id);
      if (!p) return new NextResponse('No encontramos ese envío.', { status: 404 });
      await reconciliar(p, objetivoDePreorden(p));
      res = await pedir();
    }
    if (!res.ok) return new NextResponse('No se pudo generar el QR.', { status: 502 });
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
