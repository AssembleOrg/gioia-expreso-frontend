'use client';

import { Container, Group, Button, Box } from '@mantine/core';
import { Logo } from '@/presentation/components/Logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  return (
    <Box
      component="header"
      py="md"
      style={{
        borderBottom: '1px solid var(--mantine-color-gray-2)',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Container size="xl">
        <Group justify="space-between" align="center">
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Logo width={100} height={40} />
          </Link>
          <Group gap="sm">
            <Button
              component={Link}
              href="/"
              variant={pathname === '/' ? 'filled' : 'subtle'}
              color="magenta"
              size="md"
              radius="md"
            >
              Inicio
            </Button>
            <Button
              component={Link}
              href="/calculadora"
              variant={pathname === '/calculadora' ? 'filled' : 'subtle'}
              color="magenta"
              size="md"
              radius="md"
            >
              Cotizá tu envío
            </Button>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
