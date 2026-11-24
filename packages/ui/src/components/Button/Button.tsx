import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '../../utils/cx';
import { Spinner } from '../Spinner/Spinner';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'link';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly leadingIcon?: ReactNode;
  readonly trailingIcon?: ReactNode;
  /** Shows a spinner, sets `aria-busy` and disables interaction. */
  readonly loading?: boolean;
  readonly fullWidth?: boolean;
  readonly ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  loading = false,
  fullWidth = false,
  disabled,
  type = 'button',
  className,
  children,
  ref,
  ...rest
}: ButtonProps): ReactNode {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        loading && styles.loading,
        fullWidth && styles.fullWidth,
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className={styles.spinner}>
          <Spinner size={size === 'sm' ? 12 : 14} label={null} />
        </span>
      ) : null}
      {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
      {children !== undefined && children !== null ? <span className={styles.label}>{children}</span> : null}
      {trailingIcon ? <span className={styles.icon}>{trailingIcon}</span> : null}
    </button>
  );
}
