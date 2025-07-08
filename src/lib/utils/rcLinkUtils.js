/**
 * rcLinkUtils.js
 * Utility functions for handling rc:// links in translation resources
 * Provides functionality to make resource links clickable and navigate to related content
 */

/**
 * Processes text content and converts rc:// links to clickable HTML
 * @param {string} text - The text content to process
 * @param {Function} onRcLinkClick - Callback function to handle rc:// link clicks
 * @returns {string} - HTML string with clickable rc:// links
 */
export function processRcLinks(text, onRcLinkClick) {
  if (!text || typeof text !== "string") {
    return text;
  }

  // Regex to match rc:// URIs
  const rcLinkRegex = /rc:\/\/[^\s)]+/g;
  
  // Replace rc:// links with clickable buttons
  return text.replace(rcLinkRegex, (match) => {
    return `<button class="rc-link-button" data-rc-uri="${match}" style="background: none; border: none; color: var(--color-primary); text-decoration: underline; cursor: pointer; padding: 0; font: inherit; display: inline;" title="Navigate to ${match}">${match}</button>`;
  });
}

/**
 * Converts an rc:// URI to a browsable URL (for external access if needed)
 * @param {string} rcUri - The rc:// URI to convert
 * @param {string} defaultLanguage - Default language code to use if URI has wildcard
 * @param {string} defaultOrganization - Default organization to use
 * @returns {string|null} - The converted URL or null if conversion fails
 */
export function convertRcUriToUrl(
  rcUri,
  defaultLanguage = "en",
  defaultOrganization = "unfoldingWord"
) {
  if (!rcUri || !rcUri.startsWith("rc://")) {
    return null;
  }

  try {
    // Parse the rc:// URI
    // Format: rc://language/resource/version/path
    const parts = rcUri.split("/");
    if (parts.length < 4) {
      return null;
    }

    let language = parts[2];
    const resource = parts[3];
    const version = parts[4] || "latest";
    const path = parts.slice(5).join("/");

    // Handle wildcard language
    if (language === "*") {
      language = defaultLanguage;
    }

    // Construct DCS URL
    // This is a basic implementation - in practice you'd want to use the actual DCS API
    const baseUrl = "https://git.door43.org";
    const repoPath = `${language}_${resource}`;

    if (path) {
      return `${baseUrl}/${defaultOrganization}/${repoPath}/src/branch/master/${path}`;
    } else {
      return `${baseUrl}/${defaultOrganization}/${repoPath}`;
    }
  } catch (error) {
    console.error("Error converting rc:// URI to URL:", error);
    return null;
  }
}

/**
 * Simple RcLink function that returns an HTML string for Svelte components
 * @param {string} rcUri - The rc:// URI to link to
 * @param {string} text - The text to display as the link
 * @param {Function} onRcLinkClick - Callback function to handle rc:// link clicks
 * @returns {string} - HTML string for the clickable link
 */
export function RcLink({ rcUri, children, onRcLinkClick }) {
  // For Svelte components, this would be handled differently
  // This is a placeholder that returns a simplified structure
  return {
    rcUri,
    children,
    onRcLinkClick
  };
}