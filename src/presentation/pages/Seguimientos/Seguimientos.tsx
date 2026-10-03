'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Pagination,
  Paper,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconAlertTriangle,
  IconBrandWhatsapp,
  IconExternalLink,
  IconQrcode,
  IconRefresh,
  IconRoute,
  IconScan,
  IconSearch,
} from '@tabler/icons-react';
import { useAuthStore } from '@/application/stores/auth-store';
import { AppHeader } from '@/presentation/components/AppHeader';
import { Breadcrumb } from '@/presentation/components/Breadcrumb';
import type { RumboListado, RumboShipment, RumboStatus } from '@/infrastructure/rumbo/types';
import { RumboQRModal } from './components/RumboQRModal';
import { SeguimientoScanner } from './components/SeguimientoScanner';
import { EnvioDrawer } from './components/EnvioDrawer';

const POR_PAGINA = 20;

// Cómo lo ve el comprador (En distribución → "En camino").
const ESTADO: Record<RumboStatus, { label: string; color: string }> = {
  EN_DEPOSITO: { label: 'En depósito', color: 'gray' },
  EN_PREPARACION: { label: 'Preparando', color: 'yellow' },
  EN_DISTRIBUCION: { label: 'En camino', color: 'magenta' },
  NO_ENTREGADO: { label: 'No entregado', color: 'orange' },
  ENTREGADO: { label: 'Entregado', color: 'green' },
  CANCELADO: { label: 'Cancelado', color: 'dark' },
};
const FILTROS: (RumboStatus | 'TODOS')[] = ['TODOS', 'EN_DEPOSITO', 'EN_PREPARACION', 'EN_DISTRIBUCION', 'ENTREGADO', 'CANCELADO'];

function guia(s: RumboShipment): string {
  return s.itemsSummary?.match(/Guía\s+(\S+)/)?.[1] ?? '—';
}

function haceCuanto(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

/**
 * Seguimiento con Rumbo: lo que ve cada comprador, su QR y su link. Los
 * estados los lleva el backend solo; acá se miran y se escanean.
 */
export function Seguimientos() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [filtro, setFiltro] = useState<RumboStatus | 'TODOS'>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [q] = useDebouncedValue(busqueda.trim(), 300);
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState<RumboListado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<{ id: string; guia: string } | null>(null);
  const [escaner, setEscaner] = useState(false);
  const [abierto, setAbierto] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!accessToken) return;
    setCargando(true);
    const params = new URLSearchParams({ limit: String(POR_PAGINA), offset: String((pagina - 1) * POR_PAGINA) });
    if (filtro !== 'TODOS') params.set('status', filtro);
    if (q) params.set('q', q);
    try {
      const r = await fetch(`/api/rumbo/envios?${params}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const j = await r.json().catch(() => null);
      if (!j?.ok) throw new Error(j?.error ?? 'No se pudo cargar el seguimiento.');
      setDatos(j.data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el seguimiento.');
    } finally {
      setCargando(false);
    }
  }, [accessToken, filtro, q, pagina]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Los estados cambian solos (el backend avisa a Rumbo): se refresca cada
  // minuto mientras la pestaña está a la vista.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void cargar();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [cargar]);

  const total = datos?.total ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const cuenta = (f: RumboStatus | 'TODOS') =>
    !datos?.counts ? null : f === 'TODOS' ? Object.values(datos.counts).reduce((a, b) => a + b, 0) : datos.counts[f] ?? 0;

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-gray-0)' }}>
      <AppHeader />
      <Container size='xl' px='md' py='lg'>
        <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Seguimiento' }]} />
        <Stack gap='lg'>
          <Group justify='space-between' align='flex-end' wrap='wrap'>
            <Group gap='sm'>
              <IconRoute size={28} color='var(--mantine-color-magenta-6)' />
              <div>
                <Title order={2} c='dark.9'>
                  Seguimiento
                </Title>
                <Text size='sm' c='dark.7'>
                  Lo que ve cada comprador. Tocá un envío para ver y editar el pedido y el cliente; los estados se actualizan solos.
                </Text>
              </div>
            </Group>
            <Group gap='xs'>
              <Tooltip label='Actualizar'>
                <ActionIcon variant='light' color='gray' size='lg' onClick={() => void cargar()} loading={cargando} aria-label='Actualizar'>
                  <IconRefresh size={18} />
                </ActionIcon>
              </Tooltip>
              <Button color='magenta' leftSection={<IconScan size={18} />} onClick={() => setEscaner(true)}>
                Escanear
              </Button>
            </Group>
          </Group>

          <Paper shadow='sm' p='md' radius='md' withBorder>
            <Stack gap='md'>
              <Group justify='space-between' wrap='wrap' gap='sm'>
                <SegmentedControl
                  value={filtro}
                  onChange={(v) => {
                    setFiltro(v as RumboStatus | 'TODOS');
                    setPagina(1);
                  }}
                  color='magenta'
                  data={FILTROS.map((f) => {
                    const n = cuenta(f);
                    const nombre = f === 'TODOS' ? 'Todos' : ESTADO[f].label;
                    return { value: f, label: n === null ? nombre : `${nombre} · ${n}` };
                  })}
                  style={{ maxWidth: '100%', overflowX: 'auto' }}
                />
                <TextInput
                  placeholder='Buscar guía, código o nombre'
                  leftSection={<IconSearch size={16} />}
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPagina(1);
                  }}
                  w={{ base: '100%', sm: 280 }}
                  aria-label='Buscar envíos'
                />
              </Group>

              {error && (
                <Alert color='red' icon={<IconAlertTriangle size={18} />}>
                  {error}
                </Alert>
              )}

              <Table.ScrollContainer minWidth={880}>
                <Table verticalSpacing='sm' highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Guía</Table.Th>
                      <Table.Th>Seguimiento</Table.Th>
                      <Table.Th>Cliente</Table.Th>
                      <Table.Th>Para</Table.Th>
                      <Table.Th>Estado</Table.Th>
                      <Table.Th>Actualizado</Table.Th>
                      <Table.Th aria-label='Acciones' />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {datos?.items.map((s) => {
                      const ref = s.externalRef ?? s.id;
                      return (
                        <Table.Tr key={s.id} onClick={() => setAbierto(ref)} style={{ cursor: 'pointer' }}>
                          <Table.Td>
                            <UnstyledButton
                              onClick={(e) => {
                                e.stopPropagation();
                                setAbierto(ref);
                              }}
                              aria-label={`Ver el detalle de ${guia(s)}`}
                            >
                              <Text fw={700} c='magenta.8' td='underline' style={{ textUnderlineOffset: 3 }}>
                                {guia(s)}
                              </Text>
                            </UnstyledButton>
                          </Table.Td>
                          <Table.Td>
                            <Text ff='monospace' size='sm' c='dark.8' style={{ whiteSpace: 'nowrap' }}>
                              {s.codeDisplay}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size='sm' c='dark.8'>
                              {s.senderName ?? '—'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size='sm' fw={600} c='dark.9'>
                              {s.recipientName}
                            </Text>
                            <Text size='xs' c='dark.6'>
                              {s.city}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={ESTADO[s.status].color} variant='light' tt='none' style={{ overflow: 'visible' }} styles={{ label: { overflow: 'visible' } }}>
                              {ESTADO[s.status].label}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size='sm' c='dark.7' style={{ whiteSpace: 'nowrap' }}>
                              {haceCuanto(s.updatedAt)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap={4} justify='flex-end' wrap='nowrap' onClick={(e) => e.stopPropagation()}>
                              <Tooltip label='QR del seguimiento'>
                                <ActionIcon variant='subtle' color='magenta' onClick={() => setQr({ id: ref, guia: guia(s) })} aria-label={`QR de ${guia(s)}`}>
                                  <IconQrcode size={18} />
                                </ActionIcon>
                              </Tooltip>
                              {s.whatsapp.url && (
                                <Tooltip label='Mandar por WhatsApp'>
                                  <ActionIcon
                                    component='a'
                                    href={s.whatsapp.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    variant='subtle'
                                    color='green'
                                    aria-label={`WhatsApp de ${guia(s)}`}
                                  >
                                    <IconBrandWhatsapp size={18} />
                                  </ActionIcon>
                                </Tooltip>
                              )}
                              <Tooltip label='Ver como el comprador'>
                                <ActionIcon
                                  component='a'
                                  href={`/seguimiento/${ref}`}
                                  target='_blank'
                                  variant='subtle'
                                  color='gray'
                                  aria-label={`Abrir el seguimiento de ${guia(s)}`}
                                >
                                  <IconExternalLink size={18} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>

              {datos && datos.items.length === 0 && !error && (
                <Text c='dark.7' ta='center' py='lg'>
                  {q || filtro !== 'TODOS'
                    ? 'No hay envíos con ese filtro.'
                    : 'Todavía no hay envíos en seguimiento. Aparecen solos cuando se cargan o cambian en Paquetes.'}
                </Text>
              )}

              {paginas > 1 && (
                <Group justify='center'>
                  <Pagination value={pagina} onChange={setPagina} total={paginas} color='magenta' />
                </Group>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>

      <EnvioDrawer
        preorderId={abierto}
        onClose={() => setAbierto(null)}
        onCambio={() => window.setTimeout(() => void cargar(), 3000)}
        onQr={(id, g) => setQr({ id, guia: g })}
      />
      {qr && <RumboQRModal opened onClose={() => setQr(null)} preorderId={qr.id} voucherNumber={qr.guia} />}
      <SeguimientoScanner
        opened={escaner}
        onClose={() => setEscaner(false)}
        onDone={() => {
          // El backend tarda unos segundos en llevar el cambio a Rumbo.
          window.setTimeout(() => void cargar(), 3000);
        }}
      />
    </Box>
  );
}
