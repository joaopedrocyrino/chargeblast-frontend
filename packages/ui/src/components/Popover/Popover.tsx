'use client';
/* eslint-disable react-hooks/refs --
 * Overlay primitives hand ref callbacks and event handlers to render props /
 * cloned children. They run only after render (commit / events), which the
 * React Compiler lint cannot prove across a render-prop boundary.
 */

import {
  useCallback,
  useMemo,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { useDismiss } from '../../hooks/useDismiss';
import { useFloatingPosition, type Placement } from '../../hooks/useFloatingPosition';
import { cx } from '../../utils/cx';
import { focusInitial, getFocusableElements } from '../../utils/focus';
import { Portal } from '../Portal/Portal';
import overlay from '../overlay.module.css';
import styles from './Popover.module.css';

export interface PopoverTriggerProps {
  readonly ref: (node: HTMLElement | null) => void;
  readonly onClick: (event: MouseEvent<HTMLElement>) => void;
  readonly 'aria-expanded': boolean;
  readonly 'aria-controls': string | undefined;
  readonly 'aria-haspopup': 'dialog';
}

export interface PopoverApi {
  /** Closes the popover and returns focus to the trigger. */
  readonly close: () => void;
}

export interface PopoverProps {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** Renders the trigger; spread the props onto a focusable element. */
  readonly renderTrigger: (props: PopoverTriggerProps, state: { open: boolean }) => ReactNode;
  readonly children: ReactNode | ((api: PopoverApi) => ReactNode);
  readonly placement?: Placement;
  readonly 'aria-label'?: string;
  readonly 'aria-labelledby'?: string;
  readonly className?: string;
  readonly matchAnchorWidth?: boolean;
  /** Where focus goes on open. `first` honours `[data-autofocus]`. Default `first`. */
  readonly initialFocus?: 'first' | 'none';
}

/**
 * Non-modal dialog anchored to a trigger. Focus moves inside on open and is
 * kept there with Tab/Shift+Tab; Escape or an outside click closes it, and
 * focus returns to the trigger when it was inside the popover.
 */
export function Popover({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  renderTrigger,
  children,
  placement = 'bottom-start',
  className,
  matchAnchorWidth = false,
  initialFocus = 'first',
  ...aria
}: PopoverProps): ReactNode {
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const contentId = useId();
  const anchorRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { style } = useFloatingPosition(anchorRef, contentRef, { open, placement, matchAnchorWidth });

  const close = useCallback(
    (restoreFocus = true) => {
      setOpen(false);
      if (restoreFocus) anchorRef.current?.focus({ preventScroll: true });
    },
    [setOpen],
  );

  const setAnchor = useCallback((node: HTMLElement | null) => {
    anchorRef.current = node;
  }, []);
  const api = useMemo<PopoverApi>(() => ({ close: () => close(true) }), [close]);

  useDismiss({
    enabled: open,
    refs: [anchorRef, contentRef],
    onDismiss: (reason) => {
      const focusInside = contentRef.current?.contains(document.activeElement) ?? false;
      close(reason === 'escape' || focusInside);
    },
  });

  useEffect(() => {
    if (open && initialFocus === 'first' && contentRef.current) focusInitial(contentRef.current);
  }, [open, initialFocus]);

  const onContentKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Tab' || !contentRef.current) return;
    const focusable = getFocusableElements(contentRef.current);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      event.preventDefault();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      {renderTrigger(
        {
          ref: setAnchor,
          onClick: () => setOpen(!open),
          'aria-expanded': open,
          'aria-controls': open ? contentId : undefined,
          'aria-haspopup': 'dialog',
        },
        { open },
      )}
      {open ? (
        <Portal>
          <div
            ref={contentRef}
            id={contentId}
            role="dialog"
            tabIndex={-1}
            className={cx(overlay.surface, styles.popover, className)}
            style={style}
            onKeyDown={onContentKeyDown}
            {...aria}
          >
            {typeof children === 'function' ? children(api) : children}
          </div>
        </Portal>
      ) : null}
    </>
  );
}
