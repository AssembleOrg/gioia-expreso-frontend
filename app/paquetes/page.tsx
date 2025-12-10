import { Metadata } from 'next';
import { Paquetes } from '@/presentation/pages/Paquetes';
import { ProtectedRoute } from '@/presentation/components/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Paquetes - Gioia Transporte',
  description: 'Lista de paquetes y envíos pendientes',
};

export default function PaquetesPage() {
  return (
    <ProtectedRoute>
      <Paquetes />
    </ProtectedRoute>
  );
}
