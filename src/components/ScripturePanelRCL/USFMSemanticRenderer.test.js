/**
 * USFMSemanticRenderer.test.js
 * Tests for USFM Semantic Renderer that validates specification compliance
 *
 * Key Requirements:
 * 1. .textContent must equal original USFM input exactly
 * 2. All markers, attributes, and content must be preserved in DOM
 * 3. CSS classes control visibility (preview/full/debug modes)
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import USFMSemanticRenderer from "./USFMSemanticRenderer";

describe("USFMSemanticRenderer Specification Compliance", () => {
  describe("Core Requirement: textContent Preservation", () => {
    it("should preserve exact textContent for simple verse", () => {
      const usfm = "\\v 1 In the beginning";
      const { container } = render(
        React.createElement(USFMSemanticRenderer, { usfm, mode: "preview", showModeToggle: false })
      );

      // Critical requirement: textContent must match input exactly
      expect(container.textContent).toBe(usfm);
    });

    it("should preserve exact textContent for verse with alignment markers", () => {
      const usfm = `\\v 1 \\zaln-s |x-strong="G39720"\\*\\w Paul\\w*\\zaln-e\\*`;
      const { container } = render(
        React.createElement(USFMSemanticRenderer, { usfm, mode: "preview", showModeToggle: false })
      );

      // Every character must be preserved
      expect(container.textContent).toBe(usfm);
    });

    it("should preserve exact textContent for complex verse from test case", () => {
      const usfm = `\\v 1 \\zaln-s |x-strong="G39720" x-lemma="Παῦλος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="Παῦλος"\\*\\w Paul|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\*, \\zaln-s |x-strong="G14010" x-lemma="δοῦλος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="δοῦλος"\\*\\w a|x-occurrence="1" x-occurrences="1"\\w* \\w servant|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\*`;
      const { container } = render(
        React.createElement(USFMSemanticRenderer, { usfm, mode: "preview", showModeToggle: false })
      );

      expect(container.textContent).toBe(usfm);
    });

    it("should preserve whitespace exactly", () => {
      const usfm = "\\v 1  Text with   multiple    spaces\n\\v 2 Next verse";
      const { container } = render(
        React.createElement(USFMSemanticRenderer, { usfm, mode: "preview", showModeToggle: false })
      );

      expect(container.textContent).toBe(usfm);
    });
  });

  describe("HTML Structure Requirements", () => {
    it("should generate semantic HTML for verse marker", () => {
      const usfm = "\\v 1 Text";
      const { container } = render(
        React.createElement(USFMSemanticRenderer, { usfm, mode: "preview", showModeToggle: false })
      );

      // Should have semantic structure
      const usfmElement = container.querySelector("usfm");
      expect(usfmElement).toBeTruthy();
      expect(usfmElement.classList.contains("preview")).toBe(true);

      // Should have verse element
      const verseElement = container.querySelector("v");
      expect(verseElement).toBeTruthy();

      // Should have marker elements
      const markerElements = container.querySelectorAll("marker");
      expect(markerElements.length).toBeGreaterThan(0);
    });

    it("should generate correct structure for word markup", () => {
      const usfm = "\\w Paul\\w*";
      const { container } = render(
        React.createElement(USFMSemanticRenderer, { usfm, mode: "preview", showModeToggle: false })
      );

      // Should have word element
      const wordElement = container.querySelector("word");
      expect(wordElement).toBeTruthy();

      // Should have marker and content elements
      const markerElements = container.querySelectorAll("marker");
      const contentElement = container.querySelector("content");

      expect(markerElements.length).toBe(2); // \w and \w*
      expect(contentElement).toBeTruthy();
      expect(contentElement.textContent).toBe("Paul");
    });

    it("should generate correct structure for alignment markers", () => {
      const usfm = `\\zaln-s |x-strong="G123"\\*\\w Paul\\w*\\zaln-e\\*`;
      const { container } = render(
        React.createElement(USFMSemanticRenderer, { usfm, mode: "preview", showModeToggle: false })
      );

      // Should have zaln element
      const zalnElement = container.querySelector("zaln");
      expect(zalnElement).toBeTruthy();

      // Should have attributes element
      const attributesElement = container.querySelector("attributes");
      expect(attributesElement).toBeTruthy();
      expect(attributesElement.textContent).toBe('|x-strong="G123"');
    });
  });

  describe("View Mode CSS Classes", () => {
    it("should apply preview mode class", () => {
      const usfm = "\\v 1 Text";
      const { container } = render(
        React.createElement(USFMSemanticRenderer, { usfm, mode: "preview", showModeToggle: false })
      );

      const usfmElement = container.querySelector("usfm");
      expect(usfmElement.classList.contains("preview")).toBe(true);
    });

    it("should apply full mode class", () => {
      const usfm = "\\v 1 Text";
      const { container } = render(
        React.createElement(USFMSemanticRenderer, { usfm, mode: "full", showModeToggle: false })
      );

      const usfmElement = container.querySelector("usfm");
      expect(usfmElement.classList.contains("full")).toBe(true);
    });

    it("should apply debug mode class", () => {
      const usfm = "\\v 1 Text";
      const { container } = render(
        React.createElement(USFMSemanticRenderer, { usfm, mode: "debug", showModeToggle: false })
      );

      const usfmElement = container.querySelector("usfm");
      expect(usfmElement.classList.contains("debug")).toBe(true);
    });
  });

  describe("Marker Classification", () => {
    it("should apply correct CSS classes to marker elements", () => {
      const usfm = "\\v 1 \\w Paul\\w*";
      const { container } = render(
        React.createElement(USFMSemanticRenderer, { usfm, mode: "debug", showModeToggle: false })
      );

      // Verse marker should have correct class
      const vMarker = container.querySelector("marker.v");
      expect(vMarker).toBeTruthy();

      // Word markers should have correct classes
      const wMarker = container.querySelector("marker.w");
      const wEndMarker = container.querySelector('marker[class="w*"]');
      expect(wMarker).toBeTruthy();
      expect(wEndMarker).toBeTruthy();
    });

    it("should handle special marker classes", () => {
      const usfm = `\\zaln-s |x-strong="G123"\\*content\\zaln-e\\*`;
      const { container } = render(
        React.createElement(USFMSemanticRenderer, { usfm, mode: "debug", showModeToggle: false })
      );

      // Should have zaln-s and zaln-e classes
      const zalnSMarker = container.querySelector("marker.zaln-s");
      const zalnEMarker = container.querySelector("marker.zaln-e");
      const asteriskMarker = container.querySelector('marker[class="*"]');

      expect(zalnSMarker).toBeTruthy();
      expect(zalnEMarker).toBeTruthy();
      expect(asteriskMarker).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    it("should handle empty USFM input", () => {
      const { container } = render(
        React.createElement(USFMSemanticRenderer, {
          usfm: "",
          mode: "preview",
          showModeToggle: false,
        })
      );

      expect(container.textContent).toBe("");
    });

    it("should handle malformed USFM gracefully", () => {
      const usfm = "\\w unclosed marker";
      const { container } = render(
        React.createElement(USFMSemanticRenderer, { usfm, mode: "preview", showModeToggle: false })
      );

      // Should still preserve textContent exactly
      expect(container.textContent).toBe(usfm);
    });

    it("should handle unknown markers", () => {
      const usfm = "\\unknownmarker content";
      const { container } = render(
        React.createElement(USFMSemanticRenderer, { usfm, mode: "preview", showModeToggle: false })
      );

      // Should still preserve textContent exactly
      expect(container.textContent).toBe(usfm);
    });
  });

  describe("Reversibility Guarantee", () => {
    it("should guarantee textContent equals input for any valid USFM", () => {
      const testCases = [
        "\\id TIT",
        "\\c 1",
        "\\v 1 Simple text",
        "\\v 1 \\w word\\w* text",
        `\\v 1 \\zaln-s |x-strong="G123"\\*\\w Paul\\w*\\zaln-e\\*`,
        "\\p \\v 1 Paragraph text",
        "\\q1 Poetry line",
        "\\s Heading",
        "\\f + footnote\\f*",
        // Complex real-world example
        `\\id TIT EN_ULT
\\c 1
\\p
\\v 1 \\zaln-s |x-strong="G39720"\\*\\w Paul\\w*\\zaln-e\\*, a servant`,
      ];

      for (const usfm of testCases) {
        const { container } = render(
          React.createElement(USFMSemanticRenderer, {
            usfm,
            mode: "preview",
            showModeToggle: false,
          })
        );
        expect(container.textContent).toBe(usfm);
      }
    });
  });
});
