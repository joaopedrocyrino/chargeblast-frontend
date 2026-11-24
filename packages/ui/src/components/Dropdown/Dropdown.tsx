'use client';
/* eslint-disable react-hooks/refs --
 * Overlay primitives hand ref callbacks and event handlers to render props /
 * cloned children. They run only after render (commit / events), which the
 * React Compiler lint cannot prove across a render-prop boundary.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useDismiss } from '../../hooks/useDismiss';
import { useFloatingPosition, type Placement } from '../../hooks/useFloatingPosition';
import { cx } from '../../utils/cx';
import { Portal } from '../Portal/Portal';
import overlay from '../overlay.module.css';

export interface DropdownItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: ReactNode;
  readonly onSelect: () => void;
  readonly disabled?: boolean;
  readonly tone?: 'default' | 'danger';
}

export interface DropdownSeparator {
  readonly id: string;
  readonly type: 'separator';
}

export type DropdownEntry = DropdownItem | DropdownSeparator;

export interface DropdownTriggerProps {
  readonly ref: (node: HTMLElement | null) => void;
  readonly onClick: (event: MouseEvent<HTMLElement>) => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  readonly 'aria-haspopup': 'menu';
  readonly 'aria-expanded': boolean;
  readonly 'aria-controls': string | undefined;
  readonly id: string;
}

export interface DropdownProps {
  readonly items: readonly DropdownEntry[];
  readonly renderTrigger: (props: DropdownTriggerProps, state: { open: boolean }) => ReactNode;
  readonly placement?: Placement;
  readonly className?: string;
}

const isItem = (entry: DropdownEntry): entry is DropdownItem => !('type' in entry);

/**
 * Action menu following the WAI-ARIA menu-button pattern: Enter/Space/Arrow
 * keys open it, Arrow/Home/End move, typing jumps to a matching item, and
 * Escape/Tab close it, returning focus to the trigger.
 */
export function Dropdown({
  items,
  renderTrigger,
  placement = 'bottom-end',
  className,
}: DropdownProps): ReactNode {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const triggerId = useId();
  const menuId = useId();
  const anchorRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { style } = useFloatingPosition(anchorRef, menuRef, { open, placement });

  const actionable = items.filter(isItem);
  const enabledIndexes = actionable.flatMap((item, index) => (item.disabled ? [] : [index]));

  const openMenu = (focus: 'first' | 'last'): void => {
    setOpen(true);
    setActive(focus === 'first' ? (enabledIndexes[0] ?? -1) : (enabledIndexes.at(-1) ?? -1));
  };
  const closeMenu = (restoreFocus = true): void => {
    setOpen(false);
    setActive(-1);
    if (restoreFocus) anchorRef.current?.focus({ preventScroll: true });
  };

  useDismiss({
    enabled: open,
    refs: [anchorRef, menuRef],
    onDismiss: (reason) => closeMenu(reason === 'escape'),
  });

  useEffect(() => {
    if (open && active >= 0) itemRefs.current[active]?.focus({ preventScroll: true });
  }, [open, active]);

  const move = (delta: 1 | -1): void => {
    if (enabledIndexes.length === 0) return;
    const position = enabledIndexes.indexOf(active);
    const next = (position + delta + enabledIndexes.length) % enabledIndexes.length;
    setActive(enabledIndexes[next] ?? -1);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openMenu('first');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu('last');
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        return;
      case 'Home':
        event.preventDefault();
        setActive(enabledIndexes[0] ?? -1);
        return;
      case 'End':
        event.preventDefault();
        setActive(enabledIndexes.at(-1) ?? -1);
        return;
      case 'Tab':
        event.preventDefault();
        closeMenu();
        return;
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const char = event.key.toLowerCase();
          const start = enabledIndexes.indexOf(active);
          const ordered = [...enabledIndexes.slice(start + 1), ...enabledIndexes.slice(0, start + 1)];
          const match = ordered.find((index) => actionable[index]?.label.toLowerCase().startsWith(char));
          if (match !== undefined) setActive(match);
        }
    }
  };

  const select = (item: DropdownItem): void => {
    if (item.disabled) return;
    closeMenu();
    item.onSelect();
  };

  const setAnchor = useCallback((node: HTMLElement | null) => {
    anchorRef.current = node;
  }, []);
  const actionIndexes: number[] = [];
  {
    let counter = -1;
    for (const entry of items) actionIndexes.push(isItem(entry) ? ++counter : -1);
  }

  return (
    <>
      {renderTrigger(
        {
          ref: setAnchor,
          id: triggerId,
          onClick: () => (open ? closeMenu() : openMenu('first')),
          onKeyDown: onTriggerKeyDown,
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          'aria-controls': open ? menuId : undefined,
        },
        { open },
      )}
      {open ? (
        <Portal>
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-labelledby={triggerId}
            className={cx(overlay.surface, overlay.list, className)}
            style={style}
            onKeyDown={onMenuKeyDown}
          >
            {items.map((entry, position) => {
              if (!isItem(entry))
                return <div key={entry.id} role="separator" className={overlay.separator} />;
              const index = actionIndexes[position] ?? -1;
              return (
                <button
                  key={entry.id}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  disabled={entry.disabled}
                  aria-disabled={entry.disabled || undefined}
                  data-active={index === active || undefined}
                  className={cx(overlay.option, entry.tone === 'danger' && overlay.danger)}
                  onMouseEnter={() => !entry.disabled && setActive(index)}
                  onClick={() => select(entry)}
                >
                  {entry.icon ? <span className={overlay.optionIcon}>{entry.icon}</span> : null}
                  {entry.label}
                </button>
              );
            })}
          </div>
        </Portal>
      ) : null}
    </>
  );
}
