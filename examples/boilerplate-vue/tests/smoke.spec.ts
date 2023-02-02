import { expect, test } from '@playwright/test';

test.describe('Basic Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('display page normallly', async ({ page }) => {
    // 页面正常渲染
    await expect(page.getByText('Hello Vue + UmiJs')).toBeVisible();
    await expect(page.getByText('components/HelloWorld.vue')).toBeVisible();
    await expect(page.getByText('{"a":1}')).toBeVisible();

    // 按钮存在
    await expect(
      page.locator('button', {
        hasText: 'count is',
      }),
    ).toBeVisible();
  });

  test('use layout', async ({ page }) => {
    // layout 布局
    await expect(page.getByText('BoulerplateVue')).toBeVisible();

    await expect(page.locator('.nav a')).toContainText([
      'Home',
      'Docs',
      'About',
      'List',
    ]);
  });

  test('render docs', async ({ page }) => {
    await page
      .locator('.nav a', {
        hasText: 'Docs',
      })
      .click();

    await expect(page.getByText('DocPage')).toBeVisible();
    await expect(
      page.locator('h1', {
        hasText: 'Marked in the browser',
      }),
    ).toBeVisible();
  });

  test('render about', async ({ page }) => {
    await page.locator('.nav a', { hasText: 'About' }).click();
    await expect(page.locator('h2', { hasText: 'About Page' })).toBeVisible();
  });

  test('render list', async ({ page }) => {
    await page.locator('.nav a', { hasText: 'List' }).click();
    await expect(page.locator('h2', { hasText: 'ListPage' })).toBeVisible();

    // wrapper 是否支持
    await expect(
      page.locator('h2', { hasText: 'Wrapper hello' }),
    ).toBeVisible();
    await expect(page.locator('a', { hasText: 'list foo' })).toBeVisible();
  });
});
