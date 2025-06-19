/**
 * useResources.test.js
 * Tests for the enhanced useResources hook with cross-organization support
 */

import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useResources, useCrossOrgResources, useResourcesWithConfig } from './useResources';

// Mock the catalog service
vi.mock('../services/catalogService.js', () => ({
  fetchBibleResources: vi.fn(),
  searchResourcesAcrossOrgs: vi.fn(),
}));

import { fetchBibleResources, searchResourcesAcrossOrgs } from '../services/catalogService.js';

describe('useResources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Mode (Single Organization)', () => {
    it('fetches resources for a single organization', async () => {
      const mockResources = [
        { id: 'ult', name: 'unfoldingWord Literal Text', subject: 'Bible' },
        { id: 'ust', name: 'unfoldingWord Simplified Text', subject: 'Bible' },
      ];

      fetchBibleResources.mockResolvedValue(mockResources);

      const { result } = renderHook(() => useResources('unfoldingWord', 'en'));

      expect(result.current.loading).toBe(true);
      expect(result.current.resources).toEqual([]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(fetchBibleResources).toHaveBeenCalledWith('unfoldingWord', 'en');
      expect(result.current.resources).toHaveLength(2);
      expect(result.current.resources[0]).toEqual(
        expect.objectContaining({
          id: 'ult',
          organization: 'unfoldingWord',
          combinedId: 'unfoldingWord/ult',
          isFromCrossOrg: false,
        })
      );
    });

    it('handles missing organization parameter', async () => {
      const { result } = renderHook(() => useResources(null, 'en'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(fetchBibleResources).not.toHaveBeenCalled();
      expect(result.current.resources).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('handles missing language parameter', async () => {
      const { result } = renderHook(() => useResources('unfoldingWord', null));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(fetchBibleResources).not.toHaveBeenCalled();
      expect(result.current.resources).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('handles API errors gracefully', async () => {
      const errorMessage = 'API Error';
      fetchBibleResources.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useResources('unfoldingWord', 'en'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.resources).toEqual([]);
    });
  });

  describe('Cross-Organization Mode', () => {
    it('fetches resources across organizations', async () => {
      const mockCrossOrgResources = {
        'unfoldingWord': [
          { id: 'ult', name: 'unfoldingWord Literal Text', subject: 'Bible' },
        ],
        'Door43-Catalog': [
          { id: 'ulb', name: 'unfoldingWord Literal Bible', subject: 'Bible' },
        ],
      };

      searchResourcesAcrossOrgs
        .mockResolvedValueOnce(mockCrossOrgResources) // Bible
        .mockResolvedValueOnce({}) // Translation Notes
        .mockResolvedValueOnce({}) // Translation Questions
        .mockResolvedValueOnce({}); // Translation Words

      const { result } = renderHook(() => 
        useResources(null, 'en', { crossOrganization: true })
      );

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(searchResourcesAcrossOrgs).toHaveBeenCalledWith('en', 'Bible');
      expect(result.current.resources).toHaveLength(2);
      
      const unfoldingWordResource = result.current.resources.find(r => r.organization === 'unfoldingWord');
      expect(unfoldingWordResource).toEqual(
        expect.objectContaining({
          id: 'ult',
          organization: 'unfoldingWord',
          combinedId: 'unfoldingWord/ult',
          isFromCrossOrg: true,
        })
      );

      const door43Resource = result.current.resources.find(r => r.organization === 'Door43-Catalog');
      expect(door43Resource).toEqual(
        expect.objectContaining({
          id: 'ulb',
          organization: 'Door43-Catalog',
          combinedId: 'Door43-Catalog/ulb',
          isFromCrossOrg: true,
        })
      );
    });

    it('fetches specific resource type across organizations', async () => {
      const mockNotesResources = {
        'unfoldingWord': [
          { id: 'tn', name: 'Translation Notes', subject: 'Translation Notes' },
        ],
      };

      searchResourcesAcrossOrgs.mockResolvedValue(mockNotesResources);

      const { result } = renderHook(() => 
        useResources(null, 'en', { crossOrganization: true, resourceType: 'Translation Notes' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(searchResourcesAcrossOrgs).toHaveBeenCalledWith('en', 'Translation Notes');
      expect(result.current.resources).toHaveLength(1);
      expect(result.current.resources[0].id).toBe('tn');
    });

    it('provides organization breakdown', async () => {
      const mockCrossOrgResources = {
        'unfoldingWord': [
          { id: 'ult', name: 'unfoldingWord Literal Text' },
        ],
        'Door43-Catalog': [
          { id: 'ulb', name: 'unfoldingWord Literal Bible' },
        ],
      };

      searchResourcesAcrossOrgs
        .mockResolvedValueOnce(mockCrossOrgResources)
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      const { result } = renderHook(() => 
        useResources(null, 'en', { crossOrganization: true })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.organizationBreakdown).toEqual(mockCrossOrgResources);
      expect(result.current.diagnostics.organizationCount).toBe(2);
      expect(result.current.diagnostics.crossOrganizationMode).toBe(true);
    });

    it('handles cross-organization API errors gracefully', async () => {
      searchResourcesAcrossOrgs.mockRejectedValue(new Error('Cross-org API error'));

      const { result } = renderHook(() => 
        useResources(null, 'en', { crossOrganization: true })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Cross-org API error');
      expect(result.current.resources).toEqual([]);
    });
  });

  describe('Enhanced Diagnostics', () => {
    it('provides comprehensive diagnostics for single organization', async () => {
      const mockResources = [
        { id: 'ult', name: 'unfoldingWord Literal Text' },
        { id: 'ust', name: 'unfoldingWord Simplified Text' },
      ];

      fetchBibleResources.mockResolvedValue(mockResources);

      const { result } = renderHook(() => useResources('unfoldingWord', 'en'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.diagnostics).toEqual({
        totalResources: 2,
        organizationCount: 1,
        crossOrganizationMode: false,
        resourceType: null,
        organizations: ['unfoldingWord'],
      });
    });

    it('provides comprehensive diagnostics for cross-organization', async () => {
      const mockCrossOrgResources = {
        'unfoldingWord': [{ id: 'ult' }],
        'Door43-Catalog': [{ id: 'ulb' }],
        'WycliffeAssociates': [{ id: 'web' }],
      };

      searchResourcesAcrossOrgs
        .mockResolvedValueOnce(mockCrossOrgResources)
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      const { result } = renderHook(() => 
        useResources(null, 'en', { crossOrganization: true })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.diagnostics).toEqual({
        totalResources: 3,
        organizationCount: 3,
        crossOrganizationMode: true,
        resourceType: null,
        organizations: ['unfoldingWord', 'Door43-Catalog', 'WycliffeAssociates'],
      });
    });
  });

  describe('Parameter Changes', () => {
    it('refetches when organization changes', async () => {
      fetchBibleResources.mockResolvedValue([]);

      const { result, rerender } = renderHook(
        ({ org, lang }) => useResources(org, lang),
        { initialProps: { org: 'unfoldingWord', lang: 'en' } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(fetchBibleResources).toHaveBeenCalledWith('unfoldingWord', 'en');

      // Change organization
      rerender({ org: 'Door43-Catalog', lang: 'en' });

      await waitFor(() => {
        expect(fetchBibleResources).toHaveBeenCalledWith('Door43-Catalog', 'en');
      });
    });

    it('refetches when language changes', async () => {
      fetchBibleResources.mockResolvedValue([]);

      const { result, rerender } = renderHook(
        ({ org, lang }) => useResources(org, lang),
        { initialProps: { org: 'unfoldingWord', lang: 'en' } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(fetchBibleResources).toHaveBeenCalledWith('unfoldingWord', 'en');

      // Change language
      rerender({ org: 'unfoldingWord', lang: 'es' });

      await waitFor(() => {
        expect(fetchBibleResources).toHaveBeenCalledWith('unfoldingWord', 'es');
      });
    });
  });
});

describe('useCrossOrgResources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is a convenience wrapper for cross-organization resources', async () => {
    const mockResources = {
      'unfoldingWord': [{ id: 'ult' }],
    };

    searchResourcesAcrossOrgs.mockResolvedValue(mockResources);

    const { result } = renderHook(() => useCrossOrgResources('en', 'Bible'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(searchResourcesAcrossOrgs).toHaveBeenCalledWith('en', 'Bible');
    expect(result.current.diagnostics.crossOrganizationMode).toBe(true);
  });
});

describe('useResourcesWithConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses resource configuration object', async () => {
    fetchBibleResources.mockResolvedValue([]);

    const config = {
      organization: 'unfoldingWord',
      language: 'en',
      resourceType: 'Bible',
      crossOrganization: false,
    };

    const { result } = renderHook(() => useResourcesWithConfig(config));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetchBibleResources).toHaveBeenCalledWith('unfoldingWord', 'en');
  });

  it('handles cross-organization configuration', async () => {
    searchResourcesAcrossOrgs.mockResolvedValue({});

    const config = {
      organization: null,
      language: 'en',
      resourceType: 'Bible',
      crossOrganization: true,
    };

    const { result } = renderHook(() => useResourcesWithConfig(config));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(searchResourcesAcrossOrgs).toHaveBeenCalledWith('en', 'Bible');
  });
}); 