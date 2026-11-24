import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';
import { PaymentsPage } from '@/features/payments/components/PaymentsPage';

export const metadata: Metadata = { title: 'Payments' };

export default function PaymentsRoute(): ReactNode {
  // useSearchParams() in the client page requires a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <PaymentsPage />
    </Suspense>
  );
}
