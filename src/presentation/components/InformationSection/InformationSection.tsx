"use client";

import { Card, Stack, Title, Text, Grid, Group, Box } from "@mantine/core";
import { IconHome, IconBuilding, IconTruck } from "@tabler/icons-react";
import Image from "next/image";

export function InformationSection() {
  return (
    <Card
      padding="xl"
      radius="lg"
      shadow="md"
      style={{ backgroundColor: "white" }}
    >
      <Stack gap="xl">
        <Title order={2} size="h3" fw={600}>
          Consideraciones Generales
        </Title>

        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Title order={4} size="h5" fw={600}>
                LOCALIDAD ORIGEN
              </Title>
              <Text size="sm" c="dimmed">
                Localidad donde se carga el bulto.
              </Text>

              <Title order={4} size="h5" fw={600} mt="md">
                LOCALIDAD DESTINO
              </Title>
              <Text size="sm" c="dimmed">
                Localidad donde se descarga el bulto para su posterior entrega.
              </Text>

              <Title order={4} size="h5" fw={600} mt="md">
                VALOR DECLARADO
              </Title>
              <Text size="sm" c="dimmed">
                Costo por el cual deseas asegurar tu mercancía, con el que en
                caso de pérdida, extravío o expoliación; la empresa te
                reembolsará el valor por el cual declaras tus artículos. Para
                los casos en que el mismo supere cinco veces el valor declarado
                mínimo, deberás acompañar la respectiva documentación fiscal o
                suscribir la declaración jurada de valor declarado.
              </Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Title order={4} size="h5" fw={600}>
                DIMENSIONES
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                Tamaño de la caja. Tener en cuenta ancho (A), profundidad (B) y
                largo (C).
              </Text>
              <Box
                style={{
                  width: "100%",
                  height: 180,
                  border: "2px solid var(--mantine-color-gray-4)",
                  borderRadius: "8px",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--mantine-color-gray-0)",
                }}
              >
                <Image
                  src="/dimensiones.548b5b3c.svg"
                  alt="Dimensiones de la caja - Ancho (A), Profundidad (B) y Largo (C)"
                  width={200}
                  height={160}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </Box>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
              <Box>
                <Group gap="xs" mb="xs">
                  <IconHome size={20} color="var(--mantine-color-magenta-6)" />
                  <Title order={4} size="h5" fw={600}>
                    DOMICILIO A DOMICILIO
                  </Title>
                </Group>
                <Text size="sm" c="dimmed">
                  Pasamos por tu domicilio para retirar el bulto y nos
                  encargamos de entregarlo al destinatario en el domicilio
                  pactado. Solicitar el retiro en sucursal de origen.
                </Text>
              </Box>

              <Box>
                <Group gap="xs" mb="xs">
                  <IconBuilding
                    size={20}
                    color="var(--mantine-color-magenta-6)"
                  />
                  <Title order={4} size="h5" fw={600}>
                    SUCURSAL A SUCURSAL
                  </Title>
                </Group>
                <Text size="sm" c="dimmed">
                  Realizá tu envío desde una de nuestras 90 sucursales. Acercate
                  a la más cercana.
                </Text>
              </Box>

              <Box>
                <Group gap="xs" mb="xs">
                  <IconHome size={20} color="var(--mantine-color-magenta-6)" />
                  <IconTruck size={16} color="var(--mantine-color-magenta-6)" />
                  <IconBuilding
                    size={20}
                    color="var(--mantine-color-magenta-6)"
                  />
                  <Title order={4} size="h5" fw={600}>
                    DOMICILIO A SUCURSAL
                  </Title>
                </Group>
                <Text size="sm" c="dimmed">
                  Pasamos por tu domicilio a retirar el bulto y lo acercamos a
                  una de nuestras 90 sucursales para ser despachado y entregado
                  al destinatario mediante nuestra sucursal o en su domicilio.
                </Text>
              </Box>

              <Box>
                <Group gap="xs" mb="xs">
                  <IconBuilding
                    size={20}
                    color="var(--mantine-color-magenta-6)"
                  />
                  <IconTruck size={16} color="var(--mantine-color-magenta-6)" />
                  <IconHome size={20} color="var(--mantine-color-magenta-6)" />
                  <Title order={4} size="h5" fw={600}>
                    SUCURSAL A DOMICILIO
                  </Title>
                </Group>
                <Text size="sm" c="dimmed">
                  Podés llevar tu envío a tu sucursal más cercana. Nosotros lo
                  entregamos en el domicilio del destinatario.
                </Text>
              </Box>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
}
