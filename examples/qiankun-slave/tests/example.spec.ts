import { expect, test } from '@playwright/test';

test.describe('QianKun Plugin', () => {
  test('can navigate to slave', async ({ page }) => {
    await page.goto('/home');
    await page.locator('button').click();

    await expect(page.getByText('Slave Home Page')).toBeVisible();
  });

  test('support hooks in slave app', async ({ page }) => {
    await page.goto('/slave/count');

    await expect(page.getByText('slave Count')).toBeVisible();
    await expect(page.getByText('count:0')).toBeVisible();
    await page.locator('button').click();
    await expect(page.getByText('count:1')).toBeVisible();
  });

  test.describe('manual loaded app', () => {
    test('be loaded', async ({ page }) => {
      await page.goto('/manual-slave/home');

      await expect(page.getByText('Slave Home Page')).toBeVisible();
    });

    test('support hooks in slave app', async ({ page }) => {
      await page.goto('/manual-slave/count');

      await expect(page.getByText('count:0')).toBeVisible();
      await page.locator('button').click();
      await expect(page.getByText('count:1')).toBeVisible();
    });
  });

  test.describe('MicroAppLink crossing multi apps', () => {
    test('jump between slave and slave-app2', async ({ page }) => {
      await page.goto('/slave/nav');

      await page.locator('a[href*="hello"]').click();
      await expect(page.getByText('App2 HelloPage')).toBeVisible();

      await page.locator('a[href*="nav"]').click();
      await expect(page.getByText('goto slave app2')).toBeVisible();
    });

    test('slave-app2 to master', async ({ page }) => {
      await page.goto('/animal/ant/hello');
      await page.locator('a[href*="home"]').click();

      await expect(page.getByText('Qiankun Master Page')).toBeVisible();
    });
  });
});
