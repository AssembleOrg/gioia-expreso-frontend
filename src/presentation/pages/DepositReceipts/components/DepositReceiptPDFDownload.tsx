'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { DepositReceiptPDF } from './DepositReceiptPDF';
import type { DepositReceiptData } from '@/domain/deposit-receipt/types';

interface Props {
  data: DepositReceiptData;
}

export default function DepositReceiptPDFDownload({ data }: Props) {
  const fileName = `recibo-deposito-${data.firstName}-${data.lastName}-${data.id ? data.id.substring(0, 8) : 'nuevo'
    }.pdf`;

  return (
    <PDFDownloadLink
      document={<DepositReceiptPDF data={data} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <Button
          leftSection={<IconDownload size={16} />}
          color="magenta"
          variant="light"
          loading={loading}
        >
          {loading ? 'Generando PDF...' : 'Descargar PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
