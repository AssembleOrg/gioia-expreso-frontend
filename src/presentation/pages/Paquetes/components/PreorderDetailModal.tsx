'use client';

import {
  Modal,
  Stack,
  Card,
  Text,
  Group,
  Button,
  Badge,
  Divider,
  ThemeIcon,
  Grid,
  Table,
} from '@mantine/core';
import {
  IconPackage,
  IconUser,
  IconMapPin,
  IconFileText,
  IconDownload,
  IconEdit,
  IconCalendar,
  IconCurrencyDollar,
} from '@tabler/icons-react';
import type { Preorder, PreorderStatus } from '@/domain/dispatch/types';

interface PreorderDetailModalProps {
  opened: boolean;
  onClose: () => void;
  preorder: Preorder | null;
  onDownloadPdf: () => void;
  onEdit: () => void;
  isDownloading?: boolean;
}

const STATUS_MAP: Record<PreorderStatus, { label: string; color: string }> = {
  CREATED: { label: 'Creado', color: 'cyan' },
  PENDING: { label: 'Pendiente', color: 'yellow' },
  CONFIRMED: { label: 'Confirmado', color: 'blue' },
  COMPLETED: { label: 'Completado', color: 'green' },
  CANCELLED: { label: 'Cancelado', color: 'red' },
};

export function PreorderDetailModal({
  opened,
  onClose,
  preorder,
  onDownloadPdf,
  onEdit,
  isDownloading = false,
}: PreorderDetailModalProps) {
  if (!preorder) return null;

  const statusInfo = STATUS_MAP[preorder.status];
  const totalPackages = preorder.packages.reduce((sum, pkg) => sum + pkg.quantity, 0);
  const totalWeight = preorder.packages.reduce((sum, pkg) => sum + pkg.weight * pkg.quantity, 0);
  const totalValue = preorder.packages.reduce(
    (sum, pkg) => sum + (pkg.declaredValue || 0) * pkg.quantity,
    0
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon size={32} radius="xl" color="magenta" variant="light">
            <IconPackage size={20} />
          </ThemeIcon>
          <div>
            <Text size="lg" fw={700} c="dark.9">
              {preorder.voucherNumber}
            </Text>
            <Badge color={statusInfo.color} size="sm" variant="light">
              {statusInfo.label}
            </Badge>
          </div>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* Fecha y Precio */}
        <Group justify="space-between">
          <Group gap="xs">
            <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
            <Text size="sm" c="dimmed">
              {new Date(preorder.createdAt).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </Group>
          <Group gap="xs">
            <IconCurrencyDollar size={16} color="var(--mantine-color-green-6)" />
            <Text size="lg" fw={700} c="green.7">
              ${preorder.price.toLocaleString('es-AR')}
            </Text>
          </Group>
        </Group>

        <Divider />

        {/* Cliente */}
        <Card withBorder p="sm" bg="gray.0">
          <Group gap="xs" mb="xs">
            <IconUser size={16} color="var(--mantine-color-magenta-6)" />
            <Text size="sm" fw={600} c="dark.7">
              Cliente
            </Text>
          </Group>
          <Grid>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">Nombre</Text>
              <Text size="sm" fw={500}>{preorder.client.fullname}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">Email</Text>
              <Text size="sm">{preorder.client.email}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">Teléfono</Text>
              <Text size="sm">{preorder.client.phone}</Text>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Origen y Destino */}
        <Card withBorder p="sm" bg="gray.0">
          <Group gap="xs" mb="xs">
            <IconMapPin size={16} color="var(--mantine-color-magenta-6)" />
            <Text size="sm" fw={600} c="dark.7">
              Ruta
            </Text>
          </Group>
          <Grid>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">Origen</Text>
              <Text size="sm" fw={500}>{preorder.origin}</Text>
              <Text size="xs" c="dimmed">CP: {preorder.originPostal}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">Destino</Text>
              <Text size="sm" fw={500}>{preorder.destination}</Text>
              <Text size="xs" c="dimmed">CP: {preorder.destinationPostal}</Text>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Paquetes */}
        <Card withBorder p="sm" bg="gray.0">
          <Group gap="xs" mb="xs" justify="space-between">
            <Group gap="xs">
              <IconPackage size={16} color="var(--mantine-color-magenta-6)" />
              <Text size="sm" fw={600} c="dark.7">
                Paquetes
              </Text>
            </Group>
            <Group gap="xs">
              <Badge size="sm" color="gray">{totalPackages} bulto{totalPackages !== 1 ? 's' : ''}</Badge>
              <Badge size="sm" color="gray">{totalWeight.toFixed(1)} kg</Badge>
              <Badge size="sm" color="green">${totalValue.toLocaleString('es-AR')}</Badge>
            </Group>
          </Group>
          <Table verticalSpacing={4} fz="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tipo</Table.Th>
                <Table.Th>Cant.</Table.Th>
                <Table.Th>Peso</Table.Th>
                <Table.Th>Dimensiones</Table.Th>
                <Table.Th>Valor</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {preorder.packages.map((pkg) => (
                <Table.Tr key={pkg.id}>
                  <Table.Td>{pkg.packageType?.name || 'Bulto'}</Table.Td>
                  <Table.Td>{pkg.quantity}</Table.Td>
                  <Table.Td>{pkg.weight} kg</Table.Td>
                  <Table.Td>
                    {pkg.height && pkg.width && pkg.depth
                      ? `${pkg.height}x${pkg.width}x${pkg.depth} cm`
                      : '-'}
                  </Table.Td>
                  <Table.Td>${(pkg.declaredValue || 0).toLocaleString('es-AR')}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>

        {/* Notas */}
        {preorder.notes && (
          <Card withBorder p="sm" bg="gray.0">
            <Group gap="xs" mb="xs">
              <IconFileText size={16} color="var(--mantine-color-magenta-6)" />
              <Text size="sm" fw={600} c="dark.7">
                Notas
              </Text>
            </Group>
            <Text size="sm" c="dark.6" style={{ whiteSpace: 'pre-wrap' }}>
              {preorder.notes}
            </Text>
          </Card>
        )}

        <Divider />

        {/* Actions */}
        <Group justify="space-between">
          <Button variant="subtle" color="gray" onClick={onClose}>
            Cerrar
          </Button>
          <Group gap="sm">
            <Button
              variant="light"
              color="magenta"
              leftSection={<IconDownload size={16} />}
              onClick={onDownloadPdf}
              loading={isDownloading}
            >
              Descargar PDF
            </Button>
            <Button
              color="magenta"
              leftSection={<IconEdit size={16} />}
              onClick={onEdit}
            >
              Editar
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
