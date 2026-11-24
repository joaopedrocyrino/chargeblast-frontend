import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const rows = (page: Page) => page.locator('tbody tr:has([data-testid="payment-id"])');
const header = (page: Page, id: string) => page.locator(`th[data-column-id="${id}"]`);

test.beforeEach(async ({ page }) => {
  // Start every test from the default column layout (once, so reloads keep it).
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem('e2e-reset')) return;
    window.localStorage.clear();
    window.sessionStorage.setItem('e2e-reset', '1');
  });
  await page.goto('/payments');
  await expect(rows(page)).toHaveCount(25);
});

test('filters by status and search, keeping the view in the URL', async ({ page }) => {
  await page.getByTestId('status-tab-failed').click();
  await expect(page).toHaveURL(/status=failed/);
  await expect(rows(page).first()).toContainText('Failed');

  const search = page.getByPlaceholder('Search');
  await search.fill('4242');
  await search.press('Enter');
  await expect(page).toHaveURL(/q=4242/);
  await expect(rows(page).first()).toContainText('4242');

  await page.reload();
  await expect(page.getByTestId('status-tab-failed')).toHaveAttribute('aria-pressed', 'true');
  await expect(search).toHaveValue('4242');
});

test('filters by currency, with options for every currency in the data', async ({ page }) => {
  await page.getByTestId('filter-currency').click();
  await expect(page.getByRole('option')).toHaveCount(7);
  await page.getByRole('option', { name: /^JPY/ }).click();
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page).toHaveURL(/currency=JPY/);
  await expect(rows(page).first()).toContainText('JPY');
});

test('adds card brand, decline reason and refunded date from More filters', async ({ page }) => {
  await page.getByTestId('filter-more').click();
  await page.getByRole('menuitem', { name: 'Decline reason' }).click();
  // The new chip opens straight away.
  await page.getByRole('option', { name: 'Expired card' }).click();
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page).toHaveURL(/decline=expired_card/);
  await expect(rows(page).first()).toContainText('Failed');

  await page.getByTestId('filter-more').click();
  await page.getByRole('menuitem', { name: 'Card brand' }).click();
  await page.getByRole('option', { name: 'Visa' }).click();
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page).toHaveURL(/brand=visa/);

  await page.getByTestId('filter-more').click();
  await page.getByRole('menuitem', { name: 'Refunded date' }).click();
  await page.getByRole('radio', { name: 'Last 30 days' }).click();
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page).toHaveURL(/rdate=30d/);
  await expect(page.getByTestId('filter-more')).toHaveCount(0);

  // Added filters come back from the URL.
  await page.reload();
  await expect(page.getByTestId('filter-refunded-date')).toBeVisible();
});

test('sorts and paginates', async ({ page }) => {
  await header(page, 'amount').getByRole('button', { name: 'Amount' }).click();
  await expect(header(page, 'amount')).toHaveAttribute('aria-sort', /ascending|descending/);

  await page.getByRole('combobox', { name: 'Rows per page' }).click();
  await page.getByRole('option', { name: '50' }).click();
  await expect(rows(page)).toHaveCount(50);

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText(/Viewing 51–100 of/)).toBeVisible();
});

test('opens the payment details page', async ({ page }) => {
  await rows(page).first().locator('td').nth(3).click();
  await expect(page).toHaveURL(/\/payments\/pi_/);
  await expect(page.getByRole('heading', { name: 'Timeline' })).toBeVisible();
});

test('hides, reorders and resizes columns, and exports only what is shown', async ({ page }) => {
  await page.getByRole('button', { name: 'Edit columns' }).click();
  await page.getByRole('option', { name: 'Description' }).click();
  await page.keyboard.press('Escape');
  await expect(header(page, 'description')).toHaveCount(0);

  await header(page, 'id').dragTo(header(page, 'amount'), { targetPosition: { x: 4, y: 10 } });
  await expect(page.locator('th[data-column-id]').nth(1)).toHaveAttribute('data-column-id', 'id');

  const customer = header(page, 'customer');
  const before = (await customer.boundingBox())?.width ?? 0;
  await customer.getByRole('separator').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await customer.boundingBox())?.width ?? 0).toBeGreaterThan(before + 20);

  // The layout survives a reload.
  await page.reload();
  await expect(page.locator('th[data-column-id]').nth(1)).toHaveAttribute('data-column-id', 'id');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export' }).click(),
  ]);
  const csv = await readFile((await download.path()) ?? '', 'utf8');
  expect(csv.split('\r\n')[0]).toBe(
    'id,amount,currency,status,payment_method_type,payment_method_brand,payment_method_last4,' +
      'customer_name,customer_email,created_at_utc,refunded_at_utc,decline_code,decline_reason',
  );
});
