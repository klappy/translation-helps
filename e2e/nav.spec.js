import { test, expect } from '@playwright/test';

test('Nav bar renders and theme toggles', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('svelte-nav-bar');
  const toggle = page.locator('svelte-nav-bar >> button[aria-label="toggle theme"]');
  const html = page.locator('html');
  const initialTheme = await html.getAttribute('data-theme');
  await toggle.click();
  await expect(html).not.toHaveAttribute('data-theme', initialTheme);
});