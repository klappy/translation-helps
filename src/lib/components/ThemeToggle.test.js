/**
 * ThemeToggle Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import ThemeToggle from './ThemeToggle.svelte';
import { themeStore } from '../stores/theme.js';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Reset theme to default
    themeStore.set('light');
  });

  it('renders toggle button', () => {
    render(ThemeToggle);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });

  it('displays correct icon for light theme', () => {
    render(ThemeToggle);
    
    const moonIcon = screen.getByLabelText(/dark mode/i);
    expect(moonIcon).toBeInTheDocument();
  });

  it('displays correct icon for dark theme', () => {
    themeStore.set('dark');
    render(ThemeToggle);
    
    const sunIcon = screen.getByLabelText(/light mode/i);
    expect(sunIcon).toBeInTheDocument();
  });

  it('toggles theme when clicked', async () => {
    render(ThemeToggle);
    
    const toggleButton = screen.getByRole('button');
    await fireEvent.click(toggleButton);
    
    const currentTheme = get(themeStore);
    expect(currentTheme).toBe('dark');
  });

  it('toggles back to light theme', async () => {
    themeStore.set('dark');
    render(ThemeToggle);
    
    const toggleButton = screen.getByRole('button');
    await fireEvent.click(toggleButton);
    
    const currentTheme = get(themeStore);
    expect(currentTheme).toBe('light');
  });

  it('has correct accessibility attributes', () => {
    render(ThemeToggle);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAttribute('aria-label');
    expect(toggleButton).toHaveAttribute('title');
  });

  it('applies theme to document root', () => {
    render(ThemeToggle);
    
    // Should apply theme class to document
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('has correct CSS classes', () => {
    render(ThemeToggle);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveClass('theme-toggle');
  });
});