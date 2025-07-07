/**
 * USFM Text Extractor - Svelte Port (Simplified)
 * Clean text extraction from USFM content
 */

/**
 * Emergency fallback for USFM extraction using simple string operations
 * Used when semantic parser is not available (simplified version for Svelte port)
 * @param {string} usfmText - Raw USFM content
 * @param {number} chapter - Target chapter number
 * @param {number} verse - Target verse number
 * @returns {string} Clean text for the specific verse
 */
export function emergencyUSFMExtract(usfmText, chapter, verse) {
  try {
    console.log(`🚨 Emergency USFM extraction for ${chapter}:${verse}`);
    
    // Split by chapter markers - find our chapter
    const chapterPattern = new RegExp(`\\\\c\\s+${chapter}\\b`);
    const chapterSplit = usfmText.split(chapterPattern);
    
    if (chapterSplit.length < 2) {
      throw new Error(`Chapter ${chapter} not found`);
    }
    
    // Get content after the chapter marker
    let chapterContent = chapterSplit[1];
    
    // Find next chapter to limit scope
    const nextChapterMatch = chapterContent.match(/\\c\s+\d+/);
    if (nextChapterMatch) {
      chapterContent = chapterContent.substring(0, nextChapterMatch.index);
    }
    
    // Split by verse markers - find our verse
    const versePattern = new RegExp(`\\\\v\\s+${verse}\\b`);
    const verseSplit = chapterContent.split(versePattern);
    
    if (verseSplit.length < 2) {
      throw new Error(`Verse ${verse} not found in chapter ${chapter}`);
    }
    
    // Get content after the verse marker
    let verseContent = verseSplit[1];
    
    // Find next verse to limit scope
    const nextVerseMatch = verseContent.match(/\\v\s+\d+/);
    if (nextVerseMatch) {
      verseContent = verseContent.substring(0, nextVerseMatch.index);
    }
    
    // Aggressive cleanup for aligned Bibles - remove all alignment data
    let cleanText = verseContent
      // Remove alignment markers completely
      .replace(/\\zaln-s[^\\]*\\zaln-e\*/g, '')
      .replace(/\\zaln-[se][^\\]*/g, '')
      // Extract text from word markup: \w word|alignment\w* -> word
      .replace(/\\w\s+([^|\\]+)\|[^\\]*\\w\*/g, '$1')
      .replace(/\\w\s+([^\\]+)\\w\*/g, '$1')
      // Remove any remaining USFM markers
      .replace(/\\[a-z-]+\*/g, '')
      .replace(/\\[a-z-]+\s*/g, '')
      // Clean up attributes and pipes
      .replace(/\|[^|]*\|/g, '')
      .replace(/\|[^\\]*/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
    
    const result = `${verse} ${cleanText}`;
    console.log(`✅ Emergency extraction successful: "${result.substring(0, 100)}..."`);
    return result;
    
  } catch (error) {
    console.error('🚨 Emergency USFM extraction failed:', error);
    return `${verse} [Text extraction failed for this verse]`;
  }
}

/**
 * Simplified USFM verse extraction for Svelte port
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
    console.log(`🔍 USFM Extractor: Extracting verse ${chapter}:${verse}`);
    
    // Use emergency extraction for now (can be enhanced later with full semantic parser)
    return emergencyUSFMExtract(usfmText, chapter, verse);
    
  } catch (err) {
    console.error("❌ USFM Extractor: Error in verse extraction:", err);
    return `${verse} [Error extracting verse text]`;
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
    
    // Find chapter marker
    const chapterPattern = new RegExp(`\\\\c\\s+${chapter}\\b`);
    const chapterSplit = usfmText.split(chapterPattern);
    
    if (chapterSplit.length < 2) {
      console.warn(`⚠️ USFM Extractor: Chapter ${chapter} not found`);
      return "";
    }
    
    // Get content after the chapter marker
    let chapterContent = chapterSplit[1];
    
    // Find next chapter to limit scope
    const nextChapterMatch = chapterContent.match(/\\c\s+\d+/);
    if (nextChapterMatch) {
      chapterContent = chapterContent.substring(0, nextChapterMatch.index);
    }
    
    // Extract all verses from this chapter
    const verses = [];
    const verseMatches = chapterContent.match(/\\v\s+(\d+)\s+([^\\]*?)(?=\\v|\s*$)/gs);
    
    if (verseMatches) {
      for (const match of verseMatches) {
        const verseMatch = match.match(/\\v\s+(\d+)\s+(.*)/s);
        if (verseMatch) {
          const verseNum = verseMatch[1];
          let verseText = verseMatch[2];
          
          // Clean up the verse text
          verseText = verseText
            // Remove alignment markers
            .replace(/\\zaln-s[^\\]*\\zaln-e\*/g, '')
            .replace(/\\zaln-[se][^\\]*/g, '')
            // Extract text from word markup
            .replace(/\\w\s+([^|\\]+)\|[^\\]*\\w\*/g, '$1')
            .replace(/\\w\s+([^\\]+)\\w\*/g, '$1')
            // Remove USFM markers
            .replace(/\\[a-z-]+\*/g, '')
            .replace(/\\[a-z-]+\s*/g, '')
            // Clean up attributes and pipes
            .replace(/\|[^|]*\|/g, '')
            .replace(/\|[^\\]*/g, '')
            // Normalize whitespace
            .replace(/\s+/g, ' ')
            .trim();
          
          if (verseText) {
            verses.push(`${verseNum} ${verseText}`);
          }
        }
      }
    }
    
    const chapterText = verses.join(" ");
    console.log(`✅ USFM Extractor: Extracted chapter text with ${verses.length} verses (${chapterText.length} characters)`);
    return chapterText;
    
  } catch (err) {
    console.error("❌ USFM Extractor: Error extracting chapter text:", err);
    return "";
  }
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
  emergencyUSFMExtract,
};