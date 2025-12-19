'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  Paper,
  Box,
  Badge,
  Loader,
  Alert,
  SegmentedControl,
  ActionIcon,
  Card,
  Menu,
  Pagination,
  Collapse,
  Divider,
  Button,
} from '@mantine/core';
import {
  IconTruck,
  IconAlertCircle,
  IconRefresh,
  IconChevronDown,
  IconPackage,
  IconMapPin,
  IconCheck,
  IconLoader,
  IconFlag,
  IconDots,
  IconEye,
  IconX,
  IconUnlink,
  IconUser,
  IconQrcode,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useRepartosStore } from '@/application/stores/repartos-store';
import { useAuthStore } from '@/application/stores/auth-store';
import { AppHeader } from '@/presentation/components/AppHeader';
import { Breadcrumb } from '@/presentation/components/Breadcrumb';
import { QRBulkScanner } from '@/presentation/components/QRBulkScanner';
import type {
  ContainerStatus,
  Container as ContainerType,
  PreorderStatus,
} from '@/domain/dispatch/types';
import { API_BASE_URL } from '@/shared/constants/api';

const STATUS_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'En Carga', value: 'ON_LOAD' },
  { label: 'En Camino', value: 'TRAVELLING' },
  { label: 'Llegó', value: 'ARRIVED' },
];

const STATUS_MAP: Record<
  ContainerStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  ON_LOAD: {
    label: 'En Carga',
    color: 'yellow',
    icon: <IconLoader size={14} />,
  },
  TRAVELLING: {
    label: 'En Camino',
    color: 'blue',
    icon: <IconTruck size={14} />,
  },
  ARRIVED: { label: 'Llegó', color: 'green', icon: <IconFlag size={14} /> },
};

interface RepartoCardProps {
  container: ContainerType;
  onStatusChange: (
    containerId: string,
    status: ContainerStatus
  ) => Promise<void>;
  onRemovePreorder: (
    containerId: string,
    preorderId: string,
    voucherNumber: string
  ) => void;
  onOpenScanner: (status: PreorderStatus | null) => void;
}

function RepartoCard({
  container,
  onStatusChange,
  onRemovePreorder,
  onOpenScanner,
}: RepartoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [changing, setChanging] = useState(false);
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const { fetchContainers } = useRepartosStore();

  const statusInfo = STATUS_MAP[container.status];
  const preorderCount =
    container.preorders?.length || container._count?.preorders || 0;

  // Helper: Obtener color del badge según estado del paquete
  const getStatusColor = (status: string) => {
    if (status === 'COMPLETED') return 'green';
    if (status === 'PENDING') return 'yellow';
    if (status === 'CANCELLED') return 'red';
    return 'blue';
  };

  // Helper: Actualizar estado de un preorder individual
  const handleUpdatePreorderStatus = async (
    preorderId: string,
    status: string
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/voucher/preorders/${preorderId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) throw new Error('Error al actualizar');

      await fetchContainers();

      notifications.show({
        color: 'green',
        message: 'Estado actualizado',
      });
    } catch (error) {
      notifications.show({
        color: 'red',
        message: 'Error al actualizar',
      });
    }
  };

  const handleMarkAllComplete = async () => {
    if (!container.preorders || container.preorders.length === 0) return;

    modals.openConfirmModal({
      title: 'Confirmar Recepción Total',
      children: (
        <Stack gap='xs'>
          <Text size='sm'>Esto marcará:</Text>
          <Text
            size='sm'
            fw={600}
          >
            • {container.preorders.length} paquetes como COMPLETED
          </Text>
          <Text
            size='sm'
            fw={600}
          >
            • Container como ARRIVED
          </Text>
          <Text
            size='sm'
            mt='md'
          >
            ¿Todos los paquetes fueron descargados?
          </Text>
        </Stack>
      ),
      labels: { confirm: 'Confirmar Recepción', cancel: 'Cancelar' },
      confirmProps: { color: 'green' },
      onConfirm: async () => {
        try {
          setChanging(true);

          // 1. Actualizar todos los preorders a COMPLETED (en paralelo)
          const updatePromises = container.preorders!.map((cp) =>
            fetch(`${API_BASE_URL}/voucher/preorders/${cp.preorder.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ status: 'COMPLETED' }),
            })
          );

          await Promise.all(updatePromises);

          // 2. Cambiar Container a ARRIVED
          await onStatusChange(container.id, 'ARRIVED');

          notifications.show({
            color: 'green',
            title: 'Recepción completada',
            message: `${container.code}: ${
              container.preorders!.length
            } paquetes marcados como entregados`,
          });
        } catch (error) {
          notifications.show({
            color: 'red',
            title: 'Error',
            message: 'No se pudo completar la recepción',
          });
        } finally {
          setChanging(false);
        }
      },
    });
  };

  // Ejecutar cambio de estado del container
  const executeStatusChange = async (newStatus: ContainerStatus) => {
    try {
      setChanging(true);
      await onStatusChange(container.id, newStatus);
      notifications.show({
        color: 'green',
        title: 'Estado actualizado',
        message: `${container.code} → ${STATUS_MAP[newStatus].label}`,
      });
    } catch {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'No se pudo cambiar el estado',
      });
    } finally {
      setChanging(false);
    }
  };

  // Cambio de estado con validación
  const handleStatusChange = async (newStatus: ContainerStatus) => {
    if (newStatus === container.status) return;

    // Si intenta marcar ARRIVED con paquetes sin completar
    if (newStatus === 'ARRIVED' && container.preorders) {
      const pendingCount = container.preorders.filter(
        (cp) =>
          cp.preorder.status !== 'COMPLETED' &&
          cp.preorder.status !== 'CANCELLED'
      ).length;

      if (pendingCount > 0) {
        // Modal de advertencia
        modals.openConfirmModal({
          title: 'Atención',
          children: (
            <Stack gap='xs'>
              <Text size='sm'>Hay {pendingCount} paquetes sin completar.</Text>
              <Text
                size='sm'
                c='dimmed'
              >
                ¿Deseas marcar el reparto como llegado de todas formas?
              </Text>
            </Stack>
          ),
          labels: {
            confirm: 'Marcar Llegada',
            cancel: 'Cancelar',
          },
          confirmProps: { color: 'yellow' },
          onConfirm: () => executeStatusChange(newStatus),
        });
        return;
      }
    }

    // Sin problemas, ejecutar directamente
    await executeStatusChange(newStatus);
  };

  const handleOpenScannerForContainer = () => {
    // Sugerir estado basado en el estado del contenedor
    let suggestedStatus: PreorderStatus | null = null;
    
    if (container.status === 'ARRIVED') {
      suggestedStatus = 'COMPLETED';
    } else if (container.status === 'TRAVELLING') {
      suggestedStatus = 'COMPLETED'; // Asumimos que si escanea en viaje es para completar
    } else if (container.status === 'ON_LOAD') {
      suggestedStatus = 'CONFIRMED';
    }

    onOpenScanner(suggestedStatus);
  };

  return (
    <Card
      withBorder
      p='md'
      radius='md'
    >
      <Group
        justify='space-between'
        align='flex-start'
      >
        {/* Left: Main Info */}
        <Stack
          gap={4}
          style={{ flex: 1 }}
        >
          <Group gap='sm'>
            <Text
              size='lg'
              fw={700}
              c='magenta'
            >
              {container.code}
            </Text>
            <Badge
              color={statusInfo.color}
              variant='light'
              leftSection={statusInfo.icon}
            >
              {statusInfo.label}
            </Badge>
            <ActionIcon 
              variant="light" 
              color="gray" 
              size="sm" 
              onClick={handleOpenScannerForContainer}
              title="Escanear paquetes de este reparto"
            >
              <IconQrcode size={14} />
            </ActionIcon>
          </Group>

          <Group
            gap='xs'
            c='dark.6'
          >
            <IconMapPin size={14} />
            <Text size='sm'>
              {container.origin} → {container.destination}
            </Text>
          </Group>

          <Group
            gap='md'
            mt={4}
          >
            <Group gap={4}>
              <IconPackage
                size={14}
                color='var(--mantine-color-gray-6)'
              />
              <Text
                size='xs'
                c='dark.6'
              >
                {preorderCount} paquete{preorderCount !== 1 ? 's' : ''}
              </Text>
            </Group>

            {container.transport && (
              <Group gap={4}>
                <IconTruck
                  size={14}
                  color='var(--mantine-color-gray-6)'
                />
                <Text
                  size='xs'
                  c='dark.6'
                >
                  {container.transport.licensePlate}
                </Text>
              </Group>
            )}

            {container.notes && (
              <Group gap={4}>
                <IconUser
                  size={14}
                  color='var(--mantine-color-gray-6)'
                />
                <Text
                  size='xs'
                  c='dark.6'
                >
                  {container.notes}
                </Text>
              </Group>
            )}

            <Text
              size='xs'
              c='dark.5'
            >
              {new Date(container.createdAt).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </Group>
        </Stack>

        {/* Right: Actions */}
        <Group gap='xs'>
          <ActionIcon
            variant='subtle'
            color='gray'
            onClick={() => setExpanded(!expanded)}
          >
            <IconChevronDown
              size={18}
              style={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms',
              }}
            />
          </ActionIcon>

          <Menu
            position='bottom-end'
            withinPortal
          >
            <Menu.Target>
              <ActionIcon
                variant='light'
                color='magenta'
                loading={changing}
              >
                <IconCheck size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Cambiar Estado</Menu.Label>
              {Object.entries(STATUS_MAP).map(([status, info]) => (
                <Menu.Item
                  key={status}
                  leftSection={info.icon}
                  onClick={() => handleStatusChange(status as ContainerStatus)}
                  disabled={status === container.status}
                  color={status === container.status ? 'gray' : undefined}
                >
                  {info.label}
                  {status === container.status && ' (actual)'}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {/* Expanded: Package List */}
      <Collapse in={expanded}>
        <Divider my='sm' />
        {container.preorders && container.preorders.length > 0 ? (
          <Stack gap='xs'>
            <Text
              size='xs'
              fw={500}
              c='dark.6'
            >
              Paquetes en este reparto:
            </Text>
            {container.preorders.map((cp) => (
              <Group
                key={cp.preorder.id}
                justify='space-between'
                px='xs'
                py={4}
                bg='gray.0'
                style={{ borderRadius: 4 }}
              >
                <Group gap='xs'>
                  <Text
                    size='xs'
                    fw={600}
                    c='magenta'
                  >
                    {cp.preorder.voucherNumber}
                  </Text>
                  <Text
                    size='xs'
                    c='dark.6'
                  >
                    {cp.preorder.origin.split(',')[0]} →{' '}
                    {cp.preorder.destination.split(',')[0]}
                  </Text>
                </Group>

                <Group gap='xs'>
                  <Badge
                    size='xs'
                    color={getStatusColor(cp.preorder.status)}
                  >
                    {cp.preorder.status}
                  </Badge>

                  {/* Mini-menú de acciones */}
                  <Menu
                    withinPortal
                    position='bottom-end'
                  >
                    <Menu.Target>
                      <ActionIcon
                        size='xs'
                        variant='subtle'
                        color='gray'
                      >
                        <IconDots size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconCheck size={18} />}
                        onClick={() =>
                          handleUpdatePreorderStatus(
                            cp.preorder.id,
                            'COMPLETED'
                          )
                        }
                        disabled={cp.preorder.status === 'COMPLETED'}
                      >
                        Marcar Completado
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconCheck size={18} />}
                        onClick={() =>
                          handleUpdatePreorderStatus(
                            cp.preorder.id,
                            'CONFIRMED'
                          )
                        }
                        disabled={cp.preorder.status === 'CONFIRMED'}
                      >
                        Marcar Confirmado
                      </Menu.Item>
                      <Menu.Item
                        color='red'
                        leftSection={<IconX size={18} />}
                        onClick={() =>
                          handleUpdatePreorderStatus(
                            cp.preorder.id,
                            'CANCELLED'
                          )
                        }
                      >
                        Cancelar
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<IconEye size={18} />}
                        onClick={() =>
                          router.push(`/tracking/${cp.preorder.id}`)
                        }
                      >
                        Ver Detalles
                      </Menu.Item>
                      <Menu.Item
                        color='orange'
                        leftSection={<IconUnlink size={18} />}
                        onClick={() =>
                          onRemovePreorder(
                            container.id,
                            cp.preorder.id,
                            cp.preorder.voucherNumber
                          )
                        }
                      >
                        Quitar del reparto
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>
            ))}

            <Button
              fullWidth
              color='secondary'
              variant='light'
              mt='sm'
              leftSection={<IconCheck size={16} />}
              onClick={handleMarkAllComplete}
              disabled={container.status === 'ARRIVED'}
            >
              Marcar Recepción Total
            </Button>
          </Stack>
        ) : (
          <Text
            size='xs'
            c='dark.5'
            ta='center'
            py='sm'
          >
            No hay detalles de paquetes disponibles
          </Text>
        )}
      </Collapse>
    </Card>
  );
}

export function Repartos() {
  const {
    containers,
    isLoading,
    error,
    page,
    totalPages,
    total,
    fetchContainers,
    changeStatus,
    removePreorderFromContainer,
    setPage,
  } = useRepartosStore();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerInitialStatus, setScannerInitialStatus] = useState<PreorderStatus | null>(null);

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    fetchContainers({
      status: (value as ContainerStatus) || undefined,
      page: 1,
    });
  };

  const handleOpenScanner = (initialStatus: PreorderStatus | null = null) => {
    setScannerInitialStatus(initialStatus);
    setScannerOpen(true);
  };

  const handleRefresh = () => {
    fetchContainers({ status: (statusFilter as ContainerStatus) || undefined });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRemovePreorder = (
    containerId: string,
    preorderId: string,
    voucherNumber: string
  ) => {
    modals.openConfirmModal({
      title: 'Quitar paquete del reparto',
      children: (
        <Text size='sm'>
          ¿Estás seguro de quitar el paquete <strong>{voucherNumber}</strong> de
          este reparto? El paquete no será eliminado, solo desvinculado del
          contenedor.
        </Text>
      ),
      labels: { confirm: 'Quitar', cancel: 'Cancelar' },
      confirmProps: { color: 'orange' },
      onConfirm: async () => {
        try {
          await removePreorderFromContainer(containerId, preorderId);
          notifications.show({
            color: 'green',
            title: 'Paquete quitado',
            message: `${voucherNumber} fue quitado del reparto`,
          });
        } catch {
          notifications.show({
            color: 'red',
            title: 'Error',
            message: 'No se pudo quitar el paquete',
          });
        }
      },
    });
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--mantine-color-gray-0)',
      }}
    >
      <AppHeader />

      <Container
        size='xl'
        px='md'
        pb='xl'
      >
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Repartos' },
          ]}
        />

        <Stack gap='lg'>
          {/* Title and Actions */}
          <Group
            justify='space-between'
            align='flex-start'
          >
            <div>
              <Group
                gap='sm'
                align='center'
              >
                <IconTruck
                  size={28}
                  color='var(--mantine-color-magenta-8)'
                />
                <Title
                  order={2}
                  c='dark.9'
                >
                  Repartos
                </Title>
              </Group>
              <Text
                size='sm'
                c='dark.7'
                mt='xs'
              >
                {total} reparto{total !== 1 ? 's' : ''} en total
              </Text>
            </div>

            <ActionIcon
              variant='subtle'
              color='gray'
              onClick={handleRefresh}
              loading={isLoading}
            >
              <IconRefresh size={18} />
            </ActionIcon>
            <ActionIcon 
              variant='subtle' 
              color='gray' 
              onClick={() => handleOpenScanner()} 
              title="Escanear QR"
            >
              <IconQrcode size={18} />
            </ActionIcon>
          </Group>

          {/* Filters */}
          <Paper
            shadow='xs'
            p='md'
            withBorder
          >
            <SegmentedControl
              value={statusFilter}
              onChange={handleStatusFilterChange}
              data={STATUS_OPTIONS}
              color='magenta'
            />
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title='Error'
              color='red'
            >
              {error}
            </Alert>
          )}

          {/* Loading */}
          {isLoading && containers.length === 0 && (
            <Paper
              shadow='xs'
              p='xl'
              withBorder
            >
              <Stack
                align='center'
                gap='md'
              >
                <Loader color='magenta' />
                <Text
                  size='sm'
                  c='dark.7'
                >
                  Cargando repartos...
                </Text>
              </Stack>
            </Paper>
          )}

          {/* Empty State */}
          {!isLoading && containers.length === 0 && !error && (
            <Paper
              shadow='xs'
              p='xl'
              withBorder
            >
              <Stack
                align='center'
                gap='md'
              >
                <IconTruck
                  size={48}
                  color='var(--mantine-color-gray-5)'
                />
                <Text
                  size='sm'
                  c='dark.7'
                  ta='center'
                >
                  No hay repartos para mostrar
                </Text>
                <Text
                  size='xs'
                  c='dark.5'
                  ta='center'
                >
                  Crea un reparto desde la sección de Paquetes
                </Text>
              </Stack>
            </Paper>
          )}

          {/* Container List */}
          {containers.length > 0 && (
            <Stack gap='sm'>
              {containers.map((container) => (
                <RepartoCard
                  key={container.id}
                  container={container}
                  onStatusChange={changeStatus}
                  onRemovePreorder={handleRemovePreorder}
                  onOpenScanner={handleOpenScanner}
                />
              ))}
            </Stack>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Group
              justify='center'
              mt='md'
            >
              <Pagination
                value={page}
                onChange={handlePageChange}
                total={totalPages}
                color='magenta'
              />
            </Group>
          )}
        </Stack>
      </Container>
      <QRBulkScanner opened={scannerOpen} onClose={() => setScannerOpen(false)} initialStatus={scannerInitialStatus} />
    </Box>
  );
}
