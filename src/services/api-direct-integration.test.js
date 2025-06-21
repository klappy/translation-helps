/**
 * api-direct-integration.test.js
 * Integration tests for API-direct architecture patterns
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { getNotesForVerse } from "./tnService.js";
import { getQuestionsForVerse } from "./tqService.js";
import { getLinksForVerse } from "./twlService.js";
import * as dcsClient from "./dcsClient.js";

// Mock the DCS client
vi.mock("./dcsClient.js");

describe("API-Direct Architecture Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup global context
    global.window = {
      ReferenceContext: {
        languageId: "en",
        resourceOrganization: "unfoldingWord"
      }
    };
  });

  describe("Standard File Naming Verification", () => {
    it("should use consistent tn_BOOK.tsv naming pattern for Translation Notes", async () => {
      const mockTsvContent = `Reference\tID\tNote
1:1\tgen1:1\tTest note for Genesis 1:1`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      await getNotesForVerse("gen", "1", "1");

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en",
        "tn",
        "tn_GEN.tsv",
        "unfoldingWord"
      );
    });

    it("should use consistent tq_BOOK.tsv naming pattern for Translation Questions", async () => {
      const mockTsvContent = `Reference\tID\tQuestion
1:1\tgen1:1\tTest question for Genesis 1:1?`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      await getQuestionsForVerse("gen", 1, 1);

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en",
        "tq",
        "tq_GEN.tsv",
        "unfoldingWord"
      );
    });

    it("should use consistent twl_BOOK.tsv naming pattern for Translation Word Links", async () => {
      const mockTsvContent = `Reference\tTWLink
1:1\trc://en/tw/dict/bible/kt/create`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      await getLinksForVerse("gen", 1, 1);

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "unfoldingWord",
        "twl",
        "twl_GEN.tsv",
        undefined
      );
    });
  });

  describe("Manifest Elimination Verification", () => {
    it("should not call fetchManifest for any translation helps service", async () => {
      const mockTsvContent = `Reference\tID\tNote
1:1\tgen1:1\tTest note`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      // Test all services
      await getNotesForVerse("gen", "1", "1");
      await getQuestionsForVerse("gen", 1, 1);
      await getLinksForVerse("gen", 1, 1);

      // Verify no manifest calls were made
      expect(dcsClient.fetchManifest).not.toHaveBeenCalled();
    });

    it("should work with direct file naming without manifest lookups", async () => {
      const testCases = [
        { 
          service: getNotesForVerse,
          args: ["tit", "1", "1"],
          expectedFile: "tn_TIT.tsv",
          mockContent: "Reference\tNote\n1:1\tNote for Titus"
        },
        {
          service: getQuestionsForVerse,
          args: ["tit", 1, 1],
          expectedFile: "tq_TIT.tsv",
          mockContent: "Reference\tQuestion\n1:1\tQuestion for Titus?"
        },
        {
          service: getLinksForVerse,
          args: ["tit", 1, 1],
          expectedFile: "twl_TIT.tsv",
          mockContent: "Reference\tTWLink\n1:1\trc://en/tw/dict/bible/kt/test"
        }
      ];

      for (const testCase of testCases) {
        dcsClient.fetchResourceFile.mockResolvedValue(testCase.mockContent);
        
        await testCase.service(...testCase.args);
        
        expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
          expect.any(String), // Language or organization
          expect.any(String), // Resource type
          testCase.expectedFile,
          expect.anything()   // Organization or undefined
        );
      }
    });
  });

  describe("Cross-Organization Support", () => {
    it("should work with different organizations using same naming patterns", async () => {
      global.window.ReferenceContext.resourceOrganization = "WycliffeAssociates";

      const mockTsvContent = `Reference\tNote
1:1\tWA note`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      await getNotesForVerse("gen", "1", "1");

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en",
        "tn",
        "tn_GEN.tsv",
        "WycliffeAssociates"
      );
    });

    it("should handle organization changes dynamically", async () => {
      // First call with unfoldingWord
      global.window.ReferenceContext.resourceOrganization = "unfoldingWord";
      dcsClient.fetchResourceFile.mockResolvedValue("Reference\tNote\n1:1\tUW note");
      
      await getNotesForVerse("gen", "1", "1");
      
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en", "tn", "tn_GEN.tsv", "unfoldingWord"
      );

      // Second call with different organization
      global.window.ReferenceContext.resourceOrganization = "STR";
      dcsClient.fetchResourceFile.mockResolvedValue("Reference\tNote\n1:1\tSTR note");
      
      await getNotesForVerse("gen", "1", "1");
      
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en", "tn", "tn_GEN.tsv", "STR"
      );
    });
  });

  describe("Error Handling Without Manifest Fallbacks", () => {
    it("should handle file not found errors without attempting manifest fallback", async () => {
      dcsClient.fetchResourceFile.mockRejectedValue(
        new Error("Failed to load tn_NONEXISTENT.tsv: Not Found")
      );

      await expect(getNotesForVerse("nonexistent", "1", "1")).rejects.toThrow(
        "Failed to load tn_NONEXISTENT.tsv: Not Found"
      );

      // Should not attempt any manifest operations
      expect(dcsClient.fetchManifest).not.toHaveBeenCalled();
    });

    it("should provide clear error messages for missing resources", async () => {
      dcsClient.fetchResourceFile.mockRejectedValue(
        new Error("HTTP 404: Resource not found")
      );

      await expect(getQuestionsForVerse("xyz", 1, 1)).rejects.toThrow(
        "HTTP 404: Resource not found"
      );

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en", "tq", "tq_XYZ.tsv", "unfoldingWord"
      );
    });
  });

  describe("Data Processing Verification", () => {
    it("should correctly parse Translation Notes TSV data", async () => {
      const mockTsvContent = `Reference\tID\tTags\tQuote\tOccurrence\tNote
1:1\tgen1:1\t\tIn the beginning\t1\tThis refers to the start of everything.
1:2\tgen1:2\t\tthe earth\t1\tDescribes the earth's initial state.`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      const notes = await getNotesForVerse("gen", "1", "1");

      expect(notes).toEqual([
        {
          Reference: "1:1",
          ID: "gen1:1",
          Tags: "",
          Quote: "In the beginning",
          Occurrence: "1",
          Note: "This refers to the start of everything."
        }
      ]);
    });

    it("should correctly parse Translation Questions TSV data", async () => {
      const mockTsvContent = `Reference\tID\tQuestion\tResponse
1:1\tgen1:1\tWhat does "in the beginning" refer to?\tThe start of everything.
1:2\tgen1:2\tWhat was the condition of the earth?\tIt was without form.`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      const questions = await getQuestionsForVerse("gen", 1, 1);

      expect(questions).toEqual([
        {
          Reference: "1:1",
          ID: "gen1:1",
          Question: "What does \"in the beginning\" refer to?",
          Response: "The start of everything."
        }
      ]);
    });

    it("should correctly parse Translation Word Links TSV data", async () => {
      const mockTsvContent = `Reference\tID\tTWLink
1:1\tgen1:1\trc://en/tw/dict/bible/kt/create
1:1\tgen1:1\trc://en/tw/dict/bible/kt/god
1:2\tgen1:2\trc://en/tw/dict/bible/other/earth`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      const links = await getLinksForVerse("gen", 1, 1);

      expect(links).toEqual([
        "rc://en/tw/dict/bible/kt/create",
        "rc://en/tw/dict/bible/kt/god"
      ]);
    });
  });

  describe("Performance Characteristics", () => {
    it("should make only one file request per book for repeated verse access", async () => {
      const mockTsvContent = `Reference\tNote
1:1\tFirst note
1:2\tSecond note
2:1\tChapter 2 note`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      // Multiple calls for same book
      await getNotesForVerse("gen", "1", "1");
      await getNotesForVerse("gen", "1", "2");
      await getNotesForVerse("gen", "2", "1");

      // Should only fetch file once due to caching
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledTimes(1);
    });

    it("should handle concurrent requests efficiently", async () => {
      const mockTsvContent = `Reference\tQuestion
1:1\tFirst question?
1:2\tSecond question?`;

      dcsClient.fetchResourceFile.mockImplementation(() =>
        new Promise(resolve => 
          setTimeout(() => resolve(mockTsvContent), 10)
        )
      );

      // Concurrent requests for same resource
      const [q1, q2, q3] = await Promise.all([
        getQuestionsForVerse("gen", 1, 1),
        getQuestionsForVerse("gen", 1, 1),
        getQuestionsForVerse("gen", 1, 1)
      ]);

      // Should deduplicate requests
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledTimes(1);
      expect(q1).toEqual(q2);
      expect(q2).toEqual(q3);
    });
  });

  describe("Book ID Consistency", () => {
    it("should handle various book ID formats consistently", async () => {
      const testBooks = [
        { input: "gen", expected: "GEN" },
        { input: "1co", expected: "1CO" },
        { input: "rev", expected: "REV" },
        { input: "mat", expected: "MAT" },
        { input: "tit", expected: "TIT" }
      ];

      for (const book of testBooks) {
        dcsClient.fetchResourceFile.mockResolvedValue("Reference\tNote\n1:1\tTest");
        
        await getNotesForVerse(book.input, "1", "1");
        
        expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
          "en",
          "tn",
          `tn_${book.expected}.tsv`,
          "unfoldingWord"
        );
      }
    });
  });

  describe("Context Integration", () => {
    it("should use language from global context", async () => {
      global.window.ReferenceContext.languageId = "es";

      dcsClient.fetchResourceFile.mockResolvedValue("Reference\tNote\n1:1\tNota en español");

      await getNotesForVerse("gen", "1", "1");

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "es",
        "tn",
        "tn_GEN.tsv",
        "unfoldingWord"
      );
    });

    it("should fallback gracefully when context is missing", async () => {
      global.window.ReferenceContext = {};

      dcsClient.fetchResourceFile.mockResolvedValue("Reference\tNote\n1:1\tDefault note");

      await getNotesForVerse("gen", "1", "1");

      // Should use default values
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en",
        "tn",
        "tn_GEN.tsv",
        "unfoldingWord"
      );
    });
  });
}); 