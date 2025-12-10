// Authentication API client

import { API_BASE_URL } from '@/shared/constants/api';
import type { LoginCredentials, AuthResponse } from '@/domain/auth/types';

export class AuthClient {
  /**
   * Login user with email and password
   * @param credentials - User credentials (email, password)
   * @returns Promise with auth response containing token and user data
   * @throws Error if login fails
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }

    return data;
  }

  /**
   * Verify JWT token validity
   * @param token - JWT token to verify
   * @returns Promise with user data if token is valid
   * @throws Error if token is invalid
   */
  static async verifyToken(token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Token inválido');
    }

    return response.json();
  }
}
