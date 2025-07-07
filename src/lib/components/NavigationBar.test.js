/**
 * NavigationBar Component Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import NavigationBar from './NavigationBar.svelte';

describe('NavigationBar', () => {
  beforeEach(() => {
    // Reset any global state if needed
  });

  it('renders the ETEN Innovation Lab logo', () => {
    render(NavigationBar);
    
    const logo = screen.getByAltText('ETEN Innovation Lab');
    expect(logo).toBeInTheDocument();
  });

  it('renders the theme toggle button', () => {
    render(NavigationBar);
    
    const themeToggle = screen.getByRole('button');
    expect(themeToggle).toBeInTheDocument();
  });

  it('renders the reference selector', () => {
    render(NavigationBar);
    
    // Check for reference selector elements
    const organizationSelect = screen.getByTestId('organization-selector');
    const languageSelect = screen.getByTestId('language-selector');
    const resourceSelect = screen.getByTestId('resource-selector');
    
    expect(organizationSelect).toBeInTheDocument();
    expect(languageSelect).toBeInTheDocument();
    expect(resourceSelect).toBeInTheDocument();
  });

  it('has correct responsive classes', () => {
    render(NavigationBar);
    
    const navbar = screen.getByRole('banner');
    expect(navbar).toHaveClass('navigation-bar');
  });

  it('displays correct branding structure', () => {
    render(NavigationBar);
    
    const brandSection = screen.getByRole('banner');
    expect(brandSection).toContainElement(screen.getByAltText('ETEN Innovation Lab'));
    expect(brandSection).toContainElement(screen.getByText('Translation Helps'));
  });
});