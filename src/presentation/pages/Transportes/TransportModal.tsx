'use client';

import { useEffect, useState } from 'react';
import {
  Modal,
  Stack,
  Text,
  Group,
  Button,
  TextInput,
  Switch,
  ThemeIcon,
  Alert,
} from '@mantine/core';
import { IconTruck, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import type { Transport } from '@/domain/dispatch/types';

interface TransportModalProps {
  opened: boolean;
  onClose: () => void;
  transport: Transport | null;
  onSave: (data: {
    name: string;
    licensePlate: string;
    available?: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function TransportModal({
  opened,
  onClose,
  transport,
  onSave,
  isLoading = false,
  mode,
}: TransportModalProps) {
  const [name, setName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (opened) {
      if (mode === 'edit' && transport) {
        setName(transport.name);
        setLicensePlate(transport.licensePlate);
        setAvailable(transport.available);
      } else {
        setName('');
        setLicensePlate('');
        setAvailable(true);
      }
      setError(null);
      setSuccess(false);
    }
  }, [opened, mode, transport]);

  const handleSave = async () => {
    if (!name.trim() || !licensePlate.trim()) {
      setError('Nombre y patente son requeridos');
      return;
    }

    setError(null);
    try {
      await onSave({
        name: name.trim(),
        licensePlate: licensePlate.trim().toUpperCase(),
        available,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const title = mode === 'create' ? 'Nuevo Vehículo' : 'Editar Vehículo';

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
          <Text
            size='lg'
            fw={700}
            c='dark.9'
          >
            {title}
          </Text>
        </Group>
      }
      size='md'
      centered
    >
      <Stack gap='md'>
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color='red'
            title='Error'
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            icon={<IconCheck size={16} />}
            color='green'
            title='Guardado'
          >
            {mode === 'create'
              ? 'Vehículo creado correctamente'
              : 'Vehículo actualizado correctamente'}
          </Alert>
        )}

        {!success && (
          <>
            <TextInput
              label='Nombre'
              placeholder='Ej: Camión Principal, Furgoneta 1'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <TextInput
              label='Patente'
              placeholder='Ej: AB123CD'
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              required
              styles={{
                input: { textTransform: 'uppercase' },
              }}
            />

            <Switch
              label='Disponible'
              description='Si está disponible para asignar a repartos'
              checked={available}
              onChange={(e) => setAvailable(e.currentTarget.checked)}
              color='magenta'
            />

            <Group
              justify='flex-end'
              gap='sm'
              mt='md'
            >
              <Button
                variant='subtle'
                color='gray'
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                color='magenta'
                onClick={handleSave}
                loading={isLoading}
                disabled={!name.trim() || !licensePlate.trim()}
              >
                {mode === 'create' ? 'Crear Vehículo' : 'Guardar Cambios'}
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
