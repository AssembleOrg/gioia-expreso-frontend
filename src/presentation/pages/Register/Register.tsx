'use client';

import { useState } from 'react';
import { useForm } from '@mantine/form';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Title,
  Text,
  Alert,
  Center,
  Box,
  Divider,
  ThemeIcon,
  Group,
  Anchor,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconLock,
  IconMail,
  IconUser,
  IconMapPin,
  IconCircleCheck,
  IconHome,
} from '@tabler/icons-react';
import { Logo } from '@/presentation/components/Logo';
import { AuthClient } from '@/infrastructure/api/auth-client';
import type { RegisterCredentials } from '@/domain/auth/types';

export function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const form = useForm<RegisterCredentials>({
    initialValues: {
      email: '',
      password: '',
      fullname: '',
      address: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
      password: (value) =>
        value.length > 0 ? null : 'La contraseña es requerida',
      fullname: (value) =>
        value.trim().length >= 2 ? null : 'Nombre completo es requerido',
    },
  });

  const handleSubmit = async (values: RegisterCredentials) => {
    setError(null);
    setIsLoading(true);

    try {
      await AuthClient.register(values);
      setRegisteredEmail(values.email);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--mantine-color-gray-0)',
          paddingTop: '2rem',
        }}
      >
        <Box w={{ base: '90%', sm: 450 }} mx='auto'>
          <Stack gap='xs' align='center'>
            <Logo width={300} height={120} />

            <Paper shadow='xl' p='md' radius='lg' w='100%' withBorder>
              <Stack gap='sm' align='center'>
                <ThemeIcon size={80} radius='xl' variant='light' color='green'>
                  <IconCircleCheck size={50} />
                </ThemeIcon>

                <div>
                  <Title order={2} size='h3' ta='center' c='dark.9' mb='xs'>
                    ¡Registro Exitoso!
                  </Title>
                  <Text
                    size='sm'
                    c='dark.6'
                    ta='center'
                    style={{ lineHeight: 1.6 }}
                  >
                    Te hemos enviado un correo de verificación a:
                  </Text>
                  <Text size='md' fw={600} c='magenta' ta='center' mt='xs'>
                    {registeredEmail}
                  </Text>
                </div>

                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title='Verificá tu correo'
                  color='gray'
                  variant='light'
                  w='100%'
                >
                  <Text size='sm'>
                    Revisá tu bandeja de entrada y hace clic en el enlace de
                    verificación para activar tu cuenta. El enlace expira en 24
                    horas.
                  </Text>
                </Alert>

                <Stack gap='sm' w='100%'>
                  <Button
                    component='a'
                    href='/login'
                    color='magenta'
                    size='md'
                    fullWidth
                  >
                    Ir a Iniciar Sesión
                  </Button>

                  <Button
                    component='a'
                    href='/'
                    variant='subtle'
                    color='gray'
                    size='sm'
                    fullWidth
                  >
                    Volver al Inicio
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            <Text size='xs' c='dark.7' ta='center'>
              Sistema de Gestión de Envíos - Gioia Transporte
            </Text>
          </Stack>
        </Box>
      </Box>
    );
  }

  // Registration Form
  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--mantine-color-gray-0)',
        paddingTop: '2rem',
      }}
    >
      <Box w={{ base: '90%', sm: 500 }} mx='auto'>
        <Stack gap='xs' align='center'>
          <Logo width={300} height={120} />

          <Paper shadow='xl' p='md' radius='lg' w='100%' withBorder>
            <Stack gap='sm'>
              <div>
                <Title order={1} size='h2' ta='center' mb='xs' c='magenta.8'>
                  Crear Cuenta
                </Title>
                <Text
                  size='sm'
                  c='dark.6'
                  ta='center'
                  style={{ lineHeight: 1.6 }}
                >
                  Completá tus datos para registrarte
                </Text>
              </div>

              {error && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title='Error'
                  color='red'
                  variant='light'
                  withCloseButton
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap='sm'>
                  <TextInput
                    label='Nombre Completo'
                    placeholder='Juan Pérez'
                    leftSection={<IconUser size={16} />}
                    required
                    styles={{ label: { color: 'var(--mantine-color-dark-7)' } }}
                    {...form.getInputProps('fullname')}
                  />

                  <TextInput
                    label='Email'
                    placeholder='tu@email.com'
                    type='email'
                    leftSection={<IconMail size={16} />}
                    required
                    styles={{ label: { color: 'var(--mantine-color-dark-7)' } }}
                    {...form.getInputProps('email')}
                  />

                  <div>
                    <PasswordInput
                      label='Contraseña'
                      placeholder='••••••••'
                      leftSection={<IconLock size={16} />}
                      required
                      {...form.getInputProps('password')}
                      description='Mínimo 8 caracteres, una mayúscula, una minúscula y un número'
                      styles={{ label: { color: 'var(--mantine-color-dark-7)' } }}
                    />
                  </div>

                  <TextInput
                    label='Dirección'
                    placeholder='Av. Corrientes 1234, CABA'
                    leftSection={<IconMapPin size={16} />}
                    styles={{ label: { color: 'var(--mantine-color-dark-7)' } }}
                    {...form.getInputProps('address')}
                  />

                  <Button
                    type='submit'
                    color='magenta'
                    fullWidth
                    loading={isLoading}
                    size='md'
                    mt='md'
                  >
                    {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                  </Button>

                  <Divider my='lg' />

                  <Group justify='center' gap='xs'>
                    <Text size='sm' c='dark.6'>
                      ¿Ya tenés cuenta?
                    </Text>
                    <Anchor
                      component='a'
                      href='/login'
                      size='sm'
                      c='magenta.7'
                      fw={500}
                    >
                      Iniciar Sesión
                    </Anchor>
                  </Group>

                  <Group justify='center' gap={4} mt='xs'>
                    <IconHome
                      size={14}
                      style={{ color: 'var(--mantine-color-dark-5)' }}
                    />
                    <Anchor component='a' href='/' size='xs' c='dark.5'>
                      Volver al Inicio
                    </Anchor>
                  </Group>
                </Stack>
              </form>
            </Stack>
          </Paper>

          <Text size='xs' c='dark.7' ta='center'>
            Sistema de Gestión de Envíos - Gioia Transporte
          </Text>
        </Stack>
      </Box>
    </Box>
  );
}
