import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Gioia Transporte',
  description: 'Panel de control del sistema de gestión de envíos',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No incluimos Header ni Footer aquí, el Dashboard tiene su propio header
  return <>{children}</>;
}
