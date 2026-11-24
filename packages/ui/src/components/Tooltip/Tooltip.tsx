'use client';
/* eslint-disable react-hooks/refs --
 * Overlay primitives hand ref callbacks and event handlers to render props /
 * cloned children. They run only after render (commit / events), which the
 * React Compiler lint cannot prove across a render-prop boundary.
 */

import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { useFloatingPosition, type Placement } from '../../hooks/useFloatingPosition';
import { cx } from '../../utils/cx';
import { mergeRefs } from '../../utils/refs';
import { Portal } from '../Portal/Portal';
import styles from './Tooltip.module.css';

type TriggerProps = HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> };

export interface TooltipProps {
  readonly content: ReactNode;
  /** A single focusable element; it receives hover/focus handlers and `aria-describedby`. */
  readonly children: ReactElement<TriggerProps>;
  readonly placement?: Placement;
  /** Hover delay before showing, in ms. Keyboard focus shows immediately. */
  readonly delay?: number;
  readonly disabled?: boolean;
  readonly className?: string;
}

/**
 * Supplementary text shown on hover *and* keyboard focus, dismissable with
 * Escape, and hoverable itself (WCAG 1.4.13).
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 250,
  disabled = false,
  className,
}: TooltipProps): ReactNode {
  const id = useId();
  const [requestedOpen, setOpen] = useState(false);
  // A disabled tooltip never shows, whatever its hover/focus state.
  const open = requestedOpen && !disabled;
  const anchorRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { style, placement: resolved } = useFloatingPosition(anchorRef, floatingRef, {
    open,
    placement,
    offset: 6,
  });

  const clearTimers = (): void => {
    clearTimeout(showTimer.current);
    clearTimeout(hideTimer.current);
  };
  const show = (immediate: boolean): void => {
    if (disabled) return;
    clearTimers();
    if (immediate) setOpen(true);
    else showTimer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = (): void => {
    clearTimers();
    hideTimer.current = setTimeout(() => setOpen(false), 80);
  };

  useEffect(() => clearTimers, []);
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const childProps = children.props;
  const trigger = cloneElement(children, {
    ref: mergeRefs(anchorRef, childProps.ref),
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      childProps.onMouseEnter?.(event);
      show(false);
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      childProps.onMouseLeave?.(event);
      hide();
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      childProps.onFocus?.(event);
      show(true);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      childProps.onBlur?.(event);
      clearTimers();
      setOpen(false);
    },
    'aria-describedby': open ? cx(childProps['aria-describedby'], id) : childProps['aria-describedby'],
  });

  return (
    <>
      {trigger}
      {open ? (
        <Portal>
          <div
            ref={floatingRef}
            id={id}
            role="tooltip"
            data-placement={resolved}
            className={cx(styles.tooltip, className)}
            style={style}
            onMouseEnter={clearTimers}
            onMouseLeave={hide}
          >
            {content}
          </div>
        </Portal>
      ) : null}
    </>
  );
}
