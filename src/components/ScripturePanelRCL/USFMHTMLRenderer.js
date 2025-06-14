/**
 * USFMHTMLRenderer.js
 * Renders USFM AST into semantic HTML
 * Generates HTML matching the test case format with proper semantic structure
 */

import { NODE_TYPES } from "./USFMParser.js";

/**
 * HTML Renderer class
 * Converts AST nodes into semantic HTML
 */
export class USFMHTMLRenderer {
  constructor(options = {}) {
    this.mode = options.mode || "preview"; // preview, full, debug
    this.preserveWhitespace = options.preserveWhitespace || false;
    this.alignmentStack = []; // Track open alignment structures
  }

  /**
   * Render AST to HTML string
   * @param {ASTNode} ast - Root AST node
   * @returns {string} HTML string
   */
  renderToHTML(ast) {
    this.alignmentStack = []; // Reset alignment stack
    return this.renderNode(ast);
  }

  /**
   * Render a single AST node
   * @param {ASTNode} node - AST node to render
   * @returns {string} HTML string
   */
  renderNode(node) {
    if (!node) return "";

    switch (node.type) {
      case NODE_TYPES.DOCUMENT:
        return this.renderDocument(node);
      case NODE_TYPES.HEADER:
        return this.renderHeader(node);
      case NODE_TYPES.CHAPTER:
        return this.renderChapter(node);
      case NODE_TYPES.VERSE:
        return this.renderVerse(node);
      case NODE_TYPES.CHARACTER:
        return this.renderCharacter(node);
      case NODE_TYPES.MILESTONE:
        return this.renderMilestone(node);
      case NODE_TYPES.TEXT:
        return this.renderText(node);
      case NODE_TYPES.NUMBER:
        return this.renderNumber(node);
      case NODE_TYPES.ATTRIBUTES:
        return this.renderAttributes(node);
      default:
        return this.renderGeneric(node);
    }
  }

  /**
   * Render document root
   * @param {ASTNode} node - Document node
   * @returns {string} HTML string
   */
  renderDocument(node) {
    if (!node.children) return `<usfm class="${this.mode}"></usfm>`;

    // Separate headers from other content
    const headers = node.children.filter((child) => child.type === NODE_TYPES.HEADER);
    const otherContent = node.children.filter((child) => child.type !== NODE_TYPES.HEADER);

    let content = "";

    // Render headers container if headers exist
    if (headers.length > 0) {
      const headersHTML = headers.map((header) => this.renderNode(header)).join("");
      content += `<headers>${headersHTML}</headers>`;
    }

    // Render other content directly (chapters and verses)
    if (otherContent.length > 0) {
      const otherHTML = otherContent.map((child) => this.renderNode(child)).join("");
      content += otherHTML;
    }

    return `<usfm class="${this.mode}">${content}</usfm>`;
  }

  /**
   * Render header node
   * @param {ASTNode} node - Header node
   * @returns {string} HTML string
   */
  renderHeader(node) {
    const markerName = node.marker;
    const content = this.renderChildren(node);
    return `<header class="${markerName}">${this.renderHeaderMarker(
      markerName
    )}${content}</header>`;
  }

  /**
   * Render chapter node
   * @param {ASTNode} node - Chapter node
   * @returns {string} HTML string
   */
  renderChapter(node) {
    const content = this.renderChildren(node);
    return `<c>${this.renderMarker("c")}${content}</c>`;
  }

  /**
   * Render verse node
   * @param {ASTNode} node - Verse node
   * @returns {string} HTML string
   */
  renderVerse(node) {
    const content = this.renderChildren(node);
    return `<v>${this.renderMarker("v")}${content}</v>`;
  }

  /**
   * Render character marker node
   * @param {ASTNode} node - Character node
   * @returns {string} HTML string
   */
  renderCharacter(node) {
    const markerName = node.marker;

    // Handle alignment start markers
    if (markerName === "zaln-s") {
      this.alignmentStack.push("zaln");
      return this.renderMarker("zaln-s");
    }

    // Handle alignment end markers
    if (markerName === "zaln-e") {
      if (
        this.alignmentStack.length > 0 &&
        this.alignmentStack[this.alignmentStack.length - 1] === "zaln"
      ) {
        this.alignmentStack.pop();
      }
      return this.renderMarker("zaln-e");
    }

    // Handle word markers
    if (markerName === "w") {
      const content = this.renderChildren(node);
      return `<word>${this.renderMarker("w")}${content}${this.renderEndMarker("w")}</word>`;
    }

    // Generic character marker
    const content = this.renderChildren(node);
    const tagName = this.getSemanticTagName(markerName);
    return `<${tagName}>${this.renderMarker(markerName)}${content}${this.renderEndMarker(
      markerName
    )}</${tagName}>`;
  }

  /**
   * Render milestone node
   * @param {ASTNode} node - Milestone node
   * @returns {string} HTML string
   */
  renderMilestone(node) {
    if (node.marker === "*") {
      return this.renderMilestoneEnd();
    }

    const content = this.renderChildren(node);
    return content;
  }

  /**
   * Render text node
   * @param {ASTNode} node - Text node
   * @returns {string} HTML string
   */
  renderText(node) {
    return `<content>${this.escapeHTML(node.content || "")}</content>`;
  }

  /**
   * Render number node
   * @param {ASTNode} node - Number node
   * @returns {string} HTML string
   */
  renderNumber(node) {
    return `<number>${this.escapeHTML(node.content || "")}</number>`;
  }

  /**
   * Render attributes node
   * @param {ASTNode} node - Attributes node
   * @returns {string} HTML string
   */
  renderAttributes(node) {
    return `<attributes>${this.escapeHTML(node.content || "")}</attributes>`;
  }

  /**
   * Render generic node
   * @param {ASTNode} node - Generic node
   * @returns {string} HTML string
   */
  renderGeneric(node) {
    return this.renderChildren(node);
  }

  /**
   * Render node children
   * @param {ASTNode} node - Node with children
   * @returns {string} HTML string
   */
  renderChildren(node) {
    if (!node.children || !Array.isArray(node.children)) {
      return "";
    }
    return node.children.map((child) => this.renderNode(child)).join("");
  }

  /**
   * Render a USFM marker
   * @param {string} markerName - Marker name
   * @returns {string} HTML string
   */
  renderMarker(markerName) {
    const markerClass = this.getMarkerClass(markerName);
    return `<marker class="${markerClass}">\\${markerName} </marker>`;
  }

  /**
   * Render an end marker
   * @param {string} markerName - Marker name
   * @returns {string} HTML string
   */
  renderEndMarker(markerName) {
    return `<marker class="${markerName}*">\\${markerName}*</marker>`;
  }

  /**
   * Render milestone end marker (\*)
   * @returns {string} HTML string
   */
  renderMilestoneEnd() {
    return `<marker class="*">\\*</marker>`;
  }

  /**
   * Render a header marker with proper class
   * @param {string} markerName - Marker name
   * @returns {string} HTML string
   */
  renderHeaderMarker(markerName) {
    // Some header markers use just the marker name, others use "marker" prefix
    const useMarkerPrefix = ["ide", "h", "toc1", "toc2", "toc3", "mt"];
    const markerClass = useMarkerPrefix.includes(markerName) ? `marker ${markerName}` : markerName;

    return `<marker class="${markerClass}">\\${markerName} </marker>`;
  }

  /**
   * Get semantic tag name for a marker
   * @param {string} markerName - Marker name
   * @returns {string} Tag name
   */
  getSemanticTagName(markerName) {
    const tagMap = {
      w: "word",
      "zaln-s": "alignment-start",
      "zaln-e": "alignment-end",
      add: "addition",
      bk: "book-name",
      dc: "deuterocanonical",
      k: "keyword",
      lit: "liturgical",
      nd: "name-deity",
      ord: "ordinal",
      pn: "proper-name",
      png: "geographic-name",
      qt: "quoted-text",
      sig: "signature",
      sls: "language-switch",
      tl: "transliterated",
      wj: "words-jesus",
    };

    return tagMap[markerName] || markerName;
  }

  /**
   * Get CSS class for marker
   * @param {string} markerName - Marker name
   * @returns {string} CSS class
   */
  getMarkerClass(markerName) {
    // Map specific markers to special classes
    const classMap = {
      "zaln-s": "zaln-s",
      "zaln-e": "zaln-e",
      w: "w",
      v: "v",
      c: "c",
    };

    return classMap[markerName] || markerName;
  }

  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHTML(text) {
    if (typeof text !== "string") return "";

    const escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return text.replace(/[&<>"']/g, (match) => escapeMap[match]);
  }

  /**
   * Set rendering mode
   * @param {string} mode - Rendering mode (preview, full, debug)
   */
  setMode(mode) {
    this.mode = mode;
  }
}

/**
 * Utility function to render AST to HTML
 * @param {ASTNode} ast - Root AST node
 * @param {string} mode - Rendering mode
 * @returns {string} HTML string
 */
export function renderUSFMToHTML(ast, mode = "preview") {
  const renderer = new USFMHTMLRenderer({ mode });
  return renderer.renderToHTML(ast);
}

/**
 * Utility function to render chapter verses
 * @param {ASTNode[]} verses - Array of verse nodes
 * @param {string} mode - Rendering mode
 * @returns {string} HTML string
 */
export function renderVersesToHTML(verses, mode = "preview") {
  const renderer = new USFMHTMLRenderer({ mode });
  return verses.map((verse) => renderer.renderNode(verse)).join("");
}
