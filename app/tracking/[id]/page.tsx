import { TrackingPage } from '@/presentation/pages/Tracking/Tracking';

export const metadata = {
  title: 'Seguimiento de Envío - Gioia Transporte',
  description: 'Consulta el estado de tu envío',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TrackingPage preorderId={id} />;
}
