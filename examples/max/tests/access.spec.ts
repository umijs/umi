import { expect, test } from '@playwright/test';

test.describe('access', () => {
  test('show accessible content no denied', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Allow')).toBeVisible();
    await expect(page.locator('Deny')).toBeHidden();
  });

  test('can not visit denied url', async ({ page }) => {
    await page.goto('/accessDeny');

    await expect(page.getByText('403')).toBeVisible();
    await expect(page.getByText('抱歉，你无权访问该页面')).toBeVisible();
  });
});
