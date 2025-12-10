import { Metadata } from 'next';
import { Dashboard } from '@/presentation/pages/Dashboard';
import { ProtectedRoute } from '@/presentation/components/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Dashboard - Gioia Transporte',
  description: 'Panel de control del sistema de gestión de envíos',
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
