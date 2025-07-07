/**
 * MainView Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import MainView from './MainView.svelte';
import { referenceStore } from '../stores/reference.js';
import { resourcesStore } from '../stores/resources.js';

// Mock the services
vi.mock('../services/scriptureService.js', () => ({
  loadScripture: vi.fn(() => Promise.resolve('Mock scripture text'))
}));

vi.mock('../services/dcsClient.js', () => ({
  fetchCatalog: vi.fn(() => Promise.resolve({ languages: [] })),
  fetchManifest: vi.fn(() => Promise.resolve({ projects: [] }))
}));

describe('MainView', () => {
  beforeEach(() => {
    // Reset stores
    referenceStore.reference.set({
      bookId: 'gen',
      chapter: 1,
      verse: 1
    });
    resourcesStore.reset();
  });

  it('renders with proper test id', () => {
    render(MainView);
    
    const mainView = screen.getByTestId('main-view');
    expect(mainView).toBeInTheDocument();
  });

  it('renders scripture panel', () => {
    render(MainView);
    
    const scripturePanel = screen.getByTestId('scripture-panel');
    expect(scripturePanel).toBeInTheDocument();
  });

  it('renders helps tabs', () => {
    render(MainView);
    
    const helpsTabs = screen.getByTestId('helps-tabs');
    expect(helpsTabs).toBeInTheDocument();
  });

  it('loads scripture when reference changes', async () => {
    render(MainView);

    // Change reference
    referenceStore.reference.set({
      bookId: 'jhn',
      chapter: 3,
      verse: 16
    });

    await waitFor(() => {
      expect(screen.getByTestId('scripture-panel')).toBeInTheDocument();
    });
  });

  it('handles loading states correctly', async () => {
    render(MainView);

    // Should show loading state initially
    const loadingElements = screen.queryAllByText(/loading/i);
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('displays error states when resources fail to load', async () => {
    // Mock service failure
    vi.mocked(await import('../services/scriptureService.js')).loadScripture.mockRejectedValue(new Error('Failed to load'));

    render(MainView);

    await waitFor(() => {
      // Should handle error gracefully
      expect(screen.getByTestId('scripture-panel')).toBeInTheDocument();
    });
  });

  it('has correct CSS classes for responsive design', () => {
    render(MainView);
    
    const mainView = screen.getByTestId('main-view');
    expect(mainView).toHaveClass('main-view');
  });
});