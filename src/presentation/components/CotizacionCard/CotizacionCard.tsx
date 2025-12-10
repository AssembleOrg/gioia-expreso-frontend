'use client';

import { Card, Text, Stack, Group, Badge, Divider, Box, Paper } from '@mantine/core';
import type { CotizacionItem } from '@/domain/calculator/types';
import { TIPOS_SERVICIO } from '@/domain/calculator/types';
import { IconTruck, IconHome, IconBuilding } from '@tabler/icons-react';

interface CotizacionCardProps {
  cotizacion: CotizacionItem;
  isSelected?: boolean;
  onClick?: () => void;
}

const getServiceIcon = (id: number) => {
  switch (id) {
    case TIPOS_SERVICIO.DOMICILIO_A_DOMICILIO:
      return <IconHome size={24} />;
    case TIPOS_SERVICIO.SUCURSAL_A_SUCURSAL:
      return <IconBuilding size={24} />;
    case TIPOS_SERVICIO.DOMICILIO_A_SUCURSAL:
      return (
        <Group gap={4}>
          <IconHome size={20} />
          <IconTruck size={16} />
          <IconBuilding size={20} />
        </Group>
      );
    case TIPOS_SERVICIO.SUCURSAL_A_DOMICILIO:
      return (
        <Group gap={4}>
          <IconBuilding size={20} />
          <IconTruck size={16} />
          <IconHome size={20} />
        </Group>
      );
    default:
      return <IconTruck size={24} />;
  }
};

export function CotizacionCard({ cotizacion, isSelected = false, onClick }: CotizacionCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <Paper
      p="lg"
      radius="md"
      withBorder
      onClick={onClick}
      style={{
        borderColor: isSelected ? 'var(--mantine-color-magenta-6)' : 'var(--mantine-color-magenta-3)',
        borderWidth: isSelected ? 2 : 1,
        backgroundColor: isSelected ? 'var(--mantine-color-magenta-0)' : 'white',
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(139, 26, 61, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <Stack gap="md">
        {isSelected && (
          <Badge
            color="magenta"
            variant="filled"
            size="sm"
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
            }}
          >
            Seleccionada
          </Badge>
        )}
        <Group justify="space-between" align="flex-start">
          <Box>
            <Group gap="xs" mb={4}>
              {getServiceIcon(cotizacion.id)}
              <Text size="lg" fw={900} c="magenta" style={{ fontFamily: 'Poppins' }}>
                {cotizacion.descripcion}
              </Text>
            </Group>
          </Box>
          <Stack gap={2} align="flex-end">
            <Badge
              size="xl"
              color="magenta"
              variant="filled"
              radius="md"
              style={{ 
                fontSize: '1.25rem', 
                padding: '10px 18px',
                fontWeight: 900,
                fontFamily: 'Poppins',
              }}
            >
              {formatPrice(cotizacion.precio_final)}
            </Badge>
            <Text size="xs" c="dark.7" style={{ fontFamily: 'Poppins', fontWeight: 300 }}>
              (estimado)
            </Text>
          </Stack>
        </Group>

        <Divider color="magenta.2" />

        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="md" c="dark.6" style={{ fontFamily: 'Poppins', fontWeight: 300 }}>
              Flete:
            </Text>
            <Text size="md" fw={900} c="dark.9" style={{ fontFamily: 'Poppins' }}>
              {formatPrice(cotizacion.flete)}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="md" c="dark.6" style={{ fontFamily: 'Poppins', fontWeight: 300 }}>
              Seguro:
            </Text>
            <Text size="md" fw={900} c="dark.9" style={{ fontFamily: 'Poppins' }}>
              {formatPrice(cotizacion.seguro)}
            </Text>
          </Group>
          <Group justify="space-between" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
            <Text size="sm" c="dark.7" style={{ fontFamily: 'Poppins', fontWeight: 300 }}>
              Precio sin impuestos:
            </Text>
            <Text size="sm" fw={900} c="dark.6" style={{ fontFamily: 'Poppins' }}>
              {formatPrice(cotizacion.precio)}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Paper>
  );
}
