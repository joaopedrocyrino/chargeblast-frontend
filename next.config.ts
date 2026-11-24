import type { NextConfig } from 'next';

/**
 * API routing:
 *  - Production: NEXT_PUBLIC_API_URL (e.g. https://api-chargeblast.cyrinosoftware.com/api/v1)
 *    is baked into the client bundle and the browser calls the API domain directly.
 *  - Local development: it is unset, the browser calls same-origin `/api/v1/*`
 *    and this rewrite proxies to BACKEND_INTERNAL_URL.
 */
const usesApiDomain = Boolean(process.env.NEXT_PUBLIC_API_URL);
const backendUrl = (process.env.BACKEND_INTERNAL_URL ?? 'http://localhost:4000').replace(/\/$/, '');

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  devIndicators: false,
  agentRules: false,
  poweredByHeader: false,
  transpilePackages: ['@chargeblast/ui'],
  async rewrites() {
    return usesApiDomain ? [] : [{ source: '/api/v1/:path*', destination: `${backendUrl}/api/v1/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;
