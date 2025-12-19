'use client';

import { useState } from 'react';
import { useForm } from '@mantine/form';
import { useDispatchStore } from '@/application/stores/dispatch-store';
import {
  Stack,
  TextInput,
  NumberInput,
  Group,
  Button,
  Card,
  Text,
  SimpleGrid,
  Alert,
} from '@mantine/core';
import { IconArrowRight, IconArrowLeft, IconCopy, IconLock, IconInfoCircle } from '@tabler/icons-react';
import type { Paquete } from '@/domain/dispatch/types';
import { useAuthStore } from '@/application/stores/auth-store';

interface PaqueteFormData extends Paquete {}

interface PaquetesFormProps {
  onNext: () => void;
}

export function PaquetesForm({ onNext }: PaquetesFormProps) {
  const { cotizacion, updatePaquetes, paquetes } = useDispatchStore();
  const { user } = useAuthStore();
  const canEditDetails = user?.role === 'ADMIN' || user?.role === 'SUBADMIN';
  const totalBultos = cotizacion?.bultos.length || 1;

  const [currentBulto, setCurrentBulto] = useState(0);
  const [paquetesData, setPaquetesData] = useState<PaqueteFormData[]>(() => {
    // Si ya hay paquetes en el store, usarlos (navegación hacia atrás)
    if (paquetes && paquetes.length > 0) {
      return paquetes;
    }

    // Sino, inicializar desde cotizacion
    return Array(totalBultos)
      .fill(null)
      .map((_, idx) => ({
        descripcion: '',
        peso: cotizacion?.bultos[idx]?.peso || 0,
        valor_declarado: cotizacion?.bultos[idx]?.valor_declarado || 0,
        dimensiones: cotizacion?.bultos[idx]?.dimensiones || {
          alto: 0,
          ancho: 0,
          largo: 0,
        },
      }));
  });

  const form = useForm<PaqueteFormData>({
    initialValues: paquetesData[currentBulto],
    validate: {
      descripcion: (val) => (!val ? 'Descripción requerida' : null),
      peso: (val) => (val <= 0 ? 'Peso debe ser mayor a 0' : null),
      valor_declarado: (val) =>
        val <= 0 ? 'Valor declarado debe ser mayor a 0' : null,
    },
  });

  const handleBultoChange = (direction: 'next' | 'prev') => {
    // NO guardar aquí para evitar race condition
    // Solo cambiar índice
    const newIdx = direction === 'next' ? currentBulto + 1 : currentBulto - 1;
    setCurrentBulto(newIdx);
    form.setValues(paquetesData[newIdx]);
  };

  const handleFieldBlur = () => {
    // Guardar valor actual en paquetesData cuando pierdes foco
    const updated = [...paquetesData];
    updated[currentBulto] = form.values;
    setPaquetesData(updated);
  };

  const handleSubmit = (values: PaqueteFormData) => {
    // Guardar último bulto
    const finalData = [...paquetesData];
    finalData[currentBulto] = values;

    // Guardar en store
    updatePaquetes(finalData);

    // Siguiente paso
    onNext();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack
        gap='lg'
        mt='xl'
      >
        <Text
          size='lg'
          fw={600}
          c='dark.9'
        >
          Detalles de los Paquetes
        </Text>

        <Card
          withBorder
          p='lg'
        >
          <Stack gap='md'>
            <Group
              justify='space-between'
              align='center'
            >
              <Text
                size='sm'
                fw={500}
                c='dark.7'
              >
                Bulto {currentBulto + 1} de {totalBultos}
              </Text>

              {currentBulto > 0 &&
                paquetesData[currentBulto - 1].dimensiones && (
                  <Button
                    variant='light'
                    size='xs'
                    leftSection={<IconCopy size={16} />}
                    onClick={() => {
                      const prevDims =
                        paquetesData[currentBulto - 1].dimensiones;
                      if (prevDims) {
                        form.setFieldValue('dimensiones', { ...prevDims });
                        handleFieldBlur();
                      }
                    }}
                  >
                    Copiar dimensiones del Bulto {currentBulto}
                  </Button>
                )}
            </Group>

            {/* Information Alert about locking */}
            {!canEditDetails && (
              <Alert icon={<IconInfoCircle size={16} />} title="Campos bloqueados" color="red.9" variant="light">
                <Text size="sm" c="dark.7">
                  Los detalles de peso y dimensiones están bloqueados para garantizar que coincidan con la cotización. Si necesitas cambiarlos, vuelve al paso anterior.
                </Text>
              </Alert>
            )}

            <TextInput
              label='Descripción del contenido'
              placeholder='Ej: Ropa, Electrónicos, Documentos'
              required
              {...form.getInputProps('descripcion')}
              onBlur={handleFieldBlur}
            />

            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <NumberInput
                label='Peso (kg)'
                placeholder='0.00'
                min={0.1}
                step={0.1}
                decimalScale={2}
                required
                disabled={!canEditDetails}
                rightSection={!canEditDetails && <IconLock size={16} color="gray" />}
                {...form.getInputProps('peso')}
                onBlur={handleFieldBlur}
              />

              <NumberInput
                label='Valor Declarado'
                placeholder='0.00'
                prefix='$'
                min={0}
                decimalScale={2}
                required
                disabled={!canEditDetails}
                rightSection={!canEditDetails && <IconLock size={16} color="gray" />}
                {...form.getInputProps('valor_declarado')}
                onBlur={handleFieldBlur}
              />
            </SimpleGrid>

            <div>
              <Text
                size='sm'
                fw={500}
                mb='xs'
                c='dark.7'
              >
                Dimensiones (cm) - Opcional
              </Text>
              <SimpleGrid cols={{ base: 1, xs: 3 }}>
                <NumberInput
                  label='Alto'
                  placeholder='0'
                  min={0}
                  disabled={!canEditDetails}
                  {...form.getInputProps('dimensiones.alto')}
                  onBlur={handleFieldBlur}
                />
                <NumberInput
                  label='Ancho'
                  placeholder='0'
                  min={0}
                  disabled={!canEditDetails}
                  {...form.getInputProps('dimensiones.ancho')}
                  onBlur={handleFieldBlur}
                />
                <NumberInput
                  label='Largo'
                  placeholder='0'
                  min={0}
                  disabled={!canEditDetails}
                  {...form.getInputProps('dimensiones.largo')}
                  onBlur={handleFieldBlur}
                />
              </SimpleGrid>
            </div>
          </Stack>
        </Card>

        {/* Navegación entre bultos */}
        {totalBultos > 1 && (
          <Group justify='space-between'>
            <Button
              variant='subtle'
              leftSection={<IconArrowLeft size={16} />}
              disabled={currentBulto === 0}
              onClick={() => handleBultoChange('prev')}
            >
              Bulto Anterior
            </Button>

            {currentBulto < totalBultos - 1 && (
              <Button
                variant='light'
                rightSection={<IconArrowRight size={16} />}
                onClick={() => handleBultoChange('next')}
              >
                Bulto Siguiente
              </Button>
            )}
          </Group>
        )}

        {/* Submit (solo en último bulto) */}
        {currentBulto === totalBultos - 1 && (
          <Group justify='flex-end'>
            <Button
              type='submit'
              color='magenta'
              rightSection={<IconArrowRight size={16} />}
            >
              Siguiente
            </Button>
          </Group>
        )}
      </Stack>
    </form>
  );
}
