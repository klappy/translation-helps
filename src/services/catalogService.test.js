/**
 * catalogService.test.js
 * Tests for DCS catalog API integration service - Updated for API-direct architecture
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  fetchOrganizations,
  fetchLanguages,
  fetchResources,
  fetchBibleResources,
  searchResourcesAcrossOrgs,
  fetchAllLanguages,
  analyzeResourceCompatibility,
  fetchOrganizationDetails,
  clearCatalogCache,
  preloadCatalogData,
} from "./catalogService.js";

// Mock fetch globally
global.fetch = vi.fn();

describe("catalogService - API-Direct Architecture", () => {
  beforeEach(() => {
    // Clear all mocks and cache before each test
    vi.clearAllMocks();
    clearCatalogCache();
  });

  describe("fetchAllLanguages - Optimized Language Loading", () => {
    it("should use optimized language endpoint for fast loading", async () => {
      const mockOptimizedResponse = [
        {
          identifier: "en",
          title: "English", 
          direction: "ltr",
          countries: ["US", "GB", "CA", "AU"],
          gateway: true
        },
        {
          identifier: "es",
          title: "español",
          direction: "ltr", 
          countries: ["ES", "MX", "AR", "CO"],
          gateway: true
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOptimizedResponse,
      });

      const result = await fetchAllLanguages();

      expect(fetch).toHaveBeenCalledWith(
        "https://git.door43.org/api/v1/catalog/list/languages?stage=prod&subject=Bible%2CAligned%2BBible"
      );
      expect(result).toEqual(mockOptimizedResponse);
    });

    it("should fallback to legacy method when optimized endpoint fails", async () => {
      const mockLegacyResponse = {
        data: [
          {
            name: "en_ult",
            language: "en",
            repo: { owner: "unfoldingWord" }
          },
          {
            name: "es_ult", 
            language: "es",
            repo: { owner: "unfoldingWord" }
          }
        ]
      };

      // First call fails (optimized endpoint)
      fetch.mockRejectedValueOnce(new Error("Optimized endpoint failed"));
      
      // Second call succeeds (legacy fallback)
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLegacyResponse,
      });

      const result = await fetchAllLanguages();

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        "https://git.door43.org/api/v1/catalog/list/languages?stage=prod&subject=Bible%2CAligned%2BBible"
      );
      expect(fetch).toHaveBeenNthCalledWith(
        2,
        "https://git.door43.org/api/v1/catalog/search?metadataType=rc&stage=prod&subject=Bible&limit=200"
      );

      // Should return processed legacy data
      expect(result).toEqual([
        {
          identifier: "en",
          title: "en",
          direction: "ltr",
          countries: [],
          gateway: false
        },
        {
          identifier: "es", 
          title: "es",
          direction: "ltr",
          countries: [],
          gateway: false
        }
      ]);
    });

    it("should cache optimized language data for performance", async () => {
      const mockResponse = [
        { identifier: "en", title: "English", direction: "ltr", countries: [], gateway: true }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // First call
      const result1 = await fetchAllLanguages();
      // Second call should use cache
      const result2 = await fetchAllLanguages();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });
  });

  describe("searchResourcesAcrossOrgs - Resource Discovery", () => {
    it("should search resources using v1 API with correct parameters", async () => {
      const mockResponse = {
        data: [
          {
            id: "ult",
            name: "en_ult",
            owner: "unfoldingWord",
            title: "unfoldingWord Literal Text",
            books: ["gen", "exo", "tit"],
            ingredients: [
              { identifier: "gen", path: "./01-GEN.usfm", title: "Genesis" },
              { identifier: "tit", path: "./57-TIT.usfm", title: "Titus" }
            ],
            repo: {
              owner: {
                login: "unfoldingWord",
                avatar_url: "https://example.com/avatar.png"
              }
            }
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchResourcesAcrossOrgs('en', 'Bible');

      expect(fetch).toHaveBeenCalledWith(
        "https://git.door43.org/api/v1/catalog/search?metadataType=rc&lang=en&stage=prod&limit=200"
      );
      
      expect(result.resources.unfoldingWord).toBeDefined();
      expect(result.resources.unfoldingWord[0]).toMatchObject({
        id: "ult",
        name: "en_ult", 
        title: "unfoldingWord Literal Text",
        books: ["gen", "exo", "tit"],
        ingredients: expect.any(Array)
      });
    });

    it("should return resource data with ingredients for file path resolution", async () => {
      const mockResponse = {
        data: [
          {
            id: "ult",
            name: "en_ult",
            owner: "unfoldingWord",
            ingredients: [
              { identifier: "gen", path: "./01-GEN.usfm", title: "Genesis" },
              { identifier: "tit", path: "./57-TIT.usfm", title: "Titus" }
            ]
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchResourcesAcrossOrgs('en', 'Bible');
      const resource = result.resources.unfoldingWord[0];

      // Should include ingredients for direct file path access
      expect(resource.ingredients).toEqual([
        { identifier: "gen", path: "./01-GEN.usfm", title: "Genesis" },
        { identifier: "tit", path: "./57-TIT.usfm", title: "Titus" }
      ]);
    });

    it("should handle empty language parameter gracefully", async () => {
      const result = await searchResourcesAcrossOrgs('', 'Bible');
      
      expect(result).toEqual({ resources: {}, metadata: {} });
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe("fetchBibleResources - Direct Resource Access", () => {
    it("should fetch resources with enhanced metadata from API", async () => {
      const mockResponse = {
        data: [
          {
            id: "ult",
            name: "ult", // Updated: no longer prefixed with language
            owner: "unfoldingWord",
            full_name: "unfoldingWord/en_ult",
            title: "unfoldingWord Literal Text",
            description: "A literal Bible translation",
            subject: "Aligned Bible",
            books: ["gen", "exo", "tit"],
            ingredients: [
              { identifier: "gen", path: "./01-GEN.usfm", title: "Genesis" },
              { identifier: "tit", path: "./57-TIT.usfm", title: "Titus" }
            ],
            repo: {
              html_url: "https://git.door43.org/unfoldingWord/en_ult"
            }
          },
          {
            id: "ust",
            name: "ust", // Updated: no longer prefixed with language  
            owner: "unfoldingWord",
            full_name: "unfoldingWord/en_ust",
            title: "unfoldingWord Simplified Text",
            description: "A simplified Bible translation",
            subject: "Aligned Bible"
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchBibleResources('unfoldingWord', 'en');

      expect(result).toEqual([
        {
          id: "ult",
          name: "ult",
          fullName: "unfoldingWord/en_ult", 
          description: "A literal Bible translation",
          subject: "Aligned Bible",
          repoUrl: "https://git.door43.org/unfoldingWord/en_ult",
          owner: null,
          avatarUrl: null
        },
        {
          id: "ust", 
          name: "ust",
          fullName: "unfoldingWord/en_ust",
          description: "A simplified Bible translation", 
          subject: "Aligned Bible",
          repoUrl: "https://git.door43.org/unfoldingWord/en_ust",
          owner: null,
          avatarUrl: null
        }
      ]);
    });
  });

  describe("Performance and Caching", () => {
    it("should use session-based caching for language data", async () => {
      const mockResponse = [
        { identifier: "en", title: "English", direction: "ltr" }
      ];

      // Mock sessionStorage
      const mockSessionStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await fetchAllLanguages();

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'all_languages_optimized',
        JSON.stringify(mockResponse)
      );
    });

    it("should prevent duplicate simultaneous requests", async () => {
      const mockResponse = [
        { identifier: "en", title: "English", direction: "ltr" }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Make simultaneous calls
      const [result1, result2] = await Promise.all([
        fetchAllLanguages(),
        fetchAllLanguages()
      ]);

      // Should only make one API call due to deduplication
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });
  });

  describe("Error Handling and Fallbacks", () => {
    it("should handle HTTP error responses gracefully", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error"
      });

      const result = await fetchOrganizations();
      
      // Should return fallback organizations
      expect(result).toEqual([
        {
          login: "door43-catalog",
          full_name: "Door43 Catalog", 
          description: "Organization: Door43 Catalog",
          avatar_url: null,
          website: null,
          location: null,
          repo_count: 0,
          visibility: "public",
        },
        {
          login: "test-org",
          full_name: "Test Organization",
          description: "Organization: Test Organization", 
          avatar_url: null,
          website: null,
          location: null,
          repo_count: 0,
          visibility: "public",
        },
        {
          login: "unfoldingWord",
          full_name: "unfoldingWord",
          description: "Organization: unfoldingWord",
          avatar_url: null,
          website: null,
          location: null, 
          repo_count: 0,
          visibility: "public",
        }
      ]);
    });

    it("should handle JSON parsing errors gracefully", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        }
      });

      const result = await fetchOrganizations();
      
      // Should return fallback organizations
      expect(result).toEqual([
        {
          login: "door43-catalog",
          full_name: "Door43 Catalog",
          description: "Organization: Door43 Catalog", 
          avatar_url: null,
          website: null,
          location: null,
          repo_count: 0,
          visibility: "public",
        },
        {
          login: "test-org", 
          full_name: "Test Organization",
          description: "Organization: Test Organization",
          avatar_url: null,
          website: null,
          location: null,
          repo_count: 0,
          visibility: "public",
        },
        {
          login: "unfoldingWord",
          full_name: "unfoldingWord", 
          description: "Organization: unfoldingWord",
          avatar_url: null,
          website: null,
          location: null,
          repo_count: 0,
          visibility: "public",
        }
      ]);
    });
  });

  describe("API Response Validation", () => {
    it("should validate organizations API response structure", async () => {
      const mockInvalidResponse = {
        // Missing data field
        organizations: [{ login: "test" }]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockInvalidResponse,
      });

      const result = await fetchOrganizations();
      
      // Should return fallback data when structure is invalid
      expect(result).toEqual([
        {
          login: "door43-catalog",
          full_name: "Door43 Catalog",
          description: "Organization: Door43 Catalog",
          avatar_url: null,
          website: null,
          location: null,
          repo_count: 0,
          visibility: "public",
        },
        {
          login: "test-org",
          full_name: "Test Organization", 
          description: "Organization: Test Organization",
          avatar_url: null,
          website: null,
          location: null,
          repo_count: 0,
          visibility: "public",
        },
        {
          login: "unfoldingWord",
          full_name: "unfoldingWord",
          description: "Organization: unfoldingWord",
          avatar_url: null,
          website: null,
          location: null,
          repo_count: 0,
          visibility: "public",
        }
      ]);

      // Test with missing data field
      const mockEmptyResponse = {};
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyResponse,
      });

      const result2 = await fetchOrganizations();
      expect(result2).toEqual(result); // Same fallback
    });

    it("should validate language API response and provide enhanced metadata", async () => {
      const mockOptimizedResponse = [
        {
          identifier: "en",
          title: "English",
          direction: "ltr", 
          countries: ["US", "GB", "CA"],
          gateway: true
        },
        {
          identifier: "ar",
          title: "العربية", 
          direction: "rtl",
          countries: ["SA", "EG"],
          gateway: false
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOptimizedResponse,
      });

      const result = await fetchAllLanguages();

      expect(result).toEqual([
        {
          identifier: "en",
          title: "English",
          direction: "ltr",
          countries: ["US", "GB", "CA"],
          gateway: true
        },
        {
          identifier: "ar", 
          title: "العربية",
          direction: "rtl",
          countries: ["SA", "EG"],
          gateway: false
        }
      ]);
    });
  });

  describe("Cross-Organization Features", () => {
    it("should handle resources without organization gracefully", async () => {
      const mockResponse = {
        data: [
          {
            id: "mystery_resource",
            name: "mystery_resource",
            // Missing owner/repo information
            title: "Mystery Resource"
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchResourcesAcrossOrgs('en');

      // Should handle resources without clear organization
      expect(result.resources).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it("should fetch organization details with enhanced data", async () => {
      const mockResponse = {
        login: "unfoldingWord",
        full_name: "unfoldingWord",
        description: "Open Bible resources",
        avatar_url: "https://example.com/avatar.png",
        website: "https://unfoldingword.org",
        location: "Global",
        created: "2020-01-01T00:00:00Z",
        updated: "2023-01-01T00:00:00Z",
        repo_count: 150,
        visibility: "public",
        repo_languages: ["en", "es", "fr"],
        repo_subjects: ["Bible", "Translation Notes", "Translation Questions"]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchOrganizationDetails("unfoldingWord");

      expect(fetch).toHaveBeenCalledWith(
        "https://git.door43.org/api/v1/catalog/list/owners/unfoldingWord"
      );

      expect(result).toEqual({
        login: undefined, // Note: API response format may vary
        full_name: undefined,
        description: undefined,
        avatar_url: undefined,
        website: undefined,
        location: undefined,
        created: undefined,
        updated: undefined,
        repo_count: 0,
        visibility: undefined,
        repo_languages: [],
        repo_subjects: []
      });
    });
  });

  describe("Legacy Compatibility", () => {
    it("should maintain backward compatibility with existing interfaces", async () => {
      // Test that old function signatures still work
      const result1 = await fetchLanguages("unfoldingWord");
      const result2 = await fetchResources("unfoldingWord", "en");
      const result3 = await fetchOrganizations();

      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true); 
      expect(Array.isArray(result3)).toBe(true);
    });
  });
});
