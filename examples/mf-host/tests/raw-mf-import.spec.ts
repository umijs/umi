import { expect, test } from '@playwright/test';

test.describe('safe MF load', () => {
  test('supprt raw mf import', async ({ page }) => {
    await Promise.all([
      page.waitForResponse((res) => {
        return (
          res.url() === 'http://localhost:9000/remote.js' &&
          res.request().method() === 'GET'
        );
      }),
      page.goto('/raw-mf-import'),
    ]);

    await expect(page.getByText('remote Counter')).toBeVisible();
  });

  test('supprt raw mf component', async ({ page }) => {
    await Promise.all([
      page.waitForResponse((res) => {
        return (
          res.url() === 'http://localhost:9000/remote.js' &&
          res.request().method() === 'GET'
        );
      }),
      page.goto('/raw-mf-component'),
    ]);

    await expect(page.getByText('remote Counter')).toBeVisible();
  });
});
