// Infrastructure layer - API client for calculator

import type {
  LocalidadesResponse,
  CotizacionResponse,
  SearchLocalidadesParams,
  CotizarRequest,
  FilialPublicResponse,
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

      const data = await response.json();
      
      // Map backend response to frontend Localidad type
      const mappedLocalidades = data.data.localidades.map((item: any) => ({
        id: item.id,
        localidad_id: item.codigo || item.id.toString(),
        localidad: item.localidad_nombre || '',
        provincia_id: item.provincias_id || 0,
        provincia_nombre: item.provincia_nombre || '',
        centroide_lat: item.latitud || '',
        centroide_lon: item.longitud || '',
        cp: item.cp || '',
        cobertura: item.cobertura || undefined,
        mapa: false,
        zoom: 0,
        provincia: {
          id: item.provincias_id || 0,
          provincia: item.provincia_nombre || '',
          codigoafip: 0,
          codigo: item.codigo || '',
        },
      }));

      return {
        ...data,
        data: {
          localidades: mappedLocalidades,
        },
      };
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
        body: JSON.stringify(request),
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

  async getFilialPublic(coberturaId: number): Promise<FilialPublicResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}${API_ENDPOINTS.FILIAL_PUBLIC}/${coberturaId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener información de la filial');
      }

      return response.json();
    } catch (error) {
      throw new Error(translateError(error, 'Error al obtener información de la filial'));
    }
  }
}

// Singleton instance
export const calculatorClient = new CalculatorClient();

