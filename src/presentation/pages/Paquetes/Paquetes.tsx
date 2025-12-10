'use client';

import { useEffect, useState, useMemo } from 'react';
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
  Affix,
  Transition,
  Tabs,
} from '@mantine/core';
import {
  IconPackage,
  IconTruck,
  IconAlertCircle,
  IconRefresh,
  IconCheck,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { usePaquetesStore, type PaquetesTab } from '@/application/stores/paquetes-store';
import { AppHeader } from '@/presentation/components/AppHeader';
import { Breadcrumb } from '@/presentation/components/Breadcrumb';
import { PaquetesTable } from './components/PaquetesTable';
import { CrearRepartoModal } from './components/CrearRepartoModal';
import { PreorderDetailModal } from './components/PreorderDetailModal';
import { EditPreorderModal } from './components/EditPreorderModal';
import type { Preorder, PreorderStatus } from '@/domain/dispatch/types';

export function Paquetes() {
  const {
    preorders,
    selectedIds,
    selectedPreorder,
    isLoading,
    isDownloading,
    isUpdating,
    isDeleting,
    error,
    page,
    total,
    activeTab,
    assignedPreorderIds,
    containerByPreorderId,
    isLoadingContainers,
    fetchPreorders,
    fetchAssignedPreorders,
    setActiveTab,
    setPage,
    clearSelection,
    getSelectedPreorders,
    setSelectedPreorder,
    downloadPdf,
    updatePreorder,
    deletePreorder,
  } = usePaquetesStore();

  const [repartoModalOpen, setRepartoModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchPreorders();
    fetchAssignedPreorders();
  }, [fetchPreorders, fetchAssignedPreorders]);

  // Filter preorders based on active tab
  const filteredPreorders = useMemo(() => {
    return preorders.filter((p) => {
      const isAssigned = assignedPreorderIds.has(p.id);
      const containerInfo = containerByPreorderId.get(p.id);

      switch (activeTab) {
        case 'disponibles':
          return !isAssigned && p.status !== 'COMPLETED' && p.status !== 'CANCELLED';
        case 'en_reparto':
          return isAssigned && containerInfo?.status !== 'ARRIVED';
        case 'completados':
          return p.status === 'COMPLETED' || (isAssigned && containerInfo?.status === 'ARRIVED');
        default:
          return true;
      }
    });
  }, [preorders, activeTab, assignedPreorderIds, containerByPreorderId]);

  // Client-side pagination AFTER filtering by tab
  const ITEMS_PER_PAGE = 10;
  const paginatedPreorders = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredPreorders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPreorders, page]);

  const totalPagesForTab = Math.ceil(filteredPreorders.length / ITEMS_PER_PAGE);

  // Calculate counts for each tab
  const tabCounts = useMemo(() => {
    let disponibles = 0;
    let enReparto = 0;
    let completados = 0;

    preorders.forEach((p) => {
      const isAssigned = assignedPreorderIds.has(p.id);
      const containerInfo = containerByPreorderId.get(p.id);

      if (p.status === 'COMPLETED' || (isAssigned && containerInfo?.status === 'ARRIVED')) {
        completados++;
      } else if (isAssigned) {
        enReparto++;
      } else if (p.status !== 'CANCELLED') {
        disponibles++;
      }
    });

    return { disponibles, enReparto, completados };
  }, [preorders, assignedPreorderIds, containerByPreorderId]);

  const handleRefresh = () => {
    fetchPreorders();
    fetchAssignedPreorders();
  };

  const handleOpenRepartoModal = () => {
    setRepartoModalOpen(true);
  };

  const handleRepartoCreated = () => {
    setRepartoModalOpen(false);
    clearSelection();
    fetchPreorders();
    fetchAssignedPreorders();
  };

  const handleViewDetail = (preorder: Preorder) => {
    setSelectedPreorder(preorder);
    setDetailModalOpen(true);
  };

  const handleDownloadPdf = async (preorder: Preorder) => {
    try {
      await downloadPdf(preorder.id, preorder.voucherNumber);
      notifications.show({
        color: 'green',
        title: 'PDF descargado',
        message: `Comprobante ${preorder.voucherNumber} descargado`,
      });
    } catch {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'No se pudo descargar el PDF',
      });
    }
  };

  const handleEdit = (preorder: Preorder) => {
    setSelectedPreorder(preorder);
    setEditModalOpen(true);
  };

  const handleDelete = (preorder: Preorder) => {
    modals.openConfirmModal({
      title: 'Eliminar preorden',
      children: (
        <Text size="sm">
          ¿Estás seguro de eliminar la preorden <strong>{preorder.voucherNumber}</strong>?
          Esta acción no se puede deshacer.
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red', loading: isDeleting },
      onConfirm: async () => {
        try {
          await deletePreorder(preorder.id);
          notifications.show({
            color: 'green',
            title: 'Eliminado',
            message: `Preorden ${preorder.voucherNumber} eliminada`,
          });
        } catch {
          notifications.show({
            color: 'red',
            title: 'Error',
            message: 'No se pudo eliminar la preorden',
          });
        }
      },
    });
  };

  const handleSaveEdit = async (data: { status?: PreorderStatus; notes?: string }) => {
    if (!selectedPreorder) return;
    await updatePreorder(selectedPreorder.id, data);
    setEditModalOpen(false);
    notifications.show({
      color: 'green',
      title: 'Guardado',
      message: 'Preorden actualizada correctamente',
    });
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedPreorder(null);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleEditFromDetail = () => {
    setDetailModalOpen(false);
    setEditModalOpen(true);
  };

  const handleDownloadFromDetail = () => {
    if (selectedPreorder) {
      handleDownloadPdf(selectedPreorder);
    }
  };

  const selectedPreorders = getSelectedPreorders();

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-gray-0)' }}>
      <AppHeader />

      {/* Content */}
      <Container size="xl" px="md" pb={100}>
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Paquetes' },
          ]}
        />
        <Stack gap="lg">
          {/* Title and Actions */}
          <Group justify="space-between" align="flex-start">
            <div>
              <Group gap="sm" align="center">
                <IconPackage size={28} color="var(--mantine-color-magenta-8)" />
                <Title order={2} c="dark.9">Paquetes</Title>
              </Group>
              <Text size="sm" c="dark.7" mt="xs">
                {total} paquete{total !== 1 ? 's' : ''} en total
              </Text>
            </div>

            <Group gap="sm">
              <ActionIcon variant="subtle" color="gray" onClick={handleRefresh} loading={isLoading}>
                <IconRefresh size={18} />
              </ActionIcon>
            </Group>
          </Group>

          {/* Tabs for Assignment Status */}
          <Tabs
            value={activeTab}
            onChange={(value) => setActiveTab(value as PaquetesTab)}
            styles={{ tab: { color: 'var(--mantine-color-dark-7)' } }}
          >
            <Tabs.List>
              <Tabs.Tab
                value="disponibles"
                leftSection={<IconPackage size={16} />}
                rightSection={
                  <Badge size="sm" variant="filled" color="magenta" circle>
                    {tabCounts.disponibles}
                  </Badge>
                }
              >
                Disponibles
              </Tabs.Tab>
              <Tabs.Tab
                value="en_reparto"
                leftSection={<IconTruck size={16} />}
                rightSection={
                  <Badge size="sm" variant="filled" color="blue" circle>
                    {tabCounts.enReparto}
                  </Badge>
                }
              >
                En Reparto
              </Tabs.Tab>
              <Tabs.Tab
                value="completados"
                leftSection={<IconCheck size={16} />}
                rightSection={
                  <Badge size="sm" variant="filled" color="green" circle>
                    {tabCounts.completados}
                  </Badge>
                }
              >
                Completados
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {/* Selection Info */}
          {selectedIds.length > 0 && activeTab === 'disponibles' && (
            <Paper shadow="xs" p="sm" withBorder>
              <Group justify="space-between" align="center">
                <Badge size="lg" color="magenta" variant="light">
                  {selectedIds.length} seleccionado{selectedIds.length !== 1 ? 's' : ''}
                </Badge>
                <Button
                  variant="subtle"
                  color="gray"
                  size="xs"
                  onClick={clearSelection}
                >
                  Limpiar selección
                </Button>
              </Group>
            </Paper>
          )}

          {/* Error Alert */}
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
              {error}
            </Alert>
          )}

          {/* Loading */}
          {isLoading && preorders.length === 0 && (
            <Paper shadow="xs" p="xl" withBorder>
              <Stack align="center" gap="md">
                <Loader color="magenta" />
                <Text size="sm" c="dark.7">
                  Cargando paquetes...
                </Text>
              </Stack>
            </Paper>
          )}

          {/* Table */}
          {!isLoading && !isLoadingContainers && filteredPreorders.length === 0 && !error && (
            <Paper shadow="xs" p="xl" withBorder>
              <Stack align="center" gap="md">
                <IconPackage size={48} color="var(--mantine-color-gray-5)" />
                <Text size="sm" c="dark.7" ta="center">
                  {activeTab === 'disponibles' && 'No hay paquetes disponibles para asignar'}
                  {activeTab === 'en_reparto' && 'No hay paquetes en reparto'}
                  {activeTab === 'completados' && 'No hay paquetes completados'}
                </Text>
              </Stack>
            </Paper>
          )}

          {filteredPreorders.length > 0 && (
            <PaquetesTable
              preorders={paginatedPreorders}
              selectedIds={selectedIds}
              page={page}
              totalPages={totalPagesForTab}
              onPageChange={setPage}
              isLoading={isLoading || isLoadingContainers}
              onViewDetail={handleViewDetail}
              onDownloadPdf={handleDownloadPdf}
              onEdit={handleEdit}
              onDelete={handleDelete}
              assignedPreorderIds={assignedPreorderIds}
              containerByPreorderId={containerByPreorderId}
              showCheckboxes={activeTab === 'disponibles'}
            />
          )}
        </Stack>
      </Container>

      {/* Floating Action Button for Create Reparto - Only shown in 'disponibles' tab */}
      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={selectedIds.length > 0 && activeTab === 'disponibles'}>
          {(transitionStyles) => (
            <Button
              style={{ ...transitionStyles, boxShadow: 'var(--mantine-shadow-xl)' }}
              size="lg"
              color="magenta"
              leftSection={<IconTruck size={20} />}
              onClick={handleOpenRepartoModal}
            >
              Crear Reparto ({selectedIds.length})
            </Button>
          )}
        </Transition>
      </Affix>

      {/* Create Reparto Modal */}
      <CrearRepartoModal
        opened={repartoModalOpen}
        onClose={() => setRepartoModalOpen(false)}
        selectedPreorders={selectedPreorders}
        onSuccess={handleRepartoCreated}
      />

      {/* Preorder Detail Modal */}
      <PreorderDetailModal
        opened={detailModalOpen}
        onClose={handleCloseDetailModal}
        preorder={selectedPreorder}
        onDownloadPdf={handleDownloadFromDetail}
        onEdit={handleEditFromDetail}
        isDownloading={isDownloading}
      />

      {/* Edit Preorder Modal */}
      <EditPreorderModal
        opened={editModalOpen}
        onClose={handleCloseEditModal}
        preorder={selectedPreorder}
        onSave={handleSaveEdit}
        isUpdating={isUpdating}
      />
    </Box>
  );
}
