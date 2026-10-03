'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Container,
  Group,
  Modal,
  Pagination,
  Paper,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconAddressBook, IconAlertTriangle, IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { AppHeader } from '@/presentation/components/AppHeader';
import { Breadcrumb } from '@/presentation/components/Breadcrumb';
import { AgendaClient, type Cliente, type Destinatario, type Pagina } from '@/infrastructure/api/agenda-client';
import { ClienteFormModal } from './components/ClienteFormModal';
import { DestinatarioFormModal } from './components/DestinatarioFormModal';

const POR_PAGINA = 20;
type Pestania = 'clientes' | 'destinatarios';

/** Lista paginada con búsqueda (compartida por las dos pestañas). */
function useLista<T>(cargarPagina: (p: { search?: string; page: number; limit: number }) => Promise<Pagina<T>>) {
  const [busqueda, setBusqueda] = useState('');
  const [q] = useDebouncedValue(busqueda.trim(), 300);
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState<Pagina<T> | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      setDatos(await cargarPagina({ search: q || undefined, page: pagina, limit: POR_PAGINA }));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar.');
    } finally {
      setCargando(false);
    }
  }, [cargarPagina, q, pagina]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return {
    busqueda,
    buscar: (v: string) => {
      setBusqueda(v);
      setPagina(1);
    },
    pagina,
    setPagina,
    datos,
    cargando,
    error,
    recargar,
    q,
  };
}

/**
 * Agenda: clientes (quien manda) y destinatarios (quien recibe). Se cargan
 * una vez y después se eligen al crear un envío.
 */
export function Agenda() {
  const [pestania, setPestania] = useState<Pestania>('clientes');
  const clientes = useLista<Cliente>(AgendaClient.clientes);
  const destinatarios = useLista<Destinatario>(AgendaClient.destinatarios);

  const [cliente, setCliente] = useState<Cliente | null | undefined>(undefined);
  const [destinatario, setDestinatario] = useState<Destinatario | null | undefined>(undefined);
  const [borrar, setBorrar] = useState<{ tipo: Pestania; id: string; nombre: string } | null>(null);
  const [borrando, setBorrando] = useState(false);

  async function confirmarBorrado() {
    if (!borrar) return;
    setBorrando(true);
    try {
      if (borrar.tipo === 'clientes') {
        await AgendaClient.borrarCliente(borrar.id);
        await clientes.recargar();
      } else {
        await AgendaClient.borrarDestinatario(borrar.id);
        await destinatarios.recargar();
      }
      notifications.show({ color: 'green', title: 'Borrado', message: borrar.nombre });
      setBorrar(null);
    } catch (e) {
      notifications.show({ color: 'red', title: 'Error', message: e instanceof Error ? e.message : 'No se pudo borrar.' });
    } finally {
      setBorrando(false);
    }
  }

  const lista = pestania === 'clientes' ? clientes : destinatarios;
  const paginas = Math.max(1, lista.datos?.meta.totalPages ?? 1);

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-gray-0)' }}>
      <AppHeader />
      <Container size='xl' px='md' py='lg'>
        <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Agenda' }]} />
        <Stack gap='lg'>
          <Group justify='space-between' align='flex-end' wrap='wrap'>
            <Group gap='sm'>
              <IconAddressBook size={28} color='var(--mantine-color-magenta-6)' />
              <div>
                <Title order={2} c='dark.9'>
                  Agenda
                </Title>
                <Text size='sm' c='dark.7'>
                  Cargá clientes y destinatarios una vez y elegilos al crear un envío.
                </Text>
              </div>
            </Group>
            <Button
              color='magenta'
              leftSection={<IconPlus size={18} />}
              onClick={() => (pestania === 'clientes' ? setCliente(null) : setDestinatario(null))}
            >
              {pestania === 'clientes' ? 'Nuevo cliente' : 'Nuevo destinatario'}
            </Button>
          </Group>

          <Paper shadow='sm' p='md' radius='md' withBorder>
            <Tabs
              value={pestania}
              onChange={(v) => v && setPestania(v as Pestania)}
              color='magenta'
              styles={{ tab: { color: 'var(--mantine-color-dark-7)' } }}
            >
              <Tabs.List mb='md'>
                <Tabs.Tab value='clientes'>Clientes{clientes.datos ? ` · ${clientes.datos.meta.total}` : ''}</Tabs.Tab>
                <Tabs.Tab value='destinatarios'>
                  Destinatarios{destinatarios.datos ? ` · ${destinatarios.datos.meta.total}` : ''}
                </Tabs.Tab>
              </Tabs.List>

              <Stack gap='md'>
                <TextInput
                  placeholder={pestania === 'clientes' ? 'Buscar por nombre, email, teléfono o CUIT' : 'Buscar por nombre, DNI, teléfono o localidad'}
                  leftSection={<IconSearch size={16} />}
                  value={lista.busqueda}
                  onChange={(e) => lista.buscar(e.target.value)}
                  w={{ base: '100%', sm: 360 }}
                  aria-label='Buscar en la agenda'
                />

                {lista.error && (
                  <Alert color='red' icon={<IconAlertTriangle size={18} />}>
                    {lista.error}
                  </Alert>
                )}

                <Tabs.Panel value='clientes'>
                  <Table.ScrollContainer minWidth={720}>
                    <Table verticalSpacing='sm' highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Nombre</Table.Th>
                          <Table.Th>Email</Table.Th>
                          <Table.Th>Teléfono</Table.Th>
                          <Table.Th>CUIT</Table.Th>
                          <Table.Th>Envíos</Table.Th>
                          <Table.Th aria-label='Acciones' />
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {clientes.datos?.data.map((c) => (
                          <Table.Tr key={c.id}>
                            <Table.Td>
                              <Text size='sm' fw={600} c='dark.9'>
                                {c.fullname}
                              </Text>
                              <Text size='xs' c='dark.6'>
                                {c.address}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size='sm' c='dark.8'>{c.email}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size='sm' c='dark.8'>{c.phone}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size='sm' ff='monospace' c='dark.8'>
                                {c.cuit ?? '—'}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size='sm' c='dark.8'>{c._count?.preorders ?? c.quantityVouchers ?? 0}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Acciones onEditar={() => setCliente(c)} onBorrar={() => setBorrar({ tipo: 'clientes', id: c.id, nombre: c.fullname })} nombre={c.fullname} />
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                  <Vacio lista={clientes} texto='Todavía no hay clientes. Se suman solos al crear envíos, o cargalos con "Nuevo cliente".' />
                </Tabs.Panel>

                <Tabs.Panel value='destinatarios'>
                  <Table.ScrollContainer minWidth={720}>
                    <Table verticalSpacing='sm' highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Nombre</Table.Th>
                          <Table.Th>DNI</Table.Th>
                          <Table.Th>Teléfono</Table.Th>
                          <Table.Th>Dirección</Table.Th>
                          <Table.Th aria-label='Acciones' />
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {destinatarios.datos?.data.map((d) => (
                          <Table.Tr key={d.id}>
                            <Table.Td>
                              <Text size='sm' fw={600} c='dark.9'>
                                {d.fullname}
                              </Text>
                              {d.email && (
                                <Text size='xs' c='dark.6'>
                                  {d.email}
                                </Text>
                              )}
                            </Table.Td>
                            <Table.Td>
                              <Text size='sm' c='dark.8'>{d.dni ?? '—'}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size='sm' c='dark.8'>{d.phone ?? '—'}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size='sm' c='dark.8'>{d.address}</Text>
                              <Text size='xs' c='dark.6'>
                                {[d.city, d.province, d.postalCode].filter(Boolean).join(' · ')}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Acciones
                                onEditar={() => setDestinatario(d)}
                                onBorrar={() => setBorrar({ tipo: 'destinatarios', id: d.id, nombre: d.fullname })}
                                nombre={d.fullname}
                              />
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                  <Vacio lista={destinatarios} texto='Todavía no hay destinatarios. Cargalos con "Nuevo destinatario" o desde el alta de un envío.' />
                </Tabs.Panel>

                {paginas > 1 && (
                  <Group justify='center'>
                    <Pagination value={lista.pagina} onChange={lista.setPagina} total={paginas} color='magenta' />
                  </Group>
                )}
              </Stack>
            </Tabs>
          </Paper>
        </Stack>
      </Container>

      <ClienteFormModal
        opened={cliente !== undefined}
        onClose={() => setCliente(undefined)}
        cliente={cliente ?? null}
        onGuardado={() => void clientes.recargar()}
      />
      <DestinatarioFormModal
        opened={destinatario !== undefined}
        onClose={() => setDestinatario(undefined)}
        destinatario={destinatario ?? null}
        onGuardado={() => void destinatarios.recargar()}
      />
      <Modal opened={borrar !== null} onClose={() => setBorrar(null)} title='Borrar de la agenda' centered>
        <Stack gap='md'>
          <Text size='sm' c='dark.8'>
            ¿Borrar a {borrar?.nombre}? Los envíos que ya tiene no se tocan.
          </Text>
          <Group justify='flex-end'>
            <Button variant='default' onClick={() => setBorrar(null)}>
              No, volver
            </Button>
            <Button color='red' loading={borrando} onClick={confirmarBorrado}>
              Borrar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

function Acciones({ onEditar, onBorrar, nombre }: { onEditar: () => void; onBorrar: () => void; nombre: string }) {
  return (
    <Group gap={4} justify='flex-end' wrap='nowrap'>
      <Tooltip label='Editar'>
        <ActionIcon variant='subtle' color='magenta' onClick={onEditar} aria-label={`Editar a ${nombre}`}>
          <IconEdit size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label='Borrar'>
        <ActionIcon variant='subtle' color='red' onClick={onBorrar} aria-label={`Borrar a ${nombre}`}>
          <IconTrash size={18} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}

function Vacio({ lista, texto }: { lista: { datos: Pagina<unknown> | null; error: string | null; q: string }; texto: string }) {
  if (!lista.datos || lista.error || lista.datos.data.length > 0) return null;
  return (
    <Text c='dark.7' ta='center' py='lg'>
      {lista.q ? 'No hay resultados con esa búsqueda.' : texto}
    </Text>
  );
}
