/**
 * twlService.js
 * Service module for loading and querying Translation Words Links (TWL) data.
 *
 * Responsible for:
 * - Fetching and caching TWL .tsv files from DCS using standard file naming
 * - Parsing TSV into entries
 * - Filtering and returning TWLink URIs for a given verse reference
 * UPDATED: No longer uses manifests - uses standard file naming convention
 */
import { parseTsv } from "../utils/parseTsv";
import { fetchResourceFile } from "./dcsClient";

const cache = {};

/**
 * Retrieves the array of TWLink URIs for a given verse reference.
 * @param {string} bookId Bible book identifier (e.g., 'gen').
 * @param {string|number} chapter Chapter number.
 * @param {string|number} verse Verse number.
 * @param {string} [organization="unfoldingWord"] Organization name.
 * @param {string} [languageId="en"] Language code.
 * @returns {Promise<Array<string>>} Array of TWLink values (rc:// URIs).
 */
export async function getLinksForVerse(
  bookId,
  chapter,
  verse,
  organization = "unfoldingWord",
  languageId = "en"
) {
  const ref = `${chapter}:${verse}`;
  let entries = cache[bookId];

  if (!entries) {
    try {
      // Use standard TWL file naming convention: twl_{BOOK_ID}.tsv
      const filePath = `twl_${bookId.toUpperCase()}.tsv`;

      // Fetch the TSV content using dcsClient
      const tsvContent = await fetchResourceFile(languageId, "twl", filePath, organization);

      // Parse the TSV data
      entries = parseTsv(tsvContent);
      cache[bookId] = entries;
    } catch (error) {
      console.error(`Error loading TWL for book ${bookId}:`, error);
      throw error;
    }
  }

  // Filter entries for this verse and get unique TWLinks to avoid duplicates
  const links = entries
    .filter((entry) => entry.Reference === ref)
    .map((entry) => entry.TWLink)
    .filter(Boolean); // Remove any null/undefined links

  // Remove duplicates at the TWL level
  return [...new Set(links)];
}

/**
 * Enhanced version that uses resource data with ingredients for correct file paths
 * @param {string} bookId Bible book identifier (e.g., 'gen').
 * @param {string|number} chapter Chapter number.
 * @param {string|number} verse Verse number.
 * @param {Object} resourceData Resource data object with ingredients array
 * @param {string} [languageId="en"] Language code.
 * @returns {Promise<Array<string>>} Array of TWLink values (rc:// URIs).
 */
export async function getLinksForVerseWithResourceData(
  bookId,
  chapter,
  verse,
  resourceData,
  languageId = "en"
) {
  try {
    if (!resourceData) {
      throw new Error(`No resource data provided for Translation Word Links`);
    }

    console.log(`🔄 TWL Service: Loading with resource data for ${bookId} ${chapter}:${verse}`);

    let filePath;
    
    // Try to get file path from ingredients array
    if (resourceData.ingredients && Array.isArray(resourceData.ingredients)) {
      const ingredient = resourceData.ingredients.find(ing => ing.identifier === bookId);
      if (ingredient && ingredient.path) {
        filePath = ingredient.path;
        console.log(`✅ TWL Service: Found file path in ingredients: ${filePath}`);
      } else {
        console.warn(`TWL Service: Book ${bookId} not found in ingredients, falling back to naming convention`);
        filePath = `twl_${bookId.toUpperCase()}.tsv`;
      }
    } else {
      console.warn(`TWL Service: No ingredients array, using naming convention`);
      filePath = `twl_${bookId.toUpperCase()}.tsv`;
    }

    // Extract organization from resource data
    const organization = resourceData.owner?.login || resourceData.organization || "unfoldingWord";

    const ref = `${chapter}:${verse}`;
    const cacheKey = `${bookId}_${filePath}`;
    let entries = cache[cacheKey];

    if (!entries) {
      // Fetch the TSV content using the correct file path
      const tsvContent = await fetchResourceFile(languageId, "twl", filePath, organization);

      // Parse the TSV data
      entries = parseTsv(tsvContent);
      cache[cacheKey] = entries;
    }

    // Filter entries for this verse and get unique TWLinks to avoid duplicates
    const links = entries
      .filter((entry) => entry.Reference === ref)
      .map((entry) => entry.TWLink)
      .filter(Boolean); // Remove any null/undefined links

    // Remove duplicates at the TWL level
    const uniqueLinks = [...new Set(links)];

    console.log(`✅ TWL Service: Loaded ${uniqueLinks.length} links using ${filePath}`);

    return uniqueLinks;
  } catch (error) {
    console.error(
      `Error fetching translation word links with resource data for ${bookId} ${chapter}:${verse}:`,
      error
    );
    throw error;
  }
}

export default { getLinksForVerse, getLinksForVerseWithResourceData };

/**
 * Clears the internal TWL cache (for testing or reloading purposes).
 */
export function clearCache() {
  Object.keys(cache).forEach((key) => {
    delete cache[key];
  });
}
