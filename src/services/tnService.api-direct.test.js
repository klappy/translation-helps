/**
 * tnService.api-direct.test.js
 * Tests for Translation Notes service using API-direct architecture
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { getNotesForVerse, getNotesForBook } from "./tnService.js";
import * as dcsClient from "./dcsClient.js";

// Mock the DCS client
vi.mock("./dcsClient.js");

describe("Translation Notes Service - API-Direct Architecture", () => {
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
    it("should use standard naming pattern tn_BOOK.tsv without manifest lookup", async () => {
      const mockTsvContent = `Reference\tID\tTags\tSupportReference\tQuote\tOccurrence\tNote
1:1\tgen1:1\t\t\tIn the beginning\t1\tThis refers to the start of everything.
1:2\tgen1:2\t\t\tthe earth was without form\t1\tDescribes the initial state.`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      const notes = await getNotesForVerse("gen", "1", "1");

      // Verify standard file naming is used
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en",
        "tn", 
        "tn_GEN.tsv",
        "unfoldingWord"
      );

      // Verify notes are parsed correctly
      expect(notes).toEqual([
        {
          Reference: "1:1",
          ID: "gen1:1",
          Tags: "",
          SupportReference: "",
          Quote: "In the beginning",
          Occurrence: "1",
          Note: "This refers to the start of everything."
        }
      ]);
    });

    it("should handle different book IDs with consistent naming", async () => {
      const testCases = [
        { bookId: "gen", expected: "tn_GEN.tsv" },
        { bookId: "tit", expected: "tn_TIT.tsv" },
        { bookId: "mat", expected: "tn_MAT.tsv" },
        { bookId: "1co", expected: "tn_1CO.tsv" },
        { bookId: "rev", expected: "tn_REV.tsv" }
      ];

      for (const { bookId, expected } of testCases) {
        dcsClient.fetchResourceFile.mockResolvedValue("Reference\tID\tNote\n1:1\ttest\tNote");
        
        await getNotesForVerse(bookId, "1", "1");
        
        expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
          "en",
          "tn",
          expected,
          "unfoldingWord"
        );
      }
    });
  });

  describe("No Manifest Dependencies", () => {
    it("should not call fetchManifest and work directly with file naming", async () => {
      const mockTsvContent = `Reference\tID\tNote
1:1\tgen1:1\tTest note`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      await getNotesForVerse("gen", "1", "1");

      // Verify no manifest calls were made
      expect(dcsClient.fetchManifest).not.toHaveBeenCalled();
      
      // Verify direct file fetching
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledTimes(1);
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en",
        "tn",
        "tn_GEN.tsv",
        "unfoldingWord"
      );
    });

    it("should handle file not found errors gracefully without manifest fallback", async () => {
      dcsClient.fetchResourceFile.mockRejectedValue(
        new Error("Failed to load tn_NONEXISTENT.tsv for en_tn: Not Found")
      );

      await expect(getNotesForVerse("nonexistent", "1", "1")).rejects.toThrow(
        "Failed to load tn_NONEXISTENT.tsv for en_tn: Not Found"
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

      await expect(getNotesForVerse("xyz", "1", "1")).rejects.toThrow(
        "HTTP 404: Not Found"
      );

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en",
        "tn", 
        "tn_XYZ.tsv",
        "unfoldingWord"
      );
    });

    it("should handle network errors gracefully", async () => {
      dcsClient.fetchResourceFile.mockRejectedValue(
        new Error("Network error")
      );

      await expect(getNotesForVerse("gen", "1", "1")).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle malformed TSV data gracefully", async () => {
      const malformedTsv = "Invalid TSV content without proper headers";
      
      dcsClient.fetchResourceFile.mockResolvedValue(malformedTsv);

      const notes = await getNotesForVerse("gen", "1", "1");

      // Should return empty array for malformed data
      expect(notes).toEqual([]);
    });
  });

  describe("Cross-Organization Support", () => {
    it("should work with different organizations using same naming pattern", async () => {
      global.window.ReferenceContext.resourceOrganization = "WycliffeAssociates";
      
      const mockTsvContent = `Reference\tID\tNote
1:1\tgen1:1\tWA note`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      await getNotesForVerse("gen", "1", "1");

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en",
        "tn",
        "tn_GEN.tsv", 
        "WycliffeAssociates"
      );
    });
  });

  describe("Integration with Resource Context", () => {
    it("should use language and organization from global context", async () => {
      global.window.ReferenceContext = {
        languageId: "es",
        resourceOrganization: "unfoldingWord"
      };

      const mockTsvContent = `Reference\tID\tNote
1:1\tgen1:1\tNota en español`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      await getNotesForVerse("gen", "1", "1");

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "es",
        "tn",
        "tn_GEN.tsv",
        "unfoldingWord"
      );
    });
  });
}); 