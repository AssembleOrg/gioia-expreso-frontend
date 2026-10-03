'use client';

import { useState } from 'react';
import { Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import type { DepositReceiptData } from '@/domain/deposit-receipt/types';

interface Props {
  data: DepositReceiptData;
}

/**
 * Genera el PDF recién al hacer clic. PDFDownloadLink lo renderizaba al montar,
 * uno por fila de la tabla, aunque nadie lo descargara.
 */
export default function DepositReceiptPDFDownload({ data }: Props) {
  const [loading, setLoading] = useState(false);

  const fileName = `recibo-deposito-${data.firstName}-${data.lastName}-${data.id ? data.id.substring(0, 8) : 'nuevo'
    }.pdf`;

  const handleDownload = async () => {
    setLoading(true);
    try {
      const [{ pdf }, { DepositReceiptPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./DepositReceiptPDF'),
      ]);
      const blob = await pdf(<DepositReceiptPDF data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      leftSection={<IconDownload size={16} />}
      color="magenta"
      variant="light"
      loading={loading}
      onClick={handleDownload}
    >
      {loading ? 'Generando PDF...' : 'Descargar PDF'}
    </Button>
  );
}
