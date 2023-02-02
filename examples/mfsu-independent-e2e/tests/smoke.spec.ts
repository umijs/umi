import { expect, test } from '@playwright/test';

test.describe('MFSU independent', () => {
  test('dev normal display', async ({ page }) => {
    await page.goto('/');

    const counterLocator = page.locator('[data-testid="mf-counter"]');
    await expect(counterLocator).toHaveAttribute('value', '0');
    await page.locator('[data-testid="mf-button"]').click();
    await expect(counterLocator).toHaveAttribute('value', '1');
  });

  test('navigate to another pages', async ({ page }) => {
    await page.goto('/pageTwo.html'); // relative entry
    await page.goto('/pageThree.html'); // full path entry
  });
});
