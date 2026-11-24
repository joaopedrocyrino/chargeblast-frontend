import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@chargeblast/ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Payments – Chargeblast', template: '%s – Chargeblast' },
  description: 'Payments dashboard',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { readonly children: ReactNode }): ReactNode {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
