import { Metadata } from 'next';
import { Login } from '@/presentation/pages/Login';

export const metadata: Metadata = {
  title: 'Acceso Empleados - Gioia Transporte',
  description: 'Iniciar sesión en el sistema de gestión de envíos',
};

export default function LoginPage() {
  return <Login />;
}
