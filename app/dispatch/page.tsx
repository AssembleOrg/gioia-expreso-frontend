'use client';

import { ProtectedRoute } from '@/presentation/components/ProtectedRoute/ProtectedRoute';
import { Dispatch } from '@/presentation/pages/Dispatch/Dispatch';

export default function DispatchPage() {
  return (
    <ProtectedRoute>
      <Dispatch />
    </ProtectedRoute>
  );
}
