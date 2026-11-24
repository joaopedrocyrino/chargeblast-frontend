import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests drive the real app (Next.js + API + seeded PostgreSQL).
 * Start the stack first (e.g. `docker compose up` in chargeblast-infra);
 * a dev server already on E2E_BASE_URL is reused.
 */
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL, trace: 'retain-on-failure', viewport: { width: 1600, height: 1000 } },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1600, height: 1000 } } },
  ],
  webServer: { command: 'npm run dev', url: baseURL, reuseExistingServer: true, timeout: 120_000 },
});
