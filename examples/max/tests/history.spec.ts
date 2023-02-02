import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/history');
});

test.describe('Basic Test', () => {
  test.describe('without pathname', () => {
    test('push without pathname', async ({ page }) => {
      await page
        .locator('button', {
          hasText: 'history.push(search)',
        })
        .click();

      await expect(page.getByText('t=push')).toBeVisible();

      await expect(page.url()).toContain('?t=push');
    });

    test('replace without pathname', async ({ page }) => {
      await page
        .locator('button', {
          hasText: 'history.replace(search)',
        })
        .click();

      await expect(page.getByText('t=replace')).toBeVisible();

      await expect(page.url()).toContain('?t=replace');
    });
  });

  test.describe('with pathname and query', () => {
    test('push with pathname', async ({ page }) => {
      await page
        .locator('button', {
          hasText: 'history.push(pathname)',
        })
        .click();

      await expect(page.url()).toContain('?t=push');
      await expect(page.url()).not.toContain('history');
    });

    test('replace with pathname', async ({ page }) => {
      await page
        .locator('button', {
          hasText: 'history.replace(pathname)',
        })
        .click();

      await expect(page.url()).toContain('?t=replace');
      await expect(page.url()).not.toContain('history');
    });
  });
});
