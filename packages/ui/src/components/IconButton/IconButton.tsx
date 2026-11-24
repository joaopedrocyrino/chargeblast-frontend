import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '../../utils/cx';
import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Required: icon-only controls must have an accessible name. */
  readonly 'aria-label': string;
  readonly icon: ReactNode;
  readonly size?: 'sm' | 'md';
  readonly ref?: Ref<HTMLButtonElement>;
}

export function IconButton({
  icon,
  size = 'md',
  type = 'button',
  className,
  ref,
  ...rest
}: IconButtonProps): ReactNode {
  return (
    <button ref={ref} type={type} className={cx(styles.iconButton, styles[size], className)} {...rest}>
      {icon}
    </button>
  );
}
