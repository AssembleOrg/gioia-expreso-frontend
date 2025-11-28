// Infrastructure layer - API client for calculator

import type {
  LocalidadesResponse,
  CotizacionResponse,
  SearchLocalidadesParams,
  CotizarRequest,
} from '@/domain/calculator/types';
import { API_BASE_URL, API_ENDPOINTS } from '@/shared/constants/api';

export class CalculatorClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async searchLocalidades(
    params: SearchLocalidadesParams
  ): Promise<LocalidadesResponse> {
    const searchParams = new URLSearchParams({
      q: params.q,
      ...(params.atendida !== undefined && {
        atendida: params.atendida.toString(),
      }),
    });

    const response = await fetch(
      `${this.baseUrl}${API_ENDPOINTS.LOCALIDADES}?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async cotizar(request: CotizarRequest): Promise<CotizacionResponse> {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.COTIZAR}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        acuerdos_id: 0,
        articulos_id: 0,
        ...request,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }
}

// Singleton instance
export const calculatorClient = new CalculatorClient();

