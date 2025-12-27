'use client';

import { Group, Radio, Stack, Text, Paper, Badge, Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { PREDEFINED_PACKAGES } from '@/domain/calculator/types';
import { IconPackage } from '@tabler/icons-react';

const PACKAGE_IMAGE_SIZES: Record<number, number> = {
  1: 38,
  2: 44,
  3: 50,
  4: 56,
};

interface PackageSelectorProps {
  value: 'custom' | number;
  onChange: (value: 'custom' | number) => void;
}

export function PackageSelector({ value, onChange }: PackageSelectorProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleChange = (val: string) => {
    onChange(val === 'custom' ? 'custom' : Number(val));
  };

  return (
    <Radio.Group
      value={value === 'custom' ? 'custom' : value.toString()}
      onChange={handleChange}
    >
      <Stack gap='md'>
        <Paper
          p='md'
          radius='md'
          withBorder
          style={{
            borderColor:
              value === 'custom' ? 'var(--mantine-color-magenta-6)' : undefined,
            borderWidth: value === 'custom' ? 2 : 1,
            backgroundColor:
              value === 'custom' ? 'var(--mantine-color-magenta-0)' : 'white',
          }}
        >
          <Radio
            value='custom'
            label={
              <Group gap='xs'>
                <IconPackage size={18} />
                <Text
                  size='md'
                  fw={500}
                >
                  Bulto personalizado
                </Text>
              </Group>
            }
          />
        </Paper>
        <Group gap='md'>
          {PREDEFINED_PACKAGES.map((pkg) => (
            <Paper
              key={pkg.id}
              p='md'
              radius='md'
              withBorder
              style={{
                borderColor:
                  value === pkg.id
                    ? 'var(--mantine-color-magenta-6)'
                    : undefined,
                borderWidth: value === pkg.id ? 2 : 1,
                backgroundColor:
                  value === pkg.id ? 'var(--mantine-color-magenta-0)' : 'white',
                flex: 1,
                minWidth: 120,
                overflow: 'hidden',
                height: isMobile ? undefined : 80,
              }}
            >
              <Radio
                value={pkg.id.toString()}
                label={
                  isMobile ? (
                    <Stack
                      gap={4}
                      align='center'
                    >
                      <img
                        src='/gioia-bolsines.svg'
                        alt={pkg.name}
                        style={{
                          width: 28,
                          height: 28,
                          objectFit: 'contain',
                        }}
                      />
                      <Text
                        size='sm'
                        fw={600}
                      >
                        {pkg.name}
                      </Text>
                      <Badge
                        size='xs'
                        variant='light'
                        color='magenta'
                      >
                        Predefinido
                      </Badge>
                    </Stack>
                  ) : (
                    <Group
                      justify='space-between'
                      align='center'
                      style={{ width: '100%' }}
                    >
                      <Stack gap={4}>
                        <Text
                          size='sm'
                          fw={600}
                        >
                          {pkg.name}
                        </Text>
                        <Badge
                          size='xs'
                          variant='light'
                          color='magenta'
                        >
                          Predefinido
                        </Badge>
                      </Stack>
                      <Box
                        style={{
                          flex: 1,
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }}
                      >
                        <img
                          src='/gioia-bolsines.svg'
                          alt={pkg.name}
                          style={{
                            width: PACKAGE_IMAGE_SIZES[pkg.id],
                            height: PACKAGE_IMAGE_SIZES[pkg.id],
                            objectFit: 'contain',
                          }}
                        />
                      </Box>
                    </Group>
                  )
                }
              />
            </Paper>
          ))}
        </Group>
      </Stack>
    </Radio.Group>
  );
}
