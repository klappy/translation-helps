/**
 * scriptureService.js - Svelte Port
 * Core service for loading and processing USFM scripture content
 */

import { fetchResourceFile, fetchManifest } from './dcsClient.js';
import { extractVerseText } from '../utils/usfmTextExtractor.js';

/**
 * Fetches a book with fallback organization support
 * @param {Object} options - Configuration object
 * @param {string} options.bookId - Book identifier (e.g., 'tit', 'gen')
 * @param {string} options.organization - DCS organization
 * @param {string} options.languageId - Language code
 * @param {string} options.resourceId - Resource identifier (e.g., 'ult', 'ust')
 * @param {Object} options.resourceData - Optional resource metadata
 * @returns {Promise<string|null>} USFM content for the book or null
 */
export async function fetchBookWithFallback({
  bookId,
  organization = 'unfoldingWord',
  languageId = 'en',
  resourceId = 'ult',
  resourceData = null
}) {
  console.warn(`🔍 Scripture Service: Fetching ${bookId} from ${organization}/${languageId}/${resourceId}`);
  
  try {
    // Determine the file path based on resource data or fallback to standard pattern
    let filePath;
    
    if (resourceData && resourceData.ingredients) {
      // Use ingredients array to find the book file
      const bookFile = resourceData.ingredients.find(ingredient => 
        ingredient.identifier === bookId || 
        ingredient.path?.includes(`${bookId}.usfm`) ||
        ingredient.path?.includes(`${bookId.toUpperCase()}.usfm`)
      );
      
      if (bookFile) {
        filePath = bookFile.path;
        console.warn(`📖 Scripture Service: Using ingredient path: ${filePath}`);
      } else {
        console.warn(`⚠️ Scripture Service: Book ${bookId} not found in ingredients, using fallback`);
        filePath = `${bookId.toUpperCase()}.usfm`;
      }
    } else {
      // Fallback to standard naming convention
      filePath = `${bookId.toUpperCase()}.usfm`;
      console.warn(`📖 Scripture Service: Using standard path: ${filePath}`);
    }
    
    // Fetch the USFM content
    const usfmContent = await fetchResourceFile(
      languageId,
      resourceId,
      filePath,
      organization
    );
    
    if (usfmContent && usfmContent.trim()) {
      console.warn(`✅ Scripture Service: Successfully loaded ${bookId} (${usfmContent.length} characters)`);
      return usfmContent;
    } else {
      console.error(`❌ Scripture Service: Empty or invalid USFM content for ${bookId}`);
      return null;
    }
    
  } catch (error) {
    console.error(`❌ Scripture Service: Error fetching ${bookId} from ${organization}:`, error);
    
    // If primary organization fails and it's not unfoldingWord, try unfoldingWord as fallback
    if (organization !== 'unfoldingWord') {
      console.warn(`🔄 Scripture Service: Attempting unfoldingWord fallback for ${bookId}`);
      try {
        const fallbackContent = await fetchBookWithFallback({
          bookId,
          organization: 'unfoldingWord',
          languageId,
          resourceId,
          resourceData: null // Don't use resourceData for fallback
        });
        
        if (fallbackContent) {
          console.warn(`⚠️ Scripture Service: Loaded ${bookId} from unfoldingWord fallback`);
          return fallbackContent;
        }
      } catch (fallbackError) {
        console.error(`❌ Scripture Service: Fallback also failed for ${bookId}:`, fallbackError);
      }
    }
    
    return null;
  }
}

/**
 * Extract specific verse text from USFM content
 * @param {string} usfmContent - Raw USFM content
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {string|null} Extracted verse text or null
 */
export function extractVerse(usfmContent, chapter, verse) {
  if (!usfmContent) return null;
  
  try {
    return extractVerseText(usfmContent, chapter, verse);
  } catch (error) {
    console.error(`Error extracting verse ${chapter}:${verse}:`, error);
    return null;
  }
}

/**
 * Extract all verses from a chapter
 * @param {string} usfmContent - Raw USFM content
 * @param {number} chapter - Chapter number
 * @returns {Object} Map of verse numbers to verse text
 */
export function extractChapter(usfmContent, chapter) {
  if (!usfmContent) return {};
  
  try {
    const verses = {};
    // Simple regex to extract verses (this would be more sophisticated in real implementation)
    const chapterRegex = new RegExp(`\\\\c ${chapter}([\\s\\S]*?)(?:\\\\c ${chapter + 1}|$)`, 'i');
    const chapterMatch = usfmContent.match(chapterRegex);
    
    if (chapterMatch) {
      const chapterContent = chapterMatch[1];
      const verseRegex = /\\v (\d+)\s+([^\\]*)/g;
      let verseMatch;
      
      while ((verseMatch = verseRegex.exec(chapterContent)) !== null) {
        const verseNum = parseInt(verseMatch[1]);
        const verseText = verseMatch[2].trim();
        verses[verseNum] = verseText;
      }
    }
    
    return verses;
  } catch (error) {
    console.error(`Error extracting chapter ${chapter}:`, error);
    return {};
  }
}

/**
 * Get book metadata from manifest
 * @param {string} languageId - Language code
 * @param {string} resourceId - Resource identifier
 * @param {string} organization - DCS organization
 * @returns {Promise<Object|null>} Book metadata or null
 */
export async function getBookMetadata(languageId, resourceId, organization = 'unfoldingWord') {
  try {
    const manifest = await fetchManifest(languageId, resourceId, organization);
    
    if (manifest && manifest.projects) {
      return manifest.projects;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching book metadata for ${organization}/${languageId}/${resourceId}:`, error);
    return null;
  }
}

export default {
  fetchBookWithFallback,
  extractVerse,
  extractChapter,
  getBookMetadata
};