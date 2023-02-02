import { expect, test } from '@playwright/test';

test.describe('smoke test', () => {
  test('render home ', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.locator('[data-testid="layout-title"]', {
        hasText: 'Vite e2e layout',
      }),
    ).toBeVisible();
    await expect(page.locator('h1', { hasText: 'with vite' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'antd btn' })).toBeVisible();
    await expect(
      page.locator('[data-testid="hello"]', { hasText: 'Hello world home' }),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="utils"]', { hasText: 'hello utils' }),
    ).toBeVisible();
    await expect(page.locator('div[data-testid="utils"]')).toHaveCSS(
      'color',
      'rgb(128, 128, 128)',
    );
  });

  test('render about', async ({ page }) => {
    await page.goto('/about');
    await expect(
      page.locator('[data-testid="layout-title"]', {
        hasText: 'Vite e2e layout',
      }),
    ).toBeVisible();
    await expect(page.locator('h1', { hasText: 'About' })).toBeVisible();
    await expect(
      page.locator('[data-testid="hello"]', { hasText: 'Hello world about' }),
    ).toBeVisible();
  });
});
