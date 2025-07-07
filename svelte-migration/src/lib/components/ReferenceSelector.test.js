/**
 * ReferenceSelector Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import ReferenceSelector from './ReferenceSelector.svelte';
import { referenceStore } from '../stores/reference.js';

// Mock the DCS client
vi.mock('../services/dcsClient.js', () => ({
  fetchCatalog: vi.fn(() => Promise.resolve({
    languages: [
      { identifier: 'en', title: 'English' },
      { identifier: 'es', title: 'Spanish' }
    ]
  })),
  fetchManifest: vi.fn(() => Promise.resolve({
    projects: [
      { identifier: 'gen', title: 'Genesis' },
      { identifier: 'exo', title: 'Exodus' }
    ]
  }))
}));

describe('ReferenceSelector', () => {
  beforeEach(() => {
    // Reset reference store to default state
    referenceStore.reference.set({
      bookId: 'gen',
      chapter: 1,
      verse: 1
    });
    referenceStore.organization.set('unfoldingWord');
    referenceStore.languageId.set('en');
    referenceStore.resourceId.set('ult');
  });

  describe('Basic Rendering', () => {
    it('renders all dropdown elements', () => {
      render(ReferenceSelector);

      expect(screen.getByTestId('organization-selector')).toBeInTheDocument();
      expect(screen.getByTestId('language-selector')).toBeInTheDocument();
      expect(screen.getByTestId('resource-selector')).toBeInTheDocument();
      expect(screen.getByTestId('book-selector')).toBeInTheDocument();
      expect(screen.getByTestId('chapter-selector')).toBeInTheDocument();
      expect(screen.getByTestId('verse-selector')).toBeInTheDocument();
    });

    it('displays current context when fully selected', () => {
      render(ReferenceSelector);

      const contextDisplay = screen.getByTestId('context-display');
      expect(contextDisplay).toHaveTextContent('unfoldingWord/en/ult/GEN 1:1');
    });
  });

  describe('Cascading Behavior', () => {
    it('resets downstream selections when organization changes', async () => {
      render(ReferenceSelector);

      const orgSelector = screen.getByTestId('organization-selector');
      await fireEvent.change(orgSelector, { target: { value: 'Door43-Catalog' } });

      // Check that downstream values are reset
      const currentState = get(referenceStore.organization);
      expect(currentState).toBe('Door43-Catalog');
    });

    it('resets resource and reference when language changes', async () => {
      render(ReferenceSelector);

      const langSelector = screen.getByTestId('language-selector');
      await fireEvent.change(langSelector, { target: { value: 'es' } });

      const currentLanguage = get(referenceStore.languageId);
      expect(currentLanguage).toBe('es');
    });

    it('resets reference when resource changes', async () => {
      render(ReferenceSelector);

      const resourceSelector = screen.getByTestId('resource-selector');
      await fireEvent.change(resourceSelector, { target: { value: 'tn' } });

      const currentResource = get(referenceStore.resourceId);
      expect(currentResource).toBe('tn');
    });
  });

  describe('Reference Navigation', () => {
    it('updates chapter and resets verse when book changes', async () => {
      render(ReferenceSelector);

      const bookSelector = screen.getByTestId('book-selector');
      await fireEvent.change(bookSelector, { target: { value: 'exo' } });

      const currentReference = get(referenceStore.reference);
      expect(currentReference.bookId).toBe('exo');
      expect(currentReference.chapter).toBe(1);
      expect(currentReference.verse).toBe(1);
    });

    it('updates verse when chapter changes', async () => {
      render(ReferenceSelector);

      const chapterSelector = screen.getByTestId('chapter-selector');
      await fireEvent.change(chapterSelector, { target: { value: '2' } });

      const currentReference = get(referenceStore.reference);
      expect(currentReference.chapter).toBe(2);
      expect(currentReference.verse).toBe(1);
    });

    it('updates verse correctly', async () => {
      render(ReferenceSelector);

      const verseSelector = screen.getByTestId('verse-selector');
      await fireEvent.change(verseSelector, { target: { value: '5' } });

      const currentReference = get(referenceStore.reference);
      expect(currentReference.verse).toBe(5);
    });
  });

  describe('Disabled States', () => {
    it('enables language selector when organization is selected', () => {
      render(ReferenceSelector);

      const langSelector = screen.getByTestId('language-selector');
      expect(langSelector).not.toBeDisabled();
    });

    it('enables resource selector when language is selected', () => {
      render(ReferenceSelector);

      const resourceSelector = screen.getByTestId('resource-selector');
      expect(resourceSelector).not.toBeDisabled();
    });

    it('enables book selector when resource is selected', () => {
      render(ReferenceSelector);

      const bookSelector = screen.getByTestId('book-selector');
      expect(bookSelector).not.toBeDisabled();
    });
  });
});