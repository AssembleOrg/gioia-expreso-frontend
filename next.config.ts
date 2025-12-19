import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Note: Warning about multiple lockfiles is expected due to parent directory structure
  // This does not affect functionality

  // Optimización de imágenes
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
  },

  compress: true,

  // Configuración para desarrollo móvil
  // devIndicators: {
  //   buildActivity: true,
  //   buildActivityPosition: 'bottom-right',
  // },

  // Permitir acceso desde red local y optimización de paquetes
  experimental: {
    // Configuración para desarrollo en red local
    // Tree-shaking de Mantine UI (CRÍTICO para reducir bundle size)
    optimizePackageImports: ['@mantine/core', '@mantine/hooks', '@tabler/icons-react'],
  },

  // Configuración de headers para desarrollo
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Configuración de host para desarrollo móvil
};

export default nextConfig;
