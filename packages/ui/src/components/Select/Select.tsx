'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useDismiss } from '../../hooks/useDismiss';
import { useFloatingPosition, type Placement } from '../../hooks/useFloatingPosition';
import { CheckIcon, ChevronDownIcon } from '../../icons/icons';
import { cx } from '../../utils/cx';
import { Portal } from '../Portal/Portal';
import overlay from '../overlay.module.css';
import styles from './Select.module.css';

export interface SelectOption<V extends string> {
  readonly value: V;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface SelectProps<V extends string> {
  readonly options: readonly SelectOption<V>[];
  readonly value: V;
  readonly onChange: (value: V) => void;
  readonly 'aria-label'?: string;
  readonly 'aria-labelledby'?: string;
  readonly id?: string;
  readonly disabled?: boolean;
  readonly size?: 'sm' | 'md';
  readonly placement?: Placement;
  readonly className?: string;
}

/**
 * Single-value picker implementing the WAI-ARIA "select-only combobox":
 * focus stays on the button while `aria-activedescendant` tracks the
 * highlighted option in the popup listbox.
 */
export function Select<V extends string>({
  options,
  value,
  onChange,
  id,
  disabled = false,
  size = 'md',
  placement = 'bottom-start',
  className,
  ...aria
}: SelectProps<V>): ReactNode {
  const generatedId = useId();
  const buttonId = id ?? generatedId;
  const listId = `${buttonId}-listbox`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const { style } = useFloatingPosition(buttonRef, listRef, { open, placement, matchAnchorWidth: true });

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];
  const enabled = options.flatMap((option, index) => (option.disabled ? [] : [index]));

  const openList = (index = selectedIndex >= 0 ? selectedIndex : (enabled[0] ?? -1)): void => {
    setOpen(true);
    setActive(index);
  };
  const closeList = (): void => {
    setOpen(false);
    setActive(-1);
  };
  const commit = (index: number): void => {
    const option = options[index];
    if (!option || option.disabled) return;
    closeList();
    buttonRef.current?.focus({ preventScroll: true });
    if (option.value !== value) onChange(option.value);
  };

  useDismiss({ enabled: open, refs: [buttonRef, listRef], onDismiss: closeList });

  useEffect(() => {
    if (!open || active < 0) return;
    document.getElementById(`${listId}-${active}`)?.scrollIntoView?.({ block: 'nearest' });
  }, [open, active, listId]);

  const move = (delta: 1 | -1): void => {
    const position = enabled.indexOf(active);
    const next = Math.min(Math.max(position + delta, 0), enabled.length - 1);
    setActive(enabled[next] ?? active);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        openList();
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        openList(event.key === 'Home' ? enabled[0] : enabled.at(-1));
      }
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (event.altKey) commit(active);
        else move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (event.altKey) commit(active);
        else move(-1);
        break;
      case 'Home':
        event.preventDefault();
        setActive(enabled[0] ?? -1);
        break;
      case 'End':
        event.preventDefault();
        setActive(enabled.at(-1) ?? -1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        commit(active);
        break;
      case 'Tab':
        closeList();
        break;
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const char = event.key.toLowerCase();
          const match = enabled.find((index) => options[index]?.label.toLowerCase().startsWith(char));
          if (match !== undefined) setActive(match);
        }
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        disabled={disabled}
        className={cx(styles.trigger, styles[size], className)}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={onKeyDown}
        {...aria}
      >
        <span className={styles.value}>{selected?.label ?? ''}</span>
        <ChevronDownIcon size={12} strokeWidth={2} className={styles.chevron} />
      </button>
      {open ? (
        <Portal>
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={buttonId}
            className={cx(overlay.surface, overlay.list, styles.list)}
            style={style}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled || undefined}
                data-active={index === active || undefined}
                className={overlay.option}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => !option.disabled && setActive(index)}
                onClick={() => commit(index)}
              >
                {option.label}
                {option.value === value ? (
                  <span className={overlay.check}>
                    <CheckIcon size={14} strokeWidth={2} />
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </Portal>
      ) : null}
    </>
  );
}
