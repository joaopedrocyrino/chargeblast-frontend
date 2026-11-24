import { getJson, postJson, type GetJsonOptions, type PostJsonOptions } from '@/lib/api/http-client';
import { isCurrencyList, isPaymentCapacity, isPaymentDetail, isPaymentList } from '../types/guards';
import type {
  CardBrand,
  CreatePaymentRequest,
  CurrencyList,
  DeclineCode,
  PaymentCapacity,
  PaymentDetail,
  PaymentList,
  PaymentMethodType,
  PaymentStatus,
  SortDirection,
  SortField,
} from '../types/payment';

/**
 * Where the browser sends API calls. Production builds point it at the API's
 * own domain (NEXT_PUBLIC_API_URL, inlined at build time); without it, calls
 * stay same-origin and next.config.ts proxies them (local development).
 */
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? '/api/v1').replace(/\/$/, '');

/** Filters understood by the API (instants already resolved to ISO strings). */
export interface PaymentFilterParams {
  readonly search?: string;
  readonly statuses?: readonly PaymentStatus[];
  readonly methods?: readonly PaymentMethodType[];
  readonly currencies?: readonly string[];
  readonly brands?: readonly CardBrand[];
  readonly declineCodes?: readonly DeclineCode[];
  readonly refundedFrom?: string;
  readonly refundedTo?: string;
  readonly createdFrom?: string;
  readonly createdTo?: string;
  readonly amountMin?: string;
  readonly amountMax?: string;
}

export interface PaymentListParams extends PaymentFilterParams {
  readonly page: number;
  readonly limit: number;
  readonly sort: SortField;
  readonly direction: SortDirection;
}

/** Serialises filters into the API's query format, omitting empty values. */
function toFilterSearchParams(filters: PaymentFilterParams): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.statuses?.length) params.set('status', filters.statuses.join(','));
  if (filters.methods?.length) params.set('method', filters.methods.join(','));
  if (filters.currencies?.length) params.set('currency', filters.currencies.join(','));
  if (filters.brands?.length) params.set('brand', filters.brands.join(','));
  if (filters.declineCodes?.length) params.set('decline', filters.declineCodes.join(','));
  if (filters.refundedFrom) params.set('refundedFrom', filters.refundedFrom);
  if (filters.refundedTo) params.set('refundedTo', filters.refundedTo);
  if (filters.createdFrom) params.set('createdFrom', filters.createdFrom);
  if (filters.createdTo) params.set('createdTo', filters.createdTo);
  if (filters.amountMin) params.set('amountMin', filters.amountMin);
  if (filters.amountMax) params.set('amountMax', filters.amountMax);
  return params;
}

function toListSearchParams(params: PaymentListParams): URLSearchParams {
  const search = toFilterSearchParams(params);
  search.set('page', String(params.page));
  search.set('limit', String(params.limit));
  search.set('sort', params.sort);
  search.set('direction', params.direction);
  return search;
}

export function listPaymentsUrl(params: PaymentListParams): string {
  return `${API_BASE}/payments?${toListSearchParams(params).toString()}`;
}

export function fetchPayments(params: PaymentListParams, options?: GetJsonOptions): Promise<PaymentList> {
  return getJson(listPaymentsUrl(params), isPaymentList, options);
}

export const CURRENCIES_URL = `${API_BASE}/payments/currencies`;

/** Currency filter options: every currency in the data, not just the current page. */
export function fetchCurrencies(options?: GetJsonOptions): Promise<CurrencyList> {
  return getJson(CURRENCIES_URL, isCurrencyList, options);
}

export function fetchPayment(id: string, options?: GetJsonOptions): Promise<PaymentDetail> {
  return getJson(`${API_BASE}/payments/${encodeURIComponent(id)}`, isPaymentDetail, options);
}

/** Never cached or retried with stale data: the answer gates the create form. */
export function fetchPaymentCapacity(options?: GetJsonOptions): Promise<PaymentCapacity> {
  return getJson(`${API_BASE}/payments/capacity`, isPaymentCapacity, options);
}

export function createPayment(body: CreatePaymentRequest, options?: PostJsonOptions): Promise<PaymentDetail> {
  return postJson(`${API_BASE}/payments`, body, isPaymentDetail, options);
}
