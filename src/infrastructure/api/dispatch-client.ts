import type { CreatePreorderDTO, PreorderResponse } from '@/domain/dispatch/types';
import { API_BASE_URL } from '@/shared/constants/api';

export class DispatchClient {
  static async createPreorder(data: CreatePreorderDTO, token: string): Promise<PreorderResponse> {
    console.log('=== DISPATCH CLIENT REQUEST ===');
    console.log('URL:', `${API_BASE_URL}/voucher/preorders`);
    console.log('Method: POST');
    console.log('Headers:', { Authorization: 'Bearer [TOKEN]', 'Content-Type': 'application/json' });
    console.log('Request Body:', JSON.stringify(data, null, 2));

    const response = await fetch(`${API_BASE_URL}/voucher/preorders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    console.log('=== DISPATCH CLIENT RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('Backend Error Response:', errorData);
      } catch (e) {
        const text = await response.text();
        console.error('Backend Error (not JSON):', text);
        errorData = { message: `Error ${response.status}: ${response.statusText}` };
      }
      
      // Enhanced error message extraction
      let errorMessage = 'Error al crear la preorden';
      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.join(', ');
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      
      console.error('Final Error Message:', errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Success Response:', result);
    return result.data;
  }
}
