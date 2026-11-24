import { useEffect, useRef, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { cx } from '../../utils/cx';
import { mergeRefs } from '../../utils/refs';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visual "mixed" state (e.g. a select-all with some rows selected). */
  readonly indeterminate?: boolean;
  /** Visible label. Without one, pass `aria-label`. */
  readonly label?: ReactNode;
  readonly ref?: Ref<HTMLInputElement>;
}

/**
 * Native checkbox (so keyboard, forms and assistive tech work for free) with
 * a custom-drawn box layered underneath the transparent input.
 */
export function Checkbox({
  indeterminate = false,
  label,
  className,
  disabled,
  ref,
  ...rest
}: CheckboxProps): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className={cx(styles.root, className)} data-disabled={disabled || undefined}>
      <span className={styles.control}>
        <input
          ref={mergeRefs(inputRef, ref)}
          type="checkbox"
          className={styles.input}
          disabled={disabled}
          {...rest}
        />
        <span className={styles.box} aria-hidden="true">
          <svg className={styles.check} viewBox="0 0 12 12" fill="none">
            <path
              d="m2.5 6.25 2.25 2.25 4.75-5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg className={styles.dash} viewBox="0 0 12 12" fill="none">
            <path d="M3 6h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </span>
      </span>
      {label ? <span className={styles.label}>{label}</span> : null}
    </label>
  );
}
