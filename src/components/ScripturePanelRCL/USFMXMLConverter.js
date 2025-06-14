/**
 * USFMXMLConverter.js
 * Converts USFM AST to XML format preserving ALL original text
 */

import { NODE_TYPES } from "./USFMParser.js";

/**
 * Convert AST to XML string
 * @param {ASTNode} ast - Root AST node
 * @returns {string} XML string
 */
export function convertASTToXML(ast) {
  const converter = new USFMXMLConverter();
  return converter.convert(ast);
}

/**
 * USFM XML Converter class
 */
export class USFMXMLConverter {
  constructor() {
    this.xml = "";
    this.depth = 0;
  }

  /**
   * Convert AST to XML
   * @param {ASTNode} ast - Root AST node
   * @returns {string} XML string
   */
  convert(ast) {
    this.xml = "";
    this.depth = 0;

    this.xml += '<usfm class="preview">';
    this.convertNode(ast);
    this.xml += "</usfm>";

    return this.xml;
  }

  /**
   * Convert a single AST node to XML
   * @param {ASTNode} node - AST node to convert
   */
  convertNode(node) {
    switch (node.type) {
      case NODE_TYPES.DOCUMENT:
        this.convertDocument(node);
        break;
      case NODE_TYPES.HEADER:
        this.convertHeader(node);
        break;
      case NODE_TYPES.CHAPTER:
        this.convertChapter(node);
        break;
      case NODE_TYPES.VERSE:
        this.convertVerse(node);
        break;
      case NODE_TYPES.PARAGRAPH:
        this.convertParagraph(node);
        break;
      case NODE_TYPES.CHARACTER:
        this.convertCharacter(node);
        break;
      case NODE_TYPES.MILESTONE:
        this.convertMilestone(node);
        break;
      case NODE_TYPES.NOTE:
        this.convertNote(node);
        break;
      case NODE_TYPES.TEXT:
        this.convertText(node);
        break;
      case NODE_TYPES.MARKER:
        this.convertMarker(node);
        break;
      case NODE_TYPES.CONTENT:
        this.convertContent(node);
        break;
      case NODE_TYPES.NUMBER:
        this.convertNumber(node);
        break;
      case NODE_TYPES.ATTRIBUTES:
        this.convertAttributes(node);
        break;
      case NODE_TYPES.END_MARKER:
        this.convertEndMarker(node);
        break;
      default:
        // Unknown node type - just convert children
        this.convertChildren(node);
        break;
    }
  }

  /**
   * Convert document node
   * @param {ASTNode} node - Document node
   */
  convertDocument(node) {
    // Separate headers from content
    const headers = node.children.filter((child) => child.type === NODE_TYPES.HEADER);
    const content = node.children.filter((child) => child.type !== NODE_TYPES.HEADER);

    // Convert headers
    if (headers.length > 0) {
      this.xml += "<headers>";
      headers.forEach((header) => this.convertNode(header));
      this.xml += "</headers>";
    }

    // Convert content
    content.forEach((child) => this.convertNode(child));
  }

  /**
   * Convert header node
   * @param {ASTNode} node - Header node
   */
  convertHeader(node) {
    const className = node.marker || "header";
    this.xml += `<header class="${className}">`;
    this.convertChildren(node);
    this.xml += "</header>";
  }

  /**
   * Convert chapter node
   * @param {ASTNode} node - Chapter node
   */
  convertChapter(node) {
    this.xml += "<c>";
    this.convertChildren(node);
    this.xml += "</c>";
  }

  /**
   * Convert verse node
   * @param {ASTNode} node - Verse node
   */
  convertVerse(node) {
    this.xml += "<v>";
    this.convertChildren(node);
    this.xml += "</v>";
  }

  /**
   * Convert paragraph node
   * @param {ASTNode} node - Paragraph node
   */
  convertParagraph(node) {
    const className = node.marker || "paragraph";
    this.xml += `<paragraph class="${className}">`;
    this.convertChildren(node);
    this.xml += "</paragraph>";
  }

  /**
   * Convert character node
   * @param {ASTNode} node - Character node
   */
  convertCharacter(node) {
    const className = node.marker || "character";
    this.xml += `<word>`;
    this.convertChildren(node);
    this.xml += "</word>";
  }

  /**
   * Convert milestone node
   * @param {ASTNode} node - Milestone node
   */
  convertMilestone(node) {
    const className = node.marker || "milestone";
    this.xml += `<milestone class="${className}">`;
    this.convertChildren(node);
    this.xml += "</milestone>";
  }

  /**
   * Convert note node
   * @param {ASTNode} node - Note node
   */
  convertNote(node) {
    const className = node.marker || "note";
    this.xml += `<note class="${className}">`;
    this.convertChildren(node);
    this.xml += "</note>";
  }

  /**
   * Convert text node
   * @param {ASTNode} node - Text node
   */
  convertText(node) {
    this.xml += this.escapeXML(node.content);
  }

  /**
   * Convert marker node
   * @param {ASTNode} node - Marker node
   */
  convertMarker(node) {
    const className = node.marker || "marker";
    this.xml += `<marker class="${className}">${this.escapeXML(node.content)}</marker>`;
  }

  /**
   * Convert content node
   * @param {ASTNode} node - Content node
   */
  convertContent(node) {
    this.xml += `<content>${this.escapeXML(node.content)}</content>`;
  }

  /**
   * Convert number node
   * @param {ASTNode} node - Number node
   */
  convertNumber(node) {
    this.xml += `<number>${this.escapeXML(node.content)}</number>`;
  }

  /**
   * Convert attributes node
   * @param {ASTNode} node - Attributes node
   */
  convertAttributes(node) {
    // Parse attributes from the content
    const attributesText = node.content;
    if (attributesText) {
      // Extract attributes from string like 'x-strong="G39720" x-lemma="Παῦλος"'
      const attributes = this.parseAttributes(attributesText);
      let attributesStr = "";
      Object.entries(attributes).forEach(([key, value]) => {
        attributesStr += ` ${key}="${this.escapeXML(value)}"`;
      });
      this.xml += `<attributes${attributesStr}>${this.escapeXML(attributesText)}</attributes>`;
    }
  }

  /**
   * Convert end marker node
   * @param {ASTNode} node - End marker node
   */
  convertEndMarker(node) {
    const className = node.marker ? `${node.marker}*` : "*";
    this.xml += `<marker class="${className}">${this.escapeXML(node.content)}</marker>`;
  }

  /**
   * Convert all children of a node
   * @param {ASTNode} node - Parent node
   */
  convertChildren(node) {
    node.children.forEach((child) => this.convertNode(child));
  }

  /**
   * Parse attributes string into object
   * @param {string} attributesText - Attributes text
   * @returns {Object} Parsed attributes
   */
  parseAttributes(attributesText) {
    const attributes = {};
    const attributeRegex = /(\w+(?:-\w+)*)="([^"]*)"/g;
    let match;

    while ((match = attributeRegex.exec(attributesText)) !== null) {
      attributes[match[1]] = match[2];
    }

    return attributes;
  }

  /**
   * Escape XML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeXML(text) {
    if (typeof text !== "string") return "";

    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}

/**
 * Utility function to format XML with indentation
 * @param {string} xml - Raw XML string
 * @returns {string} Formatted XML string
 */
export function formatXML(xml) {
  let formatted = "";
  let indent = 0;
  const tab = "  ";

  xml.split(/>\s*</).forEach((node, index) => {
    if (index > 0) {
      formatted += ">";
    }
    if (index < xml.split(/>\s*</).length - 1) {
      formatted += "<";
    }

    if (node.match(/^\/\w/)) {
      // Closing tag
      indent--;
    }

    formatted += tab.repeat(Math.max(0, indent));

    if (node.match(/^<?\w[^>]*[^\/]$/)) {
      // Opening tag
      indent++;
    }

    formatted += node;

    if (index < xml.split(/>\s*</).length - 1) {
      formatted += "\n";
    }
  });

  return formatted;
}
