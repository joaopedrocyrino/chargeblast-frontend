import { createPersistentStore, usePersistentStore } from '@chargeblast/ui';

/** Columns the user can show or hide via "Edit columns". Amount and status are always shown. */
export const OPTIONAL_COLUMNS = [
  { id: 'method', label: 'Payment method' },
  { id: 'description', label: 'Description' },
  { id: 'customer', label: 'Customer' },
  { id: 'created', label: 'Date' },
  { id: 'refunded', label: 'Refunded date' },
  { id: 'decline', label: 'Decline reason' },
  { id: 'id', label: 'Payment ID' },
] as const;

export type OptionalColumnId = (typeof OPTIONAL_COLUMNS)[number]['id'];

/** Every data column (the checkbox and row-actions columns are fixed). */
export type DataColumnId = 'amount' | 'status' | OptionalColumnId;

const DATA_COLUMNS: readonly DataColumnId[] = ['amount', 'status', ...OPTIONAL_COLUMNS.map((c) => c.id)];

/** Default widths in px, tuned against the reference. */
const DEFAULT_COLUMN_WIDTHS: Readonly<Record<DataColumnId, number>> = {
  amount: 132,
  status: 124,
  method: 156,
  description: 176,
  customer: 256,
  created: 148,
  refunded: 136,
  decline: 160,
  id: 184,
};

/** What "Edit columns", resizing and drag-to-reorder change; persisted per browser. */
export interface ColumnLayout {
  readonly visible: readonly OptionalColumnId[];
  /** Order of every data column, hidden ones included. */
  readonly order: readonly DataColumnId[];
  readonly widths: Readonly<Record<DataColumnId, number>>;
}

const DEFAULT_COLUMN_LAYOUT: ColumnLayout = {
  visible: OPTIONAL_COLUMNS.map((c) => c.id),
  order: DATA_COLUMNS,
  widths: DEFAULT_COLUMN_WIDTHS,
};

/** Data columns currently in the table, in display order. */
export function visibleColumnOrder(layout: ColumnLayout): DataColumnId[] {
  return layout.order.filter(
    (id) => id === 'amount' || id === 'status' || layout.visible.some((v) => v === id),
  );
}

const STORAGE_KEY = 'chargeblast.payments.column-layout';

const isDataColumn = (value: unknown): value is DataColumnId => DATA_COLUMNS.some((id) => id === value);

/** Accepts only well-formed stored layouts, filling anything missing with defaults. */
function parseLayout(raw: unknown): ColumnLayout {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_COLUMN_LAYOUT;
  const { visible, order, widths } = raw as Record<string, unknown>;
  const storedOrder = Array.isArray(order) ? order.filter(isDataColumn) : [];
  const widthsRecord =
    typeof widths === 'object' && widths !== null ? (widths as Record<string, unknown>) : {};
  return {
    visible: Array.isArray(visible)
      ? OPTIONAL_COLUMNS.map((c) => c.id).filter((id) => visible.includes(id))
      : DEFAULT_COLUMN_LAYOUT.visible,
    order: [...new Set([...storedOrder, ...DATA_COLUMNS])],
    widths: Object.fromEntries(
      DATA_COLUMNS.map((id) => {
        const value = widthsRecord[id];
        return [
          id,
          typeof value === 'number' && value >= 48 && value <= 800 ? value : DEFAULT_COLUMN_WIDTHS[id],
        ];
      }),
    ) as Record<DataColumnId, number>,
  };
}

const store = createPersistentStore(STORAGE_KEY, DEFAULT_COLUMN_LAYOUT, parseLayout);
const update = store.set;
const current = store.get;

/** The persisted layout; re-renders on every change (defaults during SSR). */
export function useColumnLayout(): ColumnLayout {
  return usePersistentStore(store, DEFAULT_COLUMN_LAYOUT);
}

export function setVisibleColumns(visible: readonly OptionalColumnId[]): void {
  update({ ...current(), visible: [...visible] });
}

export function setColumnWidth(id: DataColumnId, width: number): void {
  const layout = current();
  if (layout.widths[id] !== width) update({ ...layout, widths: { ...layout.widths, [id]: width } });
}

/**
 * Applies a new order of the *visible* columns. Hidden columns keep their
 * slots, so showing one again puts it back where it was.
 */
export function setVisibleColumnOrder(visibleOrder: readonly DataColumnId[]): void {
  const layout = current();
  const shown = new Set(visibleColumnOrder(layout));
  const queue = [...visibleOrder];
  update({ ...layout, order: layout.order.map((id) => (shown.has(id) ? (queue.shift() ?? id) : id)) });
}

export function resetColumnLayout(): void {
  update(DEFAULT_COLUMN_LAYOUT);
}
