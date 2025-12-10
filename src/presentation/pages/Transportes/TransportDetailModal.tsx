'use client';

import {
  Modal,
  Stack,
  Group,
  Text,
  Badge,
  Card,
  Divider,
  ThemeIcon,
  Loader,
  ScrollArea,
  SimpleGrid,
} from '@mantine/core';
import {
  IconTruck,
  IconPackage,
  IconMapPin,
  IconCheck,
  IconX,
  IconLoader,
  IconFlag,
  IconCalendar,
} from '@tabler/icons-react';
import type {
  TransportWithContainers,
  ContainerStatus,
} from '@/domain/dispatch/types';

interface TransportDetailModalProps {
  opened: boolean;
  onClose: () => void;
  transport: TransportWithContainers | null;
  isLoading: boolean;
}

const STATUS_MAP: Record<
  ContainerStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  ON_LOAD: {
    label: 'Cargando',
    color: 'yellow',
    icon: <IconLoader size={12} />,
  },
  TRAVELLING: {
    label: 'En Camino',
    color: 'blue',
    icon: <IconTruck size={12} />,
  },
  ARRIVED: { label: 'Llegado', color: 'green', icon: <IconFlag size={12} /> },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TransportDetailModal({
  opened,
  onClose,
  transport,
  isLoading,
}: TransportDetailModalProps) {
  if (isLoading) {
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title='Cargando...'
        size='lg'
        centered
      >
        <Stack
          align='center'
          p='xl'
        >
          <Loader color='magenta' />
          <Text
            size='sm'
            c='dimmed'
          >
            Cargando información del transporte...
          </Text>
        </Stack>
      </Modal>
    );
  }

  if (!transport) return null;

  const containers = transport.containers || [];

  // Calculate statistics
  const totalContainers = containers.length;
  const activeContainers = containers.filter(
    (c) => c.status === 'ON_LOAD' || c.status === 'TRAVELLING'
  ).length;
  const completedContainers = containers.filter(
    (c) => c.status === 'ARRIVED'
  ).length;
  const totalPreorders = containers.reduce(
    (sum, c) => sum + (c.preorders?.length || c._count?.preorders || 0),
    0
  );
  const isOccupied = activeContainers > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap='sm'>
          <ThemeIcon
            size={32}
            radius='xl'
            color='magenta'
            variant='light'
          >
            <IconTruck size={20} />
          </ThemeIcon>
          <div>
            <Text
              size='lg'
              fw={700}
              c='dark.9'
            >
              {transport.name}
            </Text>
            <Text
              size='xs'
              c='dimmed'
            >
              {transport.licensePlate}
            </Text>
          </div>
        </Group>
      }
      size='lg'
      centered
    >
      <Stack gap='md'>
        {/* Status Badges */}
        <Group gap='sm'>
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
            {transport.available ? 'Disponible' : 'No disponible'}
          </Badge>
          <Badge
            color={isOccupied ? 'yellow' : 'teal'}
            variant='light'
            leftSection={
              isOccupied ? <IconLoader size={12} /> : <IconCheck size={12} />
            }
          >
            {isOccupied ? 'En Reparto Activo' : 'Libre'}
          </Badge>
        </Group>

        {/* Statistics */}
        <SimpleGrid
          cols={4}
          spacing='xs'
        >
          <Card
            withBorder
            p='xs'
            ta='center'
          >
            <Text
              size='xl'
              fw={700}
              c='magenta'
            >
              {totalContainers}
            </Text>
            <Text
              size='xs'
              c='dimmed'
            >
              Repartos
            </Text>
          </Card>
          <Card
            withBorder
            p='xs'
            ta='center'
          >
            <Text
              size='xl'
              fw={700}
              c='magenta'
            >
              {activeContainers}
            </Text>
            <Text
              size='xs'
              c='dimmed'
            >
              Activos
            </Text>
          </Card>
          <Card
            withBorder
            p='xs'
            ta='center'
          >
            <Text
              size='xl'
              fw={700}
              c='magenta'
            >
              {completedContainers}
            </Text>
            <Text
              size='xs'
              c='dimmed'
            >
              Completados
            </Text>
          </Card>
          <Card
            withBorder
            p='xs'
            ta='center'
          >
            <Text
              size='xl'
              fw={700}
              c='magenta'
            >
              {totalPreorders}
            </Text>
            <Text
              size='xs'
              c='dimmed'
            >
              Paquetes
            </Text>
          </Card>
        </SimpleGrid>

        <Divider
          label='Historial de Repartos'
          labelPosition='center'
        />

        {/* Containers List */}
        {containers.length === 0 ? (
          <Card
            withBorder
            p='lg'
            ta='center'
          >
            <IconPackage
              size={32}
              color='var(--mantine-color-gray-5)'
            />
            <Text
              size='sm'
              c='dimmed'
              mt='xs'
            >
              Este transporte no tiene repartos asignados
            </Text>
          </Card>
        ) : (
          <ScrollArea.Autosize mah={300}>
            <Stack gap='xs'>
              {containers.map((container) => {
                const statusInfo = STATUS_MAP[container.status];
                const preorderCount =
                  container.preorders?.length ||
                  container._count?.preorders ||
                  0;

                return (
                  <Card
                    key={container.id}
                    withBorder
                    p='sm'
                    radius='sm'
                  >
                    <Group
                      justify='space-between'
                      align='flex-start'
                    >
                      <div>
                        <Group gap='xs'>
                          <Text
                            size='sm'
                            fw={600}
                            c='magenta'
                          >
                            {container.code}
                          </Text>
                          <Badge
                            size='xs'
                            color={statusInfo.color}
                            variant='light'
                            leftSection={statusInfo.icon}
                          >
                            {statusInfo.label}
                          </Badge>
                        </Group>
                        <Group
                          gap='xs'
                          mt={4}
                        >
                          <IconMapPin
                            size={12}
                            color='var(--mantine-color-gray-6)'
                          />
                          <Text
                            size='xs'
                            c='dimmed'
                          >
                            {container.origin} → {container.destination}
                          </Text>
                        </Group>
                        {container.notes && (
                          <Text
                            size='xs'
                            c='dimmed'
                            mt={2}
                          >
                            Chofer: {container.notes}
                          </Text>
                        )}
                      </div>
                      <Stack
                        gap={2}
                        align='flex-end'
                      >
                        <Badge
                          size='xs'
                          color='gray'
                          variant='light'
                        >
                          {preorderCount} paquete
                          {preorderCount !== 1 ? 's' : ''}
                        </Badge>
                        <Group gap={4}>
                          <IconCalendar
                            size={10}
                            color='var(--mantine-color-gray-5)'
                          />
                          <Text
                            size='xs'
                            c='dimmed'
                          >
                            {formatDate(container.createdAt)}
                          </Text>
                        </Group>
                      </Stack>
                    </Group>
                  </Card>
                );
              })}
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Stack>
    </Modal>
  );
}
