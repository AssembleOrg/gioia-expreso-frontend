import { API_BASE_URL } from '@/shared/constants/api';
import { translateError } from '@/shared/utils/error-translator';
import type { Preorder, PreorderStatus, BulkUpdatePreorderDto } from '@/domain/voucher/types';

export class VoucherClient {
  private static getHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  static async getPreorders(params?: {
    page?: number;
    limit?: number;
    status?: PreorderStatus;
    search?: string;
  }): Promise<{ data: Preorder[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);

      const response = await fetch(`${API_BASE_URL}/voucher/preorders?${query.toString()}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener preordenes');
      }

      return response.json();
    } catch (error) {
      throw new Error(translateError(error, 'Error al obtener preordenes'));
    }
  }

  static async getPreorderById(id: string): Promise<Preorder> {
    try {
      const response = await fetch(`${API_BASE_URL}/voucher/preorders/${id}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Preorden no encontrada');
      }

      return response.json();
    } catch (error) {
      throw new Error(translateError(error, 'Preorden no encontrada'));
    }
  }

  static async approvePreorder(id: string): Promise<Preorder> {
    try {
      const response = await fetch(`${API_BASE_URL}/voucher/preorders/${id}/approve`, {
        method: 'PATCH',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al aprobar la preorden');
      }

      return response.json();
    } catch (error) {
      throw new Error(translateError(error, 'Error al aprobar la preorden'));
    }
  }

  static async rejectPreorder(id: string): Promise<Preorder> {
    try {
      const response = await fetch(`${API_BASE_URL}/voucher/preorders/${id}/reject`, {
        method: 'PATCH',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al rechazar la preorden');
      }

      return response.json();
    } catch (error) {
      throw new Error(translateError(error, 'Error al rechazar la preorden'));
    }
  }

  static async bulkUpdateStatus(dto: BulkUpdatePreorderDto): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/voucher/preorders/bulk-update-status`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        throw new Error('Error en actualización masiva');
      }

      return response.json();
    } catch (error) {
      throw new Error(translateError(error, 'Error en actualización masiva'));
    }
  }

  static async regeneratePdf(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/voucher/preorders/${id}/regenerate-pdf`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al regenerar PDF');
      }
    } catch (error) {
      throw new Error(translateError(error, 'Error al regenerar PDF'));
    }
  }
}
