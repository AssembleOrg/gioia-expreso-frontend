import { Metadata } from 'next';
import { Transportes } from '@/presentation/pages/Transportes/Transportes';
import { ProtectedRoute } from '@/presentation/components/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Transportes - Gioia Transporte',
  description: 'Gestión de vehículos y transportes',
};

export default function TransportesPage() {
  return (
    <ProtectedRoute>
      <Transportes />
    </ProtectedRoute>
  );
}
