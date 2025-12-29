import type { Transport, TransportWithContainers } from '@/domain/dispatch/types';
import { API_BASE_URL } from '@/shared/constants/api';
import { translateError } from '@/shared/utils/error-translator';

export interface TransportFilters {
  page?: number;
  limit?: number;
  name?: string;
  licensePlate?: string;
  available?: boolean;
}

export interface CreateTransportDTO {
  name: string;
  licensePlate: string;
  available?: boolean;
}

export interface UpdateTransportDTO {
  name?: string;
  licensePlate?: string;
  available?: boolean;
}

export interface TransportListResponse {
  data: Transport[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class TransportClient {
  private static getToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  private static getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getToken()}`,
    };
  }

  static async getTransports(filters: TransportFilters = {}): Promise<Transport[]> {
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.licensePlate) params.append('licensePlate', filters.licensePlate);
      if (filters.available !== undefined) params.append('available', filters.available.toString());

      const url = `${API_BASE_URL}/transports?${params.toString()}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener transportes' }));
        throw new Error(errorData.message || 'Error al obtener transportes');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(translateError(error, 'Error al obtener transportes'));
    }
  }

  static async getTransportsPaginated(filters: TransportFilters = {}): Promise<TransportListResponse> {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.name) params.append('name', filters.name);
      if (filters.licensePlate) params.append('licensePlate', filters.licensePlate);
      if (filters.available !== undefined) params.append('available', filters.available.toString());

      const url = `${API_BASE_URL}/transports/paginated?${params.toString()}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener transportes' }));
        throw new Error(errorData.message || 'Error al obtener transportes');
      }

      return response.json();
    } catch (error) {
      throw new Error(translateError(error, 'Error al obtener transportes'));
    }
  }

  static async getTransportById(id: string): Promise<TransportWithContainers> {
    try {
      const response = await fetch(`${API_BASE_URL}/transports/${id}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Transporte no encontrado' }));
        throw new Error(errorData.message || 'Transporte no encontrado');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(translateError(error, 'Transporte no encontrado'));
    }
  }

  static async createTransport(data: CreateTransportDTO): Promise<Transport> {
    try {
      const response = await fetch(`${API_BASE_URL}/transports`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al crear transporte' }));
        throw new Error(errorData.message || 'Error al crear transporte');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(translateError(error, 'Error al crear transporte'));
    }
  }

  static async updateTransport(id: string, data: UpdateTransportDTO): Promise<Transport> {
    try {
      const response = await fetch(`${API_BASE_URL}/transports/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al actualizar transporte' }));
        throw new Error(errorData.message || 'Error al actualizar transporte');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(translateError(error, 'Error al actualizar transporte'));
    }
  }

  static async deleteTransport(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/transports/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al eliminar transporte' }));
        throw new Error(errorData.message || 'Error al eliminar transporte');
      }
    } catch (error) {
      throw new Error(translateError(error, 'Error al eliminar transporte'));
    }
  }
}
