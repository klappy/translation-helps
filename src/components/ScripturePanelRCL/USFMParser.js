/**
 * USFMParser.js
 * Parses USFM tokens into an Abstract Syntax Tree (AST)
 * Preserves ALL original USFM text while providing semantic structure for styling
 */

import { tokenizeUSFM, TOKEN_TYPES } from "./USFMTokenizer.js";
import { MARKER_TYPES, getMarkerInfo, getEndMarker } from "./USFMMarkerRegistry.js";

/**
 * AST Node types
 */
export const NODE_TYPES = {
  DOCUMENT: "document",
  HEADER: "header",
  CHAPTER: "chapter",
  VERSE: "verse",
  PARAGRAPH: "paragraph",
  CHARACTER: "character",
  MILESTONE: "milestone",
  NOTE: "note",
  TEXT: "text",
  NUMBER: "number",
  ATTRIBUTES: "attributes",
  MARKER: "marker", // The literal marker text like "\id "
  CONTENT: "content", // Content following a marker
  END_MARKER: "end_marker", // End marker like "\w*"
};

/**
 * AST Node class
 */
export class ASTNode {
  constructor(type, marker = null, content = "", attributes = null) {
    this.type = type;
    this.marker = marker; // Semantic marker name (e.g., "id", "v", "w")
    this.content = content; // Original text content
    this.attributes = attributes;
    this.children = [];
    this.parent = null;
  }

  /**
   * Add a child node
   * @param {ASTNode} child - Child node to add
   */
  addChild(child) {
    child.parent = this;
    this.children.push(child);
  }

  /**
   * Find children by type
   * @param {string} type - Node type to find
   * @returns {ASTNode[]} Array of matching children
   */
  findChildren(type) {
    return this.children.filter((child) => child.type === type);
  }

  /**
   * Get string representation
   * @returns {string} String representation
   */
  toString() {
    if (this.marker) {
      return `${this.type}(${this.marker})`;
    }
    return this.type;
  }
}

/**
 * USFM Parser class
 */
export class USFMParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
    this.ast = null;
  }

  /**
   * Reset parser state
   */
  reset() {
    this.tokens = [];
    this.position = 0;
    this.ast = null;
  }

  /**
   * Parse USFM text into an AST
   * @param {string} usfmText - Raw USFM text
   * @returns {ASTNode} Root AST node
   */
  parse(usfmText) {
    this.tokens = tokenizeUSFM(usfmText);
    this.position = 0;
    this.ast = new ASTNode(NODE_TYPES.DOCUMENT);

    let lastPosition = -1;
    const maxIterations = this.tokens.length * 2; // Safety limit
    let iterations = 0;

    while (this.position < this.tokens.length && iterations < maxIterations) {
      // Safety check to prevent infinite loops
      if (this.position === lastPosition) {
        // Position hasn't advanced, force advancement
        this.consumeTokenAsText();
      } else {
        this.parseTopLevel();
      }

      lastPosition = this.position;
      iterations++;
    }

    return this.ast;
  }

  /**
   * Parse top-level structure
   */
  parseTopLevel() {
    const token = this.peek();
    if (!token) return;

    if (token.type === TOKEN_TYPES.MARKER) {
      const markerName = this.extractMarkerName(token.value);
      const markerInfo = getMarkerInfo(markerName);

      if (!markerInfo) {
        this.consumeTokenAsText();
        return;
      }

      switch (markerInfo.type) {
        case MARKER_TYPES.HEADER:
          this.parseHeader();
          break;
        case MARKER_TYPES.PARAGRAPH:
          this.parseParagraph();
          break;
        case MARKER_TYPES.CHAPTER:
          this.parseChapter();
          break;
        case MARKER_TYPES.VERSE:
          this.parseVerse();
          break;
        case MARKER_TYPES.MILESTONE:
          this.parseMilestone();
          break;
        case MARKER_TYPES.CHARACTER:
          this.parseCharacter();
          break;
        case MARKER_TYPES.NOTE:
          this.parseNote();
          break;
        default:
          this.consumeTokenAsText(); // Skip unknown
          break;
      }
    } else {
      this.consumeTokenAsText();
    }
  }

  /**
   * Parse header marker (id, h, toc1, etc.)
   */
  parseHeader() {
    const markerToken = this.advance();
    const markerName = this.extractMarkerName(markerToken.value);

    const headerNode = new ASTNode(NODE_TYPES.HEADER, markerName);
    this.ast.addChild(headerNode);

    // Add the literal marker text
    const markerNode = new ASTNode(NODE_TYPES.MARKER, markerName, markerToken.value);
    headerNode.addChild(markerNode);

    // Collect content until next marker, but stop at structural markers
    const content = this.collectHeaderContent();
    if (content.trim()) {
      const contentNode = new ASTNode(NODE_TYPES.CONTENT, null, content.trim());
      headerNode.addChild(contentNode);
    }
  }

  /**
   * Parse paragraph marker (p, m, q1, etc.)
   */
  parseParagraph() {
    const markerToken = this.advance();
    const markerName = this.extractMarkerName(markerToken.value);

    const paragraphNode = new ASTNode(NODE_TYPES.PARAGRAPH, markerName);
    this.ast.addChild(paragraphNode);

    // Add the literal marker text
    const markerNode = new ASTNode(NODE_TYPES.MARKER, markerName, markerToken.value);
    paragraphNode.addChild(markerNode);

    // Parse paragraph content (can contain character markers, text, etc.)
    this.parseParagraphContent(paragraphNode);
  }

  /**
   * Parse paragraph content
   * @param {ASTNode} paragraphNode - Paragraph node to add content to
   */
  parseParagraphContent(paragraphNode) {
    let lastPosition = this.position;

    while (this.position < this.tokens.length) {
      const token = this.peek();
      if (!token) break;

      // Safety check to prevent infinite loops
      if (this.position === lastPosition && this.position > 0) {
        // Position hasn't advanced, force advancement
        this.consumeTokenAsText(paragraphNode);
        break;
      }
      lastPosition = this.position;

      if (token.type === TOKEN_TYPES.MARKER) {
        const markerName = this.extractMarkerName(token.value);
        const markerInfo = getMarkerInfo(markerName);

        // Stop at paragraph-level markers, chapters, verses
        if (
          markerInfo &&
          (markerInfo.type === MARKER_TYPES.PARAGRAPH || markerName === "c" || markerName === "v")
        ) {
          break;
        }

        // Handle character markers within paragraph
        if (markerInfo && markerInfo.type === MARKER_TYPES.CHARACTER) {
          this.parseCharacterInContext(paragraphNode);
        } else if (markerInfo && markerInfo.type === MARKER_TYPES.MILESTONE) {
          this.parseMilestoneInContext(paragraphNode);
        } else {
          // Unknown marker - preserve as text
          this.consumeTokenAsText(paragraphNode);
        }
      } else {
        this.consumeTokenAsText(paragraphNode);
      }
    }
  }

  /**
   * Parse character marker within context
   * @param {ASTNode} parentNode - Parent node
   */
  parseCharacterInContext(parentNode) {
    const markerToken = this.advance();
    const markerName = this.extractMarkerName(markerToken.value);
    const markerInfo = getMarkerInfo(markerName);

    const charNode = new ASTNode(NODE_TYPES.CHARACTER, markerName);
    parentNode.addChild(charNode);

    // Add the literal marker text
    const markerNode = new ASTNode(NODE_TYPES.MARKER, markerName, markerToken.value);
    charNode.addChild(markerNode);

    // Handle attributes if present
    const nextToken = this.peek();
    if (nextToken && nextToken.type === TOKEN_TYPES.ATTRIBUTES) {
      const attributesToken = this.advance();
      const attributesNode = new ASTNode(NODE_TYPES.ATTRIBUTES, null, attributesToken.value);
      charNode.addChild(attributesNode);
    }

    if (markerInfo && markerInfo.hasEndMarker) {
      // Parse until end marker
      this.parseUntilEndMarker(charNode, markerName);
    } else {
      // Collect content until whitespace or next marker
      const content = this.collectContentUntilWhitespaceOrMarker();
      if (content) {
        const contentNode = new ASTNode(NODE_TYPES.CONTENT, null, content);
        charNode.addChild(contentNode);
      }
    }
  }

  /**
   * Parse milestone within context
   * @param {ASTNode} parentNode - Parent node
   */
  parseMilestoneInContext(parentNode) {
    const markerToken = this.advance();
    const markerName = this.extractMarkerName(markerToken.value);

    const milestoneNode = new ASTNode(NODE_TYPES.MILESTONE, markerName);
    parentNode.addChild(milestoneNode);

    // Add the literal marker text
    const markerNode = new ASTNode(NODE_TYPES.MARKER, markerName, markerToken.value);
    milestoneNode.addChild(markerNode);

    // Handle attributes if present
    const nextToken = this.peek();
    if (nextToken && nextToken.type === TOKEN_TYPES.ATTRIBUTES) {
      const attributesToken = this.advance();
      const attributesNode = new ASTNode(NODE_TYPES.ATTRIBUTES, null, attributesToken.value);
      milestoneNode.addChild(attributesNode);
    }
  }

  /**
   * Parse chapter marker
   */
  parseChapter() {
    const markerToken = this.advance();
    const chapterNode = new ASTNode(NODE_TYPES.CHAPTER, "c");
    this.ast.addChild(chapterNode);

    // Add the literal marker text
    const markerNode = new ASTNode(NODE_TYPES.MARKER, "c", markerToken.value);
    chapterNode.addChild(markerNode);

    // Get chapter number
    const numberToken = this.peek();
    if (numberToken && numberToken.type === TOKEN_TYPES.NUMBER) {
      const numberNode = new ASTNode(NODE_TYPES.NUMBER, null, this.advance().value);
      chapterNode.addChild(numberNode);
    }
  }

  /**
   * Parse verse marker
   */
  parseVerse() {
    const markerToken = this.advance();
    const verseNode = new ASTNode(NODE_TYPES.VERSE, "v");

    // Add to last paragraph if exists, otherwise to document
    const lastChild = this.ast.children[this.ast.children.length - 1];
    if (lastChild && lastChild.type === NODE_TYPES.PARAGRAPH) {
      lastChild.addChild(verseNode);
    } else {
      this.ast.addChild(verseNode);
    }

    // Add the literal marker text
    const markerNode = new ASTNode(NODE_TYPES.MARKER, "v", markerToken.value);
    verseNode.addChild(markerNode);

    // Get verse number
    const numberToken = this.peek();
    if (numberToken && numberToken.type === TOKEN_TYPES.NUMBER) {
      const numberNode = new ASTNode(NODE_TYPES.NUMBER, null, this.advance().value);
      verseNode.addChild(numberNode);
    }

    // Handle attributes if present
    const nextToken = this.peek();
    if (nextToken && nextToken.type === TOKEN_TYPES.ATTRIBUTES) {
      const attributesToken = this.advance();
      const attributesNode = new ASTNode(NODE_TYPES.ATTRIBUTES, null, attributesToken.value);
      verseNode.addChild(attributesNode);
    }

    // Parse verse content until next verse, chapter, or paragraph
    this.parseVerseContent(verseNode);
  }

  /**
   * Parse content within a verse
   * @param {ASTNode} verseNode - Verse node to add content to
   */
  parseVerseContent(verseNode) {
    let lastPosition = this.position;

    while (this.position < this.tokens.length) {
      const token = this.peek();
      if (!token) break;

      // Safety check to prevent infinite loops
      if (this.position === lastPosition && this.position > 0) {
        // Position hasn't advanced, force advancement
        this.consumeTokenAsText(verseNode);
        break;
      }
      lastPosition = this.position;

      if (token.type === TOKEN_TYPES.MARKER) {
        const markerName = this.extractMarkerName(token.value);
        const markerInfo = getMarkerInfo(markerName);

        // Stop at verse-level or higher markers
        if (
          markerName === "v" ||
          markerName === "c" ||
          (markerInfo && markerInfo.type === MARKER_TYPES.PARAGRAPH)
        ) {
          break;
        }

        // Handle character markers within verse
        if (markerInfo && markerInfo.type === MARKER_TYPES.CHARACTER) {
          this.parseCharacterInContext(verseNode);
        } else if (markerInfo && markerInfo.type === MARKER_TYPES.MILESTONE) {
          this.parseMilestoneInContext(verseNode);
        } else {
          // Unknown marker - preserve as text
          this.consumeTokenAsText(verseNode);
        }
      } else {
        this.consumeTokenAsText(verseNode);
      }
    }
  }

  /**
   * Parse milestone marker
   */
  parseMilestone() {
    const markerToken = this.advance();
    const markerName = this.extractMarkerName(markerToken.value);

    const milestoneNode = new ASTNode(NODE_TYPES.MILESTONE, markerName);
    this.ast.addChild(milestoneNode);

    // Add the literal marker text
    const markerNode = new ASTNode(NODE_TYPES.MARKER, markerName, markerToken.value);
    milestoneNode.addChild(markerNode);

    // Handle attributes if present
    const nextToken = this.peek();
    if (nextToken && nextToken.type === TOKEN_TYPES.ATTRIBUTES) {
      const attributesToken = this.advance();
      const attributesNode = new ASTNode(NODE_TYPES.ATTRIBUTES, null, attributesToken.value);
      milestoneNode.addChild(attributesNode);
    }
  }

  /**
   * Parse character marker at top level
   */
  parseCharacter() {
    const markerToken = this.advance();
    const markerName = this.extractMarkerName(markerToken.value);
    const markerInfo = getMarkerInfo(markerName);

    const charNode = new ASTNode(NODE_TYPES.CHARACTER, markerName);
    this.ast.addChild(charNode);

    // Add the literal marker text
    const markerNode = new ASTNode(NODE_TYPES.MARKER, markerName, markerToken.value);
    charNode.addChild(markerNode);

    // Handle attributes if present
    const nextToken = this.peek();
    if (nextToken && nextToken.type === TOKEN_TYPES.ATTRIBUTES) {
      const attributesToken = this.advance();
      const attributesNode = new ASTNode(NODE_TYPES.ATTRIBUTES, null, attributesToken.value);
      charNode.addChild(attributesNode);
    }

    if (markerInfo && markerInfo.hasEndMarker) {
      this.parseUntilEndMarker(charNode, markerName);
    } else {
      const content = this.collectContentUntilWhitespaceOrMarker();
      if (content) {
        const contentNode = new ASTNode(NODE_TYPES.CONTENT, null, content);
        charNode.addChild(contentNode);
      }
    }
  }

  /**
   * Parse note marker
   */
  parseNote() {
    const markerToken = this.advance();
    const markerName = this.extractMarkerName(markerToken.value);

    const noteNode = new ASTNode(NODE_TYPES.NOTE, markerName);
    this.ast.addChild(noteNode);

    // Add the literal marker text
    const markerNode = new ASTNode(NODE_TYPES.MARKER, markerName, markerToken.value);
    noteNode.addChild(markerNode);

    // Parse note content until end marker
    this.parseUntilEndMarker(noteNode, markerName);
  }

  /**
   * Parse content until end marker
   * @param {ASTNode} node - Node to add content to
   * @param {string} markerName - Marker name to find end for
   */
  parseUntilEndMarker(node, markerName) {
    const startPosition = this.position;
    let lastPosition = this.position;

    while (this.position < this.tokens.length) {
      const token = this.peek();
      if (!token) break;

      // Safety check to prevent infinite loops
      if (this.position === lastPosition && this.position > startPosition) {
        // Position hasn't advanced, consume token and break
        this.consumeTokenAsText(node);
        break;
      }
      lastPosition = this.position;

      if (
        token.type === TOKEN_TYPES.END_MARKER &&
        this.extractMarkerName(token.value) === markerName
      ) {
        // Add the end marker as a node
        const endMarkerToken = this.advance();
        const endMarkerNode = new ASTNode(NODE_TYPES.END_MARKER, markerName, endMarkerToken.value);
        node.addChild(endMarkerNode);
        break;
      }

      // Check for structural markers that should end this context
      if (token.type === TOKEN_TYPES.MARKER) {
        const innerMarkerName = this.extractMarkerName(token.value);
        const innerMarkerInfo = getMarkerInfo(innerMarkerName);

        // Stop at paragraph, chapter, or verse markers
        if (
          innerMarkerName === "c" ||
          innerMarkerName === "v" ||
          (innerMarkerInfo && innerMarkerInfo.type === MARKER_TYPES.PARAGRAPH)
        ) {
          break;
        }

        if (innerMarkerInfo && innerMarkerInfo.type === MARKER_TYPES.CHARACTER) {
          this.parseCharacterInContext(node);
        } else {
          this.consumeTokenAsText(node);
        }
      } else {
        this.consumeTokenAsText(node);
      }
    }
  }

  /**
   * Consume a token as text and add to parent
   * @param {ASTNode} parentNode - Parent node (optional, uses document if not provided)
   */
  consumeTokenAsText(parentNode = null) {
    const token = this.advance();
    const parent = parentNode || this.ast;

    if (
      token.type === TOKEN_TYPES.TEXT ||
      token.type === TOKEN_TYPES.WHITESPACE ||
      token.type === TOKEN_TYPES.NEWLINE ||
      token.type === TOKEN_TYPES.NUMBER ||
      token.type === TOKEN_TYPES.MARKER ||
      token.type === TOKEN_TYPES.END_MARKER ||
      token.type === TOKEN_TYPES.ATTRIBUTES
    ) {
      // Find last text child and append to it, or create new one
      const lastChild = parent.children[parent.children.length - 1];
      if (lastChild && lastChild.type === NODE_TYPES.TEXT) {
        lastChild.content += token.value;
      } else {
        const textNode = new ASTNode(NODE_TYPES.TEXT, null, token.value);
        parent.addChild(textNode);
      }
    }
  }

  /**
   * Collect content until next marker
   * @returns {string} Collected content
   */
  collectContentUntilNextMarker() {
    let content = "";

    while (this.position < this.tokens.length) {
      const token = this.peek();
      if (!token) break;

      if (token.type === TOKEN_TYPES.MARKER) {
        break;
      }

      content += this.advance().value;
    }

    return content;
  }

  /**
   * Collect header content until next structural marker
   * @returns {string} Collected content
   */
  collectHeaderContent() {
    let content = "";

    while (this.position < this.tokens.length) {
      const token = this.peek();
      if (!token) break;

      if (token.type === TOKEN_TYPES.MARKER) {
        const markerName = this.extractMarkerName(token.value);
        const markerInfo = getMarkerInfo(markerName);

        // Stop at structural markers (chapters, verses, paragraphs)
        if (
          markerName === "c" ||
          markerName === "v" ||
          (markerInfo && markerInfo.type === MARKER_TYPES.PARAGRAPH) ||
          this.isHeaderMarker(markerName)
        ) {
          break;
        }
      }

      content += this.advance().value;
    }

    return content;
  }

  /**
   * Collect content until whitespace or marker
   * @returns {string} Collected content
   */
  collectContentUntilWhitespaceOrMarker() {
    let content = "";

    while (this.position < this.tokens.length) {
      const token = this.peek();
      if (!token) break;

      if (
        token.type === TOKEN_TYPES.MARKER ||
        token.type === TOKEN_TYPES.WHITESPACE ||
        token.type === TOKEN_TYPES.NEWLINE
      ) {
        break;
      }

      content += this.advance().value;
    }

    return content;
  }

  /**
   * Peek at current token without advancing
   * @returns {Token|null} Current token
   */
  peek() {
    return this.position < this.tokens.length ? this.tokens[this.position] : null;
  }

  /**
   * Advance position and return current token
   * @returns {Token|null} Current token before advancing
   */
  advance() {
    return this.position < this.tokens.length ? this.tokens[this.position++] : null;
  }

  /**
   * Extract marker name from marker token value
   * @param {string} tokenValue - Token value (e.g., "\\v", "\\w*")
   * @returns {string} Marker name
   */
  extractMarkerName(tokenValue) {
    return tokenValue.replace(/^\\/, "").replace(/\*$/, "");
  }

  /**
   * Check if marker is a header marker
   * @param {string} markerName - Marker name
   * @returns {boolean} True if header marker
   */
  isHeaderMarker(markerName) {
    const headerMarkers = [
      "id",
      "usfm",
      "ide",
      "h",
      "toc1",
      "toc2",
      "toc3",
      "toca1",
      "toca2",
      "toca3",
      "mt",
      "mte",
      "ms",
      "mr",
    ];
    return headerMarkers.some((marker) => markerName.startsWith(marker));
  }
}

/**
 * Utility function to parse USFM text
 * @param {string} usfmText - Raw USFM text
 * @returns {ASTNode} Root AST node
 */
export function parseUSFM(usfmText) {
  const parser = new USFMParser();
  return parser.parse(usfmText);
}

/**
 * Utility function to extract chapter content from AST
 * @param {ASTNode} ast - Root AST node
 * @param {number} chapterNumber - Chapter number to extract
 * @returns {ASTNode|null} Chapter node or null if not found
 */
export function extractChapter(ast, chapterNumber) {
  const chapters = ast.findChildren(NODE_TYPES.CHAPTER);
  return (
    chapters.find((chapter) => {
      const numberNode = chapter.findChildren(NODE_TYPES.NUMBER)[0];
      return numberNode && parseInt(numberNode.content) === chapterNumber;
    }) || null
  );
}

/**
 * Utility function to extract verses from AST
 * @param {ASTNode} ast - Root AST node
 * @returns {ASTNode[]} Array of verse nodes
 */
export function extractVerses(ast) {
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
  return verses;
}

/**
 * Debug function to print AST in a readable format
 * @param {ASTNode} node - AST node to print
 * @param {number} depth - Current depth for indentation
 * @returns {string} Formatted AST string
 */
export function debugAST(node, depth = 0) {
  const indent = "  ".repeat(depth);
  let result = `${indent}${node.toString()}`;

  if (node.content) {
    result += `: "${node.content}"`;
  }

  if (node.attributes) {
    result += ` [${node.attributes}]`;
  }

  result += "\n";

  for (const child of node.children) {
    result += debugAST(child, depth + 1);
  }

  return result;
}
