/**
 * integration.test.js
 * Integration Tests for Simple Verse-Loading Pattern
 * Tests the complete system from URL parsing to panel display
 */

import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the entire loadResourceForType module
vi.mock('./utils/loadResourceForType', () => ({
  loadResourceForType: vi.fn(),
}));

// Mock URL search params globally
const mockURLSearchParams = vi.fn();
global.URLSearchParams = mockURLSearchParams;

// Mock window location
Object.defineProperty(window, 'location', {
  value: {
    search: '',
  },
  writable: true,
});

import { loadResourceForType } from './utils/loadResourceForType';
import { ResourcesProvider, useResourcesContext } from './context/ResourcesContext';
import { ReferenceContext } from './context/ReferenceContext';

describe('Simple Verse-Loading Pattern - Integration Tests', () => {
  // Integration test component that displays loaded resources
  function IntegrationTestApp({ urlParams = '', reference = { bookId: 'tit', chapter: 1, verse: 1 } }) {
    // Set up URL params
    React.useEffect(() => {
      window.location.search = urlParams;
      mockURLSearchParams.mockImplementation(() => {
        const params = new Map();
        if (urlParams.includes('scriptures=')) {
          const match = urlParams.match(/scriptures=([^&]*)/);
          if (match) params.set('scriptures', decodeURIComponent(match[1]));
        }
        if (urlParams.includes('resources=')) {
          const match = urlParams.match(/resources=([^&]*)/);
          if (match) params.set('resources', decodeURIComponent(match[1]));
        }
        return {
          get: (key) => params.get(key) || null,
        };
      });
    }, [urlParams]);

    return (
      <ReferenceContext.Provider value={{ reference }}>
        <ResourcesProvider>
          <ResourceDisplay />
        </ResourcesProvider>
      </ReferenceContext.Provider>
    );
  }

  function ResourceDisplay() {
    const { resources, activateResource } = useResourcesContext();

    return (
      <div>
        <div data-testid="scripture-display">
          {resources.scripture || 'No Scripture'}
        </div>
        <div data-testid="notes-display">
          Notes: {(resources.notes || []).length}
        </div>
        <div data-testid="questions-display">
          Questions: {(resources.questions || []).length}
        </div>
        <div data-testid="words-display">
          Words: {(resources.words || []).length}
        </div>
        <div data-testid="links-display">
          Links: {(resources.links || []).length}
        </div>
        <div data-testid="reference-display">
          {resources.reference?.citation || 'No Reference'}
        </div>
        <button 
          data-testid="activate-words" 
          onClick={() => activateResource('words')}
        >
          Load Words
        </button>
      </div>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    window.location.search = '';
    
    // Setup realistic mock responses
    loadResourceForType.mockImplementation((type, reference, config) => {
      const { organization = 'unfoldingWord', languageId = 'en' } = config || {};
      
      switch (type) {
        case 'scripture':
          return Promise.resolve(`\\c ${reference.chapter}\n\\v ${reference.verse} Mock ${organization} ${languageId} scripture text.`);
        case 'notes':
          return Promise.resolve([
            { 
              id: 1, 
              quote: 'mock', 
              text: `${organization} ${languageId} translation note`, 
              organization, 
              languageId 
            }
          ]);
        case 'questions':
          return Promise.resolve([
            { 
              id: 1, 
              question: `${organization} ${languageId} question?`, 
              answer: 'Mock answer.', 
              organization, 
              languageId 
            }
          ]);
        case 'words':
          return Promise.resolve([
            { 
              id: 1, 
              title: 'Mock Word', 
              content: `${organization} ${languageId} word content`, 
              organization, 
              languageId 
            }
          ]);
        case 'links':
          return Promise.resolve([
            { 
              id: 1, 
              rcLink: 'rc://*/tw/dict/bible/kt/mock', 
              organization, 
              languageId 
            }
          ]);
        default:
          return Promise.resolve(null);
      }
    });
  });

  describe('Default Resource Loading', () => {
    it('loads default resources (scripture, notes, questions) when no URL params', async () => {
      render(<IntegrationTestApp />);

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

      // Verify display
      expect(screen.getByTestId('scripture-display')).toHaveTextContent('Mock unfoldingWord en scripture');
      expect(screen.getByTestId('notes-display')).toHaveTextContent('Notes: 1');
      expect(screen.getByTestId('questions-display')).toHaveTextContent('Questions: 1');
      expect(screen.getByTestId('words-display')).toHaveTextContent('Words: 0');
      expect(screen.getByTestId('reference-display')).toHaveTextContent('tit 1:1');
    });
  });

  describe('URL Parameter Parsing Integration', () => {
    it('parses and loads cross-organization resources from URL', async () => {
      const urlParams = '?scriptures=[/Door43-Catalog/es/ust/mat/5/1]&resources=[/unfoldingWord/en/tn,/wycliffeAssociates/fr/tq]';
      
      render(
        <IntegrationTestApp 
          urlParams={urlParams}
          reference={{ bookId: 'mat', chapter: 5, verse: 1 }}
        />
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

      // Verify cross-organization data displayed
      expect(screen.getByTestId('scripture-display')).toHaveTextContent('Mock Door43-Catalog es scripture');
      expect(screen.getByTestId('notes-display')).toHaveTextContent('Notes: 1');
      expect(screen.getByTestId('questions-display')).toHaveTextContent('Questions: 1');
      expect(screen.getByTestId('reference-display')).toHaveTextContent('mat 5:1');
    });

    it('handles complex URL with all resource types', async () => {
      const urlParams = '?resources=[/unfoldingWord/en/tn,/unfoldingWord/en/tq,/unfoldingWord/en/tw,/unfoldingWord/en/twl]';
      
      render(<IntegrationTestApp urlParams={urlParams} />);

      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith('notes', expect.any(Object), expect.any(Object));
        expect(loadResourceForType).toHaveBeenCalledWith('questions', expect.any(Object), expect.any(Object));
        expect(loadResourceForType).toHaveBeenCalledWith('words', expect.any(Object), expect.any(Object));
        expect(loadResourceForType).toHaveBeenCalledWith('links', expect.any(Object), expect.any(Object));
      });

      // All resource types should be loaded
      expect(screen.getByTestId('notes-display')).toHaveTextContent('Notes: 1');
      expect(screen.getByTestId('questions-display')).toHaveTextContent('Questions: 1');
      expect(screen.getByTestId('words-display')).toHaveTextContent('Words: 1');
      expect(screen.getByTestId('links-display')).toHaveTextContent('Links: 1');
    });
  });

  describe('Self-Activation Integration', () => {
    it('activates additional resources on demand', async () => {
      // Start with minimal resources
      const urlParams = '?resources=[/unfoldingWord/en/tn]';
      
      render(<IntegrationTestApp urlParams={urlParams} />);

      // Wait for initial load
      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith('notes', expect.any(Object), expect.any(Object));
      });

      expect(screen.getByTestId('words-display')).toHaveTextContent('Words: 0');

      // Clear mocks and activate words
      vi.clearAllMocks();
      
      const activateButton = screen.getByTestId('activate-words');
      activateButton.click();

      // Should trigger words loading
      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith('words', expect.any(Object), expect.any(Object));
      });

      expect(screen.getByTestId('words-display')).toHaveTextContent('Words: 1');
    });
  });

  describe('Error Handling Integration', () => {
    it('handles resource loading failures gracefully in complete system', async () => {
      // Mock failures for specific resources
      loadResourceForType.mockImplementation((type) => {
        if (type === 'scripture') {
          return Promise.reject(new Error('Scripture failed'));
        }
        if (type === 'notes') {
          return Promise.resolve([{ id: 1, text: 'Note loaded successfully' }]);
        }
        if (type === 'questions') {
          return Promise.resolve([{ id: 1, question: 'Question loaded?', answer: 'Yes.' }]);
        }
        return Promise.resolve([]);
      });

      render(<IntegrationTestApp />);

      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith('scripture', expect.any(Object), expect.any(Object));
        expect(loadResourceForType).toHaveBeenCalledWith('notes', expect.any(Object), expect.any(Object));
        expect(loadResourceForType).toHaveBeenCalledWith('questions', expect.any(Object), expect.any(Object));
      });

      // Scripture should show fallback, others should work
      expect(screen.getByTestId('scripture-display')).toHaveTextContent('No Scripture');
      expect(screen.getByTestId('notes-display')).toHaveTextContent('Notes: 1');
      expect(screen.getByTestId('questions-display')).toHaveTextContent('Questions: 1');
      expect(screen.getByTestId('reference-display')).toHaveTextContent('tit 1:1');
    });

    it('continues functioning when individual resources fail', async () => {
      // Mock partial failures
      loadResourceForType.mockImplementation((type) => {
        if (type === 'notes') {
          return Promise.reject(new Error('Notes service down'));
        }
        if (type === 'scripture') {
          return Promise.resolve('\\c 1\n\\v 1 Scripture still works');
        }
        if (type === 'questions') {
          return Promise.resolve([{ id: 1, question: 'Still working?', answer: 'Yes!' }]);
        }
        return Promise.resolve([]);
      });

      render(<IntegrationTestApp />);

      await waitFor(() => {
        expect(screen.getByTestId('scripture-display')).toHaveTextContent('Scripture still works');
        expect(screen.getByTestId('questions-display')).toHaveTextContent('Questions: 1');
        expect(screen.getByTestId('notes-display')).toHaveTextContent('Notes: 0');
      });
    });
  });

  describe('Reference Context Integration', () => {
    it('includes reference metadata in resource data', async () => {
      render(
        <IntegrationTestApp 
          reference={{ bookId: 'gen', chapter: 2, verse: 5 }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('reference-display')).toHaveTextContent('gen 2:5');
      });

      // Should pass correct reference to resource loader
      expect(loadResourceForType).toHaveBeenCalledWith(
        'scripture',
        { bookId: 'gen', chapter: 2, verse: 5 },
        expect.any(Object)
      );
    });

    it('reloads resources when reference changes', async () => {
      const { rerender } = render(
        <IntegrationTestApp 
          reference={{ bookId: 'gen', chapter: 1, verse: 1 }}
        />
      );

      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith(
          'scripture',
          { bookId: 'gen', chapter: 1, verse: 1 },
          expect.any(Object)
        );
      });

      // Clear and change reference
      vi.clearAllMocks();
      
      rerender(
        <IntegrationTestApp 
          reference={{ bookId: 'gen', chapter: 1, verse: 2 }}
        />
      );

      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith(
          'scripture',
          { bookId: 'gen', chapter: 1, verse: 2 },
          expect.any(Object)
        );
      });

      expect(screen.getByTestId('reference-display')).toHaveTextContent('gen 1:2');
    });
  });

  describe('Complete Workflow Integration', () => {
    it('demonstrates complete Simple Verse-Loading Pattern workflow', async () => {
      // Test the complete workflow: URL → Parsing → Loading → Display → Self-Activation
      const urlParams = '?scriptures=[/unfoldingWord/en/ult/tit/1/1]&resources=[/Door43-Catalog/en/tn]';
      
      render(<IntegrationTestApp urlParams={urlParams} />);

      // 1. URL parsing and initial loading
      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith(
          'scripture',
          { bookId: 'tit', chapter: 1, verse: 1 },
          { organization: 'unfoldingWord', languageId: 'en', resourceId: 'ult' }
        );
        expect(loadResourceForType).toHaveBeenCalledWith(
          'notes',
          { bookId: 'tit', chapter: 1, verse: 1 },
          { organization: 'Door43-Catalog', languageId: 'en' }
        );
      });

      // 2. Resources displayed correctly
      expect(screen.getByTestId('scripture-display')).toHaveTextContent('Mock unfoldingWord en scripture');
      expect(screen.getByTestId('notes-display')).toHaveTextContent('Notes: 1');
      expect(screen.getByTestId('questions-display')).toHaveTextContent('Questions: 0'); // Not in URL
      expect(screen.getByTestId('reference-display')).toHaveTextContent('tit 1:1');

      // 3. Self-activation of additional resources
      vi.clearAllMocks();
      screen.getByTestId('activate-words').click();

      await waitFor(() => {
        expect(loadResourceForType).toHaveBeenCalledWith(
          'words',
          { bookId: 'tit', chapter: 1, verse: 1 },
          { organization: 'unfoldingWord', languageId: 'en' } // Uses default for self-activated
        );
      });

      expect(screen.getByTestId('words-display')).toHaveTextContent('Words: 1');
    });
  });
}); 