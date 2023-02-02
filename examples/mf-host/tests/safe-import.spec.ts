import { expect, test } from '@playwright/test';

test.describe('safeMfImport', () => {
  test('can fallback', async ({ page }) => {
    await Promise.all([
      page.waitForResponse((res) => {
        return (
          res.request().method() === 'GET' &&
          res.url() === 'http://127.0.0.1:9000/remote.js'
        );
      }),
      page.goto('/safe-import'),
    ]);

    await expect(page.getByText('MF Host')).toBeVisible();
  });

  test.describe('Hooks verification', () => {
    test('remote hooks works', async ({ page }) => {
      await page.goto('/safe-import');

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
      await page.goto('/safe-import');

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

test.describe('safeMfImport with dynamic registered remote', () => {
  test('can load registered remote: register-then-import', async ({ page }) => {
    await page.goto('/register-then-import');

    await expect(page.getByText('remote Counter')).toBeVisible();
  });

  test('can load registered remote: safe-remote-componen', async ({ page }) => {
    await page.goto('/safe-remote-component');

    await expect(
      page.locator('[data-testid="remote-counter"]', {
        hasText: '808',
      }),
    ).toBeVisible();
  });
});
