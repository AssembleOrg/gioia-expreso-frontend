'use client';

import { useRouter } from 'next/navigation';
import { Container, Group, Paper, Menu, Avatar, Text, Badge, Button } from '@mantine/core';
import { IconUser, IconLogout, IconChevronDown, IconBuilding } from '@tabler/icons-react';
import { useAuthStore } from '@/application/stores/auth-store';
import { useBranchStore, type Branch } from '@/application/stores/branch-store';
import { Logo } from '@/presentation/components/Logo';

export function AppHeader() {
  const { user, logout } = useAuthStore();
  const { selectedBranch, selectBranch } = useBranchStore();
  const router = useRouter();

  const handleBranchChange = (branch: Branch) => {
    selectBranch(branch);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const displayName = user?.fullname?.split(' ')[0] || 'Usuario';
  const avatarInitial = user?.fullname?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  const getBranchLabel = () => {
    if (!selectedBranch) return null;
    return selectedBranch === 'BUENOS_AIRES' ? 'Buenos Aires' : 'Entre Rios';
  };

  return (
    <Paper shadow="sm" p="sm" mb="md" withBorder>
      <Container size="xl">
        <Group justify="space-between" align="center">
          <Logo width={200} height={80} />

          <Menu shadow="md" width={280}>
            <Menu.Target>
              <Button
                variant="subtle"
                color="magenta"
                p="xs"
                rightSection={<IconChevronDown size={14} />}
              >
                <Group gap="xs">
                  <Avatar size="sm" color="magenta" radius="xl">
                    {avatarInitial}
                  </Avatar>
                  <Text size="xs" fw={600} c="dark.9">
                    {displayName}
                  </Text>
                </Group>
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label p="xs">
                <Text size="sm" fw={600} c="dark.9">
                  {user?.fullname || 'Usuario'}
                </Text>
                <Text size="xs" c="dark.7" mt={2}>
                  {user?.email}
                </Text>
                <Group gap="xs" mt="xs">
                  <Badge size="xs" color="magenta" variant="light">
                    {user?.role}
                  </Badge>
                  {getBranchLabel() && (
                    <Menu shadow="sm" width={180} position="bottom-end">
                      <Menu.Target>
                        <Badge
                          size="xs"
                          color="gray"
                          variant="light"
                          style={{ cursor: 'pointer' }}
                          rightSection={<IconChevronDown size={10} />}
                        >
                          {getBranchLabel()}
                        </Badge>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Label>Cambiar sucursal</Menu.Label>
                        <Menu.Item
                          leftSection={<IconBuilding size={14} />}
                          onClick={() => handleBranchChange('BUENOS_AIRES')}
                          disabled={selectedBranch === 'BUENOS_AIRES'}
                        >
                          Buenos Aires
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconBuilding size={14} />}
                          onClick={() => handleBranchChange('ENTRE_RIOS')}
                          disabled={selectedBranch === 'ENTRE_RIOS'}
                        >
                          Entre Rios
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  )}
                </Group>
              </Menu.Label>
              <Menu.Divider />
              <Menu.Item leftSection={<IconUser size={14} />} disabled>
                Mi Perfil
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconLogout size={14} />}
                onClick={handleLogout}
              >
                Cerrar Sesion
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Container>
    </Paper>
  );
}
