/**
 * HelpsTabs Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import HelpsTabs from './HelpsTabs.svelte';
import { resourcesStore } from '../stores/resources.js';

describe('HelpsTabs', () => {
  beforeEach(() => {
    resourcesStore.reset();
  });

  it('renders with correct test id', () => {
    render(HelpsTabs);
    
    const helpsTabs = screen.getByTestId('helps-tabs');
    expect(helpsTabs).toBeInTheDocument();
  });

  it('displays all tab buttons', () => {
    render(HelpsTabs);
    
    expect(screen.getByText('Translation Notes')).toBeInTheDocument();
    expect(screen.getByText('Translation Questions')).toBeInTheDocument();
    expect(screen.getByText('Translation Words')).toBeInTheDocument();
    expect(screen.getByText('Translation Word Links')).toBeInTheDocument();
  });

  it('shows active tab content', async () => {
    render(HelpsTabs);

    // Mock some translation notes data
    resourcesStore.updateResource('notes', [
      { id: 1, quote: 'test', note: 'This is a test note' }
    ]);

    const notesTab = screen.getByText('Translation Notes');
    await fireEvent.click(notesTab);

    expect(screen.getByText('This is a test note')).toBeInTheDocument();
  });

  it('switches tabs correctly', async () => {
    render(HelpsTabs);

    const questionsTab = screen.getByText('Translation Questions');
    await fireEvent.click(questionsTab);

    expect(questionsTab).toHaveClass('active');
  });

  it('displays loading state for each tab', () => {
    render(HelpsTabs);

    // All tabs should show loading initially
    const loadingElements = screen.getAllByText(/loading/i);
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('handles empty resource states', async () => {
    render(HelpsTabs);

    // Mock empty resources
    resourcesStore.updateResource('notes', []);
    resourcesStore.updateResource('questions', []);
    resourcesStore.updateResource('words', []);
    resourcesStore.updateResource('links', []);

    const notesTab = screen.getByText('Translation Notes');
    await fireEvent.click(notesTab);

    expect(screen.getByText(/No translation notes/i)).toBeInTheDocument();
  });

  it('displays resource counts in tabs', async () => {
    render(HelpsTabs);

    // Mock resources with counts
    resourcesStore.updateResource('notes', [
      { id: 1, note: 'Note 1' },
      { id: 2, note: 'Note 2' }
    ]);

    expect(screen.getByText('Translation Notes (2)')).toBeInTheDocument();
  });

  it('handles error states for resources', async () => {
    render(HelpsTabs);

    resourcesStore.setError('notes', 'Failed to load notes');

    const notesTab = screen.getByText('Translation Notes');
    await fireEvent.click(notesTab);

    expect(screen.getByText(/Failed to load notes/i)).toBeInTheDocument();
  });
});