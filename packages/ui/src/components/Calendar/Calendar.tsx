'use client';

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../icons/icons';
import { cx } from '../../utils/cx';
import {
  addDays,
  addMonths,
  clampPlainDate,
  dayOfWeek,
  daysInMonth,
  formatPlainDate,
  parsePlainDate,
  startOfMonth,
  toPlainDate,
  todayPlainDate,
  type PlainDate,
} from '../../utils/plain-date';
import { IconButton } from '../IconButton/IconButton';
import styles from './Calendar.module.css';

export interface CalendarProps {
  /** Any date within the month to display. */
  readonly month: PlainDate;
  readonly onMonthChange: (month: PlainDate) => void;
  /** Date holding the roving tab stop; moves with arrow keys. */
  readonly focusedDate: PlainDate;
  readonly onFocusedDateChange: (date: PlainDate) => void;
  readonly onSelect: (date: PlainDate) => void;
  readonly isSelected?: (date: PlainDate) => boolean;
  /** Range highlighting: start/end/in-between. */
  readonly rangeState?: (date: PlainDate) => 'start' | 'end' | 'middle' | 'single' | null;
  readonly onHover?: (date: PlainDate | null) => void;
  readonly min?: PlainDate;
  readonly max?: PlainDate;
  /** Move DOM focus to the focused date (true after keyboard navigation/open). */
  readonly autoFocus?: boolean;
  readonly locale?: string;
}

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6].map((offset) => toPlainDate(2023, 1, 1 + offset)); // 2023-01-01 is a Sunday

/**
 * Month grid following the WAI-ARIA date-picker dialog pattern: one roving
 * tab stop, arrows move by day/week, Home/End to week bounds, PageUp/PageDown
 * by month (Shift = year), Enter/Space select.
 */
export function Calendar({
  month,
  onMonthChange,
  focusedDate,
  onFocusedDateChange,
  onSelect,
  isSelected = () => false,
  rangeState,
  onHover,
  min,
  max,
  autoFocus = false,
  locale,
}: CalendarProps): ReactNode {
  const titleId = useId();
  const gridRef = useRef<HTMLTableElement | null>(null);
  const shouldFocus = useRef(autoFocus);
  const today = todayPlainDate();
  const first = startOfMonth(month);
  const parts = parsePlainDate(first);
  if (!parts) throw new RangeError(`Invalid month ${month}`);
  const leading = dayOfWeek(first);
  const total = daysInMonth(parts.year, parts.month);
  const cells: (PlainDate | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: total }, (_, i) => toPlainDate(parts.year, parts.month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  useEffect(() => {
    if (!shouldFocus.current) return;
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-date="${focusedDate}"]`)
      ?.focus({ preventScroll: true });
  }, [focusedDate]);

  const isDisabled = (date: PlainDate): boolean =>
    (min !== undefined && date < min) || (max !== undefined && date > max);

  const focusDate = (date: PlainDate): void => {
    const next = clampPlainDate(date, min, max);
    shouldFocus.current = true;
    if (startOfMonth(next) !== first) onMonthChange(startOfMonth(next));
    onFocusedDateChange(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTableElement>): void => {
    const keyMoves: Record<string, () => PlainDate> = {
      ArrowLeft: () => addDays(focusedDate, -1),
      ArrowRight: () => addDays(focusedDate, 1),
      ArrowUp: () => addDays(focusedDate, -7),
      ArrowDown: () => addDays(focusedDate, 7),
      Home: () => addDays(focusedDate, -dayOfWeek(focusedDate)),
      End: () => addDays(focusedDate, 6 - dayOfWeek(focusedDate)),
      PageUp: () => addMonths(focusedDate, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focusedDate, event.shiftKey ? 12 : 1),
    };
    const move = keyMoves[event.key];
    if (move) {
      event.preventDefault();
      focusDate(move());
    }
  };

  const changeMonth = (delta: number): void => {
    const next = addMonths(first, delta);
    onMonthChange(next);
    onFocusedDateChange(clampPlainDate(next, min, max));
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <IconButton
          size="sm"
          aria-label="Previous month"
          icon={<ChevronLeftIcon size={14} />}
          onClick={() => changeMonth(-1)}
          disabled={min !== undefined && addDays(first, -1) < min}
        />
        <h2 id={titleId} className={styles.title} aria-live="polite">
          {formatPlainDate(first, { month: 'long', year: 'numeric' }, locale)}
        </h2>
        <IconButton
          size="sm"
          aria-label="Next month"
          icon={<ChevronRightIcon size={14} />}
          onClick={() => changeMonth(1)}
          disabled={max !== undefined && addMonths(first, 1) > max}
        />
      </div>
      <table
        ref={gridRef}
        role="grid"
        aria-labelledby={titleId}
        className={styles.grid}
        onKeyDown={onKeyDown}
      >
        <thead>
          <tr>
            {WEEKDAYS.map((day) => (
              <th
                key={day}
                scope="col"
                abbr={formatPlainDate(day, { weekday: 'long' }, locale)}
                className={styles.weekday}
              >
                {formatPlainDate(day, { weekday: 'narrow' }, locale)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody onMouseLeave={() => onHover?.(null)}>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((date, dayIndex) => {
                if (!date) return <td key={`empty-${dayIndex}`} role="gridcell" />;
                const disabled = isDisabled(date);
                const selected = isSelected(date);
                const range = rangeState?.(date) ?? null;
                return (
                  <td
                    key={date}
                    role="gridcell"
                    aria-selected={selected || undefined}
                    className={cx(range && styles[`range-${range}`])}
                  >
                    <button
                      type="button"
                      data-date={date}
                      tabIndex={date === focusedDate ? 0 : -1}
                      data-autofocus={(autoFocus && date === focusedDate) || undefined}
                      disabled={disabled}
                      aria-label={formatPlainDate(
                        date,
                        { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
                        locale,
                      )}
                      aria-current={date === today ? 'date' : undefined}
                      aria-pressed={selected}
                      className={cx(styles.day, selected && styles.selected, date === today && styles.today)}
                      onClick={() => {
                        shouldFocus.current = true;
                        onFocusedDateChange(date);
                        onSelect(date);
                      }}
                      onMouseEnter={() => onHover?.(date)}
                    >
                      {parsePlainDate(date)?.day}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
