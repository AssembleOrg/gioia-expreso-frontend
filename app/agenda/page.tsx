import { Metadata } from 'next';
import { Agenda } from '@/presentation/pages/Agenda/Agenda';
import { ProtectedRoute } from '@/presentation/components/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Agenda - Gioia Transporte',
  description: 'Clientes y destinatarios guardados',
};

export default function AgendaPage() {
  return (
    <ProtectedRoute>
      <Agenda />
    </ProtectedRoute>
  );
}
