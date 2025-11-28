'use client';

import {
  Container,
  Title,
  Stack,
  Grid,
  Card,
  Text,
  Box,
  Paper,
  Button,
  TextInput,
} from '@mantine/core';
import {
  IconClock,
  IconShield,
  IconUsers,
  IconCheck,
  IconPackage,
  IconSearch,
  IconMapPin,
  IconTruck,
} from '@tabler/icons-react';

export function Home() {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      }}
    >
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Hero Quote Section */}
          <Paper
            p="xl"
            radius="lg"
            style={{
              background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Stack gap="lg" align="center" ta="center">
              <Box
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: 'var(--mantine-color-magenta-1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconCheck size={32} color="var(--mantine-color-magenta-6)" />
              </Box>
              <Text
                size="xl"
                fw={900}
                c="dark.9"
                style={{ fontFamily: 'Poppins', lineHeight: 1.6 }}
                maw={800}
              >
                En Transporte Gioia, cada envío importa. Nos adaptamos a los
                cambios, incorporamos tecnología y apostamos al vínculo con
                nuestros clientes.
              </Text>
              <Box
                style={{
                  width: 100,
                  height: 4,
                  backgroundColor: 'var(--mantine-color-magenta-3)',
                  borderRadius: 2,
                }}
              />
              <Text
                size="lg"
                c="dark.7"
                style={{ fontFamily: 'Poppins', fontWeight: 300 }}
                maw={700}
              >
                Nuestro compromiso es simple:{' '}
                <Text
                  span
                  c="magenta"
                  fw={900}
                  style={{ fontFamily: 'Poppins' }}
                >
                  entregar a tiempo, en forma, y con total responsabilidad.
                </Text>
              </Text>
            </Stack>
          </Paper>

          {/* Features Cards */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card
                padding="xl"
                radius="lg"
                shadow="md"
                style={{ backgroundColor: 'white', height: '100%' }}
              >
                <Stack gap="md" align="center" ta="center">
                  <Box
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      backgroundColor: 'var(--mantine-color-magenta-1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconClock size={36} color="var(--mantine-color-magenta-6)" />
                  </Box>
                  <Title order={3} size="h4" fw={900} style={{ fontFamily: 'Poppins' }}>
                    Puntualidad
                  </Title>
                  <Text
                    size="sm"
                    c="dark.7"
                    style={{ fontFamily: 'Poppins', fontWeight: 300, lineHeight: 1.6 }}
                  >
                    Cumplimos con los plazos acordados. Tu tiempo es valioso y lo
                    respetamos en cada envío.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card
                padding="xl"
                radius="lg"
                shadow="md"
                style={{ backgroundColor: 'white', height: '100%' }}
              >
                <Stack gap="md" align="center" ta="center">
                  <Box
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      backgroundColor: 'var(--mantine-color-magenta-1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconShield size={36} color="var(--mantine-color-magenta-6)" />
                  </Box>
                  <Title order={3} size="h4" fw={900} style={{ fontFamily: 'Poppins' }}>
                    Seguridad
                  </Title>
                  <Text
                    size="sm"
                    c="dark.7"
                    style={{ fontFamily: 'Poppins', fontWeight: 300, lineHeight: 1.6 }}
                  >
                    Protegemos tu mercadería con equipos modernos y personal
                    capacitado en manipulación de cargas.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card
                padding="xl"
                radius="lg"
                shadow="md"
                style={{ backgroundColor: 'white', height: '100%' }}
              >
                <Stack gap="md" align="center" ta="center">
                  <Box
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      backgroundColor: 'var(--mantine-color-magenta-1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconUsers size={36} color="var(--mantine-color-magenta-6)" />
                  </Box>
                  <Title order={3} size="h4" fw={900} style={{ fontFamily: 'Poppins' }}>
                    Atención Personalizada
                  </Title>
                  <Text
                    size="sm"
                    c="dark.7"
                    style={{ fontFamily: 'Poppins', fontWeight: 300, lineHeight: 1.6 }}
                  >
                    Te escuchamos y diseñamos soluciones a tu medida. Cada cliente
                    es único para nosotros.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          {/* Who We Are Section */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Paper
                p="xl"
                radius="lg"
                style={{
                  background: 'linear-gradient(135deg, #8B1A3D 0%, #a02050 100%)',
                  color: 'white',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Stack gap="lg" align="center" ta="center">
                  <Box
                    style={{
                      position: 'absolute',
                      top: 20,
                      left: 20,
                      opacity: 0.3,
                    }}
                  >
                    <IconTruck size={40} color="white" />
                  </Box>
                  <Title
                    order={1}
                    size="h1"
                    fw={900}
                    style={{ fontFamily: 'Poppins', color: 'white' }}
                  >
                    ¿QUIÉNES SOMOS?
                  </Title>
                </Stack>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Card padding="xl" radius="lg" shadow="md" style={{ backgroundColor: 'white' }}>
                <Stack gap="lg">
                  <Title order={2} size="h3" fw={900} style={{ fontFamily: 'Poppins' }}>
                    Identidad de la Empresa
                  </Title>
                  <Stack gap="md">
                    <Text
                      size="md"
                      c="dark.7"
                      style={{ fontFamily: 'Poppins', fontWeight: 300, lineHeight: 1.8 }}
                    >
                      Somos una empresa de transporte con más de{' '}
                      <Text
                        span
                        c="magenta"
                        fw={900}
                        style={{ fontFamily: 'Poppins' }}
                      >
                        15 años de experiencia
                      </Text>{' '}
                      en el sector. Nacimos en un barrio trabajador y crecimos
                      apostando a la mejora continua.
                    </Text>
                    <Text
                      size="md"
                      c="dark.7"
                      style={{ fontFamily: 'Poppins', fontWeight: 300, lineHeight: 1.8 }}
                    >
                      Hoy, contamos con un{' '}
                      <Text
                        span
                        c="magenta"
                        fw={900}
                        style={{ fontFamily: 'Poppins' }}
                      >
                        equipo altamente capacitado
                      </Text>{' '}
                      y una{' '}
                      <Text
                        span
                        c="magenta"
                        fw={900}
                        style={{ fontFamily: 'Poppins' }}
                      >
                        flota equipada
                      </Text>{' '}
                      para dar respuesta a cada necesidad logística.
                    </Text>
                    <Text
                      size="md"
                      c="dark.7"
                      style={{ fontFamily: 'Poppins', fontWeight: 300, lineHeight: 1.8 }}
                    >
                      Desde el corazón del Gran Buenos Aires, nos expandimos para
                      ofrecer soluciones de transporte confiables, seguras y puntuales
                      a empresas y particulares de toda la región.
                    </Text>
                  </Stack>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          {/* Track Order Section */}
          <Paper
            p="xl"
            radius="lg"
            shadow="md"
            style={{ backgroundColor: 'white' }}
          >
            <Stack gap="xl" align="center" ta="center">
              <Stack gap="xs" align="center">
                <Title 
                  order={1} 
                  size="h1" 
                  fw={900} 
                  c="dark.9"
                  style={{ fontFamily: 'Poppins', lineHeight: 1.2 }}
                >
                  Rastrea tu Pedido
                </Title>
                <Text
                  size="md"
                  c="dark.7"
                  style={{ fontFamily: 'Poppins', fontWeight: 300 }}
                  maw={600}
                >
                  Ingresa el número de seguimiento para conocer el estado actual de
                  tu envío en tiempo real
                </Text>
                <Box
                  style={{
                    width: 80,
                    height: 3,
                    backgroundColor: 'var(--mantine-color-magenta-3)',
                    borderRadius: 2,
                  }}
                />
              </Stack>

              <Card
                padding="xl"
                radius="lg"
                style={{
                  backgroundColor: 'var(--mantine-color-gray-0)',
                  width: '100%',
                  maxWidth: 600,
                }}
              >
                <Stack gap="md">
                  <TextInput
                    label="Número de Seguimiento"
                    placeholder="Ej: GIO-2025-001234"
                    size="lg"
                    rightSection={<IconPackage size={20} />}
                    styles={{
                      input: {
                        fontSize: '1rem',
                        fontFamily: 'Poppins',
                      },
                      label: {
                        fontFamily: 'Poppins',
                        fontWeight: 900,
                      },
                    }}
                  />
                  <Button
                    size="lg"
                    color="magenta"
                    fullWidth
                    leftSection={<IconSearch size={20} />}
                    style={{
                      fontFamily: 'Poppins',
                      fontWeight: 900,
                    }}
                  >
                    Rastrear Pedido
                  </Button>
                </Stack>
              </Card>

              <Grid mt="xl" style={{ width: '100%' }}>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Stack gap="xs" align="center" ta="center">
                    <Box
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'var(--mantine-color-magenta-1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconPackage size={28} color="var(--mantine-color-magenta-6)" />
                    </Box>
                    <Title order={4} size="h5" fw={900} style={{ fontFamily: 'Poppins' }}>
                      Seguimiento 24/7
                    </Title>
                    <Text
                      size="sm"
                      c="dark.6"
                      style={{ fontFamily: 'Poppins', fontWeight: 300 }}
                    >
                      Rastrea tu pedido en cualquier momento, desde cualquier lugar
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Stack gap="xs" align="center" ta="center">
                    <Box
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'var(--mantine-color-magenta-1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconTruck size={28} color="var(--mantine-color-magenta-6)" />
                    </Box>
                    <Title order={4} size="h5" fw={900} style={{ fontFamily: 'Poppins' }}>
                      Actualizaciones en Tiempo Real
                    </Title>
                    <Text
                      size="sm"
                      c="dark.6"
                      style={{ fontFamily: 'Poppins', fontWeight: 300 }}
                    >
                      Recibe notificaciones sobre el estado de tu envío
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Stack gap="xs" align="center" ta="center">
                    <Box
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'var(--mantine-color-magenta-1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconMapPin size={28} color="var(--mantine-color-magenta-6)" />
                    </Box>
                    <Title order={4} size="h5" fw={900} style={{ fontFamily: 'Poppins' }}>
                      Ubicación Precisa
                    </Title>
                    <Text
                      size="sm"
                      c="dark.6"
                      style={{ fontFamily: 'Poppins', fontWeight: 300 }}
                    >
                      Conoce exactamente dónde se encuentra tu pedido
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
