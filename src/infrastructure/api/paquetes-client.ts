import type {
  PreorderListResponse,
  Preorder,
  PreorderStatus,
} from '@/domain/dispatch/types';
import { API_BASE_URL } from '@/shared/constants/api';

export interface PreorderFilters {
  page?: number;
  limit?: number;
  status?: PreorderStatus;
}

export class PaquetesClient {
  private static getToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  private static getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getToken()}`,
    };
  }

  static async getPreorders(filters: PreorderFilters = {}): Promise<PreorderListResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);

    const url = `${API_BASE_URL}/voucher/preorders?${params.toString()}`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al obtener preordenes' }));
      throw new Error(errorData.message || 'Error al obtener preordenes');
    }

    return response.json();
  }

  static async getPreorderById(id: string): Promise<Preorder> {
    const response = await fetch(`${API_BASE_URL}/voucher/preorders/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Preorden no encontrada' }));
      throw new Error(errorData.message || 'Preorden no encontrada');
    }

    const result = await response.json();
    return result.data;
  }

  static async getPreorderByVoucher(voucherNumber: string): Promise<Preorder> {
    const response = await fetch(`${API_BASE_URL}/voucher/preorders/voucher/${voucherNumber}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Preorden no encontrada' }));
      throw new Error(errorData.message || 'Preorden no encontrada');
    }

    const result = await response.json();
    return result.data;
  }

  static async downloadPdf(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/voucher/preorders/${id}/pdf`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al descargar PDF' }));
      throw new Error(errorData.message || 'Error al descargar PDF');
    }

    return response.blob();
  }

  static async updatePreorder(
    id: string,
    data: { status?: PreorderStatus; notes?: string }
  ): Promise<Preorder> {
    const response = await fetch(`${API_BASE_URL}/voucher/preorders/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al actualizar preorden' }));
      throw new Error(errorData.message || 'Error al actualizar preorden');
    }

    const result = await response.json();
    return result.data;
  }

  static async deletePreorder(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/voucher/preorders/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al eliminar preorden' }));
      throw new Error(errorData.message || 'Error al eliminar preorden');
    }
  }
}
