/**
 * Resource Type Dispatcher - Central loading function for Simple Verse-Loading Pattern
 * Aligns with: docs/SIMPLE-VERSE-LOADING-PATTERN.md (lines 47-67)
 * 
 * This function serves as the single point of dispatch for all resource types,
 * supporting cross-organization loading and verse-specific data fetching.
 */

// Import existing verse-specific service functions
import { fetchBookWithFallback } from "../services/scriptureService";
import { getNotesForVerse, getNotesForVerseWithResourceData } from "../services/tnService";
import { getQuestionsForVerse, getQuestionsForVerseWithResourceData } from "../services/tqService";
import { getLinksForVerse, getLinksForVerseWithResourceData } from "../services/twlService";
import { getArticlesForLinks } from "../services/twService";
import { searchAllResourcesForLanguage } from "../services/catalogService";

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
        if (resourceData) {
          return await getNotesForVerseWithResourceData(
            bookId, chapter, verse, resourceData, organization, languageId
          );
        } else {
          return await getNotesForVerse(bookId, chapter, verse, organization, languageId);
        }

      case 'questions':
        if (resourceData) {
          return await getQuestionsForVerseWithResourceData(
            bookId, chapter, verse, resourceData, organization, languageId
          );
        } else {
          return await getQuestionsForVerse(bookId, chapter, verse, organization, languageId);
        }

      case 'links':
        if (resourceData) {
          return await getLinksForVerseWithResourceData(
            bookId, chapter, verse, resourceData, organization, languageId
          );
        } else {
          return await getLinksForVerse(bookId, chapter, verse, organization, languageId);
        }

      case 'words':
        try {
          // First get the links for this verse
          let links;
          if (resourceData) {
            links = await getLinksForVerseWithResourceData(
              bookId, chapter, verse, resourceData, organization, languageId
            );
          } else {
            links = await getLinksForVerse(bookId, chapter, verse, organization, languageId);
          }
          
          // Then get the articles for those links (always call, even with empty array)
          return await getArticlesForLinks(links || [], languageId, organization);
        } catch (error) {
          console.error(`Error loading words for ${bookId} ${chapter}:${verse}:`, error);
          return [];
        }

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
async function getVerseScripture(bookId, chapter, verse, organization, languageId, resourceId) {
  try {
    // Get resource data from catalog for proper file path resolution
    const catalogResult = await searchAllResourcesForLanguage(languageId);
    const resourceData = catalogResult.resources[organization]?.find(r => r.id === resourceId);
    
    if (resourceData) {
      // Use enhanced service with resource data (ingredients array)
      const scriptureData = await fetchBookWithFallback({
        languageId,
        resourceId,
        bookId,
        resourceData,
        organization
      });
      return scriptureData;
    } else {
      // Fallback to basic service
      console.warn(`No resource data found for scripture ${organization}/${languageId}/${resourceId}`);
      const scriptureData = await fetchBookWithFallback({
        languageId,
        resourceId,
        bookId,
        resourceData: null,
        organization
      });
      return scriptureData;
    }
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
async function getVerseNotes(bookId, chapter, verse, organization, languageId) {
  try {
    // Get resource data from catalog for proper file path resolution
    const catalogResult = await searchAllResourcesForLanguage(languageId);
    const resourceData = catalogResult.resources[organization]?.find(r => 
      r.subject === 'Translation Notes' || r.id === 'tn'
    );
    
    if (resourceData) {
      // Use enhanced service with resource data (ingredients array)
      return await getNotesForVerseWithResourceData(bookId, chapter, verse, resourceData, languageId);
    } else {
      // Fallback to basic service
      console.warn(`No resource data found for notes ${organization}/${languageId}/tn`);
      return await getNotesForVerse(bookId, chapter, verse, organization, languageId);
    }
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
async function getVerseQuestions(bookId, chapter, verse, organization, languageId) {
  try {
    // Get resource data from catalog for proper file path resolution
    const catalogResult = await searchAllResourcesForLanguage(languageId);
    const resourceData = catalogResult.resources[organization]?.find(r => 
      r.subject === 'Translation Questions' || r.id === 'tq'
    );
    
    if (resourceData) {
      // Use enhanced service with resource data (ingredients array)
      return await getQuestionsForVerseWithResourceData(bookId, chapter, verse, resourceData, languageId);
    } else {
      // Fallback to basic service
      console.warn(`No resource data found for questions ${organization}/${languageId}/tq`);
      return await getQuestionsForVerse(bookId, chapter, verse, organization, languageId);
    }
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
async function getVerseLinks(bookId, chapter, verse, organization, languageId) {
  try {
    // Get resource data from catalog for proper file path resolution
    const catalogResult = await searchAllResourcesForLanguage(languageId);
    const resourceData = catalogResult.resources[organization]?.find(r => 
      r.subject === 'TSV Translation Words Links' || r.id === 'twl'
    );
    
    if (resourceData) {
      // Use enhanced service with resource data (ingredients array)
      return await getLinksForVerseWithResourceData(bookId, chapter, verse, resourceData, languageId);
    } else {
      // Fallback to basic service
      console.warn(`No resource data found for links ${organization}/${languageId}/twl`);
      return await getLinksForVerse(bookId, chapter, verse, organization, languageId);
    }
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
async function getVerseWords(bookId, chapter, verse, organization, languageId) {
  try {
    // First get the links for this verse
    const links = await getVerseLinks(bookId, chapter, verse, organization, languageId);
    
    if (links && links.length > 0) {
      // Get articles for these links
      return await getArticlesForLinks(links, languageId, organization);
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Failed to load words for ${bookId} ${chapter}:${verse}:`, error);
    return [];
  }
} 