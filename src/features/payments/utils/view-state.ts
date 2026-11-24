import { isPlainDate, type PlainDate } from '@chargeblast/ui';
import type { PaymentFilterParams, PaymentListParams } from '../services/payments-api';
import {
  CARD_BRANDS,
  DECLINE_CODES,
  PAGE_SIZES,
  PAYMENT_METHOD_TYPES,
  PAYMENT_STATUSES,
  SORT_FIELDS,
  type CardBrand,
  type DeclineCode,
  type PageSize,
  type PaymentMethodType,
  type PaymentStatus,
  type SortDirection,
  type SortField,
} from '../types/payment';
import { DATE_PRESETS, resolveDateRange, type DatePreset } from './date-range';

/**
 * Canonical, shareable table state. It lives in the URL query string
 * (?q=&status=&method=&currency=&brand=&decline=&rdate=&rfrom=&rto=&date=&from=&to=&min=&max=&sort=&dir=&page=&limit=);
 * this module converts between the URL and typed state.
 */
export interface PaymentsViewState {
  readonly search: string;
  readonly statuses: readonly PaymentStatus[];
  readonly methods: readonly PaymentMethodType[];
  /** ISO codes; the set comes from the API, so any well-formed code is kept. */
  readonly currencies: readonly string[];
  readonly brands: readonly CardBrand[];
  readonly declineCodes: readonly DeclineCode[];
  readonly refundedPreset: DatePreset | null;
  readonly refundedFrom: PlainDate | null;
  readonly refundedTo: PlainDate | null;
  readonly datePreset: DatePreset | null;
  readonly dateFrom: PlainDate | null;
  readonly dateTo: PlainDate | null;
  readonly amountMin: string | null;
  readonly amountMax: string | null;
  readonly sort: SortField;
  readonly direction: SortDirection;
  readonly page: number;
  readonly limit: PageSize;
}

export const DEFAULT_VIEW_STATE: PaymentsViewState = {
  search: '',
  statuses: [],
  methods: [],
  currencies: [],
  brands: [],
  declineCodes: [],
  refundedPreset: null,
  refundedFrom: null,
  refundedTo: null,
  datePreset: null,
  dateFrom: null,
  dateTo: null,
  amountMin: null,
  amountMax: null,
  sort: 'created',
  direction: 'desc',
  page: 1,
  limit: 25,
};

/** Default direction when a column first becomes the sort column. */
const DEFAULT_SORT_DIRECTION: Readonly<Record<SortField, SortDirection>> = {
  created: 'desc',
  amount: 'desc',
  status: 'asc',
};

export const AMOUNT_PATTERN = /^\d{1,10}(\.\d{1,2})?$/;

function pickList<T extends string>(raw: string | null, allowed: readonly T[]): T[] {
  if (!raw) return [];
  const tokens = raw.split(',');
  return allowed.filter((value) => tokens.includes(value));
}

function pickCurrencies(raw: string | null): string[] {
  if (!raw) return [];
  const codes = raw.split(',').map((code) => code.trim().toUpperCase());
  return [...new Set(codes.filter((code) => /^[A-Z]{3}$/.test(code)))].sort().slice(0, 20);
}

function pickOne<T extends string>(raw: string | null, allowed: readonly T[]): T | null {
  return allowed.find((value) => value === raw) ?? null;
}

/** A preset + custom range from three URL keys; an invalid or empty custom range is dropped. */
function pickDateRange(
  params: URLSearchParams,
  keys: readonly [preset: string, from: string, to: string],
): { preset: DatePreset | null; from: PlainDate | null; to: PlainDate | null } {
  const preset = pickOne(params.get(keys[0]), DATE_PRESETS);
  const rawFrom = params.get(keys[1]);
  const rawTo = params.get(keys[2]);
  const from = preset === 'custom' && rawFrom && isPlainDate(rawFrom) ? rawFrom : null;
  let to = preset === 'custom' && rawTo && isPlainDate(rawTo) ? rawTo : null;
  if (from && to && to < from) to = null;
  return { preset: preset === 'custom' && !from && !to ? null : preset, from, to };
}

/** Lenient parse: anything invalid in a hand-edited URL falls back to defaults. */
export function parseViewState(params: URLSearchParams): PaymentsViewState {
  const created = pickDateRange(params, ['date', 'from', 'to']);
  const refunded = pickDateRange(params, ['rdate', 'rfrom', 'rto']);

  const min = params.get('min');
  const max = params.get('max');
  let amountMin = min && AMOUNT_PATTERN.test(min) ? min : null;
  let amountMax = max && AMOUNT_PATTERN.test(max) ? max : null;
  if (amountMin && amountMax && Number(amountMin) > Number(amountMax)) {
    amountMin = null;
    amountMax = null;
  }

  const page = Number(params.get('page'));
  const limit = Number(params.get('limit'));
  return {
    search: (params.get('q') ?? '').trim().slice(0, 100),
    statuses: pickList(params.get('status'), PAYMENT_STATUSES),
    methods: pickList(params.get('method'), PAYMENT_METHOD_TYPES),
    currencies: pickCurrencies(params.get('currency')),
    brands: pickList(params.get('brand'), CARD_BRANDS),
    declineCodes: pickList(params.get('decline'), DECLINE_CODES),
    refundedPreset: refunded.preset,
    refundedFrom: refunded.from,
    refundedTo: refunded.to,
    datePreset: created.preset,
    dateFrom: created.from,
    dateTo: created.to,
    amountMin,
    amountMax,
    sort: pickOne(params.get('sort'), SORT_FIELDS) ?? DEFAULT_VIEW_STATE.sort,
    direction: pickOne(params.get('dir'), ['asc', 'desc'] as const) ?? DEFAULT_VIEW_STATE.direction,
    page: Number.isInteger(page) && page >= 1 && page <= 100_000 ? page : 1,
    limit: PAGE_SIZES.find((size) => size === limit) ?? DEFAULT_VIEW_STATE.limit,
  };
}

/** Serialises state, omitting defaults so URLs stay short and canonical. */
export function serializeViewState(state: PaymentsViewState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.search) params.set('q', state.search);
  if (state.statuses.length) params.set('status', state.statuses.join(','));
  if (state.methods.length) params.set('method', state.methods.join(','));
  if (state.currencies.length) params.set('currency', state.currencies.join(','));
  if (state.brands.length) params.set('brand', state.brands.join(','));
  if (state.declineCodes.length) params.set('decline', state.declineCodes.join(','));
  if (state.refundedPreset) params.set('rdate', state.refundedPreset);
  if (state.refundedPreset === 'custom' && state.refundedFrom) params.set('rfrom', state.refundedFrom);
  if (state.refundedPreset === 'custom' && state.refundedTo) params.set('rto', state.refundedTo);
  if (state.datePreset) params.set('date', state.datePreset);
  if (state.datePreset === 'custom' && state.dateFrom) params.set('from', state.dateFrom);
  if (state.datePreset === 'custom' && state.dateTo) params.set('to', state.dateTo);
  if (state.amountMin) params.set('min', state.amountMin);
  if (state.amountMax) params.set('max', state.amountMax);
  if (state.sort !== DEFAULT_VIEW_STATE.sort) params.set('sort', state.sort);
  if (state.direction !== DEFAULT_VIEW_STATE.direction) params.set('dir', state.direction);
  if (state.page !== 1) params.set('page', String(state.page));
  if (state.limit !== DEFAULT_VIEW_STATE.limit) params.set('limit', String(state.limit));
  return params;
}

export function hasActiveFilters(state: PaymentsViewState): boolean {
  return (
    state.search !== '' ||
    state.statuses.length > 0 ||
    state.methods.length > 0 ||
    state.currencies.length > 0 ||
    state.brands.length > 0 ||
    state.declineCodes.length > 0 ||
    state.refundedPreset !== null ||
    state.datePreset !== null ||
    state.amountMin !== null ||
    state.amountMax !== null
  );
}

export function toFilterParams(state: PaymentsViewState, now: Date = new Date()): PaymentFilterParams {
  const created = resolveDateRange(state.datePreset, state.dateFrom, state.dateTo, now);
  const refunded = resolveDateRange(state.refundedPreset, state.refundedFrom, state.refundedTo, now);
  return {
    ...(state.search ? { search: state.search } : {}),
    statuses: state.statuses,
    methods: state.methods,
    currencies: state.currencies,
    brands: state.brands,
    declineCodes: state.declineCodes,
    ...(created.from ? { createdFrom: created.from } : {}),
    ...(created.to ? { createdTo: created.to } : {}),
    ...(refunded.from ? { refundedFrom: refunded.from } : {}),
    ...(refunded.to ? { refundedTo: refunded.to } : {}),
    ...(state.amountMin ? { amountMin: state.amountMin } : {}),
    ...(state.amountMax ? { amountMax: state.amountMax } : {}),
  };
}

export function toListParams(state: PaymentsViewState, now: Date = new Date()): PaymentListParams {
  return {
    ...toFilterParams(state, now),
    page: state.page,
    limit: state.limit,
    sort: state.sort,
    direction: state.direction,
  };
}

/** Next sort state after a header click: toggle direction or switch column. */
export function nextSort(
  state: PaymentsViewState,
  field: SortField,
): Pick<PaymentsViewState, 'sort' | 'direction'> {
  if (state.sort === field) return { sort: field, direction: state.direction === 'asc' ? 'desc' : 'asc' };
  return { sort: field, direction: DEFAULT_SORT_DIRECTION[field] };
}
