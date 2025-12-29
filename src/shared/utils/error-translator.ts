/**
 * Utilidad para traducir mensajes de error del navegador al español.
 */

const ERROR_TRANSLATIONS: Record<string, string> = {
  'Failed to fetch': 'Error de conexión. Verificá tu conexión a internet.',
  NetworkError: 'Error de red. No se pudo conectar al servidor.',
  'Load failed': 'Error de conexión. Verificá tu conexión a internet.',
  'Network request failed': 'Error de red. Intentá nuevamente.',
  'net::ERR_': 'Error de conexión con el servidor.',
  ECONNREFUSED: 'No se pudo conectar al servidor.',
  ETIMEDOUT: 'La conexión tardó demasiado. Intentá nuevamente.',
  ENOTFOUND: 'No se pudo encontrar el servidor.',
  abort: 'La solicitud fue cancelada.',
  timeout: 'La solicitud tardó demasiado. Intentá nuevamente.',
};

/**
 * @param error - El error capturado
 * @param fallback - Mensaje de fallback en español
 * @returns Mensaje de error en español
 */
export function translateError(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const message = error.message;

    for (const [key, translation] of Object.entries(ERROR_TRANSLATIONS)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return translation;
      }
    }
    return message;
  }

  return fallback;
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('failed to fetch') ||
      message.includes('networkerror') ||
      message.includes('network request failed') ||
      message.includes('load failed') ||
      message.includes('net::err_') ||
      message.includes('econnrefused') ||
      message.includes('etimedout')
    );
  }
  return false;
}
