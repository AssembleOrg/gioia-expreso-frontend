'use client';

import { useEffect, useState } from 'react';
import { Button, Group, Modal, Select, SimpleGrid, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { Preorder, PreorderStatus } from '@/domain/dispatch/types';
import { SeguimientoClient } from '@/infrastructure/api/seguimiento-client';

// Entre paréntesis, lo que ve el comprador.
const ESTADOS: { value: PreorderStatus; label: string }[] = [
  { value: 'CREATED', label: 'Creado (En depósito)' },
  { value: 'PENDING', label: 'Pendiente (En depósito)' },
  { value: 'CONFIRMED', label: 'Confirmado (En depósito)' },
  { value: 'COMPLETED', label: 'Completado (Entregado)' },
  { value: 'CANCELLED', label: 'Cancelado (Cancelado)' },
];

/** Editar los datos del pedido: estado, ruta y notas. */
export function EditarEnvioModal({
  opened,
  onClose,
  envio,
  onGuardado,
}: {
  opened: boolean;
  onClose: () => void;
  envio: Preorder;
  onGuardado: (e: Preorder) => void;
}) {
  const [f, setF] = useState(() => valores(envio));
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (opened) setF(valores(envio));
  }, [opened, envio]);

  const cambio = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const valido = f.origin.trim() && f.destination.trim() && f.originPostal.trim() && f.destinationPostal.trim();

  async function guardar() {
    setGuardando(true);
    try {
      const e = await SeguimientoClient.editarEnvio(envio.id, {
        status: f.status,
        origin: f.origin.trim(),
        originPostal: f.originPostal.trim(),
        destination: f.destination.trim(),
        destinationPostal: f.destinationPostal.trim(),
        notes: f.notes.trim(),
      });
      notifications.show({ color: 'green', title: 'Envío guardado', message: 'El seguimiento se actualiza en unos segundos.' });
      onGuardado(e);
      onClose();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Error', message: e instanceof Error ? e.message : 'No se pudo guardar.' });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title={`Editar envío · ${envio.voucherNumber}`} size='lg' centered>
      <Stack gap='md'>
        <Select
          label='Estado'
          data={ESTADOS}
          value={f.status}
          onChange={(v) => v && cambio('status', v as PreorderStatus)}
          allowDeselect={false}
          comboboxProps={{ shadow: 'md' }}
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label='Origen' value={f.origin} onChange={(e) => cambio('origin', e.target.value)} required />
          <TextInput label='CP origen' value={f.originPostal} onChange={(e) => cambio('originPostal', e.target.value)} required />
          <TextInput label='Destino' value={f.destination} onChange={(e) => cambio('destination', e.target.value)} required />
          <TextInput label='CP destino' value={f.destinationPostal} onChange={(e) => cambio('destinationPostal', e.target.value)} required />
        </SimpleGrid>
        <Textarea
          label='Notas'
          description='Acá van el destinatario y la sucursal ("Destinatario: … - DNI: … - Tel: …"). El seguimiento los toma de estas notas.'
          value={f.notes}
          onChange={(e) => cambio('notes', e.target.value)}
          autosize
          minRows={3}
        />
        <Text size='xs' c='dark.6'>
          Los repartos se manejan en Repartos o con el escáner; acá no se cambian.
        </Text>
        <Group justify='flex-end'>
          <Button variant='default' onClick={onClose}>
            Cancelar
          </Button>
          <Button color='magenta' onClick={guardar} loading={guardando} disabled={!valido}>
            Guardar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function valores(e: Preorder) {
  return {
    status: e.status,
    origin: e.origin ?? '',
    originPostal: e.originPostal ?? '',
    destination: e.destination ?? '',
    destinationPostal: e.destinationPostal ?? '',
    notes: e.notes ?? '',
  };
}
