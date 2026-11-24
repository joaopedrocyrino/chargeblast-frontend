import { useId, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Field.module.css';

/** Props to spread onto the control inside a `Field`. */
export interface FieldControlProps {
  readonly id: string;
  readonly 'aria-describedby': string | undefined;
  readonly invalid: boolean;
}

export interface FieldProps {
  readonly label: ReactNode;
  /** Shown under the control in red; marks the control invalid. */
  readonly error?: string | null;
  readonly hint?: ReactNode;
  /** Renders the control, wired to the label, hint and error. */
  readonly children: (control: FieldControlProps) => ReactNode;
  /** `sm`: compact label for popovers and dense panels. Default `md`. */
  readonly size?: 'sm' | 'md';
  readonly className?: string;
}

/** Label + control + optional hint and error, with the accessible wiring done once. */
export function Field({ label, error, hint, children, size = 'md', className }: FieldProps): ReactNode {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx(styles.field, size === 'sm' && styles.sm, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children({ id, 'aria-describedby': describedBy, invalid: Boolean(error) })}
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
