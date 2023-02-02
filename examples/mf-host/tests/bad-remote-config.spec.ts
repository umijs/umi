import { expect, test } from '@playwright/test';

test.describe('safe MF load', () => {
  test('can fallback with bad remote', async ({ page }) => {
    const URL = `http://1.2.3.4:404/bad_file.js`;
    await Promise.all([
      page.route(URL, (route) => {
        return route.fulfill({
          status: 404,
        });
      }),
      page.waitForResponse((res) => {
        return res.url() === URL && res.status() === 404;
      }),
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
