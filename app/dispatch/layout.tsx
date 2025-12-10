import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nuevo Envío - Gioia Transporte',
  description: 'Crear nuevo despacho de envío',
};

export default function DispatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sin Header/Footer público, como dashboard
  return <>{children}</>;
}
