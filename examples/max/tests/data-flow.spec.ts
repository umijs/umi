import { expect, test } from '@playwright/test';

test.describe('data-flow', () => {
  test.describe('dva', () => {
    test.beforeEach(async ({ page }) => {
      await Promise.all([
        page.waitForResponse(/dva\.async\.js$/),
        page.goto('/data-flow/dva'),
      ]);
    });

    test('run count model', async ({ page }) => {
      await expect(page.getByText('count: 0')).toBeVisible();

      await page
        .locator('button', {
          hasText: '+',
        })
        .click();

      await expect(page.getByText('count: 1')).toBeVisible();
    });
  });

  test.describe('use-model', () => {
    test.beforeEach(async ({ page }) => {
      await Promise.all([
        page.waitForResponse(/use-model\.async\.js$/),
        page.goto('/data-flow/use-model'),
      ]);
    });

    test('render data from use-model', async ({ page }) => {
      await expect(page.locator('.ant-layout-content li')).toContainText([
        'foo',
        'bar',
      ]);
    });
  });
});
