/**
 * Minimal typed JSON client for same-origin API calls.
 * - `postJson` sends a JSON body once (no retries).
 * - Retries idempotent GETs on network failures and 502/503/504.
 * - Honours AbortSignal (no retries after abort).
 * - Normalises error bodies into ApiError.
 * - Validates the response shape with a caller-provided guard.
 */
interface ApiFieldError {
  readonly field: string;
  readonly message: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details: readonly ApiFieldError[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Transient failures worth retrying automatically. */
  get retryable(): boolean {
    return this.status === 0 || this.status === 502 || this.status === 503 || this.status === 504;
  }
}

type Guard<T> = (value: unknown) => value is T;

export interface GetJsonOptions {
  readonly signal?: AbortSignal;
  /** Extra attempts after the first failure (default 2). */
  readonly retries?: number;
  /** Base back-off in ms, doubled per attempt (default 300). */
  readonly retryDelayMs?: number;
  /** Injectable for tests. */
  readonly fetchImpl?: typeof fetch;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function toApiError(status: number, body: unknown, fallback: string): ApiError {
  if (isRecord(body) && typeof body['message'] === 'string') {
    const details = Array.isArray(body['details'])
      ? body['details'].filter(
          (d): d is ApiFieldError =>
            isRecord(d) && typeof d['field'] === 'string' && typeof d['message'] === 'string',
        )
      : [];
    return new ApiError(
      body['message'],
      status,
      typeof body['code'] === 'string' ? body['code'] : 'HTTP_ERROR',
      details,
    );
  }
  return new ApiError(fallback, status, 'HTTP_ERROR');
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason instanceof Error ? signal.reason : new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export async function getJson<T>(url: string, guard: Guard<T>, options: GetJsonOptions = {}): Promise<T> {
  const { signal, retries = 2, retryDelayMs = 300, fetchImpl = fetch } = options;
  let attempt = 0;
  for (;;) {
    try {
      let response: Response;
      try {
        response = await fetchImpl(url, { signal, headers: { Accept: 'application/json' } });
      } catch (error) {
        if (isAbortError(error) || signal?.aborted) throw error;
        throw new ApiError('Unable to reach the server. Check your connection.', 0, 'NETWORK_ERROR');
      }
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok)
        throw toApiError(response.status, body, `Request failed with status ${response.status}`);
      if (!guard(body))
        throw new ApiError(
          'The server returned an unexpected response.',
          response.status,
          'INVALID_RESPONSE',
        );
      return body;
    } catch (error) {
      const canRetry = error instanceof ApiError && error.retryable && attempt < retries && !signal?.aborted;
      if (!canRetry) throw error;
      await delay(retryDelayMs * 2 ** attempt, signal);
      attempt += 1;
    }
  }
}

export interface PostJsonOptions {
  readonly signal?: AbortSignal;
  /** Injectable for tests. */
  readonly fetchImpl?: typeof fetch;
}

/** Sends a JSON body. Never retried: a POST is not idempotent. */
export async function postJson<T>(
  url: string,
  body: unknown,
  guard: Guard<T>,
  options: PostJsonOptions = {},
): Promise<T> {
  const { signal, fetchImpl = fetch } = options;
  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      signal,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    if (isAbortError(error) || signal?.aborted) throw error;
    throw new ApiError('Unable to reach the server. Check your connection.', 0, 'NETWORK_ERROR');
  }
  const parsed: unknown = await response.json().catch(() => null);
  if (!response.ok)
    throw toApiError(response.status, parsed, `Request failed with status ${response.status}`);
  if (!guard(parsed))
    throw new ApiError('The server returned an unexpected response.', response.status, 'INVALID_RESPONSE');
  return parsed;
}

export { isRecord };
