'use client';

import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { ChevronDownIcon, CloseIcon, PlusCircleIcon } from '../../icons/icons';
import { Button } from '../Button/Button';
import { Popover, type PopoverApi } from '../Popover/Popover';
import styles from './FilterChip.module.css';

const testId = (label: string): string => `filter-${label.toLowerCase().replace(/\s+/g, '-')}`;

export interface AddFilterButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ref?: Ref<HTMLButtonElement>;
}

/** Dashed "⊕ Label" pill: an inactive filter, or a menu trigger such as "More filters". */
export function AddFilterButton({ children, type = 'button', ...rest }: AddFilterButtonProps): ReactNode {
  return (
    <button type={type} className={styles.chip} {...rest}>
      <PlusCircleIcon size={12} strokeWidth={1.75} />
      {children}
    </button>
  );
}

export interface FilterChipProps {
  readonly label: string;
  /** Summary of the applied value; `null` renders the inactive (dashed) chip. */
  readonly value: string | null;
  readonly onClear: () => void;
  readonly children: (api: PopoverApi) => ReactNode;
  /** Open on mount, e.g. right after the filter was added from a menu. */
  readonly defaultOpen?: boolean;
}

/**
 * Stripe-style filter pill. Inactive: dashed outline with a plus icon.
 * Active: solid outline showing the value, with a separate clear button.
 * The popover content is usually a `FilterPanel`.
 */
export function FilterChip({ label, value, onClear, children, defaultOpen }: FilterChipProps): ReactNode {
  return (
    <Popover
      defaultOpen={defaultOpen}
      aria-label={`Filter by ${label.toLowerCase()}`}
      renderTrigger={(props) =>
        value !== null ? (
          <span className={styles.chipActive} data-testid={testId(label)}>
            <button
              type="button"
              className={styles.chipClear}
              aria-label={`Clear ${label.toLowerCase()} filter`}
              onClick={onClear}
            >
              <CloseIcon size={10} strokeWidth={2.5} />
            </button>
            <button {...props} type="button" className={styles.chipMain}>
              <span className={styles.chipLabel}>{label}</span>
              <span className={styles.chipDivider} aria-hidden="true" />
              <span className={styles.chipValue}>{value}</span>
              <ChevronDownIcon size={12} strokeWidth={2} className={styles.chipChevron} />
            </button>
          </span>
        ) : (
          <AddFilterButton {...props} data-testid={testId(label)}>
            {label}
          </AddFilterButton>
        )
      }
    >
      {(api) => children(api)}
    </Popover>
  );
}

export interface FilterPanelProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly onApply: () => void;
  readonly applyDisabled?: boolean;
  /** Panel width in px. Default 272. */
  readonly width?: number;
}

/** Titled popover body with a full-width "Apply" button; Enter submits. */
export function FilterPanel({
  title,
  children,
  onApply,
  applyDisabled = false,
  width = 272,
}: FilterPanelProps): ReactNode {
  return (
    <form
      className={styles.panel}
      style={{ width }}
      onSubmit={(event) => {
        event.preventDefault();
        if (!applyDisabled) onApply();
      }}
    >
      <p className={styles.panelTitle}>{title}</p>
      <div className={styles.panelBody}>{children}</div>
      <div className={styles.panelFooter}>
        <Button type="submit" variant="primary" fullWidth disabled={applyDisabled}>
          Apply
        </Button>
      </div>
    </form>
  );
}
