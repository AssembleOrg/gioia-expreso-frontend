"use client";

import {
  Container,
  Title,
  Stack,
  Grid,
  Button,
  NumberInput,
  Card,
  Group,
  Text,
  Alert,
  Box,
  Paper,
  Divider,
  Flex,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { modals } from "@mantine/modals";
import { useCalculatorStore } from "@/application/stores/calculator-store";
import { LocalidadAutocomplete } from "@/presentation/components/LocalidadAutocomplete";
import { PackageSelector } from "@/presentation/components/PackageSelector";
import { CotizacionCard } from "@/presentation/components/CotizacionCard";
import { CurrencyInput } from "@/presentation/components/CurrencyInput";
import { InformationSection } from "@/presentation/components/InformationSection";
import { PREDEFINED_PACKAGES } from "@/domain/calculator/types";
import {
  IconInfoCircle,
  IconAlertCircle,
  IconTruck,
  IconMapPin,
} from "@tabler/icons-react";

export function Calculator() {
  const {
    origenLocalidad,
    destinoLocalidad,
    origenSearchTerm,
    destinoSearchTerm,
    origenSearchResults,
    destinoSearchResults,
    isSearchingOrigen,
    isSearchingDestino,
    hasSearchedOrigen,
    hasSearchedDestino,
    selectedPackageType,
    bulto,
    cotizaciones,
    isLoadingCotizacion,
    error,
    setOrigenSearchTerm,
    setDestinoSearchTerm,
    searchOrigen,
    searchDestino,
    selectOrigen,
    selectDestino,
    clearOrigen,
    clearDestino,
    setSelectedPackageType,
    updateBulto,
    cotizar,
  } = useCalculatorStore();
  const isDisabled = !origenLocalidad || !destinoLocalidad;
  const form = useForm({
    initialValues: {
      cantidad: bulto.cantidad,
      peso: bulto.peso,
      x: bulto.x,
      y: bulto.y,
      z: bulto.z,
      valor_declarado: bulto.valor_declarado,
    },
    validate: {
      cantidad: (value) =>
        value < 1 ? "La cantidad debe ser al menos 1" : null,
      peso: (value) => (value < 0 ? "El peso no puede ser negativo" : null),
      x: (value) =>
        value < 0 ? "Las dimensiones no pueden ser negativas" : null,
      y: (value) =>
        value < 0 ? "Las dimensiones no pueden ser negativas" : null,
      z: (value) =>
        value < 0 ? "Las dimensiones no pueden ser negativas" : null,
      valor_declarado: (value) =>
        value < 0 ? "El valor declarado no puede ser negativo" : null,
    },
  });

  // Sync form with store
  useEffect(() => {
    form.setValues({
      cantidad: bulto.cantidad,
      peso: bulto.peso,
      x: bulto.x,
      y: bulto.y,
      z: bulto.z,
      valor_declarado: bulto.valor_declarado,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulto]);

  // Handle search with debouncing - only search if no localidad is selected or if user is typing
  useEffect(() => {
    // Don't search if a localidad is already selected and the term matches it
    if (origenLocalidad && origenSearchTerm === origenLocalidad.localidad) {
      return;
    }

    if (origenSearchTerm.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchOrigen(origenSearchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      useCalculatorStore.setState({
        origenSearchResults: [],
        hasSearchedOrigen: false,
      });
    }
  }, [origenSearchTerm, searchOrigen, origenLocalidad]);

  useEffect(() => {
    // Don't search if a localidad is already selected and the term matches it
    if (destinoLocalidad && destinoSearchTerm === destinoLocalidad.localidad) {
      return;
    }

    if (destinoSearchTerm.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchDestino(destinoSearchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      useCalculatorStore.setState({
        destinoSearchResults: [],
        hasSearchedDestino: false,
      });
    }
  }, [destinoSearchTerm, searchDestino, destinoLocalidad]);

  const handleSubmit = async (values: typeof form.values) => {
    updateBulto(values);
    await cotizar();
  };

  // Open modal when cotizaciones are available
  useEffect(() => {
    if (cotizaciones.length > 0 && !isLoadingCotizacion) {
      const modalId = modals.open({
        title: "Cotizaciones Disponibles",
        size: "xl",
        children: (
          <Stack gap="xl">
            <Alert color="blue" variant="light" radius="md" p="md">
              <Stack gap="md">
                <Text size="md" c="dark.7" style={{ lineHeight: 1.6 }}>
                  Los valores de cotización son únicamente informativos, no
                  incluyen impuestos y están sujetos a variaciones según cargo
                  por manejo, peso y/o medida reales registradas en el momento
                  de la venta. El valor del envío puede variar en el momento de
                  la entrega en el punto de venta.
                </Text>
                <Text size="md" fw={900} c="dark.9">
                  Los campos con * son obligatorios. El límite de peso de la
                  cotización es de 100 KG por caja o paquete.
                </Text>
              </Stack>
            </Alert>
            <Divider />
            <Grid>
              {cotizaciones.map((cotizacion) => (
                <Grid.Col key={cotizacion.id} span={{ base: 12, sm: 6 }}>
                  <CotizacionCard cotizacion={cotizacion} />
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        ),
        centered: true,
        styles: {
          content: {
            backgroundColor: "white",
          },
          title: {
            fontSize: "1.75rem",
            fontWeight: 900,
            color: "var(--mantine-color-dark-9)",
          },
          body: {
            color: "var(--mantine-color-dark-7)",
            fontSize: "1rem",
          },
        },
      });

      // Cleanup: close modal when component unmounts or cotizaciones change
      return () => {
        modals.close(modalId);
      };
    }
  }, [cotizaciones.length, isLoadingCotizacion]);

  const isCustomPackage = selectedPackageType === "custom";
  const selectedPredefinedPackage = PREDEFINED_PACKAGES.find(
    (pkg) => pkg.id === selectedPackageType
  );

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
      }}
    >
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Hero Section */}
          <Paper
            p="xl"
            radius="lg"
            style={{
              background: "linear-gradient(135deg, #8B1A3D 0%, #a02050 100%)",
              color: "white",
            }}
          >
            <Stack gap="md" align="center" ta="center">
              <IconTruck size={48} stroke={1.5} />
              <Title
                order={1}
                size="h1"
                fw={700}
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
              >
                Cotizá tu envío
              </Title>
              <Text size="lg" opacity={0.9} maw={600}>
                Completa los datos para obtener una cotización instantánea de
                envío
              </Text>
            </Stack>
          </Paper>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="xl">
              {/* Origin and Destination */}
              <Card
                padding="xl"
                radius="lg"
                shadow="md"
                style={{ backgroundColor: "white" }}
              >
                <Stack gap="lg">
                  <Group gap="xs" mb="xs">
                    <IconMapPin
                      size={24}
                      color="var(--mantine-color-magenta-6)"
                    />
                    <Title order={2} size="h3" fw={600}>
                      Origen y Destino
                    </Title>
                  </Group>
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <LocalidadAutocomplete
                        label="Localidad origen"
                        placeholder="Ej.: La Plata"
                        value={origenSearchTerm}
                        onChange={setOrigenSearchTerm}
                        onSelect={selectOrigen}
                        onClear={clearOrigen}
                        searchResults={origenSearchResults}
                        isLoading={isSearchingOrigen}
                        selectedLocalidad={origenLocalidad}
                        hasSearched={hasSearchedOrigen}
                        required
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <LocalidadAutocomplete
                        label="Localidad destino"
                        placeholder="Ej.: Santo Tomé"
                        value={destinoSearchTerm}
                        onChange={setDestinoSearchTerm}
                        onSelect={selectDestino}
                        onClear={clearDestino}
                        searchResults={destinoSearchResults}
                        isLoading={isSearchingDestino}
                        selectedLocalidad={destinoLocalidad}
                        hasSearched={hasSearchedDestino}
                        required
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Código postal"
                        placeholder="Código postal"
                        value={origenLocalidad?.cp || ""}
                        readOnly
                        disabled
                        required
                        styles={{
                          input: {
                            backgroundColor: "var(--mantine-color-gray-0)",
                            cursor: "not-allowed",
                            color: "var(--mantine-color-dark-7)",
                            fontSize: "1rem",
                            fontWeight: 400,
                          },
                          label: {
                            color: "var(--mantine-color-dark-9)",
                          },
                        }}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Código postal"
                        placeholder="Código postal"
                        value={destinoLocalidad?.cp || ""}
                        readOnly
                        disabled
                        required
                        styles={{
                          input: {
                            backgroundColor: "var(--mantine-color-gray-0)",
                            cursor: "not-allowed",
                            color: "var(--mantine-color-dark-7)",
                            fontSize: "1rem",
                            fontWeight: 400,
                          },
                          label: {
                            color: "var(--mantine-color-dark-9)",
                          },
                        }}
                      />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Card>

              {/* Package Selection */}
              <Card
                padding="xl"
                radius="lg"
                shadow="md"
                style={{ backgroundColor: "white" }}
              >
                <Stack gap="lg">
                  <Title order={2} size="h3" fw={600}>
                    Tipo de Paquete
                  </Title>
                  <PackageSelector
                    value={selectedPackageType}
                    onChange={setSelectedPackageType}
                  />
                </Stack>
              </Card>

              {/* Package Details */}
              <Card
                padding="xl"
                radius="lg"
                shadow="md"
                style={{ backgroundColor: "white" }}
              >
                <Stack gap="lg">
                  <Title order={2} size="h3" fw={600}>
                    Detalles del Bulto
                  </Title>
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <NumberInput
                        label="Cantidad"
                        placeholder="Cantidad de bultos"
                        min={1}
                        required
                        size="md"
                        {...form.getInputProps("cantidad")}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <NumberInput
                        label="Peso (kg) por bulto"
                        placeholder="Peso en kilogramos"
                        min={0}
                        decimalScale={2}
                        required
                        size="md"
                        disabled={
                          !isCustomPackage &&
                          selectedPredefinedPackage !== undefined
                        }
                        {...form.getInputProps("peso")}
                      />
                    </Grid.Col>
                    {isCustomPackage && (
                      <>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                          <NumberInput
                            label="Ancho (cm)"
                            placeholder="Ancho"
                            min={0}
                            required
                            size="md"
                            {...form.getInputProps("y")}
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                          <NumberInput
                            label="Largo (cm)"
                            placeholder="Largo"
                            min={0}
                            required
                            size="md"
                            {...form.getInputProps("x")}
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                          <NumberInput
                            label="Alto (cm)"
                            placeholder="Alto"
                            min={0}
                            required
                            size="md"
                            {...form.getInputProps("z")}
                          />
                        </Grid.Col>
                      </>
                    )}
                    {!isCustomPackage && selectedPredefinedPackage && (
                      <Grid.Col span={12}>
                        <Alert
                          icon={<IconInfoCircle size={20} />}
                          color="blue"
                          variant="light"
                          radius="md"
                        >
                          <Text fw={500} mb={4}>
                            Paquete predefinido:{" "}
                            {selectedPredefinedPackage.name}
                          </Text>
                          <Text size="sm">
                            Las dimensiones están predefinidas para este tipo de
                            paquete
                          </Text>
                        </Alert>
                      </Grid.Col>
                    )}
                    <Grid.Col span={12}>
                      <CurrencyInput
                        label="Valor declarado"
                        placeholder="0,00"
                        required
                        size="md"
                        value={form.values.valor_declarado}
                        onChange={(value) => {
                          form.setFieldValue("valor_declarado", value);
                          updateBulto({ valor_declarado: value });
                        }}
                      />
                      <Text size="xs" c="dimmed" mt={6}>
                        Valor por el cual deseas asegurar tu mercancía
                      </Text>
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Card>

              {/* Submit Button */}
              <Flex justify="center" gap="md">
                <Button
                  type="submit"
                  size="xl"
                  color="magenta"
                  loading={isLoadingCotizacion}
                  disabled={isDisabled}
                  radius="md"
                  style={{
                    minWidth: 200,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    // keep opacity 1 so it doesn't look greyed out
                    opacity: 1,
                    // custom disabled colors
                    backgroundColor: isDisabled ? "#ffe0f0" : undefined, // light magenta-ish
                    color: isDisabled ? "#c2255c" : undefined,
                  }}
                  leftSection={<IconTruck size={20} />}
                >
                  {isLoadingCotizacion ? "Cotizando..." : "Cotizar"}
                </Button>
              </Flex>

              {/* Information Section */}
              <InformationSection />

              {/* Error Display */}
              {error && (
                <Alert
                  icon={<IconAlertCircle size={20} />}
                  color="red"
                  variant="light"
                  radius="md"
                  title="Error"
                >
                  {error}
                </Alert>
              )}
            </Stack>
          </form>
        </Stack>
      </Container>
    </Box>
  );
}
