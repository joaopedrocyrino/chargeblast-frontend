'use client';

import { Button, MultiSelectList, Popover, SettingsIcon } from '@chargeblast/ui';
import type { ReactNode } from 'react';
import { OPTIONAL_COLUMNS, type OptionalColumnId } from './columns';
import styles from './EditColumns.module.css';

const OPTIONS = OPTIONAL_COLUMNS.map((c) => ({ value: c.id, label: c.label }));

export function EditColumns({
  value,
  onChange,
  onReset,
}: {
  readonly value: readonly OptionalColumnId[];
  readonly onChange: (value: OptionalColumnId[]) => void;
  /** Restores default visibility, order and widths. */
  readonly onReset: () => void;
}): ReactNode {
  return (
    <Popover
      aria-label="Edit columns"
      placement="bottom-end"
      renderTrigger={(props) => (
        <Button {...props} size="sm" variant="secondary" leadingIcon={<SettingsIcon size={12} />}>
          Edit columns
        </Button>
      )}
    >
      <div style={{ width: 220, padding: 4 }}>
        <MultiSelectList
          options={OPTIONS}
          value={[...value]}
          onChange={onChange}
          aria-label="Visible columns"
          autoFocus
        />
        <div className={styles.footer}>
          <Button size="sm" variant="link" onClick={onReset}>
            Reset columns
          </Button>
          <span className={styles.hint}>Drag headers to reorder</span>
        </div>
      </div>
    </Popover>
  );
}
