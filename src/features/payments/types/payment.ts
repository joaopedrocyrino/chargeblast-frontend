/** Mirrors the backend API contract (chargeblast-backend/src/payments/payments.types.ts). */
export const PAYMENT_STATUSES = [
  'succeeded',
  'pending',
  'uncaptured',
  'refunded',
  'disputed',
  'failed',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHOD_TYPES = ['card', 'ach', 'wallet'] as const;
export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];

export const SORT_FIELDS = ['created', 'amount', 'status'] as const;
export type SortField = (typeof SORT_FIELDS)[number];
export type SortDirection = 'asc' | 'desc';

export const PAGE_SIZES = [25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export interface PaymentMethod {
  readonly id: string;
  readonly type: PaymentMethodType;
  readonly brand: string | null;
  readonly last4: string;
  readonly wallet: string | null;
  readonly bankName: string | null;
  readonly expMonth: number | null;
  readonly expYear: number | null;
}

export interface Customer {
  readonly id: string;
  readonly name: string | null;
  readonly email: string;
}

export interface Payment {
  readonly id: string;
  readonly amountMinor: number;
  readonly currency: string;
  readonly currencyExponent: number;
  readonly status: PaymentStatus;
  readonly description: string | null;
  readonly failureCode: string | null;
  readonly failureMessage: string | null;
  readonly refundedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly customer: Customer;
  readonly paymentMethod: PaymentMethod;
}

export interface PaymentEvent {
  readonly type: string;
  readonly title: string;
  readonly occurredAt: string;
}

export interface PaymentDetail extends Payment {
  readonly customer: Customer & { readonly createdAt: string };
  readonly events: readonly PaymentEvent[];
}

export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly sort: SortField;
  readonly direction: SortDirection;
}

export interface PaymentList {
  readonly data: readonly Payment[];
  readonly meta: PaginationMeta;
}

/** Statuses a new payment can be created with (refunds need an existing payment). */
export const CREATABLE_STATUSES = ['succeeded', 'pending', 'failed'] as const;
export type CreatablePaymentStatus = (typeof CREATABLE_STATUSES)[number];

export const CARD_BRANDS = ['visa', 'mastercard', 'amex', 'discover', 'jcb', 'unionpay', 'diners'] as const;
export type CardBrand = (typeof CARD_BRANDS)[number];

export const WALLETS = ['apple_pay', 'google_pay', 'link'] as const;

/** Decline codes a failed payment can carry (mirrors the API). */
export const DECLINE_CODES = [
  'card_declined',
  'insufficient_funds',
  'expired_card',
  'incorrect_cvc',
  'processing_error',
  'fraudulent',
  'do_not_honor',
] as const;
export type DeclineCode = (typeof DECLINE_CODES)[number];
export type Wallet = (typeof WALLETS)[number];

/** Currencies seeded by the backend migration, with their decimal places. */
export const CURRENCIES = [
  { code: 'USD', exponent: 2 },
  { code: 'EUR', exponent: 2 },
  { code: 'GBP', exponent: 2 },
  { code: 'CAD', exponent: 2 },
  { code: 'AUD', exponent: 2 },
  { code: 'BRL', exponent: 2 },
  { code: 'JPY', exponent: 0 },
] as const;
export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

/** `POST /payments` body. `amount` is in major units ("49.99"). */
export interface CreatePaymentRequest {
  readonly amount: string;
  readonly currency: CurrencyCode;
  readonly status: CreatablePaymentStatus;
  readonly description?: string;
  readonly customerEmail: string;
  readonly customerName?: string;
  readonly method: PaymentMethodType;
  readonly last4: string;
  readonly brand?: CardBrand;
  readonly wallet?: Wallet;
  readonly expMonth?: number;
  readonly expYear?: number;
  readonly bankName?: string;
}

/** Whether the (capped) payments table still accepts new rows. */
export interface PaymentCapacity {
  readonly total: number;
  readonly limit: number;
  readonly remaining: number;
  readonly canCreate: boolean;
}

export interface Currency {
  readonly code: string;
  readonly name: string;
  readonly exponent: number;
}

/** Every currency present in the payments data (filter options). */
export interface CurrencyList {
  readonly data: readonly Currency[];
}
