import { useCallback, useEffect, useRef, useState } from 'react';

export type CopyStatus = 'idle' | 'copied' | 'error';

/**
 * Copies text with the async Clipboard API, falling back to a hidden
 * textarea + execCommand for insecure origins. Resolves to whether it worked.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Denied or unavailable: try the legacy path below.
  }
  return legacyCopy(text);
}

/** `copyToClipboard` plus a `status` that resets after `resetAfterMs`, for transient UI feedback. */
export function useCopyToClipboard(resetAfterMs = 1500): {
  status: CopyStatus;
  copy: (text: string) => Promise<boolean>;
} {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      const ok = await copyToClipboard(text);
      setStatus(ok ? 'copied' : 'error');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus('idle'), resetAfterMs);
      return ok;
    },
    [resetAfterMs],
  );
  return { status, copy };
}

function legacyCopy(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  textarea.remove();
  return ok;
}
