'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Paper,
  Box,
  Badge,
  Loader,
  Alert,
  ActionIcon,
  Table,
  Pagination,
  Menu,
} from '@mantine/core';
import {
  IconTruck,
  IconAlertCircle,
  IconRefresh,
  IconPlus,
  IconDots,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconEye,
  IconPackage,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useTransportStore } from '@/application/stores/transport-store';
import { AppHeader } from '@/presentation/components/AppHeader';
import { Breadcrumb } from '@/presentation/components/Breadcrumb';
import { TransportModal } from './TransportModal';
import { TransportDetailModal } from './TransportDetailModal';
import type { Transport } from '@/domain/dispatch/types';

export function Transportes() {
  const {
    transports,
    selectedTransport,
    transportDetail,
    isLoading,
    isLoadingDetail,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    page,
    totalPages,
    total,
    fetchTransports,
    fetchTransportDetail,
    createTransport,
    updateTransport,
    deleteTransport,
    setSelectedTransport,
    clearTransportDetail,
    setPage,
  } = useTransportStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchTransports();
  }, [fetchTransports]);

  const handleRefresh = () => {
    fetchTransports();
  };

  const handleCreate = () => {
    setSelectedTransport(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (transport: Transport) => {
    setSelectedTransport(transport);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = (transport: Transport) => {
    modals.openConfirmModal({
      title: 'Eliminar vehículo',
      children: (
        <Text size='sm'>
          ¿Estás seguro de eliminar el vehículo{' '}
          <strong>{transport.name}</strong> ({transport.licensePlate})? Esta
          acción no se puede deshacer.
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red', loading: isDeleting },
      onConfirm: async () => {
        try {
          await deleteTransport(transport.id);
          notifications.show({
            color: 'green',
            title: 'Eliminado',
            message: `Vehículo ${transport.name} eliminado`,
          });
        } catch {
          notifications.show({
            color: 'red',
            title: 'Error',
            message: 'No se pudo eliminar el vehículo',
          });
        }
      },
    });
  };

  const handleSave = async (data: {
    name: string;
    licensePlate: string;
    available?: boolean;
  }) => {
    if (modalMode === 'create') {
      await createTransport(data);
      notifications.show({
        color: 'green',
        title: 'Creado',
        message: `Vehículo ${data.name} creado`,
      });
    } else if (selectedTransport) {
      await updateTransport(selectedTransport.id, data);
      notifications.show({
        color: 'green',
        title: 'Actualizado',
        message: `Vehículo ${data.name} actualizado`,
      });
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTransport(null);
  };

  const handleViewDetail = async (transport: Transport) => {
    try {
      await fetchTransportDetail(transport.id);
      setDetailModalOpen(true);
    } catch {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'No se pudo cargar el detalle del transporte',
      });
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    clearTransportDetail();
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
            { label: 'Transportes' },
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
                  Transportes
                </Title>
              </Group>
              <Text
                size='sm'
                c='dark.7'
                mt='xs'
              >
                {total} vehículo{total !== 1 ? 's' : ''} registrado
                {total !== 1 ? 's' : ''}
              </Text>
            </div>

            <Group gap='sm'>
              <ActionIcon
                variant='subtle'
                color='gray'
                onClick={handleRefresh}
                loading={isLoading}
              >
                <IconRefresh size={18} />
              </ActionIcon>
              <Button
                color='magenta'
                leftSection={<IconPlus size={18} />}
                onClick={handleCreate}
              >
                Nuevo Vehículo
              </Button>
            </Group>
          </Group>

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
          {isLoading && transports.length === 0 && (
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
                  Cargando vehículos...
                </Text>
              </Stack>
            </Paper>
          )}

          {/* Empty State */}
          {!isLoading && transports.length === 0 && !error && (
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
                  No hay vehículos registrados
                </Text>
                <Button
                  variant='light'
                  color='magenta'
                  leftSection={<IconPlus size={16} />}
                  onClick={handleCreate}
                >
                  Agregar primer vehículo
                </Button>
              </Stack>
            </Paper>
          )}

          {/* Table */}
          {transports.length > 0 && (
            <Paper
              shadow='xs'
              withBorder
              style={{ overflow: 'hidden' }}
            >
              <Table.ScrollContainer minWidth={600}>
                <Table
                  striped
                  highlightOnHover
                  withColumnBorders
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Nombre</Table.Th>
                      <Table.Th>Patente</Table.Th>
                      <Table.Th style={{ width: 100 }}>Repartos</Table.Th>
                      <Table.Th style={{ width: 120 }}>Estado</Table.Th>
                      <Table.Th style={{ width: 80 }}>Acciones</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {transports.map((transport) => (
                      <Table.Tr key={transport.id}>
                        <Table.Td>
                          <Text
                            size='sm'
                            c='dark.7'
                            fw={500}
                          >
                            {transport.name}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text
                            size='sm'
                            c='magenta'
                            fw={600}
                          >
                            {transport.licensePlate}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color='gray'
                            variant='light'
                            leftSection={<IconPackage size={12} />}
                          >
                            {transport._count?.containers ?? 0}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={transport.available ? 'green' : 'gray'}
                            variant='light'
                            leftSection={
                              transport.available ? (
                                <IconCheck size={12} />
                              ) : (
                                <IconX size={12} />
                              )
                            }
                          >
                            {transport.available
                              ? 'Disponible'
                              : 'No disponible'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Menu
                            position='bottom-end'
                            withinPortal
                          >
                            <Menu.Target>
                              <ActionIcon
                                variant='subtle'
                                color='gray'
                                size='sm'
                              >
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconEye size={14} />}
                                onClick={() => handleViewDetail(transport)}
                              >
                                Ver Historial
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => handleEdit(transport)}
                              >
                                Editar
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item
                                color='red'
                                leftSection={<IconTrash size={14} />}
                                onClick={() => handleDelete(transport)}
                              >
                                Eliminar
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Paper>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Group
              justify='center'
              mt='md'
            >
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                color='magenta'
              />
            </Group>
          )}
        </Stack>
      </Container>

      {/* Transport Modal */}
      <TransportModal
        opened={modalOpen}
        onClose={handleCloseModal}
        transport={selectedTransport}
        onSave={handleSave}
        isLoading={modalMode === 'create' ? isCreating : isUpdating}
        mode={modalMode}
      />

      {/* Transport Detail Modal */}
      <TransportDetailModal
        opened={detailModalOpen}
        onClose={handleCloseDetailModal}
        transport={transportDetail}
        isLoading={isLoadingDetail}
      />
    </Box>
  );
}
