'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Stack,
  Title,
  Text,
  Group,
  Badge,
  Loader,
  Alert,
  Button,
  Card,
  Center,
  Box,
  TextInput,
  ActionIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconPackage,
  IconMapPin,
  IconAlertCircle,
  IconEye,
  IconSearch,
} from '@tabler/icons-react';
import { useAuthStore } from '@/application/stores/auth-store';
import { AppHeader } from '@/presentation/components/AppHeader';
import { Breadcrumb } from '@/presentation/components/Breadcrumb';
import Link from 'next/link';

interface PreorderData {
  id: string;
  voucherNumber: string;
  status: string;
  origin: string;
  originPostal: string;
  destination: string;
  destinationPostal: string;
  price: number;
  createdAt: string;
  client: {
    fullname: string;
    email: string;
  };
  packages?: Array<{
    quantity: number;
    weight: number;
  }>;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  CREATED: { label: 'En Revisión', color: 'orange' },
  PENDING: { label: 'Aprobado', color: 'yellow' },
  CONFIRMED: { label: 'En Camino', color: 'blue' },
  COMPLETED: { label: 'Entregado', color: 'green' },
  CANCELLED: { label: 'Cancelado', color: 'red' },
};

export function MisPedidos() {
  const [voucherNumber, setVoucherNumber] = useState('');
  const [preorder, setPreorder] = useState<PreorderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const handleSearch = async () => {
    if (!voucherNumber.trim()) {
      setError('Por favor ingresa un número de voucher');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('=== BUSCANDO VOUCHER ===');
      console.log('Voucher buscado:', voucherNumber);

      // Usar el endpoint público de tracking (no requiere auth)
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/voucher/preorders/voucher/${voucherNumber}`;
      console.log('URL completa:', apiUrl);

      const response = await fetch(apiUrl);
      
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Voucher no encontrado');
        }
        throw new Error('Error al buscar el voucher');
      }

      const result = await response.json();
      console.log('Voucher encontrado:', result.data);
      
      // No verificamos email - cualquier usuario puede ver cualquier voucher
      setPreorder(result.data);
    } catch (err) {
      console.error('Error buscando voucher:', err);
      setPreorder(null);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status: string) => {
    return STATUS_MAP[status] || { label: status, color: 'gray' };
  };

  const getTotalPackages = (packages?: Array<{ quantity: number; weight: number }>) => {
    return packages?.reduce((sum, pkg) => sum + pkg.quantity, 0) || 0;
  };

  const getTotalWeight = (packages?: Array<{ quantity: number; weight: number }>) => {
    return packages?.reduce((sum, pkg) => sum + pkg.weight, 0) || 0;
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-gray-0)' }}>
      <AppHeader />

      <Container size="xl" px="md" pb={100}>
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Mis Pedidos' },
          ]}
        />

        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <div>
              <Group gap="sm" align="center">
                <IconPackage size={28} color="var(--mantine-color-magenta-8)" />
                <Title order={2} c="dark.9">Mis Pedidos</Title>
              </Group>
              <Text size="sm" c="dark.7" mt="xs">
                Ingresá el número de voucher de tu pedido
              </Text>
            </div>
          </Group>

          {/* Buscador */}
          <Paper shadow="xs" p="lg" withBorder>
            <Stack gap="md">
              <TextInput
                label="Número de Voucher"
                placeholder="Ej: VCH-MJCWFFSP-IJD0"
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                leftSection={<IconSearch size={16} />}
                size="md"
              />
              <Button
                color="magenta"
                leftSection={<IconSearch size={16} />}
                onClick={handleSearch}
                loading={loading}
                fullWidth
              >
                Buscar Pedido
              </Button>
            </Stack>
          </Paper>

          {/* Error */}
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading && (
            <Paper shadow="xs" p="xl" withBorder>
              <Stack align="center" gap="md">
                <Loader color="magenta" />
                <Text size="sm" c="dark.7">
                  Buscando pedido...
                </Text>
              </Stack>
            </Paper>
          )}

          {/* Resultado */}
          {!loading && !error && preorder && (
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              component={Link}
              href={`/tracking/${preorder.id}`}
              style={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Text
                    size="lg"
                    fw={700}
                    c="magenta"
                  >
                    {preorder.voucherNumber}
                  </Text>
                  <Badge
                    color={getStatusInfo(preorder.status).color}
                    variant="light"
                    size="lg"
                  >
                    {getStatusInfo(preorder.status).label}
                  </Badge>
                </Group>
              </Card.Section>

              <Stack gap="sm" mt="md">
                <Group justify="space-between">
                  <Text size="xs" c="dark.7">Fecha:</Text>
                  <Text size="xs" fw={500}>{formatDate(preorder.createdAt)}</Text>
                </Group>

                <Group justify="space-between">
                  <Text size="xs" c="dark.7">Origen:</Text>
                  <Text size="xs" fw={500} style={{ maxWidth: 200 }} truncate>
                    {preorder.origin}
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Text size="xs" c="dark.7">Destino:</Text>
                  <Text size="xs" fw={500} style={{ maxWidth: 200 }} truncate>
                    {preorder.destination}
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Text size="xs" c="dark.7">Precio:</Text>
                  <Text size="xs" fw={700} c="dark.9">
                    {formatPrice(preorder.price)}
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Text size="xs" c="dark.7">Bultos:</Text>
                  <Text size="xs" fw={500}>{getTotalPackages(preorder.packages)}</Text>
                </Group>

                <Group justify="space-between">
                  <Text size="xs" c="dark.7">Peso:</Text>
                  <Text size="xs" fw={500}>{getTotalWeight(preorder.packages).toFixed(1)} kg</Text>
                </Group>

                <Button
                  variant="subtle"
                  color="magenta"
                  fullWidth
                  mt="md"
                  leftSection={<IconEye size={16} />}
                >
                  Ver Detalles
                </Button>
              </Stack>
            </Card>
          )}

          {/* No results */}
          {!loading && !error && !preorder && (
            <Paper shadow="xs" p="xl" withBorder>
              <Stack align="center" gap="md">
                <IconPackage size={48} color="var(--mantine-color-gray-5)" />
                <Text size="sm" c="dark.7" ta="center">
                  Ingresá un número de voucher para ver el estado de tu pedido.
                </Text>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Container>
    </Box>
  );
}