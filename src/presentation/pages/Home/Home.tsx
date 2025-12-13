'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import Image from 'next/image';
import {
  Container,
  Title,
  Stack,
  Card,
  Text,
  Box,
  Button,
  TextInput,
  Badge,
  Group,
} from '@mantine/core';
import {
  IconPackage,
  IconSearch,
  IconMapPin,
  IconPhone,
  IconMail,
  IconUsers,
  IconShield,
} from '@tabler/icons-react';
import styles from './Home.module.css';
import { CoverageMapSVG } from '@/presentation/components/CoverageMapSVG';

export function Home() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    const trimmed = trackingNumber.trim();
    if (!trimmed) return;

    try {
      setIsSearching(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/voucher/preorders/voucher/${trimmed}`
      );

      if (!response.ok) throw new Error('No encontrado');

      const result = await response.json();
      const preorderId = result.data.id;

      router.push(`/tracking/${preorderId}`);

    } catch {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Envío no encontrado. Verifica el número de seguimiento.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCotizar = () => {
    router.push('/calculadora');
  };

  const scrollToTracking = () => {
    document.getElementById('tracking-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box style={{ minHeight: '100vh' }}>
      {/* ==========================================
          HERO SECTION - Split Layout
          ========================================== */}
      <section className={styles.heroSection}>
        {/* Imagen con clip-path diagonal */}
        <Box
          className={styles.heroImage}
          style={{ backgroundImage: 'url(/gioia-camion.webp)' }}
        />

        {/* Contenido */}
        <Box className={styles.heroContent}>
          <Stack gap="lg" align="flex-start">
            <Badge size="lg" color="magenta" variant="light" radius="sm">
              Desde 2008
            </Badge>

            <Title order={1} className={styles.heroTitle}>
              TRANSPORTE<br />
              <Text span c="magenta" inherit>
                GIOIA E HIJOS SRL
              </Text>
            </Title>

            <Text className={styles.heroSubtitle} maw={500}>
              Soluciones logísticas desde Lanús a todo el país.
              Cada envío importa, cada cliente es único.
            </Text>

            <Group mt="md" gap="md">
              <Button
                size="lg"
                color="magenta"
                leftSection={<IconPackage size={20} />}
                onClick={handleCotizar}
              >
                Cotizar Envío
              </Button>
              <Button
                size="lg"
                variant="outline"
                color="dark"
                leftSection={<IconSearch size={20} />}
                onClick={scrollToTracking}
              >
                Rastrear Pedido
              </Button>
            </Group>
          </Stack>
        </Box>
      </section>

      {/* ==========================================
          SERVICIOS + COBERTURA WRAPPER (same row on desktop)
          ========================================== */}
      <Box className={styles.serviciosMapaWrapper}>
        {/* SERVICIOS SECTION */}
        <section className={styles.serviciosSection}>
          {/* Columna Izquierda */}
          <Box className={styles.serviciosLeft}>
            <Box className={styles.servicioItem}>
              <Text className={styles.servicioTitle}>Transporte<br />Express</Text>
              <Text className={styles.servicioText}>
                Entregas en 24/48 horas. Ideal para envíos urgentes que necesitan
                llegar rápido y en perfectas condiciones.
              </Text>
            </Box>
          </Box>

          {/* Columna Central - Imagen */}
          <Box className={styles.serviciosCenter}>
            <Image
              src="/man-workers.png"
              alt="Trabajadores de logística"
              width={300}
              height={450}
              className={styles.serviciosCenterImage}
              style={{ objectFit: 'cover' }}
            />
          </Box>

          {/* Columna Derecha */}
          <Box className={styles.serviciosRight}>
            {/* Este solo se muestra en mobile */}
            <Box className={`${styles.servicioItem} ${styles.mobileOnly}`}>
              <Text className={styles.servicioTitle}>Transporte<br />Express</Text>
              <Text className={styles.servicioText}>
                Entregas en 24/48 horas. Ideal para envíos urgentes.
              </Text>
            </Box>
            <Box className={styles.servicioItem}>
              <Text className={styles.servicioTitle}>Encomiendas<br />y Paquetería</Text>
              <Text className={styles.servicioText}>
                Envío seguro de paquetes de todos los tamaños.
                Sistema de seguimiento en tiempo real.
              </Text>
            </Box>
            <Box className={styles.servicioItem}>
              <Text className={styles.servicioTitle}>Mudanzas<br />y Fletes</Text>
              <Text className={styles.servicioText}>
                Servicio completo de mudanzas residenciales y comerciales.
                Personal capacitado para manipulación de cargas.
              </Text>
            </Box>
          </Box>
        </section>

        {/* COBERTURA SECTION */}
        <CoverageMapSVG />
      </Box>

      {/* ==========================================
          QUIÉNES SOMOS SECTION
          ========================================== */}
      <section className={styles.quienesSection}>
        <Container size="xl">
          <div className={styles.quienesGrid}>
            {/* Imagen */}
            <Box className={styles.quienesImage}>
              <Image
                src="/quienesomos.png"
                alt="¿Quiénes Somos? - Transporte Gioia"
                width={400}
                height={400}
                style={{ width: '100%', height: 'auto' }}
              />
            </Box>

            {/* Contenido */}
            <Stack gap="lg">
              <Badge color="magenta" variant="light" size="lg" w="fit-content">
                Nuestra Historia
              </Badge>

              <Title
                order={2}
                size="h1"
                fw={900}
                c="dark.9"
                style={{ fontFamily: 'Poppins' }}
              >
                Identidad de la Empresa
              </Title>

              <Stack gap="md">
                <Text size="md" c="dark.7" style={{ fontFamily: 'Poppins', fontWeight: 300, lineHeight: 1.8 }}>
                  Transporte Gioia e Hijos SRL nació en el barrio de{' '}
                  <Text span c="magenta" fw={700}>Lanús</Text>, zona sur del Gran Buenos Aires,
                  y desde entonces seguimos creciendo y adaptándonos a las nuevas demandas del mercado logístico.
                </Text>

                <Text size="md" c="dark.7" style={{ fontFamily: 'Poppins', fontWeight: 300, lineHeight: 1.8 }}>
                  A través de la{' '}
                  <Text span c="magenta" fw={700}>innovación, la seguridad</Text> y un{' '}
                  <Text span c="magenta" fw={700}>equipo de trabajo capacitado</Text>,
                  ofrecemos soluciones de transporte que garantizan que cada envío llegue a destino, en tiempo y forma.
                </Text>

                <Text size="md" c="dark.7" style={{ fontFamily: 'Poppins', fontWeight: 300, lineHeight: 1.8 }}>
                  Nuestra misión es ser un socio estratégico para cada cliente, ofreciendo calidad,
                  compromiso y responsabilidad en cada entrega.
                </Text>
              </Stack>

              {/* Stats */}
              <div className={styles.statsGrid}>
                <Box className={styles.statItem}>
                  <Text className={styles.statNumber}>15+</Text>
                  <Text className={styles.statLabel}>Años de experiencia</Text>
                </Box>
                <Box className={styles.statItem}>
                  <Box className={styles.statIconWrapper}>
                    <IconUsers size={32} color="var(--mantine-color-magenta-8)" />
                  </Box>
                  <Text className={styles.statLabel}>Equipo capacitado</Text>
                </Box>
                <Box className={styles.statItem}>
                  <Box className={styles.statIconWrapper}>
                    <IconShield size={32} color="var(--mantine-color-magenta-8)" />
                  </Box>
                  <Text className={styles.statLabel}>Envíos seguros</Text>
                </Box>
              </div>
            </Stack>
          </div>
        </Container>
      </section>

      {/* ==========================================
          UBICACIÓN SECTION
          ========================================== */}
      <section className={styles.ubicacionSection}>
        <Container size="xl">
          <div className={styles.ubicacionGrid}>
            {/* Contenido */}
            <Box className={styles.ubicacionContent}>
              <Stack gap="lg">
                <Badge color="magenta" variant="light" size="lg" w="fit-content">
                  Nuestra Ubicación
                </Badge>

                <Title
                  order={2}
                  size="h1"
                  fw={900}
                  c="dark.9"
                  style={{ fontFamily: 'Poppins' }}
                >
                  ¿Dónde estamos?
                </Title>

                <Text size="md" c="dark.7" style={{ fontFamily: 'Poppins', fontWeight: 300, lineHeight: 1.8 }}>
                  Nuestra sede central se encuentra en{' '}
                  <Text span c="magenta" fw={700}>Mendoza 2765, Lanús</Text>,
                  una ubicación estratégica que nos permite optimizar tiempos de carga,
                  distribución y entrega en toda la región.
                </Text>

                <Text size="md" c="dark.7" style={{ fontFamily: 'Poppins', fontWeight: 300, lineHeight: 1.8 }}>
                  Cada envío comienza acá, con dedicación y responsabilidad.
                </Text>

                <Stack gap="sm" mt="md">
                  <Group gap="sm">
                    <IconMapPin size={20} color="var(--mantine-color-magenta-8)" />
                    <Text size="sm" c="dark.7" fw={500}>Mendoza 2765, Lanús, Buenos Aires</Text>
                  </Group>
                  <Group gap="sm">
                    <IconPhone size={20} color="var(--mantine-color-magenta-8)" />
                    <Text size="sm" c="dark.7" fw={500}>+54 11 XXXX-XXXX</Text>
                  </Group>
                  <Group gap="sm">
                    <IconMail size={20} color="var(--mantine-color-magenta-8)" />
                    <Text size="sm" c="dark.7" fw={500}>contacto@transportegioia.com</Text>
                  </Group>
                </Stack>
              </Stack>
            </Box>

            {/* Imagen */}
            <Box className={styles.ubicacionImage}>
              <Image
                src="/dondesomos.png"
                alt="Ubicación - Mendoza 2765, Lanús"
                width={400}
                height={500}
                style={{ width: '100%', height: 'auto' }}
              />
            </Box>
          </div>
        </Container>
      </section>

      {/* ==========================================
          TRACKING SECTION
          ========================================== */}
      <section id="tracking-section" className={styles.trackingSection}>
        <Container size="xl">
          <Stack gap="xl" align="center" ta="center">
            <Stack gap="xs" align="center">
              <Badge color="white" variant="light" size="lg">
                Seguimiento
              </Badge>
              <Title
                order={2}
                size="h1"
                fw={900}
                style={{ fontFamily: 'Poppins', color: 'white' }}
              >
                Rastrea tu Pedido
              </Title>
              <Text
                size="lg"
                style={{ fontFamily: 'Poppins', fontWeight: 300, color: 'rgba(255,255,255,0.8)' }}
                maw={600}
              >
                Ingresa el número de seguimiento para conocer el estado actual de tu envío en tiempo real
              </Text>
            </Stack>

            <Card className={styles.trackingCard} maw={600} w="100%">
              <Stack gap="md">
                <TextInput
                  label="Número de Seguimiento"
                  placeholder="Ej: VCH-XXXXX-XXXX"
                  size="lg"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  rightSection={<IconPackage size={20} color="var(--mantine-color-magenta-8)" />}
                  styles={{
                    input: {
                      fontSize: '1rem',
                      fontFamily: 'Poppins',
                      backgroundColor: 'white',
                    },
                    label: {
                      fontFamily: 'Poppins',
                      fontWeight: 700,
                      color: 'var(--mantine-color-gray-3)',
                      marginBottom: 8,
                    },
                  }}
                />
                <Button
                  size="lg"
                  color="white"
                  variant="filled"
                  fullWidth
                  loading={isSearching}
                  onClick={handleSearch}
                  leftSection={<IconSearch size={20} />}
                  styles={{
                    root: {
                      fontFamily: 'Poppins',
                      fontWeight: 700,
                      color: 'var(--mantine-color-magenta-8)',
                    },
                  }}
                >
                  Rastrear Pedido
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </section>
    </Box>
  );
}
