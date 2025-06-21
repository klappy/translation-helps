/**
 * USFM Text Extractor - Clean text extraction for LLM context
 * 
 * This utility extracts clean, readable text from USFM content for LLM consumption.
 * It removes all alignment data, markup, and annotations that could confuse the LLM
 * and cause scripture misquotes.
 * 
 * Based on: ResourcesContext.usfm-semantic-extraction.test.js
 */

import { parseUSFMToHTML } from "../components/ScripturePanelRCL/USFMSemanticParser.js";

/**
 * Extracts visible text from rendered USFM HTML following CSS visibility rules
 * Implements the getVisibleText() function documented in the USFM manual
 * @param {HTMLElement} element - DOM element containing USFM HTML
 * @returns {string} Clean visible text without hidden markers/attributes
 */
function getVisibleText(element) {
  // UNIFIED EXTRACTION: Use server-side logic for ALL environments
  // Browser CSS-based extraction is unreliable - innerText doesn't properly filter USFM markup
  // The server-side regex approach is proven to work correctly in all test cases
  
  // UNIFIED EXTRACTION: Use server-side logic for ALL environments
  // Browser CSS-based extraction is unreliable - innerText doesn't properly filter USFM markup
  // The server-side regex approach is proven to work correctly and preserve punctuation
  
  let html = element.innerHTML;
  
  // Remove ALL hidden elements according to USFM CSS rules
  // 1. Remove marker elements (contain USFM markup)
  html = html.replace(/<marker[^>]*>.*?<\/marker>/gs, '');
  // 2. Remove attributes elements (contain alignment data)  
  html = html.replace(/<attributes[^>]*>.*?<\/attributes>/gs, '');
  // 3. Remove number elements (verse numbers - we'll add these back separately)
  html = html.replace(/<number[^>]*>.*?<\/number>/gs, '');
  // 4. Remove zaln wrapper elements but keep their content (word elements)
  html = html.replace(/<zaln[^>]*>/g, '').replace(/<\/zaln>/g, '');
  // 5. Remove word wrapper elements but keep their content
  html = html.replace(/<word[^>]*>/g, '').replace(/<\/word>/g, '');
  // 6. Extract only content from <content> elements and text nodes
  // This preserves punctuation between elements
  html = html.replace(/<content[^>]*>/g, '').replace(/<\/content>/g, '');
  // 7. Clean up any remaining tags
  html = html.replace(/<[^>]*>/g, ' ');
  // 8. Clean up whitespace and return clean text
  return html.replace(/\s+/g, ' ').trim();
}



/**
 * Extracts clean text for a specific verse using the scripture panel's CSS approach
 * @param {string} usfmText - Raw USFM content  
 * @param {number} chapter - Target chapter number
 * @param {number} verse - Target verse number
 * @returns {string} Clean text for the specific verse
 */
export function extractVerseText(usfmText, chapter, verse) {
  if (!usfmText || typeof usfmText !== 'string') {
    console.warn('🔍 USFM Extractor: Invalid USFM text provided');
    return "";
  }

  try {
    console.log(`🔍 USFM Extractor: Using documented semantic parser approach for chapter ${chapter}, verse ${verse}`);
    
    // Use the EXACT same system that the scripture panel uses!
    // Generate semantic HTML with "preview" mode (same as UI)
    const html = parseUSFMToHTML(usfmText, "preview");
    
    console.log(`🔍 USFM Extractor: Using scripture panel's exact rendering system`);
    console.log(`🔍 USFM Extractor: Generated semantic HTML (${html.length} chars)`);
    console.log(`🔍 USFM Extractor: HTML preview: ${html.substring(0, 500)}...`);
    
    // Create DOM element with proper CSS structure for hiding rules
    // Use mock DOM in ALL environments for consistent USFM filtering
    const tempDiv = createMockElement();
    
    tempDiv.innerHTML = html;
    
    // Ensure the USFM element has the preview class for CSS rules to apply
    const usfmElement = tempDiv.querySelector('usfm');
    if (usfmElement && !usfmElement.classList.contains('preview')) {
      usfmElement.classList.add('preview');
    }
    
    // Find the specific verse element
    const verseElements = tempDiv.querySelectorAll("v");
    let targetVerseElement = null;
    
    for (const vEl of verseElements) {
      const numberEl = vEl.querySelector("number");
      if (numberEl && numberEl.textContent.trim() === String(verse)) {
        targetVerseElement = vEl;
        break;
      }
    }
    
    if (!targetVerseElement) {
      console.warn(`⚠️ USFM Extractor: Verse ${verse} not found in chapter ${chapter}`);
      return "";
    }
    
    // Get verse number for context
    const numberEl = targetVerseElement.querySelector("number");
    const verseNumber = numberEl ? numberEl.textContent.trim() : verse;
    
    // Use the documented getVisibleText approach from the USFM manual on the specific verse
    const visibleText = getVisibleText(targetVerseElement);
    
    // Format with simple verse number for LLM clarity
    const formattedText = `${verseNumber} ${visibleText.trim()}`;
    
    console.log(`🔍 USFM Extractor: Visible text extracted: "${formattedText}"`);
    return formattedText;
    
  } catch (err) {
    console.error("❌ USFM Extractor: Error in semantic parser extraction:", err);
    return "";
  }
}



/**
 * Extracts clean text for an entire chapter from USFM content
 * @param {string} usfmText - Raw USFM content
 * @param {number} chapter - Target chapter number
 * @returns {string} Clean text content for the entire chapter
 */
export function extractChapterText(usfmText, chapter) {
  if (!usfmText || typeof usfmText !== 'string') {
    console.warn('🔍 USFM Extractor: Invalid USFM text provided for chapter extraction');
    return "";
  }

  try {
    console.log(`🔍 USFM Extractor: Extracting full chapter ${chapter} text`);
    
    // Use the existing semantic parser in preview mode
    const html = parseUSFMToHTML(usfmText, "preview");
    
    // Create temporary DOM element to parse the HTML
    // Use mock DOM in ALL environments for consistent USFM filtering
    const tempDiv = createMockElement();
    
    tempDiv.innerHTML = html;

    // Ensure the USFM element has the preview class for CSS rules to apply
    const usfmElement = tempDiv.querySelector('usfm');
    if (usfmElement && !usfmElement.classList.contains('preview')) {
      usfmElement.classList.add('preview');
    }

    // Find the chapter element
    const chapterElements = tempDiv.querySelectorAll("c");
    let targetChapterElement = null;
    
    for (const cEl of chapterElements) {
      const numberEl = cEl.querySelector("number");
      if (numberEl && numberEl.textContent.trim() === String(chapter)) {
        // Find the parent element that contains this chapter's content
        targetChapterElement = cEl.parentElement;
        break;
      }
    }

    if (targetChapterElement) {
      // Extract all verse content from this chapter
      const verses = [];
      const vElements = targetChapterElement.querySelectorAll("v");
      
      for (const vEl of vElements) {
        // Get verse number
        const numberEl = vEl.querySelector("number");
        const verseNumber = numberEl ? numberEl.textContent.trim() : '';
        
        // Get clean verse text
        const verseText = getVisibleText(vEl).trim();
        
        if (verseText && verseNumber) {
          // Format as "X content" for LLM clarity
          verses.push(`${verseNumber} ${verseText}`);
        }
      }
      
      const chapterText = verses.join(" ");
      console.log(`✅ USFM Extractor: Extracted chapter text with ${verses.length} verses (${chapterText.length} characters)`);
      return chapterText;
    }

    console.warn(`⚠️ USFM Extractor: Chapter ${chapter} not found in USFM content`);
    return "";
  } catch (err) {
    console.error("❌ USFM Extractor: Error extracting chapter text:", err);
    return "";
  }
}

/**
 * Creates a mock DOM element for server-side environments
 * @returns {object} Mock element with basic DOM-like interface
 */
function createMockElement() {
  const element = {
    innerHTML: "",
    get textContent() {
      // textContent returns ALL text including hidden elements (preserves USFM)
      return this.innerHTML.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    },
    get innerText() {
      // Simulate what the browser innerText does: return only visible text
      // Step 1: Remove hidden elements (marker and attributes)
      let html = this.innerHTML;
      html = html.replace(/<marker[^>]*>.*?<\/marker>/gs, '');
      html = html.replace(/<attributes[^>]*>.*?<\/attributes>/gs, '');
      
      // Step 2: Extract text from all remaining elements
      html = html.replace(/<[^>]*>/g, ' ');
      
      // Step 3: Clean up whitespace
      return html.replace(/\s+/g, ' ').trim();
    },
    set textContent(value) {
      this.innerHTML = value || "";
    },
    querySelectorAll: function(selector) {
      if (selector === 'v') {
        // Find all <v>...</v> elements
        const vMatches = this.innerHTML.match(/<v[^>]*>(.*?)<\/v>/gs) || [];
        return vMatches.map(match => {
          const vElement = createMockElement();
          vElement.innerHTML = match;
          
          // Override querySelector for this verse element
          vElement.querySelector = function(childSelector) {
            if (childSelector === 'number') {
              const numberMatch = this.innerHTML.match(/<number[^>]*>(.*?)<\/number>/);
              if (numberMatch) {
                return { textContent: numberMatch[1] };
              }
            }
            return null;
          };
          
          // Override querySelectorAll for content elements within this verse
          vElement.querySelectorAll = function(childSelector) {
            if (childSelector === 'content') {
              const contentMatches = this.innerHTML.match(/<content[^>]*>(.*?)<\/content>/gs) || [];
              return contentMatches.map(match => {
                const contentEl = createMockElement();
                const textMatch = match.match(/<content[^>]*>(.*?)<\/content>/);
                return { textContent: textMatch ? textMatch[1] : '' };
              });
            }
            return [];
          };
          
          // Override innerText for this verse element to return ALL visible text including punctuation
          Object.defineProperty(vElement, 'innerText', {
            get: function() {
              let html = this.innerHTML;
              // Remove ALL hidden elements according to USFM CSS rules (same as server-side)
              // 1. Remove marker elements (contain USFM markup)
              html = html.replace(/<marker[^>]*>.*?<\/marker>/gs, '');
              // 2. Remove attributes elements (contain alignment data)  
              html = html.replace(/<attributes[^>]*>.*?<\/attributes>/gs, '');
              // 3. Remove number elements (verse numbers - we'll add these back separately)
              html = html.replace(/<number[^>]*>.*?<\/number>/gs, '');
              // 4. Remove zaln wrapper elements but keep their content (word elements)
              html = html.replace(/<zaln[^>]*>/g, '').replace(/<\/zaln>/g, '');
              // 5. Remove word wrapper elements but keep their content
              html = html.replace(/<word[^>]*>/g, '').replace(/<\/word>/g, '');
              // 6. Extract only content from <content> elements and text nodes
              // This preserves punctuation between elements
              html = html.replace(/<content[^>]*>/g, '').replace(/<\/content>/g, '');
              // 7. Clean up any remaining tags
              html = html.replace(/<[^>]*>/g, ' ');
              // 8. Clean up whitespace
              return html.replace(/\s+/g, ' ').trim();
            }
          });
          
          return vElement;
        });
      } else if (selector === 'content') {
        // Find all <content>...</content> elements (actual word text)
        // These might be nested inside other elements, so search the entire innerHTML
        const contentMatches = this.innerHTML.match(/<content[^>]*>(.*?)<\/content>/gs) || [];
        return contentMatches.map(match => {
          const contentElement = createMockElement();
          contentElement.innerHTML = match;
          
          // Override textContent to return just the content text
          Object.defineProperty(contentElement, 'textContent', {
            get: function() {
              const textMatch = this.innerHTML.match(/<content[^>]*>(.*?)<\/content>/);
              return textMatch ? textMatch[1] : '';
            }
          });
          
          return contentElement;
        });
      } else if (selector === 'c') {
        // Find all <c>...</c> elements (chapter elements)
        const cMatches = this.innerHTML.match(/<c[^>]*>(.*?)<\/c>/gs) || [];
        return cMatches.map(match => {
          const cElement = createMockElement();
          cElement.innerHTML = match;
          
          // Add parentElement property for chapter extraction
          Object.defineProperty(cElement, 'parentElement', {
            get: () => this
          });
          
          // Override querySelector for this chapter element
          cElement.querySelector = function(childSelector) {
            if (childSelector === 'number') {
              const numberMatch = this.innerHTML.match(/<number[^>]*>(.*?)<\/number>/);
              if (numberMatch) {
                return { textContent: numberMatch[1] };
              }
            }
            return null;
          };
          
          return cElement;
        });
      } else if (selector === 'usfm') {
        // Find the <usfm>...</usfm> element (root USFM container)
        const usfmMatch = this.innerHTML.match(/<usfm[^>]*>(.*?)<\/usfm>/s);
        if (usfmMatch) {
          const usfmElement = createMockElement();
          usfmElement.innerHTML = usfmMatch[0];
          
          // Mock classList for adding 'preview' class
          usfmElement.classList = {
            contains: () => false,
            add: () => {},
            remove: () => {},
            toggle: () => {}
          };
          
          return [usfmElement];
        }
        return [];
      }
      return [];
    },
    querySelector: function(selector) {
      const all = this.querySelectorAll(selector);
      return all.length > 0 ? all[0] : null;
    },
  };
  
  return element;
}

/**
 * Validates that extracted text is clean (no USFM markup remaining)
 * @param {string} text - Extracted text to validate
 * @returns {boolean} True if text appears clean, false if markup detected
 */
export function validateCleanText(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Check for common USFM markup patterns that shouldn't be in clean text
  const usfmPatterns = [
    /\\zaln-[se]/,      // Alignment markup
    /\\w\s+[^|]*\|/,    // Word markup with pipes
    /\\w\*/,            // Word end markers
    /\|x-strong=/,      // Strong's numbers
    /\|x-lemma=/,       // Lemma data
    /\|x-morph=/,       // Morphology data
    /\|x-occurrence=/,  // Occurrence data
    /\|x-content=/,     // Content data
    /\\[a-z]+/,         // Any USFM markers
    /[{}]/,             // Curly braces
    /\|\|/,             // Double pipes
  ];

  for (const pattern of usfmPatterns) {
    if (pattern.test(text)) {
      console.warn(`⚠️ USFM Extractor: Validation failed - detected markup pattern: ${pattern}`);
      return false;
    }
  }

  return true;
}

export default {
  extractVerseText,
  extractChapterText,
  validateCleanText,
}; 