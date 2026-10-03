'use client';

import { ActionIcon, Badge, Button, Group, Modal, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconX } from '@tabler/icons-react';
import { Scanner, type IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/application/stores/auth-store';
import type { Container } from '@/domain/dispatch/types';
import type { PreorderStatus } from '@/domain/voucher/types';
import { RepartosClient } from '@/infrastructure/api/repartos-client';
import { VoucherClient } from '@/infrastructure/api/voucher-client';
import css from './SeguimientoScanner.module.css';

// Fuera del componente: el Scanner reinicia la cámara si cambian estas props.
const FORMATS: ['qr_code'] = ['qr_code'];
const COMPONENTS = { onOff: true, torch: true };
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** Acción especial: sumar los paquetes a un reparto en carga. */
const A_REPARTO = 'REPARTO';
type Accion = PreorderStatus | typeof A_REPARTO;

// Entre paréntesis, lo que ve el comprador en el seguimiento.
const ACCIONES: { value: Accion; label: string }[] = [
  { value: 'CONFIRMED', label: 'Confirmar recepción (En depósito)' },
  { value: A_REPARTO, label: 'Agregar a un reparto (En preparación)' },
  { value: 'COMPLETED', label: 'Marcar como entregado (Entregado)' },
  { value: 'PENDING', label: 'Volver a pendiente (En depósito)' },
  { value: 'CANCELLED', label: 'Cancelar (Cancelado)' },
];
const ETIQUETA = Object.fromEntries(ACCIONES.map((a) => [a.value, a.label.replace(/ \(.*\)$/, '').toLowerCase()]));

interface Leido {
  id: string;
  /** Lo que se muestra: el código de Rumbo si lo hay, si no el id corto. */
  rotulo: string;
}

/**
 * Escáner de la sección Seguimiento. Lee el QR de Rumbo (link con el id de
 * la preorden o código de seguimiento) y aplica la acción en Gioia; el
 * backend le avisa a Rumbo solo. Independiente del escáner de Paquetes.
 */
export function SeguimientoScanner({
  opened,
  onClose,
  onDone,
}: {
  opened: boolean;
  onClose: () => void;
  /** Después de aplicar una acción (para refrescar la lista). */
  onDone: () => void;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [leidos, setLeidos] = useState<Leido[]>([]);
  const [accion, setAccion] = useState<Accion | null>(null);
  const [repartos, setRepartos] = useState<Container[]>([]);
  const [repartoId, setRepartoId] = useState<string | null>(null);
  const [cargandoRepartos, setCargandoRepartos] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [manual, setManual] = useState('');
  // Cada lectura monta de nuevo el acuse del visor; el número es la key.
  const [acuse, setAcuse] = useState<{ n: number; ok: boolean }>({ n: 0, ok: true });
  const leidosRef = useRef(leidos);
  const pausado = useRef(false);
  const pausa = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Un solo AudioContext para todos los bips.
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => {
    leidosRef.current = leidos;
  }, [leidos]);

  useEffect(
    () => () => {
      if (pausa.current) clearTimeout(pausa.current);
      void audio.current?.close().catch(() => undefined);
      audio.current = null;
    },
    [],
  );

  // Repartos en carga: los únicos que aceptan paquetes nuevos.
  useEffect(() => {
    if (!opened || accion !== A_REPARTO) return;
    let vigente = true;
    setCargandoRepartos(true);
    RepartosClient.getContainersPaginated({ status: 'ON_LOAD', limit: 100 })
      .then((r) => {
        if (!vigente) return;
        setRepartos(r.data);
        if (r.data.length === 1) setRepartoId(r.data[0].id);
      })
      .catch(() => vigente && setRepartos([]))
      .finally(() => vigente && setCargandoRepartos(false));
    return () => {
      vigente = false;
    };
  }, [opened, accion]);

  function bip() {
    try {
      const Ctor =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audio.current ??= new Ctor();
      const ctx = audio.current;
      if (ctx.state === 'suspended') void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Sin audio queda el aviso escrito.
    }
  }

  /** Texto del QR → id de la preorden: directo si trae el id, si no se le pregunta a Rumbo. */
  async function resolver(texto: string): Promise<Leido | null> {
    const id = texto.match(UUID)?.[0];
    if (id) return { id, rotulo: id.slice(0, 8) };
    const r = await fetch('/api/rumbo/escaneo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ texto }),
    });
    const j = await r.json().catch(() => null);
    if (!j?.ok || !j.data?.preorderId) throw new Error(j?.error ?? 'Ese código no es de un envío de Gioia.');
    return { id: j.data.preorderId, rotulo: j.data.code };
  }

  async function sumar(texto: string) {
    try {
      const l = await resolver(texto);
      if (!l) return;
      if (leidosRef.current.some((x) => x.id === l.id)) return;
      setLeidos((xs) => [...xs, l]);
      setAcuse((a) => ({ n: a.n + 1, ok: true }));
      bip();
    } catch (e) {
      setAcuse((a) => ({ n: a.n + 1, ok: false }));
      notifications.show({
        title: 'Código inválido',
        message: e instanceof Error ? e.message : 'No es un envío de Gioia.',
        color: 'red',
        autoClose: 2500,
      });
    }
  }

  const sumarRef = useRef(sumar);
  useEffect(() => {
    sumarRef.current = sumar;
  });
  // onScan estable: el Scanner no reinicia la cámara en cada render.
  const onScan = useCallback((codes: IDetectedBarcode[]) => {
    const texto = codes[0]?.rawValue?.trim();
    if (!texto || pausado.current) return;
    pausado.current = true;
    pausa.current = setTimeout(() => {
      pausado.current = false;
    }, 1500);
    void sumarRef.current(texto);
  }, []);

  async function procesar() {
    if (!accion || leidos.length === 0) return;
    if (accion === A_REPARTO && !repartoId) return;
    setProcesando(true);
    const ids = leidos.map((l) => l.id);
    const n = ids.length;
    try {
      if (accion === A_REPARTO) {
        await RepartosClient.addPreordersToContainer(repartoId!, ids);
        const r = repartos.find((x) => x.id === repartoId);
        notifications.show({
          title: 'Agregados al reparto',
          message: `${n} paquete${n === 1 ? '' : 's'} en ${r?.code ?? 'el reparto'}`,
          color: 'green',
        });
      } else {
        await VoucherClient.bulkUpdateStatus({ ids, status: accion });
        notifications.show({ title: 'Listo', message: `${n} paquete${n === 1 ? '' : 's'}: ${ETIQUETA[accion]}`, color: 'green' });
      }
      setLeidos([]);
      onDone();
      onClose();
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: e instanceof Error && e.message ? e.message : 'No se pudieron actualizar los paquetes',
        color: 'red',
      });
    } finally {
      setProcesando(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title='Escanear para el seguimiento' size='lg'>
      <Stack gap='md'>
        <Text size='sm' c='dark.7'>
          Escaneá el QR de seguimiento de cada paquete. El comprador ve el cambio en unos segundos.
        </Text>

        <div style={{ height: 300, position: 'relative', overflow: 'hidden', borderRadius: 8 }}>
          {opened && <Scanner onScan={onScan} formats={FORMATS} components={COMPONENTS} sound={false} />}
          {acuse.n > 0 && (
            <div key={acuse.n} aria-hidden className={`${css.acuse} ${acuse.ok ? css.leyo : css.fallo}`} />
          )}
        </div>

        <Group align='flex-end'>
          <TextInput
            label='Ingreso manual'
            placeholder='Código de seguimiento o ID'
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            style={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && manual.trim()) {
                void sumar(manual.trim());
                setManual('');
              }
            }}
          />
          <Button
            variant='light'
            color='magenta'
            disabled={!manual.trim()}
            onClick={() => {
              void sumar(manual.trim());
              setManual('');
            }}
            aria-label='Agregar'
          >
            <IconPlus size={16} />
          </Button>
        </Group>

        <Stack gap='xs'>
          <Title order={5}>Escaneados ({leidos.length})</Title>
          <Group gap='xs' style={{ maxHeight: 100, overflowY: 'auto' }}>
            {leidos.map((l) => (
              <Badge
                key={l.id}
                className={css.entra}
                size='lg'
                variant='outline'
                color='magenta'
                rightSection={
                  <ActionIcon
                    size='xs'
                    color='magenta'
                    radius='xl'
                    variant='transparent'
                    aria-label={`Sacar ${l.rotulo}`}
                    onClick={() => setLeidos((xs) => xs.filter((x) => x.id !== l.id))}
                  >
                    <IconX size={10} />
                  </ActionIcon>
                }
              >
                {l.rotulo}
              </Badge>
            ))}
            {leidos.length === 0 && (
              <Text size='xs' c='dark.6'>
                Ningún paquete escaneado aún.
              </Text>
            )}
          </Group>
        </Stack>

        <Select
          label='Acción'
          placeholder='Elegir acción'
          data={ACCIONES}
          value={accion}
          onChange={(v) => setAccion(v as Accion)}
          comboboxProps={{ shadow: 'md' }}
        />

        {accion === A_REPARTO && (
          <Select
            label='Reparto'
            placeholder={
              cargandoRepartos ? 'Cargando repartos…' : repartos.length === 0 ? 'No hay repartos en carga' : 'Elegir reparto en carga'
            }
            data={repartos.map((r) => ({
              value: r.id,
              label: `${r.code} · ${r.origin} → ${r.destination}${r.transport ? ` · ${r.transport.name}` : ''}`,
            }))}
            value={repartoId}
            onChange={setRepartoId}
            disabled={cargandoRepartos || repartos.length === 0}
            description='Cuando el reparto salga, el comprador ve "En camino".'
            comboboxProps={{ shadow: 'md' }}
          />
        )}

        <Group justify='flex-end'>
          <Button variant='default' onClick={() => setLeidos([])} disabled={leidos.length === 0}>
            Limpiar
          </Button>
          <Button
            color='magenta'
            onClick={procesar}
            loading={procesando}
            disabled={!accion || leidos.length === 0 || (accion === A_REPARTO && !repartoId)}
          >
            Aplicar a {leidos.length} paquete{leidos.length === 1 ? '' : 's'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
