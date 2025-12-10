import type { CreatePreorderDTO, PreorderResponse } from '@/domain/dispatch/types';
import { API_BASE_URL } from '@/shared/constants/api';

export class DispatchClient {
  static async createPreorder(data: CreatePreorderDTO, token: string): Promise<PreorderResponse> {
    const response = await fetch(`${API_BASE_URL}/voucher/preorders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al crear la preorden' }));
      throw new Error(errorData.message || 'Error al crear la preorden');
    }

    const result = await response.json();
    return result.data;
  }
}
