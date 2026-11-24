'use client';

import { useId, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Button } from '../Button/Button';
import { Select } from '../Select/Select';
import styles from './Pagination.module.css';

export interface PaginationProps {
  /** 1-based current page. */
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly onPageChange: (page: number) => void;
  readonly pageSizeOptions?: readonly number[];
  readonly onPageSizeChange?: (pageSize: number) => void;
  readonly disabled?: boolean;
  /** Plural noun for the summary, e.g. "results". */
  readonly itemLabel?: string;
  readonly className?: string;
}

const numberFormat = new Intl.NumberFormat('en-US');

function getPageSummary(
  page: number,
  pageSize: number,
  totalItems: number,
): { from: number; to: number; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems === 0) return { from: 0, to: 0, totalPages };
  const from = Math.min((page - 1) * pageSize + 1, totalItems);
  const to = Math.min(page * pageSize, totalItems);
  return { from, to, totalPages };
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  pageSizeOptions = [25, 50, 100],
  onPageSizeChange,
  disabled = false,
  itemLabel = 'results',
  className,
}: PaginationProps): ReactNode {
  const pageSizeLabelId = useId();
  const { from, to, totalPages } = getPageSummary(page, pageSize, totalItems);
  const fmt = (n: number): string => numberFormat.format(n);

  return (
    <nav aria-label="Pagination" className={cx(styles.pagination, className)}>
      <p className={styles.summary} aria-live="polite">
        Viewing{' '}
        <strong>
          {fmt(from)}–{fmt(to)}
        </strong>{' '}
        of <strong>{fmt(totalItems)}</strong> {itemLabel}
      </p>
      <div className={styles.controls}>
        {onPageSizeChange ? (
          <div className={styles.pageSize}>
            <span id={pageSizeLabelId} className={styles.muted}>
              Rows per page
            </span>
            <Select
              size="sm"
              aria-labelledby={pageSizeLabelId}
              value={String(pageSize)}
              options={pageSizeOptions.map((size) => ({ value: String(size), label: String(size) }))}
              onChange={(value) => onPageSizeChange(Number(value))}
              disabled={disabled}
              placement="top-start"
            />
          </div>
        ) : null}
        <span className={styles.muted}>
          Page {fmt(Math.min(page, totalPages))} of {fmt(totalPages)}
        </span>
        <div className={styles.buttons}>
          <Button size="sm" onClick={() => onPageChange(page - 1)} disabled={disabled || page <= 1}>
            Previous
          </Button>
          <Button size="sm" onClick={() => onPageChange(page + 1)} disabled={disabled || page >= totalPages}>
            Next
          </Button>
        </div>
      </div>
    </nav>
  );
}
