'use client';

import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Group, Loader, Pagination, Paper, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconHistory, IconRoute } from '@tabler/icons-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/shared/constants/api';

interface Pedido {
  id: string;
  voucherNumber: string;
  origin: string;
  destination: string;
  price: number;
  status: string;
  createdAt: string;
  packages: { quantity: number }[];
}

const ESTADO: Record<string, { label: string; color: string }> = {
  CREATED: { label: 'En revisión', color: 'orange' },
  PENDING: { label: 'Aprobado', color: 'yellow' },
  CONFIRMED: { label: 'Confirmado', color: 'magenta' },
  COMPLETED: { label: 'Entregado', color: 'green' },
  CANCELLED: { label: 'Cancelado', color: 'red' },
};
const POR_PAGINA = 10;

/**
 * Historial de la cuenta: los pedidos hechos con el mismo email con el que
 * se registró (GET /voucher/mis-pedidos).
 */
export function HistorialPedidos() {
  const [pagina, setPagina] = useState(1);
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    fetch(`${API_BASE_URL}/voucher/mis-pedidos?page=${pagina}&limit=${POR_PAGINA}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        const j = await r.json().catch(() => null);
        if (!r.ok) throw new Error(j?.message || 'No se pudo cargar tu historial');
        if (!vigente) return;
        setPedidos(j?.data ?? []);
        setTotal(j?.meta?.total ?? 0);
        setError(null);
      })
      .catch((e) => vigente && setError(e instanceof Error ? e.message : 'No se pudo cargar tu historial'));
    return () => {
      vigente = false;
    };
  }, [pagina]);

  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <Paper shadow='xs' p='lg' withBorder>
      <Stack gap='md'>
        <Group gap='sm'>
          <IconHistory size={22} color='var(--mantine-color-magenta-8)' />
          <Title order={4} c='dark.9'>
            Tu historial
          </Title>
          {total > 0 && (
            <Text size='sm' c='dark.6'>
              {total} pedido{total === 1 ? '' : 's'}
            </Text>
          )}
        </Group>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color='red'>
            {error}
          </Alert>
        )}

        {pedidos === null && !error && (
          <Group justify='center' py='md'>
            <Loader size='sm' color='magenta' />
          </Group>
        )}

        {pedidos?.length === 0 && (
          <Text size='sm' c='dark.7'>
            Todavía no hay pedidos con el email de tu cuenta. Si hiciste un envío con otro email, buscalo abajo por su número.
          </Text>
        )}

        {pedidos?.map((p) => {
          const estado = ESTADO[p.status] ?? { label: p.status, color: 'gray' };
          const bultos = p.packages.reduce((n, x) => n + (x.quantity || 0), 0);
          return (
            <Paper key={p.id} withBorder radius='md' p='md'>
              <Group justify='space-between' align='flex-start' wrap='wrap' gap='sm'>
                <div>
                  <Group gap='xs'>
                    <Text fw={700} c='magenta.8'>
                      {p.voucherNumber}
                    </Text>
                    <Badge color={estado.color} variant='light' tt='none'>
                      {estado.label}
                    </Badge>
                  </Group>
                  <Text size='sm' c='dark.8' mt={4}>
                    {p.origin} → {p.destination}
                  </Text>
                  <Text size='xs' c='dark.6'>
                    {new Date(p.createdAt).toLocaleDateString('es-AR')} · {bultos} bulto{bultos === 1 ? '' : 's'}
                  </Text>
                </div>
                <Button
                  component={Link}
                  href={`/seguimiento/${p.id}`}
                  variant='light'
                  color='magenta'
                  size='xs'
                  leftSection={<IconRoute size={14} />}
                >
                  Ver seguimiento
                </Button>
              </Group>
            </Paper>
          );
        })}

        {paginas > 1 && (
          <Group justify='center'>
            <Pagination value={pagina} onChange={setPagina} total={paginas} color='magenta' size='sm' />
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
