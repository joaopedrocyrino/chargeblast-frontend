'use client';

import {
  CloseIcon,
  createPersistentStore,
  IconButton,
  SparkleIcon,
  usePersistentStore,
} from '@chargeblast/ui';
import type { ReactNode } from 'react';
import styles from './NoticeBanner.module.css';

// Dismissal is remembered per browser.
const dismissed = createPersistentStore(
  'chargeblast.notice.rule-attributes.dismissed',
  false,
  (raw) => raw === true,
);

/** Dashboard announcement bar above the status tabs (copy from the reference). */
export function NoticeBanner(): ReactNode {
  if (usePersistentStore(dismissed, false)) return null;
  return (
    <aside className={styles.banner} aria-label="Announcement">
      <span className={styles.badge}>
        <SparkleIcon size={12} strokeWidth={1.25} />
        New
      </span>
      <p className={styles.text}>
        Rule Attributes are now in Sigma and Data Pipeline for better fraud insights.
      </p>
      <button type="button" className={styles.action} title="Not part of this demo">
        Get started
      </button>
      <span className={styles.divider} aria-hidden="true" />
      <IconButton
        size="sm"
        aria-label="Dismiss announcement"
        icon={<CloseIcon size={14} strokeWidth={2} />}
        onClick={() => dismissed.set(true)}
      />
    </aside>
  );
}
