'use client';

import { AddFilterButton, Dropdown } from '@chargeblast/ui';
import type { ReactNode } from 'react';

const EXTRA_FILTERS = [
  { id: 'brand', label: 'Card brand' },
  { id: 'decline', label: 'Decline reason' },
  { id: 'refunded', label: 'Refunded date' },
] as const;

export type ExtraFilterId = (typeof EXTRA_FILTERS)[number]['id'];

/** "More filters" menu: adds one of the less common filters to the toolbar. */
export function MoreFilters({
  shown,
  onAdd,
}: {
  /** Extra filters already in the toolbar (left out of the menu). */
  readonly shown: ReadonlySet<ExtraFilterId>;
  readonly onAdd: (id: ExtraFilterId) => void;
}): ReactNode {
  const available = EXTRA_FILTERS.filter((filter) => !shown.has(filter.id));
  if (available.length === 0) return null;
  return (
    <Dropdown
      placement="bottom-start"
      items={available.map((filter) => ({
        id: filter.id,
        label: filter.label,
        onSelect: () => onAdd(filter.id),
      }))}
      renderTrigger={(props) => (
        <AddFilterButton {...props} data-testid="filter-more">
          More filters
        </AddFilterButton>
      )}
    />
  );
}
