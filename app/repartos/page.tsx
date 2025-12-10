import { Metadata } from 'next';
import { Repartos } from '@/presentation/pages/Repartos/Repartos';
import { ProtectedRoute } from '@/presentation/components/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Repartos - Gioia Transporte',
  description: 'Gestión de repartos y despachos',
};

export default function RepartosPage() {
  return (
    <ProtectedRoute>
      <Repartos />
    </ProtectedRoute>
  );
}
