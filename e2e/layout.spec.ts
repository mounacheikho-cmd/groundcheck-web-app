/// <reference lib="dom" />
import { expect, test, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const forecast = readFileSync(new URL('../src/api/fixtures/aschaffenburg.json', import.meta.url), 'utf8');

// Desktop widths: smallest desktop (design scaled to 80 %), the Figma frame, and a wider laptop.
const WIDTHS = [1024, 1280, 1512];

test.skip(({ isMobile }) => isMobile, 'desktop layout only');

async function signIn(page: Page) {
  await page.addInitScript(() =>
    sessionStorage.setItem('gc.user', JSON.stringify({ name: 'Markus', email: 'markus@example.com' })),
  );
}

/** A heading is on one line when its height is about one line-height. */
async function expectOneLine(heading: Locator) {
  // offsetHeight and line-height are both in layout px, so the desktop zoom does not matter.
  const lines = await heading.evaluate(
    (el: HTMLElement) => el.offsetHeight / parseFloat(getComputedStyle(el).lineHeight),
  );
  expect(lines).toBeLessThan(1.5);
}

/** The element is fully inside the window and left of the sidebar (if there is one). */
async function expectVisibleArea(page: Page, el: Locator) {
  const box = await el.boundingBox();
  expect(box).not.toBeNull();
  const nav = page.getByRole('navigation', { name: 'Main' });
  const sidebar = (await nav.count()) > 0 ? await nav.boundingBox() : null;
  const right = sidebar ? sidebar.x : page.viewportSize()!.width;
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(right + 0.5);
}

for (const width of WIDTHS) {
  test.describe(`desktop at ${width} px`, () => {
    test.use({ viewport: { width, height: 832 } });

    test.beforeEach(async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-09-29T08:20:00+02:00'));
      await page.route('**/api.open-meteo.com/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: forecast }),
      );
    });

    test('Welcome shows the whole logo and buttons', async ({ page }) => {
      await page.goto('/');
      await expectVisibleArea(page, page.getByRole('img', { name: 'GroundCheck' }));
      await expectVisibleArea(page, page.getByRole('link', { name: 'Sign Up' }));
    });

    test('Log in and Sign up headings stay on one line', async ({ page }) => {
      await page.goto('/login');
      await expectOneLine(page.getByRole('heading', { name: 'Log in' }));
      await page.goto('/signup');
      await expectOneLine(page.getByRole('heading', { name: 'Sign up' }));
    });

    test('Home: nothing is hidden under the sidebar', async ({ page }) => {
      await signIn(page);
      await page.goto('/home');
      await expectOneLine(page.getByRole('heading', { name: 'Hello, Markus' }));
      for (const task of ['Dig', 'Spray', 'Prune']) {
        await expectVisibleArea(page, page.getByRole('link', { name: task }));
      }
    });

    test('Edit thresholds: title on one line, Save not under the sidebar', async ({ page }) => {
      await signIn(page);
      await page.goto('/thresholds');
      await expectOneLine(page.getByRole('heading', { name: 'Edit Thresholds' }));
      await expectVisibleArea(page, page.getByRole('button', { name: 'Save' }));
      await expectVisibleArea(page, page.getByRole('button', { name: 'Cancel' }));
    });
  });
}
