'use client';

import { useForm } from '@mantine/form';
import { useDispatchStore } from '@/application/stores/dispatch-store';
import {
  useBranchStore,
  BRANCH_DATA,
  type Branch,
} from '@/application/stores/branch-store';
import {
  Stack,
  TextInput,
  Group,
  Button,
  Text,
  Card,
  SimpleGrid,
  Grid,
  Radio,
  Select,
  Divider,
  Collapse,
  Box,
} from '@mantine/core';
import {
  IconArrowRight,
  IconArrowLeft,
  IconWand,
  IconBuilding,
  IconHome,
} from '@tabler/icons-react';
import type {
  Persona,
  TipoEntrega,
  DireccionDomicilio,
} from '@/domain/dispatch/types';

interface PersonaForm {
  nombre: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
}

interface DireccionDomicilioForm {
  direccion: string;
  provincia: string;
  localidad: string;
  barrio: string;
  calle: string;
  altura: string;
  codigoPostal: string;
  pisoDepto: string;
  referencias: string;
}

interface DespachanteFormProps {
  onNext: () => void;
  onBack: () => void;
}

// Test data for development
const TEST_DATA = {
  remitente: {
    nombre: 'Juan Test Remitente',
    dni: '12345678',
    email: 'remitente@test.com',
    telefono: '1122334455',
    direccion: 'Calle Test 123, CABA',
  },
  destinatario: {
    nombre: 'Maria Test Destinatario',
    dni: '87654321',
    email: 'destinatario@test.com',
    telefono: '5544332211',
    direccion: 'Av. Destino 456, Rosario',
  },
};

export function DespachanteForm({ onNext, onBack }: DespachanteFormProps) {
  const {
    updateRemitente,
    updateDestinatario,
    remitente,
    destinatario,
    tipoEntrega,
    setTipoEntrega,
    sucursalDestinoId,
    setSucursalDestino,
    direccionDomicilio,
    setDireccionDomicilio,
  } = useDispatchStore();

  const { selectedBranch } = useBranchStore();

  const sucursalDestinoDefault: Branch =
    selectedBranch === 'BUENOS_AIRES'
      ? 'ENTRE_RIOS'
      : selectedBranch === 'ENTRE_RIOS'
      ? 'BUENOS_AIRES'
      : 'ENTRE_RIOS';

  const form = useForm<{
    remitente: PersonaForm;
    destinatario: PersonaForm;
    tipoEntrega: TipoEntrega;
    sucursalDestino: Branch;
    direccionDomicilio: DireccionDomicilioForm;
  }>({
    initialValues: {
      remitente: remitente || {
        nombre: '',
        dni: '',
        email: '',
        telefono: '',
        direccion: '',
      },
      destinatario: destinatario || {
        nombre: '',
        dni: '',
        email: '',
        telefono: '',
        direccion: '',
      },
      tipoEntrega: tipoEntrega || 'sucursal',
      sucursalDestino: sucursalDestinoId || sucursalDestinoDefault,
      direccionDomicilio: {
        direccion: direccionDomicilio?.direccion || '',
        provincia: direccionDomicilio?.provincia || '',
        localidad: direccionDomicilio?.localidad || '',
        barrio: direccionDomicilio?.barrio || '',
        calle: direccionDomicilio?.calle || '',
        altura: direccionDomicilio?.altura || '',
        codigoPostal: direccionDomicilio?.codigoPostal || '',
        pisoDepto: direccionDomicilio?.pisoDepto || '',
        referencias: direccionDomicilio?.referencias || '',
      },
    },
    validate: {
      remitente: {
        nombre: (val) => (!val ? 'Nombre requerido' : null),
        dni: (val) =>
          !/^(\d{7,8}|\d{11})$/.test(val) ? 'DNI o CUIT inválido (7-8 o 11 dígitos)' : null,
        email: (val) => (!/^\S+@\S+\.\S+$/.test(val) ? 'Email inválido' : null),
        telefono: (val) =>
          !/^\d{10}$/.test(val) ? 'Teléfono inválido (10 dígitos)' : null,
        direccion: (val) => (!val ? 'Dirección requerida' : null),
      },
      destinatario: {
        nombre: (val) => (!val ? 'Nombre requerido' : null),
        dni: (val) =>
          !/^(\d{7,8}|\d{11})$/.test(val) ? 'DNI o CUIT inválido (7-8 o 11 dígitos)' : null,
        email: (val) => (!/^\S+@\S+\.\S+$/.test(val) ? 'Email inválido' : null),
        telefono: (val) =>
          !/^\d{10}$/.test(val) ? 'Teléfono inválido (10 dígitos)' : null,
        direccion: (val) => (!val ? 'Dirección requerida' : null),
      },
      direccionDomicilio: {
        direccion: (val, values) => {
          // Solo validar si es envío a domicilio
          if (values.tipoEntrega === 'domicilio' && !val) {
            return 'Dirección requerida para envío a domicilio';
          }
          return null;
        },
      },
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    updateRemitente(values.remitente);
    updateDestinatario(values.destinatario);
    setTipoEntrega(values.tipoEntrega);
    setSucursalDestino(values.sucursalDestino);

    if (values.tipoEntrega === 'domicilio') {
      setDireccionDomicilio({
        direccion: values.direccionDomicilio.direccion,
        provincia: values.direccionDomicilio.provincia || undefined,
        localidad: values.direccionDomicilio.localidad || undefined,
        barrio: values.direccionDomicilio.barrio || undefined,
        calle: values.direccionDomicilio.calle || undefined,
        altura: values.direccionDomicilio.altura || undefined,
        codigoPostal: values.direccionDomicilio.codigoPostal || undefined,
        pisoDepto: values.direccionDomicilio.pisoDepto || undefined,
        referencias: values.direccionDomicilio.referencias || undefined,
      });
    }

    onNext();
  };

  const handleAutoFill = () => {
    form.setValues({
      ...TEST_DATA,
      tipoEntrega: 'sucursal',
      sucursalDestino: sucursalDestinoDefault,
      direccionDomicilio: {
        direccion: '',
        provincia: '',
        localidad: '',
        barrio: '',
        calle: '',
        altura: '',
        codigoPostal: '',
        pisoDepto: '',
        referencias: '',
      },
    });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      {/* Dev auto-fill button */}
      {process.env.NODE_ENV === 'development' && (
        <Group
          justify='flex-end'
          mb='sm'
          mt='xl'
        >
          <Button
            variant='light'
            color='gray'
            size='xs'
            leftSection={<IconWand size={14} />}
            onClick={handleAutoFill}
          >
            Dev: Auto-fill
          </Button>
        </Group>
      )}

      <Grid
        gutter='lg'
        mt={process.env.NODE_ENV === 'development' ? 'sm' : 'xl'}
      >
        {/* Remitente */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card
            withBorder
            p='lg'
          >
            <Stack gap='md'>
              <Text
                size='lg'
                fw={600}
                c='dark.9'
              >
                Datos del Remitente
              </Text>

              <TextInput
                label='Nombre o Razón Social'
                placeholder='Juan Pérez'
                required
                {...form.getInputProps('remitente.nombre')}
              />

              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput
                  label='DNI o CUIT'
                  placeholder='DNI o CUIT'
                  required
                  {...form.getInputProps('remitente.dni')}
                />

                <TextInput
                  label='Email'
                  placeholder='juan@example.com'
                  type='email'
                  required
                  {...form.getInputProps('remitente.email')}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput
                  label='Teléfono'
                  placeholder='1234567890'
                  required
                  {...form.getInputProps('remitente.telefono')}
                />

                <TextInput
                  label='Dirección'
                  placeholder='Calle 123, CABA'
                  required
                  {...form.getInputProps('remitente.direccion')}
                />
              </SimpleGrid>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Destinatario */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card
            withBorder
            p='lg'
          >
            <Stack gap='md'>
              <Text
                size='lg'
                fw={600}
                c='dark.9'
              >
                Datos del Destinatario
              </Text>

              <TextInput
                label='Nombre o Razón Social'
                placeholder='María López'
                required
                {...form.getInputProps('destinatario.nombre')}
              />

              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput
                  label='DNI o CUIT'
                  placeholder='DNI o CUIT'
                  required
                  {...form.getInputProps('destinatario.dni')}
                />

                <TextInput
                  label='Email'
                  placeholder='maria@example.com'
                  type='email'
                  required
                  {...form.getInputProps('destinatario.email')}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput
                  label='Teléfono'
                  placeholder='0987654321'
                  required
                  {...form.getInputProps('destinatario.telefono')}
                />

                <TextInput
                  label='Dirección de contacto'
                  placeholder='Av. Principal 456, Rosario'
                  required
                  {...form.getInputProps('destinatario.direccion')}
                />
              </SimpleGrid>

              {/* Tipo de Entrega */}
              <Divider
                my='xs'
                label='Tipo de Entrega'
                labelPosition='center'
              />

              <Radio.Group
                value={form.values.tipoEntrega}
                onChange={(value) =>
                  form.setFieldValue('tipoEntrega', value as TipoEntrega)
                }
              >
                <Group gap='xl'>
                  <Radio
                    value='sucursal'
                    label={
                      <Group gap='xs'>
                        <IconBuilding size={16} />
                        <span>Retira en Sucursal</span>
                      </Group>
                    }
                  />
                  <Radio
                    value='domicilio'
                    label={
                      <Group gap='xs'>
                        <IconHome size={16} />
                        <span>Envío a Domicilio</span>
                      </Group>
                    }
                  />
                </Group>
              </Radio.Group>

              {/* Si es a Sucursal */}
              <Collapse in={form.values.tipoEntrega === 'sucursal'}>
                <Box mt='sm'>
                  <Select
                    label={
                      <Text
                        size='sm'
                        fw={500}
                        c='dark.7'
                      >
                        Sucursal de destino
                      </Text>
                    }
                    description='El paquete quedará en depósito para retiro'
                    data={[
                      {
                        value: 'BUENOS_AIRES',
                        label: `${BRANCH_DATA.BUENOS_AIRES.name} - ${BRANCH_DATA.BUENOS_AIRES.address}, ${BRANCH_DATA.BUENOS_AIRES.city}`,
                        disabled: selectedBranch === 'BUENOS_AIRES',
                      },
                      {
                        value: 'ENTRE_RIOS',
                        label: `${BRANCH_DATA.ENTRE_RIOS.name} - ${BRANCH_DATA.ENTRE_RIOS.address}, ${BRANCH_DATA.ENTRE_RIOS.city}`,
                        disabled: selectedBranch === 'ENTRE_RIOS',
                      },
                    ]}
                    value={form.values.sucursalDestino}
                    onChange={(value) =>
                      form.setFieldValue('sucursalDestino', value as Branch)
                    }
                    styles={{
                      input: {
                        color: '#000',
                        fontWeight: 500,
                      },
                      option: {
                        color: '#000',
                      },
                    }}
                  />
                </Box>
              </Collapse>

              {/* Si es a Domicilio */}
              <Collapse in={form.values.tipoEntrega === 'domicilio'}>
                <Stack
                  gap='sm'
                  mt='sm'
                >
                  <TextInput
                    label='Dirección de entrega'
                    placeholder='Calle y número'
                    {...form.getInputProps('direccionDomicilio.direccion')}
                  />

                  <Text
                    size='sm'
                    c='dimmed'
                    fw={500}
                  >
                    Datos adicionales (opcionales)
                  </Text>

                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <TextInput
                      label='Localidad/Ciudad'
                      placeholder='Ej: Paraná'
                      {...form.getInputProps('direccionDomicilio.localidad')}
                    />
                    <TextInput
                      label='Código Postal'
                      placeholder='Ej: 3100'
                      {...form.getInputProps('direccionDomicilio.codigoPostal')}
                    />
                  </SimpleGrid>

                  <SimpleGrid cols={{ base: 2, sm: 4 }}>
                    <TextInput
                      label='Calle'
                      placeholder='Ej: Av. Rivadavia'
                      {...form.getInputProps('direccionDomicilio.calle')}
                    />
                    <TextInput
                      label='Altura'
                      placeholder='Ej: 1234'
                      {...form.getInputProps('direccionDomicilio.altura')}
                    />
                    <TextInput
                      label='Piso/Depto'
                      placeholder='Ej: 3B'
                      {...form.getInputProps('direccionDomicilio.pisoDepto')}
                    />
                    <TextInput
                      label='Barrio'
                      placeholder='Ej: Centro'
                      {...form.getInputProps('direccionDomicilio.barrio')}
                    />
                  </SimpleGrid>

                  <TextInput
                    label='Referencias'
                    placeholder='Ej: Casa amarilla, portón negro'
                    {...form.getInputProps('direccionDomicilio.referencias')}
                  />
                </Stack>
              </Collapse>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Navigation - Fuera del Grid */}
      <Group
        justify='space-between'
        mt='xl'
      >
        <Button
          variant='subtle'
          leftSection={<IconArrowLeft size={16} />}
          onClick={onBack}
        >
          Volver
        </Button>

        <Button
          type='submit'
          color='magenta'
          rightSection={<IconArrowRight size={16} />}
        >
          Confirmar
        </Button>
      </Group>
    </form>
  );
}
