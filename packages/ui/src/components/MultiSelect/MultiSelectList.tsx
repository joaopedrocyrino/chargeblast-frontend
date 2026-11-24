'use client';

import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { CheckIcon } from '../../icons/icons';
import { cx } from '../../utils/cx';
import overlay from '../overlay.module.css';
import type { SelectOption } from '../Select/Select';
import styles from './MultiSelect.module.css';

export interface MultiSelectListProps<V extends string> {
  readonly options: readonly SelectOption<V>[];
  readonly value: readonly V[];
  readonly onChange: (value: V[]) => void;
  readonly 'aria-label'?: string;
  readonly 'aria-labelledby'?: string;
  /** Mark as the initial focus target inside a Popover. */
  readonly autoFocus?: boolean;
  readonly className?: string;
}

/**
 * Inline multi-select listbox (`aria-multiselectable`). Arrow keys move the
 * highlight, Space/Enter toggle, Ctrl/⌘+A toggles all. Values are reported in
 * option order regardless of click order.
 */
export function MultiSelectList<V extends string>({
  options,
  value,
  onChange,
  autoFocus = false,
  className,
  ...aria
}: MultiSelectListProps<V>): ReactNode {
  const id = useId();
  const [active, setActive] = useState(-1);
  const enabled = options.flatMap((option, index) => (option.disabled ? [] : [index]));

  const toggle = (index: number): void => {
    const option = options[index];
    if (!option || option.disabled) return;
    const next = value.includes(option.value)
      ? value.filter((v) => v !== option.value)
      : [...value, option.value];
    onChange(options.map((o) => o.value).filter((v) => next.includes(v)));
  };

  const move = (delta: 1 | -1): void => {
    const position = enabled.indexOf(active);
    const next = position === -1 ? 0 : Math.min(Math.max(position + delta, 0), enabled.length - 1);
    setActive(enabled[next] ?? -1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      case 'Home':
        event.preventDefault();
        setActive(enabled[0] ?? -1);
        break;
      case 'End':
        event.preventDefault();
        setActive(enabled.at(-1) ?? -1);
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        toggle(active);
        break;
      case 'a':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const all = enabled.map((index) => options[index]?.value).filter((v): v is V => v !== undefined);
          onChange(value.length === all.length ? [] : all);
        }
        break;
    }
  };

  return (
    <ul
      role="listbox"
      aria-multiselectable="true"
      tabIndex={0}
      aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
      data-autofocus={autoFocus || undefined}
      className={cx(styles.list, className)}
      onKeyDown={onKeyDown}
      onFocus={() => active < 0 && setActive(enabled[0] ?? -1)}
      onBlur={() => setActive(-1)}
      {...aria}
    >
      {options.map((option, index) => {
        const selected = value.includes(option.value);
        return (
          <li
            key={option.value}
            id={`${id}-${index}`}
            role="option"
            aria-selected={selected}
            aria-disabled={option.disabled || undefined}
            data-active={index === active || undefined}
            className={overlay.option}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setActive(index);
              toggle(index);
            }}
          >
            <span className={overlay.checkbox} aria-hidden="true">
              <CheckIcon size={10} strokeWidth={2.25} />
            </span>
            {option.label}
          </li>
        );
      })}
    </ul>
  );
}
