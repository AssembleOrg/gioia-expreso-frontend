import 'server-only';

/**
 * Cliente de Rumbo del lado del servidor. La clave (RUMBO_API_KEY) nunca
 * llega al navegador: todo pasa por las rutas /api/rumbo de esta app.
 */
export class RumboError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
  }
}

export function rumboConfigured(): boolean {
  return Boolean(process.env.RUMBO_API_URL && process.env.RUMBO_API_KEY);
}

export async function rumbo<T>(
  path: string,
  init: { method?: string; body?: unknown; raw?: false } = {},
): Promise<T> {
  const base = process.env.RUMBO_API_URL?.replace(/\/$/, '');
  const key = process.env.RUMBO_API_KEY;
  if (!base || !key) throw new RumboError('Rumbo no está configurado.', 503);
  const res = await fetch(`${base}${path}`, {
    method: init.method ?? (init.body ? 'POST' : 'GET'),
    headers: {
      Authorization: `Bearer ${key}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new RumboError(json?.error?.message ?? `Rumbo respondió ${res.status}`, res.status, json?.error?.code);
  }
  return json.data as T;
}

/** Imagen tal cual (QR). */
export async function rumboRaw(path: string): Promise<Response> {
  const base = process.env.RUMBO_API_URL?.replace(/\/$/, '');
  const key = process.env.RUMBO_API_KEY;
  if (!base || !key) throw new RumboError('Rumbo no está configurado.', 503);
  return fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
}
