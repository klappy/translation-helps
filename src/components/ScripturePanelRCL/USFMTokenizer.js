/**
 * USFMTokenizer.js
 * Tokenizes USFM text into structured tokens for parsing
 * Handles all USFM 3.0 markers, attributes, and content
 */

import { getMarkerInfo, supportsAttributes } from "./USFMMarkerRegistry.js";

// Token types
export const TOKEN_TYPES = {
  MARKER: "marker",
  END_MARKER: "end_marker",
  MILESTONE_END: "milestone_end",
  ATTRIBUTES: "attributes",
  TEXT: "text",
  NUMBER: "number",
  WHITESPACE: "whitespace",
  NEWLINE: "newline",
};

/**
 * Token class representing a single USFM token
 */
export class Token {
  constructor(type, value, position = 0, attributes = null) {
    this.type = type;
    this.value = value;
    this.position = position;
    this.attributes = attributes;
  }

  toString() {
    return `Token(${this.type}: "${this.value}")`;
  }
}

/**
 * USFM Tokenizer class
 * Converts USFM text into a stream of tokens
 */
export class USFMTokenizer {
  constructor() {
    this.text = "";
    this.position = 0;
    this.length = 0;
    this.tokens = [];
  }

  /**
   * Tokenize USFM text
   * @param {string} usfmText - Raw USFM text
   * @returns {Token[]} Array of tokens
   */
  tokenize(usfmText) {
    this.text = usfmText;
    this.position = 0;
    this.length = usfmText.length;
    this.tokens = [];

    while (this.position < this.length) {
      this.consumeNext();
    }

    return this.tokens;
  }

  /**
   * Consume the next token from the text
   */
  consumeNext() {
    const char = this.peek();

    if (char === "\\") {
      this.consumeMarker();
    } else if (char === "|") {
      this.consumeAttributes();
    } else if (char === "\n") {
      this.consumeNewline();
    } else {
      // Treat all other content (including whitespace) as text
      this.consumeText();
    }
  }

  /**
   * Consume a USFM marker
   */
  consumeMarker() {
    const startPos = this.position;
    this.advance(); // Skip the backslash

    // Read marker name
    let markerName = "";
    while (this.position < this.length) {
      const char = this.peek();
      if (/[a-z0-9\-]/.test(char)) {
        markerName += char;
        this.advance();
      } else {
        break;
      }
    }

    // Check if this is an end marker (ends with *)
    let isEndMarker = false;
    if (this.peek() === "*") {
      isEndMarker = true;
      this.advance(); // Consume the *
    }

    // Check if this is a milestone end marker (\*)
    if (markerName === "" && isEndMarker) {
      this.addToken(TOKEN_TYPES.MILESTONE_END, "\\*", startPos);
      return;
    }

    // Validate marker
    const markerInfo = getMarkerInfo(markerName);
    if (!markerInfo) {
      // Unknown marker - treat as text
      this.position = startPos;
      this.consumeText();
      return;
    }

    // Add marker token
    const tokenType = isEndMarker ? TOKEN_TYPES.END_MARKER : TOKEN_TYPES.MARKER;
    const value = isEndMarker ? `\\${markerName}*` : `\\${markerName}`;
    this.addToken(tokenType, value, startPos, { markerInfo });

    // Consume following space if present
    if (this.peek() === " ") {
      this.advance();
    }

    // Check for number after chapter/verse markers
    if ((markerName === "c" || markerName === "v") && !isEndMarker) {
      this.consumeNumber();
    }

    // Check for attributes after markers that support them
    if (!isEndMarker && this.peek() === "|") {
      this.consumeAttributes();
    }
  }

  /**
   * Consume pipe-separated attributes
   */
  consumeAttributes() {
    const startPos = this.position;
    let attributes = "";
    this.advance(); // Skip initial |

    // Read until we hit a backslash, newline, or end of text
    while (this.position < this.length) {
      const char = this.peek();
      if (char === "\\" || char === "\n") {
        break;
      }
      attributes += char;
      this.advance();
    }

    // Only add token if we have content
    if (attributes.trim()) {
      this.addToken(TOKEN_TYPES.ATTRIBUTES, attributes, startPos);
    }
  }

  /**
   * Consume a number (for chapters and verses)
   */
  consumeNumber() {
    const startPos = this.position;
    let number = "";

    while (this.position < this.length) {
      const char = this.peek();
      if (/\d/.test(char)) {
        number += char;
        this.advance();
      } else {
        break;
      }
    }

    if (number) {
      this.addToken(TOKEN_TYPES.NUMBER, number, startPos);
    }
  }

  /**
   * Consume whitespace (excluding newlines)
   */
  consumeWhitespace() {
    const startPos = this.position;
    let whitespace = "";

    while (this.position < this.length) {
      const char = this.peek();
      if (/[ \t\r]/.test(char)) {
        whitespace += char;
        this.advance();
      } else {
        break;
      }
    }

    this.addToken(TOKEN_TYPES.WHITESPACE, whitespace, startPos);
  }

  /**
   * Consume newlines
   */
  consumeNewline() {
    const startPos = this.position;
    this.advance(); // Consume the newline
    this.addToken(TOKEN_TYPES.NEWLINE, "\n", startPos);
  }

  /**
   * Consume regular text content
   */
  consumeText() {
    const startPos = this.position;
    let text = "";

    while (this.position < this.length) {
      const char = this.peek();

      // Stop at USFM markers, attributes, or newlines
      if (char === "\\" || char === "|" || char === "\n") {
        break;
      }

      text += char;
      this.advance();
    }

    // Always add text tokens to preserve all characters
    if (text) {
      this.addToken(TOKEN_TYPES.TEXT, text, startPos);
    }
  }

  /**
   * Peek at the current character without advancing
   * @returns {string} Current character
   */
  peek() {
    return this.position < this.length ? this.text[this.position] : "";
  }

  /**
   * Advance position by one character
   */
  advance() {
    this.position++;
  }

  /**
   * Add a token to the tokens array
   * @param {string} type - Token type
   * @param {string} value - Token value
   * @param {number} position - Position in text
   * @param {object} attributes - Optional attributes
   */
  addToken(type, value, position, attributes = null) {
    this.tokens.push(new Token(type, value, position, attributes));
  }

  /**
   * Reset tokenizer state
   */
  reset() {
    this.text = "";
    this.position = 0;
    this.length = 0;
    this.tokens = [];
  }
}

/**
 * Utility function to tokenize USFM text
 * @param {string} usfmText - Raw USFM text
 * @returns {Token[]} Array of tokens
 */
export function tokenizeUSFM(usfmText) {
  const tokenizer = new USFMTokenizer();
  return tokenizer.tokenize(usfmText);
}

/**
 * Utility function to filter tokens by type
 * @param {Token[]} tokens - Array of tokens
 * @param {string|string[]} types - Token type(s) to filter
 * @returns {Token[]} Filtered tokens
 */
export function filterTokensByType(tokens, types) {
  const typeArray = Array.isArray(types) ? types : [types];
  return tokens.filter((token) => typeArray.includes(token.type));
}

/**
 * Utility function to find tokens by marker name
 * @param {Token[]} tokens - Array of tokens
 * @param {string} markerName - Marker name to find (without backslash)
 * @returns {Token[]} Matching tokens
 */
export function findMarkerTokens(tokens, markerName) {
  const searchValue = `\\${markerName}`;
  return tokens.filter(
    (token) =>
      (token.type === TOKEN_TYPES.MARKER || token.type === TOKEN_TYPES.END_MARKER) &&
      token.value.startsWith(searchValue)
  );
}

/**
 * Debug function to print tokens in a readable format
 * @param {Token[]} tokens - Array of tokens
 * @returns {string} Formatted token list
 */
export function debugTokens(tokens) {
  return tokens.map((token, index) => `${index}: ${token.toString()}`).join("\n");
}
