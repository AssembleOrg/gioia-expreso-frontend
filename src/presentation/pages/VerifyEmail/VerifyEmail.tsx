'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Paper,
  Button,
  Stack,
  Title,
  Text,
  Alert,
  Center,
  Box,
  ThemeIcon,
  Loader,
  TextInput,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCircleCheck,
  IconCircleX,
  IconMail,
} from '@tabler/icons-react';
import { Logo } from '@/presentation/components/Logo';
import { AuthClient } from '@/infrastructure/api/auth-client';

type VerificationState = 'loading' | 'success' | 'error' | 'expired';

export function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('Token de verificación no encontrado');
      return;
    }

    verifyToken(token);
  }, [token]);

  const verifyToken = async (verificationToken: string) => {
    try {
      const response = await AuthClient.verifyEmail(verificationToken);
      setState('success');
      setMessage(
        response.data.message || 'Correo electrónico verificado exitosamente'
      );
    } catch (err: any) {
      const errorMsg = err.message || 'Error al verificar el correo';

      // Check if token expired
      if (errorMsg.includes('expirado') || errorMsg.includes('expired')) {
        setState('expired');
      } else {
        setState('error');
      }
      setMessage(errorMsg);
    }
  };

  const handleResend = async () => {
    if (!resendEmail.trim()) {
      return;
    }

    setIsResending(true);
    try {
      await AuthClient.resendVerification(resendEmail);
      setResendSuccess(true);
    } catch (err: any) {
      setMessage(err.message || 'Error al reenviar verificación');
    } finally {
      setIsResending(false);
    }
  };

  // Loading State
  if (state === 'loading') {
    return (
      <Center
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--mantine-color-gray-0)',
        }}
      >
        <Box w={{ base: '90%', sm: 450 }}>
          <Stack gap='xl' align='center'>
            <Logo width={350} height={180} />

            <Paper shadow='xl' p='xl' radius='lg' w='100%' withBorder>
              <Stack gap='lg' align='center'>
                <Loader size='xl' color='magenta' />
                <div>
                  <Title order={2} size='h3' ta='center' c='dark.9' mb='xs'>
                    Verificando tu correo...
                  </Title>
                  <Text size='sm' c='dark.6' ta='center'>
                    Por favor, espera un momento
                  </Text>
                </div>
              </Stack>
            </Paper>

            <Text size='xs' c='dark.7' ta='center'>
              Sistema de Gestión de Envíos - Gioia Transporte
            </Text>
          </Stack>
        </Box>
      </Center>
    );
  }

  // Success State
  if (state === 'success') {
    return (
      <Center
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--mantine-color-gray-0)',
        }}
      >
        <Box w={{ base: '90%', sm: 450 }}>
          <Stack gap='xl' align='center'>
            <Logo width={350} height={180} />

            <Paper shadow='xl' p='xl' radius='lg' w='100%' withBorder>
              <Stack gap='lg' align='center'>
                <ThemeIcon size={80} radius='xl' variant='light' color='green'>
                  <IconCircleCheck size={50} />
                </ThemeIcon>

                <div>
                  <Title order={2} size='h3' ta='center' c='dark.9' mb='xs'>
                    ¡Email Verificado!
                  </Title>
                  <Text
                    size='sm'
                    c='dark.6'
                    ta='center'
                    style={{ lineHeight: 1.6 }}
                  >
                    {message}
                  </Text>
                </div>

                <Alert
                  icon={<IconCircleCheck size={16} />}
                  title='Cuenta activada'
                  color='green'
                  variant='light'
                  w='100%'
                >
                  <Text size='sm'>
                    Tu cuenta ha sido verificada exitosamente. Ya podés iniciar
                    sesión.
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
                    Iniciar Sesión
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
      </Center>
    );
  }

  // Error or Expired State
  return (
    <Center
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--mantine-color-gray-0)',
      }}
    >
      <Box w={{ base: '90%', sm: 450 }}>
        <Stack gap='xl' align='center'>
          <Logo width={350} height={180} />

          <Paper shadow='xl' p='xl' radius='lg' w='100%' withBorder>
            <Stack gap='lg' align='center'>
              <ThemeIcon
                size={80}
                radius='xl'
                variant='light'
                color={state === 'expired' ? 'orange' : 'red'}
              >
                {state === 'expired' ? (
                  <IconMail size={50} />
                ) : (
                  <IconCircleX size={50} />
                )}
              </ThemeIcon>

              <div>
                <Title order={2} size='h3' ta='center' c='dark.9' mb='xs'>
                  {state === 'expired'
                    ? 'Enlace Expirado'
                    : 'Error de Verificación'}
                </Title>
                <Text
                  size='sm'
                  c='dark.6'
                  ta='center'
                  style={{ lineHeight: 1.6 }}
                >
                  {message}
                </Text>
              </div>

              {state === 'expired' && !resendSuccess && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title='Reenviar verificación'
                  color='orange'
                  variant='light'
                  w='100%'
                >
                  <Stack gap='sm'>
                    <Text size='sm'>
                      El enlace de verificación ha expirado. Ingresá tu email
                      para recibir un nuevo enlace.
                    </Text>
                    <TextInput
                      placeholder='tu@email.com'
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      leftSection={<IconMail size={16} />}
                    />
                    <Button
                      color='magenta'
                      size='sm'
                      fullWidth
                      loading={isResending}
                      onClick={handleResend}
                      disabled={!resendEmail.trim()}
                    >
                      Reenviar Email de Verificación
                    </Button>
                  </Stack>
                </Alert>
              )}

              {resendSuccess && (
                <Alert
                  icon={<IconCircleCheck size={16} />}
                  title='Email enviado'
                  color='green'
                  variant='light'
                  w='100%'
                >
                  <Text size='sm'>
                    Se ha enviado un nuevo enlace de verificación a tu correo.
                  </Text>
                </Alert>
              )}

              <Stack gap='sm' w='100%'>
                <Button
                  component='a'
                  href='/register'
                  variant='light'
                  color='magenta'
                  size='md'
                  fullWidth
                >
                  Volver a Registro
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
    </Center>
  );
}
