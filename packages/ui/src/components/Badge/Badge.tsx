import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Badge.module.css';

export type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly tone?: BadgeTone;
  /** Optional icon rendered after the label (Stripe style). */
  readonly icon?: ReactNode;
  readonly children: ReactNode;
}

export function Badge({ tone = 'neutral', icon, className, children, ...rest }: BadgeProps): ReactNode {
  return (
    <span className={cx(styles.badge, styles[tone], className)} {...rest}>
      <span>{children}</span>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
    </span>
  );
}
