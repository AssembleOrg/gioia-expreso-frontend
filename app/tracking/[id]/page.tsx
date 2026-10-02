import type { Metadata } from 'next';
import { TrackingPage } from '@/presentation/pages/Tracking/Tracking';
import { RumboTrackingPage } from '@/presentation/pages/Tracking/RumboTracking';
import { seguimientoDePreorden } from '@/infrastructure/rumbo/tracking.server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Seguimiento de Envío - Gioia Transporte',
  description: 'Consultá el estado de tu envío',
  robots: { index: false },
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const datos = await seguimientoDePreorden(id);
  // Sin Rumbo (no configurado o caído) se muestra la vista anterior.
  if (!datos) return <TrackingPage preorderId={id} />;
  const p = datos.preorden;
  return (
    <RumboTrackingPage
      tracking={datos.tracking}
      preorden={
        p
          ? {
              id: p.id,
              voucherNumber: p.voucherNumber,
              origin: p.origin,
              originPostal: p.originPostal,
              destination: p.destination,
              destinationPostal: p.destinationPostal,
              status: p.status,
            }
          : null
      }
    />
  );
}
