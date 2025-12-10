'use client';

import { Container, Group, Text, Anchor, Stack, Box } from '@mantine/core';
import { IconBrandInstagram, IconBrandFacebook, IconBrandWhatsapp } from '@tabler/icons-react';

export function Footer() {
  return (
    <Box
      component="footer"
      py="xl"
      mt="xl"
      style={{
        borderTop: '1px solid var(--mantine-color-gray-2)',
        backgroundColor: 'var(--mantine-color-gray-0)',
      }}
    >
      <Container size="xl">
        <Stack gap="md" align="center">
          <Group gap="xl" justify="center">
            <Anchor
              href="https://www.instagram.com/gioiatransporteok/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Group gap="xs">
                <IconBrandInstagram size={24} color="var(--mantine-color-magenta-6)" />
                <Text size="sm" c="dark.7">
                  Instagram
                </Text>
              </Group>
            </Anchor>
            <Anchor
              href="https://www.facebook.com/transportegioiaehijos/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Group gap="xs">
                <IconBrandFacebook size={24} color="var(--mantine-color-magenta-6)" />
                <Text size="sm" c="dark.7">
                  Facebook
                </Text>
              </Group>
            </Anchor>
            <Group gap="xs" style={{ cursor: 'default', opacity: 0.6 }}>
              <IconBrandWhatsapp size={24} color="var(--mantine-color-magenta-6)" />
              <Text size="sm" c="dark.7">
                WhatsApp
              </Text>
            </Group>
          </Group>

          <Text size="sm" c="dark.7" ta="center">
            © {new Date().getFullYear()} Transporte Gioia e Hijos SRL. Todos los derechos
            reservados.
          </Text>

          <Group gap="xs" justify="center">
            <Text size="sm" c="dark.7">
              Creado por
            </Text>
            <Anchor
              href="https://wa.me/5491138207230"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Text
                size="sm"
                fw={600}
                style={{
                  color: '#D4AF37',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Pistech
              </Text>
            </Anchor>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
}

