'use client';

import { useState } from 'react';
import { Modal, Stack, Text, Group, Button, Divider, Box, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconDownload, IconQrcode, IconFileInvoice, IconArrowRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/application/stores/auth-store';

interface PreorderSuccessModalProps {
  opened: boolean;
  preorderId: string;
  voucherNumber: string;
  onClose: () => void;
  cotizacion: any;
  paquetes: any[];
  remitente: any;
  destinatario: any;
}

export function PreorderSuccessModal({
  opened,
  preorderId,
  voucherNumber,
  onClose,
  cotizacion,
  paquetes,
  remitente,
  destinatario,
}: PreorderSuccessModalProps) {
  const router = useRouter();
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadComprobante = async () => {
    if (!preorderId) {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'ID de preorden no disponible',
      });
      return;
    }

    try {
      setDownloading('comprobante');
      const token = useAuthStore.getState().accessToken;

      if (!token) {
        notifications.show({
          color: 'red',
          title: 'Error',
          message: 'No estás autenticado',
        });
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/voucher/preorders/${preorderId}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprobante-${preorderId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: err instanceof Error ? err.message : 'No se pudo descargar el comprobante',
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadEtiqueta = async () => {
    if (!preorderId) {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'ID de preorden no disponible',
      });
      return;
    }

    try {
      setDownloading('etiqueta');
      // URL de tracking en el mismo frontend
      const trackingUrl = `${window.location.origin}/tracking/${preorderId}`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/qr/generate/image`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: trackingUrl,
            type: 'url',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `etiqueta-${preorderId}.png`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: err instanceof Error ? err.message : 'No se pudo descargar la etiqueta QR',
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleClose = () => {
    onClose();
    router.push('/dashboard');
  };

  const pesoTotal = paquetes?.reduce((sum, p) => sum + p.peso, 0) || 0;
  const valorTotal = paquetes?.reduce((sum, p) => sum + p.valor_declarado, 0) || 0;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={null}
      size="sm"
      centered
      withCloseButton={false}
    >
      <Stack gap="md">
        {/* Header */}
        <Box ta="center" py="xs">
          <Box
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'var(--mantine-color-green-1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <IconCheck size={24} color="var(--mantine-color-green-6)" />
          </Box>
          <Text size="lg" fw={600} c="dark.9">Envío Creado</Text>
          <Text size="sm" fw={600} c="magenta" mt={4}>
            {voucherNumber}
          </Text>
        </Box>

        <Divider />

        {/* Info compacta */}
        <Stack gap={6}>
          <Group justify="space-between">
            <Text size="xs" c="magenta.8" fw={500}>Origen</Text>
            <Text size="sm" fw={500}>{cotizacion?.origen?.nombre || '—'}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="xs" c="magenta.8" fw={500}>Destino</Text>
            <Text size="sm" fw={500}>{cotizacion?.destino?.nombre || '—'}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="xs" c="magenta.8" fw={500}>Servicio</Text>
            <Text size="sm" fw={500}>{cotizacion?.servicio || '—'}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="xs" c="magenta.8" fw={500}>Resumen</Text>
            <Text size="sm" fw={500}>
              {paquetes?.length || 0} bultos · {pesoTotal.toFixed(1)}kg · ${valorTotal.toLocaleString('es-AR')}
            </Text>
          </Group>
        </Stack>

        <Divider />

        {/* Botones de descarga - misma fila */}
        <Group grow gap="xs">
          <Button
            variant="light"
            color="gray"
            size="sm"
            leftSection={<IconDownload size={16} />}
            onClick={handleDownloadComprobante}
            loading={downloading === 'comprobante'}
          >
            Comprobante
          </Button>
          <Button
            variant="light"
            color="gray"
            size="sm"
            leftSection={<IconQrcode size={16} />}
            onClick={handleDownloadEtiqueta}
            loading={downloading === 'etiqueta'}
          >
            Etiqueta QR
          </Button>
        </Group>

        {/* Factura - disabled */}
        <Tooltip label="Próximamente" position="bottom">
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconFileInvoice size={16} />}
            disabled
            fullWidth
          >
            Factura Electrónica
          </Button>
        </Tooltip>

        {/* Cerrar */}
        <Button
          color="magenta"
          size="sm"
          rightSection={<IconArrowRight size={16} />}
          onClick={handleClose}
          fullWidth
        >
          Ir al Dashboard
        </Button>
      </Stack>
    </Modal>
  );
}
