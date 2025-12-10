import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceso Empleados - Gioia Transporte',
  description: 'Iniciar sesión en el sistema de gestión de envíos',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page sin Header/Footer, diseño standalone
  return <>{children}</>;
}
