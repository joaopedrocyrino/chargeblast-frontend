/**
 * Calendar dates without a time or time zone, as ISO strings "YYYY-MM-DD".
 * Date pickers work with plain dates so a selection never shifts by a day
 * when converted across time zones; consumers decide how a plain date maps
 * to instants (e.g. local midnight).
 */
export type PlainDate = string;

const PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface PlainDateParts {
  readonly year: number;
  readonly month: number; // 1–12
  readonly day: number;
}

export function parsePlainDate(value: string): PlainDateParts | null {
  const match = PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

export function isPlainDate(value: string): value is PlainDate {
  return parsePlainDate(value) !== null;
}

export function toPlainDate(year: number, month: number, day: number): PlainDate {
  const date = new Date(Date.UTC(year, month - 1, day));
  return [
    String(date.getUTCFullYear()).padStart(4, '0'),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

/** The calendar date of an instant in the runtime's local time zone. */
export function plainDateFromLocal(date: Date): PlainDate {
  return toPlainDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function todayPlainDate(now: Date = new Date()): PlainDate {
  return plainDateFromLocal(now);
}

function partsOrThrow(value: PlainDate): PlainDateParts {
  const parts = parsePlainDate(value);
  if (!parts) throw new RangeError(`Invalid plain date "${value}"`);
  return parts;
}

export function addDays(value: PlainDate, days: number): PlainDate {
  const { year, month, day } = partsOrThrow(value);
  return toPlainDate(year, month, day + days);
}

/** Adds months, clamping the day to the target month's length. */
export function addMonths(value: PlainDate, months: number): PlainDate {
  const { year, month, day } = partsOrThrow(value);
  const firstOfTarget = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = daysInMonth(firstOfTarget.getUTCFullYear(), firstOfTarget.getUTCMonth() + 1);
  return toPlainDate(firstOfTarget.getUTCFullYear(), firstOfTarget.getUTCMonth() + 1, Math.min(day, lastDay));
}

export function startOfMonth(value: PlainDate): PlainDate {
  const { year, month } = partsOrThrow(value);
  return toPlainDate(year, month, 1);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** 0 = Sunday … 6 = Saturday. */
export function dayOfWeek(value: PlainDate): number {
  const { year, month, day } = partsOrThrow(value);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function clampPlainDate(value: PlainDate, min?: PlainDate, max?: PlainDate): PlainDate {
  if (min && value < min) return min;
  if (max && value > max) return max;
  return value;
}

export function formatPlainDate(
  value: PlainDate,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' },
  locale?: string,
): string {
  const { year, month, day } = partsOrThrow(value);
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

/** Local midnight at the start of the given calendar date. */
export function plainDateToLocalStart(value: PlainDate): Date {
  const { year, month, day } = partsOrThrow(value);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}
