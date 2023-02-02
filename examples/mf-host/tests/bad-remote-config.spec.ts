import { expect, test } from '@playwright/test';

test.describe('safe MF load', () => {
  test('can fallback with bad remote', async ({ page }) => {
    await Promise.all([
      page.waitForRequest('http://1.2.3.4:404/bad_file.js'),
      page.goto('/bad-remote'),
    ]);

    await expect(page.getByText('Page is Loaed')).toBeVisible();
    await expect(page.getByText('Fallback-Success')).toBeVisible();
  });

  test('can fallback with non-exists remote', async ({ page }) => {
    await page.goto('/no-exists-remote');

    await expect(page.getByText('Page is Loaed')).toBeVisible();
    await expect(page.getByText('everyone writes bugs')).toBeVisible();
  });
});
