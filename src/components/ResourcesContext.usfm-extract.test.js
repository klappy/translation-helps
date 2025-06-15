import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// Extraction logic (mirrors ResourcesContext.jsx)
function extractChapterUSFM(usfmData, chapter) {
  const chapterKey = String(chapter);
  const chapterRegex = /\\c\s+(\d+)([\s\S]*?)(?=(\r?\n)\\c\s+\d+|$)/g;
  let match;
  while ((match = chapterRegex.exec(usfmData)) !== null) {
    if (match[1] === chapterKey) {
      return (`\\c ${chapterKey}` + match[2]).trim();
    }
  }
  return null;
}

describe("USFM Chapter Extraction", () => {
  const usfmPath = path.resolve(__dirname, "../../test-titus.usfm");
  const usfmData = fs.readFileSync(usfmPath, "utf8");

  it("extracts chapter 1 with expected verse markers", () => {
    const chapter1 = extractChapterUSFM(usfmData, 1);
    expect(chapter1).toContain("\\c 1");
    expect(chapter1).toContain("\\v 1");
    expect(chapter1).toContain("\\v 16");
    expect(chapter1).toContain("Paul");
    expect(chapter1).toContain("truth");
  });

  describe("USFM Alignment and English Extraction for Titus 3:5", () => {
    const usfmPath = path.resolve(__dirname, "../../test-titus.usfm");
    const usfmData = fs.readFileSync(usfmPath, "utf8");
    const chapter3 = extractChapterUSFM(usfmData, 3);

    function extractVerseUSFM(chapterUSFM, verseNum) {
      // Match \v 5 ... up to next \v or \c or end of string
      const verseRegex = new RegExp(
        `\\\\v\\s+${verseNum}\\s+([\\s\\S]*?)(?=(\\\\v\\s+\\d+|\\\\c\\s+\\d+|$))`,
        "m"
      );
      const match = chapterUSFM.match(verseRegex);
      return match ? match[1].trim() : null;
    }

    function extractAlignmentData(verseUSFM) {
      // Remove leading/trailing curly braces and whitespace
      const cleaned = verseUSFM.replace(/^\s*\{/, "").replace(/\}\s*$/, "");
      // Find all \zaln-s ... \zaln-e blocks anywhere in the string
      const zalnRegex = /\\zaln-s\s+([^\*]+)\*([\s\S]*?)\\zaln-e\*/g;
      const results = [];
      let match;
      while ((match = zalnRegex.exec(cleaned)) !== null) {
        results.push({
          attrs: match[1].trim(),
          content: match[2].trim(),
        });
      }
      return results;
    }

    function extractWords(verseUSFM) {
      // Remove leading/trailing curly braces and whitespace
      const cleaned = verseUSFM.replace(/^\s*\{/, "").replace(/\}\s*$/, "");
      // Find all \w ...\w* blocks anywhere in the string
      const wordRegex = /\\w\s+([^|]+)\|([^\*]+)\*\\w\*/g;
      const results = [];
      let match;
      while ((match = wordRegex.exec(cleaned)) !== null) {
        results.push({
          word: match[1].trim(),
          attrs: match[2].trim(),
        });
      }
      return results;
    }

    it("extracts and prints alignment and English for Titus 3:5", () => {
      const verse5 = extractVerseUSFM(chapter3, 5);
      expect(verse5).toBeTruthy();

      // Check curly brace annotation (look for '{\zaln-s' which is how the annotation starts in USFM)
      expect(verse5).toContain("{\\zaln-s");

      // Preprocess to plain text (mimic ResourcesContext logic)
      let plainText = verse5;
      plainText = plainText.replace(/\\zaln-s\s+[^\\*]*\\*/g, "");
      plainText = plainText.replace(/\\zaln-e\\*/g, "");
      plainText = plainText.replace(/\\w\s+([^|]+)\|[^\\*]*\\*\\w\\*/g, "$1");
      plainText = plainText.replace(/\\k-s\s+[^\\*]*\\*/g, "");
      plainText = plainText.replace(/\\k-e\\*/g, "");
      plainText = plainText.replace(/{[^{}]*}/g, "");
      plainText = plainText.replace(/\\[^\\s]+/g, "");
      plainText = plainText.replace(/\s+/g, " ").trim();

      // Print the raw and processed text for comparison
      console.log("Raw USFM for Titus 3:5:\n", verse5);
      console.log("Plain Text for Titus 3:5:\n", plainText);

      // Extract and print alignment data
      const alignments = extractAlignmentData(verse5);
      console.log("Alignment data for Titus 3:5:", alignments);

      // Extract and print word data
      const words = extractWords(verse5);
      console.log("Word data for Titus 3:5:", words);

      // Assert that plain text is not empty and contains expected content
      expect(plainText).not.toBe("");
      expect(plainText.toLowerCase()).toContain("saved");
      expect(plainText.toLowerCase()).toContain("washing");
    });
  });

  it("extracts chapter 2 with expected verse markers", () => {
    const chapter2 = extractChapterUSFM(usfmData, 2);
    expect(chapter2).toContain("\\c 2");
    expect(chapter2).toContain("\\v 1");
    expect(chapter2).toContain("\\v 15");
    // Instead of "Older men", check for a known English word in the USFM, e.g., "speak" or "teaching"
    expect(chapter2).toContain("\\v 1");
    expect(chapter2).toContain("speak");
    expect(chapter2).toContain("teaching");
  });

  it("extracts chapter 3 and includes curly brace annotation in verse 5", () => {
    const chapter3 = extractChapterUSFM(usfmData, 3);
    expect(chapter3).toContain("\\c 3");
    expect(chapter3).toContain("\\v 5");
    // Check for curly brace annotation (look for '{\zaln-s' in the chapter)
    expect(chapter3).toContain("{\\zaln-s");
    // Check for the word "not" in the same context
    expect(chapter3).toContain("not|x-occurrence");
  });

  it("returns null for a non-existent chapter", () => {
    const chapter99 = extractChapterUSFM(usfmData, 99);
    expect(chapter99).toBeNull();
  });

  it("extracts the last chapter and includes the last verse", () => {
    // Titus has 3 chapters, so chapter 3 is last
    const chapter3 = extractChapterUSFM(usfmData, 3);
    expect(chapter3).toContain("\\v 15");
    expect(chapter3).toContain("Grace");
  });
});
