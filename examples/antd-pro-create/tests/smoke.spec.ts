import { test, expect } from '@playwright/test';

test.describe('smoke test', () => {
  test('rediect to login page', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.locator('.ant-pro-form-login-title', {
        hasText: 'Ant Design',
      }),
    ).toBeVisible();

    await page.locator('#username').type('admin');
    await page.locator('#password').type('ant.design');

    await Promise.all([page.waitForURL(/\/welcome$/), page.locator('button.ant-btn').click()]);
  });
});
