// Infrastructure layer - API client for calculator

import type {
  LocalidadesResponse,
  CotizacionResponse,
  SearchLocalidadesParams,
  CotizarRequest,
} from '@/domain/calculator/types';
import { API_BASE_URL, API_ENDPOINTS } from '@/shared/constants/api';
import { translateError } from '@/shared/utils/error-translator';

export class CalculatorClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async searchLocalidades(
    params: SearchLocalidadesParams
  ): Promise<LocalidadesResponse> {
    try {
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
        throw new Error('Error al buscar localidades');
      }

      return response.json();
    } catch (error) {
      throw new Error(translateError(error, 'Error al buscar localidades'));
    }
  }

  async cotizar(request: CotizarRequest): Promise<CotizacionResponse> {
    try {
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
        throw new Error(errorData.message || 'Error al obtener cotización');
      }

      return response.json();
    } catch (error) {
      throw new Error(translateError(error, 'Error al obtener cotización'));
    }
  }
}

// Singleton instance
export const calculatorClient = new CalculatorClient();

