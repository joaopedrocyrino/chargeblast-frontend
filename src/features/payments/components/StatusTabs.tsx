'use client';

import { cx } from '@chargeblast/ui';
import type { ReactNode } from 'react';
import type { PaymentStatus } from '../types/payment';
import { STATUS_LABELS } from '../utils/format';
import styles from './StatusTabs.module.css';

/** The reference's quick filters, in its order (Pending stays in the Status filter). */
const TABS: readonly (PaymentStatus | 'all')[] = [
  'all',
  'succeeded',
  'refunded',
  'disputed',
  'failed',
  'uncaptured',
];

interface StatusTabsProps {
  readonly selected: readonly PaymentStatus[];
  readonly onSelect: (statuses: PaymentStatus[]) => void;
}

/** Quick status filters (Stripe's summary cards). */
export function StatusTabs({ selected, onSelect }: StatusTabsProps): ReactNode {
  const isActive = (tab: PaymentStatus | 'all'): boolean =>
    tab === 'all' ? selected.length === 0 : selected.length === 1 && selected[0] === tab;

  return (
    <div className={styles.tabs} role="group" aria-label="Filter by status">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          aria-pressed={isActive(tab)}
          className={cx(styles.tab, isActive(tab) && styles.active)}
          onClick={() => onSelect(tab === 'all' ? [] : [tab])}
          data-testid={`status-tab-${tab}`}
        >
          <span className={styles.label}>{tab === 'all' ? 'All' : STATUS_LABELS[tab]}</span>
        </button>
      ))}
    </div>
  );
}
