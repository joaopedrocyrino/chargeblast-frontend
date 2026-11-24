'use client';

import {
  AlertCircleIcon,
  Button,
  DownloadIcon,
  EmptyState,
  MultiSelectFilter,
  ReportingIcon,
  Pagination,
  RefreshIcon,
  SearchIcon,
  TransactionsIcon,
} from '@chargeblast/ui';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useCurrencies, usePayments } from '../hooks/usePayments';
import { usePaymentsViewState } from '../hooks/usePaymentsViewState';
import { PAGE_SIZES, type PageSize, type Payment } from '../types/payment';
import { downloadCsv, paymentsToCsv } from '../utils/csv';
import { hasActiveFilters, nextSort, toFilterParams, toListParams } from '../utils/view-state';
import {
  resetColumnLayout,
  setColumnWidth,
  setVisibleColumnOrder,
  setVisibleColumns,
  useColumnLayout,
  visibleColumnOrder,
} from './columns';
import { CreatePaymentButton } from './CreatePaymentButton';
import { EditColumns } from './EditColumns';
import { AmountFilter } from './filters/AmountFilter';
import { MoreFilters, type ExtraFilterId } from './filters/MoreFilters';
import { BRAND_OPTIONS, DECLINE_OPTIONS, METHOD_OPTIONS, STATUS_OPTIONS } from './filters/options';
import { DateFilter } from './filters/DateFilter';
import { NoticeBanner } from './NoticeBanner';
import { PaymentsTable } from './PaymentsTable';
import { SearchField } from './SearchField';
import { StatusTabs } from './StatusTabs';
import styles from './PaymentsPage.module.css';

const EMPTY_SELECTION: ReadonlySet<string> = new Set();

export function PaymentsPage(): ReactNode {
  const router = useRouter();
  const { state, setFilters, setPagination, setSort, clearFilters } = usePaymentsViewState();

  // Date presets resolve against "now"; recompute only when the state changes so
  // the request key stays stable between renders.
  const listParams = useMemo(() => toListParams(state), [state]);
  const filterParams = useMemo(() => toFilterParams(state), [state]);
  const list = usePayments(listParams);
  const currencies = useCurrencies();
  const currencyOptions = useMemo(
    () => (currencies.data?.data ?? []).map((c) => ({ value: c.code, label: `${c.code} – ${c.name}` })),
    [currencies.data],
  );

  const columnLayout = useColumnLayout();

  // Selection is scoped to the current filter set: changing filters clears it.
  const filterKey = JSON.stringify(filterParams);
  const [selection, setSelection] = useState<{ key: string; ids: ReadonlySet<string> }>({
    key: filterKey,
    ids: EMPTY_SELECTION,
  });
  const selectedIds = selection.key === filterKey ? selection.ids : EMPTY_SELECTION;
  const setSelectedIds = (update: (prev: ReadonlySet<string>) => ReadonlySet<string>): void =>
    setSelection((prev) => ({
      key: filterKey,
      ids: update(prev.key === filterKey ? prev.ids : EMPTY_SELECTION),
    }));

  // Extra filters appear when picked from "More filters" or when the URL already uses them.
  const [addedExtras, setAddedExtras] = useState<ReadonlySet<ExtraFilterId>>(() => new Set());
  const [justAdded, setJustAdded] = useState<ExtraFilterId | null>(null);
  const extraShown = new Set<ExtraFilterId>(addedExtras);
  if (state.brands.length > 0) extraShown.add('brand');
  if (state.declineCodes.length > 0) extraShown.add('decline');
  if (state.refundedPreset !== null) extraShown.add('refunded');

  const clearAllFilters = (): void => {
    clearFilters();
    setAddedExtras(new Set());
    setJustAdded(null);
  };

  const payments: readonly Payment[] = list.data?.data ?? [];
  const total = list.data?.meta.total ?? 0;
  const filtered = hasActiveFilters(state);

  // If the URL points past the last page (e.g. after filtering), clamp it.
  const totalPages = list.data?.meta.totalPages;
  useEffect(() => {
    if (totalPages !== undefined && totalPages > 0 && state.page > totalPages)
      setPagination({ page: totalPages });
  }, [totalPages, state.page, setPagination]);

  const toggleRow = (id: string): void =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = (): void =>
    setSelectedIds((prev) => {
      const allOnPage = payments.length > 0 && payments.every((p) => prev.has(p.id));
      const next = new Set(prev);
      for (const p of payments) {
        if (allOnPage) next.delete(p.id);
        else next.add(p.id);
      }
      return next;
    });

  const exportCsv = (): void => {
    const rows = selectedIds.size ? payments.filter((p) => selectedIds.has(p.id)) : payments;
    downloadCsv(
      `payments-${new Date().toISOString().slice(0, 10)}.csv`,
      paymentsToCsv(rows, visibleColumnOrder(columnLayout)),
    );
  };

  const emptyState = filtered ? (
    <EmptyState
      icon={<SearchIcon size={20} />}
      title="No results found"
      description="There aren't any payments matching these filters. Try changing or clearing them."
      action={
        <Button size="sm" variant="secondary" onClick={clearAllFilters}>
          Clear filters
        </Button>
      }
      data-testid="empty-state"
    />
  ) : (
    <EmptyState
      icon={<TransactionsIcon size={20} />}
      title="No payments yet"
      description="Payments will appear here once your customers start paying."
      data-testid="empty-state"
    />
  );

  return (
    <AppShell
      search={
        <SearchField
          appearance="global"
          placeholder="Search"
          value={state.search}
          onCommit={(search) => setFilters({ search })}
        />
      }
    >
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Transactions</h1>
          <div className={styles.headerActions}>
            <CreatePaymentButton
              onCreated={() => {
                list.refetch();
              }}
            />
            <Button
              variant="secondary"
              leadingIcon={<ReportingIcon size={14} />}
              aria-disabled="true"
              title="Analytics is not part of this demo"
              onClick={(event) => event.preventDefault()}
            >
              Analyze
            </Button>
          </div>
        </header>

        <nav className={styles.subnav} aria-label="Transactions">
          <Link className={styles.subnavActive} aria-current="page" href="/payments">
            Payments
          </Link>
          {['Payouts', 'Top-ups', 'Collected fees', 'Transfers', 'All activity'].map((label) => (
            <span key={label} className={styles.subnavItem} title="Not part of this demo">
              {label}
            </span>
          ))}
        </nav>

        <NoticeBanner />

        <StatusTabs selected={state.statuses} onSelect={(statuses) => setFilters({ statuses })} />

        <div className={styles.toolbar}>
          <div className={styles.filters} role="group" aria-label="Filters">
            <DateFilter
              value={{ preset: state.datePreset, from: state.dateFrom, to: state.dateTo }}
              onChange={(v) => setFilters({ datePreset: v.preset, dateFrom: v.from, dateTo: v.to })}
            />
            <AmountFilter
              value={{ min: state.amountMin, max: state.amountMax }}
              onChange={(v) => setFilters({ amountMin: v.min, amountMax: v.max })}
            />
            <MultiSelectFilter
              label="Currency"
              listLabel="Currencies"
              options={currencyOptions}
              loading={!currencies.data}
              error={currencies.error && !currencies.data ? 'Currencies couldn’t be loaded.' : null}
              value={state.currencies}
              onChange={(next) => setFilters({ currencies: next })}
            />
            <MultiSelectFilter
              label="Status"
              listLabel="Statuses"
              options={STATUS_OPTIONS}
              value={state.statuses}
              onChange={(statuses) => setFilters({ statuses })}
            />
            <MultiSelectFilter
              label="Payment method"
              listLabel="Payment methods"
              options={METHOD_OPTIONS}
              value={state.methods}
              onChange={(methods) => setFilters({ methods })}
            />
            {extraShown.has('brand') ? (
              <MultiSelectFilter
                label="Card brand"
                listLabel="Card brands"
                options={BRAND_OPTIONS}
                value={state.brands}
                onChange={(brands) => setFilters({ brands })}
                defaultOpen={justAdded === 'brand'}
              />
            ) : null}
            {extraShown.has('decline') ? (
              <MultiSelectFilter
                label="Decline reason"
                listLabel="Decline reasons"
                options={DECLINE_OPTIONS}
                value={state.declineCodes}
                onChange={(declineCodes) => setFilters({ declineCodes })}
                defaultOpen={justAdded === 'decline'}
              />
            ) : null}
            {extraShown.has('refunded') ? (
              <DateFilter
                label="Refunded date"
                title="Filter by refunded date"
                value={{ preset: state.refundedPreset, from: state.refundedFrom, to: state.refundedTo }}
                onChange={(v) =>
                  setFilters({ refundedPreset: v.preset, refundedFrom: v.from, refundedTo: v.to })
                }
                defaultOpen={justAdded === 'refunded'}
              />
            ) : null}
            <MoreFilters
              shown={extraShown}
              onAdd={(id) => {
                setAddedExtras((prev) => new Set(prev).add(id));
                setJustAdded(id);
              }}
            />
            {filtered ? (
              <Button size="sm" variant="link" onClick={clearAllFilters} data-testid="clear-filters">
                Clear filters
              </Button>
            ) : null}
          </div>
          <div className={styles.toolbarRight}>
            <Button
              size="sm"
              variant="secondary"
              leadingIcon={<DownloadIcon size={12} strokeWidth={2} />}
              onClick={exportCsv}
              disabled={payments.length === 0}
            >
              {selectedIds.size ? `Export ${selectedIds.size}` : 'Export'}
            </Button>
            <EditColumns
              value={columnLayout.visible}
              onChange={setVisibleColumns}
              onReset={resetColumnLayout}
            />
          </div>
        </div>

        {list.error && !list.data ? (
          <div className={styles.errorBox} role="alert" data-testid="error-state">
            <EmptyState
              icon={<AlertCircleIcon size={20} />}
              title="Payments couldn't be loaded"
              description={list.error.message || 'Something went wrong while contacting the server.'}
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  leadingIcon={<RefreshIcon size={12} />}
                  onClick={list.refetch}
                >
                  Try again
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {list.error ? (
              <div className={styles.inlineError} role="alert" data-testid="error-banner">
                <AlertCircleIcon size={14} />
                <span>Couldn&apos;t refresh payments: {list.error.message}</span>
                <button type="button" className={styles.retry} onClick={list.refetch}>
                  Retry
                </button>
              </div>
            ) : null}
            <PaymentsTable
              payments={payments}
              loading={list.isLoading && !list.data}
              sort={state.sort}
              direction={state.direction}
              onSort={(field) => setSort(nextSort(state, field))}
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
              onOpenPayment={(payment) => router.push(`/payments/${payment.id}`)}
              emptyState={emptyState}
              skeletonRowCount={Math.min(state.limit, 12)}
              layout={columnLayout}
              onColumnResize={setColumnWidth}
              onColumnOrderChange={setVisibleColumnOrder}
            />
            {total > 0 ? (
              <Pagination
                className={styles.pagination}
                page={state.page}
                pageSize={state.limit}
                totalItems={total}
                pageSizeOptions={PAGE_SIZES}
                onPageChange={(page) => setPagination({ page })}
                onPageSizeChange={(size) => {
                  const limit = PAGE_SIZES.find((s) => s === size);
                  if (limit) setPagination({ limit: limit as PageSize, page: 1 });
                }}
                disabled={list.isFetching}
              />
            ) : null}
          </>
        )}
      </div>
    </AppShell>
  );
}
