import type {
  Container,
  ContainerListResponse,
  CreateContainerDTO,
  Transport,
  ContainerStatus,
} from '@/domain/dispatch/types';
import { API_BASE_URL } from '@/shared/constants/api';
import { translateError } from '@/shared/utils/error-translator';

export interface ContainerFilters {
  page?: number;
  limit?: number;
  status?: ContainerStatus;
  origin?: string;
  destination?: string;
}

export class RepartosClient {
  private static getToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  private static getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getToken()}`,
    };
  }

  static async createContainer(data: CreateContainerDTO): Promise<Container> {
    try {
      const response = await fetch(`${API_BASE_URL}/containers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al crear reparto' }));
        throw new Error(errorData.message || 'Error al crear reparto');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(translateError(error, 'Error al crear reparto'));
    }
  }

  static async getContainers(filters: ContainerFilters = {}): Promise<Container[]> {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.origin) params.append('origin', filters.origin);
      if (filters.destination) params.append('destination', filters.destination);

      const url = `${API_BASE_URL}/containers?${params.toString()}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener repartos' }));
        throw new Error(errorData.message || 'Error al obtener repartos');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(translateError(error, 'Error al obtener repartos'));
    }
  }

  static async getContainersPaginated(filters: ContainerFilters = {}): Promise<ContainerListResponse> {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.origin) params.append('origin', filters.origin);
      if (filters.destination) params.append('destination', filters.destination);

      const url = `${API_BASE_URL}/containers/paginated?${params.toString()}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener repartos' }));
        throw new Error(errorData.message || 'Error al obtener repartos');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(translateError(error, 'Error al obtener repartos'));
    }
  }

  static async getContainerById(id: string): Promise<Container> {
    try {
      const response = await fetch(`${API_BASE_URL}/containers/${id}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Reparto no encontrado' }));
        throw new Error(errorData.message || 'Reparto no encontrado');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(translateError(error, 'Reparto no encontrado'));
    }
  }

  static async addPreordersToContainer(containerId: string, preorderIds: string[]): Promise<Container> {
    try {
      const response = await fetch(`${API_BASE_URL}/containers/${containerId}/preorders`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ preorderIds }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al agregar paquetes' }));
        throw new Error(errorData.message || 'Error al agregar paquetes');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(translateError(error, 'Error al agregar paquetes'));
    }
  }

  static async changeContainerStatus(containerId: string, status: ContainerStatus): Promise<Container> {
    try {
      const response = await fetch(`${API_BASE_URL}/containers/${containerId}/status?status=${status}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al cambiar estado' }));
        throw new Error(errorData.message || 'Error al cambiar estado');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(translateError(error, 'Error al cambiar estado'));
    }
  }

  static async removePreorderFromContainer(containerId: string, preorderId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/containers/${containerId}/preorders/${preorderId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al quitar paquete del reparto' }));
        throw new Error(errorData.message || 'Error al quitar paquete del reparto');
      }
    } catch (error) {
      throw new Error(translateError(error, 'Error al quitar paquete del reparto'));
    }
  }

  // Transport methods
  static async getTransports(available?: boolean): Promise<Transport[]> {
    try {
      const params = new URLSearchParams();
      if (available !== undefined) params.append('available', available.toString());

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
}
