import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Spinner.module.css';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Diameter in px. Default 16. */
  readonly size?: number;
  /** Accessible label; pass `null` when a parent already announces loading. */
  readonly label?: string | null;
}

export function Spinner({ size = 16, label = 'Loading', className, ...rest }: SpinnerProps): ReactNode {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      className={cx(styles.spinner, className)}
      style={{ width: size, height: size }}
      {...rest}
    >
      <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
        <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}
