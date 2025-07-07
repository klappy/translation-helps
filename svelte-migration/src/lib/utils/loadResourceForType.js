/**
 * Resource Type Dispatcher - Svelte Port
 * Central loading function for Simple Verse-Loading Pattern
 * 
 * This function serves as the single point of dispatch for all resource types,
 * supporting cross-organization loading and verse-specific data fetching.
 */

// Import existing verse-specific service functions
import { fetchBookWithFallback } from "../services/scriptureService.js";
// TODO: Import other services as they are ported
// import { getNotesForVerse, getNotesForVerseWithResourceData } from "../services/tnService.js";
// import { getQuestionsForVerse, getQuestionsForVerseWithResourceData } from "../services/tqService.js";
// import { getLinksForVerse, getLinksForVerseWithResourceData } from "../services/twlService.js";
// import { getArticlesForLinks } from "../services/twService.js";
// import { searchAllResourcesForLanguage } from "../services/catalogService.js";
// import { getVerseFiaImages, getVerseFiaMaps, getVerseFiaContent } from "../services/fiaService.js";

/**
 * Loads a specific resource type for a given verse reference
 * @param {string} resourceType - Type of resource ('scripture', 'notes', 'questions', 'words', 'links')
 * @param {Object} reference - Verse reference {bookId, chapter, verse}
 * @param {Object} resourceConfig - Configuration {organization, languageId, resourceId, resourceData}
 * @returns {Promise<any>} - Loaded resource data or null on error
 */
export async function loadResourceForType(resourceType, reference, resourceConfig = {}) {
  // Validate inputs
  if (!reference || typeof reference !== 'object') {
    console.warn(`loadResourceForType: Invalid reference provided for ${resourceType}`);
    return null;
  }

  if (!resourceConfig || typeof resourceConfig !== 'object') {
    resourceConfig = {};
  }

  const { bookId, chapter, verse } = reference;
  
  // Validate reference components
  if (!bookId || !chapter || !verse) {
    console.warn(`loadResourceForType: Incomplete reference for ${resourceType}:`, reference);
    return null;
  }

  const { 
    organization = 'unfoldingWord', 
    languageId = 'en',
    resourceId = resourceType === 'scripture' ? 'ult' : resourceType,
    resourceData = null
  } = resourceConfig;

  console.warn(`🎯 loadResourceForType: Loading ${resourceType} for ${bookId} ${chapter}:${verse} from ${organization}/${languageId}/${resourceId}`);

  try {
    switch (resourceType) {
      case 'scripture':
        try {
          console.warn(`🔍 Scripture: Attempting primary load from ${organization}/${languageId}/${resourceId}`);
          
          // Try primary organization first - KEEP RAW USFM AS SINGLE SOURCE OF TRUTH
          const rawUsfm = await fetchBookWithFallback({
            bookId,
            organization,
            languageId,
            resourceId,
            ...(resourceData && { resourceData })
          });
          
          if (rawUsfm) {
            console.warn(`✅ Scripture: Primary load SUCCESSFUL from ${organization} (${rawUsfm.length} chars)`);
            return rawUsfm;
          } else {
            console.error(`❌ Scripture: Primary load from ${organization} returned null/empty`);
          }
          
          return null;
        } catch (primaryError) {
          console.error(`❌ Scripture: Primary load from ${organization} FAILED with error:`, primaryError);
          
          // If primary organization fails and it's not unfoldingWord, try unfoldingWord as fallback
          if (organization !== 'unfoldingWord') {
            console.warn(`🔄 Scripture: Attempting unfoldingWord fallback due to ${organization} failure`);
            try {
              const fallbackUsfm = await fetchBookWithFallback({
                bookId,
                organization: 'unfoldingWord',
                languageId,
                resourceId,
                resourceData: null // Don't use resourceData for fallback org
              });
              
              if (fallbackUsfm) {
                console.warn(`⚠️ Scripture (FALLBACK): Loaded from unfoldingWord instead of ${organization} (${fallbackUsfm.length} chars)`);
                console.error(`🚨 THIS IS THE PROBLEM! User selected ${organization} but got unfoldingWord fallback!`);
                return fallbackUsfm;
              } else {
                console.error(`❌ Scripture: unfoldingWord fallback also returned null/empty`);
              }
              
              return null;
            } catch (fallbackError) {
              console.error(`❌ Scripture: Both ${organization} and unfoldingWord failed:`, { primaryError, fallbackError });
              throw primaryError; // Throw original error
            }
          } else {
            console.error(`❌ Scripture: unfoldingWord primary load failed, no fallback available`);
            throw primaryError;
          }
        }

      case 'notes':
        // TODO: Implement when tnService is ported
        console.warn(`📝 Notes: Service not yet ported - returning mock data`);
        return [
          {
            id: 'note1',
            verse: verse,
            title: `Note for ${bookId} ${chapter}:${verse}`,
            content: 'Translation note content will be loaded when tnService is ported.'
          }
        ];

      case 'questions':
        // TODO: Implement when tqService is ported
        console.warn(`❓ Questions: Service not yet ported - returning mock data`);
        return [
          {
            id: 'q1',
            verse: verse,
            question: `What does ${bookId} ${chapter}:${verse} teach us?`,
            answer: 'Translation question content will be loaded when tqService is ported.'
          }
        ];

      case 'words':
        // TODO: Implement when twService and twlService are ported
        console.warn(`📚 Words: Service not yet ported - returning mock data`);
        return [
          {
            id: 'word1',
            term: 'God',
            definition: 'Translation word content will be loaded when twService is ported.',
            references: [`${bookId} ${chapter}:${verse}`]
          }
        ];

      case 'links':
        // TODO: Implement when twlService is ported
        console.warn(`🔗 Links: Service not yet ported - returning mock data`);
        return [
          {
            id: 'link1',
            verse: verse,
            word: 'example',
            link: 'rc://*/tw/dict/bible/kt/example'
          }
        ];

      case 'fiaimages':
        // TODO: Implement when fiaService is ported
        console.warn(`🖼️ FIA Images: Service not yet ported - returning empty array`);
        return [];

      case 'fiamaps':
        // TODO: Implement when fiaService is ported  
        console.warn(`🗺️ FIA Maps: Service not yet ported - returning empty array`);
        return [];

      case 'fia':
        // TODO: Implement when fiaService is ported
        console.warn(`🎨 FIA Content: Service not yet ported - returning empty array`);
        return [];

      default:
        console.warn(`Unknown resource type: ${resourceType}`);
        return null;
    }
  } catch (error) {
    console.error(`Error loading ${resourceType} for ${bookId} ${chapter}:${verse}:`, error);
    
    // Return appropriate empty value based on resource type
    if (['notes', 'questions', 'words', 'links'].includes(resourceType)) {
      return [];
    }
    return null;
  }
}

/**
 * Get verse-specific scripture text
 * @param {string} bookId - Book identifier (e.g., 'tit', 'gen')
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @param {string} organization - DCS organization
 * @param {string} languageId - Language code
 * @param {string} resourceId - Resource identifier (e.g., 'ult', 'ust')
 * @returns {Promise<string|null>} USFM content for the book or null
 */
export async function getVerseScripture(bookId, chapter, verse, organization, languageId, resourceId) {
  try {
    // TODO: Get resource data from catalog for proper file path resolution
    // For now, use basic service without resource data
    const scriptureData = await fetchBookWithFallback({
      languageId,
      resourceId,
      bookId,
      resourceData: null,
      organization
    });
    return scriptureData;
  } catch (error) {
    console.error(`Failed to load scripture for ${bookId}:`, error);
    return null;
  }
}

/**
 * Get verse-specific translation notes
 * @param {string} bookId - Book identifier
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @param {string} organization - DCS organization
 * @param {string} languageId - Language code
 * @returns {Promise<Array>} Array of notes for the verse
 */
export async function getVerseNotes(bookId, chapter, verse, organization, languageId) {
  try {
    // TODO: Implement when tnService is ported
    console.warn(`getVerseNotes: Service not yet ported for ${bookId} ${chapter}:${verse}`);
    return [];
  } catch (error) {
    console.error(`Failed to load notes for ${bookId} ${chapter}:${verse}:`, error);
    return [];
  }
}

/**
 * Get verse-specific translation questions
 * @param {string} bookId - Book identifier
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @param {string} organization - DCS organization
 * @param {string} languageId - Language code
 * @returns {Promise<Array>} Array of questions for the verse
 */
export async function getVerseQuestions(bookId, chapter, verse, organization, languageId) {
  try {
    // TODO: Implement when tqService is ported
    console.warn(`getVerseQuestions: Service not yet ported for ${bookId} ${chapter}:${verse}`);
    return [];
  } catch (error) {
    console.error(`Failed to load questions for ${bookId} ${chapter}:${verse}:`, error);
    return [];
  }
}

/**
 * Get verse-specific translation word links
 * @param {string} bookId - Book identifier
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @param {string} organization - DCS organization
 * @param {string} languageId - Language code
 * @returns {Promise<Array>} Array of word links for the verse
 */
export async function getVerseLinks(bookId, chapter, verse, organization, languageId) {
  try {
    // TODO: Implement when twlService is ported
    console.warn(`getVerseLinks: Service not yet ported for ${bookId} ${chapter}:${verse}`);
    return [];
  } catch (error) {
    console.error(`Failed to load links for ${bookId} ${chapter}:${verse}:`, error);
    return [];
  }
}

/**
 * Get verse-specific translation words (based on links)
 * @param {string} bookId - Book identifier
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @param {string} organization - DCS organization
 * @param {string} languageId - Language code
 * @returns {Promise<Array>} Array of word articles for the verse
 */
export async function getVerseWords(bookId, chapter, verse, organization, languageId) {
  try {
    // TODO: Implement when twService and twlService are ported
    console.warn(`getVerseWords: Service not yet ported for ${bookId} ${chapter}:${verse}`);
    return [];
  } catch (error) {
    console.error(`Failed to load words for ${bookId} ${chapter}:${verse}:`, error);
    return [];
  }
}

export default {
  loadResourceForType,
  getVerseScripture,
  getVerseNotes,
  getVerseQuestions,
  getVerseLinks,
  getVerseWords
};