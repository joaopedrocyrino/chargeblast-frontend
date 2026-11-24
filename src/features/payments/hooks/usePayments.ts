'use client';

import { useApiQuery, type ApiQueryState } from '@/lib/api/use-api-query';
import {
  CURRENCIES_URL,
  fetchCurrencies,
  fetchPayments,
  listPaymentsUrl,
  type PaymentListParams,
} from '../services/payments-api';
import type { CurrencyList, PaymentList } from '../types/payment';

/** Server-side paginated/sorted/filtered list; the request URL is the cache key. */
export function usePayments(params: PaymentListParams): ApiQueryState<PaymentList> {
  return useApiQuery(listPaymentsUrl(params), (signal) => fetchPayments(params, { signal }));
}

/** Currencies present anywhere in the data, for the Currency filter. */
export function useCurrencies(): ApiQueryState<CurrencyList> {
  return useApiQuery(CURRENCIES_URL, (signal) => fetchCurrencies({ signal }));
}
