'use client';

import { useEffect, useState } from 'react';
import { Button, Group, Modal, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AgendaClient, type Cliente } from '@/infrastructure/api/agenda-client';

const CUIT = /^\d{2}-\d{8}-\d$/;
const VACIO = { fullname: '', email: '', phone: '', cuit: '', address: '' };

/** Alta o edición de un cliente (quien manda los envíos). */
export function ClienteFormModal({
  opened,
  onClose,
  cliente,
  onGuardado,
}: {
  opened: boolean;
  onClose: () => void;
  /** null = alta. */
  cliente: Cliente | null;
  onGuardado: (c: Cliente) => void;
}) {
  const [f, setF] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!opened) return;
    setF(
      cliente
        ? { fullname: cliente.fullname, email: cliente.email, phone: cliente.phone, cuit: cliente.cuit ?? '', address: cliente.address ?? '' }
        : VACIO,
    );
  }, [opened, cliente]);

  const cambio = (k: keyof typeof VACIO, v: string) => setF((x) => ({ ...x, [k]: v }));
  const cuitMal = f.cuit.trim() !== '' && !CUIT.test(f.cuit.trim());
  const valido = f.fullname.trim() && f.email.trim() && f.phone.trim() && f.address.trim() && !cuitMal;

  async function guardar() {
    setGuardando(true);
    const datos = {
      fullname: f.fullname.trim(),
      email: f.email.trim(),
      phone: f.phone.trim(),
      address: f.address.trim(),
      ...(f.cuit.trim() ? { cuit: f.cuit.trim() } : {}),
    };
    try {
      const c = cliente ? await AgendaClient.editarCliente(cliente.id, datos) : await AgendaClient.crearCliente(datos);
      notifications.show({ color: 'green', title: cliente ? 'Cliente guardado' : 'Cliente creado', message: c.fullname });
      onGuardado(c);
      onClose();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Error', message: e instanceof Error ? e.message : 'No se pudo guardar.' });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title={cliente ? 'Editar cliente' : 'Nuevo cliente'} size='lg' centered>
      <Stack gap='md'>
        <TextInput label='Nombre o razón social' value={f.fullname} onChange={(e) => cambio('fullname', e.target.value)} required data-autofocus />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label='Email' type='email' value={f.email} onChange={(e) => cambio('email', e.target.value)} required />
          <TextInput label='Teléfono' value={f.phone} onChange={(e) => cambio('phone', e.target.value)} required />
          <TextInput
            label='CUIT'
            placeholder='20-12345678-9'
            value={f.cuit}
            onChange={(e) => cambio('cuit', e.target.value)}
            error={cuitMal ? 'Formato: 20-12345678-9' : undefined}
          />
          <TextInput label='Dirección' value={f.address} onChange={(e) => cambio('address', e.target.value)} required />
        </SimpleGrid>
        <Group justify='flex-end'>
          <Button variant='default' onClick={onClose}>
            Cancelar
          </Button>
          <Button color='magenta' onClick={guardar} loading={guardando} disabled={!valido}>
            {cliente ? 'Guardar' : 'Crear cliente'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
