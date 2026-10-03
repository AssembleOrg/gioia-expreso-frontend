import { Metadata } from 'next';
import { Seguimientos } from '@/presentation/pages/Seguimientos/Seguimientos';
import { ProtectedRoute } from '@/presentation/components/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Seguimiento - Gioia Transporte',
  description: 'Seguimiento de envíos para los compradores',
};

export default function SeguimientosPage() {
  return (
    <ProtectedRoute>
      <Seguimientos />
    </ProtectedRoute>
  );
}
