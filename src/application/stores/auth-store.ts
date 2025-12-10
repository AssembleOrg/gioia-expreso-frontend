// Authentication state management with Zustand

import { create } from 'zustand';
import { AuthClient } from '@/infrastructure/api/auth-client';
import type { User, LoginCredentials } from '@/domain/auth/types';

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login action
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthClient.login(credentials);
      const { accessToken, user } = response.data;

      // Save to localStorage
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Error al iniciar sesión',
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  // Logout action
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // Check auth on app load (hydrate from localStorage)
  checkAuth: () => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        });
      } catch {
        // Invalid data in localStorage, clear it
        get().logout();
      }
    }
  },

  // Clear error message
  clearError: () => set({ error: null }),
}));
