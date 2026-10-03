'use client';

import type { DepositReceiptData } from '@/domain/deposit-receipt/types';
import DepositReceiptPDFDownload from './DepositReceiptPDFDownload';

interface PDFDownloadButtonProps {
  data: DepositReceiptData;
}

// @react-pdf/renderer se importa al hacer clic, no en el bundle de la página
export function PDFDownloadButton({ data }: PDFDownloadButtonProps) {
  return <DepositReceiptPDFDownload data={data} />;
}
