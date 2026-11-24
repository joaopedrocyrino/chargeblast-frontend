import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '../../utils/cx';
import styles from './Input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  readonly size?: 'sm' | 'md';
  /** Decorative element before the text (e.g. a search icon). */
  readonly leadingIcon?: ReactNode;
  /** Element after the text (e.g. a clear button or unit). */
  readonly trailing?: ReactNode;
  /** Marks the field invalid (`aria-invalid`) and styles it accordingly. */
  readonly invalid?: boolean;
  readonly wrapperClassName?: string;
  readonly ref?: Ref<HTMLInputElement>;
}

export function Input({
  size = 'md',
  leadingIcon,
  trailing,
  invalid = false,
  disabled,
  className,
  wrapperClassName,
  ref,
  ...rest
}: InputProps): ReactNode {
  return (
    <div
      className={cx(styles.wrapper, styles[size], wrapperClassName)}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
    >
      {leadingIcon ? (
        <span className={styles.leading} aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cx(styles.input, className)}
        {...rest}
      />
      {trailing ? <span className={styles.trailing}>{trailing}</span> : null}
    </div>
  );
}
