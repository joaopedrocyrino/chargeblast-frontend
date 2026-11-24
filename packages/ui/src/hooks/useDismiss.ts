import { useEffect, useRef, type RefObject } from 'react';

interface DismissOptions {
  readonly enabled: boolean;
  /** Elements considered "inside"; pointer-downs elsewhere dismiss. */
  readonly refs: readonly RefObject<HTMLElement | null>[];
  readonly onDismiss: (reason: 'escape' | 'outside') => void;
}

/** Escape-key and outside-pointer dismissal for overlays. */
export function useDismiss({ enabled, refs, onDismiss }: DismissOptions): void {
  const onDismissRef = useRef(onDismiss);
  const refsRef = useRef(refs);
  // Keep the latest callback/refs without re-subscribing listeners.
  useEffect(() => {
    onDismissRef.current = onDismiss;
    refsRef.current = refs;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        event.stopPropagation();
        onDismissRef.current('escape');
      }
    };
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      const inside = refsRef.current.some((ref) => ref.current?.contains(target));
      if (!inside) onDismissRef.current('outside');
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [enabled]);
}
