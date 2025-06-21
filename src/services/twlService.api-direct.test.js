/**
 * twlService.api-direct.test.js
 * Tests for Translation Word Links service using API-direct architecture
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { getLinksForVerse } from "./twlService.js";
import * as dcsClient from "./dcsClient.js";

// Mock the DCS client
vi.mock("./dcsClient.js");

describe("Translation Word Links Service - API-Direct Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset global context
    global.window = {
      ReferenceContext: {
        languageId: "en",
        resourceOrganization: "unfoldingWord"
      }
    };
  });

  describe("Standard File Naming Pattern", () => {
    it("should use standard naming pattern twl_BOOK.tsv without manifest lookup", async () => {
      const mockTsvContent = `Reference\tID\tTags\tOrigWords\tOccurrence\tTWLink
1:1\tgen1:1\t\tcreate\t1\trc://en/tw/dict/bible/kt/create
1:2\tgen1:2\t\tearth\t1\trc://en/tw/dict/bible/other/earth`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      const links = await getLinksForVerse("gen", 1, 1);

      // Verify standard file naming is used (updated pattern)
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "unfoldingWord",
        "twl", 
        "twl_GEN.tsv",
        undefined // No manifest parameter
      );

      // Verify links are parsed correctly
      expect(links).toEqual(["rc://en/tw/dict/bible/kt/create"]);
    });

    it("should handle different book IDs with consistent naming", async () => {
      const testCases = [
        { bookId: "gen", expected: "twl_GEN.tsv" },
        { bookId: "tit", expected: "twl_TIT.tsv" },
        { bookId: "mat", expected: "twl_MAT.tsv" },
        { bookId: "1co", expected: "twl_1CO.tsv" },
        { bookId: "rev", expected: "twl_REV.tsv" }
      ];

      for (const { bookId, expected } of testCases) {
        dcsClient.fetchResourceFile.mockResolvedValue("Reference\tTWLink\n1:1\trc://en/tw/dict/bible/kt/test");
        
        await getLinksForVerse(bookId, 1, 1);
        
        expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
          "unfoldingWord",
          "twl",
          expected,
          undefined
        );
      }
    });
  });

  describe("No Manifest Dependencies", () => {
    it("should not call fetchManifest and work directly with file naming", async () => {
      const mockTsvContent = `Reference\tTWLink
1:1\trc://en/tw/dict/bible/kt/test`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      await getLinksForVerse("gen", 1, 1);

      // Verify no manifest calls were made
      expect(dcsClient.fetchManifest).not.toHaveBeenCalled();
      
      // Verify direct file fetching with updated naming
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledTimes(1);
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "unfoldingWord",
        "twl",
        "twl_GEN.tsv",
        undefined
      );
    });

    it("should handle file not found errors gracefully without manifest fallback", async () => {
      dcsClient.fetchResourceFile.mockRejectedValue(
        new Error("Failed to load twl_NONEXISTENT.tsv for en_twl: Not Found")
      );

      await expect(getLinksForVerse("nonexistent", 1, 1)).rejects.toThrow(
        "Failed to load twl_NONEXISTENT.tsv for en_twl: Not Found"
      );

      // Should not attempt manifest lookup on failure
      expect(dcsClient.fetchManifest).not.toHaveBeenCalled();
    });
  });

  describe("Enhanced Error Handling", () => {
    it("should provide clear error messages for missing files", async () => {
      dcsClient.fetchResourceFile.mockRejectedValue(
        new Error("HTTP 404: Not Found")
      );

      await expect(getLinksForVerse("xyz", 1, 1)).rejects.toThrow(
        "HTTP 404: Not Found"
      );

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "unfoldingWord",
        "twl", 
        "twl_XYZ.tsv",
        undefined
      );
    });

    it("should handle network errors gracefully", async () => {
      dcsClient.fetchResourceFile.mockRejectedValue(
        new Error("Network error")
      );

      await expect(getLinksForVerse("gen", 1, 1)).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle malformed TSV data gracefully", async () => {
      const malformedTsv = "Invalid TSV content without proper headers";
      
      dcsClient.fetchResourceFile.mockResolvedValue(malformedTsv);

      const links = await getLinksForVerse("gen", 1, 1);

      // Should return empty array for malformed data
      expect(links).toEqual([]);
    });
  });

  describe("Cross-Organization Support", () => {
    it("should work with different organizations using same naming pattern", async () => {
      global.window.ReferenceContext.resourceOrganization = "WycliffeAssociates";
      
      const mockTsvContent = `Reference\tTWLink
1:1\trc://en/tw/dict/bible/kt/create`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      await getLinksForVerse("gen", 1, 1);

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "WycliffeAssociates",
        "twl",
        "twl_GEN.tsv", 
        undefined
      );
    });
  });

  describe("Link Extraction and Filtering", () => {
    it("should extract TWLink values and filter by verse", async () => {
      const mockTsvContent = `Reference\tID\tTWLink
1:1\tgen1:1\trc://en/tw/dict/bible/kt/create
1:2\tgen1:2\trc://en/tw/dict/bible/other/earth
2:1\tgen2:1\trc://en/tw/dict/bible/kt/god`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      const linksVerse1 = await getLinksForVerse("gen", 1, 1);
      const linksVerse2 = await getLinksForVerse("gen", 1, 2);

      expect(linksVerse1).toEqual(["rc://en/tw/dict/bible/kt/create"]);
      expect(linksVerse2).toEqual(["rc://en/tw/dict/bible/other/earth"]);
    });

    it("should handle multiple links for the same verse", async () => {
      const mockTsvContent = `Reference\tTWLink
1:1\trc://en/tw/dict/bible/kt/create
1:1\trc://en/tw/dict/bible/kt/god
1:1\trc://en/tw/dict/bible/other/heaven`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      const links = await getLinksForVerse("gen", 1, 1);

      expect(links).toEqual([
        "rc://en/tw/dict/bible/kt/create",
        "rc://en/tw/dict/bible/kt/god", 
        "rc://en/tw/dict/bible/other/heaven"
      ]);
    });

    it("should handle empty or missing TWLink values", async () => {
      const mockTsvContent = `Reference\tTWLink
1:1\trc://en/tw/dict/bible/kt/create
1:2\t
1:3\trc://en/tw/dict/bible/kt/god`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      const links = await getLinksForVerse("gen", 1, 2);

      expect(links).toEqual([]); // Should filter out empty links
    });
  });

  describe("Integration with Resource Context", () => {
    it("should use organization from global context", async () => {
      global.window.ReferenceContext = {
        languageId: "es",
        resourceOrganization: "unfoldingWord"
      };

      const mockTsvContent = `Reference\tTWLink
1:1\trc://es/tw/dict/bible/kt/crear`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      await getLinksForVerse("gen", 1, 1);

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "unfoldingWord",
        "twl",
        "twl_GEN.tsv",
        undefined
      );
    });

    it("should fallback to defaults when context is unavailable", async () => {
      global.window.ReferenceContext = {};

      const mockTsvContent = `Reference\tTWLink
1:1\trc://en/tw/dict/bible/kt/create`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      await getLinksForVerse("gen", 1, 1);

      // Should use default organization
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "unfoldingWord",
        "twl", 
        "twl_GEN.tsv",
        undefined
      );
    });
  });

  describe("Performance Optimizations", () => {
    it("should cache parsed TSV data for repeated access", async () => {
      const mockTsvContent = `Reference\tTWLink
1:1\trc://en/tw/dict/bible/kt/create
1:2\trc://en/tw/dict/bible/other/earth`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      // First call
      const links1 = await getLinksForVerse("gen", 1, 1);
      
      // Second call for same book should use cached data
      const links2 = await getLinksForVerse("gen", 1, 2);

      // Should only fetch file once
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledTimes(1);
      
      expect(links1).toEqual(["rc://en/tw/dict/bible/kt/create"]);
      expect(links2).toEqual(["rc://en/tw/dict/bible/other/earth"]);
    });
  });

  describe("Data Validation", () => {
    it("should handle TSV files with missing columns gracefully", async () => {
      const incompleteTsv = `Reference\tOtherColumn
1:1\tSome value`;

      dcsClient.fetchResourceFile.mockResolvedValue(incompleteTsv);

      const links = await getLinksForVerse("gen", 1, 1);

      expect(links).toEqual([]); // No TWLink column means no links
    });

    it("should handle empty TSV files", async () => {
      dcsClient.fetchResourceFile.mockResolvedValue("");

      const links = await getLinksForVerse("gen", 1, 1);

      expect(links).toEqual([]);
    });

    it("should handle TSV files with only headers", async () => {
      const headerOnlyTsv = "Reference\tTWLink";

      dcsClient.fetchResourceFile.mockResolvedValue(headerOnlyTsv);

      const links = await getLinksForVerse("gen", 1, 1);

      expect(links).toEqual([]);
    });

    it("should validate RC link format", async () => {
      const mockTsvContent = `Reference\tTWLink
1:1\trc://en/tw/dict/bible/kt/create
1:2\tinvalid-link-format
1:3\trc://en/tw/dict/bible/other/earth`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      const links1 = await getLinksForVerse("gen", 1, 1);
      const links2 = await getLinksForVerse("gen", 1, 2);
      const links3 = await getLinksForVerse("gen", 1, 3);

      expect(links1).toEqual(["rc://en/tw/dict/bible/kt/create"]);
      expect(links2).toEqual(["invalid-link-format"]); // Still includes invalid links
      expect(links3).toEqual(["rc://en/tw/dict/bible/other/earth"]);
    });
  });
}); 