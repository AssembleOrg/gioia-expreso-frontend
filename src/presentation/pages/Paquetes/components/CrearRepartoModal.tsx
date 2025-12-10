'use client';

import { useEffect, useState } from 'react';
import {
  Modal,
  Stack,
  Card,
  Text,
  Group,
  Button,
  Badge,
  TextInput,
  Textarea,
  Select,
  Divider,
  ThemeIcon,
  Alert,
  ScrollArea,
} from '@mantine/core';
import { IconTruck, IconCheck, IconAlertCircle, IconPackage, IconUser } from '@tabler/icons-react';
import { useRepartosStore } from '@/application/stores/repartos-store';
import type { Preorder, Transport } from '@/domain/dispatch/types';

interface CrearRepartoModalProps {
  opened: boolean;
  onClose: () => void;
  selectedPreorders: Preorder[];
  onSuccess: () => void;
}

export function CrearRepartoModal({
  opened,
  onClose,
  selectedPreorders,
  onSuccess,
}: CrearRepartoModalProps) {
  const { transports, containers, isCreating, error, fetchTransports, fetchContainers, createContainer } = useRepartosStore();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [transportId, setTransportId] = useState<string | null>(null);
  const [driverName, setDriverName] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  // Derive origin/destination from selected preorders
  useEffect(() => {
    if (opened && selectedPreorders.length > 0) {
      // Get unique origins and destinations
      const origins = [...new Set(selectedPreorders.map((p) => p.origin.split(',')[0].trim()))];
      const destinations = [...new Set(selectedPreorders.map((p) => p.destination.split(',')[0].trim()))];

      setOrigin(origins.join(', '));
      setDestination(destinations.join(', '));
      fetchTransports();
      fetchContainers({ limit: 1000 }); // Get all containers to check occupancy
    }
  }, [opened, selectedPreorders, fetchTransports, fetchContainers]);

  // Calculate occupied transports (those with active containers)
  const occupiedTransportIds = new Set(
    containers
      .filter((c) => c.status === 'ON_LOAD' || c.status === 'TRAVELLING')
      .map((c) => c.transportId)
      .filter((id): id is string => id !== null)
  );

  // Reset state when modal closes
  useEffect(() => {
    if (!opened) {
      setTransportId(null);
      setDriverName('');
      setSuccess(null);
    }
  }, [opened]);

  const handleSubmit = async () => {
    if (!origin || !destination || !transportId || !driverName.trim()) return;

    try {
      const container = await createContainer({
        origin,
        destination,
        transportId,
        notes: driverName.trim(), // Guardar nombre del chofer en notes
        preorderIds: selectedPreorders.map((p) => p.id),
      });

      setSuccess(`Reparto ${container.code} creado exitosamente`);

      // Wait a bit before closing
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      // Error is handled by the store
    }
  };

  const transportOptions = (transports || []).map((t: Transport) => {
    const isOccupied = occupiedTransportIds.has(t.id);
    return {
      value: t.id,
      label: isOccupied
        ? `${t.name} (${t.licensePlate}) - En reparto`
        : `${t.name} (${t.licensePlate})`,
      disabled: isOccupied,
    };
  });

  const totalPackages = selectedPreorders.reduce(
    (sum, p) => sum + p.packages.reduce((s, pkg) => s + pkg.quantity, 0),
    0
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon size={32} radius="xl" color="magenta" variant="light">
            <IconTruck size={20} />
          </ThemeIcon>
          <Text size="lg" fw={700} c="dark.9">
            Crear Reparto
          </Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* Success Alert */}
        {success && (
          <Alert icon={<IconCheck size={16} />} title="Reparto Creado" color="green">
            {success}
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
            {error}
          </Alert>
        )}

        {!success && (
          <>
            {/* Selected Packages Summary */}
            <Card withBorder p="sm" bg="gray.0">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <IconPackage size={18} color="var(--mantine-color-magenta-6)" />
                  <Text size="sm" fw={500} c="dark.7">
                    Paquetes seleccionados
                  </Text>
                </Group>
                <Group gap="sm">
                  <Badge color="magenta" size="lg">
                    {selectedPreorders.length} envio{selectedPreorders.length !== 1 ? 's' : ''}
                  </Badge>
                  <Badge color="gray" size="lg">
                    {totalPackages} bulto{totalPackages !== 1 ? 's' : ''}
                  </Badge>
                </Group>
              </Group>
            </Card>

            {/* Preorders List */}
            <ScrollArea.Autosize mah={150}>
              <Stack gap="xs">
                {selectedPreorders.map((preorder) => (
                  <Card key={preorder.id} withBorder p="xs" radius="sm">
                    <Group justify="space-between">
                      <div>
                        <Text size="xs" fw={600} c="magenta">
                          {preorder.voucherNumber}
                        </Text>
                        <Text size="xs" c="dark.7">
                          {preorder.client.fullname}
                        </Text>
                      </div>
                      <Text size="xs" c="dark.7">
                        {preorder.origin.split(',')[0]} → {preorder.destination.split(',')[0]}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </ScrollArea.Autosize>

            <Divider />

            {/* Form Fields */}
            <TextInput
              label="Origen"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Ej: Buenos Aires"
              required
            />

            <TextInput
              label="Destino"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ej: Entre Ríos"
              required
            />

            <Select
              label="Transporte"
              placeholder="Seleccionar vehículo"
              description={
                occupiedTransportIds.size > 0
                  ? `${transports.length - occupiedTransportIds.size} disponibles, ${occupiedTransportIds.size} en reparto`
                  : 'Camión y patente para este reparto'
              }
              data={transportOptions}
              value={transportId}
              onChange={setTransportId}
              searchable
              required
              leftSection={<IconTruck size={16} />}
              styles={{
                input: {
                  color: '#000',
                  fontWeight: 500,
                },
                option: {
                  color: '#000',
                },
              }}
            />

            <TextInput
              label="Nombre del Chofer"
              placeholder="Ej: Juan Pérez"
              description="Conductor asignado al reparto"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              required
              leftSection={<IconUser size={16} />}
            />

            {/* Actions */}
            <Group justify="flex-end" gap="sm">
              <Button variant="subtle" color="gray" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                color="magenta"
                onClick={handleSubmit}
                loading={isCreating}
                disabled={!origin || !destination || !transportId || !driverName.trim() || selectedPreorders.length === 0}
              >
                Crear Reparto
              </Button>
            </Group>
          </>
        )}

        {/* Close on Success */}
        {success && (
          <Button variant="subtle" onClick={onClose} fullWidth>
            Cerrar
          </Button>
        )}
      </Stack>
    </Modal>
  );
}
