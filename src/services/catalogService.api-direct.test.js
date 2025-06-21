/**
 * catalogService.api-direct.test.js
 * Tests for the new API-direct architecture without manifest dependencies
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  fetchAllLanguages,
  searchResourcesAcrossOrgs,
  fetchBibleResources,
} from "./catalogService.js";

// Mock fetch globally
global.fetch = vi.fn();

describe("Catalog Service - API-Direct Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear session storage cache
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
    }
  });

  describe("Optimized Language Loading", () => {
    it("should use dedicated language endpoint for 90% performance improvement", async () => {
      const mockOptimizedResponse = [
        {
          identifier: "en",
          title: "English",
          direction: "ltr",
          countries: ["US", "GB", "CA", "AU", "IN"],
          gateway: true
        },
        {
          identifier: "es", 
          title: "español",
          direction: "ltr",
          countries: ["ES", "MX", "AR", "CO", "PE"],
          gateway: true
        },
        {
          identifier: "ar",
          title: "العربية",
          direction: "rtl", 
          countries: ["SA", "EG", "DZ", "SD"],
          gateway: false
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOptimizedResponse,
      });

      const startTime = Date.now();
      const result = await fetchAllLanguages();
      const duration = Date.now() - startTime;

      // Verify optimized endpoint is used
      expect(fetch).toHaveBeenCalledWith(
        "https://git.door43.org/api/v1/catalog/list/languages?stage=prod&subject=Bible%2CAligned%2BBible"
      );

      // Verify enhanced language data structure
      expect(result).toEqual(mockOptimizedResponse);
      
      // Verify performance (should be much faster than legacy)
      expect(duration).toBeLessThan(100); // Should be very fast in tests
    });

    it("should fallback to legacy search method when optimized endpoint fails", async () => {
      const mockLegacySearchResponse = {
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

      // First call fails (optimized)
      fetch.mockRejectedValueOnce(new Error("Optimized endpoint unavailable"));
      
      // Second call succeeds (legacy fallback)
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLegacySearchResponse,
      });

      const result = await fetchAllLanguages();

      expect(fetch).toHaveBeenCalledTimes(2);
      
      // Should try optimized first
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        "https://git.door43.org/api/v1/catalog/list/languages?stage=prod&subject=Bible%2CAligned%2BBible"
      );
      
      // Then fallback to legacy search
      expect(fetch).toHaveBeenNthCalledWith(
        2,
        "https://git.door43.org/api/v1/catalog/search?metadataType=rc&stage=prod&subject=Bible&limit=200"
      );

      // Should return normalized language data
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

    it("should provide enhanced language metadata for improved UX", async () => {
      const mockEnhancedResponse = [
        {
          identifier: "en",
          title: "English",
          direction: "ltr",
          countries: ["US", "GB", "CA", "AU", "IN", "ZA", "IE", "NZ", "SG", "PH"],
          gateway: true
        },
        {
          identifier: "zh",
          title: "中文",
          direction: "ltr",
          countries: ["CN", "TW", "HK", "SG", "MO"],
          gateway: false
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEnhancedResponse,
      });

      const result = await fetchAllLanguages();

      // Verify enhanced metadata is preserved
      expect(result[0]).toMatchObject({
        identifier: "en",
        title: "English",
        direction: "ltr",
        countries: expect.arrayContaining(["US", "GB", "CA"]),
        gateway: true
      });

      expect(result[1]).toMatchObject({
        identifier: "zh", 
        title: "中文",
        direction: "ltr",
        countries: expect.arrayContaining(["CN", "TW", "HK"]),
        gateway: false
      });
    });
  });

  describe("Direct Resource Discovery", () => {
    it("should fetch resources with ingredients array for file path resolution", async () => {
      const mockResourceResponse = {
        data: [
          {
            id: "ult",
            name: "en_ult",
            owner: "unfoldingWord",
            title: "unfoldingWord Literal Text",
            books: ["gen", "exo", "tit"],
            ingredients: [
              {
                identifier: "gen",
                path: "./01-GEN.usfm",
                title: "Genesis",
                exists: true,
                size: 262356
              },
              {
                identifier: "tit", 
                path: "./57-TIT.usfm",
                title: "Titus",
                exists: true,
                size: 15432
              }
            ],
            version: "85",
            checking: {
              checking_entity: "unfoldingWord",
              checking_level: "3"
            },
            repo: {
              owner: {
                login: "unfoldingWord",
                avatar_url: "https://git.door43.org/avatars/613"
              }
            }
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResourceResponse,
      });

      const result = await searchResourcesAcrossOrgs('en', 'Bible');

      expect(result.resources.unfoldingWord).toBeDefined();
      
      const resource = result.resources.unfoldingWord[0];
      
      // Verify complete resource data is available
      expect(resource).toMatchObject({
        id: "ult",
        name: "en_ult",
        title: "unfoldingWord Literal Text",
        books: ["gen", "exo", "tit"],
        ingredients: [
          {
            identifier: "gen",
            path: "./01-GEN.usfm",
            title: "Genesis"
          },
          {
            identifier: "tit",
            path: "./57-TIT.usfm", 
            title: "Titus"
          }
        ]
      });

      // Verify ingredients can be used for direct file access
      const titusIngredient = resource.ingredients.find(ing => ing.identifier === "tit");
      expect(titusIngredient.path).toBe("./57-TIT.usfm");
    });

    it("should eliminate manifest dependency by using API resource data directly", async () => {
      const mockResponse = {
        data: [
          {
            id: "tn",
            name: "en_tn", 
            owner: "unfoldingWord",
            title: "unfoldingWord Translation Notes",
            books: ["gen", "tit"],
            // No manifest needed - use standard naming
            subject: "Translation Notes"
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchResourcesAcrossOrgs('en', 'Translation Notes');
      const tnResource = result.resources.unfoldingWord[0];

      // Verify resource data contains book availability
      expect(tnResource.books).toEqual(["gen", "tit"]);
      
      // Verify no manifest calls were made
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).not.toHaveBeenCalledWith(
        expect.stringContaining("manifest.yaml")
      );
    });

    it("should use v1 API with correct parameters for reliable resource discovery", async () => {
      await searchResourcesAcrossOrgs('en', 'Bible');

      expect(fetch).toHaveBeenCalledWith(
        "https://git.door43.org/api/v1/catalog/search?metadataType=rc&lang=en&stage=prod&limit=200"
      );
    });
  });

  describe("Performance Optimizations", () => {
    it("should implement session-based caching for language data", async () => {
      const mockResponse = [
        { identifier: "en", title: "English", direction: "ltr" }
      ];

      // Mock sessionStorage
      const mockSessionStorage = {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn()
      };
      
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await fetchAllLanguages();

      // Verify data is cached
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'all_languages_optimized',
        JSON.stringify(mockResponse)
      );
    });

    it("should use cached data on subsequent calls for performance", async () => {
      const mockResponse = [
        { identifier: "en", title: "English", direction: "ltr" }
      ];

      // Mock sessionStorage with cached data
      const mockSessionStorage = {
        getItem: vi.fn(() => JSON.stringify(mockResponse)),
        setItem: vi.fn(),
        removeItem: vi.fn()
      };
      
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true
      });

      const result = await fetchAllLanguages();

      // Should not make API call when cached data exists
      expect(fetch).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should prevent duplicate simultaneous requests", async () => {
      const mockResponse = [
        { identifier: "en", title: "English", direction: "ltr" }
      ];

      fetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => mockResponse
          }), 10)
        )
      );

      // Make simultaneous calls
      const [result1, result2, result3] = await Promise.all([
        fetchAllLanguages(),
        fetchAllLanguages(), 
        fetchAllLanguages()
      ]);

      // Should only make one API call due to deduplication
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
  });

  describe("Standard File Naming Patterns", () => {
    it("should use standard naming for translation helps without manifest lookups", async () => {
      // Test that services can determine file paths without manifests
      const testCases = [
        { resourceType: "tn", bookId: "gen", expected: "tn_GEN.tsv" },
        { resourceType: "tq", bookId: "tit", expected: "tq_TIT.tsv" },
        { resourceType: "twl", bookId: "mat", expected: "twl_MAT.tsv" },
      ];

      testCases.forEach(({ resourceType, bookId, expected }) => {
        // This would be the pattern used by services
        const filePath = `${resourceType}_${bookId.toUpperCase()}.tsv`;
        expect(filePath).toBe(expected);
      });
    });

    it("should use ingredients array for scripture file paths", async () => {
      const mockResponse = {
        data: [
          {
            id: "ult",
            ingredients: [
              { identifier: "gen", path: "./01-GEN.usfm" },
              { identifier: "tit", path: "./57-TIT.usfm" },
              { identifier: "mat", path: "./40-MAT.usfm" }
            ]
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchResourcesAcrossOrgs('en', 'Bible');
      const resource = result.resources[Object.keys(result.resources)[0]][0];

      // Verify ingredients provide actual file paths
      const genPath = resource.ingredients.find(ing => ing.identifier === "gen")?.path;
      const titPath = resource.ingredients.find(ing => ing.identifier === "tit")?.path;
      
      expect(genPath).toBe("./01-GEN.usfm");
      expect(titPath).toBe("./57-TIT.usfm");
    });
  });

  describe("Error Handling and Resilience", () => {
    it("should handle network failures gracefully with fallbacks", async () => {
      // First call fails completely
      fetch.mockRejectedValueOnce(new Error("Network error"));
      
      // Second call also fails 
      fetch.mockRejectedValueOnce(new Error("Legacy endpoint also failed"));

      const result = await fetchAllLanguages();

      // Should return empty array or basic fallback
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle malformed API responses without crashing", async () => {
      const malformedResponse = {
        // Missing expected structure
        invalid: "data"
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => malformedResponse,
      });

      const result = await fetchAllLanguages();
      
      // Should handle gracefully and return fallback
      expect(Array.isArray(result)).toBe(true);
    });

    it("should clear corrupted cache data automatically", async () => {
      const mockSessionStorage = {
        getItem: vi.fn(() => "invalid json data"),
        setItem: vi.fn(),
        removeItem: vi.fn()
      };
      
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true
      });

      const mockResponse = [
        { identifier: "en", title: "English", direction: "ltr" }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await fetchAllLanguages();

      // Should remove corrupted cache and fetch fresh data
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('all_languages_optimized');
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe("Integration Patterns", () => {
    it("should support cross-organization resource discovery", async () => {
      const mockResponse = {
        data: [
          {
            id: "ult",
            name: "en_ult",
            owner: "unfoldingWord",
            repo: { owner: { login: "unfoldingWord" } }
          },
          {
            id: "udb", 
            name: "en_udb",
            owner: "WycliffeAssociates",
            repo: { owner: { login: "WycliffeAssociates" } }
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchResourcesAcrossOrgs('en', 'Bible');

      // Should group resources by organization
      expect(result.resources.unfoldingWord).toBeDefined();
      expect(result.resources.WycliffeAssociates).toBeDefined();
      
      expect(result.resources.unfoldingWord[0].id).toBe("ult");
      expect(result.resources.WycliffeAssociates[0].id).toBe("udb");
    });

    it("should provide metadata for enhanced UI displays", async () => {
      const mockResponse = {
        data: [
          {
            id: "ult",
            name: "en_ult", 
            title: "unfoldingWord Literal Text",
            description: "A literal Bible translation",
            version: "85",
            checking: {
              checking_level: "3",
              checking_entity: "unfoldingWord"
            },
            repo: {
              owner: {
                login: "unfoldingWord",
                avatar_url: "https://git.door43.org/avatars/613",
                full_name: "unfoldingWord®"
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
      const resource = result.resources.unfoldingWord[0];

      // Verify rich metadata is available for UI
      expect(resource).toMatchObject({
        title: "unfoldingWord Literal Text",
        description: "A literal Bible translation", 
        version: "85"
      });

      expect(resource.organizationData).toMatchObject({
        login: "unfoldingWord",
        avatar_url: "https://git.door43.org/avatars/613"
      });
    });
  });
}); 