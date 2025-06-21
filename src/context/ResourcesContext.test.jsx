/**
 * ResourcesContext.test.js
 * Tests for the Simple Verse-Loading Pattern ResourcesContext
 * Follows: docs/SIMPLE-VERSE-LOADING-PATTERN.md
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { ResourcesProvider, useResourcesContext } from './ResourcesContext';
import { ReferenceContext } from './ReferenceContext';

// Mock the resource type dispatcher
vi.mock('../utils/loadResourceForType', () => ({
  loadResourceForType: vi.fn(),
}));

// Mock URL search params
Object.defineProperty(window, 'location', {
  value: {
    search: '',
  },
  writable: true,
});

// Setup URL params mock
const mockURLSearchParams = vi.fn();
global.URLSearchParams = mockURLSearchParams;

// Import mocked dispatcher
import { loadResourceForType } from '../utils/loadResourceForType';

describe('ResourcesContext - Simple Verse-Loading Pattern', () => {
  // Test component to access context
  function TestComponent() {
    const { resources, activateResource } = useResourcesContext();
    
    return (
      <div>
        <div data-testid="resources-data">
          {JSON.stringify({
            hasScripture: !!resources.scripture,
            notesCount: (resources.notes || []).length,
            questionsCount: (resources.questions || []).length,
            wordsCount: (resources.words || []).length,
            linksCount: (resources.links || []).length,
            hasReference: !!resources.reference,
          })}
        </div>
        <button data-testid="activate-notes" onClick={() => activateResource('notes')}>
          Activate Notes
        </button>
        <button data-testid="activate-questions" onClick={() => activateResource('questions')}>
          Activate Questions
        </button>
      </div>
    );
  }

  // Mock ReferenceContext provider
  function MockReferenceProvider({ children, reference = { bookId: 'tit', chapter: 1, verse: 1 } }) {
    return (
      <ReferenceContext.Provider value={{ reference }}>
        {children}
      </ReferenceContext.Provider>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset URL location
    window.location.search = '';
    
    // Setup URL params mock to return empty by default
    mockURLSearchParams.mockImplementation((search) => ({
      get: vi.fn().mockReturnValue(null),
    }));

    // Setup default mock responses for loadResourceForType
    loadResourceForType.mockImplementation((type, reference, config) => {
      switch (type) {
        case 'scripture':
          return Promise.resolve('\\c 1\n\\v 1 Mock scripture text.');
        case 'notes':
          return Promise.resolve([
            { id: 1, quote: 'beginning', text: 'Mock note text', organization: config?.organization || 'unfoldingWord', languageId: config?.languageId || 'en' }
          ]);
        case 'questions':
          return Promise.resolve([
            { id: 1, question: 'Mock question?', answer: 'Mock answer.', organization: config?.organization || 'unfoldingWord', languageId: config?.languageId || 'en' }
          ]);
        case 'words':
          return Promise.resolve([
            { id: 1, title: 'God', content: 'Mock word content', organization: config?.organization || 'unfoldingWord', languageId: config?.languageId || 'en' }
          ]);
        case 'links':
          return Promise.resolve([
            { id: 1, rcLink: 'rc://en/tw/dict/bible/kt/god', organization: config?.organization || 'unfoldingWord', languageId: config?.languageId || 'en' }
          ]);
        default:
          return Promise.resolve(null);
      }
    });
  });

  describe('URL Parameter Parsing', () => {
    it('parses default resources when no URL params provided', async () => {
      // Mock empty URL params
      mockURLSearchParams.mockImplementation(() => ({
        get: vi.fn().mockReturnValue(null),
      }));

      render(
        <MockReferenceProvider>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      // Should load default resources: scripture, notes, questions
      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith(
          'scripture',
          { bookId: 'tit', chapter: 1, verse: 1 },
          { organization: 'unfoldingWord', languageId: 'en', resourceId: 'ult' }
        );
        expect(loadResourceForType).toHaveBeenCalledWith(
          'notes',
          { bookId: 'tit', chapter: 1, verse: 1 },
          { organization: 'unfoldingWord', languageId: 'en' }
        );
        expect(loadResourceForType).toHaveBeenCalledWith(
          'questions',
          { bookId: 'tit', chapter: 1, verse: 1 },
          { organization: 'unfoldingWord', languageId: 'en' }
        );
      });
    });

    it('parses scripture parameter from URL', async () => {
      // Mock URL with scriptures parameter
      mockURLSearchParams.mockImplementation(() => ({
        get: vi.fn().mockImplementation((param) => {
          if (param === 'scriptures') return '[/Door43-Catalog/en/ult/tit/1/1]';
          return null;
        }),
      }));

      render(
        <MockReferenceProvider>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith(
          'scripture',
          { bookId: 'tit', chapter: 1, verse: 1 },
          { organization: 'Door43-Catalog', languageId: 'en', resourceId: 'ult' }
        );
      });
    });

    it('parses resources parameter from URL', async () => {
      // Mock URL with resources parameter
      mockURLSearchParams.mockImplementation(() => ({
        get: vi.fn().mockImplementation((param) => {
          if (param === 'resources') return '[/unfoldingWord/en/tn,/Door43-Catalog/en/tq]';
          return null;
        }),
      }));

      render(
        <MockReferenceProvider>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith(
          'notes',
          { bookId: 'tit', chapter: 1, verse: 1 },
          { organization: 'unfoldingWord', languageId: 'en' }
        );
        expect(loadResourceForType).toHaveBeenCalledWith(
          'questions',
          { bookId: 'tit', chapter: 1, verse: 1 },
          { organization: 'Door43-Catalog', languageId: 'en' }
        );
      });
    });

    it('maps URL resource types to internal types', async () => {
      // Mock URL with all resource types
      mockURLSearchParams.mockImplementation(() => ({
        get: vi.fn().mockImplementation((param) => {
          if (param === 'resources') return '[/unfoldingWord/en/tn,/unfoldingWord/en/tq,/unfoldingWord/en/tw,/unfoldingWord/en/twl]';
          return null;
        }),
      }));

      render(
        <MockReferenceProvider>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith('notes', expect.any(Object), expect.any(Object));
        expect(loadResourceForType).toHaveBeenCalledWith('questions', expect.any(Object), expect.any(Object));
        expect(loadResourceForType).toHaveBeenCalledWith('words', expect.any(Object), expect.any(Object));
        expect(loadResourceForType).toHaveBeenCalledWith('links', expect.any(Object), expect.any(Object));
      });
    });
  });

  describe('Self-Activation Pattern', () => {
    it('allows panels to activate additional resources', async () => {
      const { getByTestId } = render(
        <MockReferenceProvider>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      // Wait for initial resources to load
      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalled();
      });

      // Clear previous calls
      vi.clearAllMocks();

      // Activate words resource
      act(() => {
        getByTestId('activate-notes').click();
      });

      // Should not trigger duplicate loading (already active)
      expect(loadResourceForType).not.toHaveBeenCalled();

      // Activate new resource type
      act(() => {
        getByTestId('activate-questions').click();
      });

      // Should trigger loading for new resource (if not already active)
      // Note: questions is already active in default, so this tests the mechanism
    });

    it('loads new resources when activated', async () => {
      // Start with minimal resources
      mockURLSearchParams.mockImplementation(() => ({
        get: vi.fn().mockImplementation((param) => {
          if (param === 'resources') return '[/unfoldingWord/en/tn]'; // Only notes
          return null;
        }),
      }));

      const { getByTestId } = render(
        <MockReferenceProvider>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith('notes', expect.any(Object), expect.any(Object));
      });

      // Clear and activate questions
      vi.clearAllMocks();
      
      act(() => {
        getByTestId('activate-questions').click();
      });

      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith('questions', expect.any(Object), expect.any(Object));
      });
    });
  });

  describe('Resource Data Structure', () => {
    it('provides resources in correct format', async () => {
      const { getByTestId } = render(
        <MockReferenceProvider>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        const resourcesData = JSON.parse(getByTestId('resources-data').textContent);
        expect(resourcesData).toEqual({
          hasScripture: true,
          notesCount: 1,
          questionsCount: 1,
          wordsCount: 0, // Not activated by default
          linksCount: 0, // Not activated by default
          hasReference: true,
        });
      });
    });

    it('includes reference metadata', async () => {
      let capturedContext;
      
      function CaptureContext() {
        capturedContext = useResourcesContext();
        return null;
      }

      render(
        <MockReferenceProvider reference={{ bookId: 'gen', chapter: 2, verse: 3 }}>
          <ResourcesProvider>
            <CaptureContext />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        expect(capturedContext.resources.reference).toEqual({
          bookId: 'gen',
          chapter: 2,
          verse: 3,
          citation: 'gen 2:3',
        });
      });
    });
  });

  describe('Cross-Organization Support', () => {
    it('passes correct organization config to resource loader', async () => {
      mockURLSearchParams.mockImplementation(() => ({
        get: vi.fn().mockImplementation((param) => {
          if (param === 'scriptures') return '[/Door43-Catalog/es/ust/mat/5/1]';
          if (param === 'resources') return '[/unfoldingWord/en/tn,/wycliffeAssociates/fr/tq]';
          return null;
        }),
      }));

      render(
        <MockReferenceProvider reference={{ bookId: 'mat', chapter: 5, verse: 1 }}>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith(
          'scripture',
          { bookId: 'mat', chapter: 5, verse: 1 },
          { organization: 'Door43-Catalog', languageId: 'es', resourceId: 'ust' }
        );
        expect(loadResourceForType).toHaveBeenCalledWith(
          'notes',
          { bookId: 'mat', chapter: 5, verse: 1 },
          { organization: 'unfoldingWord', languageId: 'en' }
        );
        expect(loadResourceForType).toHaveBeenCalledWith(
          'questions',
          { bookId: 'mat', chapter: 5, verse: 1 },
          { organization: 'wycliffeAssociates', languageId: 'fr' }
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('handles resource loading failures gracefully', async () => {
      // Mock loadResourceForType to fail for notes
      loadResourceForType.mockImplementation((type) => {
        if (type === 'notes') {
          return Promise.reject(new Error('Notes loading failed'));
        }
        if (type === 'scripture') {
          return Promise.resolve('\\c 1\n\\v 1 Mock scripture text.');
        }
        if (type === 'questions') {
          return Promise.resolve([{ id: 1, question: 'Mock question?', answer: 'Mock answer.' }]);
        }
        return Promise.resolve(null);
      });

      const { getByTestId } = render(
        <MockReferenceProvider>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        const resourcesData = JSON.parse(getByTestId('resources-data').textContent);
        // Scripture and questions should still load
        expect(resourcesData.hasScripture).toBe(true);
        expect(resourcesData.questionsCount).toBe(1);
        // Notes should be empty due to error
        expect(resourcesData.notesCount).toBe(0);
      });
    });

    it('continues loading other resources when one fails', async () => {
      loadResourceForType.mockImplementation((type) => {
        if (type === 'scripture') {
          return Promise.reject(new Error('Scripture failed'));
        }
        if (type === 'notes') {
          return Promise.resolve([{ id: 1, text: 'Mock note' }]);
        }
        return Promise.resolve([]);
      });

      render(
        <MockReferenceProvider>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith('scripture', expect.any(Object), expect.any(Object));
        expect(loadResourceForType).toHaveBeenCalledWith('notes', expect.any(Object), expect.any(Object));
        expect(loadResourceForType).toHaveBeenCalledWith('questions', expect.any(Object), expect.any(Object));
      });
    });
  });

  describe('Reference Changes', () => {
    it('reloads resources when reference changes', async () => {
      const { rerender } = render(
        <MockReferenceProvider reference={{ bookId: 'gen', chapter: 1, verse: 1 }}>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith(
          'scripture',
          { bookId: 'gen', chapter: 1, verse: 1 },
          expect.any(Object)
        );
      });

      vi.clearAllMocks();

      rerender(
        <MockReferenceProvider reference={{ bookId: 'gen', chapter: 1, verse: 2 }}>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith(
          'scripture',
          { bookId: 'gen', chapter: 1, verse: 2 },
          expect.any(Object)
        );
      });
    });

    it('skips loading when reference is incomplete', async () => {
      render(
        <MockReferenceProvider reference={{ bookId: null, chapter: null, verse: null }}>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      // Should not load anything with incomplete reference
      expect(loadResourceForType).not.toHaveBeenCalled();
    });
  });
});