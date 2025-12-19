'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Grid,
  Button,
  Text,
  Alert,
  Divider,
  Group,
} from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { CotizacionCard } from '@/presentation/components/CotizacionCard';
import type { CotizacionItem } from '@/domain/calculator/types';
import { useBranchStore } from '@/application/stores/branch-store';
import { useCalculatorStore } from '@/application/stores/calculator-store';

interface CotizacionesModalProps {
  opened: boolean;
  onClose: () => void;
  cotizaciones: CotizacionItem[];
  onSelect: (cotizacion: CotizacionItem) => void;
  isEmbedded: boolean;
}

export function CotizacionesModal({
  opened,
  onClose,
  cotizaciones,
  onSelect,
  isEmbedded,
}: CotizacionesModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { selectedBranch } = useBranchStore();
  const { destinoLocalidad } = useCalculatorStore();

  // Reset selection when modal opens with new cotizaciones
  useEffect(() => {
    if (opened) {
      setSelectedId(null);
    }
  }, [opened, cotizaciones]);

  // Determine if a quote option is valid based on the current context
  const isOptionValid = (cotizacion: CotizacionItem) => {
    // If we are at a branch (Origin is Branch)
    if (selectedBranch) {
      // 1. We cannot do "Retiro en Domicilio" because we are at the branch
      // The description usually contains "Retiro en Domicilio" or "Entrega en Domicilio"
      // or "Sucursal origen" / "Sucursal destino"
      // Let's assume the description text is the key.
      
      const desc = cotizacion.descripcion.toLowerCase();
      
      // If the quote implies picking up at home, it's invalid for a branch origin
      if (desc.includes('retiro en domicilio')) {
        return false;
      }

      // 2. Check Destination Context
      // If destination is a Branch (we know this if we selected the "Quick Action" or manual branch address)
      // But `destinoLocalidad` is just a location. 
      // However, the USER INTENT is key.
      
      // If the quote is "Sucursal a Sucursal" (Branch to Branch)
      if (desc.includes('sucursal a sucursal')) {
        // This is valid ONLY if the user intends to send to a branch.
        // If they selected a random address in "Santo Tome", this option might not make sense 
        // unless they want the recipient to pick it up at the nearest branch.
        return true; 
      }

      // If the quote is "Sucursal a Domicilio" (Branch to Door)
      if (desc.includes('sucursal a domicilio') || desc.includes('entrega en domicilio')) {
        return true;
      }
      
      // If it's "Domicilio a ..." it's invalid because we are at a branch
      if (desc.startsWith('domicilio')) {
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    const selected = cotizaciones.find((c) => c.id.toString() === selectedId);
    if (selected) {
      onSelect(selected);
    }
  };

  const handleClose = () => {
    setSelectedId(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Cotizaciones Disponibles"
      size="xl"
      closeOnClickOutside={false}
      centered
      styles={{
        content: {
          backgroundColor: 'white',
        },
        title: {
          fontSize: '1.75rem',
          fontWeight: 900,
          color: 'var(--mantine-color-dark-9)',
        },
        body: {
          color: 'var(--mantine-color-dark-7)',
          fontSize: '1rem',
        },
      }}
    >
      <Stack gap="xl">
        <Alert color="red.9" variant="light" radius="md" p="md">
          <Stack gap="md">
            <Text size="md" c="dark.7" style={{ lineHeight: 1.6 }}>
              Los valores de cotización son únicamente informativos, no incluyen
              impuestos y están sujetos a variaciones según cargo por manejo,
              peso y/o medida reales registradas en el momento de la venta. El
              valor del envío puede variar en el momento de la entrega en el
              punto de venta.
            </Text>
            <Text size="md" fw={600} c="dark.9">
              Los campos con * son obligatorios. El límite de peso de la
              cotización es de 100 KG por caja o paquete.
            </Text>
          </Stack>
        </Alert>

        <Divider />

        <Grid>
          {cotizaciones.map((cotizacion) => {
            const isValid = isOptionValid(cotizacion);
            return (
              <Grid.Col key={cotizacion.id} span={{ base: 12, sm: 6 }}>
                <div style={{ 
                  opacity: isValid ? 1 : 0.5, 
                  pointerEvents: isValid ? 'auto' : 'none',
                  filter: isValid ? 'none' : 'grayscale(100%)'
                }}>
                  <CotizacionCard
                    cotizacion={cotizacion}
                    isSelected={selectedId === cotizacion.id.toString()}
                    onClick={() => isValid && setSelectedId(cotizacion.id.toString())}
                  />
                </div>
              </Grid.Col>
            );
          })}
        </Grid>

        {isEmbedded ? (
          <>
            <Divider />
            <Group justify="flex-end" w="100%">
              <Button
                color="magenta"
                onClick={handleNext}
                rightSection={<IconArrowRight size={16} />}
                disabled={!selectedId}
              >
                Siguiente
              </Button>
            </Group>
          </>
        ) : (
          <>
            <Divider />
            <Group justify="center" w="100%">
              <Button variant="light" onClick={handleClose}>
                Cerrar
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
