// API constants

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  LOCALIDADES: '/calculator/localidades',
  COTIZAR: '/calculator/cotizar',
} as const;

