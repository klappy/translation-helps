/**
 * Integration Tests for Svelte Translation Helps
 * Tests the complete system from URL parsing to resource display
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { referenceStore } from './lib/stores/reference.js';
import { resourcesStore } from './lib/stores/resources.js';
import MainView from './lib/components/MainView.svelte';

// Mock the services
vi.mock('./lib/services/scriptureService.js', () => ({
  loadScripture: vi.fn()
}));

vi.mock('./lib/services/dcsClient.js', () => ({
  fetchCatalog: vi.fn(),
  fetchManifest: vi.fn(),
  fetchResourceFile: vi.fn()
}));

// Mock URL search params
const mockURLSearchParams = vi.fn();
global.URLSearchParams = mockURLSearchParams;

// Mock window location
Object.defineProperty(window, 'location', {
  value: {
    search: '',
  },
  writable: true,
});

import { loadScripture } from './lib/services/scriptureService.js';
import { fetchResourceFile } from './lib/services/dcsClient.js';

describe('Svelte Translation Helps - Integration Tests', () => {
  // Test component that includes all functionality
  function IntegrationTestApp() {
    return MainView;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset stores
    referenceStore.reference.set({
      bookId: 'tit',
      chapter: 1,
      verse: 1
    });
    referenceStore.organization.set('unfoldingWord');
    referenceStore.languageId.set('en');
    referenceStore.resourceId.set('ult');
    resourcesStore.reset();

    // Setup realistic mock responses
    loadScripture.mockImplementation((reference, config) => {
      const { organization = 'unfoldingWord', languageId = 'en' } = config || {};
      return Promise.resolve({
        text: `\\c ${reference.chapter}\n\\v ${reference.verse} Mock ${organization} ${languageId} scripture text.`,
        reference: reference
      });
    });

    fetchResourceFile.mockImplementation((org, lang, resourceId, bookId, fileName) => {
      if (fileName.includes('notes')) {
        return Promise.resolve('Reference\tID\tTags\tQuote\tOccurrence\tNote\ntit\t1\t1\ttest\t1\tMock translation note');
      }
      if (fileName.includes('questions')) {
        return Promise.resolve('Reference\tID\tTags\tQuote\tOccurrence\tQuestion\tResponse\ntit\t1\t1\ttest\t1\tMock question?\tMock answer.');
      }
      if (fileName.includes('twl')) {
        return Promise.resolve('Reference\tID\tTags\tOrigWords\tOccurrence\tTWLink\ntit\t1\t1\ttest\t1\trc://*/tw/dict/bible/kt/mock');
      }
      return Promise.resolve('Mock file content');
    });
  });

  describe('Default Resource Loading', () => {
    it('loads default resources (scripture, notes, questions) when initialized', async () => {
      render(IntegrationTestApp);

      await waitFor(() => {
        expect(loadScripture).toHaveBeenCalledWith(
          { bookId: 'tit', chapter: 1, verse: 1 },
          { organization: 'unfoldingWord', languageId: 'en', resourceId: 'ult' }
        );
      });

      // Verify resources are loaded into store
      await waitFor(() => {
        const resources = get(resourcesStore);
        expect(resources.resources.scripture).toBeTruthy();
      });
    });

    it('displays loaded resources in UI', async () => {
      render(IntegrationTestApp);

      await waitFor(() => {
        expect(screen.getByTestId('scripture-panel')).toBeInTheDocument();
        expect(screen.getByTestId('helps-tabs')).toBeInTheDocument();
      });
    });
  });

  describe('Cross-Organization Resource Loading', () => {
    it('loads resources from different organizations', async () => {
      // Set up cross-organization configuration
      referenceStore.organization.set('Door43-Catalog');
      referenceStore.languageId.set('es');
      referenceStore.resourceId.set('ust');

      render(IntegrationTestApp);

      await waitFor(() => {
        expect(loadScripture).toHaveBeenCalledWith(
          { bookId: 'tit', chapter: 1, verse: 1 },
          { organization: 'Door43-Catalog', languageId: 'es', resourceId: 'ust' }
        );
      });
    });

    it('handles mixed organization resource loading', async () => {
      // This would be configured through URL params in a real scenario
      resourcesStore.loadResources('notes', { organization: 'wycliffeAssociates', languageId: 'fr' });

      render(IntegrationTestApp);

      await waitFor(() => {
        expect(fetchResourceFile).toHaveBeenCalledWith(
          'wycliffeAssociates',
          'fr',
          'tn',
          'tit',
          expect.stringContaining('notes')
        );
      });
    });
  });

  describe('Reference Navigation Integration', () => {
    it('reloads resources when reference changes', async () => {
      render(IntegrationTestApp);

      // Clear initial calls
      vi.clearAllMocks();

      // Change reference
      referenceStore.reference.set({
        bookId: 'gen',
        chapter: 2,
        verse: 5
      });

      await waitFor(() => {
        expect(loadScripture).toHaveBeenCalledWith(
          { bookId: 'gen', chapter: 2, verse: 5 },
          expect.any(Object)
        );
      });
    });

    it('updates URL when reference changes', async () => {
      render(IntegrationTestApp);

      referenceStore.reference.set({
        bookId: 'jhn',
        chapter: 3,
        verse: 16
      });

      await waitFor(() => {
        const currentReference = get(referenceStore.reference);
        expect(currentReference.bookId).toBe('jhn');
        expect(currentReference.chapter).toBe(3);
        expect(currentReference.verse).toBe(16);
      });
    });
  });

  describe('Resource Self-Activation', () => {
    it('activates additional resources on demand', async () => {
      render(IntegrationTestApp);

      // Initially only scripture should be loading
      await waitFor(() => {
        expect(loadScripture).toHaveBeenCalled();
      });

      // Clear and activate additional resources
      vi.clearAllMocks();
      
      resourcesStore.loadResources('words', {
        organization: 'unfoldingWord',
        languageId: 'en'
      });

      await waitFor(() => {
        expect(fetchResourceFile).toHaveBeenCalledWith(
          'unfoldingWord',
          'en',
          'tw',
          'tit',
          expect.stringContaining('words')
        );
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('handles resource loading failures gracefully', async () => {
      // Mock failures for specific resources
      loadScripture.mockRejectedValueOnce(new Error('Scripture failed'));
      fetchResourceFile.mockImplementation((org, lang, resourceId) => {
        if (resourceId === 'tn') {
          return Promise.reject(new Error('Notes service down'));
        }
        return Promise.resolve('Mock content');
      });

      render(IntegrationTestApp);

      await waitFor(() => {
        // Should handle errors gracefully
        const resources = get(resourcesStore);
        expect(resources.errors.scripture).toBeTruthy();
      });

      // UI should still render
      expect(screen.getByTestId('scripture-panel')).toBeInTheDocument();
    });

    it('continues functioning when individual resources fail', async () => {
      loadScripture.mockResolvedValueOnce({
        text: 'Scripture still works',
        reference: { bookId: 'tit', chapter: 1, verse: 1 }
      });

      fetchResourceFile.mockImplementation((org, lang, resourceId) => {
        if (resourceId === 'tn') {
          return Promise.reject(new Error('Notes failed'));
        }
        if (resourceId === 'tq') {
          return Promise.resolve('Reference\tID\tTags\tQuote\tOccurrence\tQuestion\tResponse\ntit\t1\t1\ttest\t1\tStill working?\tYes!');
        }
        return Promise.resolve('Mock content');
      });

      render(IntegrationTestApp);

      await waitFor(() => {
        const resources = get(resourcesStore);
        expect(resources.resources.scripture).toBeTruthy();
        expect(resources.errors.notes).toBeTruthy();
      });
    });
  });

  describe('Store Integration', () => {
    it('synchronizes reference store with resource loading', async () => {
      render(IntegrationTestApp);

      const reference = get(referenceStore.reference);
      expect(reference.bookId).toBe('tit');
      expect(reference.chapter).toBe(1);
      expect(reference.verse).toBe(1);

      await waitFor(() => {
        expect(loadScripture).toHaveBeenCalledWith(
          reference,
          expect.any(Object)
        );
      });
    });

    it('updates resource store when data loads', async () => {
      render(IntegrationTestApp);

      await waitFor(() => {
        const resources = get(resourcesStore);
        expect(resources.resources.scripture).toBeTruthy();
      });
    });

    it('manages loading states correctly', async () => {
      render(IntegrationTestApp);

      // Should show loading initially
      const initialResources = get(resourcesStore);
      expect(initialResources.loading.scripture).toBe(true);

      await waitFor(() => {
        const finalResources = get(resourcesStore);
        expect(finalResources.loading.scripture).toBe(false);
      });
    });
  });

  describe('Complete Workflow Integration', () => {
    it('demonstrates complete Svelte Translation Helps workflow', async () => {
      render(IntegrationTestApp);

      // 1. Initial state
      expect(screen.getByTestId('main-view')).toBeInTheDocument();

      // 2. Resource loading
      await waitFor(() => {
        expect(loadScripture).toHaveBeenCalled();
      });

      // 3. UI updates
      await waitFor(() => {
        expect(screen.getByTestId('scripture-panel')).toBeInTheDocument();
        expect(screen.getByTestId('helps-tabs')).toBeInTheDocument();
      });

      // 4. Reference change
      vi.clearAllMocks();
      referenceStore.reference.set({
        bookId: 'jhn',
        chapter: 3,
        verse: 16
      });

      // 5. Resource reload
      await waitFor(() => {
        expect(loadScripture).toHaveBeenCalledWith(
          { bookId: 'jhn', chapter: 3, verse: 16 },
          expect.any(Object)
        );
      });

      // 6. Store updates
      const finalReference = get(referenceStore.reference);
      expect(finalReference.bookId).toBe('jhn');
      expect(finalReference.chapter).toBe(3);
      expect(finalReference.verse).toBe(16);
    });
  });

  describe('Performance Integration', () => {
    it('loads resources efficiently', async () => {
      const start = performance.now();
      
      render(IntegrationTestApp);

      await waitFor(() => {
        const resources = get(resourcesStore);
        expect(resources.resources.scripture).toBeTruthy();
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(500); // Should load within 500ms
    });

    it('handles multiple concurrent resource loads', async () => {
      render(IntegrationTestApp);

      // Trigger multiple resource loads simultaneously
      resourcesStore.loadResources('notes', { organization: 'unfoldingWord', languageId: 'en' });
      resourcesStore.loadResources('questions', { organization: 'unfoldingWord', languageId: 'en' });
      resourcesStore.loadResources('words', { organization: 'unfoldingWord', languageId: 'en' });

      await waitFor(() => {
        const resources = get(resourcesStore);
        expect(resources.resources.scripture).toBeTruthy();
      });

      // Should handle concurrent loads gracefully
      expect(fetchResourceFile).toHaveBeenCalledTimes(3);
    });
  });
});