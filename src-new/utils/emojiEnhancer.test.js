/**
 * Tests for emojiEnhancer utility
 */

import { enhanceWithEmojis, addSectionEmojis, enhanceLLMResponse } from "./emojiEnhancer";

describe("emojiEnhancer", () => {
  describe("enhanceWithEmojis", () => {
    it("should add contextual emojis to text", () => {
      const text = "This is about translation and interpretation of the Bible.";
      const enhanced = enhanceWithEmojis(text);

      expect(enhanced).toContain("🔄"); // translation
      expect(enhanced).toContain("🔍"); // interpretation
      expect(enhanced).toContain("📖"); // Bible
    });

    it("should respect maxEmojisPerResponse limit", () => {
      const text = "Translation interpretation meaning context Bible Scripture verse chapter";
      const enhanced = enhanceWithEmojis(text, { maxEmojisPerResponse: 2 });

      // Count emojis in result
      const emojiCount = (
        enhanced.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []
      ).length;
      expect(emojiCount).toBeLessThanOrEqual(2);
    });

    it("should not duplicate emojis", () => {
      const text = "Translation and translation again";
      const enhanced = enhanceWithEmojis(text);

      // Should only contain one 🔄 emoji despite multiple matches
      const matches = enhanced.match(/🔄/g);
      expect(matches).toHaveLength(1);
    });

    it("should return original text when disabled", () => {
      const text = "This is about translation.";
      const enhanced = enhanceWithEmojis(text, { enabled: false });

      expect(enhanced).toBe(text);
    });

    it("should exclude specified categories", () => {
      const text = "Translation of God and Jesus Christ in Scripture.";
      const enhanced = enhanceWithEmojis(text, { excludeCategories: ["biblical"] });

      expect(enhanced).toContain("🔄"); // translation (not excluded)
      expect(enhanced).not.toContain("✨"); // God (excluded)
      expect(enhanced).not.toContain("✝️"); // Jesus Christ (excluded)
    });
  });

  describe("addSectionEmojis", () => {
    it("should return text as-is (simplified for now)", () => {
      const text = "# Translation Notes\n## Key Meaning\n### Important Context";
      const enhanced = addSectionEmojis(text);
      // For now, just verify it doesn't break the text
      expect(enhanced).toContain("Translation Notes");
      expect(enhanced).toContain("Key Meaning");
      expect(enhanced).toContain("Important Context");
    });

    it("should handle list items gracefully", () => {
      const text = "- Translation issue\n- Key meaning\n- Important context";
      const enhanced = addSectionEmojis(text);
      // Verify the core content is preserved
      expect(enhanced).toContain("Translation issue");
      expect(enhanced).toContain("Key meaning");
      expect(enhanced).toContain("Important context");
    });
  });

  describe("enhanceLLMResponse", () => {
    it("should apply contextual emojis to content", () => {
      const response = "This verse discusses God and translation in the Bible.";
      const enhanced = enhanceLLMResponse(response);

      // Should have contextual emojis for content
      expect(enhanced).toContain("✨"); // God
      expect(enhanced).toContain("🔄"); // translation
      expect(enhanced).toContain("📖"); // Bible
    });

    it("should handle empty responses", () => {
      expect(enhanceLLMResponse("")).toBe("");
      expect(enhanceLLMResponse(null)).toBe(null);
      expect(enhanceLLMResponse(undefined)).toBe(undefined);
    });

    it("should pass through options correctly", () => {
      const response = "Translation interpretation meaning context";
      const enhanced = enhanceLLMResponse(response, { maxEmojisPerResponse: 1 });

      // Should respect the maxEmojisPerResponse option
      const emojiCount = (
        enhanced.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []
      ).length;
      expect(emojiCount).toBeLessThanOrEqual(1);
    });
  });

  describe("biblical content patterns", () => {
    it("should recognize various biblical terms", () => {
      const tests = [
        { text: "Jesus Christ is Lord", expectedEmojis: ["✝️", "✨"] },
        { text: "The Holy Spirit guides us", expectedEmojis: ["🕊️"] },
        { text: "Scripture and Bible study", expectedEmojis: ["📖"] },
        { text: "The kingdom of God", expectedEmojis: ["👑", "✨"] },
        { text: "Psalm of praise", expectedEmojis: ["🎵"] },
      ];

      tests.forEach(({ text, expectedEmojis }) => {
        const enhanced = enhanceWithEmojis(text);
        expectedEmojis.forEach((emoji) => {
          expect(enhanced).toContain(emoji);
        });
      });
    });
  });

  describe("cultural and literary patterns", () => {
    it("should recognize cultural and literary terms", () => {
      const tests = [
        { text: "Ancient culture and tradition", expectedEmojis: ["🏺", "⏳", "🎭"] },
        { text: "Metaphor and symbol in poetry", expectedEmojis: ["🎨", "🔣", "🎭"] },
        { text: "Parallel structure in Hebrew", expectedEmojis: ["↔️", "🏛️"] },
      ];

      tests.forEach(({ text, expectedEmojis }) => {
        const enhanced = enhanceWithEmojis(text);
        expectedEmojis.forEach((emoji) => {
          expect(enhanced).toContain(emoji);
        });
      });
    });
  });
});
