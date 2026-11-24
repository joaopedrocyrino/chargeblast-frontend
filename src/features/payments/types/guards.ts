import { isRecord } from '@/lib/api/http-client';
import type { CurrencyList, Payment, PaymentCapacity, PaymentDetail, PaymentList } from './payment';

/**
 * Lightweight runtime checks of API responses: enough to fail loudly on a
 * contract mismatch (e.g. HTML error page, wrong proxy target) without
 * re-validating every field.
 */
function isPayment(value: unknown): value is Payment {
  return (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    typeof value['amountMinor'] === 'number' &&
    typeof value['currency'] === 'string' &&
    typeof value['status'] === 'string' &&
    typeof value['createdAt'] === 'string' &&
    isRecord(value['customer']) &&
    isRecord(value['paymentMethod'])
  );
}

export function isPaymentList(value: unknown): value is PaymentList {
  return (
    isRecord(value) &&
    Array.isArray(value['data']) &&
    value['data'].every(isPayment) &&
    isRecord(value['meta']) &&
    typeof value['meta']['total'] === 'number'
  );
}

export function isPaymentDetail(value: unknown): value is PaymentDetail {
  return isPayment(value) && Array.isArray((value as unknown as Record<string, unknown>)['events']);
}

export function isCurrencyList(value: unknown): value is CurrencyList {
  return (
    isRecord(value) &&
    Array.isArray(value['data']) &&
    value['data'].every((c) => isRecord(c) && typeof c['code'] === 'string' && typeof c['name'] === 'string')
  );
}

export function isPaymentCapacity(value: unknown): value is PaymentCapacity {
  return (
    isRecord(value) &&
    typeof value['total'] === 'number' &&
    typeof value['limit'] === 'number' &&
    typeof value['remaining'] === 'number' &&
    typeof value['canCreate'] === 'boolean'
  );
}
