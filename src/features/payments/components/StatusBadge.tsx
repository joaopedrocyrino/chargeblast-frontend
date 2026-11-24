import {
  AlertCircleIcon,
  Badge,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  RefundIcon,
  type BadgeTone,
} from '@chargeblast/ui';
import type { ReactNode } from 'react';
import type { PaymentStatus } from '../types/payment';
import { STATUS_LABELS } from '../utils/format';

const TONES: Readonly<Record<PaymentStatus, { tone: BadgeTone; icon: ReactNode }>> = {
  succeeded: { tone: 'success', icon: <CheckIcon size={12} strokeWidth={2} /> },
  pending: { tone: 'info', icon: <ClockIcon size={12} strokeWidth={1.75} /> },
  uncaptured: { tone: 'neutral', icon: <ClockIcon size={12} strokeWidth={1.75} /> },
  disputed: { tone: 'warning', icon: <AlertCircleIcon size={12} strokeWidth={1.75} /> },
  refunded: { tone: 'neutral', icon: <RefundIcon size={12} strokeWidth={1.75} /> },
  failed: { tone: 'danger', icon: <CloseIcon size={12} strokeWidth={2} /> },
};

export function StatusBadge({ status }: { readonly status: PaymentStatus }): ReactNode {
  const { tone, icon } = TONES[status];
  return (
    <Badge tone={tone} icon={icon} data-status={status}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
