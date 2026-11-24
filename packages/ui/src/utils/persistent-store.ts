import { useSyncExternalStore } from 'react';

export interface PersistentStore<T> {
  readonly get: () => T;
  readonly set: (value: T) => void;
  readonly subscribe: (listener: () => void) => () => void;
}

/**
 * A value kept in localStorage and shared by every component that reads it.
 * The server render always sees `fallback`, so hydration matches; stored
 * values go through `parse`, so anything malformed falls back too.
 * Storage being unavailable (private mode, quota) only means it won't persist.
 */
export function createPersistentStore<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown) => T = (raw) => raw as T,
): PersistentStore<T> {
  const listeners = new Set<() => void>();
  let snapshot: { value: T } | null = null;

  const load = (): T => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : parse(JSON.parse(raw));
    } catch {
      return fallback;
    }
  };

  return {
    get: () => (snapshot ??= { value: load() }).value,
    set: (value) => {
      snapshot = { value };
      for (const listener of listeners) listener();
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Not persisted; the in-memory value still applies for this visit.
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Reads a `PersistentStore` and re-renders when it changes. */
export function usePersistentStore<T>(store: PersistentStore<T>, serverValue: T): T {
  return useSyncExternalStore(store.subscribe, store.get, () => serverValue);
}
