import { test, expect } from '@playwright/test';

test('Svelte greeter component renders and increments', async ({ page }) => {
  await page.goto('/svelte');
  // Wait for custom element to be defined
  await page.waitForSelector('svelte-greeter');
  const button = await page.locator('svelte-greeter >> role=button');
  await expect(button).toHaveText(/Clicked 0 times/i);
  await button.click();
  await expect(button).toHaveText(/Clicked 1 times/i);
});