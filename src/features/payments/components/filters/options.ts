import {
  CARD_BRANDS,
  DECLINE_CODES,
  PAYMENT_METHOD_TYPES,
  PAYMENT_STATUSES,
  type CardBrand,
  type DeclineCode,
  type PaymentMethodType,
  type PaymentStatus,
} from '../../types/payment';
import { BRAND_NAMES, DECLINE_LABELS, METHOD_LABELS, STATUS_LABELS } from '../../utils/format';
import type { SelectOption } from '@chargeblast/ui';

export const STATUS_OPTIONS: readonly SelectOption<PaymentStatus>[] = PAYMENT_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

export const METHOD_OPTIONS: readonly SelectOption<PaymentMethodType>[] = PAYMENT_METHOD_TYPES.map(
  (value) => ({
    value,
    label: METHOD_LABELS[value],
  }),
);

export const BRAND_OPTIONS: readonly SelectOption<CardBrand>[] = CARD_BRANDS.map((value) => ({
  value,
  label: BRAND_NAMES[value] ?? value,
}));

export const DECLINE_OPTIONS: readonly SelectOption<DeclineCode>[] = DECLINE_CODES.map((value) => ({
  value,
  label: DECLINE_LABELS[value],
}));
