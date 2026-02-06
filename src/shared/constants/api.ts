// API constants

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_EMAIL: '/auth/verify-email',
  CHANGE_PASSWORD: '/auth/change-password',

  // Calculator
  LOCALIDADES: '/calculator/localidades',
  COTIZAR: '/calculator/cotizar',
  FILIAL_PUBLIC: '/calculator/public/filiales',
} as const;

