import { describe, expect, it } from 'vitest';
import {
  initialCreatePaymentValues,
  toCreatePaymentRequest,
  validateCreatePayment,
} from '@/features/payments/utils/create-payment-form';

const NOW = new Date(2026, 5, 15);
const valid = {
  ...initialCreatePaymentValues(NOW),
  amount: '49.99',
  customerEmail: 'jenny@example.com',
  last4: '4242',
};

// Required fields, submitting and API errors are covered through the dialog
// in CreatePaymentButton.test.tsx; these are the rules it doesn't reach.
describe('validateCreatePayment', () => {
  it('respects each currency’s decimals', () => {
    expect(validateCreatePayment({ ...valid, currency: 'JPY', amount: '12.5' }, NOW).amount).toBe(
      "JPY amounts can't have decimals.",
    );
    expect(validateCreatePayment({ ...valid, currency: 'JPY', amount: '1200.00' }, NOW)).toEqual({});
    expect(validateCreatePayment({ ...valid, amount: '1.005' }, NOW).amount).toBe('Use at most 2 decimals.');
  });

  it('rejects an expired card and needs a bank for ACH', () => {
    expect(validateCreatePayment({ ...valid, expMonth: '5', expYear: '2026' }, NOW).expMonth).toBe(
      'This card has expired.',
    );
    expect(validateCreatePayment({ ...valid, method: 'ach' }, NOW)).toEqual({
      bankName: 'Enter the bank name.',
    });
  });
});

describe('toCreatePaymentRequest', () => {
  it('sends only the fields of the chosen method', () => {
    const ach = toCreatePaymentRequest({ ...valid, method: 'ach', bankName: ' Chase ' });
    expect(ach).toMatchObject({ method: 'ach', bankName: 'Chase' });
    expect(ach).not.toHaveProperty('brand');
    expect(ach).not.toHaveProperty('expMonth');
    expect(toCreatePaymentRequest({ ...valid, method: 'wallet' })).toMatchObject({
      wallet: 'apple_pay',
      brand: 'visa',
    });
  });
});
