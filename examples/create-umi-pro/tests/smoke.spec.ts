import { expect, test } from '@playwright/test';

test.describe('Basic Test', () => {
  test('displays some content', async ({ page }) => {
    await Promise.all([
      page.waitForResponse(/p__Home__index.*\.js/i),
      page.waitForResponse(/plugin-layout.*\.js/i),
      page.goto('/'),
    ]);

    await expect(page.getByText('欢迎使用 Umi Max ！')).toBeVisible();
  });

  test('access ok', async ({ page }) => {
    await page.goto('/access');

    await expect(
      page.locator('button.ant-btn', {
        hasText: '只有 Admin 可以看到这个按钮',
      }),
    ).toBeVisible();
  });

  test('simple CRUD ok', async ({ page }) => {
    await page.goto('/table');

    await expect(page.getByText('CRUD 示例', { exact: true })).toBeVisible();
  });
});
