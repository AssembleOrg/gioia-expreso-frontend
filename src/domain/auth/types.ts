// Authentication domain types

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'SUBADMIN' | 'USER';
  fullname?: string;
}

export interface AuthResponse {
  data: {
    accessToken: string;
    user: User;
  };
  success: boolean;
  message: string;
  timestamp: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  success: boolean;
  message: string;
  timestamp: string;
  path?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullname: string;
  address?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    message: string;
  };
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    message: string;
  };
}
