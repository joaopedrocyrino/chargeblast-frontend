'use client';

import {
  AccountIcon,
  AppsIcon,
  AppsPlusIcon,
  BalanceIcon,
  BellIcon,
  BillingIcon,
  ChevronDownIcon,
  ClockIcon,
  CloseIcon,
  ConnectIcon,
  CustomersIcon,
  Dropdown,
  HelpIcon,
  HomeIcon,
  IconButton,
  MenuIcon,
  MoreIcon,
  PinIcon,
  PlusIcon,
  ProductIcon,
  ReportingIcon,
  SettingsIcon,
  TransactionsIcon,
  WalletIcon,
  cx,
} from '@chargeblast/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import styles from './AppShell.module.css';

interface NavItem {
  readonly label: string;
  readonly icon: ReactNode;
  readonly href?: string;
  readonly expandable?: boolean;
}

const PRIMARY: readonly NavItem[] = [
  { label: 'Home', icon: <HomeIcon size={16} /> },
  { label: 'Balances', icon: <BalanceIcon size={16} /> },
  { label: 'Transactions', icon: <TransactionsIcon size={16} />, href: '/payments' },
  { label: 'Customers', icon: <CustomersIcon size={16} /> },
  { label: 'Product catalog', icon: <ProductIcon size={16} /> },
];

const SHORTCUTS: readonly NavItem[] = [
  { label: 'Payments analytics', icon: <PinIcon size={16} /> },
  { label: 'Reports', icon: <ClockIcon size={16} /> },
  { label: 'Sigma', icon: <ClockIcon size={16} /> },
  { label: 'Radar', icon: <ClockIcon size={16} /> },
];

const PRODUCTS: readonly NavItem[] = [
  { label: 'Connect', icon: <ConnectIcon size={16} />, expandable: true },
  { label: 'Payments', icon: <WalletIcon size={16} />, expandable: true },
  { label: 'Billing', icon: <BillingIcon size={16} />, expandable: true },
  { label: 'Reporting', icon: <ReportingIcon size={16} />, expandable: true },
  { label: 'More', icon: <MoreIcon size={16} />, expandable: true },
];

function NavLink({ item, active }: { readonly item: NavItem; readonly active: boolean }): ReactNode {
  const content = (
    <>
      <span className={styles.navIcon}>{item.icon}</span>
      <span className={styles.navLabel}>{item.label}</span>
      {item.expandable ? <ChevronDownIcon size={12} strokeWidth={2} className={styles.navChevron} /> : null}
    </>
  );
  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cx(styles.navItem, active && styles.navActive)}
        aria-current={active ? 'page' : undefined}
      >
        {content}
      </Link>
    );
  }
  // Placeholder destinations outside the scope of this exercise.
  return (
    <span className={cx(styles.navItem, styles.navInert)} title="Not part of this demo">
      {content}
    </span>
  );
}

function NavSection({
  title,
  items,
  pathname,
}: {
  readonly title?: string;
  readonly items: readonly NavItem[];
  readonly pathname: string;
}): ReactNode {
  return (
    <div className={styles.navSection}>
      {title ? <p className={styles.navHeading}>{title}</p> : null}
      <ul className={styles.navList}>
        {items.map((item) => (
          <li key={item.label}>
            <NavLink item={item} active={item.href !== undefined && pathname.startsWith(item.href)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Pinned-apps group of the top bar. The reference shows third-party app
 * logos there; these are neutral stand-ins with the same shape and colours.
 */
function AppTiles(): ReactNode {
  return (
    <>
      <button
        type="button"
        className={cx(styles.appTile, styles.appTileLight)}
        aria-label="Pinned app: Insights"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="M3 3h3.5v6.5H10V13H3z" style={{ fill: 'var(--color-text-strong)' }} />
          <path d="M8.5 3a5 5 0 0 1 0 10V10.5a2.5 2.5 0 0 0 0-5z" style={{ fill: 'var(--color-brand)' }} />
        </svg>
      </button>
      <button
        type="button"
        className={cx(styles.appTile, styles.appTileBlue)}
        aria-label="Pinned app: Automations"
      >
        <svg
          viewBox="0 0 16 16"
          width="14"
          height="14"
          aria-hidden="true"
          fill="none"
          style={{ stroke: 'var(--color-text-inverse)' }}
          strokeWidth="1.3"
        >
          <path d="M8 2.5 12.75 5.25v5.5L8 13.5l-4.75-2.75v-5.5z" />
          <circle cx="8" cy="8" r="1.75" />
        </svg>
      </button>
      <button
        type="button"
        className={cx(styles.appTile, styles.appTileDark)}
        aria-label="Pinned app: Payouts"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="M4.5 4.5h7v7H9V7H4.5z" style={{ fill: 'var(--color-app-tile-accent)' }} />
        </svg>
      </button>
    </>
  );
}

/** Account switcher. This demo has a single account and no sign-in, so its actions are shown disabled. */
function AccountMenu(): ReactNode {
  return (
    <Dropdown
      placement="bottom-start"
      items={[
        {
          id: 'settings',
          label: 'Account settings',
          icon: <SettingsIcon size={14} />,
          onSelect: () => {},
          disabled: true,
        },
        {
          id: 'switch',
          label: 'Switch account',
          icon: <AccountIcon size={14} />,
          onSelect: () => {},
          disabled: true,
        },
        { id: 'sep', type: 'separator' },
        { id: 'sign-out', label: 'Sign out', onSelect: () => {}, disabled: true },
      ]}
      renderTrigger={(props, { open }) => (
        <button
          {...props}
          type="button"
          className={cx(styles.accountTrigger, open && styles.accountTriggerOpen)}
          aria-label="Chargeblast account menu"
        >
          <span className={styles.accountLogo} aria-hidden="true">
            cb
          </span>
          <span className={styles.accountName}>Chargeblast</span>
          <ChevronDownIcon size={12} strokeWidth={2} className={styles.accountChevron} />
        </button>
      )}
    />
  );
}

interface AppShellProps {
  /** Search control rendered in the top bar (page-specific). */
  readonly search?: ReactNode;
  readonly children: ReactNode;
}

export function AppShell({ search, children }: AppShellProps): ReactNode {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // Close the mobile menu after navigation (state adjusted during render, not in an effect).
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setMenuOpen(false);
  }

  return (
    <div className={styles.shell}>
      <aside className={cx(styles.sidebar, menuOpen && styles.sidebarOpen)} aria-label="Main navigation">
        <div className={styles.account}>
          <AccountMenu />
          <IconButton
            className={styles.closeMenu}
            size="sm"
            aria-label="Close menu"
            icon={<CloseIcon size={14} />}
            onClick={() => setMenuOpen(false)}
          />
        </div>
        <nav className={styles.nav}>
          <NavSection items={PRIMARY} pathname={pathname} />
          <NavSection title="Shortcuts" items={SHORTCUTS} pathname={pathname} />
          <NavSection title="Products" items={PRODUCTS} pathname={pathname} />
        </nav>
        <div className={styles.sidebarFooter}>
          <NavLink item={{ label: 'Developers', icon: <AppsIcon size={16} /> }} active={false} />
        </div>
      </aside>
      {menuOpen ? (
        <div className={styles.backdrop} onClick={() => setMenuOpen(false)} aria-hidden="true" />
      ) : null}

      <div className={styles.main}>
        <header className={styles.topBar}>
          <IconButton
            className={styles.menuButton}
            aria-label="Open menu"
            icon={<MenuIcon size={16} />}
            onClick={() => setMenuOpen(true)}
          />
          <div className={styles.search}>{search}</div>
          <div className={styles.topActions}>
            <span className={styles.testMode}>
              Test mode has moved.{' '}
              <button type="button" className={styles.testModeLink} title="Not part of this demo">
                Show me
              </button>
            </span>
            <div className={styles.apps} role="group" aria-label="Apps">
              <AppTiles />
              <IconButton size="sm" aria-label="Explore apps" icon={<AppsPlusIcon size={16} />} />
            </div>
            <IconButton aria-label="Help" icon={<HelpIcon size={16} />} />
            <span className={styles.bell}>
              <IconButton aria-label="Notifications (unread)" icon={<BellIcon size={16} />} />
              <span className={styles.unreadDot} aria-hidden="true" />
            </span>
            <IconButton aria-label="Settings" icon={<SettingsIcon size={16} />} />
            <button type="button" className={styles.createButton} aria-label="Create">
              <PlusIcon size={12} strokeWidth={2.5} />
            </button>
          </div>
        </header>
        <main className={styles.content} id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
