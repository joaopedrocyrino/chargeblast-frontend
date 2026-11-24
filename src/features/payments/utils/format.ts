import type { DeclineCode, PaymentMethod, PaymentStatus } from '../types/payment';

const LOCALE = 'en-US';

/** Formats an integer minor-unit amount in its currency, e.g. 162200 USD → "$1,622.00". */
export function formatAmount(amountMinor: number, currency: string, exponent: number): string {
  const major = amountMinor / 10 ** exponent;
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: exponent,
      maximumFractionDigits: exponent,
    }).format(major);
  } catch {
    return `${major.toFixed(exponent)} ${currency}`;
  }
}

/** Table timestamp in the viewer's time zone: "Nov 23, 7:06 PM" (year added when not current). */
export function formatCreatedAt(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const sameYear = date.getFullYear() === now.getFullYear();
  return new Intl.DateTimeFormat(LOCALE, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/** Unambiguous timestamp including seconds and the viewer's time-zone name. */
export function formatFullTimestamp(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    dateStyle: 'medium',
    timeStyle: 'long',
  }).format(new Date(iso));
}

const RELATIVE_UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
];

/** "3 hours ago", "yesterday", "in 2 minutes", … */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
  if (Math.abs(seconds) < 45) return 'just now';
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit);
  }
  return formatter.format(seconds, 'second');
}

/** "pi_3QxA…nosf": keeps the prefix and enough characters to distinguish ids. */
export function shortenId(id: string, head = 8, tail = 4): string {
  return id.length <= head + tail + 1 ? id : `${id.slice(0, head)}…${id.slice(-tail)}`;
}

export const BRAND_NAMES: Readonly<Record<string, string>> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  jcb: 'JCB',
  unionpay: 'UnionPay',
  diners: 'Diners Club',
};

export const WALLET_NAMES: Readonly<Record<string, string>> = {
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  link: 'Link',
};

interface PaymentMethodDescription {
  /** Key for PaymentBrandIcon. */
  readonly iconKey: string | null;
  /** Human-readable name, e.g. "Visa", "Apple Pay (Visa)", "Chase (ACH)". */
  readonly name: string;
  readonly last4: string;
}

export function describePaymentMethod(method: PaymentMethod): PaymentMethodDescription {
  const brand = method.brand ? (BRAND_NAMES[method.brand] ?? method.brand) : null;
  switch (method.type) {
    case 'card':
      return { iconKey: method.brand, name: brand ?? 'Card', last4: method.last4 };
    case 'wallet': {
      const wallet = method.wallet ? (WALLET_NAMES[method.wallet] ?? method.wallet) : 'Wallet';
      return { iconKey: method.wallet, name: brand ? `${wallet} (${brand})` : wallet, last4: method.last4 };
    }
    case 'ach':
      return { iconKey: 'bank', name: `${method.bankName ?? 'Bank account'} (ACH)`, last4: method.last4 };
  }
}

export const STATUS_LABELS: Readonly<Record<PaymentStatus, string>> = {
  succeeded: 'Succeeded',
  pending: 'Pending',
  uncaptured: 'Uncaptured',
  refunded: 'Refunded',
  disputed: 'Disputed',
  failed: 'Failed',
};

export const METHOD_LABELS = {
  card: 'Card',
  ach: 'ACH Direct Debit',
  wallet: 'Wallet',
} as const;

/** Filter labels for decline codes. */
export const DECLINE_LABELS: Readonly<Record<DeclineCode, string>> = {
  card_declined: 'Card declined',
  insufficient_funds: 'Insufficient funds',
  expired_card: 'Expired card',
  incorrect_cvc: 'Incorrect CVC',
  processing_error: 'Processing error',
  fraudulent: 'Fraudulent',
  do_not_honor: 'Do not honor',
};

export function formatFailureCode(code: string): string {
  const text = code.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
