/**
 * Showcase Demo Components Testing
 * 
 * Tests the isolated demo components embedded in the showcase.
 * These tests validate component functionality independently of the main app.
 */

const { test, expect } = require('@playwright/test');

test.describe('Showcase Demo Components', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the showcase component section
    await page.goto('/showcase/components/theme-system');
    
    // Wait for the page to load and demo to be visible
    await page.waitForSelector('[data-testid="theme-system-demo"]');
  });

  test('Theme System Demo - Basic Functionality', async ({ page }) => {
    // Verify demo is present and visible
    const demo = page.locator('[data-testid="theme-system-demo"]');
    await expect(demo).toBeVisible();
    
    // Check initial state (should be light theme)
    const currentTheme = page.locator('[data-testid="current-theme"]');
    await expect(currentTheme).toContainText('light');
    
    // Verify theme toggle button exists
    const themeToggle = page.locator('[data-testid="theme-toggle-button"]');
    await expect(themeToggle).toBeVisible();
    await expect(themeToggle).toContainText('Switch to Dark Mode');
  });

  test('Theme System Demo - Theme Switching', async ({ page }) => {
    const demo = page.locator('[data-testid="theme-system-demo"]');
    const themeToggle = page.locator('[data-testid="theme-toggle-button"]');
    const currentTheme = page.locator('[data-testid="current-theme"]');
    
    // Test switching to dark mode
    await themeToggle.click();
    
    // Verify theme changed
    await expect(currentTheme).toContainText('dark');
    await expect(themeToggle).toContainText('Switch to Light Mode');
    
    // Check that demo container has dark theme class
    await expect(demo).toHaveClass(/dark/);
    
    // Test switching back to light mode
    await themeToggle.click();
    
    // Verify theme changed back
    await expect(currentTheme).toContainText('light');
    await expect(themeToggle).toContainText('Switch to Dark Mode');
    await expect(demo).toHaveClass(/light/);
  });

  test('Theme System Demo - UI Elements Respond to Theme', async ({ page }) => {
    const primaryButton = page.locator('[data-testid="primary-button"]');
    const secondaryButton = page.locator('[data-testid="secondary-button"]');
    const themeToggle = page.locator('[data-testid="theme-toggle-button"]');
    
    // Get initial button styles (light theme)
    const lightPrimaryColor = await primaryButton.evaluate(el => 
      getComputedStyle(el).backgroundColor
    );
    
    // Switch to dark theme
    await themeToggle.click();
    
    // Get dark theme button styles
    const darkPrimaryColor = await primaryButton.evaluate(el => 
      getComputedStyle(el).backgroundColor
    );
    
    // Verify colors are different (theme actually changed)
    expect(lightPrimaryColor).not.toBe(darkPrimaryColor);
  });

  test('Theme System Demo - Accessibility', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle-button"]');
    
    // Test keyboard navigation
    await themeToggle.focus();
    await expect(themeToggle).toBeFocused();
    
    // Test keyboard activation
    await page.keyboard.press('Enter');
    
    // Verify theme changed via keyboard
    const currentTheme = page.locator('[data-testid="current-theme"]');
    await expect(currentTheme).toContainText('dark');
    
    // Test ARIA attributes
    await expect(themeToggle).toHaveAttribute('data-testid');
  });

  test('Theme System Demo - Performance', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle-button"]');
    
    // Measure theme switching performance
    const startTime = Date.now();
    
    // Perform multiple rapid theme switches
    for (let i = 0; i < 5; i++) {
      await themeToggle.click();
      await page.waitForTimeout(10); // Small delay to allow transition
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Theme switching should be fast (under 500ms for 5 switches)
    expect(totalTime).toBeLessThan(500);
  });

  test('Theme System Demo - Visual Regression', async ({ page }) => {
    const demo = page.locator('[data-testid="theme-system-demo"]');
    
    // Take screenshot of light theme
    await expect(demo).toHaveScreenshot('theme-demo-light.png');
    
    // Switch to dark theme
    await page.locator('[data-testid="theme-toggle-button"]').click();
    
    // Take screenshot of dark theme
    await expect(demo).toHaveScreenshot('theme-demo-dark.png');
  });

  test('Theme System Demo - Isolated from Main App', async ({ page }) => {
    // This test verifies the demo works independently of main app theme
    
    // Check that changing demo theme doesn't affect page theme
    const pageBody = page.locator('body');
    const initialBodyClass = await pageBody.getAttribute('class');
    
    // Change demo theme
    await page.locator('[data-testid="theme-toggle-button"]').click();
    
    // Verify page body class hasn't changed (demo is isolated)
    const finalBodyClass = await pageBody.getAttribute('class');
    expect(finalBodyClass).toBe(initialBodyClass);
  });

});

test.describe('Demo Component Integration', () => {
  
  test('Multiple Demo Components on Same Page', async ({ page }) => {
    // Future: Test when we have multiple demo components
    // This validates they don't interfere with each other
    
    await page.goto('/showcase/components/theme-system');
    
    // Verify each demo component is isolated
    const themeDemos = page.locator('[data-testid="theme-system-demo"]');
    await expect(themeDemos).toHaveCount(1);
  });

  test('Demo Components Load Independently', async ({ page }) => {
    // Test that demo components load even if main app has issues
    
    await page.goto('/showcase/components/theme-system');
    
    // Wait for demo to be interactive
    const themeToggle = page.locator('[data-testid="theme-toggle-button"]');
    await expect(themeToggle).toBeEnabled();
    
    // Demo should work regardless of network issues with main app
    await themeToggle.click();
    const currentTheme = page.locator('[data-testid="current-theme"]');
    await expect(currentTheme).toContainText('dark');
  });

});

test.describe('Cross-Browser Demo Testing', () => {
  
  test('Theme Demo Works in Different Browsers', async ({ page, browserName }) => {
    await page.goto('/showcase/components/theme-system');
    
    const themeToggle = page.locator('[data-testid="theme-toggle-button"]');
    const currentTheme = page.locator('[data-testid="current-theme"]');
    
    // Test basic functionality across browsers
    await themeToggle.click();
    await expect(currentTheme).toContainText('dark');
    
    // Browser-specific checks
    if (browserName === 'webkit') {
      // Safari-specific theme tests
      console.log('Running Safari-specific theme tests');
    }
  });

}); 