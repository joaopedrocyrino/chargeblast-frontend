import { addDays, plainDateFromLocal, plainDateToLocalStart, type PlainDate } from '@chargeblast/ui';

export const DATE_PRESETS = ['today', '7d', '30d', 'custom'] as const;
export type DatePreset = (typeof DATE_PRESETS)[number];

export const DATE_PRESET_LABELS: Readonly<Record<DatePreset, string>> = {
  today: 'Today',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  custom: 'Custom',
};

interface ResolvedRange {
  readonly from?: string;
  readonly to?: string;
}

/**
 * Converts a preset (interpreted in the browser's local time zone) to UTC
 * instants for the API: an inclusive start and an exclusive end.
 *  - today:  local midnight today → open-ended
 *  - 7d/30d: local midnight 6/29 days ago (so today counts as one of the days) → open-ended
 *  - custom: local midnight of `from` → local midnight after `to` (both days inclusive)
 */
export function resolveDateRange(
  preset: DatePreset | null,
  from: PlainDate | null,
  to: PlainDate | null,
  now: Date = new Date(),
): ResolvedRange {
  const today = plainDateFromLocal(now);
  const start = (date: PlainDate): string => plainDateToLocalStart(date).toISOString();
  switch (preset) {
    case 'today':
      return { from: start(today) };
    case '7d':
      return { from: start(addDays(today, -6)) };
    case '30d':
      return { from: start(addDays(today, -29)) };
    case 'custom':
      return {
        ...(from ? { from: start(from) } : {}),
        ...(to ? { to: start(addDays(to, 1)) } : {}),
      };
    default:
      return {};
  }
}
