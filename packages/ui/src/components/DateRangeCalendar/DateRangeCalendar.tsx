'use client';

import { useState, type ReactNode } from 'react';
import { clampPlainDate, formatPlainDate, todayPlainDate, type PlainDate } from '../../utils/plain-date';
import { Calendar } from '../Calendar/Calendar';

export interface DateRange {
  readonly start: PlainDate | null;
  readonly end: PlainDate | null;
}

export interface DateRangeCalendarProps {
  readonly value: DateRange;
  /** Called after each click: first with `{start, end: null}`, then with both. */
  readonly onChange: (range: DateRange) => void;
  readonly min?: PlainDate;
  readonly max?: PlainDate;
  readonly autoFocus?: boolean;
  readonly locale?: string;
}

/** "Nov 1, 2026 – Nov 7, 2026", or the single day; null without a start. */
export function formatDateRange(range: DateRange, locale?: string): string | null {
  if (!range.start) return null;
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const start = formatPlainDate(range.start, options, locale);
  if (!range.end || range.end === range.start) return start;
  return `${start} – ${formatPlainDate(range.end, options, locale)}`;
}

/** Next range after clicking `date`, given the current (possibly partial) range. */
function nextRange(current: DateRange, date: PlainDate): DateRange {
  if (!current.start || current.end) return { start: date, end: null };
  if (date < current.start) return { start: date, end: current.start };
  return { start: current.start, end: date };
}

/** Inline calendar selecting an inclusive [start, end] range with hover preview. */
export function DateRangeCalendar({
  value,
  onChange,
  min,
  max,
  autoFocus = false,
  locale,
}: DateRangeCalendarProps): ReactNode {
  const initial = clampPlainDate(value.start ?? todayPlainDate(), min, max);
  const [month, setMonth] = useState(initial);
  const [focused, setFocused] = useState(initial);
  const [hover, setHover] = useState<PlainDate | null>(null);

  const previewEnd = value.start && !value.end ? hover : value.end;
  const [from, to] =
    value.start && previewEnd && previewEnd < value.start
      ? [previewEnd, value.start]
      : [value.start, previewEnd];

  return (
    <Calendar
      month={month}
      onMonthChange={setMonth}
      focusedDate={focused}
      onFocusedDateChange={(date) => {
        setFocused(date);
        if (value.start && !value.end) setHover(date);
      }}
      onSelect={(date) => onChange(nextRange(value, date))}
      onHover={setHover}
      isSelected={(date) => date === value.start || date === value.end}
      rangeState={(date) => {
        if (!from) return null;
        if (!to || from === to) return date === from ? 'single' : null;
        if (date === from) return 'start';
        if (date === to) return 'end';
        return date > from && date < to ? 'middle' : null;
      }}
      min={min}
      max={max}
      autoFocus={autoFocus}
      locale={locale}
    />
  );
}
