'use client';

import Link from 'next/link';
import { Group, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <Group gap="xs" mb="md">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Group gap="xs" key={item.label}>
            {item.path && !isLast ? (
              <Text
                component={Link}
                href={item.path}
                size="sm"
                c="dark.7"
                style={{
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--mantine-color-magenta-8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--mantine-color-dark-7)';
                }}
              >
                {item.label}
              </Text>
            ) : (
              <Text size="sm" fw={600} c="dark.9">
                {item.label}
              </Text>
            )}

            {!isLast && (
              <IconChevronRight size={14} color="var(--mantine-color-gray-5)" />
            )}
          </Group>
        );
      })}
    </Group>
  );
}
