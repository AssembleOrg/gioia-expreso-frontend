import type { Metadata } from 'next';
import { Button, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { RumboTrackingPage } from '@/presentation/pages/Tracking/RumboTracking';
import { seguimientoDePreorden } from '@/infrastructure/rumbo/tracking.server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Seguimiento de Envío - Gioia Transporte',
  description: 'Seguí tu envío en tiempo real',
  robots: { index: false },
};

/**
 * Seguimiento con Rumbo (feature aparte de /tracking, que queda como estaba).
 * Es el link que llevan el QR y el WhatsApp de la sección Seguimiento.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { tracking, preorden: p } = await seguimientoDePreorden(id);

  if (!tracking) {
    return (
      <Container size='sm' py={80}>
        <Paper shadow='sm' p='xl' radius='md' withBorder>
          <Stack gap='md' align='flex-start'>
            <Title order={1} size='h2' c='dark.9'>
              Todavía no hay seguimiento de este envío
            </Title>
            <Text c='dark.7'>
              {p
                ? 'El envío existe pero aún no se cargó en el seguimiento. Se actualiza en unos minutos.'
                : 'No encontramos un envío con ese código. Revisá el link o el QR.'}
            </Text>
            {p && (
              <Button component='a' href={`/tracking/${id}`} color='magenta' variant='light'>
                Ver el estado del envío
              </Button>
            )}
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <RumboTrackingPage
      tracking={tracking}
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
