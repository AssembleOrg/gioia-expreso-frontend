import { NextResponse } from 'next/server';
import { rumbo, RumboError } from '@/infrastructure/rumbo/rumbo-api.server';
import { tokenDe, validarSesion } from '@/infrastructure/rumbo/gioia.server';
import type { RumboListado } from '@/infrastructure/rumbo/types';

export const dynamic = 'force-dynamic';

const ESTADOS = new Set(['EN_DEPOSITO', 'EN_PREPARACION', 'EN_DISTRIBUCION', 'ENTREGADO', 'NO_ENTREGADO', 'CANCELADO']);

/** Lista de envíos en seguimiento para la sección del panel. */
export async function GET(req: Request) {
  const token = tokenDe(req);
  if (!token) return NextResponse.json({ ok: false, error: 'Sin sesión.' }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const params = new URLSearchParams();
  const status = sp.get('status');
  if (status && ESTADOS.has(status)) params.set('status', status);
  const q = sp.get('q')?.trim().slice(0, 80);
  if (q) params.set('q', q);
  params.set('limit', String(Math.min(Math.max(Number(sp.get('limit')) || 20, 1), 100)));
  params.set('offset', String(Math.max(Number(sp.get('offset')) || 0, 0)));
  try {
    await validarSesion(token);
    return NextResponse.json({ ok: true, data: await rumbo<RumboListado>(`/api/envios?${params}`) });
  } catch (e) {
    const code = e instanceof RumboError ? e.status : 500;
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Error' }, { status: code });
  }
}
