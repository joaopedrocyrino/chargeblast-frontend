'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, isAbortError } from './http-client';

export interface ApiQueryState<T> {
  /** Latest successful data; kept while a newer request is in flight. */
  readonly data: T | undefined;
  readonly error: ApiError | null;
  /** True until the first response (success or error) for the current key. */
  readonly isLoading: boolean;
  /** True whenever a request is in flight, including background refreshes. */
  readonly isFetching: boolean;
  readonly refetch: () => void;
}

/**
 * Fetches whenever `key` changes. Each request gets its own AbortController:
 * starting a new request aborts the previous one, and a monotonically
 * increasing request id guarantees an older response can never overwrite a
 * newer one (stale-response protection), even if abort is ignored.
 */
export function useApiQuery<T>(
  key: string | null,
  fetcher: (signal: AbortSignal) => Promise<T>,
): ApiQueryState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<ApiError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  // The request whose response (or error) was last applied. Comparing it with
  // the current request key derives `isFetching` without setting state
  // synchronously inside the effect.
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const requestId = useRef(0);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const requestKey = key === null ? null : `${key}#${reloadToken}`;

  useEffect(() => {
    if (requestKey === null) return undefined;
    const id = ++requestId.current;
    const controller = new AbortController();
    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (id !== requestId.current) return;
        setData(result);
        setError(null);
        setSettledKey(requestKey);
      })
      .catch((caught: unknown) => {
        if (id !== requestId.current || isAbortError(caught)) return;
        setError(
          caught instanceof ApiError
            ? caught
            : new ApiError(caught instanceof Error ? caught.message : 'Unexpected error', 0, 'UNKNOWN'),
        );
        setSettledKey(requestKey);
      });
    return () => controller.abort();
  }, [requestKey]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);
  const isFetching = requestKey !== null && settledKey !== requestKey;

  return { data, error, isLoading: settledKey === null && requestKey !== null, isFetching, refetch };
}
