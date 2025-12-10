'use client';

import {
  Table,
  Checkbox,
  Badge,
  Group,
  Text,
  Paper,
  Pagination,
  Stack,
  Tooltip,
  ActionIcon,
  Menu,
} from '@mantine/core';
import {
  IconArrowRight,
  IconDots,
  IconEye,
  IconDownload,
  IconEdit,
  IconTrash,
  IconTruck,
} from '@tabler/icons-react';
import { usePaquetesStore } from '@/application/stores/paquetes-store';
import type { Preorder, PreorderStatus, ContainerStatus } from '@/domain/dispatch/types';

interface ContainerInfo {
  code: string;
  status: ContainerStatus;
}

interface PaquetesTableProps {
  preorders: Preorder[];
  selectedIds: string[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onViewDetail: (preorder: Preorder) => void;
  onDownloadPdf: (preorder: Preorder) => void;
  onEdit: (preorder: Preorder) => void;
  onDelete: (preorder: Preorder) => void;
  assignedPreorderIds: Set<string>;
  containerByPreorderId: Map<string, ContainerInfo>;
  showCheckboxes?: boolean;
}

const STATUS_COLORS: Record<PreorderStatus, string> = {
  PENDING: 'yellow',
  CONFIRMED: 'blue',
  CANCELLED: 'red',
  COMPLETED: 'green',
};

const STATUS_LABELS: Record<PreorderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Completado',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTotalPackages(preorder: Preorder): number {
  return preorder.packages.reduce((sum, pkg) => sum + pkg.quantity, 0);
}

export function PaquetesTable({
  preorders,
  selectedIds,
  page,
  totalPages,
  onPageChange,
  isLoading,
  onViewDetail,
  onDownloadPdf,
  onEdit,
  onDelete,
  assignedPreorderIds,
  containerByPreorderId,
  showCheckboxes = true,
}: PaquetesTableProps) {
  const { toggleSelection, selectAll } = usePaquetesStore();

  // Only consider non-assigned preorders for "select all"
  const selectableIds = preorders.filter((p) => !assignedPreorderIds.has(p.id)).map((p) => p.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));
  const someSelected = selectableIds.some((id) => selectedIds.includes(id)) && !allSelected;

  return (
    <Stack gap="md">
      <Paper shadow="xs" withBorder style={{ overflow: 'hidden' }}>
        <Table.ScrollContainer minWidth={800}>
          <Table striped highlightOnHover withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                {showCheckboxes && (
                  <Table.Th style={{ width: 50 }}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={selectAll}
                      color="magenta"
                      disabled={selectableIds.length === 0}
                    />
                  </Table.Th>
                )}
                <Table.Th>Voucher</Table.Th>
                <Table.Th>Fecha</Table.Th>
                <Table.Th>Cliente</Table.Th>
                <Table.Th>Ruta</Table.Th>
                <Table.Th style={{ width: 80 }}>Bultos</Table.Th>
                <Table.Th style={{ width: 100 }}>Estado</Table.Th>
                <Table.Th style={{ width: 60 }}>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {preorders.map((preorder) => {
                const isAssigned = assignedPreorderIds.has(preorder.id);
                const containerInfo = containerByPreorderId.get(preorder.id);

                return (
                <Table.Tr
                  key={preorder.id}
                  style={{
                    cursor: showCheckboxes && !isAssigned ? 'pointer' : 'default',
                    backgroundColor: selectedIds.includes(preorder.id)
                      ? 'var(--mantine-color-magenta-0)'
                      : undefined,
                  }}
                  onClick={() => {
                    if (showCheckboxes && !isAssigned) {
                      toggleSelection(preorder.id);
                    }
                  }}
                >
                  {showCheckboxes && (
                    <Table.Td onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(preorder.id)}
                        onChange={() => {
                          if (!isAssigned) toggleSelection(preorder.id);
                        }}
                        color="magenta"
                        disabled={isAssigned}
                      />
                    </Table.Td>
                  )}
                  <Table.Td>
                    <Group gap="xs">
                      <Text size="sm" fw={600} c="magenta">
                        {preorder.voucherNumber}
                      </Text>
                      {isAssigned && containerInfo && (
                        <Tooltip label={`Asignado a reparto ${containerInfo.code}`}>
                          <Badge size="xs" color="blue" variant="light" leftSection={<IconTruck size={10} />}>
                            {containerInfo.code}
                          </Badge>
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dark.7">
                      {formatDate(preorder.createdAt)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text size="sm" fw={500} c="dark.9" lineClamp={1}>
                        {preorder.client.fullname}
                      </Text>
                      <Text size="xs" c="dark.7" lineClamp={1}>
                        {preorder.client.email}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Tooltip label={preorder.origin} multiline maw={200}>
                        <Text size="sm" c="dark.9" lineClamp={1} style={{ maxWidth: 100 }}>
                          {preorder.origin.split(',')[0]}
                        </Text>
                      </Tooltip>
                      <IconArrowRight size={14} color="var(--mantine-color-gray-5)" />
                      <Tooltip label={preorder.destination} multiline maw={200}>
                        <Text size="sm" c="dark.9" lineClamp={1} style={{ maxWidth: 100 }}>
                          {preorder.destination.split(',')[0]}
                        </Text>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="gray">
                      {getTotalPackages(preorder)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={STATUS_COLORS[preorder.status]} variant="light">
                      {STATUS_LABELS[preorder.status]}
                    </Badge>
                  </Table.Td>
                  <Table.Td onClick={(e) => e.stopPropagation()}>
                    <Menu position="bottom-end" withinPortal>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray" size="sm">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEye size={14} />}
                          onClick={() => onViewDetail(preorder)}
                        >
                          Ver detalles
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconDownload size={14} />}
                          onClick={() => onDownloadPdf(preorder)}
                        >
                          Descargar PDF
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={() => onEdit(preorder)}
                        >
                          Editar
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => onDelete(preorder)}
                        >
                          Eliminar
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {totalPages > 1 && (
        <Group justify="center">
          <Pagination
            total={totalPages}
            value={page}
            onChange={onPageChange}
            color="magenta"
            disabled={isLoading}
          />
        </Group>
      )}
    </Stack>
  );
}
