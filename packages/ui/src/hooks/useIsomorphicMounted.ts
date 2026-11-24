import { useSyncExternalStore } from 'react';

const subscribe = (): (() => void) => () => undefined;

/** `false` during SSR and hydration, `true` once running in the browser. */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
