import { expect, test } from '@playwright/test';

test.describe('import by dynamic import', () => {
  test('loads page successfully', async ({ page }) => {
    await Promise.all([
      page.waitForResponse((res) => {
        return (
          res.url() === 'http://127.0.0.1:9000/remote.js' &&
          res.request().method() === 'GET'
        );
      }),
      page.goto('/dynamic-import'),
    ]);

    await expect(page.getByText('MF Host')).toBeVisible();
  });

  test.describe('Hooks verification', () => {
    test('remote hooks works', async ({ page }) => {
      await page.goto('/dynamic-import');

      await expect(
        page.locator('[data-testid="remote-counter"]', {
          hasText: '10',
        }),
      ).toBeVisible();
      await page.locator('[data-testid="remote-button"]').click();
      await expect(
        page.locator('[data-testid="remote-counter"]', {
          hasText: '11',
        }),
      ).toBeVisible();
    });

    test('host hooks works', async ({ page }) => {
      await page.goto('/dynamic-import');

      await expect(
        page.locator('[data-testid="host-counter"]', {
          hasText: '42',
        }),
      ).toBeVisible();
      await page.locator('[data-testid="host-button"]').click();
      await expect(
        page.locator('[data-testid="host-counter"]', {
          hasText: '43',
        }),
      ).toBeVisible();
    });
  });
});
