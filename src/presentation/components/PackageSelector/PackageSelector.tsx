'use client';

import { Group, Radio, Stack, Text, Paper, Badge } from '@mantine/core';
import { PREDEFINED_PACKAGES } from '@/domain/calculator/types';
import { IconPackage } from '@tabler/icons-react';

interface PackageSelectorProps {
  value: 'custom' | number;
  onChange: (value: 'custom' | number) => void;
}

export function PackageSelector({ value, onChange }: PackageSelectorProps) {
  const handleChange = (val: string) => {
    onChange(val === 'custom' ? 'custom' : Number(val));
  };

  return (
    <Radio.Group
      value={value === 'custom' ? 'custom' : value.toString()}
      onChange={handleChange}
    >
      <Stack gap="md">
        <Paper
          p="md"
          radius="md"
          withBorder
          style={{
            borderColor: value === 'custom' ? 'var(--mantine-color-magenta-6)' : undefined,
            borderWidth: value === 'custom' ? 2 : 1,
            backgroundColor: value === 'custom' ? 'var(--mantine-color-magenta-0)' : 'white',
          }}
        >
          <Radio
            value="custom"
            label={
              <Group gap="xs">
                <IconPackage size={18} />
                <Text size="md" fw={500}>
                  Bulto personalizado
                </Text>
              </Group>
            }
          />
        </Paper>
        <Group gap="md">
          {PREDEFINED_PACKAGES.map((pkg) => (
            <Paper
              key={pkg.id}
              p="md"
              radius="md"
              withBorder
              style={{
                borderColor: value === pkg.id ? 'var(--mantine-color-magenta-6)' : undefined,
                borderWidth: value === pkg.id ? 2 : 1,
                backgroundColor: value === pkg.id ? 'var(--mantine-color-magenta-0)' : 'white',
                flex: 1,
                minWidth: 120,
              }}
            >
              <Radio
                value={pkg.id.toString()}
                label={
                  <Stack gap={4} align="center">
                    <IconPackage size={24} />
                    <Text size="sm" fw={600} ta="center">
                      {pkg.name}
                    </Text>
                    <Badge size="xs" variant="light" color="magenta">
                      Predefinido
                    </Badge>
                  </Stack>
                }
              />
            </Paper>
          ))}
        </Group>
      </Stack>
    </Radio.Group>
  );
}
