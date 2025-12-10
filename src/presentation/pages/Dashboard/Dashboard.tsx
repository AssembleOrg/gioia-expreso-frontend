'use client';

import { useRouter } from 'next/navigation';
import {
  Container,
  Stack,
  Title,
  Text,
  Card,
  Button,
  SimpleGrid,
  Box,
} from '@mantine/core';
import Image from 'next/image';
import { useAuthStore } from '@/application/stores/auth-store';
import { AppHeader } from '@/presentation/components/AppHeader';

export function Dashboard() {
  const { user } = useAuthStore();
  const router = useRouter();

  const handleNewShipment = () => {
    router.push('/dispatch');
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--mantine-color-gray-0)',
      }}
    >
      <AppHeader />

      {/* Dashboard Content */}
      <Container
        size='xl'
        px='md'
      >
        <Stack gap='lg'>
          {/* Welcome Section */}
          <div>
            <Title
              order={2}
              mb='xs'
              c='dark.9'
            >
              Dashboard
            </Title>
            <Text
              size='sm'
              c='dark.7'
            >
              Bienvenido, {user?.fullname || user?.email}
            </Text>
          </div>

          {/* Main Cards */}
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 4 }}
            spacing='md'
          >
            {/* Nuevo Envío Card */}
            <Card
              shadow='sm'
              padding='lg'
              radius='md'
              withBorder
            >
              <Stack
                gap='md'
                align='center'
              >
                <Image
                  src="/nuevo-envioicon.svg"
                  alt="Nuevo Envío"
                  width={72}
                  height={72}
                />
                <div style={{ textAlign: 'center' }}>
                  <Title
                    order={3}
                    mb='xs'
                    c='dark.9'
                  >
                    Nuevo Envío
                  </Title>
                  <Text
                    size='sm'
                    c='dark.7'
                  >
                    Cotizar y registrar un nuevo envío
                  </Text>
                </div>
                <Button
                  color='magenta'
                  variant='light'
                  fullWidth
                  onClick={handleNewShipment}
                >
                  Ir a Calculadora
                </Button>
              </Stack>
            </Card>

            {/* Lista de Paquetes Card */}
            <Card
              shadow='sm'
              padding='lg'
              radius='md'
              withBorder
            >
              <Stack
                gap='md'
                align='center'
              >
                <Image
                  src="/paquetesicon.svg"
                  alt="Paquetes"
                  width={72}
                  height={72}
                />
                <div style={{ textAlign: 'center' }}>
                  <Title
                    order={3}
                    mb='xs'
                    c='dark.9'
                  >
                    Paquetes
                  </Title>
                  <Text
                    size='sm'
                    c='dark.7'
                  >
                    Ver paquetes y crear repartos
                  </Text>
                </div>
                <Button
                  color='magenta'
                  variant='light'
                  fullWidth
                  onClick={() => router.push('/paquetes')}
                >
                  Ver Paquetes
                </Button>
              </Stack>
            </Card>

            {/* Repartos Card */}
            <Card
              shadow='sm'
              padding='lg'
              radius='md'
              withBorder
            >
              <Stack
                gap='md'
                align='center'
              >
                <Image
                  src="/repartosicon.svg"
                  alt="Repartos"
                  width={72}
                  height={72}
                />
                <div style={{ textAlign: 'center' }}>
                  <Title
                    order={3}
                    mb='xs'
                    c='dark.9'
                  >
                    Repartos
                  </Title>
                  <Text
                    size='sm'
                    c='dark.7'
                  >
                    Gestionar despachos y entregas
                  </Text>
                </div>
                <Button
                  color='magenta'
                  variant='light'
                  fullWidth
                  onClick={() => router.push('/repartos')}
                >
                  Ver Repartos
                </Button>
              </Stack>
            </Card>

            {/* Transportes Card */}
            <Card
              shadow='sm'
              padding='lg'
              radius='md'
              withBorder
            >
              <Stack
                gap='md'
                align='center'
              >
                <Image
                  src="/gestionicon.svg"
                  alt="Transportes"
                  width={72}
                  height={72}
                />
                <div style={{ textAlign: 'center' }}>
                  <Title
                    order={3}
                    mb='xs'
                    c='dark.9'
                  >
                    Transportes
                  </Title>
                  <Text
                    size='sm'
                    c='dark.7'
                  >
                    Administrar vehículos y choferes
                  </Text>
                </div>
                <Button
                  color='magenta'
                  variant='light'
                  fullWidth
                  onClick={() => router.push('/transportes')}
                >
                  Ver Transportes
                </Button>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
