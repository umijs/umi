import { expect, test } from '@playwright/test';

test.describe('Basic Test', () => {
  test('can display ok', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Yay! Welcome to umi!')).toBeVisible();
  });
});
