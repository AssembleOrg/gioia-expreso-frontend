'use client';

import { Calculator } from '@/presentation/pages/Calculator/Calculator';

interface CotizarStepProps {
  onNext: () => void;
}

export function CotizarStep({ onNext }: CotizarStepProps) {
  return <Calculator isEmbedded onNext={onNext} />;
}
