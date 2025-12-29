import type { Metadata } from 'next';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { theme } from '@/presentation/theme/theme';
import { ConditionalLayout } from '@/presentation/components/ConditionalLayout';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Transporte Gioia e Hijos SRL - Envíos',
  description: 'Sistema de gestión de envíos y logística',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/genfavicon-180.png', sizes: '180x180', type: 'image/png' },
      { url: '/genfavicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gioia Expreso',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <Notifications />
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
