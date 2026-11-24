'use client';

import {
  CheckIcon,
  CopyIcon,
  IconButton,
  PaymentBrandIcon,
  Tooltip,
  useCopyToClipboard,
} from '@chargeblast/ui';
import type { ReactNode } from 'react';
import type { Payment } from '../types/payment';
import {
  describePaymentMethod,
  formatAmount,
  formatCreatedAt,
  formatFailureCode,
  formatFullTimestamp,
  formatRelativeTime,
  shortenId,
} from '../utils/format';
import styles from './cells.module.css';

export function AmountCell({ payment }: { readonly payment: Payment }): ReactNode {
  return (
    <span className={styles.amount}>
      <span className={styles.amountValue}>
        {formatAmount(payment.amountMinor, payment.currency, payment.currencyExponent)}
      </span>
      <span className={styles.currency}>{payment.currency}</span>
    </span>
  );
}

export function PaymentMethodCell({ payment }: { readonly payment: Payment }): ReactNode {
  const method = payment.paymentMethod;
  const { name, last4 } = describePaymentMethod(method);
  const walletIcon = method.type === 'wallet' && method.wallet ? method.wallet : null;
  const mainIcon = method.type === 'ach' ? 'bank' : method.brand;
  return (
    <span className={styles.method} title={name}>
      <span className={styles.methodIcons} aria-hidden="true">
        {walletIcon ? <PaymentBrandIcon brand={walletIcon} width={24} /> : null}
        <PaymentBrandIcon brand={mainIcon} width={24} />
      </span>
      <span className="cb-visually-hidden">{name} </span>
      <span className={styles.dots} aria-hidden="true">
        ••••
      </span>
      <span className={styles.last4}>
        <span className="cb-visually-hidden">ending in </span>
        {last4}
      </span>
    </span>
  );
}

const EMPTY = (
  <span className={styles.emptyValue} aria-label="None">
    —
  </span>
);

export function DescriptionCell({ payment }: { readonly payment: Payment }): ReactNode {
  return payment.description ? (
    <span className={styles.text} title={payment.description}>
      {payment.description}
    </span>
  ) : (
    EMPTY
  );
}

export function RefundedDateCell({ payment }: { readonly payment: Payment }): ReactNode {
  return payment.refundedAt ? <CreatedCell iso={payment.refundedAt} /> : EMPTY;
}

export function DeclineReasonCell({ payment }: { readonly payment: Payment }): ReactNode {
  if (payment.status !== 'failed') return EMPTY;
  const text =
    payment.failureMessage ?? (payment.failureCode ? formatFailureCode(payment.failureCode) : null);
  return text ? (
    <span className={styles.text} title={text}>
      {text}
    </span>
  ) : (
    EMPTY
  );
}

export function PaymentIdCell({ id }: { readonly id: string }): ReactNode {
  const { status, copy } = useCopyToClipboard();
  const copied = status === 'copied';
  return (
    <span className={styles.idCell}>
      <code className={styles.id} title={id} data-testid="payment-id">
        {shortenId(id)}
      </code>
      <Tooltip content={copied ? 'Copied!' : status === 'error' ? 'Copy failed' : 'Copy payment ID'}>
        <IconButton
          size="sm"
          className={styles.copyButton}
          data-copied={copied || undefined}
          aria-label={`Copy payment ID ${id}`}
          icon={copied ? <CheckIcon size={14} strokeWidth={2} /> : <CopyIcon size={14} />}
          onClick={(event) => {
            event.stopPropagation();
            void copy(id);
          }}
        />
      </Tooltip>
      <span className="cb-visually-hidden" aria-live="polite">
        {copied ? 'Payment ID copied to clipboard' : ''}
      </span>
    </span>
  );
}

export function CustomerCell({ payment }: { readonly payment: Payment }): ReactNode {
  const { name, email } = payment.customer;
  return (
    <span className={styles.customer} title={name ? `${name} <${email}>` : email}>
      {email}
    </span>
  );
}

function CreatedTooltip({ iso }: { readonly iso: string }): ReactNode {
  return (
    <>
      <span className={styles.tooltipRelative}>{formatRelativeTime(iso)}</span>
      <span className={styles.tooltipAbsolute}>{formatFullTimestamp(iso)}</span>
    </>
  );
}

export function CreatedCell({ iso }: { readonly iso: string }): ReactNode {
  return (
    <Tooltip content={<CreatedTooltip iso={iso} />} placement="top">
      <time dateTime={iso} tabIndex={0} className={styles.created}>
        {formatCreatedAt(iso)}
      </time>
    </Tooltip>
  );
}
