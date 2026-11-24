'use client';

import {
  AlertCircleIcon,
  Button,
  ChevronLeftIcon,
  EmptyState,
  PaymentBrandIcon,
  RefreshIcon,
  Skeleton,
} from '@chargeblast/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useApiQuery } from '@/lib/api/use-api-query';
import { fetchPayment } from '../services/payments-api';
import type { PaymentDetail } from '../types/payment';
import {
  describePaymentMethod,
  formatAmount,
  formatFailureCode,
  formatFullTimestamp,
  formatCreatedAt,
  METHOD_LABELS,
} from '../utils/format';
import { PaymentIdCell } from './cells';
import { SearchField } from './SearchField';
import { StatusBadge } from './StatusBadge';
import styles from './PaymentDetailsPage.module.css';

function Field({ label, children }: { readonly label: string; readonly children: ReactNode }): ReactNode {
  return (
    <div className={styles.field}>
      <dt className={styles.fieldLabel}>{label}</dt>
      <dd className={styles.fieldValue}>{children}</dd>
    </div>
  );
}

function Details({ payment }: { readonly payment: PaymentDetail }): ReactNode {
  const method = payment.paymentMethod;
  const { name } = describePaymentMethod(method);
  const amount = formatAmount(payment.amountMinor, payment.currency, payment.currencyExponent);
  return (
    <>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Payment</p>
        <div className={styles.titleRow}>
          <h1 className={styles.amount}>
            {amount} <span className={styles.currency}>{payment.currency}</span>
          </h1>
          <StatusBadge status={payment.status} />
        </div>
        <div className={styles.idRow}>
          <PaymentIdCell id={payment.id} />
        </div>
      </header>

      <dl className={styles.summaryGrid}>
        <Field label="Last update">{formatCreatedAt(payment.updatedAt)}</Field>
        <Field label="Customer">{payment.customer.email}</Field>
        <Field label="Payment method">
          <span className={styles.method}>
            <PaymentBrandIcon
              brand={method.type === 'ach' ? 'bank' : (method.wallet ?? method.brand)}
              width={20}
            />
            •••• {method.last4}
          </span>
        </Field>
        {payment.status === 'failed' ? (
          <Field label="Decline reason">
            {payment.failureMessage ?? (payment.failureCode ? formatFailureCode(payment.failureCode) : '—')}
          </Field>
        ) : null}
      </dl>

      <div className={styles.columns}>
        <section className={styles.section} aria-labelledby="timeline-heading">
          <h2 id="timeline-heading" className={styles.sectionTitle}>
            Timeline
          </h2>
          <ol className={styles.timeline}>
            {payment.events.map((event, index) => (
              <li key={`${event.type}-${index}`} className={styles.event}>
                <span className={styles.eventDot} data-type={event.type} aria-hidden="true" />
                <div>
                  <p className={styles.eventTitle}>{event.title}</p>
                  <time className={styles.eventTime} dateTime={event.occurredAt}>
                    {formatFullTimestamp(event.occurredAt)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="details-heading">
          <h2 id="details-heading" className={styles.sectionTitle}>
            Payment details
          </h2>
          <dl className={styles.detailList}>
            <Field label="Amount">{amount}</Field>
            <Field label="Description">{payment.description ?? '—'}</Field>
            <Field label="Created">{formatFullTimestamp(payment.createdAt)}</Field>
            {payment.refundedAt ? (
              <Field label="Refunded">{formatFullTimestamp(payment.refundedAt)}</Field>
            ) : null}
            {payment.failureCode ? <Field label="Failure code">{payment.failureCode}</Field> : null}
          </dl>

          <h2 className={styles.sectionTitle}>Payment method</h2>
          <dl className={styles.detailList}>
            <Field label="Type">{METHOD_LABELS[method.type]}</Field>
            <Field label="Details">{name}</Field>
            <Field label="Number">•••• {method.last4}</Field>
            {method.expMonth && method.expYear ? (
              <Field label="Expires">
                {String(method.expMonth).padStart(2, '0')} / {method.expYear}
              </Field>
            ) : null}
            <Field label="ID">
              <code className={styles.code}>{method.id}</code>
            </Field>
          </dl>

          <h2 className={styles.sectionTitle}>Customer</h2>
          <dl className={styles.detailList}>
            <Field label="Name">{payment.customer.name ?? '—'}</Field>
            <Field label="Email">{payment.customer.email}</Field>
            <Field label="ID">
              <code className={styles.code}>{payment.customer.id}</code>
            </Field>
          </dl>
        </section>
      </div>
    </>
  );
}

export function PaymentDetailsPage({ id }: { readonly id: string }): ReactNode {
  const router = useRouter();
  const query = useApiQuery(`payment:${id}`, (signal) => fetchPayment(id, { signal }));

  let body: ReactNode;
  if (query.data) {
    body = <Details payment={query.data} />;
  } else if (query.error) {
    const notFound = query.error.status === 404 || query.error.status === 400;
    body = (
      <EmptyState
        role="alert"
        icon={<AlertCircleIcon size={20} />}
        title={notFound ? 'Payment not found' : "This payment couldn't be loaded"}
        description={notFound ? `No payment exists with the ID ${id}.` : query.error.message}
        action={
          notFound ? (
            <Link href="/payments" className={styles.back}>
              Back to payments
            </Link>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              leadingIcon={<RefreshIcon size={12} />}
              onClick={query.refetch}
            >
              Try again
            </Button>
          )
        }
      />
    );
  } else {
    body = (
      <div aria-busy="true" aria-label="Loading payment">
        <Skeleton width={80} height={14} />
        <div style={{ height: 12 }} />
        <Skeleton width={260} height={32} />
        <div style={{ height: 24 }} />
        <Skeleton width="100%" height={56} />
        <div style={{ height: 24 }} />
        <Skeleton width="100%" height={240} />
      </div>
    );
  }

  return (
    <AppShell
      search={
        <SearchField
          appearance="global"
          placeholder="Search"
          value=""
          onCommit={(term) => {
            if (term) router.push(`/payments?q=${encodeURIComponent(term)}`);
          }}
        />
      }
    >
      <Link href="/payments" className={styles.back}>
        <ChevronLeftIcon size={12} strokeWidth={2} /> Payments
      </Link>
      {body}
    </AppShell>
  );
}
