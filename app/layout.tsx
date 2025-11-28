import type { Metadata } from 'next';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { theme } from '@/presentation/theme/theme';
import { Header } from '@/presentation/components/Header';
import { Footer } from '@/presentation/components/Footer';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Transporte Gioia e Hijos SRL - Calculadora de Envíos',
  description: 'Calcula el costo de tus envíos de forma rápida y sencilla',
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
            <Header />
            {children}
            <Footer />
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
