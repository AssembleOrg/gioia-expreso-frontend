import type {
  CreateDepositReceiptPayload,
  DepositReceiptFilters,
  PaginatedDepositReceiptResponse,
  DepositReceiptData,
} from '@/domain/deposit-receipt/types';
import { API_BASE_URL, API_ENDPOINTS } from '@/shared/constants/api';
import { translateError } from '@/shared/utils/error-translator';

export class DepositReceiptClient {
  private static getToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  private static getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getToken()}`,
    };
  }

  static async create(data: CreateDepositReceiptPayload): Promise<DepositReceiptData> {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.DEPOSIT_RECEIPTS}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Error al crear el recibo' }));
        throw new Error(errorData.message || 'Error al crear el recibo');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(translateError(error, 'Error al crear el recibo de depósito'));
    }
  }

  static async getPaginated(
    filters: DepositReceiptFilters = {},
  ): Promise<PaginatedDepositReceiptResponse> {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.dni) params.append('dni', filters.dni);
      if (filters.cuit) params.append('cuit', filters.cuit);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const url = `${API_BASE_URL}${API_ENDPOINTS.DEPOSIT_RECEIPTS}/paginated?${params.toString()}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Error al obtener recibos' }));
        throw new Error(errorData.message || 'Error al obtener recibos');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(translateError(error, 'Error al obtener recibos de depósito'));
    }
  }
}
