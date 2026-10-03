import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const forecast = readFileSync(new URL('../src/api/fixtures/aschaffenburg.json', import.meta.url), 'utf8');

test.beforeEach(async ({ page }) => {
  // Fixed time and a recorded forecast, so the result is always the same.
  await page.clock.setFixedTime(new Date('2026-09-29T08:20:00+02:00'));
  await page.route('**/api.open-meteo.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: forecast }),
  );
});

test('a visitor tries the demo and gets a decision for spraying', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /try the demo/i }).click();
  await expect(page.getByRole('heading', { name: 'Hello, Markus' })).toBeVisible();

  await page.getByRole('link', { name: 'Spray' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('NO-GO');
  await expect(page.getByText('Wind is below limit until 10:00.')).toBeVisible();

  await page.getByText('Why this status?').click();
  await expect(page.getByRole('table')).toContainText('Over limit');
});

test('changing a threshold changes the decision', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /try the demo/i }).click();
  await page.goto('/thresholds');
  await page.getByLabel('Min wind for Spray, in km/h').selectOption('');
  await page.getByRole('button', { name: 'Save' }).click();

  await page.goto('/result/spray');
  await expect(page.getByRole('heading', { level: 1 })).not.toContainText('NO-GO');
});

test('opening the app again starts at Welcome', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /try the demo/i }).click();
  await expect(page).toHaveURL('/home');

  const again = await context.newPage();
  await again.goto('/');
  await expect(again.getByRole('heading', { name: 'Welcome!' })).toBeVisible();
});
