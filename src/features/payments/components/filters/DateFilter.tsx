'use client';

import {
  DateRangeCalendar,
  FilterChip,
  FilterPanel,
  formatDateRange,
  todayPlainDate,
  type DateRange,
  type PlainDate,
} from '@chargeblast/ui';
import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { DATE_PRESET_LABELS, DATE_PRESETS, type DatePreset } from '../../utils/date-range';
import styles from './filters.module.css';

interface DateFilterValue {
  readonly preset: DatePreset | null;
  readonly from: PlainDate | null;
  readonly to: PlainDate | null;
}

function formatDateChip(value: DateFilterValue): string | null {
  if (!value.preset) return null;
  if (value.preset !== 'custom') return DATE_PRESET_LABELS[value.preset];
  return formatDateRange({ start: value.from, end: value.to }) ?? null;
}

function Panel({
  value,
  onApply,
  title,
}: {
  readonly value: DateFilterValue;
  readonly onApply: (v: DateFilterValue) => void;
  readonly title: string;
}): ReactNode {
  const [preset, setPreset] = useState<DatePreset>(value.preset ?? '7d');
  const [range, setRange] = useState<DateRange>({ start: value.from, end: value.to });
  const customIncomplete = preset === 'custom' && !range.start;

  const onRadioKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const delta =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? -1
          : 0;
    if (!delta) return;
    event.preventDefault();
    const next =
      DATE_PRESETS[(DATE_PRESETS.indexOf(preset) + delta + DATE_PRESETS.length) % DATE_PRESETS.length] ??
      preset;
    setPreset(next);
    event.currentTarget.querySelector<HTMLElement>(`[data-preset="${next}"]`)?.focus();
  };

  return (
    <FilterPanel
      title={title}
      width={284}
      applyDisabled={customIncomplete}
      onApply={() =>
        onApply(
          preset === 'custom'
            ? { preset, from: range.start, to: range.end ?? range.start }
            : { preset, from: null, to: null },
        )
      }
    >
      <div>
        <div role="radiogroup" aria-label="Date range" className={styles.presets} onKeyDown={onRadioKeyDown}>
          {DATE_PRESETS.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={preset === option}
              tabIndex={preset === option ? 0 : -1}
              data-preset={option}
              data-autofocus={preset === option || undefined}
              className={styles.preset}
              onClick={() => setPreset(option)}
            >
              <span className={styles.radio} aria-hidden="true" />
              {DATE_PRESET_LABELS[option]}
            </button>
          ))}
        </div>
        {preset === 'custom' ? (
          <div className={styles.calendarWrap}>
            <DateRangeCalendar value={range} onChange={setRange} max={todayPlainDate()} />
          </div>
        ) : null}
      </div>
    </FilterPanel>
  );
}

export function DateFilter({
  value,
  onChange,
  label = 'Date and time',
  title = 'Filter by date',
  defaultOpen,
}: {
  readonly value: DateFilterValue;
  readonly onChange: (value: DateFilterValue) => void;
  readonly label?: string;
  readonly title?: string;
  readonly defaultOpen?: boolean;
}): ReactNode {
  return (
    <FilterChip
      label={label}
      defaultOpen={defaultOpen}
      value={formatDateChip(value)}
      onClear={() => onChange({ preset: null, from: null, to: null })}
    >
      {({ close }) => (
        <Panel
          title={title}
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
