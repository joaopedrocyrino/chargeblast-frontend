'use client';

import { Field, FilterChip, FilterPanel, Input } from '@chargeblast/ui';
import { useId, useState, type ReactNode } from 'react';
import { AMOUNT_PATTERN } from '../../utils/view-state';
import styles from './filters.module.css';

export interface AmountRange {
  readonly min: string | null;
  readonly max: string | null;
}

/** Validates raw inputs; returns an error message or the normalised range. */
function validateAmountRange(min: string, max: string): { error: string } | { range: AmountRange } {
  const lo = min.trim();
  const hi = max.trim();
  if (lo && !AMOUNT_PATTERN.test(lo))
    return { error: 'Minimum must be a positive number with up to 2 decimals.' };
  if (hi && !AMOUNT_PATTERN.test(hi))
    return { error: 'Maximum must be a positive number with up to 2 decimals.' };
  if (lo && hi && Number(lo) > Number(hi)) return { error: 'Minimum cannot be greater than maximum.' };
  return { range: { min: lo || null, max: hi || null } };
}

function formatAmountChip({ min, max }: AmountRange): string | null {
  if (min && max) return min === max ? `= ${min}` : `${min} – ${max}`;
  if (min) return `≥ ${min}`;
  if (max) return `≤ ${max}`;
  return null;
}

function Panel({
  value,
  onApply,
}: {
  readonly value: AmountRange;
  readonly onApply: (v: AmountRange) => void;
}): ReactNode {
  const id = useId();
  const [min, setMin] = useState(value.min ?? '');
  const [max, setMax] = useState(value.max ?? '');
  const result = validateAmountRange(min, max);
  const error = 'error' in result ? result.error : null;

  return (
    <FilterPanel
      title="Filter by amount"
      applyDisabled={error !== null}
      onApply={() => 'range' in result && onApply(result.range)}
    >
      <div className={styles.panelBodyPadded}>
        <div className={styles.fieldRow}>
          <Field label="Minimum" size="sm">
            {({ id: inputId }) => (
              <Input
                id={inputId}
                inputMode="decimal"
                placeholder="0.00"
                value={min}
                onChange={(event) => setMin(event.target.value)}
                invalid={error?.startsWith('Minimum') ?? false}
                aria-describedby={`${id}-hint ${id}-error`}
                data-autofocus
              />
            )}
          </Field>
          <Field label="Maximum" size="sm">
            {({ id: inputId }) => (
              <Input
                id={inputId}
                inputMode="decimal"
                placeholder="No limit"
                value={max}
                onChange={(event) => setMax(event.target.value)}
                invalid={error !== null && !error.startsWith('Minimum')}
                aria-describedby={`${id}-hint ${id}-error`}
              />
            )}
          </Field>
        </div>
        <p id={`${id}-hint`} className={styles.hint}>
          Amounts are compared in each payment’s own currency.
        </p>
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      </div>
    </FilterPanel>
  );
}

export function AmountFilter({
  value,
  onChange,
}: {
  readonly value: AmountRange;
  readonly onChange: (value: AmountRange) => void;
}): ReactNode {
  return (
    <FilterChip
      label="Amount"
      value={formatAmountChip(value)}
      onClear={() => onChange({ min: null, max: null })}
    >
      {({ close }) => (
        <Panel
          value={value}
          onApply={(next) => {
            onChange(next);
            close();
          }}
        />
      )}
    </FilterChip>
  );
}
