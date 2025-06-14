/**
 * USFMParser.test.js
 * Tests for the USFM Parser
 */

import { describe, it, expect } from "vitest";
import { USFMParser, parseUSFM, NODE_TYPES, debugAST } from "./USFMParser.js";

describe("USFMParser", () => {
  describe("Basic parsing", () => {
    it("should parse empty string", () => {
      const parser = new USFMParser();
      const ast = parser.parse("");

      expect(ast.type).toBe(NODE_TYPES.DOCUMENT);
      expect(ast.children.length).toBe(0);
    });

    it("should parse plain text", () => {
      const parser = new USFMParser();
      const ast = parser.parse("Hello world");

      expect(ast.type).toBe(NODE_TYPES.DOCUMENT);
      expect(ast.children.length).toBe(1);
      expect(ast.children[0].type).toBe(NODE_TYPES.TEXT);
      expect(ast.children[0].content).toBe("Hello world");
    });
  });

  describe("Header parsing", () => {
    it("should parse ID header", () => {
      const parser = new USFMParser();
      const ast = parser.parse("\\id TIT EN_ULT en_English_ltr");

      expect(ast.type).toBe(NODE_TYPES.DOCUMENT);
      expect(ast.children.length).toBe(1);

      const header = ast.children[0];
      expect(header.type).toBe(NODE_TYPES.HEADER);
      expect(header.marker).toBe("id");
      expect(header.content).toBe("TIT EN_ULT en_English_ltr");
    });

    it("should parse multiple headers", () => {
      const usfm = `\\id TIT
\\usfm 3.0
\\h Titus`;

      const ast = parseUSFM(usfm);
      expect(ast.children.length).toBe(3);

      expect(ast.children[0].type).toBe(NODE_TYPES.HEADER);
      expect(ast.children[0].marker).toBe("id");

      expect(ast.children[1].type).toBe(NODE_TYPES.HEADER);
      expect(ast.children[1].marker).toBe("usfm");

      expect(ast.children[2].type).toBe(NODE_TYPES.HEADER);
      expect(ast.children[2].marker).toBe("h");
    });
  });

  describe("Chapter and verse parsing", () => {
    it("should parse chapter marker", () => {
      const ast = parseUSFM("\\c 1");

      expect(ast.children.length).toBe(1);
      const chapter = ast.children[0];
      expect(chapter.type).toBe(NODE_TYPES.CHAPTER);
      expect(chapter.marker).toBe("c");
      expect(chapter.content).toBe("1");
    });

    it("should parse verse marker", () => {
      const ast = parseUSFM("\\v 1 In the beginning");

      expect(ast.children.length).toBe(1);
      const verse = ast.children[0];
      expect(verse.type).toBe(NODE_TYPES.VERSE);
      expect(verse.marker).toBe("v");

      // Should have number and text children
      expect(verse.children.length).toBe(2);
      expect(verse.children[0].type).toBe(NODE_TYPES.NUMBER);
      expect(verse.children[0].content).toBe("1");
      expect(verse.children[1].type).toBe(NODE_TYPES.TEXT);
      expect(verse.children[1].content).toBe(" In the beginning");
    });

    it("should parse verse with attributes", () => {
      const ast = parseUSFM('\\v 1|x-strong="G1234"\\* In the beginning');

      const verse = ast.children[0];
      expect(verse.type).toBe(NODE_TYPES.VERSE);
      expect(verse.children.length).toBe(3);

      expect(verse.children[0].type).toBe(NODE_TYPES.NUMBER);
      expect(verse.children[1].type).toBe(NODE_TYPES.ATTRIBUTES);
      expect(verse.children[1].content).toBe('x-strong="G1234"');
      expect(verse.children[2].type).toBe(NODE_TYPES.TEXT);
    });
  });

  describe("Paragraph parsing", () => {
    it("should parse paragraph marker", () => {
      const ast = parseUSFM("\\p This is a paragraph.");

      expect(ast.children.length).toBe(1);
      const paragraph = ast.children[0];
      expect(paragraph.type).toBe(NODE_TYPES.PARAGRAPH);
      expect(paragraph.marker).toBe("p");

      expect(paragraph.children.length).toBe(1);
      expect(paragraph.children[0].type).toBe(NODE_TYPES.TEXT);
      expect(paragraph.children[0].content).toBe("This is a paragraph.");
    });

    it("should parse verse within paragraph", () => {
      const ast = parseUSFM("\\p \\v 1 Verse text.");

      const paragraph = ast.children[0];
      expect(paragraph.type).toBe(NODE_TYPES.PARAGRAPH);

      expect(paragraph.children.length).toBe(1);
      const verse = paragraph.children[0];
      expect(verse.type).toBe(NODE_TYPES.VERSE);
    });
  });

  describe("Character marker parsing", () => {
    it("should parse character marker with end marker", () => {
      const ast = parseUSFM("\\w word\\w* text");

      expect(ast.children.length).toBe(2);

      const charMarker = ast.children[0];
      expect(charMarker.type).toBe(NODE_TYPES.CHARACTER);
      expect(charMarker.marker).toBe("w");
      expect(charMarker.children.length).toBe(1);
      expect(charMarker.children[0].content).toBe("word");

      const text = ast.children[1];
      expect(text.type).toBe(NODE_TYPES.TEXT);
      expect(text.content).toBe(" text");
    });

    it("should parse character marker with attributes", () => {
      const ast = parseUSFM('\\w word|x-lemma="logos"\\w* text');

      const charMarker = ast.children[0];
      expect(charMarker.type).toBe(NODE_TYPES.CHARACTER);
      expect(charMarker.children.length).toBe(2);

      expect(charMarker.children[0].type).toBe(NODE_TYPES.ATTRIBUTES);
      expect(charMarker.children[0].content).toBe('x-lemma="logos"');
      expect(charMarker.children[1].type).toBe(NODE_TYPES.TEXT);
      expect(charMarker.children[1].content).toBe("word");
    });

    it("should parse nested character markers", () => {
      const ast = parseUSFM("\\w \\add added\\add* word\\w*");

      const outerChar = ast.children[0];
      expect(outerChar.type).toBe(NODE_TYPES.CHARACTER);
      expect(outerChar.marker).toBe("w");

      expect(outerChar.children.length).toBe(3);
      expect(outerChar.children[0].type).toBe(NODE_TYPES.TEXT);
      expect(outerChar.children[0].content).toBe(" ");

      expect(outerChar.children[1].type).toBe(NODE_TYPES.CHARACTER);
      expect(outerChar.children[1].marker).toBe("add");

      expect(outerChar.children[2].type).toBe(NODE_TYPES.TEXT);
      expect(outerChar.children[2].content).toBe(" word");
    });
  });

  describe("Complex document parsing", () => {
    it("should parse a complete USFM document", () => {
      const usfm = `\\id TIT
\\usfm 3.0
\\h Titus
\\c 1
\\p
\\v 1 Paul, a servant of God and an apostle of Jesus Christ.
\\v 2 In hope of eternal life.`;

      const ast = parseUSFM(usfm);

      // Should have headers, chapter, and paragraph
      expect(ast.children.length).toBe(5);

      // Headers
      expect(ast.children[0].type).toBe(NODE_TYPES.HEADER);
      expect(ast.children[1].type).toBe(NODE_TYPES.HEADER);
      expect(ast.children[2].type).toBe(NODE_TYPES.HEADER);

      // Chapter
      expect(ast.children[3].type).toBe(NODE_TYPES.CHAPTER);

      // Paragraph with verses
      expect(ast.children[4].type).toBe(NODE_TYPES.PARAGRAPH);
      const paragraph = ast.children[4];
      expect(paragraph.children.length).toBe(2); // Two verses

      expect(paragraph.children[0].type).toBe(NODE_TYPES.VERSE);
      expect(paragraph.children[1].type).toBe(NODE_TYPES.VERSE);
    });

    it("should handle the borked parser input", () => {
      // This is the actual problematic input from the user
      const usfm = `\\id TIT EN_ULT en_English_ltr Wed Aug 24 2022 09:32:57 GMT-0400 (Eastern Daylight Time) tc
\\usfm 3.0
\\ide UTF-8
\\h Titus
\\toc1 The Letter of Paul to Titus
\\toc2 Titus
\\toc3 Tit
\\mt Titus
\\c 1
\\v 1|x-strong="G39720" x-lemma="Παῦλος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="Παῦλος"\\*\\w Paul|x-occurrence="1" x-occurrences="1"\\w*`;

      const ast = parseUSFM(usfm);

      // Should parse without throwing errors
      expect(ast.type).toBe(NODE_TYPES.DOCUMENT);
      expect(ast.children.length).toBeGreaterThan(0);

      // Find the verse
      const verses = [];
      function findVerses(node) {
        if (node.type === NODE_TYPES.VERSE) {
          verses.push(node);
        }
        for (const child of node.children) {
          findVerses(child);
        }
      }
      findVerses(ast);

      expect(verses.length).toBe(1);
      const verse = verses[0];
      expect(verse.marker).toBe("v");

      // Should have number, attributes, and content
      expect(verse.children.length).toBeGreaterThan(0);
    });
  });

  describe("Utility functions", () => {
    it("should extract text content", () => {
      const ast = parseUSFM("\\p Hello \\w world\\w* text");
      const paragraph = ast.children[0];

      const textContent = paragraph.getTextContent();
      expect(textContent).toBe("Hello world text");
    });

    it("should find children by type", () => {
      const ast = parseUSFM("\\p \\v 1 Text \\v 2 More text");
      const paragraph = ast.children[0];

      const verses = paragraph.findChildren(NODE_TYPES.VERSE);
      expect(verses.length).toBe(2);
    });

    it("should find children by marker", () => {
      const ast = parseUSFM("\\p \\v 1 Text \\v 2 More text");
      const paragraph = ast.children[0];

      const verses = paragraph.findChildrenByMarker("v");
      expect(verses.length).toBe(2);
    });
  });

  describe("Debug functionality", () => {
    it("should generate debug output", () => {
      const ast = parseUSFM("\\p \\v 1 Hello");
      const debug = debugAST(ast);

      expect(debug).toContain("document");
      expect(debug).toContain("paragraph");
      expect(debug).toContain("verse");
      expect(debug).toContain("Hello");
    });
  });

  describe("Error handling", () => {
    it("should handle unknown markers gracefully", () => {
      const ast = parseUSFM("\\unknownmarker content");

      // Should treat as text
      expect(ast.children.length).toBe(1);
      expect(ast.children[0].type).toBe(NODE_TYPES.TEXT);
    });

    it("should handle malformed input", () => {
      const ast = parseUSFM("\\w unclosed marker");

      // Should not throw errors
      expect(ast.type).toBe(NODE_TYPES.DOCUMENT);
    });

    it("should handle empty markers", () => {
      const ast = parseUSFM("\\ empty");

      // Should handle gracefully
      expect(ast.type).toBe(NODE_TYPES.DOCUMENT);
    });
  });
});
