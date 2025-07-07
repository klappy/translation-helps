import { test, expect } from '@playwright/test';

test('Landing page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(/translation helps/i);
  await expect(page.locator('a.cta')).toHaveAttribute('href', '/showcase');
});