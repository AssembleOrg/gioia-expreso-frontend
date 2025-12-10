'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stack,
  Card,
  Text,
  Group,
  Button,
  Badge,
  SimpleGrid,
  Alert,
  Loader,
  Box,
  ThemeIcon,
} from '@mantine/core';
import {
  IconFileDownload,
  IconQrcode,
  IconFileInvoice,
  IconCheck,
  IconArrowLeft,
  IconArrowRight,
  IconPackage,
  IconWeight,
  IconChecks,
} from '@tabler/icons-react';

interface DetallePreordenProps {
  preorderId: string;
  onBack?: () => void;
}

export function DetallePreorden({ preorderId, onBack }: DetallePreordenProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preorderData, setPreorderData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch preorder details
  useEffect(() => {
    async function fetchPreorder() {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/voucher/preorders/${preorderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error('Error al cargar detalles');

        const data = await response.json();
        setPreorderData(data);
      } catch (err) {
        setError('No se pudo cargar el detalle del envío');
      } finally {
        setLoading(false);
      }
    }

    fetchPreorder();
  }, [preorderId]);

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/voucher/preorders/${preorderId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Error al generar PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprobante-${preorderId}.pdf`;
      a.click();
    } catch (err) {
      alert('Error al descargar PDF');
    }
  };

  const handleGenerateQR = () => {
    alert('Funcionalidad en desarrollo');
  };

  const handleGenerateInvoice = () => {
    alert('Funcionalidad en desarrollo');
  };

  if (loading) {
    return (
      <Stack align="center" py="xl">
        <Loader size="lg" />
        <Text c="dark.7">Cargando detalles del envío...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Error">
        {error}
      </Alert>
    );
  }

  return (
    <Stack gap="lg" mt="xl">
      {/* Hero Section - Green Success Banner */}
      <Card withBorder p="lg" bg="green.0">
        <Group justify="space-between" align="center">
          <Group gap="md">
            <ThemeIcon size={48} radius="xl" color="green" variant="filled">
              <IconCheck size={28} />
            </ThemeIcon>
            <div>
              <Text size="xl" fw={700} c="dark.9">
                Envío Creado Exitosamente
              </Text>
              <Text size="sm" c="dark.7">
                ID: {preorderId}
              </Text>
            </div>
          </Group>
          <Badge color="green" size="xl" leftSection={<IconChecks size={16} />}>
            CREADO
          </Badge>
        </Group>
      </Card>

      {/* Route Info - Horizontal Origin → Destination with Price */}
      {preorderData && (
        <Card withBorder p="md">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap="lg" wrap="nowrap">
              <div>
                <Text size="xs" c="dark.7">
                  Origen
                </Text>
                <Text size="md" fw={600} c="dark.9">
                  {preorderData.origin || 'N/A'}
                </Text>
              </div>

              <IconArrowRight size={24} color="var(--mantine-color-dark-7)" />

              <div>
                <Text size="xs" c="dark.7">
                  Destino
                </Text>
                <Text size="md" fw={600} c="dark.9">
                  {preorderData.destination || 'N/A'}
                </Text>
              </div>
            </Group>

            <div style={{ textAlign: 'right' }}>
              <Text size="xs" c="dark.7">
                Precio
              </Text>
              <Text size="xl" fw={900} c="magenta">
                ${preorderData.price || 'N/A'}
              </Text>
            </div>
          </Group>
        </Card>
      )}

      {/* Stats Cards - 3 Columns */}
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }}>
        {/* Bultos Card */}
        <Card withBorder p="md" ta="center">
          <Stack gap="xs" align="center">
            <ThemeIcon size={40} radius="md" variant="light" color="blue">
              <IconPackage size={24} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dark.7">
                Bultos
              </Text>
              <Text size="xl" fw={700} c="dark.9">
                {preorderData?.packages || 'N/A'}
              </Text>
            </div>
          </Stack>
        </Card>

        {/* Peso Card */}
        <Card withBorder p="md" ta="center">
          <Stack gap="xs" align="center">
            <ThemeIcon size={40} radius="md" variant="light" color="orange">
              <IconWeight size={24} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dark.7">
                Peso Total
              </Text>
              <Text size="xl" fw={700} c="dark.9">
                {preorderData?.total_weight || 'N/A'} kg
              </Text>
            </div>
          </Stack>
        </Card>

        {/* Estado Card */}
        <Card withBorder p="md" ta="center">
          <Stack gap="xs" align="center">
            <ThemeIcon size={40} radius="md" variant="light" color="green">
              <IconChecks size={24} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dark.7">
                Estado
              </Text>
              <Badge size="xl" color="green" variant="filled">
                {preorderData?.status || 'CREADO'}
              </Badge>
            </div>
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Opciones de Documentos */}
      <Card withBorder p="lg">
        <Stack gap="md">
          <Text size="md" fw={600} c="dark.9">
            Documentos y Opciones
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
            {/* Descargar Comprobante PDF */}
            <Button
              variant="light"
              leftSection={<IconFileDownload size={20} />}
              onClick={handleDownloadPDF}
              size="md"
            >
              Descargar Comprobante
            </Button>

            {/* Generar Etiqueta QR */}
            <Button
              variant="light"
              color="blue"
              leftSection={<IconQrcode size={20} />}
              onClick={handleGenerateQR}
              size="md"
            >
              Generar Etiqueta QR
            </Button>

            {/* Generar Factura AFIP */}
            <Button
              variant="light"
              color="orange"
              leftSection={<IconFileInvoice size={20} />}
              onClick={handleGenerateInvoice}
              size="md"
            >
              Factura Electrónica
            </Button>
          </SimpleGrid>
        </Stack>
      </Card>

      {/* Navigation */}
      <Group justify="space-between">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push('/dashboard')}
        >
          Volver al Dashboard
        </Button>

        <Button color="magenta" onClick={() => router.push('/dispatch')}>
          Crear Otro Envío
        </Button>
      </Group>
    </Stack>
  );
}
