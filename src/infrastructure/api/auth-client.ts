// Authentication API client

import { API_BASE_URL } from '@/shared/constants/api';
import { translateError } from '@/shared/utils/error-translator';
import type {
  LoginCredentials,
  AuthResponse,
  RegisterCredentials,
  RegisterResponse,
  VerifyEmailResponse,
} from '@/domain/auth/types';

export class AuthClient {
  /**
   * Login user with email and password
   * @param credentials - User credentials (email, password)
   * @returns Promise with auth response containing token and user data
   * @throws Error if login fails
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
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
    } catch (error) {
      throw new Error(translateError(error, 'Error al iniciar sesión'));
    }
  }

  /**
   * Verify JWT token validity
   * @param token - JWT token to verify
   * @returns Promise with user data if token is valid
   * @throws Error if token is invalid
   */
  static async verifyToken(token: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token inválido');
      }

      return response.json();
    } catch (error) {
      throw new Error(translateError(error, 'Token inválido'));
    }
  }

  /**
   * Register new user
   * @param credentials - User registration data (email, password, fullname, address?, dni?, cuit?)
   * @returns Promise with registration response
   * @throws Error if registration fails
   */
  static async register(
    credentials: RegisterCredentials
  ): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrarse');
      }

      return data;
    } catch (error) {
      throw new Error(translateError(error, 'Error al registrarse'));
    }
  }

  /**
   * Verify email with token
   * @param token - Verification token from email
   * @returns Promise with verification response
   * @throws Error if verification fails
   */
  static async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/verify-email?token=${token}`,
        {
          method: 'GET',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar email');
      }

      return data;
    } catch (error) {
      throw new Error(translateError(error, 'Error al verificar email'));
    }
  }

  /**
   * Resend verification email
   * @param email - User email to resend verification to
   * @returns Promise with resend response
   * @throws Error if resend fails
   */
  static async resendVerification(
    email: string
  ): Promise<VerifyEmailResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al reenviar verificación');
      }

      return data;
    } catch (error) {
      throw new Error(translateError(error, 'Error al reenviar verificación'));
    }
  }
}
