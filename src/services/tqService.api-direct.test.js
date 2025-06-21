/**
 * tqService.api-direct.test.js
 * Tests for Translation Questions service using API-direct architecture
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { getQuestionsForVerse } from "./tqService.js";
import * as dcsClient from "./dcsClient.js";

// Mock the DCS client
vi.mock("./dcsClient.js");

describe("Translation Questions Service - API-Direct Architecture", () => {
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
    it("should use standard naming pattern tq_BOOK.tsv without manifest lookup", async () => {
      const mockTsvContent = `Reference\tID\tTags\tQuote\tOccurrence\tQuestion\tResponse
1:1\tgen1:1\t\tIn the beginning\t1\tWhat does "in the beginning" refer to?\tThe start of everything.
1:2\tgen1:2\t\tthe earth was without form\t1\tWhat was the condition of the earth?\tIt was without form and void.`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      const questions = await getQuestionsForVerse("gen", 1, 1);

      // Verify standard file naming is used (updated pattern)
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en",
        "tq", 
        "tq_GEN.tsv",
        "unfoldingWord"
      );

      // Verify questions are parsed correctly
      expect(questions).toEqual([
        {
          Reference: "1:1",
          ID: "gen1:1",
          Tags: "",
          Quote: "In the beginning",
          Occurrence: "1",
          Question: "What does \"in the beginning\" refer to?",
          Response: "The start of everything."
        }
      ]);
    });

    it("should handle different book IDs with consistent naming", async () => {
      const testCases = [
        { bookId: "gen", expected: "tq_GEN.tsv" },
        { bookId: "tit", expected: "tq_TIT.tsv" },
        { bookId: "mat", expected: "tq_MAT.tsv" },
        { bookId: "1co", expected: "tq_1CO.tsv" },
        { bookId: "rev", expected: "tq_REV.tsv" }
      ];

      for (const { bookId, expected } of testCases) {
        dcsClient.fetchResourceFile.mockResolvedValue("Reference\tID\tQuestion\n1:1\ttest\tQuestion?");
        
        await getQuestionsForVerse(bookId, 1, 1);
        
        expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
          "en",
          "tq",
          expected,
          "unfoldingWord"
        );
      }
    });
  });

  describe("No Manifest Dependencies", () => {
    it("should not call fetchManifest and work directly with file naming", async () => {
      const mockTsvContent = `Reference\tID\tQuestion
1:1\tgen1:1\tTest question?`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      await getQuestionsForVerse("gen", 1, 1);

      // Verify no manifest calls were made
      expect(dcsClient.fetchManifest).not.toHaveBeenCalled();
      
      // Verify direct file fetching with updated naming
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledTimes(1);
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en",
        "tq",
        "tq_GEN.tsv",
        "unfoldingWord"
      );
    });

    it("should handle file not found errors gracefully without manifest fallback", async () => {
      dcsClient.fetchResourceFile.mockRejectedValue(
        new Error("Failed to load tq_NONEXISTENT.tsv for en_tq: Not Found")
      );

      await expect(getQuestionsForVerse("nonexistent", 1, 1)).rejects.toThrow(
        "Failed to load tq_NONEXISTENT.tsv for en_tq: Not Found"
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

      await expect(getQuestionsForVerse("xyz", 1, 1)).rejects.toThrow(
        "HTTP 404: Not Found"
      );

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en",
        "tq", 
        "tq_XYZ.tsv",
        "unfoldingWord"
      );
    });

    it("should handle network errors gracefully", async () => {
      dcsClient.fetchResourceFile.mockRejectedValue(
        new Error("Network error")
      );

      await expect(getQuestionsForVerse("gen", 1, 1)).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle malformed TSV data gracefully", async () => {
      const malformedTsv = "Invalid TSV content without proper headers";
      
      dcsClient.fetchResourceFile.mockResolvedValue(malformedTsv);

      const questions = await getQuestionsForVerse("gen", 1, 1);

      // Should return empty array for malformed data
      expect(questions).toEqual([]);
    });
  });

  describe("Cross-Organization Support", () => {
    it("should work with different organizations using same naming pattern", async () => {
      global.window.ReferenceContext.resourceOrganization = "WycliffeAssociates";
      
      const mockTsvContent = `Reference\tID\tQuestion
1:1\tgen1:1\tWA question?`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      await getQuestionsForVerse("gen", 1, 1);

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en",
        "tq",
        "tq_GEN.tsv", 
        "WycliffeAssociates"
      );
    });
  });

  describe("Reference Format Handling", () => {
    it("should handle both Reference and reference column formats", async () => {
      const mockTsvWithReference = `Reference\tID\tQuestion
1:1\tgen1:1\tWhat happened in the beginning?`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvWithReference);

      const questions = await getQuestionsForVerse("gen", 1, 1);

      expect(questions).toEqual([
        {
          Reference: "1:1",
          ID: "gen1:1",
          Question: "What happened in the beginning?"
        }
      ]);
    });

    it("should filter questions by chapter and verse correctly", async () => {
      const mockTsvContent = `Reference\tID\tQuestion
1:1\tgen1:1\tFirst question
1:2\tgen1:2\tSecond question
2:1\tgen2:1\tChapter 2 question`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      const questionsVerse1 = await getQuestionsForVerse("gen", 1, 1);
      const questionsVerse2 = await getQuestionsForVerse("gen", 1, 2);

      expect(questionsVerse1).toHaveLength(1);
      expect(questionsVerse1[0].Question).toBe("First question");

      expect(questionsVerse2).toHaveLength(1);
      expect(questionsVerse2[0].Question).toBe("Second question");
    });
  });

  describe("Integration with Resource Context", () => {
    it("should use language and organization from global context", async () => {
      global.window.ReferenceContext = {
        languageId: "es",
        resourceOrganization: "unfoldingWord"
      };

      const mockTsvContent = `Reference\tID\tQuestion
1:1\tgen1:1\t¿Qué pasó al principio?`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      await getQuestionsForVerse("gen", 1, 1);

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "es",
        "tq",
        "tq_GEN.tsv",
        "unfoldingWord"
      );
    });

    it("should fallback to defaults when context is unavailable", async () => {
      global.window.ReferenceContext = {};

      const mockTsvContent = `Reference\tID\tQuestion
1:1\tgen1:1\tDefault question?`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      await getQuestionsForVerse("gen", 1, 1);

      // Should use default values
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        "en",
        "tq", 
        "tq_GEN.tsv",
        "unfoldingWord"
      );
    });
  });

  describe("Performance Optimizations", () => {
    it("should cache parsed TSV data for repeated access", async () => {
      const mockTsvContent = `Reference\tID\tQuestion
1:1\tgen1:1\tFirst question?
1:2\tgen1:2\tSecond question?`;

      dcsClient.fetchResourceFile.mockResolvedValue(mockTsvContent);

      // First call
      const questions1 = await getQuestionsForVerse("gen", 1, 1);
      
      // Second call for same book should use cached data
      const questions2 = await getQuestionsForVerse("gen", 1, 2);

      // Should only fetch file once
      expect(dcsClient.fetchResourceFile).toHaveBeenCalledTimes(1);
      
      expect(questions1).toEqual([
        { Reference: "1:1", ID: "gen1:1", Question: "First question?" }
      ]);
      
      expect(questions2).toEqual([
        { Reference: "1:2", ID: "gen1:2", Question: "Second question?" }
      ]);
    });
  });

  describe("Data Validation", () => {
    it("should handle TSV files with missing columns gracefully", async () => {
      const incompleteTsv = `Reference\tQuestion
1:1\tQuestion without ID column?`;

      dcsClient.fetchResourceFile.mockResolvedValue(incompleteTsv);

      const questions = await getQuestionsForVerse("gen", 1, 1);

      expect(questions).toEqual([
        {
          Reference: "1:1",
          Question: "Question without ID column?"
        }
      ]);
    });

    it("should handle empty TSV files", async () => {
      dcsClient.fetchResourceFile.mockResolvedValue("");

      const questions = await getQuestionsForVerse("gen", 1, 1);

      expect(questions).toEqual([]);
    });

    it("should handle TSV files with only headers", async () => {
      const headerOnlyTsv = "Reference\tID\tQuestion";

      dcsClient.fetchResourceFile.mockResolvedValue(headerOnlyTsv);

      const questions = await getQuestionsForVerse("gen", 1, 1);

      expect(questions).toEqual([]);
    });
  });
}); 