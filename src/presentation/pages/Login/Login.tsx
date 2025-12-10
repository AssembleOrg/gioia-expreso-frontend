'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Card,
} from '@mantine/core';
import { IconAlertCircle, IconLock, IconMail } from '@tabler/icons-react';
import { useAuthStore } from '@/application/stores/auth-store';
import { useBranchStore } from '@/application/stores/branch-store';
import { Logo } from '@/presentation/components/Logo';

export function Login() {
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated } =
    useAuthStore();
  const { selectBranch } = useBranchStore();
  const [showBranchSelect, setShowBranchSelect] = useState(false);

  // Redirect if already authenticated AND has branch selected
  useEffect(() => {
    if (isAuthenticated && !showBranchSelect) {
      const branch = useBranchStore.getState().selectedBranch;
      if (branch) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, showBranchSelect, router]);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
      password: (value) =>
        value.length >= 6
          ? null
          : 'La contraseña debe tener al menos 6 caracteres',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    clearError();
    try {
      await login(values);
      // En vez de ir directo al dashboard, mostrar selector de sucursal
      setShowBranchSelect(true);
    } catch (err) {
      // Error is handled in the store
    }
  };

  const handleBranchSelection = (branch: 'BUENOS_AIRES' | 'ENTRE_RIOS') => {
    selectBranch(branch);
    router.push('/dashboard');
  };

  return (
    <Center
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--mantine-color-gray-0)',
      }}
    >
      <Box w={{ base: '90%', sm: 400 }}>
        <Stack
          gap='xl'
          align='center'
        >
          {/* Logo */}
          <Logo
            width={300}
            height={160}
          />

          {/* Login Card or Branch Selector */}
          {showBranchSelect ? (
            <Paper
              shadow='lg'
              p='xl'
              radius='md'
              w='100%'
              withBorder
            >
              <Stack gap='md'>
                <div>
                  <Title
                    order={2}
                    ta='center'
                    mb='xs'
                    c='dark.9'
                  >
                    Seleccioná tu Sucursal
                  </Title>
                  <Text
                    size='sm'
                    c='dark.7'
                    ta='center'
                  >
                    Elegí desde qué sucursal estás trabajando
                  </Text>
                </div>

                <Stack
                  gap='md'
                  mt='md'
                >
                  <Button
                    size='lg'
                    variant='light'
                    color='magenta'
                    onClick={() => handleBranchSelection('BUENOS_AIRES')}
                  >
                    Buenos Aires
                  </Button>
                  <Button
                    size='lg'
                    variant='light'
                    color='magenta'
                    onClick={() => handleBranchSelection('ENTRE_RIOS')}
                  >
                    Entre Ríos
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ) : (
            <Paper
              shadow='lg'
              p='xl'
              radius='md'
              w='100%'
              withBorder
            >
              <Stack gap='md'>
                <div>
                  <Title
                    order={2}
                    ta='center'
                    mb='xs'
                    c='dark.9'
                  >
                    Acceso Empleados
                  </Title>
                  <Text
                    size='sm'
                    c='dark.7'
                    ta='center'
                  >
                    Ingresá tus credenciales para continuar
                  </Text>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title='Error'
                    color='red'
                    variant='light'
                    withCloseButton
                    onClose={clearError}
                  >
                    {error}
                  </Alert>
                )}

                {/* Login Form */}
                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Stack gap='md'>
                    <TextInput
                      label='Email'
                      placeholder='tu@email.com'
                      type='email'
                      leftSection={<IconMail size={16} />}
                      required
                      styles={{
                        label: { color: 'var(--mantine-color-dark-9)' },
                      }}
                      {...form.getInputProps('email')}
                    />

                    <PasswordInput
                      label='Contraseña'
                      placeholder='••••••••'
                      leftSection={<IconLock size={16} />}
                      required
                      styles={{
                        label: { color: 'var(--mantine-color-dark-9)' },
                      }}
                      {...form.getInputProps('password')}
                    />

                    <Button
                      type='submit'
                      color='magenta'
                      fullWidth
                      loading={isLoading}
                      size='md'
                      mt='md'
                    >
                      {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>

                    <Button
                      component='a'
                      href='/'
                      variant='subtle'
                      color='gray'
                      size='xs'
                      fullWidth
                    >
                      Volver al Inicio
                    </Button>
                  </Stack>
                </form>
              </Stack>
            </Paper>
          )}

          <Text
            size='xs'
            c='dark.7'
            ta='center'
          >
            Sistema de Gestión de Envíos - Gioia Transporte
          </Text>
        </Stack>
      </Box>
    </Center>
  );
}
