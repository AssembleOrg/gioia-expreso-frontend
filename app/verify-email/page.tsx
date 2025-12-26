import { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmail } from '@/presentation/pages/VerifyEmail';

export const metadata: Metadata = {
  title: 'Verificar Email - Gioia Transporte',
  description: 'Verificación de correo electrónico',
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerifyEmail />
    </Suspense>
  );
}
