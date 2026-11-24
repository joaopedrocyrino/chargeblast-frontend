import { createIcon } from './createIcon';

const dot = (cx: number, cy: number, r = 0.9) => (
  <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />
);

/* ---- Actions ---- */
export const SearchIcon = createIcon(
  'SearchIcon',
  <>
    <circle cx="7" cy="7" r="4.5" />
    <path d="m10.5 10.5 3.5 3.5" />
  </>,
);
export const CalendarIcon = createIcon(
  'CalendarIcon',
  <>
    <rect x="2" y="3" width="12" height="11" rx="1.5" />
    <path d="M2 6.5h12M5.25 1.75v2.5M10.75 1.75v2.5" />
  </>,
);
export const CopyIcon = createIcon(
  'CopyIcon',
  <>
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
    <path d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
  </>,
);
export const CheckIcon = createIcon('CheckIcon', <path d="m3 8.5 3 3 7-7" />);
export const CloseIcon = createIcon('CloseIcon', <path d="m4 4 8 8M12 4l-8 8" />);
export const MoreIcon = createIcon(
  'MoreIcon',
  <>
    {dot(3.25, 8, 1.15)}
    {dot(8, 8, 1.15)}
    {dot(12.75, 8, 1.15)}
  </>,
);
export const PlusIcon = createIcon('PlusIcon', <path d="M8 3v10M3 8h10" />);
export const PlusCircleIcon = createIcon(
  'PlusCircleIcon',
  <>
    <circle cx="8" cy="8" r="6.25" />
    <path d="M8 5.25v5.5M5.25 8h5.5" />
  </>,
);
export const DownloadIcon = createIcon('DownloadIcon', <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M2.5 13.5h11" />);
export const ExternalLinkIcon = createIcon(
  'ExternalLinkIcon',
  <path d="M9.5 2.5h4v4M13.5 2.5l-6 6M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" />,
);
export const RefreshIcon = createIcon(
  'RefreshIcon',
  <>
    <path d="M13.5 3v3.5H10" />
    <path d="M12.9 9.5A5.25 5.25 0 1 1 12.5 5.5l1 1" />
  </>,
);

/* ---- Chevrons & sorting ---- */
export const ChevronDownIcon = createIcon('ChevronDownIcon', <path d="m4 6 4 4 4-4" />);
export const ChevronLeftIcon = createIcon('ChevronLeftIcon', <path d="m10 4-4 4 4 4" />);
export const ChevronRightIcon = createIcon('ChevronRightIcon', <path d="m6 4 4 4-4 4" />);
export const SortIcon = createIcon('SortIcon', <path d="m5 6 3-3 3 3M5 10l3 3 3-3" />);
export const ArrowUpIcon = createIcon('ArrowUpIcon', <path d="M8 13V3M4 7l4-4 4 4" />);
export const ArrowDownIcon = createIcon('ArrowDownIcon', <path d="M8 3v10M4 9l4 4 4-4" />);

/* ---- Status ---- */
/** Rescaled from a 24 grid to the 16 grid (×2/3), keeping the original 1.8 → 1.2 stroke weight. */
export const ClockIcon = createIcon(
  'ClockIcon',
  <>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 4.667v4l2 1" />
  </>,
  { strokeWidth: 1.2 },
);
export const RefundIcon = createIcon(
  'RefundIcon',
  <>
    <path d="M2.75 2.75v3.5h3.5" />
    <path d="M3.1 6.25A5.25 5.25 0 1 1 3.25 10" />
  </>,
);
export const AlertCircleIcon = createIcon(
  'AlertCircleIcon',
  <>
    <circle cx="8" cy="8" r="6.25" />
    <path d="M8 4.75v3.75" />
    {dot(8, 11, 0.8)}
  </>,
);

/* ---- Navigation ---- */
export const HomeIcon = createIcon(
  'HomeIcon',
  <path d="M2.5 7 8 2.5 13.5 7v6a1 1 0 0 1-1 1h-3v-4h-3v4h-3a1 1 0 0 1-1-1z" />,
);
/** Rescaled from a 24 grid to the 16 grid (×2/3), keeping the original 1.8 → 1.2 stroke weight. */
export const BalanceIcon = createIcon(
  'BalanceIcon',
  <>
    <path d="M2 2.667h6.667M3.333 6H10M2 9.333h4M3.333 12.667h3.334" />
    <circle cx="11.333" cy="10.667" r="2.333" />
  </>,
  { strokeWidth: 1.2 },
);
/** Rescaled from a 24 grid to the 16 grid (×2/3), keeping the original 1.8 → 1.2 stroke weight. */
export const TransactionsIcon = createIcon(
  'TransactionsIcon',
  <path d="M2 7.333a3.333 3.333 0 0 1 3.333-3.333h7.334M10 1.333l2.667 2.667-2.667 2.667M14 8.667a3.333 3.333 0 0 1-3.333 3.333H3.333M6 9.333l-2.667 2.667 2.667 2.667" />,
  { strokeWidth: 1.2 },
);
export const CustomersIcon = createIcon(
  'CustomersIcon',
  <>
    <circle cx="8" cy="5.5" r="2.75" />
    <path d="M2.75 13.5c.6-2.4 2.7-4 5.25-4s4.65 1.6 5.25 4" />
  </>,
);
/** Rescaled from a 24 grid to the 16 grid (×2/3), keeping the original 1.7 → 1.133 stroke weight. */
export const ProductIcon = createIcon(
  'ProductIcon',
  <path d="M8 1.333 14 4.667v6.666l-6 3.334-6-3.334V4.667L8 1.333ZM2 4.667l6 3.333 6-3.333M8 8v6.667M5 3l6 3.333" />,
  { strokeWidth: 1.133 },
);
/** Rescaled from a 24 grid to the 16 grid (×2/3), keeping the original 1.8 → 1.2 stroke weight. */
export const ConnectIcon = createIcon(
  'ConnectIcon',
  <path d="M1.333 6 8 2l6.667 4L8 10 1.333 6ZM1.333 10 7 13.4a2 2 0 0 0 2 0L14.667 10" />,
  { strokeWidth: 1.2 },
);
/** Rescaled from a 24 grid to the 16 grid (×2/3), keeping the original 1.8 → 1.2 stroke weight. */
export const BillingIcon = createIcon(
  'BillingIcon',
  <path d="M4 14H2.667a1.333 1.333 0 0 1-1.334-1.333V2.667a1.333 1.333 0 0 1 1.334-1.334h8A1.333 1.333 0 0 1 12 2.667v6M4 4.667h2.667M4 7.333h4.667M14.667 8.667a4.333 4.333 0 1 1-7.667 4M6 15.333v-4.666h4.667" />,
  { strokeWidth: 1.2 },
);
/** Rescaled from a 24 grid to the 16 grid (×2/3), keeping the original 1.8 → 1.2 stroke weight. */
export const ReportingIcon = createIcon(
  'ReportingIcon',
  <path d="M2 2v12h12M5.333 10.667V7.333M9 10.667v-6M12.667 10.667V2" />,
  { strokeWidth: 1.2 },
);
export const AppsIcon = createIcon(
  'AppsIcon',
  <>
    <rect x="2.25" y="2.25" width="4.5" height="4.5" rx="1" />
    <rect x="9.25" y="2.25" width="4.5" height="4.5" rx="1" />
    <rect x="2.25" y="9.25" width="4.5" height="4.5" rx="1" />
    <rect x="9.25" y="9.25" width="4.5" height="4.5" rx="1" />
  </>,
);
export const AppsPlusIcon = createIcon(
  'AppsPlusIcon',
  <>
    <rect x="2.25" y="2.25" width="4.5" height="4.5" rx="1" />
    <rect x="2.25" y="9.25" width="4.5" height="4.5" rx="1" />
    <rect x="9.25" y="9.25" width="4.5" height="4.5" rx="1" />
    <path d="M11.5 2v5M9 4.5h5" />
  </>,
);
/** Four-point "new" sparkle, as used by Dashboard announcements. */
export const SparkleIcon = createIcon(
  'SparkleIcon',
  <>
    <path d="M6.5 2.5c.4 2.6 1.4 3.6 4 4-2.6.4-3.6 1.4-4 4-.4-2.6-1.4-3.6-4-4 2.6-.4 3.6-1.4 4-4Z" />
    <path d="M12 9.5c.2 1.1.6 1.5 1.75 1.75-1.15.25-1.55.65-1.75 1.75-.2-1.1-.6-1.5-1.75-1.75 1.15-.25 1.55-.65 1.75-1.75Z" />
  </>,
);
export const MenuIcon = createIcon('MenuIcon', <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />);
/** Rescaled from a 24 grid to the 16 grid (×2/3), keeping the original 1.8 → 1.2 stroke weight. */
export const PinIcon = createIcon(
  'PinIcon',
  <g transform="rotate(45 8 8)">
    <path d="M5.667 6.667V2.333a1 1 0 0 1 1-1h2.666a1 1 0 0 1 1 1v4.334M5.667 6.667h4.666l2.334 2v2H3.333v-2ZM8 10.667v4.666" />
  </g>,
  { strokeWidth: 1.2 },
);

/* ---- Payments & account ---- */
/**
 * Ionicons 5 `wallet-outline` (react-icons `IoWalletOutline`), MIT licensed,
 * https://ionic.io/ionicons. Rescaled from its 512 grid to the 16 grid (÷32),
 * keeping the original 1-unit stroke weight.
 */
export const WalletIcon = createIcon(
  'WalletIcon',
  <>
    <rect x="1.5" y="4.5" width="13" height="9" rx="1.5" />
    <path d="M12.855 4.5v-.9375a1.5625 1.5625 0 0 0-1.855-1.534L2.77 3.433A1.5625 1.5625 0 0 0 1.5 4.969V6.5" />
    {dot(11.5, 9, 1)}
  </>,
  { strokeWidth: 1 },
);
export const AccountIcon = createIcon(
  'AccountIcon',
  <>
    <circle cx="8" cy="8" r="6.25" />
    <circle cx="8" cy="6.5" r="2" />
    <path d="M4.25 12.5c.8-1.4 2.2-2.25 3.75-2.25s2.95.85 3.75 2.25" />
  </>,
);
export const SettingsIcon = createIcon(
  'SettingsIcon',
  <>
    <circle cx="8" cy="8" r="2" />
    <path d="M6.9 1.75h2.2l.35 1.7 1.25.72 1.65-.55 1.1 1.9-1.3 1.15v1.46l1.3 1.15-1.1 1.9-1.65-.55-1.25.72-.35 1.7H6.9l-.35-1.7-1.25-.72-1.65.55-1.1-1.9 1.3-1.15V7.27l-1.3-1.15 1.1-1.9 1.65.55 1.25-.72z" />
  </>,
);
export const BellIcon = createIcon(
  'BellIcon',
  <>
    <path d="M4 6.5a4 4 0 0 1 8 0c0 3.5 1.5 4.5 1.5 4.5h-11S4 10 4 6.5z" />
    <path d="M6.75 13.5a1.4 1.4 0 0 0 2.5 0" />
  </>,
);
export const HelpIcon = createIcon(
  'HelpIcon',
  <>
    <circle cx="8" cy="8" r="6.25" />
    <path d="M6.25 6.25a1.85 1.85 0 0 1 3.6.6c0 1.25-1.85 1.6-1.85 2.65" />
    {dot(8, 11.5, 0.8)}
  </>,
);
