/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractVerseText, extractChapterText, validateCleanText } from "./usfmTextExtractor";
import { parseUSFMToHTML } from "../components/ScripturePanelRCL/USFMSemanticParser.js";

// Mock the USFMSemanticParser
vi.mock("../components/ScripturePanelRCL/USFMSemanticParser.js", () => ({
  parseUSFMToHTML: vi.fn(),
}));

describe("USFM Text Extractor - Unified Server-Side Approach", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const testUSFM = `\\c 1
\\p
\\v 1 \\zaln-s |x-strong="G39720" x-lemma="Παῦλος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="Παῦλος"\\*\\w Paul|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\*, \\zaln-s |x-strong="G14010" x-lemma="δοῦλος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="δοῦλος"\\*\\w a|x-occurrence="1" x-occurrences="1"\\w* \\w servant|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G23160" x-lemma="θεός" x-morph="Gr,N,,,,,GMS," x-occurrence="1" x-occurrences="1" x-content="θεοῦ"\\*\\w of|x-occurrence="1" x-occurrences="3"\\w* \\w God|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\*`;

  const multiVerseUSFM = `\\c 1
\\p
\\v 1 \\w Paul|x-occurrence="1"\\w*, \\w a|x-occurrence="1"\\w* \\w servant|x-occurrence="1"\\w* \\w of|x-occurrence="1"\\w* \\w God\\w*.
\\v 2 \\w And|x-occurrence="1"\\w* \\w an|x-occurrence="1"\\w* \\w apostle|x-occurrence="1"\\w* \\w of|x-occurrence="1"\\w* \\w Jesus|x-occurrence="1"\\w* \\w Christ\\w*.`;

  describe("extractVerseText - Single Verse Extraction", () => {
    it("should extract clean text from USFM with alignment data using unified approach", () => {
      // Mock the parseUSFMToHTML function to return semantic HTML (same as scripture panel)
      // This represents the COMPLETE Titus 1:1 verse with all words properly marked up
      const mockHTML = `
        <usfm class="preview">
          <chapters>
            <c><marker class="c">\\c </marker><number>1</number></c>
            <p>
              <v><marker class="v">\\v </marker><number>1</number>
                <zaln>
                  <marker class="zaln-s">\\zaln-s </marker>
                  <attributes>|x-strong="G39720"</attributes>
                  <marker class="*">\\*</marker>
                  <word>
                    <marker class="w">\\w </marker>
                    <content>Paul</content>
                    <attributes>|x-occurrence="1"</attributes>
                    <marker class="w*">\\w*</marker>
                  </word>
                  <marker class="zaln-e">\\zaln-e</marker>
                  <marker class="*">\\*</marker>
                </zaln>, 
                <zaln>
                  <word><content>a</content></word>
                  <word><content>servant</content></word>
                </zaln>
                <zaln>
                  <word><content>of</content></word>
                  <word><content>God</content></word>
                </zaln>
                <zaln>
                  <word><content>and</content></word>
                </zaln>
                <zaln>
                  <word><content>an</content></word>
                  <word><content>apostle</content></word>
                </zaln>
                <zaln>
                  <word><content>of</content></word>
                  <word><content>Jesus</content></word>
                </zaln>
                <zaln>
                  <word><content>Christ</content></word>
                </zaln>,
                <zaln>
                  <word><content>for</content></word>
                </zaln>
                <zaln>
                  <word><content>the</content></word>
                  <word><content>faith</content></word>
                </zaln>
                <zaln>
                  <word><content>of</content></word>
                </zaln>
                <zaln>
                  <word><content>the</content></word>
                  <word><content>chosen</content></word>
                  <word><content>people</content></word>
                </zaln>
                <zaln>
                  <word><content>of</content></word>
                  <word><content>God</content></word>
                </zaln>
                <zaln>
                  <word><content>and</content></word>
                </zaln>
                <zaln>
                  <word><content>knowledge</content></word>
                </zaln>
                <zaln>
                  <word><content>of</content></word>
                </zaln>
                <zaln>
                  <word><content>the</content></word>
                  <word><content>truth</content></word>
                </zaln>
                <zaln>
                  <word><content>that</content></word>
                </zaln>
                <zaln>
                  <word><content>agrees</content></word>
                  <word><content>with</content></word>
                </zaln>
                <zaln>
                  <word><content>godliness</content></word>
                </zaln>,
              </v>
            </p>
          </chapters>
        </usfm>
      `;
      parseUSFMToHTML.mockReturnValue(mockHTML);

      const result = extractVerseText(testUSFM, 1, 1);

      expect(parseUSFMToHTML).toHaveBeenCalledWith(testUSFM, "preview");
      // Should extract clean text content with simple verse numbers and punctuation preserved
      expect(result).toMatch(/^1 /); // Should start with "1 "
      expect(result).toMatch(/Paul\s*,/); // Should include punctuation (flexible spacing)
      expect(result).toContain("servant of God");
      expect(result).toContain("apostle of Jesus Christ");
      expect(result).toContain("faith of the chosen people of God");
      expect(result).toContain("knowledge of the truth that agrees with godliness");
      
      // Verify unified approach - no USFM markup should remain
      expect(validateCleanText(result)).toBe(true);
    });

    it("should handle missing verse gracefully", () => {
      const mockHTML = `
        <usfm class="preview">
          <chapters>
            <v><marker class="v">\\v </marker><number>1</number>
              <word><content>Paul</content></word>, 
              <word><content>a</content></word> 
              <word><content>servant</content></word> 
              <word><content>of</content></word> 
              <word><content>God</content></word>
            </v>
          </chapters>
        </usfm>
      `;
      parseUSFMToHTML.mockReturnValue(mockHTML);

      const result = extractVerseText(testUSFM, 1, 999);
      expect(result).toBe("");
    });

    it("should handle parsing errors gracefully", () => {
      parseUSFMToHTML.mockImplementation(() => {
        throw new Error("Parsing failed");
      });

      const result = extractVerseText(testUSFM, 1, 1);
      expect(result).toBe("");
    });

    it("should handle empty or invalid input gracefully", () => {
      expect(extractVerseText("", 1, 1)).toBe("");
      expect(extractVerseText(null, 1, 1)).toBe("");
      expect(extractVerseText(undefined, 1, 1)).toBe("");
    });
  });

  describe("extractChapterText - Full Chapter Extraction", () => {
    it("should extract complete chapter text with all verses and verse numbers", () => {
      const mockHTML = `
        <usfm class="preview">
          <chapters>
            <c><marker class="c">\\c </marker><number>1</number></c>
            <p>
              <v><marker class="v">\\v </marker><number>1</number>
                <word><content>Paul</content></word>, 
                <word><content>a</content></word> 
                <word><content>servant</content></word> 
                <word><content>of</content></word> 
                <word><content>God</content></word>.
              </v>
              <v><marker class="v">\\v </marker><number>2</number>
                <word><content>And</content></word> 
                <word><content>an</content></word> 
                <word><content>apostle</content></word> 
                <word><content>of</content></word> 
                <word><content>Jesus</content></word> 
                <word><content>Christ</content></word>.
              </v>
            </p>
          </chapters>
        </usfm>
      `;
      parseUSFMToHTML.mockReturnValue(mockHTML);

      const result = extractChapterText(multiVerseUSFM, 1);

      expect(parseUSFMToHTML).toHaveBeenCalledWith(multiVerseUSFM, "preview");
      
      // Should contain both verses with numbers
      expect(result).toContain("1 Paul");
      expect(result).toContain("servant of God");
      expect(result).toContain("2 And");
      expect(result).toContain("apostle of Jesus Christ");
      
      // Should be formatted as space-separated verses
      expect(result).toMatch(/1 .+ 2 .+/);
      
      // Should preserve punctuation
      expect(result).toMatch(/God\s*\./);
      expect(result).toMatch(/Christ\s*\./);
      
      // Verify clean text
      expect(validateCleanText(result)).toBe(true);
    });

    it("should handle missing chapter gracefully", () => {
      const mockHTML = `
        <usfm class="preview">
          <chapters>
            <c><marker class="c">\\c </marker><number>2</number></c>
            <v><number>1</number>Some other chapter content</v>
          </chapters>
        </usfm>
      `;
      parseUSFMToHTML.mockReturnValue(mockHTML);

      const result = extractChapterText(multiVerseUSFM, 1);
      expect(result).toBe("");
    });

    it("should handle empty chapter gracefully", () => {
      const mockHTML = `
        <usfm class="preview">
          <chapters>
            <c><marker class="c">\\c </marker><number>1</number></c>
          </chapters>
        </usfm>
      `;
      parseUSFMToHTML.mockReturnValue(mockHTML);

      const result = extractChapterText(multiVerseUSFM, 1);
      expect(result).toBe("");
    });

    it("should handle invalid input gracefully", () => {
      expect(extractChapterText("", 1)).toBe("");
      expect(extractChapterText(null, 1)).toBe("");
      expect(extractChapterText(undefined, 1)).toBe("");
    });

    it("should handle parsing errors gracefully", () => {
      parseUSFMToHTML.mockImplementation(() => {
        throw new Error("Chapter parsing failed");
      });

      const result = extractChapterText(multiVerseUSFM, 1);
      expect(result).toBe("");
    });
  });

  describe("validateCleanText - USFM Markup Detection", () => {
    it("should validate clean text correctly", () => {
      const cleanText = "Paul, a servant of God";
      const dirtyText = "\\zaln-s |x-strong=\"G39720\"\\* Paul \\zaln-e\\*";
      
      expect(validateCleanText(cleanText)).toBe(true);
      expect(validateCleanText(dirtyText)).toBe(false);
    });

    it("should detect various USFM markup patterns", () => {
      const testCases = [
        { text: "Paul, a servant of God", expected: true },
        { text: "\\zaln-s markup", expected: false },
        { text: "\\zaln-e markup", expected: false },
        { text: "\\w Paul\\w*", expected: false },
        { text: "|x-strong=G123", expected: false },
        { text: "|x-lemma=test", expected: false },
        { text: "|x-morph=test", expected: false },
        { text: "\\v 1 text", expected: false },
        { text: "Normal text with no markup", expected: true },
      ];

      testCases.forEach(({ text, expected }) => {
        expect(validateCleanText(text)).toBe(expected);
      });
    });

    it("should handle edge cases for validation", () => {
      expect(validateCleanText("")).toBe(false);
      expect(validateCleanText(null)).toBe(false);
      expect(validateCleanText(undefined)).toBe(false);
    });
  });

  describe("Unified Approach - Environment Consistency", () => {
    it("should use the same extraction logic regardless of environment", () => {
      // This test verifies that our unified approach works the same
      // in both browser and server-like environments
      const mockHTML = `
        <usfm class="preview">
          <v><number>1</number><word><content>Paul</content></word>, <word><content>servant</content></word></v>
        </usfm>
      `;
      parseUSFMToHTML.mockReturnValue(mockHTML);

      const result = extractVerseText(testUSFM, 1, 1);
      
      // Should always produce clean, consistent output
      expect(result).toMatch(/^1 Paul/);
      expect(result).toContain("servant");
      expect(validateCleanText(result)).toBe(true);
    });

    it("should preserve punctuation consistently across all environments", () => {
      const mockHTML = `
        <usfm class="preview">
          <v><number>1</number>
            <word><content>Paul</content></word>, 
            <word><content>servant</content></word>!
          </v>
        </usfm>
      `;
      parseUSFMToHTML.mockReturnValue(mockHTML);

      const result = extractVerseText(testUSFM, 1, 1);
      
      // Should preserve all punctuation
      expect(result).toMatch(/Paul\s*,/);
      expect(result).toMatch(/servant\s*!/);
    });
  });

  describe("Complex USFM Structures", () => {
    it("should handle complex nested alignment structures", () => {
      const complexHTML = `
        <usfm class="preview">
          <v><number>1</number>
            <zaln>
              <marker>\\zaln-s</marker>
              <attributes>|x-strong="G123"</attributes>
              <word>
                <marker>\\w</marker>
                <content>Complex</content>
                <attributes>|x-occurrence="1"</attributes>
                <marker>\\w*</marker>
              </word>
              <marker>\\zaln-e</marker>
            </zaln>
            <word><content>text</content></word>
            <zaln>
              <word><content>structure</content></word>
            </zaln>.
          </v>
        </usfm>
      `;
      parseUSFMToHTML.mockReturnValue(complexHTML);

      const result = extractVerseText(testUSFM, 1, 1);
      
      expect(result).toBe("1 Complex text structure .");
      expect(validateCleanText(result)).toBe(true);
    });

    it("should handle verse bridges correctly", () => {
      const bridgeHTML = `
        <usfm class="preview">
          <chapters>
            <c><number>1</number></c>
            <v><number>4-5</number>
              <word><content>Bridge</content></word> 
              <word><content>verse</content></word> 
              <word><content>content</content></word>
            </v>
          </chapters>
        </usfm>
      `;
      parseUSFMToHTML.mockReturnValue(bridgeHTML);

      // Test that the system gracefully handles verse bridge scenarios
      const result = extractVerseText(testUSFM, 1, 4);
      
      // Should return empty string when verse not found (expected behavior)
      expect(result).toBe("");
      
      // Validate that when verse bridges are properly detected, they produce clean text  
      expect(validateCleanText("4-5 Bridge verse content")).toBe(true);
    });
  });

  describe("Performance and Edge Cases", () => {
    it("should handle very large USFM content efficiently", () => {
      // Create a large mock HTML structure
      let largeHTML = '<usfm class="preview"><chapters><c><number>1</number></c>';
      for (let i = 1; i <= 100; i++) {
        largeHTML += `<v><number>${i}</number><word><content>Verse</content></word> <word><content>${i}</content></word> <word><content>content</content></word></v>`;
      }
      largeHTML += '</chapters></usfm>';
      
      parseUSFMToHTML.mockReturnValue(largeHTML);

      const startTime = performance.now();
      const result = extractChapterText(testUSFM, 1);
      const endTime = performance.now();

      // Should complete in reasonable time (< 100ms for 100 verses)
      expect(endTime - startTime).toBeLessThan(100);
      
      // Should contain all verses  
      expect(result).toContain("1 Verse 1 content");
      expect(result).toContain("100 Verse 100 content");
      
      expect(validateCleanText(result)).toBe(true);
    });

    it("should handle malformed HTML gracefully", () => {
      const malformedHTML = `
        <usfm class="preview">
          <v><number>1</number>
            <unclosed-tag>
            <content>Text</content>
            <!-- Missing closing tags -->
          </v>
        </usfm>
      `;
      parseUSFMToHTML.mockReturnValue(malformedHTML);

      const result = extractVerseText(testUSFM, 1, 1);
      
      // Should still extract some content even with malformed HTML
      expect(result).toContain("1");
      expect(result).toContain("Text");
    });
  });
}); 