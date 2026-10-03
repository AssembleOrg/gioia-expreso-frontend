'use client';

import { useEffect, useState } from 'react';
import { Button, Group, Modal, SimpleGrid, Stack, TextInput, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AgendaClient, type Destinatario } from '@/infrastructure/api/agenda-client';

const VACIO = { fullname: '', dni: '', phone: '', email: '', address: '', city: '', province: '', postalCode: '', notes: '' };
type Campos = typeof VACIO;

/** Alta o edición de un destinatario (quien recibe los envíos). */
export function DestinatarioFormModal({
  opened,
  onClose,
  destinatario,
  onGuardado,
}: {
  opened: boolean;
  onClose: () => void;
  /** null = alta. */
  destinatario: Destinatario | null;
  onGuardado: (d: Destinatario) => void;
}) {
  const [f, setF] = useState<Campos>(VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!opened) return;
    const d = destinatario;
    setF(
      d
        ? {
            fullname: d.fullname,
            dni: d.dni ?? '',
            phone: d.phone ?? '',
            email: d.email ?? '',
            address: d.address,
            city: d.city ?? '',
            province: d.province ?? '',
            postalCode: d.postalCode ?? '',
            notes: d.notes ?? '',
          }
        : VACIO,
    );
  }, [opened, destinatario]);

  const cambio = (k: keyof Campos, v: string) => setF((x) => ({ ...x, [k]: v }));
  const dniMal = f.dni.trim() !== '' && !/^\d{7,9}$/.test(f.dni.trim());
  const valido = f.fullname.trim() && f.address.trim() && !dniMal;

  async function guardar() {
    setGuardando(true);
    // Vacío: en el alta no se manda; al editar va null para borrar el dato
    // (null lo saltea la validación, una cadena vacía no).
    const datos = Object.fromEntries(
      Object.entries(f)
        .map(([k, v]) => [k, v.trim() === '' ? (destinatario ? null : undefined) : v.trim()])
        .filter(([, v]) => v !== undefined),
    ) as unknown as { fullname: string; address: string };
    try {
      const d = destinatario
        ? await AgendaClient.editarDestinatario(destinatario.id, datos)
        : await AgendaClient.crearDestinatario(datos);
      notifications.show({ color: 'green', title: destinatario ? 'Destinatario guardado' : 'Destinatario creado', message: d.fullname });
      onGuardado(d);
      onClose();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Error', message: e instanceof Error ? e.message : 'No se pudo guardar.' });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title={destinatario ? 'Editar destinatario' : 'Nuevo destinatario'} size='lg' centered>
      <Stack gap='md'>
        <TextInput label='Nombre o razón social' value={f.fullname} onChange={(e) => cambio('fullname', e.target.value)} required data-autofocus />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label='DNI'
            value={f.dni}
            onChange={(e) => cambio('dni', e.target.value.replace(/\D/g, ''))}
            error={dniMal ? 'Entre 7 y 9 números' : undefined}
          />
          <TextInput label='Teléfono' value={f.phone} onChange={(e) => cambio('phone', e.target.value)} />
          <TextInput label='Email' type='email' value={f.email} onChange={(e) => cambio('email', e.target.value)} />
          <TextInput label='Código postal' value={f.postalCode} onChange={(e) => cambio('postalCode', e.target.value)} />
        </SimpleGrid>
        <TextInput label='Dirección' value={f.address} onChange={(e) => cambio('address', e.target.value)} required />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label='Localidad' value={f.city} onChange={(e) => cambio('city', e.target.value)} />
          <TextInput label='Provincia' value={f.province} onChange={(e) => cambio('province', e.target.value)} />
        </SimpleGrid>
        <Textarea label='Notas' value={f.notes} onChange={(e) => cambio('notes', e.target.value)} autosize minRows={2} />
        <Group justify='flex-end'>
          <Button variant='default' onClick={onClose}>
            Cancelar
          </Button>
          <Button color='magenta' onClick={guardar} loading={guardando} disabled={!valido}>
            {destinatario ? 'Guardar' : 'Crear destinatario'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
