'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
  DEFAULT_VIEW_STATE,
  parseViewState,
  serializeViewState,
  type PaymentsViewState,
} from '../utils/view-state';

type Patch = Partial<PaymentsViewState>;

interface PaymentsViewStateApi {
  readonly state: PaymentsViewState;
  /** Applies a filter change and resets to page 1. */
  readonly setFilters: (patch: Patch) => void;
  /** Applies a change that keeps the current page (pagination). */
  readonly setPagination: (patch: Pick<Patch, 'page' | 'limit'>) => void;
  /** Applies a sort change and resets to page 1. */
  readonly setSort: (patch: Pick<Patch, 'sort' | 'direction'>) => void;
  /** Clears every filter, keeping sort and page size. */
  readonly clearFilters: () => void;
}

/** URL query parameters are the single source of truth for table state. */
export function usePaymentsViewState(): PaymentsViewStateApi {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.toString();
  const state = useMemo(() => parseViewState(new URLSearchParams(query)), [query]);

  const navigate = useCallback(
    (next: PaymentsViewState) => {
      const serialized = serializeViewState(next).toString();
      if (serialized === query) return;
      router.replace(serialized ? `${pathname}?${serialized}` : pathname, { scroll: false });
    },
    [router, pathname, query],
  );

  return {
    state,
    setFilters: useCallback((patch: Patch) => navigate({ ...state, ...patch, page: 1 }), [navigate, state]),
    setPagination: useCallback(
      (patch: Pick<Patch, 'page' | 'limit'>) => navigate({ ...state, ...patch }),
      [navigate, state],
    ),
    setSort: useCallback(
      (patch: Pick<Patch, 'sort' | 'direction'>) => navigate({ ...state, ...patch, page: 1 }),
      [navigate, state],
    ),
    clearFilters: useCallback(
      () =>
        navigate({
          ...DEFAULT_VIEW_STATE,
          sort: state.sort,
          direction: state.direction,
          limit: state.limit,
        }),
      [navigate, state],
    ),
  };
}
