'use client';

import { useState, type ReactNode } from 'react';
import { FilterChip, FilterPanel } from '../FilterChip/FilterChip';
import { MultiSelectList } from '../MultiSelect/MultiSelectList';
import type { SelectOption } from '../Select/Select';
import { Spinner } from '../Spinner/Spinner';
import styles from './MultiSelectFilter.module.css';

export interface MultiSelectFilterProps<V extends string> {
  /** Chip label, e.g. "Card brand". */
  readonly label: string;
  /** Accessible name of the option list, e.g. "Card brands". */
  readonly listLabel: string;
  readonly options: readonly SelectOption<V>[];
  readonly value: readonly V[];
  readonly onChange: (value: V[]) => void;
  /** Options are still loading (e.g. fetched from an API). */
  readonly loading?: boolean;
  /** Shown instead of the options when they couldn't be loaded. */
  readonly error?: string | null;
  readonly defaultOpen?: boolean;
}

function Panel<V extends string>({
  label,
  listLabel,
  options,
  value,
  loading,
  error,
  onApply,
}: Omit<MultiSelectFilterProps<V>, 'onChange' | 'defaultOpen'> & {
  readonly onApply: (value: V[]) => void;
}): ReactNode {
  const [draft, setDraft] = useState<V[]>([...value]);
  return (
    <FilterPanel title={`Filter by ${label.toLowerCase()}`} onApply={() => onApply(draft)}>
      {error ? (
        <p className={styles.message} role="alert">
          {error}
        </p>
      ) : loading ? (
        <div className={styles.message}>
          <Spinner size={14} label={`Loading ${listLabel.toLowerCase()}`} />
        </div>
      ) : (
        <MultiSelectList
          options={options}
          value={draft}
          onChange={setDraft}
          aria-label={listLabel}
          autoFocus
        />
      )}
    </FilterPanel>
  );
}

/** Filter chip whose panel is a checkbox list (status, payment method, currency…). */
export function MultiSelectFilter<V extends string>({
  onChange,
  defaultOpen,
  ...panel
}: MultiSelectFilterProps<V>): ReactNode {
  const labelOf = (v: V): string => panel.options.find((o) => o.value === v)?.label ?? v;
  return (
    <FilterChip
      label={panel.label}
      defaultOpen={defaultOpen}
      value={panel.value.length ? panel.value.map(labelOf).join(', ') : null}
      onClear={() => onChange([])}
    >
      {({ close }) => (
        <Panel
          {...panel}
          onApply={(next) => {
            onChange(next);
            close();
          }}
        />
      )}
    </FilterChip>
  );
}
