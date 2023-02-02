import { expect, test } from '@playwright/test';

test.describe('plugin-mf x MFSU', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('dev normal display', async ({ page }) => {
    await expect(page.getByText('remote Counter')).toBeVisible();

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
});
