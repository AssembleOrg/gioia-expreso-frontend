'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Grid,
  Group,
  Paper,
  Select,
  Stack,
  Stepper,
  Text,
  ThemeIcon,
  Timeline,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconAlertTriangle,
  IconBan,
  IconBrandWhatsapp,
  IconBuildingWarehouse,
  IconCalendarEvent,
  IconCircleCheck,
  IconEdit,
  IconMapPin,
  IconPackage,
  IconPackages,
  IconPhone,
  IconRefresh,
  IconTruckDelivery,
} from '@tabler/icons-react';
import { useAuthStore } from '@/application/stores/auth-store';
import { avisarSeguimiento } from '@/infrastructure/rumbo/rumbo-sync';
import type { RumboStatus, RumboTracking } from '@/infrastructure/rumbo/types';
import css from './RumboTracking.module.css';

/** Estados en los que el envío se está moviendo hacia el paso siguiente. */
const EN_MARCHA = new Set<RumboStatus>(['EN_PREPARACION', 'EN_DISTRIBUCION']);

/** Lo que muestra Gioia de su propia preorden (ruta y número de guía). */
export interface PreordenPublica {
  id: string;
  voucherNumber: string;
  origin: string;
  originPostal: string;
  destination: string;
  destinationPostal: string;
  status: string;
}

const PASOS: { status: RumboStatus; label: string; icon: typeof IconPackage }[] = [
  { status: 'EN_DEPOSITO', label: 'En depósito', icon: IconBuildingWarehouse },
  { status: 'EN_PREPARACION', label: 'Preparando', icon: IconPackages },
  { status: 'EN_DISTRIBUCION', label: 'En camino', icon: IconTruckDelivery },
  { status: 'ENTREGADO', label: 'Entregado', icon: IconCircleCheck },
];

const ICONO: Record<RumboStatus, typeof IconPackage> = {
  EN_DEPOSITO: IconBuildingWarehouse,
  EN_PREPARACION: IconPackages,
  EN_DISTRIBUCION: IconTruckDelivery,
  ENTREGADO: IconCircleCheck,
  NO_ENTREGADO: IconAlertTriangle,
  CANCELADO: IconBan,
};

const COLOR: Record<RumboStatus, string> = {
  EN_DEPOSITO: 'magenta',
  EN_PREPARACION: 'magenta',
  EN_DISTRIBUCION: 'magenta',
  ENTREGADO: 'green',
  NO_ENTREGADO: 'orange',
  CANCELADO: 'gray',
};

const OPCIONES_ADMIN = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'COMPLETED', label: 'Completado (entregado)' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const TZ = 'America/Argentina/Buenos_Aires';

function fecha(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TZ,
  })
    .format(new Date(iso))
    .replace(/\./g, '');
}

function llega(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

/** Pasos completos (el actual cuenta como hecho, así se ve lleno). */
function pasoActivo(status: RumboStatus): number {
  if (status === 'ENTREGADO') return 4;
  if (status === 'NO_ENTREGADO') return 2;
  if (status === 'CANCELADO') return 0;
  return PASOS.findIndex((p) => p.status === status) + 1;
}

/**
 * Seguimiento público de Gioia. Los estados, el recorrido y el QR vienen de
 * Rumbo; la ruta y el número de guía, de la preorden de Gioia. Se actualiza
 * solo cada minuto.
 */
export function RumboTrackingPage({ tracking: t, preorden }: { tracking: RumboTracking; preorden: PreordenPublica | null }) {
  const router = useRouter();
  const { isAuthenticated, accessToken, user } = useAuthStore();
  const esAdmin = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUBADMIN');
  const [editando, setEditando] = useState(false);
  const [nuevo, setNuevo] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  // En el celular, sólo íconos: el estado ya está escrito en grande arriba.
  const angosto = useMediaQuery('(max-width: 36em)');

  const refresco = useRef<number | null>(null);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh();
    }, 60_000);
    return () => {
      window.clearInterval(id);
      if (refresco.current) window.clearTimeout(refresco.current);
    };
  }, [router]);

  const Icono = ICONO[t.status];
  const activo = pasoActivo(t.status);
  const recorrido = [...t.events].reverse();

  // Paso nuevo que trajo una actualización (cada minuto o "Actualizar"): se
  // marca al llegar. Al abrir la página no se marca nada.
  const claveUltimo = recorrido[0] ? `${recorrido[0].occurredAt}-${recorrido[0].status}` : '';
  const [ultimoVisto, setUltimoVisto] = useState(claveUltimo);
  const [recien, setRecien] = useState<string | null>(null);
  if (claveUltimo !== ultimoVisto) {
    setUltimoVisto(claveUltimo);
    setRecien(claveUltimo);
  }
  const guia = preorden?.voucherNumber ?? t.itemsSummary?.match(/Guía\s+(\S+)/)?.[1] ?? t.codeDisplay;

  async function guardarEstado() {
    if (!nuevo || !accessToken || !preorden) return;
    setGuardando(true);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher/preorders/${preorden.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ status: nuevo }),
      });
      if (!r.ok) throw new Error();
      avisarSeguimiento({ preorderIds: [preorden.id] });
      notifications.show({ color: 'green', title: 'Estado actualizado', message: 'El seguimiento se actualiza en unos segundos.' });
      setEditando(false);
      refresco.current = window.setTimeout(() => router.refresh(), 2500);
    } catch {
      notifications.show({ color: 'red', title: 'Error', message: 'No se pudo actualizar el estado.' });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Box py='xl' style={{ minHeight: '70vh' }}>
      <Container size='lg'>
        <Grid gutter='xl' align='flex-start'>
          <Grid.Col span={{ base: 12, md: 4 }} visibleFrom='md'>
            <Center>
              <Image src='/gioia.webp' alt='Transportes Gioia' width={260} height={260} style={{ objectFit: 'contain' }} />
            </Center>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap='lg'>
              {/* Estado */}
              <Paper shadow='sm' p='lg' radius='md' withBorder>
                <Stack gap='md'>
                  <Group justify='space-between' align='flex-start' wrap='nowrap'>
                    <div>
                      <Text size='xs' c='dark.7' tt='uppercase' fw={600} lts={0.5}>
                        Seguimiento de envío
                      </Text>
                      <Text size='sm' c='dark.7'>
                        Guía{' '}
                        <Text span fw={700} c='magenta'>
                          {guia}
                        </Text>
                      </Text>
                    </div>
                    {esAdmin && preorden && !editando && (
                      <Button
                        size='xs'
                        variant='subtle'
                        color='gray'
                        leftSection={<IconEdit size={14} />}
                        onClick={() => {
                          setEditando(true);
                          setNuevo(preorden.status);
                        }}
                      >
                        Editar
                      </Button>
                    )}
                  </Group>

                  {editando && (
                    <Group gap='xs'>
                      <Select
                        size='xs'
                        data={OPCIONES_ADMIN}
                        value={nuevo}
                        onChange={setNuevo}
                        style={{ width: 210 }}
                        aria-label='Nuevo estado'
                      />
                      <Button size='xs' color='magenta' loading={guardando} disabled={!nuevo} onClick={guardarEstado}>
                        Guardar
                      </Button>
                      <Button size='xs' variant='subtle' color='gray' onClick={() => setEditando(false)}>
                        Cancelar
                      </Button>
                    </Group>
                  )}

                  {/* key = estado: si cambia, el ícono vuelve a llegar. */}
                  <Group key={t.status} gap='md' wrap='nowrap' align='center'>
                    <ThemeIcon size={64} radius='md' color={COLOR[t.status]} variant='light' className={css.llega}>
                      <Icono size={36} stroke={1.6} />
                    </ThemeIcon>
                    <div className={css.llegaTexto}>
                      <Title order={1} size='h2' fw={900} c={t.status === 'CANCELADO' ? 'dark.4' : 'dark.9'} lh={1.1}>
                        {t.headline}
                      </Title>
                      <Text size='sm' c='dark.7' mt={4}>
                        {t.detail}
                      </Text>
                    </div>
                  </Group>

                  {t.next && (
                    <Text size='sm' c='dark.8'>
                      <Text span fw={600}>
                        Lo que sigue:
                      </Text>{' '}
                      {t.next}
                    </Text>
                  )}

                  {t.estimatedDelivery && t.status !== 'ENTREGADO' && t.status !== 'CANCELADO' && (
                    <Badge size='lg' color='magenta' variant='light' leftSection={<IconCalendarEvent size={14} />} tt='none'>
                      Llega el {llega(t.estimatedDelivery)}
                    </Badge>
                  )}

                  {t.status === 'NO_ENTREGADO' && (
                    <Alert color='orange' icon={<IconAlertTriangle size={18} />}>
                      Si no vas a estar, escribinos y coordinamos otra visita.
                    </Alert>
                  )}

                  {t.status !== 'CANCELADO' && (
                    <Stepper
                      active={activo}
                      color='magenta'
                      size='sm'
                      iconSize={36}
                      allowNextStepsSelect={false}
                      mt='xs'
                      className={EN_MARCHA.has(t.status) ? css.enMarcha : undefined}
                      classNames={{ step: css.paso, stepIcon: css.icono }}
                      styles={{ stepLabel: { fontSize: 12, fontWeight: 600, color: 'var(--mantine-color-dark-7)' } }}
                    >
                      {PASOS.map((p) => (
                        <Stepper.Step
                          key={p.status}
                          label={angosto ? undefined : p.label}
                          aria-label={p.label}
                          icon={<p.icon size={18} />}
                          completedIcon={<p.icon size={18} />}
                        />
                      ))}
                    </Stepper>
                  )}
                </Stack>
              </Paper>

              {/* Ruta y paquete */}
              <Paper shadow='sm' p='lg' radius='md' withBorder>
                <Stack gap='sm'>
                  <Group gap='xs'>
                    <IconMapPin size={16} color='var(--mantine-color-magenta-8)' />
                    <Text size='sm' fw={600} c='dark.9'>
                      Ruta
                    </Text>
                  </Group>
                  <Group justify='space-between' align='flex-start' wrap='nowrap' gap='md'>
                    <div style={{ minWidth: 0 }}>
                      <Text size='xs' fw={600} c='dark.7'>
                        Origen
                      </Text>
                      <Text size='sm' fw={500} c='dark.9'>
                        {preorden?.origin ?? '—'}
                      </Text>
                    </div>
                    <IconTruckDelivery size={22} color='var(--mantine-color-magenta-8)' style={{ flexShrink: 0, marginTop: 12 }} />
                    <div style={{ minWidth: 0, textAlign: 'right' }}>
                      <Text size='xs' fw={600} c='dark.7'>
                        Destino
                      </Text>
                      <Text size='sm' fw={500} c='dark.9'>
                        {preorden?.destination ?? t.destination}
                      </Text>
                    </div>
                  </Group>
                  <Divider my='xs' />
                  <Group gap='xl'>
                    <div>
                      <Text size='xs' fw={600} c='dark.7'>
                        Para
                      </Text>
                      <Text size='sm' c='dark.9'>
                        {t.recipient}
                      </Text>
                    </div>
                    <div>
                      <Text size='xs' fw={600} c='dark.7'>
                        Bultos
                      </Text>
                      <Text size='sm' c='dark.9'>
                        {t.packages}
                      </Text>
                    </div>
                    {t.deliveredTo && (
                      <div>
                        <Text size='xs' fw={600} c='dark.7'>
                          Recibió
                        </Text>
                        <Text size='sm' c='dark.9'>
                          {t.deliveredTo}
                        </Text>
                      </div>
                    )}
                  </Group>
                </Stack>
              </Paper>

              {/* Recorrido */}
              <Paper shadow='sm' p='lg' radius='md' withBorder>
                <Group justify='space-between' mb='md'>
                  <Group gap='xs'>
                    <IconPackage size={16} color='var(--mantine-color-magenta-8)' />
                    <Text size='sm' fw={600} c='dark.9'>
                      Recorrido
                    </Text>
                  </Group>
                  <Button
                    size='compact-xs'
                    variant='subtle'
                    color='gray'
                    leftSection={<IconRefresh size={12} />}
                    onClick={() => router.refresh()}
                  >
                    Actualizar
                  </Button>
                </Group>
                <Timeline active={0} bulletSize={26} lineWidth={2} color='magenta'>
                  {recorrido.map((e, i) => {
                    const I = ICONO[e.status];
                    return (
                      <Timeline.Item
                        key={`${e.occurredAt}-${i}`}
                        className={i === 0 && recien === claveUltimo ? css.recien : undefined}
                        bullet={<I size={14} />}
                        title={
                          <Text size='sm' fw={i === 0 ? 700 : 500} c={i === 0 ? 'dark.9' : 'dark.7'}>
                            {e.label}
                          </Text>
                        }
                      >
                        {e.note && (
                          <Text size='sm' c='dark.7'>
                            {e.note}
                          </Text>
                        )}
                        <Text size='xs' c='dark.6' mt={2}>
                          {fecha(e.occurredAt)}
                          {e.location ? ` · ${e.location}` : ''}
                        </Text>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              </Paper>

              {/* Contacto */}
              {(t.carrier.whatsapp || t.carrier.phone) && (
                <Paper p='lg' radius='md' bg='magenta.0'>
                  <Text fw={700} c='dark.9'>
                    ¿Tenés alguna consulta sobre tu envío?
                  </Text>
                  <Text size='sm' c='dark.7' mb='sm'>
                    Escribinos con tu número de guía {guia}.
                  </Text>
                  <Group gap='sm'>
                    {t.carrier.whatsapp && (
                      <Button
                        component='a'
                        href={`https://wa.me/${t.carrier.whatsapp}?text=${encodeURIComponent(`Hola, consulto por mi envío, guía ${guia}.`)}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        color='magenta'
                        leftSection={<IconBrandWhatsapp size={18} />}
                      >
                        WhatsApp
                      </Button>
                    )}
                    {t.carrier.phone && (
                      <Button
                        component='a'
                        href={`tel:${t.carrier.phone.replace(/[^\d+]/g, '')}`}
                        variant='outline'
                        color='magenta'
                        leftSection={<IconPhone size={18} />}
                      >
                        Llamar
                      </Button>
                    )}
                  </Group>
                </Paper>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}
