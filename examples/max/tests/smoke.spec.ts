import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Basic Test', () => {
  test('display page normallly', async ({ page }) => {
    // 页面正常渲染
    await expect(page.getByText('index page')).toBeVisible();

    // antd 组件存在
    await expect(
      page.locator('button', {
        hasText: 'Button',
      }),
    ).toBeVisible();
    await expect(page.locator('input.ant-input')).toHaveAttribute(
      'type',
      'text',
    );
    await expect(page.locator('div.ant-picker').locator('input')).toBeVisible();
  });

  test('use pro-layout and render menus', async ({ page }) => {
    // 保证国际化是英文
    await page.click('.ant-dropdown-trigger i.anticon');
    await page.getByText('English').click();
    // layout 存在
    await expect(page.getByText('Ant Design Pro')).toBeVisible();

    await expect(page.locator('li.ant-pro-base-menu-menu-item')).toContainText([
      'Index',
      'users',
      'app1',
    ]);
    await expect(page.locator('li.ant-pro-base-menu-submenu')).toContainText(
      'data-flow',
    );
  });

  test('render sub-menu', async ({ page }) => {
    // 保证国际化是英文
    await page.click('.ant-dropdown-trigger i.anticon');
    await page.getByText('English').click();

    const submenu = await page.locator('li.ant-pro-base-menu-submenu');
    await expect(submenu).toContainText('data-flow');
    await submenu.click();

    await expect(page.locator('li.ant-pro-base-menu-menu-item')).toContainText([
      'use-model',
      'dva',
    ]);
  });

  test('can change local', async ({ page }) => {
    await page.locator('.ant-dropdown-trigger i.anticon').click();

    await page.getByText('简体中文').click();
    await expect(page.locator('li.ant-pro-base-menu-menu-item')).toContainText([
      '首页',
    ]);
  });

  test('tailwind css', async ({ page }) => {
    await expect(page.locator('[data-testid="tailwind-header"]')).toHaveCSS(
      'color',
      'rgb(136, 19, 55)',
    );
  });
});
