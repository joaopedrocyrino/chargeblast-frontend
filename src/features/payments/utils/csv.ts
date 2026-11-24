import type { DataColumnId } from '../components/columns';
import type { Payment } from '../types/payment';

type CsvField = readonly [header: string, get: (p: Payment) => string];

/**
 * CSV fields for each table column. A table column can expand to several
 * fields (amount → amount + currency) so the export stays machine-readable.
 */
const CSV_FIELDS: Readonly<Record<DataColumnId, readonly CsvField[]>> = {
  amount: [
    ['amount', (p) => (p.amountMinor / 10 ** p.currencyExponent).toFixed(p.currencyExponent)],
    ['currency', (p) => p.currency],
  ],
  status: [['status', (p) => p.status]],
  method: [
    ['payment_method_type', (p) => p.paymentMethod.type],
    [
      'payment_method_brand',
      (p) => p.paymentMethod.brand ?? p.paymentMethod.wallet ?? p.paymentMethod.bankName ?? '',
    ],
    ['payment_method_last4', (p) => p.paymentMethod.last4],
  ],
  description: [['description', (p) => p.description ?? '']],
  customer: [
    ['customer_name', (p) => p.customer.name ?? ''],
    ['customer_email', (p) => p.customer.email],
  ],
  created: [['created_at_utc', (p) => p.createdAt]],
  refunded: [['refunded_at_utc', (p) => p.refundedAt ?? '']],
  decline: [
    ['decline_code', (p) => p.failureCode ?? ''],
    ['decline_reason', (p) => p.failureMessage ?? ''],
  ],
  id: [['id', (p) => p.id]],
};

/** RFC 4180 field escaping, plus a guard against spreadsheet formula injection. */
function escapeCsvField(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** Exports exactly the columns shown in the table, in their on-screen order. */
export function paymentsToCsv(payments: readonly Payment[], columns: readonly DataColumnId[]): string {
  const fields = columns.flatMap((id) => CSV_FIELDS[id]);
  const header = fields.map(([name]) => name).join(',');
  const lines = payments.map((p) => fields.map(([, get]) => escapeCsvField(get(p))).join(','));
  return [header, ...lines].join('\r\n') + '\r\n';
}

export function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
