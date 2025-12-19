import { Modal, Stack, Text, Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

interface QRDisplayModalProps {
  opened: boolean;
  onClose: () => void;
  preorderId: string;
  voucherNumber: string;
}

export function QRDisplayModal({ opened, onClose, preorderId, voucherNumber }: QRDisplayModalProps) {
  const qrUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/qr/generate/quick?content=${preorderId}&type=text`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-${voucherNumber}.png`;
    link.click();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`QR Code - ${voucherNumber}`}
      size="sm"
      centered
    >
      <Stack align="center" gap="md">
        {/* QR Image */}
        <img
          src={qrUrl}
          alt={`QR Code for ${voucherNumber}`}
          style={{ width: 300, height: 300 }}
        />

        {/* Info */}
        <Text size="sm" c="dimmed" ta="center">
          Escanea este código para agregar al bulk scanner
        </Text>

        <Text size="xs" c="dimmed" ta="center" ff="monospace">
          UUID: {preorderId.substring(0, 8)}...
        </Text>

        {/* Download Button */}
        <Button
          fullWidth
          variant="light"
          leftSection={<IconDownload size={16} />}
          onClick={handleDownload}
        >
          Descargar QR
        </Button>
      </Stack>
    </Modal>
  );
}
