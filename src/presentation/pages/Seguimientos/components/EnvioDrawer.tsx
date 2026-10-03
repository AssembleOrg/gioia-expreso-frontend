'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Divider,
  Drawer,
  Group,
  Loader,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconEdit,
  IconExternalLink,
  IconFileDownload,
  IconQrcode,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import type { Preorder, PreorderStatus } from '@/domain/dispatch/types';
import { SeguimientoClient, type ClienteGioia } from '@/infrastructure/api/seguimiento-client';
import { ClienteModal } from './ClienteModal';
import { EditarEnvioModal } from './EditarEnvioModal';

const ESTADO_GIOIA: Record<PreorderStatus, { label: string; color: string }> = {
  CREATED: { label: 'Creado', color: 'magenta' },
  PENDING: { label: 'Pendiente', color: 'yellow' },
  CONFIRMED: { label: 'Confirmado', color: 'magenta' },
  COMPLETED: { label: 'Completado', color: 'green' },
  CANCELLED: { label: 'Cancelado', color: 'red' },
};

const pesos = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);

/** "Destinatario: Ana - DNI: 1 - Tel: 341…" → partes legibles. */
function destinatario(notes: string | null) {
  const m = notes?.match(/Destinatario:\s*([^|]+?)\s*-\s*DNI:\s*([^|]*?)\s*-\s*Tel:\s*([^|]+)/i);
  return m ? { nombre: m[1].trim(), dni: m[2].trim(), tel: m[3].trim() } : null;
}

function Dato({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Text size='xs' fw={600} c='dark.6' tt='uppercase' lts={0.4}>
        {label}
      </Text>
      <Text size='sm' c='dark.9'>
        {children || '—'}
      </Text>
    </div>
  );
}

/**
 * Detalle de un envío desde Seguimiento: pedido, cliente, destinatario,
 * paquetes y acciones (editar, comprobante, QR, eliminar). Edita en Gioia;
 * el seguimiento del comprador se actualiza solo.
 */
export function EnvioDrawer({
  preorderId,
  onClose,
  onCambio,
  onQr,
}: {
  preorderId: string | null;
  onClose: () => void;
  /** Algo cambió (para refrescar la lista). */
  onCambio: () => void;
  onQr: (id: string, guia: string) => void;
}) {
  const [envio, setEnvio] = useState<Preorder | null>(null);
  const [cliente, setCliente] = useState<ClienteGioia | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [editandoCliente, setEditandoCliente] = useState(false);
  const [borrar, setBorrar] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [bajando, setBajando] = useState(false);

  const cargar = useCallback(async (id: string) => {
    setCargando(true);
    setError(null);
    try {
      const e = await SeguimientoClient.envio(id);
      setEnvio(e);
      // El cliente completo (dirección, CUIT); si falla, alcanza con lo que trae el pedido.
      setCliente(
        await SeguimientoClient.cliente(e.clientId).catch(() => ({
          id: e.client.id,
          fullname: e.client.fullname,
          phone: e.client.phone,
          email: e.client.email,
          cuit: null,
          address: '',
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el envío.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!preorderId) {
      setEnvio(null);
      setCliente(null);
      return;
    }
    void cargar(preorderId);
  }, [preorderId, cargar]);

  async function descargar() {
    if (!envio) return;
    setBajando(true);
    try {
      const blob = await SeguimientoClient.comprobante(envio.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprobante-${envio.voucherNumber}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      notifications.show({ color: 'red', title: 'Error', message: e instanceof Error ? e.message : 'No se pudo descargar.' });
    } finally {
      setBajando(false);
    }
  }

  async function eliminar() {
    if (!envio) return;
    setBorrando(true);
    try {
      await SeguimientoClient.eliminarEnvio(envio.id);
      notifications.show({ color: 'green', title: 'Envío eliminado', message: 'En el seguimiento queda como cancelado.' });
      setBorrar(false);
      onCambio();
      onClose();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Error', message: e instanceof Error ? e.message : 'No se pudo eliminar.' });
    } finally {
      setBorrando(false);
    }
  }

  const dest = destinatario(envio?.notes ?? null);
  const bultos = envio?.packages?.reduce((n, p) => n + (p.quantity || 0), 0) ?? 0;

  return (
    <>
      <Drawer
        opened={preorderId !== null}
        onClose={onClose}
        position='right'
        size='lg'
        title={
          <Title order={3} c='dark.9'>
            {envio ? `Envío ${envio.voucherNumber}` : 'Envío'}
          </Title>
        }
      >
        {cargando && !envio && (
          <Group justify='center' py='xl'>
            <Loader color='magenta' />
          </Group>
        )}
        {error && (
          <Alert color='red' icon={<IconAlertTriangle size={18} />}>
            {error}
          </Alert>
        )}

        {envio && (
          <Stack gap='lg'>
            <Group gap='xs' wrap='wrap'>
              <Badge color={ESTADO_GIOIA[envio.status].color} variant='light' size='lg' tt='none'>
                {ESTADO_GIOIA[envio.status].label}
              </Badge>
              <Text size='sm' c='dark.7'>
                Creado el {new Date(envio.createdAt).toLocaleDateString('es-AR')}
              </Text>
            </Group>

            <Group gap='xs' wrap='wrap'>
              <Button color='magenta' leftSection={<IconEdit size={16} />} onClick={() => setEditando(true)}>
                Editar envío
              </Button>
              <Button variant='light' color='magenta' leftSection={<IconFileDownload size={16} />} loading={bajando} onClick={descargar}>
                Comprobante
              </Button>
              <Button variant='light' color='magenta' leftSection={<IconQrcode size={16} />} onClick={() => onQr(envio.id, envio.voucherNumber)}>
                QR
              </Button>
              <Button
                variant='subtle'
                color='gray'
                component='a'
                href={`/seguimiento/${envio.id}`}
                target='_blank'
                leftSection={<IconExternalLink size={16} />}
              >
                Ver como el comprador
              </Button>
            </Group>

            <Paper withBorder radius='md' p='md'>
              <Group justify='space-between' mb='sm'>
                <Group gap='xs'>
                  <IconUser size={18} color='var(--mantine-color-magenta-6)' />
                  <Text fw={700} c='dark.9'>
                    Cliente
                  </Text>
                </Group>
                {cliente && (
                  <Button size='xs' variant='subtle' color='magenta' leftSection={<IconEdit size={14} />} onClick={() => setEditandoCliente(true)}>
                    Editar
                  </Button>
                )}
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing='sm'>
                <Dato label='Nombre'>{cliente?.fullname}</Dato>
                <Dato label='Teléfono'>{cliente?.phone}</Dato>
                <Dato label='Email'>{cliente?.email}</Dato>
                <Dato label='CUIT'>{cliente?.cuit}</Dato>
                <Dato label='Dirección'>{cliente?.address}</Dato>
              </SimpleGrid>
            </Paper>

            <Paper withBorder radius='md' p='md'>
              <Text fw={700} c='dark.9' mb='sm'>
                Destinatario y ruta
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing='sm'>
                <Dato label='Destinatario'>{dest?.nombre}</Dato>
                <Dato label='Teléfono'>{dest?.tel}</Dato>
                <Dato label='DNI'>{dest?.dni}</Dato>
                <Dato label='Precio'>{pesos(envio.price)}</Dato>
                <Dato label='Origen'>{`${envio.origin} (${envio.originPostal})`}</Dato>
                <Dato label='Destino'>{`${envio.destination} (${envio.destinationPostal})`}</Dato>
              </SimpleGrid>
              {envio.notes && (
                <>
                  <Divider my='sm' />
                  <Dato label='Notas'>{envio.notes}</Dato>
                </>
              )}
            </Paper>

            <Paper withBorder radius='md' p='md'>
              <Text fw={700} c='dark.9' mb='sm'>
                Paquetes ({bultos})
              </Text>
              <Table.ScrollContainer minWidth={420}>
                <Table verticalSpacing='xs'>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Tipo</Table.Th>
                      <Table.Th>Cant.</Table.Th>
                      <Table.Th>Peso</Table.Th>
                      <Table.Th>Medidas</Table.Th>
                      <Table.Th>Declarado</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {envio.packages.map((p) => (
                      <Table.Tr key={p.id}>
                        <Table.Td>{p.packageType?.name ?? '—'}</Table.Td>
                        <Table.Td>{p.quantity}</Table.Td>
                        <Table.Td>{p.weight} kg</Table.Td>
                        <Table.Td>{p.height && p.width && p.depth ? `${p.height}×${p.width}×${p.depth} cm` : '—'}</Table.Td>
                        <Table.Td>{pesos(p.declaredValue)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Paper>

            <Group justify='flex-end'>
              <Button variant='subtle' color='red' leftSection={<IconTrash size={16} />} onClick={() => setBorrar(true)}>
                Eliminar envío
              </Button>
            </Group>
          </Stack>
        )}
      </Drawer>

      {envio && (
        <EditarEnvioModal
          opened={editando}
          onClose={() => setEditando(false)}
          envio={envio}
          onGuardado={(e) => {
            setEnvio((x) => (x ? { ...x, ...e, client: x.client, packages: e.packages ?? x.packages } : e));
            onCambio();
          }}
        />
      )}
      {cliente && (
        <ClienteModal
          opened={editandoCliente}
          onClose={() => setEditandoCliente(false)}
          cliente={cliente}
          onGuardado={(c) => {
            setCliente(c);
            onCambio();
          }}
        />
      )}
      <Modal opened={borrar} onClose={() => setBorrar(false)} title='Eliminar envío' centered>
        <Stack gap='md'>
          <Text size='sm' c='dark.8'>
            Se elimina el envío {envio?.voucherNumber} en Gioia. El comprador lo va a ver como cancelado.
          </Text>
          <Group justify='flex-end'>
            <Button variant='default' onClick={() => setBorrar(false)}>
              No, volver
            </Button>
            <Button color='red' loading={borrando} onClick={eliminar}>
              Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
