import type {
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';
import { ArrowDownIcon, ArrowUpIcon, SortIcon } from '../../icons/icons';
import { cx } from '../../utils/cx';
import styles from './Table.module.css';

export type SortDirection = 'asc' | 'desc';
export type CellAlign = 'start' | 'center' | 'end';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Visually hidden caption describing the table for screen readers. */
  readonly caption?: string;
  /** Class for the horizontally scrollable wrapper. */
  readonly containerClassName?: string;
}

export function Table({ caption, className, containerClassName, children, ...rest }: TableProps): ReactNode {
  return (
    <div className={cx(styles.container, containerClassName)}>
      <table className={cx(styles.table, className)} {...rest}>
        {caption ? <caption className="cb-visually-hidden">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>): ReactNode {
  return <thead className={cx(styles.header, className)} {...rest} />;
}

export function TableBody({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>): ReactNode {
  return <tbody className={cx(styles.body, className)} {...rest} />;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  readonly selected?: boolean;
  readonly interactive?: boolean;
}

export function TableRow({
  selected = false,
  interactive = false,
  className,
  ...rest
}: TableRowProps): ReactNode {
  return (
    <tr
      className={cx(styles.row, interactive && styles.interactive, className)}
      data-selected={selected || undefined}
      aria-selected={selected || undefined}
      {...rest}
    />
  );
}

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  readonly align?: CellAlign;
}

export function TableCell({ align = 'start', className, ...rest }: TableCellProps): ReactNode {
  return <td className={cx(styles.cell, styles[align], className)} {...rest} />;
}

export interface TableHeaderCellProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  readonly align?: CellAlign;
  /** When set, the header renders a sort button. */
  readonly sortable?: boolean;
  /** Current direction if this column is the active sort, otherwise undefined. */
  readonly sortDirection?: SortDirection;
  readonly onSort?: () => void;
  /** Rendered after the content, e.g. a column resize handle. */
  readonly after?: ReactNode;
}

/**
 * Column header. Sortable headers expose `aria-sort` on the <th> and a real
 * <button> so sorting is keyboard accessible.
 */
export function TableHeaderCell({
  align = 'start',
  sortable = false,
  sortDirection,
  onSort,
  after,
  className,
  children,
  scope = 'col',
  ...rest
}: TableHeaderCellProps): ReactNode {
  const ariaSort =
    sortDirection === 'asc'
      ? 'ascending'
      : sortDirection === 'desc'
        ? 'descending'
        : sortable
          ? 'none'
          : undefined;
  return (
    <th
      scope={scope}
      aria-sort={ariaSort}
      className={cx(styles.headerCell, styles[align], className)}
      {...rest}
    >
      {sortable ? (
        <button
          type="button"
          className={cx(styles.sortButton, sortDirection && styles.sorted)}
          onClick={onSort}
        >
          <span>{children}</span>
          <span className={styles.sortIcon} aria-hidden="true">
            {sortDirection === 'asc' ? (
              <ArrowUpIcon size={12} strokeWidth={2} />
            ) : sortDirection === 'desc' ? (
              <ArrowDownIcon size={12} strokeWidth={2} />
            ) : (
              <SortIcon size={12} strokeWidth={2} />
            )}
          </span>
        </button>
      ) : (
        children
      )}
      {after}
    </th>
  );
}
