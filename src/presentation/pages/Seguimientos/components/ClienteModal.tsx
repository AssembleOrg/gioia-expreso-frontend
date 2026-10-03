'use client';

import { useEffect, useState } from 'react';
import { Button, Group, Modal, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { SeguimientoClient, type ClienteGioia } from '@/infrastructure/api/seguimiento-client';

const CUIT = /^\d{2}-\d{8}-\d$/;

/** Editar los datos del cliente (quien manda el envío). */
export function ClienteModal({
  opened,
  onClose,
  cliente,
  onGuardado,
}: {
  opened: boolean;
  onClose: () => void;
  cliente: ClienteGioia;
  onGuardado: (c: ClienteGioia) => void;
}) {
  const [f, setF] = useState(() => valores(cliente));
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (opened) setF(valores(cliente));
  }, [opened, cliente]);

  const cambio = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));
  const cuitMal = f.cuit.trim() !== '' && !CUIT.test(f.cuit.trim());
  const valido = f.fullname.trim() && f.phone.trim() && f.email.trim() && f.address.trim() && !cuitMal;

  async function guardar() {
    setGuardando(true);
    try {
      const c = await SeguimientoClient.editarCliente(cliente.id, {
        fullname: f.fullname.trim(),
        phone: f.phone.trim(),
        email: f.email.trim(),
        address: f.address.trim(),
        ...(f.cuit.trim() ? { cuit: f.cuit.trim() } : {}),
      });
      notifications.show({ color: 'green', title: 'Cliente guardado', message: c.fullname });
      onGuardado(c);
      onClose();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Error', message: e instanceof Error ? e.message : 'No se pudo guardar.' });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title='Editar cliente' size='lg' centered>
      <Stack gap='md'>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label='Nombre' value={f.fullname} onChange={(e) => cambio('fullname', e.target.value)} required />
          <TextInput label='Teléfono' value={f.phone} onChange={(e) => cambio('phone', e.target.value)} required />
          <TextInput label='Email' type='email' value={f.email} onChange={(e) => cambio('email', e.target.value)} required />
          <TextInput
            label='CUIT'
            placeholder='20-12345678-9'
            value={f.cuit}
            onChange={(e) => cambio('cuit', e.target.value)}
            error={cuitMal ? 'Formato: 20-12345678-9' : undefined}
          />
        </SimpleGrid>
        <TextInput label='Dirección' value={f.address} onChange={(e) => cambio('address', e.target.value)} required />
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

function valores(c: ClienteGioia) {
  return { fullname: c.fullname ?? '', phone: c.phone ?? '', email: c.email ?? '', cuit: c.cuit ?? '', address: c.address ?? '' };
}
