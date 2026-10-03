'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Stack,
  Text,
  Group,
  Badge,
  Divider,
  Loader,
  Alert,
  Box,
  Center,
  Select,
  Button,
  Grid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconPackage,
  IconMapPin,
  IconAlertCircle,
  IconEdit,
} from '@tabler/icons-react';
import Image from 'next/image';
import { Breadcrumb } from '@/presentation/components/Breadcrumb';
import { useAuthStore } from '@/application/stores/auth-store';

interface TrackingPageProps {
  preorderId: string;
}

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
  client?: {
    fullname: string;
  };
  packages?: Array<{
    quantity: number;
    weight: number;
  }>;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'yellow' },
  CONFIRMED: { label: 'Confirmado', color: 'blue' },
  IN_TRANSIT: { label: 'En Tránsito', color: 'cyan' },
  COMPLETED: { label: 'Completado', color: 'green' },
  DELIVERED: { label: 'Entregado', color: 'green' },
  CANCELLED: { label: 'Cancelado', color: 'red' },
};

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export function TrackingPage({ preorderId }: TrackingPageProps) {
  const [data, setData] = useState<PreorderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const { isAuthenticated, accessToken, user } = useAuthStore();

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/voucher/preorders/${preorderId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Envío no encontrado');
          }
          throw new Error('Error al consultar el envío');
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (preorderId) {
      fetchTracking();
    }
  }, [preorderId]);

  const handleUpdateStatus = async () => {
    if (!newStatus || !accessToken || !data) return;

    try {
      setUpdating(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/voucher/preorders/${preorderId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }

      const result = await response.json();
      setData(result.data);
      setIsEditing(false);
      setNewStatus(null);
      notifications.show({
        color: 'green',
        title: 'Estado actualizado',
        message: `El envío ahora está ${
          STATUS_MAP[newStatus]?.label || newStatus
        }`,
      });
    } catch (err) {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: err instanceof Error ? err.message : 'Error al actualizar',
      });
    } finally {
      setUpdating(false);
    }
  };

  const statusInfo = data?.status
    ? STATUS_MAP[data.status] || { label: data.status, color: 'gray' }
    : null;
  const totalPackages =
    data?.packages?.reduce((sum, p) => sum + p.quantity, 0) || 0;
  const totalWeight =
    data?.packages?.reduce((sum, p) => sum + p.weight, 0) || 0;

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--mantine-color-gray-0)',
      }}
    >
      <Container
        size='lg'
        py='xl'
      >
        {/* Breadcrumb for authenticated users */}
        {isAuthenticated && data && (
          <Breadcrumb
            items={[
              { label: 'Repartos', path: '/repartos' },
              { label: data.voucherNumber },
            ]}
          />
        )}

        <Grid
          gutter='xl'
          align='center'
        >
          {/* Logo Column - Left on desktop, top on mobile */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Center>
              <Stack
                align='center'
                gap='md'
              >
                <Image
                  src='/gioia.webp'
                  alt='Gioia Transporte'
                  width={300}
                  height={300}
                  style={{ objectFit: 'contain' }}
                />
              </Stack>
            </Center>
          </Grid.Col>

          {/* Content Column - Right on desktop, bottom on mobile */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper
              shadow='sm'
              p='lg'
              radius='md'
              withBorder
            >
              {loading ? (
                <Center py='xl'>
                  <Stack
                    align='center'
                    gap='sm'
                  >
                    <Loader color='magenta' />
                    <Text
                      size='sm'
                      c='dark.7'
                    >
                      Consultando envío...
                    </Text>
                  </Stack>
                </Center>
              ) : error ? (
                <Alert
                  icon={<IconAlertCircle size={18} />}
                  color='red'
                  title='Error'
                >
                  {error}
                </Alert>
              ) : data ? (
                <Stack gap='md'>
                  {/* Status Badge */}
                  <Group
                    justify='space-between'
                    align='center'
                  >
                    <Text
                      size='xs'
                      c='dark.7'
                    >
                      Estado del Envío
                    </Text>
                    {isAuthenticated && isEditing ? (
                      <Group gap='xs'>
                        <Select
                          size='xs'
                          placeholder='Seleccionar estado'
                          data={STATUS_OPTIONS}
                          value={newStatus}
                          onChange={setNewStatus}
                          style={{ width: 150 }}
                          styles={{
                            input: { color: 'var(--mantine-color-dark-7)' },
                            option: { color: 'var(--mantine-color-dark-7)' },
                          }}
                        />
                        <Button
                          size='xs'
                          color='magenta'
                          onClick={handleUpdateStatus}
                          loading={updating}
                          disabled={!newStatus}
                        >
                          Guardar
                        </Button>
                        <Button
                          size='xs'
                          variant='subtle'
                          color='gray'
                          onClick={() => {
                            setIsEditing(false);
                            setNewStatus(null);
                          }}
                        >
                          Cancelar
                        </Button>
                      </Group>
                    ) : (
                      <Group gap='xs'>
                        {statusInfo && (
                          <Badge
                            color={statusInfo.color}
                            size='lg'
                          >
                            {statusInfo.label}
                          </Badge>
                        )}
                        {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUBADMIN') && (
                          <Button
                            size='xs'
                            variant='subtle'
                            color='gray'
                            leftSection={<IconEdit size={14} />}
                            onClick={() => {
                              setIsEditing(true);
                              setNewStatus(data?.status || null);
                            }}
                          >
                            Editar
                          </Button>
                        )}
                      </Group>
                    )}
                  </Group>

                  <Divider />

                  {/* Voucher Number */}
                  <Box
                    ta='center'
                    py='xs'
                  >
                    <Text
                      size='xs'
                      c='dark.7'
                    >
                      Número de Comprobante
                    </Text>
                    <Text
                      size='xl'
                      fw={700}
                      c='magenta'
                    >
                      {data.voucherNumber}
                    </Text>
                  </Box>

                  <Divider />

                  {/* Route */}
                  <Stack gap='sm'>
                    <Group gap='xs'>
                      <IconMapPin
                        size={16}
                        color='var(--mantine-color-magenta-8)'
                      />
                      <Text
                        size='sm'
                        fw={600}
                        c='dark.9'
                      >
                        Ruta
                      </Text>
                    </Group>

                    <Group justify='space-between'>
                      <div>
                        <Text
                          size='xs'
                          fw={600}
                          c='dark.7'
                        >
                          Origen
                        </Text>
                        <Text
                          size='sm'
                          fw={500}
                          c='dark.9'
                        >
                          {data.origin}
                        </Text>
                        <Text
                          size='xs'
                          c='dark.7'
                        >
                          CP: {data.originPostal}
                        </Text>
                      </div>
                      <Text
                        size='lg'
                        fw={700}
                        c='magenta'
                      >
                        →
                      </Text>
                      <div style={{ textAlign: 'right' }}>
                        <Text
                          size='xs'
                          fw={600}
                          c='dark.7'
                        >
                          Destino
                        </Text>
                        <Text
                          size='sm'
                          fw={500}
                          c='dark.9'
                        >
                          {data.destination}
                        </Text>
                        <Text
                          size='xs'
                          c='dark.7'
                        >
                          CP: {data.destinationPostal}
                        </Text>
                      </div>
                    </Group>
                  </Stack>

                  <Divider />

                  {/* Package Info */}
                  <Stack gap='sm'>
                    <Group gap='xs'>
                      <IconPackage
                        size={16}
                        color='var(--mantine-color-magenta-8)'
                      />
                      <Text
                        size='sm'
                        fw={600}
                        c='dark.9'
                      >
                        Detalle
                      </Text>
                    </Group>

                    <Group justify='space-around'>
                      <Box ta='center'>
                        <Text
                          size='lg'
                          fw={700}
                          c='dark.9'
                        >
                          {totalPackages}
                        </Text>
                        <Text
                          size='xs'
                          c='dark.7'
                        >
                          Bultos
                        </Text>
                      </Box>
                      <Box ta='center'>
                        <Text
                          size='lg'
                          fw={700}
                          c='dark.9'
                        >
                          {totalWeight.toFixed(1)}
                        </Text>
                        <Text
                          size='xs'
                          c='dark.7'
                        >
                          kg
                        </Text>
                      </Box>
                    </Group>
                  </Stack>

                  {/* Footer */}
                  <Divider />
                  <Text
                    size='xs'
                    c='dark.7'
                    ta='center'
                  >
                    Creado:{' '}
                    {new Date(data.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </Stack>
              ) : null}
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}
