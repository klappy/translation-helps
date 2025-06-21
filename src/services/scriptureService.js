/**
 * scriptureService.js
 * Service for fetching scripture resources.
 * This service is responsible for fetching raw USFM content from the DCS.
 * It no longer parses USFM directly, as that is now handled by the `simple-text-editor-rcl` component.
 * 
 * ⚠️  CRITICAL: NO MANIFESTS! This service uses API-direct architecture with ingredients arrays.
 * ⚠️  DO NOT revert to manifest-based approach - use resourceData.ingredients for file paths!
 */
import { fetchResourceFile } from "./dcsClient";
import { searchAllResourcesForLanguage } from "./catalogService";

/**
 * Checks if a book is available in the resource data
 * @param {string} bookId - Book identifier (e.g., 'gen', 'mat')
 * @param {object} resourceData - Resource data object with books and ingredients arrays
 * @returns {boolean} True if book is available, false otherwise
 */
export function isBookAvailable(bookId, resourceData) {
  if (!bookId || !resourceData) {
    return false;
  }

  // Check ingredients array first (more reliable for file paths)
  if (resourceData.ingredients && Array.isArray(resourceData.ingredients)) {
    const hasIngredient = resourceData.ingredients.some(ingredient => 
      ingredient.identifier === bookId || ingredient.id === bookId
    );
    if (hasIngredient) {
      return true;
    }
  }

  // Fallback to books array
  if (resourceData.books && Array.isArray(resourceData.books)) {
    return resourceData.books.some(book => {
      if (typeof book === 'string') {
        return book === bookId;
      }
      return book.identifier === bookId || book.id === bookId;
    });
  }

  return false;
}

/**
 * Enhanced version with 3-tier fallback architecture
 * @param {object} params
 * @param {string} params.languageId - Language identifier (e.g., 'en')
 * @param {string} params.resourceId - Resource identifier (e.g., 'ult', 'ust')
 * @param {string} params.bookId - Book identifier (e.g., 'gen')
 * @param {object} params.resourceData - Resource data object with ingredients array (optional)
 * @param {string} params.organization - Organization identifier (e.g., 'unfoldingWord')
 * @returns {Promise<string>} Raw USFM content
 */
export async function fetchBookWithFallback({
  languageId,
  resourceId,
  bookId,
  resourceData,
  organization = "unfoldingWord",
}) {
  try {
    console.log(`🔄 Scripture Service: Loading with fallback for ${bookId} from ${organization}/${languageId}_${resourceId}`);

    let actualResourceData = resourceData;
    
    // If no resourceData provided, fetch it from catalog API (API-direct pattern)
    if (!actualResourceData) {
      console.log(`📡 Scripture Service: Fetching resource metadata for ${organization}/${languageId}/${resourceId}`);
      try {
        const catalogResult = await searchAllResourcesForLanguage(languageId);
        
        // Find the resource in the specified organization
        actualResourceData = catalogResult.resources[organization]?.find(r => r.id === resourceId);
        
        if (actualResourceData) {
          console.log(`✅ Scripture Service: Found resource metadata with ${actualResourceData.ingredients?.length || 0} ingredients`);
        } else {
          console.warn(`⚠️ Scripture Service: No resource metadata found for ${organization}/${languageId}/${resourceId}`);
        }
      } catch (catalogError) {
        console.error(`❌ Scripture Service: Failed to fetch catalog data:`, catalogError);
      }
    }

    let filePath;
    
    // TIER 1: Try to get file path from ingredients array (Primary)
    if (actualResourceData?.ingredients && Array.isArray(actualResourceData.ingredients)) {
      const ingredient = actualResourceData.ingredients.find(ing => ing.identifier === bookId);
      if (ingredient && ingredient.path) {
        filePath = ingredient.path.replace("./", "");
        console.log(`✅ Scripture Service: Found file path in ingredients: ${filePath}`);
      } else {
        console.warn(`Scripture Service: Book ${bookId} not found in ingredients, falling back to naming convention`);
        filePath = `${bookId.toUpperCase()}.usfm`;
      }
    } 
    // TIER 2: Use naming convention fallback (Secondary)
    else {
      console.warn(`Scripture Service: No ingredients array, using naming convention`);
      filePath = `${bookId.toUpperCase()}.usfm`;
    }

    // TIER 3: Fetch with error handling (Tertiary)
    try {
      console.log(`📖 Scripture Service: Fetching ${filePath} from ${organization}/${languageId}_${resourceId}`);
      
      const usfm = await fetchResourceFile(languageId, resourceId, filePath, organization);

      if (!usfm) {
        throw new Error(`No USFM content returned for ${bookId}`);
      }

      console.log(`✅ Scripture Service: Successfully fetched ${filePath} (${usfm.length} characters)`);
      return usfm;
    } catch (fetchError) {
      // If ingredients path failed, try naming convention as final fallback
      if (actualResourceData?.ingredients && filePath !== `${bookId.toUpperCase()}.usfm`) {
        console.warn(`⚠️ Scripture Service: Ingredients path failed, trying naming convention as final fallback`);
        const fallbackPath = `${bookId.toUpperCase()}.usfm`;
        
        try {
          const fallbackUsfm = await fetchResourceFile(languageId, resourceId, fallbackPath, organization);
          if (fallbackUsfm) {
            console.log(`✅ Scripture Service: Fallback successful with ${fallbackPath}`);
            return fallbackUsfm;
          }
        } catch (fallbackError) {
          console.error(`❌ Scripture Service: Both ingredients and naming convention failed:`, fallbackError);
        }
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error(`❌ Scripture Service: Error fetching book ${bookId} from ${resourceId}:`, error);
    throw error;
  }
}

/**
 * ⚠️  DEPRECATED: This function is no longer used in API-direct architecture
 * Legacy function for fetching multiple scripture resources
 * @deprecated Use individual fetchBook calls with resourceData instead
 */
export async function fetchScriptureResources({
  languageId,
  reference,
  resourceDataCollection,
  organization = "unfoldingWord",
}) {
  console.warn("⚠️  fetchScriptureResources is deprecated - use individual fetchBook calls with resourceData");
  
  const { bookId } = reference;
  const resources = {
    ult: null,
    ust: null,
    ulb: null,
    udb: null,
    irv: null,
  };

  // Fetch all available scripture resources in parallel
  const resourceIds = Object.keys(resources);
  const promises = resourceIds.map(async (resourceId) => {
    if (resourceDataCollection[resourceId]) {
      return fetchBookWithFallback({
        languageId,
        resourceId,
        bookId,
        resourceData: resourceDataCollection[resourceId],
        organization,
      });
    }
    return null;
  });

  const results = await Promise.all(promises);

  // Map results back to resources object
  resourceIds.forEach((resourceId, index) => {
    if (results[index]) {
      resources[resourceId] = {
        resourceData: resourceDataCollection[resourceId],
        data: results[index],
      };
    }
  });

  return resources;
}

/**
 * ⚠️  DEPRECATED: This function is no longer used in API-direct architecture
 * Legacy function for determining testament
 * @deprecated Use resource data from catalog API instead
 */
export function whichTestament({ bookId, uhbResourceData, ugntResourceData }) {
  console.warn("⚠️  whichTestament is deprecated - use resource data from catalog API instead");
  
  if (uhbResourceData?.ingredients?.find((ing) => ing.identifier === bookId)) {
    return "old";
  }
  if (ugntResourceData?.ingredients?.find((ing) => ing.identifier === bookId)) {
    return "new";
  }
  return null;
}

/**
 * ⚠️  DEPRECATED: This function is no longer used in API-direct architecture
 * Legacy function for fetching original language scripture
 * @deprecated Use catalog API to find Hebrew/Greek resources instead
 */
export async function fetchOriginalBook({ languageId, bookId, uhbResourceData, ugntResourceData }) {
  console.warn("⚠️  fetchOriginalBook is deprecated - use catalog API to find Hebrew/Greek resources instead");
  
  const testament = whichTestament({ bookId, uhbResourceData, ugntResourceData });

  if (testament === "old" && uhbResourceData) {
    return fetchBookWithFallback({
      languageId: "hbo", // Hebrew
      resourceId: "uhb",
      bookId,
      resourceData: uhbResourceData,
    });
  }

  if (testament === "new" && ugntResourceData) {
    return fetchBookWithFallback({
      languageId: "grc", // Greek
      resourceId: "ugnt",
      bookId,
      resourceData: ugntResourceData,
    });
  }

  return null;
}

/**
 * Legacy version - maintains backward compatibility but requires ingredients
 * @deprecated Use fetchBookWithFallback for better reliability
 * @param {object} params - Same parameters as fetchBookWithFallback
 * @returns {Promise<string>} Raw USFM content
 */
export async function fetchBook(params) {
  console.warn("⚠️ fetchBook is deprecated - use fetchBookWithFallback for better reliability");
  return fetchBookWithFallback(params);
}

export default {
  fetchBook,
  fetchBookWithFallback,
  isBookAvailable,
  fetchScriptureResources,
  whichTestament,
  fetchOriginalBook,
};
