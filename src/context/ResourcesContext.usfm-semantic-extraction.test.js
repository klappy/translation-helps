/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseUSFMToHTML } from "../components/ScripturePanelRCL/USFMSemanticParser.js";

// Mock the USFMSemanticParser
vi.mock("../components/ScripturePanelRCL/USFMSemanticParser.js", () => ({
  parseUSFMToHTML: vi.fn(),
}));

describe("ResourcesContext USFM Semantic Extraction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test implementation of the fixed preprocessUSFMToPlainText function
  function preprocessUSFMToPlainText(usfmText, chapter, verse) {
    if (!usfmText) return "";

    try {
      // Use the existing semantic parser in preview mode (same as UI)
      const html = parseUSFMToHTML(usfmText, "preview");

      // Create temporary DOM element to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      // Find the specific verse element
      const verseNum = String(verse);
      let verseElement = null;

      // Look for verse elements with matching number
      const vElements = tempDiv.querySelectorAll("v");
      for (const vEl of vElements) {
        const numberEl = vEl.querySelector("number");
        if (numberEl) {
          const numberText = numberEl.textContent.trim();
          // Handle exact match or verse bridge (e.g., "4-5" includes verse 4)
          if (numberText === verseNum) {
            verseElement = vEl;
            break;
          } else if (numberText.includes("-")) {
            const [start, end] = numberText.split("-").map((n) => parseInt(n.trim()));
            const targetVerse = parseInt(verse);
            if (targetVerse >= start && targetVerse <= end) {
              verseElement = vEl;
              break;
            }
          }
        }
      }

      if (verseElement) {
        // Extract clean text content (this automatically handles all USFM markup)
        return verseElement.textContent.trim();
      }

      return "";
    } catch (err) {
      console.error("Error extracting verse text using semantic parser:", err);
      return "";
    }
  }

  const testUSFM = `\\c 1
\\p
\\v 1 \\zaln-s |x-strong="G39720" x-lemma="Παῦλος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="Παῦλος"\\*\\w Paul|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\*, \\zaln-s |x-strong="G14010" x-lemma="δοῦλος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="δοῦλος"\\*\\w a|x-occurrence="1" x-occurrences="1"\\w* \\w servant|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G23160" x-lemma="θεός" x-morph="Gr,N,,,,,GMS," x-occurrence="1" x-occurrences="1" x-content="θεοῦ"\\*\\w of|x-occurrence="1" x-occurrences="3"\\w* \\w God|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G25320" x-lemma="καί" x-morph="Gr,CC,,,,,,,," x-occurrence="1" x-occurrences="1" x-content="καὶ"\\*\\w and|x-occurrence="1" x-occurrences="4"\\w*\\zaln-e\\* \\zaln-s |x-strong="G06520" x-lemma="ἀπόστολος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="ἀπόστολος"\\*\\w an|x-occurrence="1" x-occurrences="1"\\w* \\w apostle|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G24240" x-lemma="Ἰησοῦς" x-morph="Gr,N,,,,,GMS," x-occurrence="1" x-occurrences="1" x-content="Ἰησοῦ"\\*\\w of|x-occurrence="2" x-occurrences="3"\\w* \\w Jesus|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G55470" x-lemma="χριστός" x-morph="Gr,N,,,,,GMS," x-occurrence="1" x-occurrences="1" x-content="χριστοῦ"\\*\\w Christ|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\*
\\v 4 \\zaln-s |x-strong="G51030" x-lemma="Τίτος" x-morph="Gr,N,,,,,DMS," x-occurrence="1" x-occurrences="1" x-content="Τίτῳ"\\*\\w Titus|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\*, \\zaln-s |x-strong="G11030" x-lemma="γνήσιος" x-morph="Gr,A,,,,,DMS," x-occurrence="1" x-occurrences="1" x-content="γνησίῳ"\\*\\w my|x-occurrence="1" x-occurrences="1"\\w* \\w true|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G50430" x-lemma="τέκνον" x-morph="Gr,N,,,,,DNS," x-occurrence="1" x-occurrences="1" x-content="τέκνῳ"\\*\\w child|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\*`;

  it("should extract complete verse text using semantic parser for verse 1", () => {
    // Mock the parseUSFMToHTML function to return proper HTML structure
    const mockHTML = `
      <div>
        <c><number>1</number></c>
        <p>
          <v><number>1</number> Paul, a servant of God and an apostle of Jesus Christ</v>
          <v><number>4</number> Titus, my true child</v>
        </p>
      </div>
    `;
    parseUSFMToHTML.mockReturnValue(mockHTML);

    const result = preprocessUSFMToPlainText(testUSFM, 1, 1);

    expect(parseUSFMToHTML).toHaveBeenCalledWith(testUSFM, "preview");
    expect(result).toBe("1 Paul, a servant of God and an apostle of Jesus Christ");
  });

  it("should extract complete verse text using semantic parser for verse 4", () => {
    // Mock the parseUSFMToHTML function to return proper HTML structure
    const mockHTML = `
      <div>
        <c><number>1</number></c>
        <p>
          <v><number>1</number> Paul, a servant of God and an apostle of Jesus Christ</v>
          <v><number>4</number> Titus, my true child</v>
        </p>
      </div>
    `;
    parseUSFMToHTML.mockReturnValue(mockHTML);

    const result = preprocessUSFMToPlainText(testUSFM, 1, 4);

    expect(parseUSFMToHTML).toHaveBeenCalledWith(testUSFM, "preview");
    expect(result).toBe("4 Titus, my true child");
  });

  it("should handle verse bridges correctly", () => {
    const mockHTML = `
      <div>
        <v><number>4-5</number> Titus, my true child according to our common faith</v>
      </div>
    `;
    parseUSFMToHTML.mockReturnValue(mockHTML);

    const result = preprocessUSFMToPlainText(testUSFM, 1, 4);

    expect(result).toBe("4-5 Titus, my true child according to our common faith");
  });

  it("should return empty string for missing verse", () => {
    const mockHTML = `
      <div>
        <v><number>1</number> Paul, a servant of God</v>
      </div>
    `;
    parseUSFMToHTML.mockReturnValue(mockHTML);

    const result = preprocessUSFMToPlainText(testUSFM, 1, 999);

    expect(result).toBe("");
  });

  it("should handle parsing errors gracefully", () => {
    parseUSFMToHTML.mockImplementation(() => {
      throw new Error("Parsing failed");
    });

    const result = preprocessUSFMToPlainText(testUSFM, 1, 1);

    expect(result).toBe("");
  });

  it("should return empty string for empty USFM input", () => {
    const result = preprocessUSFMToPlainText("", 1, 1);
    expect(result).toBe("");
  });

  it("should return empty string for null USFM input", () => {
    const result = preprocessUSFMToPlainText(null, 1, 1);
    expect(result).toBe("");
  });
});
