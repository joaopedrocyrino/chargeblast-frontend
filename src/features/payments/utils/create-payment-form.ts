import {
  CURRENCIES,
  type CardBrand,
  type CreatablePaymentStatus,
  type CreatePaymentRequest,
  type CurrencyCode,
  type PaymentMethodType,
  type Wallet,
} from '../types/payment';

/** Raw form state: every input is a string, exactly as typed. */
export interface CreatePaymentFormValues {
  readonly amount: string;
  readonly currency: CurrencyCode;
  readonly status: CreatablePaymentStatus;
  readonly description: string;
  readonly customerEmail: string;
  readonly customerName: string;
  readonly method: PaymentMethodType;
  readonly brand: CardBrand;
  readonly wallet: Wallet;
  readonly last4: string;
  readonly expMonth: string;
  readonly expYear: string;
  readonly bankName: string;
}

export type CreatePaymentField = keyof CreatePaymentFormValues;
export type CreatePaymentErrors = Partial<Record<CreatePaymentField, string>>;

export function initialCreatePaymentValues(now: Date = new Date()): CreatePaymentFormValues {
  return {
    amount: '',
    currency: 'USD',
    status: 'succeeded',
    description: '',
    customerEmail: '',
    customerName: '',
    method: 'card',
    brand: 'visa',
    wallet: 'apple_pay',
    last4: '',
    expMonth: '12',
    expYear: String(now.getFullYear() + 2),
    bankName: '',
  };
}

export function currencyExponent(code: CurrencyCode): number {
  return CURRENCIES.find((c) => c.code === code)?.exponent ?? 2;
}

/**
 * Quick checks so obvious mistakes are caught before a round trip. The API
 * re-validates everything; its field errors are shown the same way.
 */
export function validateCreatePayment(
  values: CreatePaymentFormValues,
  now: Date = new Date(),
): CreatePaymentErrors {
  const errors: CreatePaymentErrors = {};
  const amount = values.amount.trim();
  const exponent = currencyExponent(values.currency);
  if (amount === '') errors.amount = 'Enter an amount.';
  else if (!/^\d{1,12}(\.\d+)?$/.test(amount) || Number(amount) <= 0)
    errors.amount = 'Enter a positive amount, e.g. 49.99.';
  else if ((amount.split('.')[1] ?? '').replace(/0+$/, '').length > exponent)
    errors.amount =
      exponent === 0
        ? `${values.currency} amounts can't have decimals.`
        : `Use at most ${exponent} decimals.`;

  const email = values.customerEmail.trim();
  if (email === '') errors.customerEmail = 'Enter the customer’s email.';
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.customerEmail = 'Enter a valid email address.';

  if (!/^\d{4}$/.test(values.last4.trim())) errors.last4 = 'Enter the last 4 digits.';

  if (values.method === 'ach') {
    if (values.bankName.trim() === '') errors.bankName = 'Enter the bank name.';
  } else {
    const month = Number(values.expMonth);
    const year = Number(values.expYear);
    if (!Number.isInteger(month) || month < 1 || month > 12) errors.expMonth = 'Enter a month from 1 to 12.';
    if (!/^\d{4}$/.test(values.expYear.trim()) || year < now.getFullYear() || year > now.getFullYear() + 20)
      errors.expYear = `Enter a year from ${now.getFullYear()} to ${now.getFullYear() + 20}.`;
    else if (!errors.expMonth && year === now.getFullYear() && month < now.getMonth() + 1)
      errors.expMonth = 'This card has expired.';
  }
  return errors;
}

/** Builds the API body, sending only the fields the chosen method uses. */
export function toCreatePaymentRequest(values: CreatePaymentFormValues): CreatePaymentRequest {
  const optional = (value: string): string | undefined => (value.trim() === '' ? undefined : value.trim());
  const base = {
    amount: values.amount.trim(),
    currency: values.currency,
    status: values.status,
    description: optional(values.description),
    customerEmail: values.customerEmail.trim(),
    customerName: optional(values.customerName),
    method: values.method,
    last4: values.last4.trim(),
  };
  if (values.method === 'ach') return { ...base, bankName: values.bankName.trim() };
  const card = {
    ...base,
    brand: values.brand,
    expMonth: Number(values.expMonth),
    expYear: Number(values.expYear),
  };
  return values.method === 'wallet' ? { ...card, wallet: values.wallet } : card;
}

const FIELDS: readonly CreatePaymentField[] = [
  'amount',
  'currency',
  'status',
  'description',
  'customerEmail',
  'customerName',
  'method',
  'brand',
  'wallet',
  'last4',
  'expMonth',
  'expYear',
  'bankName',
];

/** Maps API field errors onto form fields; anything unmapped goes to `general`. */
export function mapApiFieldErrors(details: readonly { field: string; message: string }[]): {
  fields: CreatePaymentErrors;
  general: string[];
} {
  const fields: CreatePaymentErrors = {};
  const general: string[] = [];
  for (const { field, message } of details) {
    const match = FIELDS.find((f) => f === field);
    const sentence = message.charAt(0).toUpperCase() + message.slice(1);
    if (match) fields[match] = sentence;
    else general.push(`${field}: ${message}`);
  }
  return { fields, general };
}
