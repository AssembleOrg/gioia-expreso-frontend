'use client';

import { useEffect, useState } from 'react';
import {
  Modal,
  Stack,
  Text,
  Group,
  Button,
  Select,
  Textarea,
  ThemeIcon,
  Alert,
} from '@mantine/core';
import { IconEdit, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import type { Preorder, PreorderStatus } from '@/domain/dispatch/types';

interface EditPreorderModalProps {
  opened: boolean;
  onClose: () => void;
  preorder: Preorder | null;
  onSave: (data: { status?: PreorderStatus; notes?: string }) => Promise<void>;
  isUpdating?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export function EditPreorderModal({
  opened,
  onClose,
  preorder,
  onSave,
  isUpdating = false,
}: EditPreorderModalProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (opened && preorder) {
      setStatus(preorder.status);
      setNotes(preorder.notes || '');
      setError(null);
      setSuccess(false);
    }
  }, [opened, preorder]);

  const handleSave = async () => {
    if (!preorder || !status) return;

    setError(null);
    try {
      await onSave({
        status: status as PreorderStatus,
        notes: notes || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  if (!preorder) return null;

  const hasChanges = status !== preorder.status || notes !== (preorder.notes || '');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon size={32} radius="xl" color="magenta" variant="light">
            <IconEdit size={20} />
          </ThemeIcon>
          <div>
            <Text size="lg" fw={700} c="dark.9">
              Editar Preorden
            </Text>
            <Text size="sm" c="dimmed">
              {preorder.voucherNumber}
            </Text>
          </div>
        </Group>
      }
      size="md"
      centered
    >
      <Stack gap="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
            {error}
          </Alert>
        )}

        {success && (
          <Alert icon={<IconCheck size={16} />} color="green" title="Guardado">
            Los cambios se han guardado correctamente
          </Alert>
        )}

        {!success && (
          <>
            <Select
              label="Estado"
              placeholder="Seleccionar estado"
              data={STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
              required
              styles={{
                input: { color: 'var(--mantine-color-dark-7)' },
                option: { color: 'var(--mantine-color-dark-7)' },
              }}
            />

            <Textarea
              label="Notas"
              placeholder="Observaciones adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />

            <Group justify="flex-end" gap="sm" mt="md">
              <Button variant="subtle" color="gray" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                color="magenta"
                onClick={handleSave}
                loading={isUpdating}
                disabled={!hasChanges}
              >
                Guardar Cambios
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
