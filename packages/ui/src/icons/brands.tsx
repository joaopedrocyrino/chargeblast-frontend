import type { ReactNode, SVGProps } from 'react';

/**
 * Simplified, generic payment-brand marks drawn as 32×20 tiles. They are
 * recognisable approximations for the table, not official logo artwork.
 */
export interface BrandIconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Rendered width in px; height keeps the 8:5 card ratio. Default 24. */
  readonly width?: number;
  /** Accessible name; decorative when omitted. */
  readonly title?: string;
}

function tile(name: string, body: ReactNode, border = false) {
  function BrandIcon({ width = 24, title, ...rest }: BrandIconProps): ReactNode {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 20"
        width={width}
        height={(width * 20) / 32}
        focusable="false"
        role={title ? 'img' : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
        data-icon={name}
        {...rest}
      >
        {title ? <title>{title}</title> : null}
        <rect
          x="0.5"
          y="0.5"
          width="31"
          height="19"
          rx="3"
          fill="#fff"
          stroke={border ? '#d5dbe1' : 'none'}
        />
        {body}
      </svg>
    );
  }
  BrandIcon.displayName = name;
  return BrandIcon;
}

const text = (value: string, fill: string, size: number, x = 16, y = 13.4, italic = false) => (
  <text
    x={x}
    y={y}
    textAnchor="middle"
    fontFamily="Arial, Helvetica, sans-serif"
    fontWeight="800"
    fontStyle={italic ? 'italic' : 'normal'}
    fontSize={size}
    fill={fill}
    letterSpacing="-0.2"
  >
    {value}
  </text>
);

const VisaIcon = tile(
  'VisaIcon',
  <>
    <rect width="32" height="20" rx="3" fill="#1434cb" />
    {text('VISA', '#fff', 9, 16, 13.4, true)}
  </>,
);
const MastercardIcon = tile(
  'MastercardIcon',
  <>
    <rect width="32" height="20" rx="3" fill="#252525" />
    <circle cx="12.5" cy="10" r="5.5" fill="#eb001b" />
    <circle cx="19.5" cy="10" r="5.5" fill="#f79e1b" />
    <path d="M16 5.75a5.5 5.5 0 0 1 0 8.5 5.5 5.5 0 0 1 0-8.5z" fill="#ff5f00" />
  </>,
);
const AmexIcon = tile(
  'AmexIcon',
  <>
    <rect width="32" height="20" rx="3" fill="#1f72cd" />
    {text('AMEX', '#fff', 8)}
  </>,
);
const DiscoverIcon = tile(
  'DiscoverIcon',
  <>
    {text('DISC', '#231f20', 7, 12, 12.6)}
    <circle cx="25" cy="10" r="3.25" fill="#f48120" />
  </>,
  true,
);
const JcbIcon = tile(
  'JcbIcon',
  <>
    <rect x="4" y="3" width="8" height="14" rx="2" fill="#0e4c96" />
    <rect x="12" y="3" width="8" height="14" rx="2" fill="#e21836" />
    <rect x="20" y="3" width="8" height="14" rx="2" fill="#00a14b" />
    {text('JCB', '#fff', 7, 16, 12.6)}
  </>,
  true,
);
const UnionPayIcon = tile(
  'UnionPayIcon',
  <>
    <path d="M3 2h10l-3 16H3z" fill="#d10429" />
    <path d="M12 2h9l-3 16h-9z" fill="#022e64" />
    <path d="M20 2h9v16h-12z" fill="#076f74" />
    {text('UP', '#fff', 7.5, 16, 12.8)}
  </>,
  true,
);
const DinersIcon = tile(
  'DinersIcon',
  <>
    <circle cx="16" cy="10" r="6" fill="none" stroke="#0079be" strokeWidth="1.6" />
    <path d="M14 6.6v6.8M18 6.6v6.8" stroke="#0079be" strokeWidth="1.4" />
  </>,
  true,
);
const GenericCardIcon = tile(
  'GenericCardIcon',
  <>
    <rect width="32" height="20" rx="3" fill="#ebeef1" />
    <rect x="0" y="5" width="32" height="3" fill="#a3acba" />
    <rect x="4" y="12" width="9" height="2" rx="1" fill="#a3acba" />
  </>,
);
const BankAccountIcon = tile(
  'BankAccountIcon',
  <>
    <rect width="32" height="20" rx="3" fill="#ebeef1" />
    <path
      d="M10 8 16 4.75 22 8M11.25 8.5v4.5M14.4 8.5v4.5M17.6 8.5v4.5M20.75 8.5v4.5M10 15h12"
      fill="none"
      stroke="#596171"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);
const ApplePayIcon = tile('ApplePayIcon', <>{text('Pay', '#000', 9, 16, 13.4)}</>, true);
const GooglePayIcon = tile(
  'GooglePayIcon',
  <>
    {text('G', '#4285f4', 9, 10.5, 13.4)}
    {text('Pay', '#5f6368', 8, 20, 13.2)}
  </>,
  true,
);
const LinkWalletIcon = tile(
  'LinkWalletIcon',
  <>
    <rect width="32" height="20" rx="3" fill="#00d66f" />
    {text('link', '#011e0f', 8.5, 16, 13.2)}
  </>,
);

const CARD_BRANDS = {
  visa: VisaIcon,
  mastercard: MastercardIcon,
  amex: AmexIcon,
  discover: DiscoverIcon,
  jcb: JcbIcon,
  unionpay: UnionPayIcon,
  diners: DinersIcon,
} as const;

const WALLETS = {
  apple_pay: ApplePayIcon,
  google_pay: GooglePayIcon,
  link: LinkWalletIcon,
} as const;

export interface PaymentBrandIconProps extends BrandIconProps {
  /** Card brand key (visa, mastercard, …), wallet key (apple_pay, …) or "bank". */
  readonly brand: string | null;
}

/** Resolves a brand/wallet key to its mark, falling back to a generic card. */
export function PaymentBrandIcon({ brand, ...rest }: PaymentBrandIconProps): ReactNode {
  if (brand === 'bank') return <BankAccountIcon {...rest} />;
  const Icon =
    (brand && (CARD_BRANDS as Record<string, typeof VisaIcon>)[brand]) ||
    (brand && (WALLETS as Record<string, typeof VisaIcon>)[brand]) ||
    GenericCardIcon;
  return <Icon {...rest} />;
}
