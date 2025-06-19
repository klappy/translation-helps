/**
 * catalogService.test.js
 * Tests for DCS catalog API integration service
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

describe("catalogService", () => {
  beforeEach(() => {
    // Clear all mocks and cache before each test
    vi.clearAllMocks();
    clearCatalogCache();
  });

  describe("fetchOrganizations", () => {
    it("should fetch and return organizations from API with correct response structure", async () => {
      const mockApiResponse = {
        data: [
          { login: "unfoldingWord", full_name: "unfoldingWord" },
          { login: "door43-catalog", full_name: "Door43 Catalog" },
          { login: "test-org", full_name: "Test Organization" },
        ],
      };
      const expectedOrganizations = [
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
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await fetchOrganizations();

      expect(fetch).toHaveBeenCalledWith("https://git.door43.org/api/v1/catalog/list/owners");
      expect(result).toEqual(expectedOrganizations);
    });

    it("should return fallback organizations when API fails", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await fetchOrganizations();
      const fallbackOrganizations = [
        {
          login: "unfoldingWord",
          full_name: "unfoldingWord",
          description: "Open Bible resources for every language",
          avatar_url: null,
          website: "https://unfoldingword.org",
        },
        {
          login: "door43-catalog",
          full_name: "Door43 Catalog",
          description: "Community-driven translation hub",
          avatar_url: null,
          website: "https://door43.org",
        },
        {
          login: "STR",
          full_name: "STR",
          description: "Scripture Translation Resources",
          avatar_url: null,
          website: null,
        },
        {
          login: "WA",
          full_name: "WA",
          description: "Wycliffe Associates",
          avatar_url: null,
          website: null,
        },
      ];
      expect(result).toEqual(fallbackOrganizations);
    });

    it("should return fallback organizations if API returns invalid structure", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: "Invalid response" }),
      });

      const result = await fetchOrganizations();
      const fallbackOrganizations = [
        {
          login: "unfoldingWord",
          full_name: "unfoldingWord",
          description: "Open Bible resources for every language",
          avatar_url: null,
          website: "https://unfoldingword.org",
        },
        {
          login: "door43-catalog",
          full_name: "Door43 Catalog",
          description: "Community-driven translation hub",
          avatar_url: null,
          website: "https://door43.org",
        },
        {
          login: "STR",
          full_name: "STR",
          description: "Scripture Translation Resources",
          avatar_url: null,
          website: null,
        },
        {
          login: "WA",
          full_name: "WA",
          description: "Wycliffe Associates",
          avatar_url: null,
          website: null,
        },
      ];
      expect(result).toEqual(fallbackOrganizations);
    });

    it("should handle missing login field in organization data", async () => {
      const mockApiResponse = {
        data: [
          { login: "valid-org", full_name: "Valid Org" },
          { full_name: "Invalid Org - No Login" }, // Missing login field
          { login: "", full_name: "Empty Login" }, // Empty login field
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await fetchOrganizations();

      expect(result).toEqual([
        {
          login: "valid-org",
          full_name: "Valid Org",
          description: "Organization: Valid Org",
          avatar_url: null,
          website: null,
          location: null,
          repo_count: 0,
          visibility: "public",
        },
      ]);
    });

    it("should cache results and not call API on second request", async () => {
      const mockApiResponse = {
        data: [
          { login: "unfoldingWord", full_name: "unfoldingWord" },
          { login: "door43-catalog", full_name: "Door43 Catalog" },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      // First call
      const result1 = await fetchOrganizations();
      // Second call
      const result2 = await fetchOrganizations();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });
  });

  describe("fetchLanguages", () => {
    it("should fetch and return languages for organization with correct URL and response structure", async () => {
      const mockApiResponse = {
        data: [
          { lc: "en", ln: "English", ang: "English" },
          { lc: "es", ln: "español", ang: "Spanish" },
          { lc: "fr", ln: "français", ang: "French" },
        ],
      };
      const expectedLanguages = [
        {
          code: "en",
          name: "English",
          direction: "ltr",
          raw: { lc: "en", ln: "English", ang: "English" },
        },
        {
          code: "es",
          name: "español",
          direction: "ltr",
          raw: { lc: "es", ln: "español", ang: "Spanish" },
        },
        {
          code: "fr",
          name: "français",
          direction: "ltr",
          raw: { lc: "fr", ln: "français", ang: "French" },
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await fetchLanguages("unfoldingWord");

      expect(fetch).toHaveBeenCalledWith(
        "https://git.door43.org/api/v1/catalog/list/languages?owner=unfoldingWord"
      );
      expect(result).toEqual(expectedLanguages);
    });

    it("should return empty array when no owner provided", async () => {
      const result = await fetchLanguages("");

      expect(fetch).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should return fallback languages when API fails", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await fetchLanguages("unfoldingWord");

      const expectedFallback = [
        { code: "en", name: "English", direction: "ltr" },
        { code: "es", name: "Spanish", direction: "ltr" },
        { code: "fr", name: "French", direction: "ltr" },
        { code: "pt", name: "Portuguese", direction: "ltr" },
        { code: "hi", name: "Hindi", direction: "ltr" },
        { code: "ar", name: "Arabic", direction: "rtl" },
        { code: "sw", name: "Swahili", direction: "ltr" },
        { code: "zh", name: "Chinese", direction: "ltr" },
        { code: "ru", name: "Russian", direction: "ltr" },
        { code: "de", name: "German", direction: "ltr" },
        { code: "it", name: "Italian", direction: "ltr" },
        { code: "ja", name: "Japanese", direction: "ltr" },
        { code: "ko", name: "Korean", direction: "ltr" },
        { code: "nl", name: "Dutch", direction: "ltr" },
        { code: "pl", name: "Polish", direction: "ltr" },
        { code: "tr", name: "Turkish", direction: "ltr" },
        { code: "vi", name: "Vietnamese", direction: "ltr" },
        { code: "th", name: "Thai", direction: "ltr" },
        { code: "id", name: "Indonesian", direction: "ltr" },
        { code: "ms", name: "Malay", direction: "ltr" },
      ];
      expect(result).toEqual(expectedFallback);
    });

    it("should handle special characters in owner name with URL encoding", async () => {
      const mockApiResponse = { data: [{ lc: "en", ln: "English" }] };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      await fetchLanguages("test-org with spaces");

      expect(fetch).toHaveBeenCalledWith(
        "https://git.door43.org/api/v1/catalog/list/languages?owner=test-org%20with%20spaces"
      );
    });

    it("should handle missing lc field in language data", async () => {
      const mockApiResponse = {
        data: [
          { lc: "en", ln: "English" },
          { ln: "Invalid - No lc field" }, // Missing lc field
          { lc: "", ln: "Empty lc field" }, // Empty lc field
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await fetchLanguages("unfoldingWord");

      expect(result).toEqual([
        {
          code: "en",
          name: "English",
          direction: "ltr",
          raw: { lc: "en", ln: "English" },
        },
      ]);
    });
  });

  describe("fetchResources", () => {
    it("should fetch and return resources from API with correct URL and response structure", async () => {
      const mockApiResponse = {
        data: [
          "Aligned Bible",
          "Translation Academy",
          "Translation Notes",
          "Translation Questions",
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await fetchResources("unfoldingWord", "en");

      expect(fetch).toHaveBeenCalledWith(
        "https://git.door43.org/api/v1/catalog/list/subjects?owner=unfoldingWord&lang=en"
      );
      expect(result).toEqual([
        "Aligned Bible",
        "Translation Academy",
        "Translation Notes",
        "Translation Questions",
      ]);
    });

    it("should return empty array when owner or language missing", async () => {
      expect(await fetchResources("", "en")).toEqual([]);
      expect(await fetchResources("unfoldingWord", "")).toEqual([]);
      expect(await fetchResources("", "")).toEqual([]);

      expect(fetch).not.toHaveBeenCalled();
    });

    it("should return fallback resources when API fails", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await fetchResources("unfoldingWord", "en");

      expect(result).toEqual(["ult", "ust", "tn", "tq", "tw", "twl", "ta"]);
    });

    it("should sort resources alphabetically", async () => {
      const mockApiResponse = {
        data: ["Translation Words", "Bible", "Aligned Bible", "Translation Notes"],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await fetchResources("unfoldingWord", "en");

      expect(result).toEqual(["Aligned Bible", "Bible", "Translation Notes", "Translation Words"]);
    });

    it("should handle special characters in parameters with URL encoding", async () => {
      const mockApiResponse = { data: ["Translation Notes"] };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      await fetchResources("test-org with spaces", "en-US");

      expect(fetch).toHaveBeenCalledWith(
        "https://git.door43.org/api/v1/catalog/list/subjects?owner=test-org%20with%20spaces&lang=en-US"
      );
    });

    it("should filter out non-string resources", async () => {
      const mockApiResponse = {
        data: ["Translation Notes", null, undefined, "", "Translation Words", 123],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await fetchResources("unfoldingWord", "en");

      expect(result).toEqual(["Translation Notes", "Translation Words"]);
    });
  });

  describe("preloadCatalogData", () => {
    it("should preload organizations", async () => {
      const mockApiResponse = {
        data: [{ login: "unfoldingWord", full_name: "unfoldingWord" }],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      await preloadCatalogData();

      expect(fetch).toHaveBeenCalledWith("https://git.door43.org/api/v1/catalog/list/owners");
    });

    it("should preload organizations and languages when owner provided", async () => {
      const mockOrgResponse = {
        data: [{ login: "unfoldingWord", full_name: "unfoldingWord" }],
      };
      const mockLangResponse = { data: [{ lc: "en", ln: "English" }] };

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockOrgResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLangResponse,
        });

      await preloadCatalogData("unfoldingWord");

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenNthCalledWith(1, "https://git.door43.org/api/v1/catalog/list/owners");
      expect(fetch).toHaveBeenNthCalledWith(
        2,
        "https://git.door43.org/api/v1/catalog/list/languages?owner=unfoldingWord"
      );
    });

    it("should handle errors gracefully", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      // Should not throw
      await expect(preloadCatalogData()).resolves.toBeUndefined();
    });
  });

  describe("caching behavior", () => {
    it("should use cached data on subsequent calls", async () => {
      const mockApiResponse = {
        data: [{ login: "unfoldingWord", full_name: "unfoldingWord" }],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      // First call should hit API
      await fetchOrganizations();
      // Second call should use cache
      await fetchOrganizations();

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("should clear cache when clearCatalogCache is called", async () => {
      const mockApiResponse = {
        data: [{ login: "unfoldingWord", full_name: "unfoldingWord" }],
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      // First call
      await fetchOrganizations();
      clearCatalogCache();
      // Second call after cache clear
      await fetchOrganizations();

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("error handling", () => {
    it("should handle HTTP error responses", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      const result = await fetchOrganizations();
      const fallbackOrganizations = [
        {
          login: "unfoldingWord",
          full_name: "unfoldingWord",
          description: "Open Bible resources for every language",
          avatar_url: null,
          website: "https://unfoldingword.org",
        },
        {
          login: "door43-catalog",
          full_name: "Door43 Catalog",
          description: "Community-driven translation hub",
          avatar_url: null,
          website: "https://door43.org",
        },
        {
          login: "STR",
          full_name: "STR",
          description: "Scripture Translation Resources",
          avatar_url: null,
          website: null,
        },
        {
          login: "WA",
          full_name: "WA",
          description: "Wycliffe Associates",
          avatar_url: null,
          website: null,
        },
      ];
      expect(result).toEqual(fallbackOrganizations);
    });

    it("should handle network errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await fetchLanguages("unfoldingWord");

      const expectedFallback = [
        { code: "en", name: "English", direction: "ltr" },
        { code: "es", name: "Spanish", direction: "ltr" },
        { code: "fr", name: "French", direction: "ltr" },
        { code: "pt", name: "Portuguese", direction: "ltr" },
        { code: "hi", name: "Hindi", direction: "ltr" },
        { code: "ar", name: "Arabic", direction: "rtl" },
        { code: "sw", name: "Swahili", direction: "ltr" },
        { code: "zh", name: "Chinese", direction: "ltr" },
        { code: "ru", name: "Russian", direction: "ltr" },
        { code: "de", name: "German", direction: "ltr" },
        { code: "it", name: "Italian", direction: "ltr" },
        { code: "ja", name: "Japanese", direction: "ltr" },
        { code: "ko", name: "Korean", direction: "ltr" },
        { code: "nl", name: "Dutch", direction: "ltr" },
        { code: "pl", name: "Polish", direction: "ltr" },
        { code: "tr", name: "Turkish", direction: "ltr" },
        { code: "vi", name: "Vietnamese", direction: "ltr" },
        { code: "th", name: "Thai", direction: "ltr" },
        { code: "id", name: "Indonesian", direction: "ltr" },
        { code: "ms", name: "Malay", direction: "ltr" },
      ];
      expect(result).toEqual(expectedFallback);
    });

    it("should handle JSON parsing errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const result = await fetchOrganizations();
      const fallbackOrganizations = [
        {
          login: "unfoldingWord",
          full_name: "unfoldingWord",
          description: "Open Bible resources for every language",
          avatar_url: null,
          website: "https://unfoldingword.org",
        },
        {
          login: "door43-catalog",
          full_name: "Door43 Catalog",
          description: "Community-driven translation hub",
          avatar_url: null,
          website: "https://door43.org",
        },
        {
          login: "STR",
          full_name: "STR",
          description: "Scripture Translation Resources",
          avatar_url: null,
          website: null,
        },
        {
          login: "WA",
          full_name: "WA",
          description: "Wycliffe Associates",
          avatar_url: null,
          website: null,
        },
      ];
      expect(result).toEqual(fallbackOrganizations);
    });
  });

  describe("API response validation tests", () => {
    it("should validate organizations API response structure", async () => {
      // Test with null data
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null, ok: true }),
      });

      let result = await fetchOrganizations();
      const fallbackOrganizations = [
        {
          login: "unfoldingWord",
          full_name: "unfoldingWord",
          description: "Open Bible resources for every language",
          avatar_url: null,
          website: "https://unfoldingword.org",
        },
        {
          login: "door43-catalog",
          full_name: "Door43 Catalog",
          description: "Community-driven translation hub",
          avatar_url: null,
          website: "https://door43.org",
        },
        {
          login: "STR",
          full_name: "STR",
          description: "Scripture Translation Resources",
          avatar_url: null,
          website: null,
        },
        {
          login: "WA",
          full_name: "WA",
          description: "Wycliffe Associates",
          avatar_url: null,
          website: null,
        },
      ];
      expect(result).toEqual(fallbackOrganizations);

      // Test with missing data field
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      });

      result = await fetchOrganizations();
      expect(result).toEqual(fallbackOrganizations);
    });

    it("should validate languages API response structure", async () => {
      // Test with null data
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null, ok: true }),
      });

      let result = await fetchLanguages("unfoldingWord");
      expect(result).toEqual([
        { code: "en", name: "English", direction: "ltr" },
        { code: "es", name: "Spanish", direction: "ltr" },
        { code: "fr", name: "French", direction: "ltr" },
        { code: "pt", name: "Portuguese", direction: "ltr" },
        { code: "hi", name: "Hindi", direction: "ltr" },
        { code: "ar", name: "Arabic", direction: "rtl" },
        { code: "sw", name: "Swahili", direction: "ltr" },
        { code: "zh", name: "Chinese", direction: "ltr" },
        { code: "ru", name: "Russian", direction: "ltr" },
        { code: "de", name: "German", direction: "ltr" },
        { code: "it", name: "Italian", direction: "ltr" },
        { code: "ja", name: "Japanese", direction: "ltr" },
        { code: "ko", name: "Korean", direction: "ltr" },
        { code: "nl", name: "Dutch", direction: "ltr" },
        { code: "pl", name: "Polish", direction: "ltr" },
        { code: "tr", name: "Turkish", direction: "ltr" },
        { code: "vi", name: "Vietnamese", direction: "ltr" },
        { code: "th", name: "Thai", direction: "ltr" },
        { code: "id", name: "Indonesian", direction: "ltr" },
        { code: "ms", name: "Malay", direction: "ltr" },
      ]);

      // Test with missing data field
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      });

      result = await fetchLanguages("unfoldingWord");
      expect(result).toEqual([
        { code: "en", name: "English", direction: "ltr" },
        { code: "es", name: "Spanish", direction: "ltr" },
        { code: "fr", name: "French", direction: "ltr" },
        { code: "pt", name: "Portuguese", direction: "ltr" },
        { code: "hi", name: "Hindi", direction: "ltr" },
        { code: "ar", name: "Arabic", direction: "rtl" },
        { code: "sw", name: "Swahili", direction: "ltr" },
        { code: "zh", name: "Chinese", direction: "ltr" },
        { code: "ru", name: "Russian", direction: "ltr" },
        { code: "de", name: "German", direction: "ltr" },
        { code: "it", name: "Italian", direction: "ltr" },
        { code: "ja", name: "Japanese", direction: "ltr" },
        { code: "ko", name: "Korean", direction: "ltr" },
        { code: "nl", name: "Dutch", direction: "ltr" },
        { code: "pl", name: "Polish", direction: "ltr" },
        { code: "tr", name: "Turkish", direction: "ltr" },
        { code: "vi", name: "Vietnamese", direction: "ltr" },
        { code: "th", name: "Thai", direction: "ltr" },
        { code: "id", name: "Indonesian", direction: "ltr" },
        { code: "ms", name: "Malay", direction: "ltr" },
      ]);
    });

    it("should validate resources API response structure", async () => {
      // Test with null data
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null, ok: true }),
      });

      let result = await fetchResources("unfoldingWord", "en");
      expect(result).toEqual(["ult", "ust", "tn", "tq", "tw", "twl", "ta"]);

      // Test with missing data field
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      });

      result = await fetchResources("unfoldingWord", "en");
      expect(result).toEqual(["ult", "ust", "tn", "tq", "tw", "twl", "ta"]);
    });
  });

  describe("Cross-Organization Features", () => {
    describe("searchResourcesAcrossOrgs", () => {
      it("should search for resources across organizations successfully", async () => {
        const mockResponse = {
          data: [
            {
              name: 'en_ult',
              identifier: 'ult',
              full_name: 'unfoldingWord/en_ult',
              description: 'unfoldingWord Literal Text',
              subject: 'Aligned Bible',
              owner: { login: 'unfoldingWord', avatar_url: 'https://example.com/avatar1.png' },
              html_url: 'https://git.door43.org/unfoldingWord/en_ult',
              stage: 'prod',
              version: '10',
              modified: '2023-01-01T00:00:00Z',
              checking: { checking_level: '3' }
            },
            {
              name: 'en_ust',
              identifier: 'ust',
              full_name: 'door43-catalog/en_ust',
              description: 'Simplified Text',
              subject: 'Bible',
              owner: { login: 'door43-catalog', avatar_url: 'https://example.com/avatar2.png' },
              html_url: 'https://git.door43.org/door43-catalog/en_ust',
              stage: 'prod',
              version: '8',
              modified: '2023-01-02T00:00:00Z'
            }
          ]
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await searchResourcesAcrossOrgs('en', 'Bible');

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('api/catalog/v5/search?lang=en&stage=prod&limit=100&subject=Bible')
        );

        expect(result).toEqual({
          'unfoldingWord': [{
            id: 'ult',
            name: 'en_ult',
            fullName: 'unfoldingWord/en_ult',
            description: 'unfoldingWord Literal Text',
            subject: 'Aligned Bible',
            organization: 'unfoldingWord',
            combinedId: 'unfoldingWord/en_ult',
            repoUrl: 'https://git.door43.org/unfoldingWord/en_ult',
            avatarUrl: 'https://example.com/avatar1.png',
            stage: 'prod',
            version: '10',
            modified: '2023-01-01T00:00:00Z',
            checking: { checking_level: '3' },
            raw: mockResponse.data[0]
          }],
          'door43-catalog': [{
            id: 'ust',
            name: 'en_ust',
            fullName: 'door43-catalog/en_ust',
            description: 'Simplified Text',
            subject: 'Bible',
            organization: 'door43-catalog',
            combinedId: 'door43-catalog/en_ust',
            repoUrl: 'https://git.door43.org/door43-catalog/en_ust',
            avatarUrl: 'https://example.com/avatar2.png',
            stage: 'prod',
            version: '8',
            modified: '2023-01-02T00:00:00Z',
            checking: undefined,
            raw: mockResponse.data[1]
          }]
        });
      });

      it("should return empty object for invalid language code", async () => {
        const result = await searchResourcesAcrossOrgs('');
        expect(result).toEqual({});
        expect(fetch).not.toHaveBeenCalled();
      });

      it("should handle resources without organization gracefully", async () => {
        const mockResponse = {
          data: [{
            name: 'mystery_resource',
            identifier: 'mystery',
            description: 'Unknown resource',
            subject: 'Unknown'
          }]
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await searchResourcesAcrossOrgs('en');

        expect(result).toHaveProperty('unknown');
        expect(result.unknown[0]).toMatchObject({
          id: 'mystery_resource',
          organization: 'unknown'
        });
      });
    });

    describe("fetchAllLanguages", () => {
      it("should fetch all languages with organization info", async () => {
        const mockResponse = {
          data: [
            { lc: 'en', ln: 'English', ld: 'ltr', owner: 'unfoldingWord' },
            { lc: 'en', ln: 'English', ld: 'ltr', owner: 'door43-catalog' },
            { lc: 'es', ln: 'Spanish', ld: 'ltr', owner: 'unfoldingWord' },
            { lc: 'fr', ln: 'French', ld: 'ltr', owner: 'door43-catalog' }
          ]
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await fetchAllLanguages(true);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('api/v1/catalog/list/languages')
        );

        // Check that the result contains the expected languages (may have more from fallback)
        expect(result).toEqual(expect.arrayContaining([
          expect.objectContaining({
            code: 'en',
            name: 'English',
            direction: 'ltr',
            organizations: expect.arrayContaining(['door43-catalog', 'unfoldingWord']),
            organizationCount: expect.any(Number)
          }),
          expect.objectContaining({
            code: 'es',
            name: 'Spanish',
            direction: 'ltr',
            organizations: expect.arrayContaining(['unfoldingWord']),
            organizationCount: expect.any(Number)
          }),
          expect.objectContaining({
            code: 'fr',
            name: 'French',
            direction: 'ltr',
            organizations: expect.arrayContaining(['door43-catalog']),
            organizationCount: expect.any(Number)
          })
        ]));
      });

      it("should handle missing language codes gracefully", async () => {
        const mockResponse = {
          data: [
            { lc: 'en', ln: 'English', ld: 'ltr' },
            { ln: 'Invalid Entry' }, // Missing lc
            { lc: 'es', ln: 'Spanish' } // Missing ld
          ]
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await fetchAllLanguages(false);

        expect(result).toEqual([
          {
            code: 'en',
            name: 'English',
            direction: 'ltr',
            organizations: undefined,
            organizationCount: undefined
          },
          {
            code: 'es',
            name: 'Spanish',
            direction: 'ltr', // Default value
            organizations: undefined,
            organizationCount: undefined
          }
        ]);
      });
    });

    describe("analyzeResourceCompatibility", () => {
      it("should return compatible for empty resources", () => {
        const result = analyzeResourceCompatibility([]);
        expect(result).toEqual({
          compatible: true,
          warnings: [],
          organizations: [],
          subjects: [],
          stages: [],
          analysis: {
            multiOrg: false,
            mixedQuality: false,
            resourceTypes: 0
          }
        });
      });

      it("should detect mixed organizations", () => {
        const resources = [
          { organization: 'unfoldingWord', subject: 'Bible', stage: 'prod' },
          { organization: 'door43-catalog', subject: 'Translation Notes', stage: 'prod' }
        ];

        const result = analyzeResourceCompatibility(resources);

        expect(result.compatible).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]).toMatchObject({
          type: 'mixed_organizations',
          severity: 'warning',
          message: expect.stringContaining('2 different organizations')
        });
        expect(result.analysis.multiOrg).toBe(true);
      });

      it("should detect mixed quality levels", () => {
        const resources = [
          { organization: 'unfoldingWord', subject: 'Bible', stage: 'prod' },
          { organization: 'unfoldingWord', subject: 'Translation Notes', stage: 'draft' }
        ];

        const result = analyzeResourceCompatibility(resources);

        expect(result.compatible).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]).toMatchObject({
          type: 'mixed_quality',
          severity: 'caution',
          message: expect.stringContaining('Mixed quality levels')
        });
        expect(result.analysis.mixedQuality).toBe(true);
      });

      it("should suggest complementary resources", () => {
        const resources = [
          { organization: 'unfoldingWord', subject: 'Aligned Bible', stage: 'prod' }
        ];

        const result = analyzeResourceCompatibility(resources);

        expect(result.compatible).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]).toMatchObject({
          type: 'missing_complement',
          severity: 'info',
          message: expect.stringContaining('no Translation Notes found')
        });
      });
    });

    describe("fetchOrganizationDetails", () => {
      it("should fetch organization details successfully", async () => {
        const mockResponse = {
          username: 'unfoldingWord',
          full_name: 'unfoldingWord',
          description: 'Open Bible resources',
          avatar_url: 'https://example.com/avatar.png',
          website: 'https://unfoldingword.org',
          location: 'Global',
          visibility: 'public',
          repo_count: 150,
          repo_languages: ['en', 'es', 'fr'],
          repo_subjects: ['Bible', 'Translation Notes', 'Translation Questions'],
          created: '2020-01-01T00:00:00Z',
          updated: '2023-01-01T00:00:00Z'
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await fetchOrganizationDetails('unfoldingWord');

        expect(fetch).toHaveBeenCalledWith(
          'https://git.door43.org/api/v1/orgs/unfoldingWord'
        );

        expect(result).toEqual({
          login: 'unfoldingWord',
          full_name: 'unfoldingWord',
          description: 'Open Bible resources',
          avatar_url: 'https://example.com/avatar.png',
          website: 'https://unfoldingword.org',
          location: 'Global',
          visibility: 'public',
          repo_count: 150,
          repo_languages: ['en', 'es', 'fr'],
          repo_subjects: ['Bible', 'Translation Notes', 'Translation Questions'],
          created: '2020-01-01T00:00:00Z',
          updated: '2023-01-01T00:00:00Z'
        });
      });

      it("should return null for invalid organization", async () => {
        const result = await fetchOrganizationDetails('');
        expect(result).toBeNull();
        expect(fetch).not.toHaveBeenCalled();
      });

      it("should handle API errors gracefully", async () => {
        fetch.mockRejectedValueOnce(new Error('API Error'));

        const result = await fetchOrganizationDetails('nonexistent');
        expect(result).toBeNull();
      });
    });
  });

  describe("Existing Features", () => {
    describe("fetchBibleResources", () => {
      it("should fetch Bible resources successfully", async () => {
        const mockResponse = {
          data: [
            {
              name: 'en_ult',
              full_name: 'unfoldingWord/en_ult',
              description: 'unfoldingWord Literal Text',
              subject: 'Aligned Bible',
              html_url: 'https://git.door43.org/unfoldingWord/en_ult'
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
            id: 'ult',
            name: 'en_ult',
            fullName: 'unfoldingWord/en_ult',
            description: 'unfoldingWord Literal Text',
            subject: 'Aligned Bible',
            repoUrl: 'https://git.door43.org/unfoldingWord/en_ult',
            avatarUrl: null,
            owner: null
          }
        ]);
      });

      it("should return empty array for missing parameters", async () => {
        const result1 = await fetchBibleResources('', 'en');
        const result2 = await fetchBibleResources('org', '');
        
        expect(result1).toEqual([]);
        expect(result2).toEqual([]);
        expect(fetch).not.toHaveBeenCalled();
      });
    });
  });
});
