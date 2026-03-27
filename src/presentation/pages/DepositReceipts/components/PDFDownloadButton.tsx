'use client';

import dynamic from 'next/dynamic';
import { Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import type { DepositReceiptData } from '@/domain/deposit-receipt/types';

// Dynamic import of the PDF download functionality (client-only)
const PDFDownloadLinkComponent = dynamic<{ data: DepositReceiptData }>(
  () => import('./DepositReceiptPDFDownload'),
  {
    ssr: false,
    loading: () => (
      <Button
        leftSection={<IconDownload size={16} />}
        color="magenta"
        loading
        variant="light"
      >
        Preparando PDF...
      </Button>
    ),
  },
);

interface PDFDownloadButtonProps {
  data: DepositReceiptData;
}

export function PDFDownloadButton({ data }: PDFDownloadButtonProps) {
  return <PDFDownloadLinkComponent data={data} />;
}
