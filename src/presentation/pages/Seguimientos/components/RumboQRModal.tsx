'use client';

import { useEffect, useState } from 'react';
import { Modal, Stack, Text, Button, Group, CopyButton, Loader } from '@mantine/core';
import { IconBrandWhatsapp, IconCheck, IconCopy, IconDownload } from '@tabler/icons-react';

interface RumboQRModalProps {
  opened: boolean;
  onClose: () => void;
  preorderId: string;
  voucherNumber: string;
}

interface Seguimiento {
  code: string;
  statusLabel: string;
  trackingUrl: string;
  whatsapp: { message: string; url: string | null };
}

/**
 * QR del envío. Lo genera el seguimiento (Rumbo) y abre
 * transportegioia.com.ar/tracking/…: lo escanea el cliente para ver dónde
 * está su envío y lo lee el escáner de Seguimiento (lleva el id).
 */
export function RumboQRModal({ opened, onClose, preorderId, voucherNumber }: RumboQRModalProps) {
  const qrUrl = `/api/rumbo/qr/${preorderId}`;
  const [seguimiento, setSeguimiento] = useState<Seguimiento | null>(null);
  const [cargando, setCargando] = useState(false);
  const [bajando, setBajando] = useState(false);

  useEffect(() => {
    if (!opened) return;
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    let vivo = true;
    setCargando(true);
    fetch(`/api/rumbo/envio/${preorderId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((j) => vivo && j?.ok && setSeguimiento(j.data))
      .catch(() => {})
      .finally(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, [opened, preorderId]);

  const handleDownload = async () => {
    setBajando(true);
    try {
      const blob = await (await fetch(`${qrUrl}?formato=png`)).blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${voucherNumber}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setBajando(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`QR de seguimiento · ${voucherNumber}`} size='sm' centered>
      <Stack align='center' gap='md'>
        {/* eslint-disable-next-line @next/next/no-img-element -- QR generado al vuelo */}
        <img src={qrUrl} alt={`QR del envío ${voucherNumber}`} style={{ width: 280, height: 280 }} />

        <Text size='sm' c='dark.7' ta='center'>
          Al escanearlo abre el seguimiento del envío. También lo lee el escáner de Seguimiento.
        </Text>

        {cargando ? (
          <Loader size='sm' color='magenta' />
        ) : seguimiento ? (
          <Text size='xs' c='dark.6' ta='center'>
            Estado: <b>{seguimiento.statusLabel}</b> · Código {seguimiento.code}
          </Text>
        ) : null}

        <Stack gap='xs' w='100%'>
          {seguimiento?.whatsapp.url && (
            <Button
              fullWidth
              component='a'
              href={seguimiento.whatsapp.url}
              target='_blank'
              rel='noopener noreferrer'
              color='green'
              leftSection={<IconBrandWhatsapp size={16} />}
            >
              Mandar seguimiento por WhatsApp
            </Button>
          )}
          <Group grow gap='xs'>
            <Button variant='light' leftSection={<IconDownload size={16} />} loading={bajando} onClick={handleDownload}>
              Descargar QR
            </Button>
            {seguimiento && (
              <CopyButton value={seguimiento.trackingUrl}>
                {({ copied, copy }) => (
                  <Button
                    variant='light'
                    color={copied ? 'green' : 'magenta'}
                    leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    onClick={copy}
                  >
                    {copied ? 'Copiado' : 'Copiar link'}
                  </Button>
                )}
              </CopyButton>
            )}
          </Group>
        </Stack>
      </Stack>
    </Modal>
  );
}
