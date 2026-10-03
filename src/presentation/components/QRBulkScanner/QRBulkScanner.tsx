import {
  Modal,
  Stack,
  Title,
  Text,
  Button,
  Select,
  Group,
  Badge,
  ActionIcon,
  TextInput,
} from '@mantine/core';
import { Scanner, type IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { IconX, IconBarcode, IconPlus } from '@tabler/icons-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePaquetesStore } from '@/application/stores/paquetes-store';
import { notifications } from '@mantine/notifications';
import { PreorderStatus } from '@/domain/voucher/types';

// Fuera del componente: el Scanner reinicia su ciclo de lectura cuando cambia
// cualquiera de estas props, y un array/objeto nuevo en cada render dejaba un
// ciclo viejo corriendo por cada re-render.
const FORMATS: ['qr_code'] = ['qr_code'];
const COMPONENTS = { onOff: true, torch: true };

interface QRBulkScannerProps {
  opened: boolean;
  onClose: () => void;
  initialStatus?: PreorderStatus | null;
}

export function QRBulkScanner({
  opened,
  onClose,
  initialStatus = null,
}: QRBulkScannerProps) {
  // Con selectores: sólo re-renderiza cuando cambia lo que usa.
  const addScannedId = usePaquetesStore((s) => s.addScannedId);
  const scannedIds = usePaquetesStore((s) => s.scannedIds);
  const bulkUpdateStatus = usePaquetesStore((s) => s.bulkUpdateStatus);
  const removeScannedId = usePaquetesStore((s) => s.removeScannedId);
  const clearScannedIds = usePaquetesStore((s) => s.clearScannedIds);
  const [targetStatus, setTargetStatus] = useState<PreorderStatus | null>(
    initialStatus
  );
  const [processing, setProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  // Pausa de 2 s entre lecturas: en un ref y no en estado, porque es sólo
  // para el lector y no hace falta re-renderizar.
  const pausado = useRef(false);
  const pausa = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Un solo AudioContext para todos los bips: cada uno abierto y sin cerrar
  // retiene un hilo de audio (y Safari corta después de unos pocos).
  const audio = useRef<AudioContext | null>(null);

  useEffect(
    () => () => {
      if (pausa.current) clearTimeout(pausa.current);
      void audio.current?.close().catch(() => undefined);
      audio.current = null;
    },
    []
  );

  useEffect(() => {
    if (opened && initialStatus) {
      setTargetStatus(initialStatus);
    }
  }, [opened, initialStatus]);

  // UUID extraction and validation helper
  const extractUUID = (str: string): string | null => {
    // Regex to match UUID v4
    const uuidRegex =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = str.match(uuidRegex);
    return match ? match[0] : null;
  };

  // Sound effect using Web Audio API (no file needed)
  const playBeep = () => {
    try {
      if (!audio.current) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audio.current = new Ctor();
      }
      const audioContext = audio.current;
      if (audioContext.state === 'suspended') void audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // 800 Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Audio context not available');
    }
  };

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (pausado.current) return;

    if (detectedCodes && detectedCodes.length > 0) {
      const code = detectedCodes[0].rawValue;
      if (!code) return;

      // Extract and validate UUID
      const uuid = extractUUID(code);

      if (!uuid) {
        notifications.show({
          title: 'Código Inválido',
          message: 'El código escaneado no contiene un ID válido',
          color: 'red',
          autoClose: 2000,
        });
        return;
      }

      // Silenciar duplicados completamente (sin sonido ni toast). Se lee el
      // store en el momento: el handler puede venir de un render anterior.
      if (usePaquetesStore.getState().scannedIds.includes(uuid)) {
        return;
      }

      // Bloquear procesamiento
      pausado.current = true;

      // Agregar UUID válido y único
      addScannedId(uuid);
      playBeep();
      notifications.show({
        title: 'Escaneado',
        message: `Código detectado: ${uuid.substring(0, 8)}...`,
        color: 'magenta',
        autoClose: 1000,
      });

      pausa.current = setTimeout(() => {
        pausado.current = false;
      }, 2000);
    }
  };

  // onScan estable: el Scanner no reinicia su ciclo de lectura en cada render.
  const handleScanRef = useRef(handleScan);
  handleScanRef.current = handleScan;
  const onScan = useCallback(
    (codes: IDetectedBarcode[]) => handleScanRef.current(codes),
    []
  );

  const handleManualAdd = () => {
    const trimmedInput = manualInput.trim();
    if (!trimmedInput) return;

    // Extract and validate UUID
    const uuid = extractUUID(trimmedInput);

    if (!uuid) {
      notifications.show({
        title: 'Código Inválido',
        message: 'El ID ingresado no es válido',
        color: 'red',
        autoClose: 2000,
      });
      return;
    }

    // Check for duplicates
    if (scannedIds.includes(uuid)) {
      notifications.show({
        title: 'Duplicado',
        message: 'Este ID ya fue agregado',
        color: 'yellow',
        autoClose: 1500,
      });
      return;
    }

    addScannedId(uuid);
    setManualInput('');
    playBeep();
    notifications.show({
      title: 'Agregado',
      message: `ID agregado manualmente`,
      color: 'magenta',
      autoClose: 1000,
    });
  };

  const handleProcess = async () => {
    if (!targetStatus || scannedIds.length === 0) return;

    setProcessing(true);
    try {
      await bulkUpdateStatus(scannedIds, targetStatus);
      notifications.show({
        title: 'Éxito',
        message: `${scannedIds.length} paquetes actualizados a ${targetStatus}`,
        color: 'green',
      });
      clearScannedIds();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudieron actualizar los paquetes',
        color: 'red',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title='Escáner Masivo de QR'
      size='lg'
      fullScreen={false}
    >
      <Stack gap='md'>
        <Text
          size='sm'
          c='dimmed'
        >
          Escanea los códigos QR de los paquetes para agregarlos a la lista de
          procesamiento.
        </Text>

        <div
          style={{
            height: '300px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '8px',
          }}
        >
          <Scanner
            onScan={onScan}
            formats={FORMATS}
            components={COMPONENTS}
            // El bip lo hace playBeep (sólo con códigos nuevos y válidos).
            sound={false}
          />
        </div>

        <Group align='flex-end'>
          <TextInput
            label='Ingreso Manual'
            placeholder='ID de paquete'
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            style={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleManualAdd();
            }}
          />
          <Button
            variant='light'
            onClick={handleManualAdd}
            disabled={!manualInput.trim()}
          >
            <IconPlus size={16} />
          </Button>
        </Group>

        <Stack gap='xs'>
          <Title order={5}>Paquetes Escaneados ({scannedIds.length})</Title>
          <Group
            gap='xs'
            style={{ maxHeight: '100px', overflowY: 'auto' }}
          >
            {scannedIds.map((id) => (
              <Badge
                key={id}
                size='lg'
                variant='outline'
                rightSection={
                  <ActionIcon
                    size='xs'
                    color='magenta'
                    radius='xl'
                    variant='transparent'
                    onClick={() => removeScannedId(id)}
                  >
                    <IconX size={10} />
                  </ActionIcon>
                }
              >
                {id.substring(0, 8)}...
              </Badge>
            ))}
            {scannedIds.length === 0 && (
              <Text
                size='xs'
                c='dimmed'
              >
                Ningún paquete escaneado aún.
              </Text>
            )}
          </Group>
        </Stack>

        <Select
          label='Acción a realizar'
          placeholder='Seleccionar nuevo estado'
          data={[
            { value: 'PENDING', label: 'Marcar como Pendiente' },
            { value: 'CONFIRMED', label: 'Confirmar Recepción' },
            { value: 'COMPLETED', label: 'Marcar como Completado' },
            { value: 'CANCELLED', label: 'Cancelar' },
          ]}
          value={targetStatus}
          onChange={(val) => setTargetStatus(val as PreorderStatus)}
          comboboxProps={{ shadow: 'md' }}
          styles={{
            option: { color: 'var(--mantine-color-dark-9)' },
            dropdown: { color: 'var(--mantine-color-dark-9)' },
          }}
        />

        <Group justify='flex-end'>
          <Button
            variant='default'
            onClick={clearScannedIds}
            disabled={scannedIds.length === 0}
          >
            Limpiar
          </Button>
          <Button
            color='magenta'
            onClick={handleProcess}
            loading={processing}
            disabled={!targetStatus || scannedIds.length === 0}
          >
            Procesar {scannedIds.length} Paquetes
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
