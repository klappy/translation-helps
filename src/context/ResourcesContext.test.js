/**
 * ResourcesContext.test.js
 * Tests for the enhanced ResourcesContext with cross-organization support
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ResourcesProvider, useResourcesContext } from './ResourcesContext';
import { ReferenceContext } from './ReferenceContext';

// Mock the services
vi.mock('../services/scriptureService', () => ({
  fetchBook: vi.fn(),
}));

vi.mock('../services/tnService', () => ({
  getNotesForVerse: vi.fn(),
}));

vi.mock('../services/tqService', () => ({
  getQuestionsForVerse: vi.fn(),
}));

vi.mock('../services/twService', () => ({
  getArticlesForLinks: vi.fn(),
}));

vi.mock('../services/twlService', () => ({
  getLinksForVerse: vi.fn(),
}));

vi.mock('../services/dcsClient', () => ({
  fetchManifest: vi.fn(),
}));

vi.mock('../components/ScripturePanelRCL/USFMSemanticParser.js', () => ({
  USFMSemanticParser: vi.fn().mockImplementation(() => ({
    parse: vi.fn(),
    chapters: {
      '1': {
        '1': 'Mock verse text'
      }
    }
  })),
  parseUSFMToHTML: vi.fn().mockReturnValue('<div>Mock HTML</div>'),
}));

// Import mocked services
import { fetchBook } from '../services/scriptureService';
import { getNotesForVerse } from '../services/tnService';
import { getQuestionsForVerse } from '../services/tqService';
import { getArticlesForLinks } from '../services/twService';
import { getLinksForVerse } from '../services/twlService';
import { fetchManifest } from '../services/dcsClient';

describe('ResourcesContext', () => {
  // Test component to access context
  function TestComponent() {
    const context = useResourcesContext();
    return (
      <div data-testid="context-data">
        {JSON.stringify({
          hasScripture: !!context.resources.scripture,
          notesCount: context.resources.translationNotes.length,
          questionsCount: context.resources.translationQuestions.length,
          wordsCount: context.resources.translationWords.length,
          linksCount: context.resources.translationWordLinks.length,
          isLoading: context.isLoading,
          error: context.error,
          advancedMode: context.diagnostics.advancedMode,
          crossOrganizationUsage: context.diagnostics.crossOrganizationUsage,
        })}
      </div>
    );
  }

  // Mock ReferenceContext provider
  function MockReferenceProvider({ children, contextValue }) {
    const defaultValue = {
      reference: { bookId: 'gen', chapter: 1, verse: 1 },
      organization: 'unfoldingWord',
      languageId: 'en',
      resourceId: 'ult',
      advancedMode: false,
      mixedResources: {},
      getResourceOrganization: vi.fn(() => 'unfoldingWord'),
      getResourceId: vi.fn(() => 'ult'),
      ...contextValue,
    };

    return (
      <ReferenceContext.Provider value={defaultValue}>
        {children}
      </ReferenceContext.Provider>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock responses
    fetchManifest.mockResolvedValue({
      dublin_core: {
        title: 'Mock Resource Title',
      },
      projects: [
        {
          identifier: 'gen',
          path: './content/gen.md',
        },
      ],
    });

    fetchBook.mockResolvedValue('\\c 1\n\\v 1 Mock verse text.');
    getNotesForVerse.mockResolvedValue([
      { id: 1, content: 'Mock note', verse: 1 },
    ]);
    getQuestionsForVerse.mockResolvedValue([
      { id: 1, question: 'Mock question?', verse: 1 },
    ]);
    getLinksForVerse.mockResolvedValue(['rc://*/tw/dict/bible/kt/god']);
    getArticlesForLinks.mockResolvedValue([
      { title: 'God', content: 'Mock article about God', rcUri: 'rc://*/tw/dict/bible/kt/god' },
    ]);
  });

  describe('Basic Mode', () => {
    it('loads resources from single organization', async () => {
      const contextValue = {
        reference: { bookId: 'gen', chapter: 1, verse: 1 },
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
        advancedMode: false,
        mixedResources: {},
      };

      render(
        <MockReferenceProvider contextValue={contextValue}>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        expect(fetchManifest).toHaveBeenCalledWith('en', 'ult', 'unfoldingWord');
        expect(fetchManifest).toHaveBeenCalledWith('en', 'tn', 'unfoldingWord');
        expect(fetchBook).toHaveBeenCalledWith(
          expect.objectContaining({
            languageId: 'en',
            resourceId: 'ult',
            bookId: 'gen',
            organization: 'unfoldingWord',
          })
        );
      });
    });

    it('handles loading states correctly', async () => {
      const contextValue = {
        reference: { bookId: 'gen', chapter: 1, verse: 1 },
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
        advancedMode: false,
      };

      const { getByTestId } = render(
        <MockReferenceProvider contextValue={contextValue}>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      // Should start with loading state
      const contextData = JSON.parse(getByTestId('context-data').textContent);
      expect(contextData.isLoading).toBe(true);

      // Wait for loading to complete
      await waitFor(() => {
        const updatedData = JSON.parse(getByTestId('context-data').textContent);
        expect(updatedData.isLoading).toBe(false);
      });
    });
  });

  describe('Advanced Mode', () => {
    it('loads resources from mixed organizations', async () => {
      const contextValue = {
        reference: { bookId: 'gen', chapter: 1, verse: 1 },
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
        advancedMode: true,
        mixedResources: {
          scripture: {
            organization: 'unfoldingWord',
            resourceId: 'ult',
            name: 'unfoldingWord Literal Text',
          },
          tn: {
            organization: 'Door43-Catalog',
            resourceId: 'tn',
            name: 'Translation Notes',
          },
        },
      };

      render(
        <MockReferenceProvider contextValue={contextValue}>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        // Should call manifests for different organizations
        expect(fetchManifest).toHaveBeenCalledWith('en', 'ult', 'unfoldingWord');
        expect(fetchManifest).toHaveBeenCalledWith('en', 'tn', 'Door43-Catalog');
        
        // Should call services with correct organizations
        expect(getNotesForVerse).toHaveBeenCalledWith('gen', 1, 1, 'Door43-Catalog', 'en');
      });
    });

    it('includes organization attribution in resources', async () => {
      const contextValue = {
        reference: { bookId: 'gen', chapter: 1, verse: 1 },
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
        advancedMode: true,
        mixedResources: {
          scripture: {
            organization: 'unfoldingWord',
            resourceId: 'ult',
          },
          tn: {
            organization: 'Door43-Catalog',
            resourceId: 'tn',
          },
        },
      };

      const { getByTestId } = render(
        <MockReferenceProvider contextValue={contextValue}>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        const contextData = JSON.parse(getByTestId('context-data').textContent);
        expect(contextData.advancedMode).toBe(true);
        expect(contextData.crossOrganizationUsage).toBe(true);
      });
    });

    it('handles fallback to default organization when mixed resource not specified', async () => {
      const contextValue = {
        reference: { bookId: 'gen', chapter: 1, verse: 1 },
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
        advancedMode: true,
        mixedResources: {
          scripture: {
            organization: 'Door43-Catalog',
            resourceId: 'ulb',
          },
          // tn not specified, should fall back to default organization
        },
      };

      render(
        <MockReferenceProvider contextValue={contextValue}>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        // Should use Door43-Catalog for scripture
        expect(fetchManifest).toHaveBeenCalledWith('en', 'ulb', 'Door43-Catalog');
        // Should fall back to unfoldingWord for tn
        expect(fetchManifest).toHaveBeenCalledWith('en', 'tn', 'unfoldingWord');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles manifest loading errors gracefully', async () => {
      fetchManifest.mockRejectedValueOnce(new Error('Manifest not found'));

      const contextValue = {
        reference: { bookId: 'gen', chapter: 1, verse: 1 },
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
        advancedMode: false,
      };

      const { getByTestId } = render(
        <MockReferenceProvider contextValue={contextValue}>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        const contextData = JSON.parse(getByTestId('context-data').textContent);
        expect(contextData.isLoading).toBe(false);
        // Should continue loading other resources even if one fails
      });
    });

    it('handles service errors gracefully', async () => {
      getNotesForVerse.mockRejectedValueOnce(new Error('Notes service error'));

      const contextValue = {
        reference: { bookId: 'gen', chapter: 1, verse: 1 },
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
        advancedMode: false,
      };

      const { getByTestId } = render(
        <MockReferenceProvider contextValue={contextValue}>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        const contextData = JSON.parse(getByTestId('context-data').textContent);
        expect(contextData.isLoading).toBe(false);
        expect(contextData.notesCount).toBe(0); // Should handle error gracefully
      });
    });
  });

  describe('Context Integration', () => {
    it('provides enhanced diagnostics for cross-organization usage', async () => {
      const contextValue = {
        reference: { bookId: 'gen', chapter: 1, verse: 1 },
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
        advancedMode: true,
        mixedResources: {
          scripture: { organization: 'unfoldingWord', resourceId: 'ult' },
          tn: { organization: 'Door43-Catalog', resourceId: 'tn' },
        },
      };

      let contextValue_captured;
      function CaptureContext() {
        contextValue_captured = useResourcesContext();
        return null;
      }

      render(
        <MockReferenceProvider contextValue={contextValue}>
          <ResourcesProvider>
            <CaptureContext />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        expect(contextValue_captured.diagnostics).toEqual(
          expect.objectContaining({
            advancedMode: true,
            crossOrganizationUsage: true,
            organizationBreakdown: expect.any(Object),
          })
        );
      });
    });

    it('updates resources when mixed resources configuration changes', async () => {
      const initialContextValue = {
        reference: { bookId: 'gen', chapter: 1, verse: 1 },
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
        advancedMode: true,
        mixedResources: {
          scripture: { organization: 'unfoldingWord', resourceId: 'ult' },
        },
      };

      const { rerender } = render(
        <MockReferenceProvider contextValue={initialContextValue}>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        expect(fetchManifest).toHaveBeenCalledWith('en', 'ult', 'unfoldingWord');
      });

      // Clear mocks and update context
      vi.clearAllMocks();
      
      const updatedContextValue = {
        ...initialContextValue,
        mixedResources: {
          scripture: { organization: 'Door43-Catalog', resourceId: 'ulb' },
        },
      };

      rerender(
        <MockReferenceProvider contextValue={updatedContextValue}>
          <ResourcesProvider>
            <TestComponent />
          </ResourcesProvider>
        </MockReferenceProvider>
      );

      await waitFor(() => {
        expect(fetchManifest).toHaveBeenCalledWith('en', 'ulb', 'Door43-Catalog');
      });
    });
  });
});