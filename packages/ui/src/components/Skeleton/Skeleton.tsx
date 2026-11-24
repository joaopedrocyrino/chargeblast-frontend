import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Skeleton.module.css';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  readonly width?: CSSProperties['width'];
  readonly height?: CSSProperties['height'];
  readonly radius?: CSSProperties['borderRadius'];
}

/** Decorative placeholder; announce loading via the container (`aria-busy`). */
export function Skeleton({
  width = '100%',
  height = 12,
  radius = 4,
  className,
  style,
  ...rest
}: SkeletonProps): ReactNode {
  return (
    <span
      aria-hidden="true"
      className={cx(styles.skeleton, className)}
      style={{ width, height, borderRadius: radius, ...style }}
      {...rest}
    />
  );
}
