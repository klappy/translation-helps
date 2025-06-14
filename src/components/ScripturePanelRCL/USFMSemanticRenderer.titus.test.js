/**
 * USFMSemanticRenderer.titus.test.js
 * Test for Titus 1:1 to ensure clean preview mode and proper textContent preservation
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import USFMSemanticRenderer from "./USFMSemanticRenderer";

describe("USFMSemanticRenderer - Titus 1:1 Test", () => {
  // Real Titus 1:1 USFM from ULT
  const titus11USFM = `\\v 1 \\zaln-s |x-strong="G39720" x-lemma="Παῦλος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="Παῦλος"\\*\\w Paul|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\*, \\zaln-s |x-strong="G14010" x-lemma="δοῦλος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="δοῦλος"\\*\\w a|x-occurrence="1" x-occurrences="1"\\w* \\w servant|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G23160" x-lemma="θεός" x-morph="Gr,N,,,,,GMS," x-occurrence="1" x-occurrences="2" x-content="θεοῦ"\\*\\w of|x-occurrence="1" x-occurrences="5"\\w* \\w God|x-occurrence="1" x-occurrences="2"\\w*\\zaln-e\\* \\zaln-s |x-strong="G25320" x-lemma="καί" x-morph="Gr,CC,,,,,,,," x-occurrence="1" x-occurrences="4" x-content="καὶ"\\*\\w and|x-occurrence="1" x-occurrences="4"\\w*\\zaln-e\\* \\zaln-s |x-strong="G06520" x-lemma="ἀπόστολος" x-morph="Gr,N,,,,,NMS," x-occurrence="1" x-occurrences="1" x-content="ἀπόστολος"\\*\\w an|x-occurrence="1" x-occurrences="1"\\w* \\w apostle|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G24240" x-lemma="Ἰησοῦς" x-morph="Gr,N,,,,,GMS," x-occurrence="1" x-occurrences="1" x-content="Ἰησοῦ"\\*\\w of|x-occurrence="2" x-occurrences="5"\\w* \\w Jesus|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G55470" x-lemma="Χριστός" x-morph="Gr,N,,,,,GMS," x-occurrence="1" x-occurrences="1" x-content="Χριστοῦ"\\*\\w Christ|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\*, \\zaln-s |x-strong="G25960" x-lemma="κατά" x-morph="Gr,P,,,,,A,,," x-occurrence="1" x-occurrences="1" x-content="κατὰ"\\*\\w for|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G41020" x-lemma="πίστις" x-morph="Gr,N,,,,,AFS," x-occurrence="1" x-occurrences="1" x-content="πίστιν"\\*\\w the|x-occurrence="1" x-occurrences="3"\\w* \\w faith|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G15880" x-lemma="ἐκλεκτός" x-morph="Gr,S,,,,,GMP," x-occurrence="1" x-occurrences="1" x-content="ἐκλεκτῶν"\\*\\w of|x-occurrence="3" x-occurrences="5"\\w* \\w the|x-occurrence="2" x-occurrences="3"\\w* \\w chosen|x-occurrence="1" x-occurrences="1"\\w* \\w people|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G23160" x-lemma="θεός" x-morph="Gr,N,,,,,GMS," x-occurrence="2" x-occurrences="2" x-content="θεοῦ"\\*\\w of|x-occurrence="4" x-occurrences="5"\\w* \\w God|x-occurrence="2" x-occurrences="2"\\w*\\zaln-e\\* \\zaln-s |x-strong="G25320" x-lemma="καί" x-morph="Gr,CC,,,,,,,," x-occurrence="2" x-occurrences="4" x-content="καὶ"\\*\\w and|x-occurrence="2" x-occurrences="4"\\w*\\zaln-e\\* \\zaln-s |x-strong="G19220" x-lemma="ἐπίγνωσις" x-morph="Gr,N,,,,,AFS," x-occurrence="1" x-occurrences="1" x-content="ἐπίγνωσιν"\\*\\w knowledge|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G02250" x-lemma="ἀλήθεια" x-morph="Gr,N,,,,,GFS," x-occurrence="1" x-occurrences="1" x-content="ἀληθείας"\\*\\w of|x-occurrence="5" x-occurrences="5"\\w* \\w the|x-occurrence="3" x-occurrences="3"\\w* \\w truth|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G35880" x-lemma="ὁ" x-morph="Gr,EA,,,,GFS," x-occurrence="1" x-occurrences="1" x-content="τῆς"\\*\\w that|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G25960" x-lemma="κατά" x-morph="Gr,P,,,,,A,,," x-occurrence="2" x-occurrences="1" x-content="κατ'"\\*\\w agrees|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\* \\zaln-s |x-strong="G21500" x-lemma="εὐσέβεια" x-morph="Gr,N,,,,,AFS," x-occurrence="1" x-occurrences="1" x-content="εὐσέβειαν"\\*\\w with|x-occurrence="1" x-occurrences="1"\\w* \\w godliness|x-occurrence="1" x-occurrences="1"\\w*\\zaln-e\\*,`;

  describe("CRITICAL: Preview Mode Clean Text Display", () => {
    it("should show only clean readable text in preview mode", () => {
      const { container } = render(
        React.createElement(USFMSemanticRenderer, {
          usfm: titus11USFM,
          mode: "preview",
          showModeToggle: false,
        })
      );

      // Get the usfm element directly to check structure
      const usfmElement = container.querySelector("usfm");
      expect(usfmElement).toBeTruthy();

      // Check that it has the correct preview class
      expect(usfmElement.classList.contains("preview")).toBe(true);

      // Check that markers are present in DOM (needed for textContent preservation)
      // but wrapped in <marker> elements that CSS will hide
      const markerElements = usfmElement.querySelectorAll("marker");
      expect(markerElements.length).toBeGreaterThan(0);

      // Check that attributes are present in DOM (needed for textContent preservation)
      // but wrapped in <attributes> elements that CSS will hide
      const attributeElements = usfmElement.querySelectorAll("attributes");
      expect(attributeElements.length).toBeGreaterThan(0);

      // Check that content elements are present and contain actual words
      const contentElements = usfmElement.querySelectorAll("content");
      expect(contentElements.length).toBeGreaterThan(0);

      const contentTexts = Array.from(contentElements).map((el) => el.textContent);
      expect(contentTexts).toContain("Paul");
      expect(contentTexts).toContain("servant");

      // The overall textContent should contain the actual words
      expect(container.textContent).toContain("Paul");
      expect(container.textContent).toContain("servant");
      expect(container.textContent).toContain("God");

      // Verify that markers contain backslashes (proves they're structured correctly)
      const markerTexts = Array.from(markerElements).map((el) => el.textContent);
      const hasBackslashMarkers = markerTexts.some((text) => text.includes("\\"));
      expect(hasBackslashMarkers).toBe(true);
    });

    it("should show clean text like: '1 Paul, a servant of God and an apostle of Jesus Christ...'", () => {
      const { container } = render(
        React.createElement(USFMSemanticRenderer, {
          usfm: titus11USFM,
          mode: "preview",
          showModeToggle: false,
        })
      );

      // Create a test element to simulate what would be visible
      const testDiv = document.createElement("div");
      testDiv.innerHTML = container.innerHTML;

      // Apply the CSS classes that would hide elements
      const styleElement = document.createElement("style");
      styleElement.textContent = `
        usfm.preview marker { display: none; }
        usfm.preview attributes { display: none; }
        usfm.preview number { display: inline; }
        usfm.preview content { display: inline; }
      `;
      document.head.appendChild(styleElement);
      document.body.appendChild(testDiv);

      // Get computed visible text (this is a simplified check)
      const visibleElements = testDiv.querySelectorAll("usfm.preview *");
      let visibleText = "";

      visibleElements.forEach((el) => {
        const computedStyle = window.getComputedStyle(el);
        if (computedStyle.display !== "none") {
          if (el.tagName.toLowerCase() === "number" || el.tagName.toLowerCase() === "content") {
            visibleText += el.textContent;
          }
        }
      });

      // Also add any direct text nodes
      const walker = document.createTreeWalker(
        testDiv.querySelector("usfm"),
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while ((node = walker.nextNode())) {
        // Only add text if parent is not hidden
        const parent = node.parentElement;
        if (parent && !["marker", "attributes"].includes(parent.tagName.toLowerCase())) {
          visibleText += node.textContent;
        }
      }

      // Clean up
      document.head.removeChild(styleElement);
      document.body.removeChild(testDiv);

      // Should be clean readable text starting with verse number
      expect(visibleText).toMatch(/^1\s*Paul.*servant.*God/);
      expect(visibleText).not.toContain("\\");
      expect(visibleText).not.toContain("|x-occurrence");
      expect(visibleText).not.toContain("x-strong");
    });
  });

  describe("CRITICAL: Full Character Preservation", () => {
    it("should preserve exact textContent equal to original USFM", () => {
      const { container } = render(
        React.createElement(USFMSemanticRenderer, {
          usfm: titus11USFM,
          mode: "preview",
          showModeToggle: false,
        })
      );

      // CRITICAL REQUIREMENT: textContent must match input exactly
      expect(container.textContent).toBe(titus11USFM);
    });

    it("should preserve every character including all markers and attributes", () => {
      const { container } = render(
        React.createElement(USFMSemanticRenderer, {
          usfm: titus11USFM,
          mode: "debug",
          showModeToggle: false,
        })
      );

      // Every character from input should be in textContent
      expect(container.textContent.length).toBe(titus11USFM.length);
      expect(container.textContent).toBe(titus11USFM);

      // Should contain all the original markers
      expect(container.textContent).toContain("\\zaln-s");
      expect(container.textContent).toContain("\\zaln-e");
      expect(container.textContent).toContain("\\w");
      expect(container.textContent).toContain("\\w*");
      expect(container.textContent).toContain('|x-occurrence="1"');
      expect(container.textContent).toContain('x-strong="G39720"');
    });
  });

  describe("Parser Structure Requirements", () => {
    it("should properly separate word content from attributes", () => {
      const { container } = render(
        React.createElement(USFMSemanticRenderer, {
          usfm: titus11USFM,
          mode: "debug",
          showModeToggle: false,
        })
      );

      // Should have word elements
      const wordElements = container.querySelectorAll("word");
      expect(wordElements.length).toBeGreaterThan(0);

      // Should have content elements with actual words
      const contentElements = container.querySelectorAll("content");
      expect(contentElements.length).toBeGreaterThan(0);

      // Check that content elements contain actual words, not attributes
      const paulContent = Array.from(contentElements).find((el) => el.textContent === "Paul");
      expect(paulContent).toBeTruthy();

      const servantContent = Array.from(contentElements).find((el) => el.textContent === "servant");
      expect(servantContent).toBeTruthy();

      // Should have attributes elements separate from content
      const attributeElements = container.querySelectorAll("attributes");
      expect(attributeElements.length).toBeGreaterThan(0);

      // Attributes should contain occurrence data
      const attributeWithOccurrence = Array.from(attributeElements).find((el) =>
        el.textContent.includes('x-occurrence="1"')
      );
      expect(attributeWithOccurrence).toBeTruthy();
    });

    it("should have proper semantic HTML structure", () => {
      const { container } = render(
        React.createElement(USFMSemanticRenderer, {
          usfm: titus11USFM,
          mode: "debug",
          showModeToggle: false,
        })
      );

      // Should have root usfm element
      const usfmElement = container.querySelector("usfm");
      expect(usfmElement).toBeTruthy();

      // Should have verse element
      const verseElement = container.querySelector("v");
      expect(verseElement).toBeTruthy();

      // Should have zaln elements for alignment
      const zalnElements = container.querySelectorAll("zaln");
      expect(zalnElements.length).toBeGreaterThan(0);

      // Should have marker elements
      const markerElements = container.querySelectorAll("marker");
      expect(markerElements.length).toBeGreaterThan(0);
    });
  });
});
