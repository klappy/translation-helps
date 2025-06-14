/**
 * USFM parser that generates semantic HTML while preserving ALL original text.
 * The critical requirement: rendered.textContent === originalUSFM
 *
 * This parser works by:
 * 1. Tokenizing USFM text character by character
 * 2. Generating HTML that wraps markers, attributes, and content in semantic elements
 * 3. Ensuring every character from the input appears exactly once in the output DOM
 */

// USFM 3.0 marker definitions for semantic HTML generation
const MARKER_INFO = {
  // Identification and headers
  id: { type: "header", element: "header", hasEndMarker: false },
  usfm: { type: "header", element: "header", hasEndMarker: false },
  ide: { type: "header", element: "header", hasEndMarker: false },
  h: { type: "header", element: "header", hasEndMarker: false },
  toc1: { type: "header", element: "header", hasEndMarker: false },
  toc2: { type: "header", element: "header", hasEndMarker: false },
  toc3: { type: "header", element: "header", hasEndMarker: false },
  mt: { type: "header", element: "header", hasEndMarker: false },
  ts: { type: "section", element: "heading", className: "section-heading", hasEndMarker: true },

  // Structure
  c: { type: "chapter", element: "c", hasEndMarker: false },
  v: { type: "verse", element: "v", hasEndMarker: false },
  p: { type: "paragraph", element: "p", hasEndMarker: false },
  s: { type: "section", element: "heading", className: "section-heading", hasEndMarker: false },
  s1: { type: "section", element: "heading", className: "section-heading", hasEndMarker: false },
  s2: { type: "section", element: "heading", className: "section-heading", hasEndMarker: false },
  s3: { type: "section", element: "heading", className: "section-heading", hasEndMarker: false },
  s4: { type: "section", element: "heading", className: "section-heading", hasEndMarker: false },

  // Poetry
  q: { type: "poetry", element: "q", hasEndMarker: false },
  q1: { type: "poetry", element: "q", hasEndMarker: false },
  q2: { type: "poetry", element: "q", hasEndMarker: false },
  q3: { type: "poetry", element: "q", hasEndMarker: false },
  q4: { type: "poetry", element: "q", hasEndMarker: false },

  // Character markup
  w: { type: "character", element: "word", hasEndMarker: true },
  wj: { type: "character", element: "wj", hasEndMarker: true },
  add: { type: "character", element: "add", hasEndMarker: true },
  nd: { type: "character", element: "nd", hasEndMarker: true },
  k: { type: "character", element: "k", hasEndMarker: true },
  tl: { type: "character", element: "tl", hasEndMarker: true },
  pn: { type: "character", element: "pn", hasEndMarker: true },

  // Alignment markers
  "zaln-s": { type: "alignment", element: "zaln", hasEndMarker: false },
  "zaln-e": { type: "alignment", element: null, hasEndMarker: false },

  // Notes
  f: { type: "note", element: "footnote", hasEndMarker: true },
  x: { type: "note", element: "crossref", hasEndMarker: true },
};

/**
 * USFMSemanticParser class
 * Parses USFM text into semantic HTML while preserving ALL original characters
 */
export class USFMSemanticParser {
  constructor() {
    this.input = "";
    this.position = 0;
    this.output = "";
    this.markerStack = [];
    this.zalnStack = [];
    this.currentBlock = null; // Can be 'headers' or 'chapters'
  }

  /**
   * Parse USFM text and generate semantic HTML
   * @param {string} usfmText - Raw USFM text
   * @param {string} mode - Rendering mode (preview, full, debug)
   * @returns {string} Semantic HTML
   */
  parse(usfmText, mode = "preview") {
    this.input = usfmText;
    this.position = 0;
    this.output = "";
    this.markerStack = [];
    this.zalnStack = [];
    this.currentBlock = null;

    // Start with root usfm element
    this.output += `<usfm class="${mode}">`;

    // Process all characters
    while (this.position < this.input.length) {
      if (this.peek() === "\\") {
        this.parseMarker();
      } else if (this.peek() === "|" && this.isInAttributeContext()) {
        this.parseAttributes();
      } else {
        this.parseText();
      }
    }

    // Close any remaining open elements
    this.closeAllMarkers();

    // Close the final block if it's still open
    if (this.currentBlock === "chapters") {
      this.output += `</chapters>`;
    } else if (this.currentBlock === "headers") {
      this.output += `</headers>`;
    }

    // Close root element
    this.output += "</usfm>";

    return this.output;
  }

  /**
   * Parse a USFM marker
   */
  parseMarker() {
    const markerStart = this.position;
    this.consume("\\"); // consume backslash

    // Special case: just \* (attribute terminator)
    if (this.peek() === "*") {
      const markerName = this.consume(); // consume the *
      this.handleEndMarker(markerName, markerStart);
      return;
    }

    // Read marker name (letters, numbers, hyphens, but NOT * here since that's handled above)
    let markerName = "";
    while (this.position < this.input.length && /[a-zA-Z0-9\-]/.test(this.peek())) {
      markerName += this.consume();
    }

    // Check if this is an end marker (has * after the name)
    if (this.peek() === "*") {
      markerName += this.consume(); // add the *
    }

    // Handle special cases
    if (markerName.endsWith("-s") || markerName.endsWith("-e")) {
      // Alignment markers
      this.handleAlignmentMarker(markerName, markerStart);
    } else if (markerName.endsWith("*")) {
      // End marker
      this.handleEndMarker(markerName, markerStart);
    } else {
      // Start marker
      this.handleStartMarker(markerName, markerStart);
    }
  }

  /**
   * Handle alignment markers (zaln-s, zaln-e)
   */
  handleAlignmentMarker(markerName, markerStart) {
    const markerText = this.input.substring(markerStart, this.position);

    if (markerName === "zaln-s") {
      // Start new alignment group
      this.output += "<zaln>";
      this.output += `<marker class="zaln-s">${markerText}</marker>`;
      this.zalnStack.push("zaln");
    } else if (markerName === "zaln-e") {
      // Close alignment group
      this.output += `<marker class="zaln-e">${markerText}</marker>`;
      if (this.zalnStack.length > 0) {
        this.zalnStack.pop();
        this.output += "</zaln>";
      }
    }

    // Consume any following space
    if (this.peek() === " ") {
      this.output += this.consume();
    }
  }

  /**
   * Handle end markers (*-suffixed)
   */
  handleEndMarker(markerName, markerStart) {
    const markerText = this.input.substring(markerStart, this.position);

    if (markerName === "*") {
      // Special case: \* (can be a closer for \ts)
      if (this.markerStack.length > 0 && this.markerStack[this.markerStack.length - 1] === "ts") {
        this.markerStack.pop();
        this.output += `<marker>*</marker></heading>`;
      } else {
        this.output += `<marker class="*">${markerText}</marker>`;
      }
    } else {
      // Regular end marker like \w*
      const baseMarker = markerName.slice(0, -1); // remove *
      this.output += `<marker class="${markerName}">${markerText}</marker>`;

      // Close the corresponding element
      if (
        this.markerStack.length > 0 &&
        this.markerStack[this.markerStack.length - 1] === baseMarker
      ) {
        this.markerStack.pop();
        const info = MARKER_INFO[baseMarker];
        if (info && info.element) {
          this.output += `</${info.element}>`;
        }
      }
    }

    // Consume any following space
    if (this.peek() === " ") {
      this.output += this.consume();
    }
  }

  /**
   * Handle start markers
   */
  handleStartMarker(markerName, markerStart) {
    const markerText = this.input.substring(markerStart, this.position);
    const info = MARKER_INFO[markerName] || {
      type: "unknown",
      element: null,
      hasEndMarker: false,
    };

    // Manage <headers> and <chapters> blocks
    if (info.type === "header" && this.currentBlock !== "headers") {
      if (this.currentBlock === "chapters") {
        this.output += `</chapters>`;
      }
      this.output += "<headers>";
      this.currentBlock = "headers";
    } else if (
      (info.type === "chapter" || info.type === "section") &&
      this.currentBlock !== "chapters"
    ) {
      if (this.currentBlock === "headers") {
        this.output += `</headers>`;
      }
      this.output += "<chapters>";
      this.currentBlock = "chapters";
    }

    // Close previous block-level elements if necessary
    if (
      info.type === "paragraph" ||
      info.type === "chapter" ||
      info.type === "verse" ||
      info.type === "poetry" ||
      info.type === "section"
    ) {
      // Always close all open section headings before any block-level marker
      this.closeAllSectionHeadings();
      // Always close all poetry lines before opening a new verse or poetry line
      if (info.type === "verse" || info.type === "poetry") {
        this.closeAllPoetryLines();
      }
      if (info.type === "verse") {
        this.closeOpenVerse();
      }
      // Always close all block-level elements for paragraph, chapter, or section
      if (info.type === "paragraph" || info.type === "chapter" || info.type === "section") {
        this.closeAllBlockLevelElements();
      }
    }

    // Consume any following space
    let spaceAfterMarker = "";
    if (this.peek() === " ") {
      spaceAfterMarker = this.consume();
    }

    // Start element
    if (info.element) {
      // Add class for header markers
      if (info.element === "header") {
        this.output += `<header class="${markerName}">`;
      } else if (info.element === "heading") {
        // Section heading: open <heading class="section-heading">
        this.output += `<heading${info.className ? ` class="${info.className}"` : ""}>`;
      } else {
        this.output += `<${info.element}>`;
      }
    }
    this.output += `<marker class="${markerName}">${markerText}${spaceAfterMarker}</marker>`;

    // Handle special verse and chapter number parsing
    if (markerName === "v" || markerName === "c") {
      // Parse number
      const number = this.parseNumber();
      if (number) {
        this.output += `<number>${number}</number>`;
      }
    }

    // Special handling for section headings: close immediately after heading text or upon block marker
    if (info.element === "heading") {
      // Parse heading text until newline, block-level marker, or \*
      let headingText = "";
      while (this.position < this.input.length) {
        // If next is a block-level marker, break and close heading
        if (
          this.peek() === "\\" &&
          (this.input.substring(this.position + 1, this.position + 2).match(/[a-zA-Z]/) ||
            this.input.substring(this.position + 1, this.position + 3).match(/s[1-4]/))
        ) {
          // Look ahead for block-level marker
          let lookahead = this.position + 1;
          let marker = "";
          while (lookahead < this.input.length && /[a-zA-Z0-9\-]/.test(this.input[lookahead])) {
            marker += this.input[lookahead];
            lookahead++;
          }
          if (
            marker === "p" ||
            marker === "v" ||
            marker === "c" ||
            marker === "s" ||
            marker === "s1" ||
            marker === "s2" ||
            marker === "s3" ||
            marker === "s4"
          ) {
            break;
          }
        }
        // If next is \* (closing marker), break and close heading
        if (this.peek() === "\\" && this.input[this.position + 1] === "*") {
          // Do not consume the \*, just break so the main parser will handle it as a marker
          break;
        }
        if (this.peek() === "\n") {
          headingText += this.consume();
          break;
        }
        headingText += this.consume();
      }
      this.output += headingText;
      this.output += `</heading>`;
      return;
    }

    // Special handling for word and zaln markers
    if (markerName === "w") {
      // Parse word content up to | or \w*
      const wordContent = this.parseWordContent();
      if (wordContent) {
        this.output += `<content>${wordContent}</content>`;
      }
      // Parse word attributes if present
      if (this.peek() === "|") {
        this.output += this.parseAndReturnAttributes();
      }
      this.markerStack.push(markerName);
    } else if (markerName === "zaln-s") {
      // Parse zaln attributes if present
      if (this.peek() === "|") {
        this.output += this.parseAndReturnAttributes();
      }
      // Expect \* marker after attributes
      if (this.peek() === "\\") {
        // Parse the \* marker
        this.parseMarker();
      }
      this.markerStack.push("zaln");
    } else if (info.hasEndMarker) {
      this.markerStack.push(markerName);
    } else if (info.type === "header") {
      // Headers close immediately after their content
      this.output += this.parseHeaderContent();
      if (info.element) {
        this.output += `</${info.element}>`;
      }
    } else {
      this.markerStack.push(markerName);
    }
  }

  /**
   * Close all open section headings (heading)
   */
  closeAllSectionHeadings() {
    while (this.markerStack.length > 0) {
      const lastMarker = this.markerStack[this.markerStack.length - 1];
      const info = MARKER_INFO[lastMarker];
      if (info && info.element === "heading") {
        this.markerStack.pop();
        this.output += `</${info.element}>`;
      } else {
        break;
      }
    }
  }

  /**
   * Close all open block-level elements (paragraph, verse, chapter, poetry, section)
   */
  closeAllBlockLevelElements() {
    while (this.markerStack.length > 0) {
      const lastMarker = this.markerStack[this.markerStack.length - 1];
      const info = MARKER_INFO[lastMarker];
      if (
        info &&
        (info.type === "paragraph" ||
          info.type === "verse" ||
          info.type === "chapter" ||
          info.type === "poetry" ||
          info.type === "section")
      ) {
        this.markerStack.pop();
        this.output += `</${info.element}>`;
      } else {
        break;
      }
    }
  }

  /**
   * Close the currently open verse, if any
   */
  closeOpenVerse() {
    while (this.markerStack.length > 0) {
      const lastMarker = this.markerStack[this.markerStack.length - 1];
      const info = MARKER_INFO[lastMarker];
      if (info && info.type === "verse") {
        this.markerStack.pop();
        this.output += `</${info.element}>`;
      } else {
        break;
      }
    }
  }

  /**
   * Close all open poetry lines (q, q1, q2, etc.)
   */
  closeAllPoetryLines() {
    while (this.markerStack.length > 0) {
      const lastMarker = this.markerStack[this.markerStack.length - 1];
      const info = MARKER_INFO[lastMarker];
      if (info && info.type === "poetry") {
        this.markerStack.pop();
        this.output += `</${info.element}>`;
      } else {
        break;
      }
    }
  }

  /**
   * Close poetry lines at same or deeper indentation level before opening a new one
   */
  closePoetryLinesForNewPoetry(newMarker) {
    // Determine the level of the new poetry marker (e.g., q1 = 1, q2 = 2, etc.)
    const newLevel = this.getPoetryLevel(newMarker);
    while (this.markerStack.length > 0) {
      const lastMarker = this.markerStack[this.markerStack.length - 1];
      const info = MARKER_INFO[lastMarker];
      if (info && info.type === "poetry") {
        const lastLevel = this.getPoetryLevel(lastMarker);
        if (lastLevel >= newLevel) {
          this.markerStack.pop();
          this.output += `</${info.element}>`;
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  /**
   * Get poetry level from marker name (e.g., q1 -> 1, q2 -> 2, q -> 1)
   */
  getPoetryLevel(marker) {
    const match = /^q(\d+)?$/.exec(marker);
    if (match) {
      return match[1] ? parseInt(match[1], 10) : 1;
    }
    return 1;
  }

  /**
   * Parse attributes (|key="value" format)
   */
  parseAttributes() {
    const attrStart = this.position;

    // Find the end of attributes (until \* or end of line)
    while (this.position < this.input.length && this.peek() !== "\\" && this.peek() !== "\n") {
      this.position++;
    }

    const attributeText = this.input.substring(attrStart, this.position);
    this.output += `<attributes>${attributeText}</attributes>`;
  }

  /**
   * Parse attributes and return as string (for inline use)
   */
  parseAndReturnAttributes() {
    const attrStart = this.position;
    // Find the end of attributes (until \* or end of line)
    while (this.position < this.input.length && this.peek() !== "\\" && this.peek() !== "\n") {
      this.position++;
    }
    const attributeText = this.input.substring(attrStart, this.position);
    return `<attributes>${attributeText}</attributes>`;
  }

  /**
   * Parse word content up to | or \w*
   */
  parseWordContent() {
    let content = "";
    while (
      this.position < this.input.length &&
      this.peek() !== "|" &&
      !(this.peek() === "\\" && this.input.substring(this.position, this.position + 3) === "\\w*")
    ) {
      content += this.consume();
    }
    return content;
  }

  /**
   * Parse regular text content
   */
  parseText() {
    let text = "";

    // Check if we're in a word context for special handling
    const inWordContext =
      this.markerStack.length > 0 && this.markerStack[this.markerStack.length - 1] === "w";

    while (
      this.position < this.input.length &&
      this.peek() !== "\\" &&
      !this.isInAttributeContext()
    ) {
      const char = this.peek();

      // For word context, stop at "|" to handle word attributes
      if (inWordContext && char === "|") {
        break;
      }

      this.consume();
      text += char;

      // Break on newlines for paragraph structure
      if (char === "\n") {
        break;
      }
    }

    if (text) {
      // For word context, wrap in <content>
      if (inWordContext) {
        this.output += `<content>${text}</content>`;
      } else {
        this.output += text;
      }
    }
  }

  /**
   * Parse word attributes (|key="value" format for word markers)
   */
  parseWordAttributes() {
    const attrStart = this.position;

    // Find the end of attributes (until \w* or other end marker)
    while (this.position < this.input.length && this.peek() !== "\\") {
      this.position++;
    }

    const attributeText = this.input.substring(attrStart, this.position);
    if (attributeText) {
      this.output += `<attributes>${attributeText}</attributes>`;
    }
  }

  /**
   * Parse number after verse or chapter marker
   */
  parseNumber() {
    let number = "";

    while (this.position < this.input.length && /[0-9]/.test(this.peek())) {
      number += this.consume();
    }

    return number;
  }

  /**
   * Parse header content (everything until newline)
   */
  parseHeaderContent() {
    let content = "";

    while (this.position < this.input.length && this.peek() !== "\n") {
      content += this.consume();
    }

    if (this.peek() === "\n") {
      content += this.consume(); // include newline
    }

    return content;
  }

  /**
   * Check if we're in an attribute context (after | and before \*)
   */
  isInAttributeContext() {
    if (this.peek() !== "|") return false;

    // Look ahead to see if there's a \* before newline
    let lookAhead = this.position + 1;
    while (lookAhead < this.input.length && this.input[lookAhead] !== "\n") {
      if (this.input.substring(lookAhead, lookAhead + 2) === "\\*") {
        return true;
      }
      lookAhead++;
    }

    return false;
  }

  /**
   * Close all remaining open markers
   */
  closeAllMarkers() {
    while (this.markerStack.length > 0) {
      const marker = this.markerStack.pop();
      const info = MARKER_INFO[marker];
      if (info && info.element) {
        this.output += `</${info.element}>`;
      }
    }

    while (this.zalnStack.length > 0) {
      this.zalnStack.pop();
      this.output += "</zaln>";
    }
  }

  /**
   * Peek at current character without consuming
   */
  peek() {
    return this.position < this.input.length ? this.input[this.position] : "";
  }

  /**
   * Consume and return current character
   */
  consume(expected) {
    if (expected && this.peek() !== expected) {
      throw new Error(
        `Expected '${expected}' but got '${this.peek()}' at position ${this.position}`
      );
    }

    return this.position < this.input.length ? this.input[this.position++] : "";
  }
}

/**
 * Utility function to parse USFM text to semantic HTML
 * @param {string} usfmText - Raw USFM text
 * @param {string} mode - Rendering mode (preview, full, debug)
 * @returns {string} Semantic HTML
 */
export function parseUSFMToHTML(usfmText, mode = "preview") {
  const parser = new USFMSemanticParser();
  return parser.parse(usfmText, mode);
}

/**
 * Validate that the parsed HTML preserves original text
 * @param {string} originalUSFM - Original USFM text
 * @param {string} html - Generated HTML
 * @returns {boolean} True if textContent matches original
 */
export function validateTextContentPreservation(originalUSFM, html) {
  // Create a temporary DOM element to extract textContent
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  return tempDiv.textContent === originalUSFM;
}
