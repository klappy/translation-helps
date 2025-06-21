/**
 * FIA Service - Familiarization, Internalization, Application resources
 * Follows existing TSV service patterns for DCS integration
 * Handles FIA Images and FIA Maps from Scripture Burrito format
 */

import { parseTsv } from '../utils/parseTsv.js';

const DCS_BASE_URL = 'https://git.door43.org';

/**
 * Get FIA images for a specific verse
 * @param {string} bookId - Book identifier (e.g., 'GEN', 'TIT')
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @param {string} language - Language code (default: 'en')
 * @returns {Promise<Array|null>} Array of FIA image rows or null
 */
export async function getVerseFiaImages(bookId, chapter, verse, language = 'en') {
  try {
    // Build DCS URL for FIA images TSV file
    const url = `${DCS_BASE_URL}/BurritoTruck/${language}_fiaimages/raw/branch/master/ingredients/${bookId}.tsv`;
    
    console.log(`🎯 FIA Images: Fetching ${bookId} ${chapter}:${verse} from ${url}`);
    
    // Fetch TSV data
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`FIA Images: No data for ${bookId} (${response.status})`);
      return null;
    }
    
    const tsvText = await response.text();
    const rows = parseTsv(tsvText);
    
    // Filter for specific verse reference
    const verseRef = `${chapter}:${verse}`;
    const verseData = rows.filter(row => row.REF === verseRef);
    
    console.log(`✅ FIA Images: Found ${verseData.length} items for ${bookId} ${verseRef}`);
    return verseData.length > 0 ? verseData : null;
    
  } catch (error) {
    console.warn(`FIA Images not available for ${bookId} ${chapter}:${verse}:`, error);
    return null; // Graceful degradation
  }
}

/**
 * Get FIA maps for a specific verse
 * @param {string} bookId - Book identifier (e.g., 'GEN', 'TIT')
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @param {string} language - Language code (default: 'en')
 * @returns {Promise<Array|null>} Array of FIA map rows or null
 */
export async function getVerseFiaMaps(bookId, chapter, verse, language = 'en') {
  try {
    // Build DCS URL for FIA maps TSV file
    const url = `${DCS_BASE_URL}/BurritoTruck/${language}_fiamaps/raw/branch/master/ingredients/${bookId}.tsv`;
    
    console.log(`🎯 FIA Maps: Fetching ${bookId} ${chapter}:${verse} from ${url}`);
    
    // Fetch TSV data
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`FIA Maps: No data for ${bookId} (${response.status})`);
      return null;
    }
    
    const tsvText = await response.text();
    const rows = parseTsv(tsvText);
    
    // Filter for specific verse reference
    const verseRef = `${chapter}:${verse}`;
    const verseData = rows.filter(row => row.REF === verseRef);
    
    console.log(`✅ FIA Maps: Found ${verseData.length} items for ${bookId} ${verseRef}`);
    return verseData.length > 0 ? verseData : null;
    
  } catch (error) {
    console.warn(`FIA Maps not available for ${bookId} ${chapter}:${verse}:`, error);
    return null; // Graceful degradation
  }
}

/**
 * Resolve FIA media HREF to actual URL
 * @param {string} href - HREF from TSV (e.g., "./payload/t/tar-pit-wide")
 * @param {string} type - Media type ('images' or 'maps')
 * @returns {string} Resolved media URL
 */
export function resolveFiaMediaUrl(href, type = 'images') {
  if (!href) return null;
  
  // Remove ./payload/ prefix
  const mediaPath = href.replace('./payload/', '');
  
  // TODO: Coordinate with FIA team for actual CDN URL
  // For now, return a placeholder that indicates the structure
  const FIA_MEDIA_BASE = `https://fia-media-cdn.example.com/${type}`;
  
  return `${FIA_MEDIA_BASE}/${mediaPath}.jpg`;
}

/**
 * Get combined FIA content for a verse (both images and maps)
 * @param {string} bookId - Book identifier
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @param {string} language - Language code
 * @returns {Promise<Object|null>} Combined FIA data or null
 */
export async function getVerseFiaContent(bookId, chapter, verse, language = 'en') {
  try {
    // Fetch both images and maps in parallel
    const [images, maps] = await Promise.all([
      getVerseFiaImages(bookId, chapter, verse, language),
      getVerseFiaMaps(bookId, chapter, verse, language)
    ]);
    
    // Return combined data if either has content
    if (images || maps) {
      return {
        images: images || [],
        maps: maps || [],
        hasContent: (images && images.length > 0) || (maps && maps.length > 0)
      };
    }
    
    return null;
  } catch (error) {
    console.warn(`FIA content not available for ${bookId} ${chapter}:${verse}:`, error);
    return null;
  }
} 