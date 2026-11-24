import { useCallback, useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';

export type Placement = 'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top';

interface FloatingOptions {
  readonly open: boolean;
  readonly placement?: Placement;
  /** Gap between anchor and floating element, in px. */
  readonly offset?: number;
  /** Minimum distance from the viewport edge, in px. */
  readonly padding?: number;
  /** Make the floating element at least as wide as the anchor. */
  readonly matchAnchorWidth?: boolean;
}

// Opacity (not visibility) keeps the element focusable before its first measurement.
const HIDDEN: CSSProperties = { position: 'fixed', top: 0, left: 0, opacity: 0, pointerEvents: 'none' };

/**
 * Positions a `position: fixed` element next to an anchor, flipping to the
 * other side when it would overflow the viewport and clamping horizontally.
 * Recomputes on scroll (any ancestor) and resize while open.
 */
export function useFloatingPosition(
  anchorRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  { open, placement = 'bottom-start', offset = 6, padding = 8, matchAnchorWidth = false }: FloatingOptions,
): { style: CSSProperties; placement: Placement; update: () => void } {
  const [state, setState] = useState<{ style: CSSProperties; placement: Placement }>({
    style: HIDDEN,
    placement,
  });

  const update = useCallback(() => {
    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    if (!anchor || !floating) return;
    const a = anchor.getBoundingClientRect();
    const f = floating.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let side: 'top' | 'bottom' = placement.startsWith('top') ? 'top' : 'bottom';
    const spaceBelow = vh - a.bottom - offset - padding;
    const spaceAbove = a.top - offset - padding;
    if (side === 'bottom' && f.height > spaceBelow && spaceAbove > spaceBelow) side = 'top';
    else if (side === 'top' && f.height > spaceAbove && spaceBelow > spaceAbove) side = 'bottom';

    const align = placement.endsWith('-end') ? 'end' : placement.endsWith('-start') ? 'start' : 'center';
    const width = matchAnchorWidth ? Math.max(f.width, a.width) : f.width;
    let left =
      align === 'start' ? a.left : align === 'end' ? a.right - width : a.left + a.width / 2 - width / 2;
    left = Math.min(Math.max(left, padding), Math.max(padding, vw - width - padding));
    const top = side === 'bottom' ? a.bottom + offset : a.top - offset - f.height;

    const resolved = `${side}${align === 'center' ? '' : `-${align}`}` as Placement;
    setState({
      placement: resolved,
      style: {
        position: 'fixed',
        top: Math.round(Math.max(padding, top)),
        left: Math.round(left),
        ...(matchAnchorWidth ? { minWidth: Math.round(a.width) } : {}),
      },
    });
  }, [anchorRef, floatingRef, placement, offset, padding, matchAnchorWidth]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    update();
    const floating = floatingRef.current;
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => update());
    if (floating) observer?.observe(floating);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, update, floatingRef, placement]);

  // While closed, report the hidden style directly instead of storing it.
  return open ? { ...state, update } : { style: HIDDEN, placement, update };
}
