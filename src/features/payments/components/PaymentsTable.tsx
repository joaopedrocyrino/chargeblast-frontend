'use client';

import { Checkbox, DataTable, type ColumnDef } from '@chargeblast/ui';
import type { ReactNode } from 'react';
import type { Payment, SortDirection, SortField } from '../types/payment';
import { SORT_FIELDS } from '../types/payment';
import {
  AmountCell,
  CreatedCell,
  CustomerCell,
  DeclineReasonCell,
  DescriptionCell,
  PaymentIdCell,
  PaymentMethodCell,
  RefundedDateCell,
} from './cells';
import { visibleColumnOrder, type ColumnLayout, type DataColumnId } from './columns';
import { RowActions } from './RowActions';
import { StatusBadge } from './StatusBadge';
import styles from './PaymentsTable.module.css';

interface PaymentsTableProps {
  readonly payments: readonly Payment[];
  readonly loading: boolean;
  readonly sort: SortField;
  readonly direction: SortDirection;
  readonly onSort: (field: SortField) => void;
  readonly selectedIds: ReadonlySet<string>;
  readonly onToggleRow: (id: string) => void;
  readonly onToggleAll: () => void;
  readonly onOpenPayment: (payment: Payment) => void;
  readonly emptyState: ReactNode;
  readonly skeletonRowCount: number;
  readonly layout: ColumnLayout;
  readonly onColumnResize: (id: DataColumnId, width: number) => void;
  readonly onColumnOrderChange: (visibleOrder: DataColumnId[]) => void;
}

export function PaymentsTable({
  payments,
  loading,
  sort,
  direction,
  onSort,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onOpenPayment,
  emptyState,
  skeletonRowCount,
  layout,
  onColumnResize,
  onColumnOrderChange,
}: PaymentsTableProps): ReactNode {
  const selectedOnPage = payments.filter((p) => selectedIds.has(p.id)).length;
  const allSelected = payments.length > 0 && selectedOnPage === payments.length;

  const selectColumn: ColumnDef<Payment> = {
    id: 'select',
    width: 36,
    resizable: false,
    reorderable: false,
    className: styles.selectCell,
    skeletonWidth: 14,
    header: (
      <Checkbox
        aria-label="Select all payments on this page"
        checked={allSelected}
        indeterminate={selectedOnPage > 0 && !allSelected}
        onChange={onToggleAll}
        disabled={payments.length === 0}
      />
    ),
    cell: (payment) => (
      <Checkbox
        aria-label={`Select payment ${payment.id}`}
        checked={selectedIds.has(payment.id)}
        onChange={() => onToggleRow(payment.id)}
      />
    ),
  };

  // Widths come from the persisted layout; these defs only describe content.
  const dataColumns: Record<DataColumnId, Omit<ColumnDef<Payment>, 'id' | 'width'>> = {
    amount: {
      header: 'Amount',
      sortable: true,
      align: 'end',
      skeletonWidth: '70%',
      cell: (payment) => <AmountCell payment={payment} />,
    },
    status: {
      header: 'Status',
      sortable: true,
      skeletonWidth: 76,
      cell: (payment) => <StatusBadge status={payment.status} />,
    },
    method: {
      header: 'Payment method',
      skeletonWidth: '75%',
      cell: (payment) => <PaymentMethodCell payment={payment} />,
    },
    description: {
      header: 'Description',
      skeletonWidth: '80%',
      cell: (payment) => <DescriptionCell payment={payment} />,
    },
    customer: {
      header: 'Customer',
      skeletonWidth: '70%',
      cell: (payment) => <CustomerCell payment={payment} />,
    },
    created: {
      header: 'Date',
      sortable: true,
      skeletonWidth: '75%',
      cell: (payment) => <CreatedCell iso={payment.createdAt} />,
    },
    refunded: {
      header: 'Refunded date',
      skeletonWidth: '50%',
      cell: (payment) => <RefundedDateCell payment={payment} />,
    },
    decline: {
      header: 'Decline reason',
      skeletonWidth: '60%',
      cell: (payment) => <DeclineReasonCell payment={payment} />,
    },
    id: {
      header: 'Payment ID',
      skeletonWidth: '80%',
      cell: (payment) => <PaymentIdCell id={payment.id} />,
    },
  };

  const actionsColumn: ColumnDef<Payment> = {
    id: 'actions',
    width: 44,
    resizable: false,
    reorderable: false,
    header: <span className="cb-visually-hidden">Actions</span>,
    align: 'end',
    skeletonWidth: 16,
    cell: (payment) => <RowActions payment={payment} />,
  };
  const columns: ColumnDef<Payment>[] = [
    selectColumn,
    ...visibleColumnOrder(layout).map((id) => {
      const column = dataColumns[id];
      const label = typeof column.header === 'string' ? column.header : id;
      return { ...column, id, label, width: layout.widths[id], minWidth: id === 'amount' ? 96 : 64 };
    }),
    actionsColumn,
  ];
  const isDataColumn = (id: string): id is DataColumnId => id in dataColumns;

  return (
    <DataTable
      caption="Payments"
      className={styles.table}
      columns={columns}
      rows={payments}
      getRowKey={(payment) => payment.id}
      sort={{ columnId: sort, direction }}
      onSortChange={(columnId) => {
        const field = SORT_FIELDS.find((f) => f === columnId);
        if (field) onSort(field);
      }}
      loading={loading}
      skeletonRowCount={skeletonRowCount}
      emptyState={emptyState}
      onColumnResize={(id, width) => {
        if (isDataColumn(id)) onColumnResize(id, width);
      }}
      onColumnOrderChange={(ids) => onColumnOrderChange(ids.filter(isDataColumn))}
      isRowSelected={(payment) => selectedIds.has(payment.id)}
      onRowClick={(payment, event) => {
        // Let modified clicks and clicks on interactive descendants behave natively.
        const target = event.target as HTMLElement;
        if (target.closest('button, a, input, label, [role="menu"]')) return;
        onOpenPayment(payment);
      }}
    />
  );
}
