import { expect, test } from '@playwright/test';
// @ts-ignore
import crossSpawn from '@umijs/utils/compiled/cross-spawn';
// @ts-ignore
// @ts-ignore

test.describe('Basic Test', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      page.waitForResponse((res) => {
        return (
          res.request().method() === 'GET' &&
          res.url().includes('/mf-va_remoteEntry.js')
        );
      }),
      page.goto('/'),
    ]);
  });

  test.afterEach(async () => {
    crossSpawn('git', ['checkout', 'src/utils/format.ts'], {
      stdio: 'inherit',
    });
  });

  test('display mfsu is working', async ({ page }) => {
    await expect(page.getByText('MFSU is working')).toBeVisible();
  });

  test('display mfsu working after rebuild', async ({ page }) => {
    await expect(page.getByText('MFSU is working')).toBeVisible();

    crossSpawn('cp', ['-r', 'src/utils/format.ts.txt', 'src/utils/format.ts'], {
      stdio: 'inherit',
    });

    await Promise.all([
      page.waitForFunction(async () => {
        return document.querySelector('h2')?.textContent === 'MFSU IS WORKING';
      }),
      page.reload(),
    ]);
  });
});
