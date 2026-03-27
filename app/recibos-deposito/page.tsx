import { Metadata } from 'next';
import { DepositReceipts } from '@/presentation/pages/DepositReceipts';
import { ProtectedRoute } from '@/presentation/components/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Recibos de Depósito - Gioia Transporte',
  description: 'Generar y consultar recibos de depósito',
};

export default function RecibosDepositoPage() {
  return (
    <ProtectedRoute>
      <DepositReceipts />
    </ProtectedRoute>
  );
}
