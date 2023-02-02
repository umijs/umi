import { expect, test } from '@playwright/test';

test.describe('Detail Test', () => {
  test('render detail ', async ({ page }) => {
    await page.goto('/foo/list/456');
    await expect(page.locator('h3', { hasText: 'List Detail' })).toBeVisible();
    await expect(
      await page.getByText('id: 456', {
        exact: true,
      }),
    ).toBeVisible();
  });
});
