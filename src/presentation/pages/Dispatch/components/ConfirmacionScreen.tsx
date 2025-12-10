'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatchStore } from '@/application/stores/dispatch-store';
import { BRANCH_DATA } from '@/application/stores/branch-store';
import {
  Stack,
  Card,
  Text,
  Group,
  Button,
  Alert,
  Badge,
  Grid,
  Divider,
  Box,
  Loader,
  NumberInput,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconCheck,
  IconAlertCircle,
  IconMapPin,
  IconUser,
  IconPackage,
  IconCurrencyDollar,
  IconBuilding,
  IconHome,
  IconInfoCircle,
} from '@tabler/icons-react';
import { PreorderSuccessModal } from './PreorderSuccessModal';

interface ConfirmacionScreenProps {
  onBack: () => void;
}

export function ConfirmacionScreen({ onBack }: ConfirmacionScreenProps) {
  const router = useRouter();
  const {
    cotizacion,
    paquetes,
    remitente,
    destinatario,
    tipoEntrega,
    sucursalDestinoId,
    direccionDomicilio,
    precioManual,
    setPrecioManual,
    submitPreorder,
    isSubmitting,
    error,
  } = useDispatchStore();
  const [preorderId, setPreorderId] = useState<string | null>(null);
  const [voucherNumber, setVoucherNumber] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [precioInput, setPrecioInput] = useState<number | string>(precioManual ?? cotizacion?.precio ?? 0);

  // Sincronizar precio input con store cuando cambia
  useEffect(() => {
    if (precioManual !== null) {
      setPrecioInput(precioManual);
    } else if (cotizacion?.precio) {
      setPrecioInput(cotizacion.precio);
    }
  }, [precioManual, cotizacion?.precio]);

  const pesoTotal = paquetes.reduce((sum, p) => sum + p.peso, 0);
  const valorTotal = paquetes.reduce((sum, p) => sum + p.valor_declarado, 0);

  // Calcular precio final (manual o cotización)
  const precioSugerido = cotizacion?.precio ?? 0;
  const precioFinal = typeof precioInput === 'number' ? precioInput : precioSugerido;
  const precioModificado = precioFinal !== precioSugerido;

  // Obtener dirección de entrega formateada
  const getDireccionEntrega = () => {
    if (tipoEntrega === 'sucursal' && sucursalDestinoId) {
      const sucursal = BRANCH_DATA[sucursalDestinoId];
      return `${sucursal.name} - ${sucursal.address}, ${sucursal.city}`;
    }
    if (tipoEntrega === 'domicilio' && direccionDomicilio) {
      const partes = [
        direccionDomicilio.calle && direccionDomicilio.altura
          ? `${direccionDomicilio.calle} ${direccionDomicilio.altura}`
          : direccionDomicilio.direccion,
        direccionDomicilio.pisoDepto,
        direccionDomicilio.barrio,
        direccionDomicilio.localidad,
        direccionDomicilio.provincia,
      ].filter(Boolean);
      return partes.join(', ');
    }
    return destinatario?.direccion || '';
  };

  // Handler para cambio de precio
  const handlePrecioChange = (value: number | string) => {
    setPrecioInput(value);
    if (typeof value === 'number' && value >= 0) {
      // Si el precio es diferente al sugerido, guardarlo como manual
      if (value !== precioSugerido) {
        setPrecioManual(value);
      } else {
        // Si vuelve al precio sugerido, limpiar el manual
        setPrecioManual(null);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await submitPreorder();
      setPreorderId(result.id);
      setVoucherNumber(result.voucherNumber);
      setModalOpened(true);
    } catch (err) {
      // Error ya está en el store, el Alert lo mostrará automáticamente
      console.error('Error al crear preorden:', err);

      // Scroll al error alert para que el usuario lo vea
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <Stack
        gap='lg'
        mt='xl'
      >
        <Text
          size='lg'
          fw={600}
          c='dark.9'
        >
          Resumen del Envío
        </Text>

        {error && (
          <Alert
            icon={<IconAlertCircle />}
            color='red'
            title='Error'
          >
            {error}
          </Alert>
        )}

        {isSubmitting && (
          <Alert
            icon={<Loader size='sm' />}
            color='blue'
            title='Creando envío...'
          >
            Por favor espera mientras procesamos tu solicitud.
          </Alert>
        )}

        {/* 2-Column Grid Layout: Desktop 40/60, Mobile Stack */}
        <Grid gutter='lg'>
          {/* LEFT COLUMN - Resumen General (40%) */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap='md'>
              {/* Ruta Card */}
              <Card
                withBorder
                p='md'
              >
                <Stack gap='sm'>
                  <Group gap='xs'>
                    <IconMapPin
                      size={18}
                      color='var(--mantine-color-magenta-6)'
                    />
                    <Text
                      size='sm'
                      fw={600}
                      c='dark.9'
                    >
                      Ruta
                    </Text>
                  </Group>

                  <Group justify='space-between'>
                    <Text
                      size='xs'
                      c='magenta.8'
                      fw={500}
                    >
                      Origen
                    </Text>
                    <Stack
                      gap={0}
                      align='flex-end'
                    >
                      <Text
                        size='sm'
                        fw={500}
                        c='dark.9'
                      >
                        {cotizacion?.origen?.nombre}
                      </Text>
                      {cotizacion?.origen?.provincia && (
                        <Text
                          size='xs'
                          c='dark.7'
                        >
                          {cotizacion?.origen?.provincia}
                        </Text>
                      )}
                    </Stack>
                  </Group>

                  <Group justify='space-between'>
                    <Text
                      size='xs'
                      c='magenta.8'
                      fw={500}
                    >
                      Destino
                    </Text>
                    <Stack
                      gap={0}
                      align='flex-end'
                    >
                      <Text
                        size='sm'
                        fw={500}
                        c='dark.9'
                      >
                        {cotizacion?.destino?.nombre}
                      </Text>
                      {cotizacion?.destino?.provincia && (
                        <Text
                          size='xs'
                          c='dark.7'
                        >
                          {cotizacion?.destino?.provincia}
                        </Text>
                      )}
                    </Stack>
                  </Group>

                  <Divider />

                  <Group justify='space-between'>
                    <Text
                      size='xs'
                      c='magenta.8'
                      fw={500}
                    >
                      Servicio
                    </Text>
                    <Badge
                      color='magenta'
                      variant='light'
                      size='sm'
                    >
                      {cotizacion?.servicio}
                    </Badge>
                  </Group>

                  {cotizacion?.tiempo_estimado && (
                    <Group justify='space-between'>
                      <Text
                        size='xs'
                        c='magenta.8'
                        fw={500}
                      >
                        Tiempo Estimado
                      </Text>
                      <Text
                        size='sm'
                        c='dark.7'
                      >
                        {cotizacion.tiempo_estimado}
                      </Text>
                    </Group>
                  )}

                  <Divider />

                  {/* Tipo de Entrega */}
                  <Group justify='space-between'>
                    <Text
                      size='xs'
                      c='magenta.8'
                      fw={500}
                    >
                      Tipo de Entrega
                    </Text>
                    <Badge
                      color={tipoEntrega === 'sucursal' ? 'blue' : 'green'}
                      variant='light'
                      size='sm'
                      leftSection={tipoEntrega === 'sucursal' ? <IconBuilding size={12} /> : <IconHome size={12} />}
                    >
                      {tipoEntrega === 'sucursal' ? 'Retira en Sucursal' : 'Envío a Domicilio'}
                    </Badge>
                  </Group>

                  <Group justify='space-between' align='flex-start'>
                    <Text
                      size='xs'
                      c='magenta.8'
                      fw={500}
                    >
                      Dirección Entrega
                    </Text>
                    <Text
                      size='xs'
                      c='dark.7'
                      ta='right'
                      maw={180}
                    >
                      {getDireccionEntrega()}
                    </Text>
                  </Group>
                </Stack>
              </Card>

              {/* Precio Card */}
              <Card
                withBorder
                p='md'
              >
                <Stack gap='sm'>
                  <Group gap='xs'>
                    <IconCurrencyDollar
                      size={18}
                      color='var(--mantine-color-magenta-6)'
                    />
                    <Text
                      size='sm'
                      fw={600}
                      c='dark.9'
                    >
                      Precio
                    </Text>
                    <Tooltip label='Puede modificar el precio si es necesario' withArrow>
                      <IconInfoCircle size={14} color='gray' style={{ cursor: 'help' }} />
                    </Tooltip>
                  </Group>

                  <Group justify='space-between'>
                    <Text
                      size='xs'
                      c='dimmed'
                    >
                      Precio sugerido:
                    </Text>
                    <Text
                      size='sm'
                      c='dark.7'
                      td={precioModificado ? 'line-through' : undefined}
                    >
                      ${precioSugerido.toLocaleString('es-AR')}
                    </Text>
                  </Group>

                  <NumberInput
                    label='Precio final'
                    placeholder='Ingrese el precio'
                    value={precioInput}
                    onChange={handlePrecioChange}
                    min={0}
                    decimalScale={2}
                    thousandSeparator='.'
                    decimalSeparator=','
                    prefix='$ '
                    size='md'
                    styles={{
                      input: {
                        fontWeight: 600,
                        fontSize: '1.1rem',
                      },
                    }}
                  />

                  {precioModificado && (
                    <Text size='xs' c='orange' ta='center'>
                      Precio modificado manualmente
                    </Text>
                  )}
                </Stack>
              </Card>

              {/* Personas Card */}
              <Card
                withBorder
                p='md'
              >
                <Stack gap='sm'>
                  <Group gap='xs'>
                    <IconUser
                      size={18}
                      color='var(--mantine-color-magenta-6)'
                    />
                    <Text
                      size='sm'
                      fw={600}
                      c='dark.9'
                    >
                      Personas
                    </Text>
                  </Group>

                  <div>
                    <Text
                      size='xs'
                      c='magenta.8'
                      fw={500}
                      mb={4}
                    >
                      Remitente
                    </Text>
                    <Text
                      size='sm'
                      fw={500}
                      c='dark.9'
                    >
                      {remitente?.nombre}
                    </Text>
                    <Text
                      size='xs'
                      c='dark.7'
                    >
                      DNI: {remitente?.dni}
                    </Text>
                    <Text
                      size='xs'
                      c='dark.7'
                    >
                      {remitente?.email} • {remitente?.telefono}
                    </Text>
                    <Text
                      size='xs'
                      c='dark.7'
                    >
                      {remitente?.direccion}
                    </Text>
                  </div>

                  <Divider />

                  <div>
                    <Text
                      size='xs'
                      c='magenta.8'
                      fw={500}
                      mb={4}
                    >
                      Destinatario
                    </Text>
                    <Text
                      size='sm'
                      fw={500}
                      c='dark.9'
                    >
                      {destinatario?.nombre}
                    </Text>
                    <Text
                      size='xs'
                      c='dark.7'
                    >
                      DNI: {destinatario?.dni}
                    </Text>
                    <Text
                      size='xs'
                      c='dark.7'
                    >
                      {destinatario?.email} • {destinatario?.telefono}
                    </Text>
                    <Text
                      size='xs'
                      c='dark.7'
                    >
                      {destinatario?.direccion}
                    </Text>
                  </div>
                </Stack>
              </Card>

              {/* CTA Button - Desktop Only */}
              <Box display={{ base: 'none', md: 'block' }}>
                <Button
                  color='magenta'
                  size='lg'
                  fullWidth
                  rightSection={<IconCheck size={18} />}
                  onClick={handleSubmit}
                  loading={isSubmitting}
                >
                  Confirmar paquete
                </Button>
              </Box>
            </Stack>
          </Grid.Col>

          {/* RIGHT COLUMN - Detalle Bultos (60%) */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Card
              withBorder
              p='md'
            >
              <Stack gap='md'>
                <Group gap='xs'>
                  <IconPackage
                    size={18}
                    color='var(--mantine-color-magenta-6)'
                  />
                  <Text
                    size='sm'
                    fw={600}
                    c='dark.9'
                  >
                    Detalle de Bultos
                  </Text>
                </Group>

                {/* Stats Summary */}
                <Group
                  justify='space-around'
                  p='sm'
                  bg='gray.0'
                  style={{ borderRadius: 8 }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <Text
                      size='xs'
                      c='magenta.8'
                      fw={500}
                    >
                      Cantidad
                    </Text>
                    <Text
                      size='lg'
                      fw={700}
                      c='dark.9'
                    >
                      {paquetes.length}
                    </Text>
                    <Text
                      size='xs'
                      c='dark.7'
                    >
                      bultos
                    </Text>
                  </div>

                  <Divider orientation='vertical' />

                  <div style={{ textAlign: 'center' }}>
                    <Text
                      size='xs'
                      c='magenta.8'
                      fw={500}
                    >
                      Peso Total
                    </Text>
                    <Text
                      size='lg'
                      fw={700}
                      c='dark.9'
                    >
                      {pesoTotal.toFixed(2)}
                    </Text>
                    <Text
                      size='xs'
                      c='dark.7'
                    >
                      kg
                    </Text>
                  </div>

                  <Divider orientation='vertical' />

                  <div style={{ textAlign: 'center' }}>
                    <Text
                      size='xs'
                      c='magenta.8'
                      fw={500}
                    >
                      Valor Declarado
                    </Text>
                    <Text
                      size='lg'
                      fw={700}
                      c='dark.9'
                    >
                      {valorTotal.toFixed(2)}
                    </Text>
                  </div>
                </Group>

                <Divider />

                {/* Individual Package Cards */}
                <Stack gap='sm'>
                  {paquetes.map((paquete, idx) => (
                    <Card
                      key={idx}
                      withBorder
                      p='sm'
                      bg='gray.0'
                    >
                      <Stack gap='xs'>
                        <Group justify='space-between'>
                          <Text
                            size='sm'
                            fw={500}
                            c='dark.9'
                          >
                            Bulto {idx + 1}
                          </Text>
                          <Badge
                            size='sm'
                            color='gray'
                          >
                            {paquete.peso} kg
                          </Badge>
                        </Group>

                        <Text
                          size='xs'
                          c='dark.7'
                        >
                          <strong>Descripción:</strong> {paquete.descripcion}
                        </Text>

                        {paquete.dimensiones &&
                          (paquete.dimensiones.alto > 0 ||
                            paquete.dimensiones.ancho > 0 ||
                            paquete.dimensiones.largo > 0) && (
                            <Text
                              size='xs'
                              c='dark.7'
                            >
                              <strong>Dimensiones:</strong>{' '}
                              {paquete.dimensiones.alto} x{' '}
                              {paquete.dimensiones.ancho} x{' '}
                              {paquete.dimensiones.largo} cm
                            </Text>
                          )}

                        <Text
                          size='xs'
                          c='dark.7'
                        >
                          <strong>Valor Declarado:</strong> $
                          {paquete.valor_declarado.toFixed(2)}
                        </Text>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Mobile Navigation - Visible only on mobile */}
        <Box display={{ base: 'block', md: 'none' }}>
          <Group justify='space-between'>
            <Button
              variant='subtle'
              leftSection={<IconArrowLeft size={16} />}
              onClick={onBack}
              disabled={isSubmitting}
            >
              Volver
            </Button>

            <Button
              color='magenta'
              rightSection={<IconCheck size={16} />}
              onClick={handleSubmit}
              loading={isSubmitting}
            >
              Confirmar paquete
            </Button>
          </Group>
        </Box>

        {/* Desktop Navigation - Back button only */}
        <Box display={{ base: 'none', md: 'block' }}>
          <Button
            variant='subtle'
            leftSection={<IconArrowLeft size={16} />}
            onClick={onBack}
            disabled={isSubmitting}
          >
            Volver
          </Button>
        </Box>
      </Stack>

      {/* Modal que se abre al confirmar */}
      <PreorderSuccessModal
        opened={modalOpened}
        preorderId={preorderId || ''}
        voucherNumber={voucherNumber || ''}
        onClose={() => {
          setModalOpened(false);
          router.push('/dashboard');
        }}
        cotizacion={cotizacion}
        paquetes={paquetes}
        remitente={remitente}
        destinatario={destinatario}
      />
    </>
  );
}
