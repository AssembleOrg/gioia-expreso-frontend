'use client';

import { Container, Group, Button, Box, Burger, Drawer, Stack } from '@mantine/core';
import { Logo } from '@/presentation/components/Logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import {
  IconLogin,
  IconUserPlus,
  IconHome,
  IconCalculator,
} from '@tabler/icons-react';

export function Header() {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <Box
      component='header'
      py='md'
      style={{
        borderBottom: '1px solid var(--mantine-color-gray-2)',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Container size='xl'>
        <Group justify='space-between' align='center'>
          <Link
            href='/'
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Logo width={200} height={80} />
          </Link>

          {/* Desktop Navigation */}
          <Group gap='sm' visibleFrom='sm'>
            <Button
              component={Link}
              href='/'
              variant={pathname === '/' ? 'filled' : 'subtle'}
              color='magenta'
              size='sm'
              radius='md'
            >
              Inicio
            </Button>
            <Button
              component={Link}
              href='/calculadora'
              variant={pathname === '/calculadora' ? 'filled' : 'subtle'}
              color='magenta'
              size='sm'
              radius='md'
            >
              Cotizar envío
            </Button>
            <Button
              component={Link}
              href='/login'
              variant='outline'
              color='magenta'
              size='sm'
              radius='md'
              leftSection={<IconLogin size={12} />}
            >
              Acceso
            </Button>
            <Button
              component={Link}
              href='/register'
              variant='filled'
              color='magenta'
              size='sm'
              radius='md'
              leftSection={<IconUserPlus size={12} />}
            >
              Registrarse
            </Button>
          </Group>

          {/* Mobile Burger */}
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom='sm'
            size='sm'
            color='var(--mantine-color-magenta-8)'
          />
        </Group>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        size='250px'
        padding='md'
        title='Menú'
        hiddenFrom='sm'
        position='right'
        styles={{ title: { color: 'var(--mantine-color-dark-7)' } }}
      >
        <Stack gap='sm'>
          <Button
            component={Link}
            href='/'
            variant='subtle'
            color='magenta'
            fullWidth
            justify='start'
            leftSection={<IconHome size={16} />}
            onClick={close}
          >
            Inicio
          </Button>
          <Button
            component={Link}
            href='/calculadora'
            variant='subtle'
            color='magenta'
            fullWidth
            justify='start'
            leftSection={<IconCalculator size={16} />}
            onClick={close}
          >
            Cotizar envío
          </Button>
          <Button
            component={Link}
            href='/login'
            variant='subtle'
            color='magenta'
            fullWidth
            justify='start'
            leftSection={<IconLogin size={16} />}
            onClick={close}
          >
            Acceso
          </Button>
          <Button
            component={Link}
            href='/register'
            variant='subtle'
            color='magenta'
            fullWidth
            justify='start'
            leftSection={<IconUserPlus size={16} />}
            onClick={close}
          >
            Registrarse
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
}
