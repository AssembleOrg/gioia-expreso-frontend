// Authentication API client

import { API_BASE_URL } from '@/shared/constants/api';
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

  /**
   * Register new user
   * @param credentials - User registration data (email, password, fullname, address?, dni?, cuit?)
   * @returns Promise with registration response
   * @throws Error if registration fails
   */
  static async register(
    credentials: RegisterCredentials
  ): Promise<RegisterResponse> {
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
  }

  /**
   * Verify email with token
   * @param token - Verification token from email
   * @returns Promise with verification response
   * @throws Error if verification fails
   */
  static async verifyEmail(token: string): Promise<VerifyEmailResponse> {
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
  }
}
