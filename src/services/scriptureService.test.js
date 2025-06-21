/**
 * ⚠️ CRITICAL: These tests use API-direct architecture with ingredients arrays
 * ⚠️ DO NOT revert to manifest-based testing!
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as dcsClient from "./dcsClient.js";

// Mock the dcsClient
vi.mock("./dcsClient.js");

describe("scriptureService - API-DIRECT ARCHITECTURE (NO MANIFESTS!)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockResourceData = {
    id: "ult",
    books: ["gen", "tit"],
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
  };

  const mockUSFM = "\\id TIT unfoldingWord\\n\\c 1\\n\\v 1 Paul, a servant of God...";

  describe("fetchBook - uses ingredients array (NO MANIFESTS!)", () => {
    it("fetches book using ingredients array for file path", async () => {
      const { fetchBook } = await import("./scriptureService.js");
      
      dcsClient.fetchResourceFile.mockResolvedValue(mockUSFM);

      const result = await fetchBook({
        languageId: "en",
        resourceId: "ult", 
        bookId: "tit",
        resourceData: mockResourceData,
        organization: "unfoldingWord"
      });

      expect(result).toBe(mockUSFM);
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en",
        "ult", 
        "57-TIT.usfm", // From ingredients array!
        "unfoldingWord"
      );
    });

    it("throws error when ingredients array is missing", async () => {
      const { fetchBook } = await import("./scriptureService.js");
      
      const badResourceData = { id: "ult", books: ["tit"] }; // No ingredients!

      await expect(fetchBook({
        languageId: "en",
        resourceId: "ult",
        bookId: "tit", 
        resourceData: badResourceData,
        organization: "unfoldingWord"
      })).rejects.toThrow("No ingredients array found");
    });

    it("throws error when book not found in ingredients", async () => {
      const { fetchBook } = await import("./scriptureService.js");

      await expect(fetchBook({
        languageId: "en",
        resourceId: "ult",
        bookId: "nonexistent",
        resourceData: mockResourceData,
        organization: "unfoldingWord" 
      })).rejects.toThrow("Book nonexistent not found in ult ingredients");
    });
  });

  describe("isBookAvailable - checks ingredients first", () => {
    it("returns true when book is in ingredients array", async () => {
      const { isBookAvailable } = await import("./scriptureService.js");
      
      const result = isBookAvailable("tit", mockResourceData);
      expect(result).toBe(true);
    });

    it("falls back to books array when no ingredients", async () => {
      const { isBookAvailable } = await import("./scriptureService.js");
      
      const resourceDataWithoutIngredients = {
        id: "ult",
        books: ["tit", "gen"]
      };
      
      const result = isBookAvailable("tit", resourceDataWithoutIngredients);
      expect(result).toBe(true);
    });

    it("returns false when book not found anywhere", async () => {
      const { isBookAvailable } = await import("./scriptureService.js");
      
      const result = isBookAvailable("nonexistent", mockResourceData);
      expect(result).toBe(false);
    });
  });

  describe("Legacy functions - deprecated but functional", () => {
    it("whichTestament works with resource data (deprecated)", async () => {
      const { whichTestament } = await import("./scriptureService.js");
      
      const uhbResourceData = {
        ingredients: [{ identifier: "gen" }]
      };
      const ugntResourceData = {
        ingredients: [{ identifier: "mat" }] 
      };

      const oldResult = whichTestament({ 
        bookId: "gen", 
        uhbResourceData, 
        ugntResourceData 
      });
      expect(oldResult).toBe("old");

      const newResult = whichTestament({
        bookId: "mat",
        uhbResourceData,
        ugntResourceData
      });
      expect(newResult).toBe("new");
    });

    it("fetchScriptureResources works with resource data collection (deprecated)", async () => {
      const { fetchScriptureResources } = await import("./scriptureService.js");
      
      dcsClient.fetchResourceFile.mockResolvedValue(mockUSFM);

      const resourceDataCollection = {
        ult: mockResourceData,
        ust: mockResourceData
      };

      const result = await fetchScriptureResources({
        languageId: "en",
        reference: { bookId: "tit" },
        resourceDataCollection,
        organization: "unfoldingWord"
      });

      expect(result.ult).toEqual({ 
        resourceData: mockResourceData, 
        data: mockUSFM 
      });
      expect(result.ust).toEqual({
        resourceData: mockResourceData,
        data: mockUSFM
      });
    });
  });
});
