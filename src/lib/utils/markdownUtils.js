/**
 * markdownUtils.js
 * Utility functions for rendering markdown content with RC link support in Svelte
 */

/**
 * Preprocesses markdown content to convert plain text RC links to markdown links
 * @param {string} content - The content to preprocess
 * @returns {string} - Content with RC links converted to markdown links
 */
function preprocessRcLinks(content) {
  if (!content || typeof content !== "string") {
    return content;
  }

  // Convert plain text rc:// links to markdown links
  // First, protect existing markdown links from being processed
  const existingLinks = [];
  let protectedContent = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const placeholder = `__EXISTING_LINK_${existingLinks.length}__`;
    existingLinks.push(match);
    return placeholder;
  });

  // Now convert plain text rc:// links to markdown links
  const rcLinkRegex = /rc:\/\/[^\s)]+/g;
  protectedContent = protectedContent.replace(rcLinkRegex, (match) => {
    return `[${match}](${match})`;
  });

  // Restore existing markdown links
  existingLinks.forEach((link, index) => {
    const placeholder = `__EXISTING_LINK_${index}__`;
    protectedContent = protectedContent.replace(placeholder, link);
  });

  return protectedContent;
}

/**
 * Simple markdown to HTML converter for basic formatting
 * @param {string} text - The markdown text to convert
 * @returns {string} - HTML string
 */
function simpleMarkdownToHtml(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  let html = text;

  // Convert headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Convert bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Convert italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Convert line breaks
  html = html.replace(/\n/g, '<br>');

  // Convert paragraphs (simple version)
  html = html.replace(/(.+?)(<br><br>|$)/g, '<p>$1</p>');

  return html;
}

/**
 * Processes text content to render markdown with RC link support
 * This returns an HTML string that can be used with {@html} in Svelte
 * @param {string} text - The text content to process
 * @param {Function} onRcLinkClick - Callback function to handle rc:// link clicks
 * @returns {string} - HTML string
 */
export function processMarkdownWithRcLinks(text, onRcLinkClick) {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Preprocess content to convert plain text RC links to markdown links
  const processedContent = preprocessRcLinks(text);
  
  // Convert to simple HTML
  let html = simpleMarkdownToHtml(processedContent);

  // Convert RC links to clickable elements (for display purposes)
  // In a real implementation, you'd need to handle clicks via Svelte event binding
  html = html.replace(/\[([^\]]+)\]\((rc:\/\/[^)]+)\)/g, (match, text, rcUri) => {
    return `<button class="rc-link-button" data-rc-uri="${rcUri}" style="background: none; border: none; color: var(--color-primary); text-decoration: underline; cursor: pointer; padding: 0; font: inherit;">${text}</button>`;
  });

  // Convert regular markdown links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return html;
}

/**
 * Simple function to escape HTML entities
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export function escapeHtml(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Extract plain text from HTML content
 * @param {string} html - HTML content
 * @returns {string} - Plain text
 */
export function stripHtml(html) {
  if (!html || typeof html !== "string") {
    return "";
  }

  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}