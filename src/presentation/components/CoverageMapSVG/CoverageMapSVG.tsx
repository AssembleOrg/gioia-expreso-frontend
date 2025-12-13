'use client';

import { Container, Title, Text, Badge, Stack, Box, Group, Grid } from '@mantine/core';
import { IconTruck } from '@tabler/icons-react';
import { ArgentinaSVG } from './ArgentinaSVG';
import styles from './CoverageMapSVG.module.css';

const BUENOS_AIRES_CITIES = ['GBA Sur', 'Capital Federal', 'Zona Norte', 'Zona Oeste'];
const ENTRE_RIOS_CITIES = ['Paraná', 'Concordia', 'Gualeguaychú', 'Colón'];

export function CoverageMapSVG() {
  return (
    <section className={styles.section}>
      <Container size="xl">
        <Stack gap="xl" align="center">
          {/* Header */}
          <Stack gap="xs" align="center" ta="center">
            <Badge color="magenta" variant="light" size="lg">
              Cobertura
            </Badge>
            <Title
              order={2}
              size="h1"
              fw={900}
              c="dark.9"
              style={{ fontFamily: 'Poppins' }}
            >
              Nuestras Rutas
            </Title>
            <Text c="dark.6" size="lg" maw={600} style={{ fontFamily: 'Poppins', fontWeight: 300 }}>
              Conectamos Buenos Aires con Entre Ríos de forma segura y eficiente
            </Text>
          </Stack>

          {/* Map Container */}
          <Box className={styles.mapWrapper}>
            <Box className={styles.mapContainer}>
              <ArgentinaSVG className={styles.map} />

              {/* Floating Badge */}
              <Box className={styles.floatingBadge}>
                <IconTruck size={20} />
                <Text fw={700} size="sm">24-48hs</Text>
              </Box>
            </Box>

            {/* Legend */}
            <Group className={styles.legend} gap="lg" justify="center">
              <Group gap="xs">
                <Box className={styles.legendDotBA} />
                <Text size="sm" c="dark.7">Buenos Aires</Text>
              </Group>
              <Group gap="xs">
                <Box className={styles.legendDotER} />
                <Text size="sm" c="dark.7">Entre Ríos</Text>
              </Group>
            </Group>
          </Box>

          {/* Cities Grid */}
          <Grid gutter="xl" justify="center" style={{ width: '100%', maxWidth: 600 }}>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Box className={styles.citiesCard}>
                <Text className={styles.citiesTitle}>Buenos Aires</Text>
                <Stack gap="xs">
                  {BUENOS_AIRES_CITIES.map((city) => (
                    <Group key={city} gap="xs">
                      <Box className={styles.cityDot} />
                      <Text size="sm" c="dark.7">{city}</Text>
                    </Group>
                  ))}
                </Stack>
              </Box>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Box className={styles.citiesCard}>
                <Text className={styles.citiesTitle}>Entre Ríos</Text>
                <Stack gap="xs">
                  {ENTRE_RIOS_CITIES.map((city) => (
                    <Group key={city} gap="xs">
                      <Box className={styles.cityDot} />
                      <Text size="sm" c="dark.7">{city}</Text>
                    </Group>
                  ))}
                </Stack>
              </Box>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </section>
  );
}
