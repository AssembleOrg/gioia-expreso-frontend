import { NextResponse } from 'next/server';
import { rumbo, RumboError } from '@/infrastructure/rumbo/rumbo-api.server';
import { tokenDe, validarSesion } from '@/infrastructure/rumbo/gioia.server';
import type { RumboShipment } from '@/infrastructure/rumbo/types';

export const dynamic = 'force-dynamic';

/** Lo que leyó el escáner (link, código o guía) → el envío, con su preorden. */
export async function POST(req: Request) {
  const token = tokenDe(req);
  if (!token) return NextResponse.json({ ok: false, error: 'Sin sesión.' }, { status: 401 });
  let texto = '';
  try {
    texto = String((await req.json())?.texto ?? '').trim().slice(0, 500);
  } catch {
    // cuerpo inválido: se responde abajo
  }
  if (!texto) return NextResponse.json({ ok: false, error: 'El QR vino vacío.' }, { status: 400 });
  try {
    await validarSesion(token);
    const s = await rumbo<RumboShipment>('/api/envios/escaneo', { body: { texto } });
    return NextResponse.json({ ok: true, data: { preorderId: s.externalRef, code: s.codeDisplay, status: s.status } });
  } catch (e) {
    const code = e instanceof RumboError ? e.status : 500;
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Error' }, { status: code });
  }
}
