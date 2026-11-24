'use client';

import {
  copyToClipboard,
  CopyIcon,
  CustomersIcon,
  Dropdown,
  ExternalLinkIcon,
  IconButton,
  MoreIcon,
} from '@chargeblast/ui';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Payment } from '../types/payment';

export function RowActions({ payment }: { readonly payment: Payment }): ReactNode {
  const router = useRouter();
  return (
    <Dropdown
      items={[
        {
          id: 'view',
          label: 'View payment details',
          icon: <ExternalLinkIcon size={14} />,
          onSelect: () => router.push(`/payments/${payment.id}`),
        },
        { id: 'sep', type: 'separator' },
        {
          id: 'copy-id',
          label: 'Copy payment ID',
          icon: <CopyIcon size={14} />,
          onSelect: () => void copyToClipboard(payment.id),
        },
        {
          id: 'copy-email',
          label: 'Copy customer email',
          icon: <CustomersIcon size={14} />,
          onSelect: () => void copyToClipboard(payment.customer.email),
        },
      ]}
      renderTrigger={(props) => (
        <IconButton
          {...props}
          size="sm"
          aria-label={`More actions for payment ${payment.id}`}
          icon={<MoreIcon size={16} />}
          onClick={(event) => {
            event.stopPropagation();
            props.onClick(event);
          }}
        />
      )}
    />
  );
}
