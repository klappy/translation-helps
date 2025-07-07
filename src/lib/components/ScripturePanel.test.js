/**
 * ScripturePanel Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import ScripturePanel from './ScripturePanel.svelte';
import { referenceStore } from '../stores/reference.js';
import { resourcesStore } from '../stores/resources.js';

describe('ScripturePanel', () => {
  beforeEach(() => {
    // Reset stores
    referenceStore.reference.set({
      bookId: 'gen',
      chapter: 1,
      verse: 1
    });
    resourcesStore.reset();
  });

  it('renders with correct test id', () => {
    render(ScripturePanel);
    
    const panel = screen.getByTestId('scripture-panel');
    expect(panel).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(ScripturePanel);
    
    const loadingText = screen.getByText(/loading/i);
    expect(loadingText).toBeInTheDocument();
  });

  it('displays scripture text when loaded', async () => {
    render(ScripturePanel);

    // Mock scripture data
    resourcesStore.updateResource('scripture', {
      text: 'In the beginning God created the heavens and the earth.',
      reference: { bookId: 'gen', chapter: 1, verse: 1 }
    });

    await waitFor(() => {
      const scriptureText = screen.getByText(/In the beginning God created/);
      expect(scriptureText).toBeInTheDocument();
    });
  });

  it('displays error message when scripture fails to load', async () => {
    render(ScripturePanel);

    // Mock error state
    resourcesStore.setError('scripture', 'Failed to load scripture');

    await waitFor(() => {
      const errorText = screen.getByText(/Failed to load scripture/);
      expect(errorText).toBeInTheDocument();
    });
  });

  it('displays reference information correctly', async () => {
    render(ScripturePanel);

    await waitFor(() => {
      const referenceText = screen.getByText(/GEN 1:1/);
      expect(referenceText).toBeInTheDocument();
    });
  });

  it('handles verse highlighting correctly', async () => {
    render(ScripturePanel);

    resourcesStore.updateResource('scripture', {
      text: 'In the beginning God created the heavens and the earth.',
      reference: { bookId: 'gen', chapter: 1, verse: 1 }
    });

    await waitFor(() => {
      const verseElement = screen.getByTestId('verse-1');
      expect(verseElement).toBeInTheDocument();
    });
  });

  it('has correct CSS classes for styling', () => {
    render(ScripturePanel);
    
    const panel = screen.getByTestId('scripture-panel');
    expect(panel).toHaveClass('scripture-panel');
  });
});