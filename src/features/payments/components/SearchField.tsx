'use client';

import { CloseIcon, IconButton, Input, SearchIcon, useDebouncedValue } from '@chargeblast/ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './SearchField.module.css';

const SEARCH_DEBOUNCE_MS = 300;

interface SearchFieldProps {
  /** Committed search term (from the URL). */
  readonly value: string;
  readonly onCommit: (value: string) => void;
  readonly className?: string;
  readonly placeholder?: string;
  /** `global` renders the borderless grey field used in the top bar. */
  readonly appearance?: 'default' | 'global';
}

/**
 * Local text state with a debounced commit, so typing doesn't fire a request
 * per keystroke. External changes (e.g. "Clear filters", back button) are
 * synced back into the input.
 */
export function SearchField({
  value,
  onCommit,
  className,
  placeholder = 'Search by ID, email or last 4',
  appearance = 'default',
}: SearchFieldProps): ReactNode {
  const [text, setText] = useState(value);
  const debounced = useDebouncedValue(text, SEARCH_DEBOUNCE_MS);
  const committed = useRef(value);

  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    const next = debounced.trim();
    if (next !== committed.current) {
      committed.current = next;
      onCommit(next);
    }
    // Only react to the debounced text; `onCommit` identity changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <Input
      type="search"
      size={appearance === 'global' ? 'md' : 'sm'}
      wrapperClassName={[className, appearance === 'global' ? styles.global : null].filter(Boolean).join(' ')}
      aria-label="Search payments"
      placeholder={placeholder}
      maxLength={100}
      value={text}
      onChange={(event) => setText(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          const next = text.trim();
          committed.current = next;
          onCommit(next);
        }
      }}
      leadingIcon={<SearchIcon size={14} />}
      trailing={
        text ? (
          <IconButton
            size="sm"
            aria-label="Clear search"
            icon={<CloseIcon size={12} strokeWidth={2} />}
            onClick={() => {
              setText('');
              committed.current = '';
              onCommit('');
            }}
          />
        ) : null
      }
    />
  );
}
