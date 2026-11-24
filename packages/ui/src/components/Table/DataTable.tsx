'use client';

import {
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { Skeleton } from '../Skeleton/Skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  type CellAlign,
  type SortDirection,
} from './Table';
import styles from './Table.module.css';

export interface ColumnDef<Row> {
  readonly id: string;
  readonly header: ReactNode;
  /** Custom cell renderer. */
  readonly cell: (row: Row, rowIndex: number) => ReactNode;
  readonly sortable?: boolean;
  readonly align?: CellAlign;
  /** Plain-text name, used for the resize handle's accessible label. */
  readonly label?: string;
  /** Width in px (resizable) or any CSS width (fixed, e.g. "20%"). */
  readonly width?: number | string;
  /** Smallest width a resize may reach, in px. Default 64. */
  readonly minWidth?: number;
  /** Opt this column out of resizing / reordering (e.g. checkbox, actions). */
  readonly resizable?: boolean;
  readonly reorderable?: boolean;
  readonly className?: string;
  /** Skeleton width while loading. */
  readonly skeletonWidth?: CSSProperties['width'];
}

export interface TableSort {
  readonly columnId: string;
  readonly direction: SortDirection;
}

export interface DataTableProps<Row> {
  readonly columns: readonly ColumnDef<Row>[];
  readonly rows: readonly Row[];
  readonly getRowKey: (row: Row) => string;
  readonly caption?: string;
  readonly sort?: TableSort;
  /** Called with the column id when a sortable header is activated. */
  readonly onSortChange?: (columnId: string) => void;
  /** True while (re)fetching. Without rows, skeleton rows are shown. */
  readonly loading?: boolean;
  readonly skeletonRowCount?: number;
  /** Rendered in a full-width row when not loading and `rows` is empty. */
  readonly emptyState?: ReactNode;
  readonly onRowClick?: (row: Row, event: MouseEvent<HTMLTableRowElement>) => void;
  readonly isRowSelected?: (row: Row) => boolean;
  /**
   * Enables resize handles on columns with a numeric `width`. Called with the
   * new width in px while dragging (or on Arrow keys on the focused handle).
   */
  readonly onColumnResize?: (columnId: string, width: number) => void;
  /**
   * Enables drag-to-reorder of header cells (Alt+Arrow keys from inside a
   * header move it too). Called with every column id in the new order.
   */
  readonly onColumnOrderChange?: (columnIds: string[]) => void;
  readonly className?: string;
}

const MAX_COLUMN_WIDTH = 800;
const RESIZE_STEP = 16;

type DropSide = 'before' | 'after';

/** Moves `from` next to `to`, keeping everyone else in place. */
function moveColumn(ids: readonly string[], from: string, to: string, side: DropSide): string[] {
  const rest = ids.filter((id) => id !== from);
  const index = rest.indexOf(to);
  if (index < 0) return [...ids];
  rest.splice(side === 'before' ? index : index + 1, 0, from);
  return rest;
}

/**
 * Composable data table: column definitions with custom renderers, sortable
 * headers, skeleton/refresh loading states and an empty state. Data-agnostic:
 * sorting/filtering/pagination happen wherever the caller decides (here, on
 * the server).
 */
export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  caption,
  sort,
  onSortChange,
  loading = false,
  skeletonRowCount = 10,
  emptyState,
  onRowClick,
  isRowSelected,
  onColumnResize,
  onColumnOrderChange,
  className,
}: DataTableProps<Row>): ReactNode {
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; side: DropSide } | null>(null);
  // Set while a resize handle is pressed so the header doesn't start a drag.
  const resizing = useRef(false);

  const columnIds = columns.map((column) => column.id);
  const canResize = (column: ColumnDef<Row>): boolean =>
    onColumnResize !== undefined && column.resizable !== false && typeof column.width === 'number';
  const canReorder = (column: ColumnDef<Row>): boolean =>
    onColumnOrderChange !== undefined && column.reorderable !== false;
  // With px widths everywhere the table is exactly as wide as its columns
  // (scrolling horizontally), so resizing one column doesn't squeeze the rest.
  const allPx = columns.every((column) => typeof column.width === 'number');
  const tableWidth = allPx ? columns.reduce((sum, column) => sum + (column.width as number), 0) : undefined;

  const clampWidth = (column: ColumnDef<Row>, width: number): number =>
    Math.round(Math.min(Math.max(width, column.minWidth ?? 64), MAX_COLUMN_WIDTH));

  const startResize = (column: ColumnDef<Row>) => (event: PointerEvent<HTMLSpanElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    resizing.current = true;
    const handle = event.currentTarget;
    const startX = event.clientX;
    const startWidth = column.width as number;
    handle.setPointerCapture(event.pointerId);
    const onMove = (moveEvent: globalThis.PointerEvent): void =>
      onColumnResize?.(column.id, clampWidth(column, startWidth + moveEvent.clientX - startX));
    const onEnd = (): void => {
      resizing.current = false;
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onEnd);
      handle.removeEventListener('pointercancel', onEnd);
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onEnd);
    handle.addEventListener('pointercancel', onEnd);
  };

  const onResizeKeyDown = (column: ColumnDef<Row>) => (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.altKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    event.preventDefault();
    event.stopPropagation();
    const delta = event.key === 'ArrowRight' ? RESIZE_STEP : -RESIZE_STEP;
    onColumnResize?.(column.id, clampWidth(column, (column.width as number) + delta));
  };

  const onHeaderKeyDown = (column: ColumnDef<Row>) => (event: KeyboardEvent<HTMLTableCellElement>) => {
    if (!event.altKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    const reorderable = columns.filter(canReorder).map((c) => c.id);
    const index = reorderable.indexOf(column.id);
    const neighbour = reorderable[event.key === 'ArrowLeft' ? index - 1 : index + 1];
    if (!neighbour) return;
    event.preventDefault();
    onColumnOrderChange?.(
      moveColumn(columnIds, column.id, neighbour, event.key === 'ArrowLeft' ? 'before' : 'after'),
    );
  };

  const dragHandlers = (column: ColumnDef<Row>) => ({
    draggable: true,
    onDragStart: (event: DragEvent<HTMLTableCellElement>) => {
      if (resizing.current) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', column.id);
      setDragging(column.id);
    },
    onDragOver: (event: DragEvent<HTMLTableCellElement>) => {
      if (!dragging || dragging === column.id) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      const rect = event.currentTarget.getBoundingClientRect();
      const side: DropSide = event.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
      if (dropTarget?.id !== column.id || dropTarget.side !== side) setDropTarget({ id: column.id, side });
    },
    onDragLeave: (event: DragEvent<HTMLTableCellElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTarget(null);
    },
    onDrop: (event: DragEvent<HTMLTableCellElement>) => {
      event.preventDefault();
      if (dragging && dropTarget && dragging !== column.id) {
        onColumnOrderChange?.(moveColumn(columnIds, dragging, column.id, dropTarget.side));
      }
      setDragging(null);
      setDropTarget(null);
    },
    onDragEnd: () => {
      setDragging(null);
      setDropTarget(null);
    },
  });

  const showSkeleton = loading && rows.length === 0;
  const showEmpty = !loading && rows.length === 0;

  const onRowKeyDown = (row: Row) => (event: KeyboardEvent<HTMLTableRowElement>) => {
    // Rows are clickable shortcuts; a focusable link/button inside the row is
    // the accessible path, so only react when the row itself has focus.
    if (event.target === event.currentTarget && event.key === 'Enter' && onRowClick) {
      onRowClick(row, event as unknown as MouseEvent<HTMLTableRowElement>);
    }
  };

  return (
    <Table
      caption={caption}
      className={cx(tableWidth !== undefined && styles.sized, className)}
      style={tableWidth !== undefined ? ({ width: tableWidth } satisfies CSSProperties) : undefined}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
    >
      <colgroup>
        {columns.map((column) => (
          <col key={column.id} style={column.width !== undefined ? { width: column.width } : undefined} />
        ))}
      </colgroup>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHeaderCell
              key={column.id}
              align={column.align}
              className={column.className}
              sortable={column.sortable === true && onSortChange !== undefined}
              sortDirection={sort?.columnId === column.id ? sort.direction : undefined}
              onSort={() => onSortChange?.(column.id)}
              data-column-id={column.id}
              data-dragging={dragging === column.id || undefined}
              data-drop={dropTarget?.id === column.id ? dropTarget.side : undefined}
              onKeyDown={canReorder(column) ? onHeaderKeyDown(column) : undefined}
              {...(canReorder(column) ? dragHandlers(column) : {})}
              after={
                canResize(column) ? (
                  <span
                    role="separator"
                    aria-orientation="vertical"
                    aria-label={`Resize ${column.label ?? column.id} column`}
                    aria-valuenow={column.width as number}
                    aria-valuemin={column.minWidth ?? 64}
                    aria-valuemax={MAX_COLUMN_WIDTH}
                    tabIndex={0}
                    className={styles.resizeHandle}
                    onPointerDown={startResize(column)}
                    onKeyDown={onResizeKeyDown(column)}
                    onClick={(event) => event.stopPropagation()}
                  />
                ) : null
              }
            >
              {column.header}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className={cx(loading && rows.length > 0 && styles.refreshing)}>
        {showSkeleton
          ? Array.from({ length: skeletonRowCount }, (_, index) => (
              <TableRow key={`skeleton-${index}`} data-testid="skeleton-row">
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align} className={column.className}>
                    <Skeleton width={column.skeletonWidth ?? '70%'} height={12} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : rows.map((row, rowIndex) => (
              <TableRow
                key={getRowKey(row)}
                interactive={onRowClick !== undefined}
                selected={isRowSelected?.(row) ?? false}
                onClick={onRowClick ? (event) => onRowClick(row, event) : undefined}
                onKeyDown={onRowClick ? onRowKeyDown(row) : undefined}
              >
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align} className={column.className}>
                    {column.cell(row, rowIndex)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        {showEmpty && emptyState ? (
          <tr className={styles.emptyRow}>
            <td colSpan={columns.length}>{emptyState}</td>
          </tr>
        ) : null}
      </TableBody>
    </Table>
  );
}
