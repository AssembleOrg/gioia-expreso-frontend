'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader, Select } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconAddressBook } from '@tabler/icons-react';
import { AgendaClient, type Cliente, type Destinatario } from '@/infrastructure/api/agenda-client';

type Props =
  | { tipo: 'cliente'; onElegir: (c: Cliente) => void; label?: string }
  | { tipo: 'destinatario'; onElegir: (d: Destinatario) => void; label?: string };

/**
 * Buscador de la agenda: escribís nombre, email, DNI o teléfono y elegís
 * uno guardado; el formulario se completa con sus datos.
 */
export function AgendaSelect(props: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [q] = useDebouncedValue(busqueda.trim(), 250);
  const [items, setItems] = useState<(Cliente | Destinatario)[]>([]);
  const [cargando, setCargando] = useState(false);
  const [elegido, setElegido] = useState<string | null>(null);
  // Al elegir, Mantine pone la etiqueta como texto de búsqueda: no se busca eso.
  const etiquetaElegida = useRef<string | null>(null);
  const ultimo = useRef(0);

  useEffect(() => {
    if (q.length < 2 || q === etiquetaElegida.current) {
      setItems([]);
      return;
    }
    const n = ++ultimo.current;
    setCargando(true);
    const pedido =
      props.tipo === 'cliente'
        ? AgendaClient.clientes({ search: q, limit: 10 })
        : AgendaClient.destinatarios({ search: q, limit: 10 });
    pedido
      .then((r) => n === ultimo.current && setItems(r.data))
      .catch(() => n === ultimo.current && setItems([]))
      .finally(() => n === ultimo.current && setCargando(false));
  }, [q, props.tipo]);

  const datos = items.map((i) => ({
    value: i.id,
    label:
      props.tipo === 'cliente'
        ? `${i.fullname} · ${(i as Cliente).email}`
        : `${i.fullname}${(i as Destinatario).dni ? ` · DNI ${(i as Destinatario).dni}` : ''}${(i as Destinatario).city ? ` · ${(i as Destinatario).city}` : ''}`,
  }));

  return (
    <Select
      label={props.label ?? (props.tipo === 'cliente' ? 'Elegir de la agenda' : 'Elegir destinatario guardado')}
      placeholder='Buscá por nombre, email, DNI o teléfono'
      leftSection={<IconAddressBook size={16} />}
      rightSection={cargando ? <Loader size='xs' color='magenta' /> : undefined}
      searchable
      clearable
      data={datos}
      value={elegido}
      searchValue={busqueda}
      onSearchChange={setBusqueda}
      filter={({ options }) => options}
      nothingFoundMessage={q.length < 2 ? 'Escribí al menos 2 letras' : cargando ? 'Buscando…' : 'No está en la agenda'}
      onChange={(id) => {
        setElegido(id);
        const item = items.find((i) => i.id === id);
        etiquetaElegida.current = datos.find((d) => d.value === id)?.label ?? null;
        if (!item) return;
        if (props.tipo === 'cliente') props.onElegir(item as Cliente);
        else props.onElegir(item as Destinatario);
      }}
      comboboxProps={{ shadow: 'md' }}
      styles={{
        option: { color: 'var(--mantine-color-dark-9)' },
        empty: { color: 'var(--mantine-color-dark-6)' },
      }}
    />
  );
}
