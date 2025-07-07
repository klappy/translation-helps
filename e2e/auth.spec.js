import { test, expect } from '@playwright/test';

test('Auth form inputs accept values', async ({ page }) => {
  await page.goto('/auth');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'secret');
  await expect(page.locator('input[type="email"]')).toHaveValue('test@example.com');
});