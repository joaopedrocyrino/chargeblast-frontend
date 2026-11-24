/**
 * @chargeblast/ui — dependency-free React components, hooks and SVG icons.
 * Import the global styles once at the application root:
 *   import '@chargeblast/ui/styles.css';
 */

// Controls
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from './components/Button/Button';
export { IconButton, type IconButtonProps } from './components/IconButton/IconButton';
export { Input, type InputProps } from './components/Input/Input';
export { Checkbox, type CheckboxProps } from './components/Checkbox/Checkbox';
export { Select, type SelectOption, type SelectProps } from './components/Select/Select';
export { MultiSelectList, type MultiSelectListProps } from './components/MultiSelect/MultiSelectList';
export {
  DateRangeCalendar,
  formatDateRange,
  type DateRange,
  type DateRangeCalendarProps,
} from './components/DateRangeCalendar/DateRangeCalendar';

export { Field, type FieldControlProps, type FieldProps } from './components/Field/Field';
export {
  AddFilterButton,
  FilterChip,
  FilterPanel,
  type FilterChipProps,
  type FilterPanelProps,
} from './components/FilterChip/FilterChip';
export {
  MultiSelectFilter,
  type MultiSelectFilterProps,
} from './components/MultiSelectFilter/MultiSelectFilter';

// Feedback
export { Badge, type BadgeProps, type BadgeTone } from './components/Badge/Badge';
export { Spinner, type SpinnerProps } from './components/Spinner/Spinner';
export { Skeleton, type SkeletonProps } from './components/Skeleton/Skeleton';
export { EmptyState, type EmptyStateProps } from './components/EmptyState/EmptyState';

// Overlays
export { Dialog, type DialogProps } from './components/Dialog/Dialog';
export { Tooltip, type TooltipProps } from './components/Tooltip/Tooltip';
export {
  Popover,
  type PopoverApi,
  type PopoverProps,
  type PopoverTriggerProps,
} from './components/Popover/Popover';
export {
  Dropdown,
  type DropdownEntry,
  type DropdownItem,
  type DropdownProps,
} from './components/Dropdown/Dropdown';

// Data display
export { DataTable, type ColumnDef, type DataTableProps } from './components/Table/DataTable';
export type { SortDirection } from './components/Table/Table';
export { Pagination, type PaginationProps } from './components/Pagination/Pagination';

// Hooks
export { copyToClipboard, useCopyToClipboard } from './hooks/useCopyToClipboard';
export { useDebouncedValue } from './hooks/useDebouncedValue';

// Utilities
export { cx } from './utils/cx';
export { createPersistentStore, usePersistentStore, type PersistentStore } from './utils/persistent-store';
export {
  addDays,
  isPlainDate,
  plainDateFromLocal,
  plainDateToLocalStart,
  todayPlainDate,
  type PlainDate,
} from './utils/plain-date';

// Icons
export * from './icons';
