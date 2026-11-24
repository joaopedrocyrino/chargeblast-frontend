'use client';

import {
  AlertCircleIcon,
  Button,
  Dialog,
  Field,
  Input,
  PlusIcon,
  Select,
  type SelectOption,
} from '@chargeblast/ui';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ApiError } from '@/lib/api/http-client';
import { createPayment, fetchPaymentCapacity } from '../services/payments-api';
import {
  CARD_BRANDS,
  CREATABLE_STATUSES,
  CURRENCIES,
  WALLETS,
  type PaymentCapacity,
  type PaymentDetail,
  type PaymentMethodType,
} from '../types/payment';
import {
  currencyExponent,
  initialCreatePaymentValues,
  mapApiFieldErrors,
  toCreatePaymentRequest,
  validateCreatePayment,
  type CreatePaymentErrors,
  type CreatePaymentField,
  type CreatePaymentFormValues,
} from '../utils/create-payment-form';
import { BRAND_NAMES, METHOD_LABELS, STATUS_LABELS, WALLET_NAMES } from '../utils/format';
import styles from './CreatePaymentButton.module.css';

const FORM_ID = 'create-payment-form';
const NUMBER = new Intl.NumberFormat('en-US');

const CURRENCY_OPTIONS: readonly SelectOption<(typeof CURRENCIES)[number]['code']>[] = CURRENCIES.map(
  (c) => ({
    value: c.code,
    label: c.code,
  }),
);
const STATUS_OPTIONS = CREATABLE_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }));
const METHOD_OPTIONS: readonly SelectOption<PaymentMethodType>[] = [
  { value: 'card', label: METHOD_LABELS.card },
  { value: 'wallet', label: METHOD_LABELS.wallet },
  { value: 'ach', label: METHOD_LABELS.ach },
];
const BRAND_OPTIONS = CARD_BRANDS.map((value) => ({ value, label: BRAND_NAMES[value] ?? value }));
const WALLET_OPTIONS = WALLETS.map((value) => ({ value, label: WALLET_NAMES[value] ?? value }));
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const value = String(i + 1);
  return { value, label: value.padStart(2, '0') };
});

type Mode =
  | { readonly kind: 'closed' }
  | { readonly kind: 'form'; readonly capacity: PaymentCapacity }
  | { readonly kind: 'full'; readonly limit: number }
  | { readonly kind: 'error'; readonly message: string };

interface CreatePaymentButtonProps {
  /** Called after a payment was created, e.g. to refresh the list. */
  readonly onCreated: (payment: PaymentDetail) => void;
}

/**
 * "Create payment" button plus its dialog. The demo is public and has no
 * accounts, so the payments table is capped: the form only opens while the
 * API reports free capacity, and the API refuses creates past the cap too.
 */
export function CreatePaymentButton({ onCreated }: CreatePaymentButtonProps): ReactNode {
  const [mode, setMode] = useState<Mode>({ kind: 'closed' });
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const close = (): void => {
    setSubmitting(false);
    setMode({ kind: 'closed' });
  };

  const open = async (): Promise<void> => {
    setChecking(true);
    try {
      const capacity = await fetchPaymentCapacity({ retries: 0 });
      setMode(capacity.canCreate ? { kind: 'form', capacity } : { kind: 'full', limit: capacity.limit });
    } catch (error) {
      setMode({ kind: 'error', message: error instanceof Error ? error.message : 'Something went wrong.' });
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        leadingIcon={<PlusIcon size={12} strokeWidth={2.5} />}
        loading={checking}
        onClick={() => void open()}
        data-testid="create-payment"
      >
        Create payment
      </Button>

      <Dialog
        open={mode.kind === 'form'}
        onClose={close}
        title="Create payment"
        description={
          mode.kind === 'form'
            ? `This public demo holds at most ${NUMBER.format(mode.capacity.limit)} payments. ${NUMBER.format(mode.capacity.remaining)} left.`
            : undefined
        }
        width={560}
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form={FORM_ID} loading={submitting}>
              Create payment
            </Button>
          </>
        }
        data-testid="create-payment-dialog"
      >
        <CreatePaymentForm
          onCreated={(payment) => {
            close();
            onCreated(payment);
          }}
          onLimitReached={(limit) => setMode({ kind: 'full', limit })}
          limit={mode.kind === 'form' ? mode.capacity.limit : 0}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />
      </Dialog>

      <Dialog
        open={mode.kind === 'full' || mode.kind === 'error'}
        onClose={close}
        title={mode.kind === 'error' ? 'Couldn’t check the payment limit' : 'Payment limit reached'}
        width={440}
        footer={
          <Button variant="primary" onClick={close}>
            Got it
          </Button>
        }
        data-testid="create-payment-unavailable"
      >
        <p className={styles.notice}>
          {mode.kind === 'error'
            ? `${mode.message} Please try again in a moment.`
            : `This is a public demo, so it holds at most ${NUMBER.format(mode.kind === 'full' ? mode.limit : 0)} payments. That limit has been reached, so new payments can’t be created.`}
        </p>
      </Dialog>
    </>
  );
}

interface CreatePaymentFormProps {
  readonly onCreated: (payment: PaymentDetail) => void;
  readonly onLimitReached: (limit: number) => void;
  readonly limit: number;
  readonly submitting: boolean;
  readonly setSubmitting: (submitting: boolean) => void;
}

function CreatePaymentForm({
  onCreated,
  onLimitReached,
  limit,
  submitting,
  setSubmitting,
}: CreatePaymentFormProps): ReactNode {
  const [values, setValues] = useState<CreatePaymentFormValues>(() => initialCreatePaymentValues());
  const [errors, setErrors] = useState<CreatePaymentErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const set = <K extends CreatePaymentField>(field: K, value: CreatePaymentFormValues[K]): void => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const focusFirstError = (fieldErrors: CreatePaymentErrors): void => {
    const first = Object.keys(fieldErrors).find((key) => fieldErrors[key as CreatePaymentField]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (submitting) return;
    const clientErrors = validateCreatePayment(values);
    setErrors(clientErrors);
    setGeneralError(null);
    if (Object.keys(clientErrors).length > 0) {
      focusFirstError(clientErrors);
      return;
    }
    setSubmitting(true);
    try {
      onCreated(await createPayment(toCreatePaymentRequest(values)));
    } catch (error) {
      if (error instanceof ApiError && error.code === 'PAYMENT_LIMIT_REACHED') {
        onLimitReached(limit);
      } else if (error instanceof ApiError && error.details.length > 0) {
        const mapped = mapApiFieldErrors(error.details);
        setErrors(mapped.fields);
        setGeneralError(mapped.general.length > 0 ? mapped.general.join(' ') : null);
        focusFirstError(mapped.fields);
      } else {
        setGeneralError(error instanceof Error ? error.message : 'The payment couldn’t be created.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const text = (
    name: CreatePaymentField,
    label: string,
    props: Omit<Parameters<typeof Input>[0], 'name' | 'value' | 'onChange'> = {},
  ): ReactNode => (
    <Field label={label} error={errors[name]} className={styles.field}>
      {(control) => (
        <Input
          {...control}
          name={name}
          value={values[name]}
          onChange={(event) => set(name, event.target.value as never)}
          disabled={submitting}
          {...props}
        />
      )}
    </Field>
  );

  const select = <V extends string>(
    name: CreatePaymentField,
    label: string,
    options: readonly SelectOption<V>[],
    value: V,
    onChange: (value: V) => void,
  ): ReactNode => (
    <Field label={label} error={errors[name]} className={styles.field}>
      {({ id: controlId }) => (
        <Select id={controlId} options={options} value={value} onChange={onChange} disabled={submitting} />
      )}
    </Field>
  );

  const exponent = currencyExponent(values.currency);

  return (
    <form
      id={FORM_ID}
      ref={formRef}
      className={styles.form}
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      {generalError ? (
        <div className={styles.banner} role="alert">
          <AlertCircleIcon size={14} />
          <span>{generalError}</span>
        </div>
      ) : null}

      <fieldset className={styles.section} disabled={submitting}>
        <legend className={styles.legend}>Payment</legend>
        <div className={styles.row}>
          {text('amount', 'Amount', {
            inputMode: exponent === 0 ? 'numeric' : 'decimal',
            placeholder: exponent === 0 ? '1200' : '49.99',
            autoComplete: 'off',
            autoFocus: true,
          })}
          {select('currency', 'Currency', CURRENCY_OPTIONS, values.currency, (v) => set('currency', v))}
          {select('status', 'Status', STATUS_OPTIONS, values.status, (v) => set('status', v))}
        </div>
        {text('description', 'Description (optional)', { placeholder: 'Pro plan (monthly)', maxLength: 500 })}
      </fieldset>

      <fieldset className={styles.section} disabled={submitting}>
        <legend className={styles.legend}>Customer</legend>
        <div className={styles.row}>
          {text('customerEmail', 'Email', {
            type: 'email',
            placeholder: 'jenny@example.com',
            autoComplete: 'off',
            maxLength: 320,
          })}
          {text('customerName', 'Name (optional)', {
            placeholder: 'Jenny Rosen',
            autoComplete: 'off',
            maxLength: 200,
          })}
        </div>
      </fieldset>

      <fieldset className={styles.section} disabled={submitting}>
        <legend className={styles.legend}>Payment method</legend>
        <div className={styles.row}>
          {select('method', 'Type', METHOD_OPTIONS, values.method, (v) => set('method', v))}
          {values.method === 'wallet'
            ? select('wallet', 'Wallet', WALLET_OPTIONS, values.wallet, (v) => set('wallet', v))
            : null}
          {values.method === 'ach'
            ? text('bankName', 'Bank', { placeholder: 'Chase', maxLength: 100 })
            : select(
                'brand',
                values.method === 'wallet' ? 'Card brand' : 'Brand',
                BRAND_OPTIONS,
                values.brand,
                (v) => set('brand', v),
              )}
        </div>
        <div className={styles.row}>
          {text('last4', values.method === 'ach' ? 'Account last 4' : 'Card last 4', {
            inputMode: 'numeric',
            placeholder: '4242',
            maxLength: 4,
            autoComplete: 'off',
          })}
          {values.method === 'ach' ? null : (
            <>
              {select('expMonth', 'Exp. month', MONTH_OPTIONS, values.expMonth, (v) => set('expMonth', v))}
              {text('expYear', 'Exp. year', { inputMode: 'numeric', maxLength: 4, autoComplete: 'off' })}
            </>
          )}
        </div>
        <p className={styles.hint}>
          Only the last 4 digits are stored. Never enter a full card or account number.
        </p>
      </fieldset>
    </form>
  );
}
