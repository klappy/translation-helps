/**
 * FIA Service - Familiarization, Internalization, Application resources
 * Enhanced to use Scripture Burrito metadata.json discovery
 * Properly integrates with DCS API for resource discovery
 */

import { parseTsv } from '../utils/parseTsv.js';
import { searchScriptureBurritoResources } from './catalogService.js';

const DCS_BASE_URL = 'https://git.door43.org';

// Cache for metadata.json files
const metadataCache = new Map();

// Cache for FIA resource discovery to prevent duplicate API calls
const discoveryCache = new Map();
const activeDiscoveryRequests = new Map();

/**
 * Fetch and parse Scripture Burrito metadata.json
 * @param {string} metadataUrl - URL to metadata.json file
 * @returns {Promise<Object|null>} Parsed metadata or null
 */
async function fetchMetadata(metadataUrl) {
  if (metadataCache.has(metadataUrl)) {
    return metadataCache.get(metadataUrl);
  }

  try {
    console.log(`📋 FIA: Fetching metadata from ${metadataUrl}`);
    const response = await fetch(metadataUrl);
    if (!response.ok) {
      console.warn(`FIA: Metadata not available (${response.status})`);
      return null;
    }

    const metadata = await response.json();
    metadataCache.set(metadataUrl, metadata);
    console.log(`✅ FIA: Loaded metadata for ${metadata.identification?.name?.en || 'unknown'}`);
    return metadata;
  } catch (error) {
    console.warn(`FIA: Failed to fetch metadata from ${metadataUrl}:`, error);
    return null;
  }
}

/**
 * Discover available FIA resources for a language using direct repository search
 * Falls back to direct search since DCS catalog API doesn't index Scripture Burrito resources yet
 * @param {string} language - Language code (default: 'en')
 * @returns {Promise<Object>} Available FIA resources
 */
export async function discoverFiaResources(language = 'en') {
  const cacheKey = `fia-discovery-${language}`;
  
  // Return cached result if available
  if (discoveryCache.has(cacheKey)) {
    console.log(`🔄 FIA: Using cached discovery for ${language}`);
    return discoveryCache.get(cacheKey);
  }
  
  // If there's an active request for this language, wait for it
  if (activeDiscoveryRequests.has(cacheKey)) {
    console.log(`⏳ FIA: Waiting for active discovery request for ${language}`);
    return await activeDiscoveryRequests.get(cacheKey);
  }
  
  // Create new discovery request
  const discoveryPromise = _discoverFiaResourcesInternal(language);
  activeDiscoveryRequests.set(cacheKey, discoveryPromise);
  
  try {
    const result = await discoveryPromise;
    discoveryCache.set(cacheKey, result);
    return result;
  } finally {
    activeDiscoveryRequests.delete(cacheKey);
  }
}

async function _discoverFiaResourcesInternal(language = 'en') {
  try {
    console.log(`🔍 FIA: Discovering resources for ${language}`);
    
    const fiaResources = {
      images: null,
      maps: null,
      available: false,
      metadata: {}
    };

    // Search for FIA repositories directly since catalog API doesn't index them yet
    const searchPromises = [
      fetch(`https://git.door43.org/api/v1/repos/search?q=${language}_fiaimages&limit=5`),
      fetch(`https://git.door43.org/api/v1/repos/search?q=${language}_fiamaps&limit=5`)
    ];

    const [imagesResponse, mapsResponse] = await Promise.all(searchPromises);
    
    // Process images repositories
    if (imagesResponse.ok) {
      const imagesData = await imagesResponse.json();
      if (imagesData.data && imagesData.data.length > 0) {
        const repo = imagesData.data[0]; // Take first match
        fiaResources.images = {
          id: 'fiaimages',
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description || 'FIA Images',
          subject: 'Scripture Burrito',
          format: 'sb',
          repoUrl: repo.html_url,
          metadataUrl: `${repo.html_url}/raw/branch/master/metadata.json`,
          languageId: language,
          organization: repo.owner?.login || repo.full_name.split('/')[0],
          isFia: true,
          fiaType: 'images'
        };
        console.log(`✅ FIA: Found images resource: ${repo.full_name}`);
      }
    }
    
    // Process maps repositories
    if (mapsResponse.ok) {
      const mapsData = await mapsResponse.json();
      if (mapsData.data && mapsData.data.length > 0) {
        const repo = mapsData.data[0]; // Take first match
        fiaResources.maps = {
          id: 'fiamaps',
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description || 'FIA Maps',
          subject: 'Scripture Burrito',
          format: 'sb',
          repoUrl: repo.html_url,
          metadataUrl: `${repo.html_url}/raw/branch/master/metadata.json`,
          languageId: language,
          organization: repo.owner?.login || repo.full_name.split('/')[0],
          isFia: true,
          fiaType: 'maps'
        };
        console.log(`✅ FIA: Found maps resource: ${repo.full_name}`);
      }
    }

    // Fetch metadata for discovered resources
    if (fiaResources.images) {
      try {
        const metadata = await fetchMetadata(fiaResources.images.metadataUrl);
        if (metadata) {
          fiaResources.metadata.images = metadata;
        }
      } catch (error) {
        console.warn(`FIA: Failed to fetch images metadata:`, error);
      }
    }

    if (fiaResources.maps) {
      try {
        const metadata = await fetchMetadata(fiaResources.maps.metadataUrl);
        if (metadata) {
          fiaResources.metadata.maps = metadata;
        }
      } catch (error) {
        console.warn(`FIA: Failed to fetch maps metadata:`, error);
      }
    }

    fiaResources.available = !!(fiaResources.images || fiaResources.maps);
    
    if (fiaResources.available) {
      console.log(`✅ FIA: Discovery complete - Images: ${!!fiaResources.images}, Maps: ${!!fiaResources.maps}`);
    } else {
      console.log(`ℹ️ FIA: No resources found for ${language}`);
    }

    return fiaResources;
  } catch (error) {
    console.error(`FIA: Discovery failed for ${language}:`, error);
    return { images: null, maps: null, available: false, metadata: {} };
  }
}

/**
 * Collapse contiguous verse ranges into readable format
 * @param {string[]} verses - Array of verse references (e.g., ["13:23", "13:24", "13:25", "13:41"])
 * @returns {string} Collapsed verse range (e.g., "13:23-25, 13:41")
 */
function collapseVerseRanges(verses) {
  if (!verses || verses.length === 0) return '';
  if (verses.length === 1) return verses[0];

  // Parse verses into chapter:verse pairs and sort
  const parsedVerses = verses
    .map(ref => {
      const [chapter, verse] = ref.split(':').map(Number);
      return { chapter, verse, original: ref };
    })
    .sort((a, b) => a.chapter - b.chapter || a.verse - b.verse);

  const ranges = [];
  let currentRange = [parsedVerses[0]];

  for (let i = 1; i < parsedVerses.length; i++) {
    const current = parsedVerses[i];
    const previous = parsedVerses[i - 1];

    // Check if current verse is contiguous with previous
    if (current.chapter === previous.chapter && current.verse === previous.verse + 1) {
      currentRange.push(current);
    } else {
      // End current range and start new one
      ranges.push(currentRange);
      currentRange = [current];
    }
  }
  
  // Add the last range
  ranges.push(currentRange);

  // Format ranges
  return ranges.map(range => {
    if (range.length === 1) {
      return range[0].original;
    } else if (range.length === 2) {
      return `${range[0].original}, ${range[1].original}`;
    } else {
      return `${range[0].original}-${range[range.length - 1].verse}`;
    }
  }).join(', ');
}

/**
 * Get available books from FIA metadata
 * @param {Object} metadata - Scripture Burrito metadata
 * @returns {string[]} Array of available book IDs
 */
function getAvailableBooks(metadata) {
  if (!metadata?.type?.flavorType?.currentScope) {
    return [];
  }

  return Object.keys(metadata.type.flavorType.currentScope);
}

/**
 * Check if a book has FIA content using metadata
 * @param {string} bookId - Book identifier (will be converted to uppercase)
 * @param {Object} metadata - Scripture Burrito metadata
 * @returns {boolean} True if book has content
 */
function hasBookContent(bookId, metadata) {
  const upperBookId = bookId.toUpperCase();
  const availableBooks = getAvailableBooks(metadata);
  return availableBooks.includes(upperBookId);
}

/**
 * Get FIA images for a specific verse using Scripture Burrito discovery
 * @param {string} bookId - Book identifier
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @param {string} language - Language code (default: 'en')
 * @returns {Promise<Array|null>} Array of FIA image rows or null
 */
export async function getVerseFiaImages(bookId, chapter, verse, language = 'en') {
  try {
    const upperBookId = bookId.toUpperCase();
    
    // Discover FIA resources
    const fiaResources = await discoverFiaResources(language);
    
    if (!fiaResources.images) {
      console.log(`ℹ️ FIA Images: No image resources available for ${language}`);
      return null;
    }

    // Check if book has content using metadata
    const metadata = fiaResources.metadata.images;
    if (metadata && !hasBookContent(upperBookId, metadata)) {
      console.log(`ℹ️ FIA Images: Book ${upperBookId} not available in metadata`);
      return null;
    }

    // Build TSV URL using discovered resource info
    const baseUrl = fiaResources.images.repoUrl.replace('/src/branch/master', '');
    const tsvUrl = `${baseUrl}/raw/branch/master/ingredients/${upperBookId}.tsv`;
    
    console.log(`🎯 FIA Images: Fetching ${upperBookId} ${chapter}:${verse} from ${tsvUrl}`);
    
    const response = await fetch(tsvUrl);
    if (!response.ok) {
      console.warn(`FIA Images: No TSV data for ${upperBookId} (${response.status})`);
      return null;
    }

    const tsvText = await response.text();
    const rows = parseTsv(tsvText);
    
    // Filter for specific verse reference
    const verseRef = `${chapter}:${verse}`;
    const verseData = rows.filter(row => row.REF === verseRef);
    
    console.log(`✅ FIA Images: Found ${verseData.length} items for ${upperBookId} ${verseRef}`);
    return verseData.length > 0 ? verseData : null;
    
  } catch (error) {
    console.warn(`FIA Images not available for ${bookId} ${chapter}:${verse}:`, error);
    return null;
  }
}

/**
 * Get FIA maps for a specific verse using Scripture Burrito discovery
 * @param {string} bookId - Book identifier
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @param {string} language - Language code (default: 'en')
 * @returns {Promise<Array|null>} Array of FIA map rows or null
 */
export async function getVerseFiaMaps(bookId, chapter, verse, language = 'en') {
  try {
    const upperBookId = bookId.toUpperCase();
    
    // Discover FIA resources
    const fiaResources = await discoverFiaResources(language);
    
    if (!fiaResources.maps) {
      console.log(`ℹ️ FIA Maps: No map resources available for ${language}`);
      return null;
    }

    // Check if book has content using metadata
    const metadata = fiaResources.metadata.maps;
    if (metadata && !hasBookContent(upperBookId, metadata)) {
      console.log(`ℹ️ FIA Maps: Book ${upperBookId} not available in metadata`);
      return null;
    }

    // Build TSV URL using discovered resource info
    const baseUrl = fiaResources.maps.repoUrl.replace('/src/branch/master', '');
    const tsvUrl = `${baseUrl}/raw/branch/master/ingredients/${upperBookId}.tsv`;
    
    console.log(`🎯 FIA Maps: Fetching ${upperBookId} ${chapter}:${verse} from ${tsvUrl}`);
    
    const response = await fetch(tsvUrl);
    if (!response.ok) {
      console.warn(`FIA Maps: No TSV data for ${upperBookId} (${response.status})`);
      return null;
    }

    const tsvText = await response.text();
    const rows = parseTsv(tsvText);
    
    // Filter for specific verse reference
    const verseRef = `${chapter}:${verse}`;
    const verseData = rows.filter(row => row.REF === verseRef);
    
    console.log(`✅ FIA Maps: Found ${verseData.length} items for ${upperBookId} ${verseRef}`);
    return verseData.length > 0 ? verseData : null;
    
  } catch (error) {
    console.warn(`FIA Maps not available for ${bookId} ${chapter}:${verse}:`, error);
    return null;
  }
}

/**
 * Resolve FIA media HREF to actual URL using Scripture Burrito structure
 * @param {string} href - HREF from TSV (e.g., "./payload/t/tar-pit-wide")
 * @param {string} repoUrl - Base repository URL
 * @returns {string} Resolved media URL
 */
export function resolveFiaMediaUrl(href, repoUrl) {
  if (!href || !repoUrl) return null;
  
  // Remove ./payload/ prefix and add .jpg extension if needed
  let mediaPath = href.replace('./payload/', '');
  if (!mediaPath.endsWith('.jpg') && !mediaPath.endsWith('.png')) {
    mediaPath += '.jpg';
  }
  
  // Build full URL using repository structure
  const baseUrl = repoUrl.replace('/src/branch/master', '');
  return `${baseUrl}/raw/branch/master/ingredients/payload/${mediaPath}`;
}

/**
 * Get combined FIA content for a verse using Scripture Burrito discovery
 * @param {string} bookId - Book identifier
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @param {string} language - Language code
 * @returns {Promise<Object|null>} Combined FIA data or null
 */
export async function getVerseFiaContent(bookId, chapter, verse, language = 'en') {
  try {
    // Discover available resources first
    const fiaResources = await discoverFiaResources(language);
    
    if (!fiaResources.available) {
      console.log(`ℹ️ FIA: No resources available for ${language}`);
      return null;
    }

    // Fetch both images and maps in parallel (only if resources exist)
    const promises = [];
    
    if (fiaResources.images) {
      promises.push(getVerseFiaImages(bookId, chapter, verse, language));
    } else {
      promises.push(Promise.resolve(null));
    }
    
    if (fiaResources.maps) {
      promises.push(getVerseFiaMaps(bookId, chapter, verse, language));
    } else {
      promises.push(Promise.resolve(null));
    }
    
    const [images, maps] = await Promise.all(promises);
    
    // Return combined data if either has content
    if (images || maps) {
      return {
        images: images || [],
        maps: maps || [],
        hasContent: (images && images.length > 0) || (maps && maps.length > 0),
        resources: fiaResources, // Include discovery info
        // Helper function to resolve media URLs
        resolveMediaUrl: (href, type) => {
          const resource = type === 'maps' ? fiaResources.maps : fiaResources.images;
          return resource ? resolveFiaMediaUrl(href, resource.repoUrl) : null;
        }
      };
    }
    
    return null;
  } catch (error) {
    console.warn(`FIA content not available for ${bookId} ${chapter}:${verse}:`, error);
    return null;
  }
} 
/**
 * Get FIA maps for an entire chapter with deduplication and proper titles
 * @param {string} bookId - Book identifier
 * @param {number} chapter - Chapter number
 * @param {string} language - Language code (default: 'en')
 * @returns {Promise<Array|null>} Array of deduplicated FIA map objects or null
 */
export async function getChapterFiaMaps(bookId, chapter, language = 'en') {
  try {
    const upperBookId = bookId.toUpperCase();
    
    // Discover FIA resources
    const fiaResources = await discoverFiaResources(language);
    
    if (!fiaResources.maps) {
      console.log(`ℹ️ FIA Maps: No map resources available for ${language}`);
      return null;
    }

    // Check if book has content using metadata
    const metadata = fiaResources.metadata.maps;
    if (metadata && !hasBookContent(upperBookId, metadata)) {
      console.log(`ℹ️ FIA Maps: Book ${upperBookId} not available in metadata`);
      return null;
    }

    // Build TSV URL using discovered resource info
    const baseUrl = fiaResources.maps.repoUrl.replace('/src/branch/master', '');
    const tsvUrl = `${baseUrl}/raw/branch/master/ingredients/${upperBookId}.tsv`;
    
    console.log(`🎯 FIA Maps: Fetching chapter ${chapter} maps from ${tsvUrl}`);
    
    const response = await fetch(tsvUrl);
    if (!response.ok) {
      console.warn(`FIA Maps: No TSV data for ${upperBookId} (${response.status})`);
      return null;
    }

    const tsvText = await response.text();
    const rows = parseTsv(tsvText);
    
    // Filter for chapter references (e.g., "1:1", "1:2", etc.)
    const chapterPattern = new RegExp(`^${chapter}:`);
    const chapterData = rows.filter(row => chapterPattern.test(row.REF));
    
    if (chapterData.length === 0) {
      console.log(`ℹ️ FIA Maps: No maps found for ${upperBookId} chapter ${chapter}`);
      return null;
    }

    // Deduplicate by HREF and create proper titles
    const uniqueMaps = new Map();
    
    chapterData.forEach(row => {
      if (!uniqueMaps.has(row.HREF)) {
        // Convert filename to proper title
        const filename = row.HREF.replace('./payload/', '').replace(/\.(jpg|png)$/, '');
        // Remove directory prefix (e.g., "J/jerusalem" becomes "jerusalem")
        const cleanFilename = filename.includes('/') ? filename.split('/').pop() : filename;
        const title = cleanFilename
          .split(/[-_]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        uniqueMaps.set(row.HREF, {
          ...row,
          title: title,
          verses: [row.REF], // Track which verses reference this map
          resolveMediaUrl: () => resolveFiaMediaUrl(row.HREF, fiaResources.maps.repoUrl)
        });
      } else {
        // Add verse reference to existing map
        const existingMap = uniqueMaps.get(row.HREF);
        if (!existingMap.verses.includes(row.REF)) {
          existingMap.verses.push(row.REF);
        }
      }
    });
    
    const deduplicatedMaps = Array.from(uniqueMaps.values()).map(map => ({
      ...map,
      versesFormatted: collapseVerseRanges(map.verses) // Add formatted verse ranges
    }));
    
    console.log(`✅ FIA Maps: Found ${deduplicatedMaps.length} unique maps for ${upperBookId} chapter ${chapter} (${chapterData.length} total references)`);
    
    return deduplicatedMaps;
    
  } catch (error) {
    console.warn(`FIA Maps not available for ${bookId} chapter ${chapter}:`, error);
    return null;
  }
}
