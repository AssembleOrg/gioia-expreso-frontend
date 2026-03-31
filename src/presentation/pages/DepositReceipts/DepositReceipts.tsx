'use client';

import { useState, useCallback } from 'react';
import {
  Container,
  Stack,
  Title,
  Text,
  Tabs,
  Card,
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Group,
  Table,
  Pagination,
  Badge,
  Box,
  Alert,
  Loader,
  SimpleGrid,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import {
  IconReceipt,
  IconPlus,
  IconList,
  IconSearch,
  IconCheck,
  IconAlertCircle,
  IconFilterOff,
} from '@tabler/icons-react';
import { AppHeader } from '@/presentation/components/AppHeader';
import { Breadcrumb } from '@/presentation/components/Breadcrumb';
import { PDFDownloadButton } from './components/PDFDownloadButton';
import { DepositReceiptClient } from '@/infrastructure/api/deposit-receipt-client';
import type {
  DepositReceiptData,
  DepositReceiptFilters,
  PaginatedMeta,
} from '@/domain/deposit-receipt/types';

import 'dayjs/locale/es';

export function DepositReceipts() {
  // ===== TAB: Generar Recibo =====
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdReceipt, setCreatedReceipt] = useState<DepositReceiptData | null>(null);

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      dni: '',
      cuit: '',
      email: '',
      description: '',
      timeEstimated: null as Date | null,
      valueAprox: '' as number | string,
      price: '' as number | string,
    },
    validate: {
      firstName: (v) => (!v.trim() ? 'El nombre es obligatorio' : null),
      lastName: (v) => (!v.trim() ? 'El apellido es obligatorio' : null),
      email: (v) => {
        if (!v.trim()) return 'El email es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Email inválido';
        return null;
      },
      dni: (v, values) => {
        if (!v && !values.cuit) return 'Debe ingresar DNI o CUIT';
        return null;
      },
      cuit: (v, values) => {
        if (!v && !values.dni) return 'Debe ingresar DNI o CUIT';
        return null;
      },
      description: (v) => (!v.trim() ? 'La descripción es obligatoria' : null),
      timeEstimated: (v) => (!v ? 'La fecha estimada es obligatoria' : null),
      price: (v) => {
        if (v === '' || v === undefined || v === null) return 'El precio es obligatorio';
        if (Number(v) <= 0) return 'El precio debe ser mayor a 0';
        return null;
      },
    },
  });

  const handleCreate = async (values: typeof form.values) => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        ...(values.dni ? { dni: values.dni.trim() } : {}),
        ...(values.cuit ? { cuit: values.cuit.trim() } : {}),
        email: values.email.trim(),
        description: values.description.trim(),
        timeEstimated: new Date(values.timeEstimated!).toISOString(),
        ...(values.valueAprox !== '' && values.valueAprox !== undefined
          ? { valueAprox: Number(values.valueAprox) }
          : {}),
        price: Number(values.price),
      };

      const result = await DepositReceiptClient.create(payload);
      setCreatedReceipt(result);
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Error al crear el recibo',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleNewReceipt = () => {
    setCreatedReceipt(null);
    setCreateError(null);
    form.reset();
  };

  // ===== TAB: Recibos Creados =====
  const [receipts, setReceipts] = useState<DepositReceiptData[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [filterDni, setFilterDni] = useState('');
  const [filterCuit, setFilterCuit] = useState('');
  const [filterDateRange, setFilterDateRange] = useState<
    [Date | null, Date | null]
  >([null, null]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_LIMIT = 10;

  const fetchReceipts = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setListError(null);
      try {
        const filters: DepositReceiptFilters = {
          page,
          limit: PAGE_LIMIT,
        };
        if (filterDni.trim()) filters.dni = filterDni.trim();
        if (filterCuit.trim()) filters.cuit = filterCuit.trim();
        if (filterDateRange[0]) {
          const start = filterDateRange[0] instanceof Date ? filterDateRange[0] : new Date(filterDateRange[0] as any);
          const sy = start.getFullYear();
          const sm = String(start.getMonth() + 1).padStart(2, '0');
          const sd = String(start.getDate()).padStart(2, '0');
          filters.startDate = `${sy}-${sm}-${sd}T00:00:00.000Z`;
        }
        if (filterDateRange[1]) {
          const end = filterDateRange[1] instanceof Date ? filterDateRange[1] : new Date(filterDateRange[1] as any);
          const ey = end.getFullYear();
          const em = String(end.getMonth() + 1).padStart(2, '0');
          const ed = String(end.getDate()).padStart(2, '0');
          filters.endDate = `${ey}-${em}-${ed}T23:59:59.999Z`;
        }

        const response = await DepositReceiptClient.getPaginated(filters);
        setReceipts(response.data);
        setMeta(response.meta);
        setCurrentPage(page);
        setHasSearched(true);
      } catch (error) {
        setListError(
          error instanceof Error ? error.message : 'Error al obtener recibos',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [filterDni, filterCuit, filterDateRange],
  );

  const handleSearch = () => {
    fetchReceipts(1);
  };

  const handleClearFilters = () => {
    setFilterDni('');
    setFilterCuit('');
    setFilterDateRange([null, null]);
    setReceipts([]);
    setMeta(null);
    setHasSearched(false);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    fetchReceipts(page);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return `$ ${Number(value).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--mantine-color-gray-0)',
      }}
    >
      <AppHeader />

      <Container size="xl" px="md" py="lg">
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Recibos de Depósito' },
          ]}
        />
        <Stack gap="lg">
          <Group gap="sm">
            <IconReceipt size={28} color="var(--mantine-color-magenta-6)" />
            <Title order={2} c="dark.9">
              Recibos de Depósito
            </Title>
          </Group>

          <Tabs defaultValue="create" styles={{ tab: { color: 'var(--mantine-color-dark-7)' } }}>
            <Tabs.List>
              <Tabs.Tab
                value="create"
                leftSection={<IconPlus size={16} />}
              >
                Generar Recibo
              </Tabs.Tab>
              <Tabs.Tab
                value="list"
                leftSection={<IconList size={16} />}
                onClick={() => {
                  if (!hasSearched) fetchReceipts(1);
                }}
              >
                Recibos Creados
              </Tabs.Tab>
            </Tabs.List>

            {/* ========== TAB: Generar Recibo ========== */}
            <Tabs.Panel value="create" pt="md">
              {createdReceipt ? (
                <Card shadow="sm" padding="xl" radius="md" withBorder>
                  <Stack gap="md" align="center">
                    <Badge
                      size="xl"
                      color="green"
                      variant="light"
                      leftSection={<IconCheck size={16} />}
                    >
                      Recibo creado exitosamente
                    </Badge>

                    <Text size="sm" c="dimmed" ta="center">
                      El recibo de depósito para{' '}
                      <Text component="span" fw={700}>
                        {createdReceipt.firstName} {createdReceipt.lastName}
                      </Text>{' '}
                      fue creado correctamente.
                    </Text>

                    <Card
                      withBorder
                      radius="md"
                      padding="md"
                      w="100%"
                      maw={500}
                      style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}
                    >
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">Nombre:</Text>
                          <Text size="sm" fw={600}>{createdReceipt.firstName} {createdReceipt.lastName}</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">{createdReceipt.cuit ? 'CUIT' : 'DNI'}:</Text>
                          <Text size="sm" fw={600}>{createdReceipt.cuit || createdReceipt.dni || '-'}</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">Precio cobrado:</Text>
                          <Text size="sm" fw={700} c="magenta">
                            {formatCurrency(createdReceipt.price)}
                          </Text>
                        </Group>
                      </Stack>
                    </Card>

                    <Group>
                      <PDFDownloadButton data={createdReceipt} />
                      <Button
                        variant="outline"
                        color="magenta"
                        onClick={handleNewReceipt}
                      >
                        Crear otro recibo
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              ) : (
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <form onSubmit={form.onSubmit(handleCreate)}>
                    <Stack gap="md">
                      <Title order={4} c="dark.8">
                        Datos del cliente
                      </Title>

                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <TextInput
                          label="Nombre"
                          placeholder="Ej: Pedro"
                          required
                          {...form.getInputProps('firstName')}
                        />
                        <TextInput
                          label="Apellido"
                          placeholder="Ej: Pérez"
                          required
                          {...form.getInputProps('lastName')}
                        />
                      </SimpleGrid>

                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <TextInput
                          label="DNI"
                          placeholder="Ej: 12345678"
                          description="Obligatorio si no se ingresa CUIT"
                          {...form.getInputProps('dni')}
                        />
                        <TextInput
                          label="CUIT"
                          placeholder="Ej: 20-12345678-9"
                          description="Obligatorio si no se ingresa DNI"
                          {...form.getInputProps('cuit')}
                        />
                      </SimpleGrid>

                      <TextInput
                        label="Email"
                        placeholder="usuario@ejemplo.com"
                        required
                        {...form.getInputProps('email')}
                      />

                      <Title order={4} c="dark.8" mt="sm">
                        Detalle del depósito
                      </Title>

                      <Textarea
                        label="Descripción"
                        placeholder="Describa los artículos a depositar..."
                        required
                        minRows={3}
                        autosize
                        {...form.getInputProps('description')}
                      />

                      <DatePickerInput
                        label="Fecha estimada de retiro"
                        placeholder="Seleccione una fecha"
                        required
                        locale="es"
                        valueFormat="DD/MM/YYYY"
                        minDate={new Date()}
                        {...form.getInputProps('timeEstimated')}
                      />

                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <NumberInput
                          label="Valor estimado (opcional)"
                          description="Valor aproximado de lo que el cliente deja"
                          placeholder="Ej: 50000"
                          prefix="$ "
                          thousandSeparator="."
                          decimalSeparator=","
                          min={0}
                          decimalScale={2}
                          {...form.getInputProps('valueAprox')}
                        />
                        <NumberInput
                          label="Precio cobrado"
                          description="Monto cobrado por almacenamiento"
                          placeholder="Ej: 15000"
                          required
                          prefix="$ "
                          thousandSeparator="."
                          decimalSeparator=","
                          min={0}
                          decimalScale={2}
                          {...form.getInputProps('price')}
                        />
                      </SimpleGrid>

                      {createError && (
                        <Alert
                          color="red"
                          icon={<IconAlertCircle size={16} />}
                          title="Error"
                        >
                          {createError}
                        </Alert>
                      )}

                      <Group justify="flex-end" mt="md">
                        <Button
                          type="submit"
                          color="magenta"
                          loading={isCreating}
                          leftSection={<IconReceipt size={16} />}
                        >
                          Generar Recibo
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Card>
              )}
            </Tabs.Panel>

            {/* ========== TAB: Recibos Creados ========== */}
            <Tabs.Panel value="list" pt="md">
              <Stack gap="md">
                {/* Filters */}
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Stack gap="sm">
                    <Title order={5} c="dark.8">
                      Filtros
                    </Title>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
                      <TextInput
                        label="DNI"
                        placeholder="Buscar por DNI"
                        value={filterDni}
                        onChange={(e) => setFilterDni(e.currentTarget.value)}
                        leftSection={<IconSearch size={14} />}
                      />
                      <TextInput
                        label="CUIT"
                        placeholder="Buscar por CUIT"
                        value={filterCuit}
                        onChange={(e) => setFilterCuit(e.currentTarget.value)}
                        leftSection={<IconSearch size={14} />}
                      />
                      <DatePickerInput
                        type="range"
                        label="Rango de fechas"
                        placeholder="Desde - Hasta"
                        value={
                          [
                            filterDateRange[0] ? new Date(filterDateRange[0]) : null,
                            filterDateRange[1] ? new Date(filterDateRange[1]) : null,
                          ] as [Date | null, Date | null]
                        }
                        onChange={(val) => setFilterDateRange(val as [Date | null, Date | null])}
                        locale="es"
                        valueFormat="DD/MM/YYYY"
                        clearable
                      />
                    </SimpleGrid>
                    <Group>
                      <Button
                        color="magenta"
                        onClick={handleSearch}
                        leftSection={<IconSearch size={16} />}
                        loading={isLoading}
                      >
                        Buscar
                      </Button>
                      <Button
                        variant="light"
                        color="gray"
                        onClick={handleClearFilters}
                        leftSection={<IconFilterOff size={16} />}
                      >
                        Limpiar filtros
                      </Button>
                    </Group>
                  </Stack>
                </Card>

                {/* Error */}
                {listError && (
                  <Alert
                    color="red"
                    icon={<IconAlertCircle size={16} />}
                    title="Error"
                  >
                    {listError}
                  </Alert>
                )}

                {/* Loading */}
                {isLoading && (
                  <Group justify="center" py="xl">
                    <Loader color="magenta" />
                  </Group>
                )}

                {/* Results Table */}
                {!isLoading && hasSearched && (
                  <Card shadow="sm" padding="md" radius="md" withBorder>
                    {receipts.length === 0 ? (
                      <Text ta="center" c="dimmed" py="xl">
                        No se encontraron recibos con los filtros aplicados.
                      </Text>
                    ) : (
                      <>
                        <Table.ScrollContainer minWidth={700}>
                          <Table striped highlightOnHover>
                            <Table.Thead>
                              <Table.Tr>
                                <Table.Th>Nombre</Table.Th>
                                <Table.Th>DNI / CUIT</Table.Th>
                                <Table.Th>Email</Table.Th>
                                <Table.Th>Descripción</Table.Th>
                                <Table.Th>Precio</Table.Th>
                                <Table.Th>Fecha</Table.Th>
                                <Table.Th>Acciones</Table.Th>
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                              {receipts.map((receipt) => (
                                <Table.Tr key={receipt.id}>
                                  <Table.Td>
                                    {receipt.firstName} {receipt.lastName}
                                  </Table.Td>
                                  <Table.Td>
                                    {receipt.cuit ? (
                                      <Badge variant="light" color="blue" size="sm">
                                        CUIT: {receipt.cuit}
                                      </Badge>
                                    ) : (
                                      <Badge variant="light" color="grape" size="sm">
                                        DNI: {receipt.dni}
                                      </Badge>
                                    )}
                                  </Table.Td>
                                  <Table.Td>
                                    <Text size="sm" truncate maw={180}>
                                      {receipt.email}
                                    </Text>
                                  </Table.Td>
                                  <Table.Td>
                                    <Text size="sm" truncate maw={200}>
                                      {receipt.description}
                                    </Text>
                                  </Table.Td>
                                  <Table.Td>
                                    <Text fw={700} c="magenta" size="sm">
                                      {formatCurrency(receipt.price)}
                                    </Text>
                                  </Table.Td>
                                  <Table.Td>
                                    <Text size="sm">
                                      {receipt.createdAt
                                        ? formatDate(receipt.createdAt)
                                        : '-'}
                                    </Text>
                                  </Table.Td>
                                  <Table.Td>
                                    <PDFDownloadButton data={receipt} />
                                  </Table.Td>
                                </Table.Tr>
                              ))}
                            </Table.Tbody>
                          </Table>
                        </Table.ScrollContainer>

                        {/* Pagination */}
                        {meta && meta.totalPages > 1 && (
                          <Group justify="center" mt="md">
                            <Pagination
                              total={meta.totalPages}
                              value={currentPage}
                              onChange={handlePageChange}
                              color="magenta"
                            />
                          </Group>
                        )}

                        {meta && (
                          <Text size="xs" c="dimmed" ta="center" mt="xs">
                            Mostrando {receipts.length} de {meta.total} recibos
                            (Página {meta.page} de {meta.totalPages})
                          </Text>
                        )}
                      </>
                    )}
                  </Card>
                )}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
    </Box>
  );
}
