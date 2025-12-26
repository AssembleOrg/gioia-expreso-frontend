import { Metadata } from 'next';
import { Register } from '@/presentation/pages/Register';

export const metadata: Metadata = {
  title: 'Crear Cuenta - Gioia Transporte',
  description: 'Registrate en el sistema de gestión de envíos',
};

export default function RegisterPage() {
  return <Register />;
}
