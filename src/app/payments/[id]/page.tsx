import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { PaymentDetailsPage } from '@/features/payments/components/PaymentDetailsPage';

export const metadata: Metadata = { title: 'Payment details' };

export default async function PaymentDetailsRoute({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}): Promise<ReactNode> {
  const { id } = await params;
  return <PaymentDetailsPage id={id} />;
}
