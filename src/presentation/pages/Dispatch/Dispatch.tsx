'use client';

import { useState } from 'react';
import { Container, Stack, Stepper, Text, Box, Card, Group, ActionIcon } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useDispatchStore } from '@/application/stores/dispatch-store';
import { AppHeader } from '@/presentation/components/AppHeader';
import { Breadcrumb } from '@/presentation/components/Breadcrumb';
import { CotizarStep } from './components/CotizarStep';
import { PaquetesForm } from './components/PaquetesForm';
import { DespachanteForm } from './components/DespachanteForm';
import { ConfirmacionScreen } from './components/ConfirmacionScreen';

const STEP_LABELS = [
  { label: 'Cotizar', description: 'Calcular precio del envío' },
  { label: 'Paquetes', description: 'Detalles del envío' },
  { label: 'Despachante', description: 'Datos de remitente y destinatario' },
  { label: 'Confirmación', description: 'Revisar y confirmar' },
];

export function Dispatch() {
  const { cotizacion } = useDispatchStore();
  const [active, setActive] = useState(0); // 0=Cotizar, 1=Paquetes, 2=Despachante, 3=Confirmación
  const isMobile = useMediaQuery('(max-width: 768px)');

  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  // Solo permitir navegación hacia atrás en el stepper
  const handleStepClick = (step: number) => {
    if (step < active) {
      setActive(step);
    }
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-gray-0)' }}>
      <AppHeader />
      <Container size="xl" px="md" py="lg">
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Nuevo Envio' },
          ]}
        />
        <Stack gap="xl">
          <div>
            <Text size="xl" fw={700} c="magenta">
              Nuevo Envio
            </Text>
            {cotizacion && (
              <Text size="sm" c="dark.7">
                {cotizacion.origen.nombre} → {cotizacion.destino.nombre}
              </Text>
            )}
          </div>

          {!isMobile ? (
            // DESKTOP: Full Stepper
            <Stepper active={active} onStepClick={handleStepClick} color="magenta" allowNextStepsSelect={false}>
              <Stepper.Step label="Cotizar" description="Calcular precio del envío">
                <CotizarStep onNext={nextStep} />
              </Stepper.Step>

              <Stepper.Step label="Paquetes" description="Detalles del envío">
                <PaquetesForm onNext={nextStep} />
              </Stepper.Step>

              <Stepper.Step label="Despachante" description="Datos de remitente y destinatario">
                <DespachanteForm onNext={nextStep} onBack={prevStep} />
              </Stepper.Step>

              <Stepper.Step label="Confirmación" description="Revisar y confirmar">
                <ConfirmacionScreen onBack={prevStep} />
              </Stepper.Step>
            </Stepper>
          ) : (
            // MOBILE: Breadcrumb + Manual Step Rendering
            <>
              {/* Mobile Breadcrumb */}
              <Card withBorder p="sm">
                <Group justify="space-between" align="center">
                  <ActionIcon
                    variant="subtle"
                    onClick={prevStep}
                    disabled={active === 0}
                    color="magenta"
                    size="lg"
                  >
                    <IconChevronLeft size={20} />
                  </ActionIcon>

                  <Box ta="center" style={{ flex: 1 }}>
                    <Text size="xs" c="dark.7">
                      Paso {active + 1} de 4
                    </Text>
                    <Text size="sm" fw={600} c="dark.9">
                      {STEP_LABELS[active].label}
                    </Text>
                  </Box>

                  <ActionIcon
                    variant="subtle"
                    onClick={nextStep}
                    disabled={active === 3}
                    color="magenta"
                    size="lg"
                  >
                    <IconChevronRight size={20} />
                  </ActionIcon>
                </Group>
              </Card>

              {/* Render Active Step Content */}
              {active === 0 && <CotizarStep onNext={nextStep} />}
              {active === 1 && <PaquetesForm onNext={nextStep} />}
              {active === 2 && <DespachanteForm onNext={nextStep} onBack={prevStep} />}
              {active === 3 && <ConfirmacionScreen onBack={prevStep} />}
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
