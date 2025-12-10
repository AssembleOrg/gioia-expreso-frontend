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

  // Reset selection when modal opens with new cotizaciones
  useEffect(() => {
    if (opened) {
      setSelectedId(null);
    }
  }, [opened, cotizaciones]);

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
        <Alert color="blue" variant="light" radius="md" p="md">
          <Stack gap="md">
            <Text size="md" c="dark.7" style={{ lineHeight: 1.6 }}>
              Los valores de cotización son únicamente informativos, no incluyen
              impuestos y están sujetos a variaciones según cargo por manejo,
              peso y/o medida reales registradas en el momento de la venta. El
              valor del envío puede variar en el momento de la entrega en el
              punto de venta.
            </Text>
            <Text size="md" fw={900} c="dark.9">
              Los campos con * son obligatorios. El límite de peso de la
              cotización es de 100 KG por caja o paquete.
            </Text>
          </Stack>
        </Alert>

        <Divider />

        <Grid>
          {cotizaciones.map((cotizacion) => (
            <Grid.Col key={cotizacion.id} span={{ base: 12, sm: 6 }}>
              <CotizacionCard
                cotizacion={cotizacion}
                isSelected={selectedId === cotizacion.id.toString()}
                onClick={() => setSelectedId(cotizacion.id.toString())}
              />
            </Grid.Col>
          ))}
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
