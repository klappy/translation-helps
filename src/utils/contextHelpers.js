/**
 * Context coordination utilities for URL handling and context persistence.
 * Updated to support new scriptures/resources array format for infinite scalability.
 */

/**
 * Updates the browser URL to reflect the current context state.
 * New format: ?scriptures=[/org/lang/type/book/chapter/verse]&resources=[/org/lang/type/]
 * @param {Object} context - The context to serialize to URL
 * @param {Object} context.reference - The reference object
 * @param {Array} context.scriptures - Array of scripture resources
 * @param {Array} context.resources - Array of translation help resources
 */
export function updateQueryFromContext(context) {
  const reference = context.reference || {};
  const { bookId, chapter, verse } = reference;

  // Handle legacy format for backward compatibility
  if (context.organization && context.languageId && context.resourceId && 
      (!context.scriptures || context.scriptures.length === 0) &&
      (!context.resources || context.resources.length === 0)) {
    return updateQueryFromContextLegacy(context);
  }

  // New format: scriptures and resources arrays
  const scriptures = context.scriptures || [];
  const resources = context.resources || [];

  // Build URL parameters using literal array format [item1,item2]
  const urlParts = [];
  
  if (scriptures.length > 0) {
    // Use literal array format with brackets - no encoding of [,/,]
    const scripturesStr = `[${scriptures.join(',')}]`;
    urlParts.push(`scriptures=${scripturesStr}`);
  }
  
  if (resources.length > 0) {
    // Use literal array format with brackets - no encoding of [,/,]
    const resourcesStr = `[${resources.join(',')}]`;
    urlParts.push(`resources=${resourcesStr}`);
  }

  const path = window.location.pathname;
  const query = urlParts.length > 0 ? `${path}?${urlParts.join('&')}` : path;

  window.history.pushState(context, null, query);
}

/**
 * Legacy URL format support for backward compatibility
 * Format: ?owner=org&rc=/lang/type/book/chapter/verse
 */
function updateQueryFromContextLegacy(context) {
  const reference = context.reference || {};
  const _context = { ...context, reference };

  const {
    organization,
    languageId,
    resourceId,
    reference: { bookId, chapter, verse },
  } = _context;

  const _organization = organization ? `owner=${organization}` : "";
  const _languageId = languageId ? `/${languageId}` : "";
  const _resourceId = resourceId ? `/${resourceId}` : "";
  const _bookId = bookId ? `/${bookId}` : "";
  const _chapter = chapter ? `/${chapter}` : "";
  const _verse = verse ? `/${verse}` : "";

  const rcContent = `${_languageId}${_resourceId}${_bookId}${_chapter}${_verse}`;
  const rc = rcContent && rcContent !== "/" ? `&rc=${rcContent}` : "";

  const path = window.location.pathname;
  const query = `${path}?${_organization}${rc}`;

  window.history.pushState(context, null, query);
}

/**
 * Parses the current URL to extract context information.
 * Supports both new and legacy formats.
 * @returns {Object} The context parsed from URL parameters
 */
export function contextFromQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check for new format first
  const scripturesParam = urlParams.get("scriptures");
  const resourcesParam = urlParams.get("resources");
  
  if (scripturesParam || resourcesParam) {
    return contextFromQueryNew(scripturesParam, resourcesParam);
  }
  
  // Fall back to legacy format
  return contextFromQueryLegacy();
}

/**
 * Parse new URL format
 * Format: ?scriptures=[/org/lang/type/book/chapter/verse]&resources=[/org/lang/type/]
 */
function contextFromQueryNew(scripturesParam, resourcesParam) {
  let scriptures = [];
  let resources = [];
  
  // Parse array format [item1,item2] - remove brackets and split
  if (scripturesParam) {
    const cleaned = scripturesParam.replace(/^\[|\]$/g, ''); // Remove [ and ]
    scriptures = cleaned ? cleaned.split(',').filter(Boolean) : [];
  }
  
  // Parse array format [item1,item2] - remove brackets and split
  if (resourcesParam) {
    const cleaned = resourcesParam.replace(/^\[|\]$/g, ''); // Remove [ and ]
    resources = cleaned ? cleaned.split(',').filter(Boolean) : [];
  }

  // Parse primary scripture for reference (first scripture in array)
  let reference = { bookId: null, chapter: null, verse: null };
  let primaryScripture = null;
  
  if (scriptures.length > 0) {
    const primaryPath = scriptures[0];
    const parsed = parseResourcePath(primaryPath);
    
    if (parsed) {
      reference = {
        bookId: parsed.bookId || null,
        chapter: parsed.chapter ? parseInt(parsed.chapter, 10) : null,
        verse: parsed.verse ? parseInt(parsed.verse, 10) : null
      };
      primaryScripture = {
        organization: parsed.organization,
        languageId: parsed.languageId,
        resourceId: parsed.resourceId
      };
    }
  }

  // Parse resources array
  const parsedResources = resources.map(parseResourcePath).filter(Boolean);

  return {
    hasUrlParams: !!(scripturesParam || resourcesParam),
    isNewFormat: true,
    reference,
    scriptures: scriptures, // Keep as strings, don't parse to objects
    resources: resources,   // Keep as strings, don't parse to objects
    // Legacy compatibility
    organization: primaryScripture?.organization || null,
    languageId: primaryScripture?.languageId || null,
    resourceId: primaryScripture?.resourceId || null,
  };
}

/**
 * Parse legacy URL format for backward compatibility
 * Format: ?owner=org&rc=/lang/type/book/chapter/verse
 */
function contextFromQueryLegacy() {
  const urlParams = new URLSearchParams(window.location.search);
  const ownerParam = urlParams.get("owner");
  const rcParam = urlParams.get("rc");

  const hasUrlParams = ownerParam || rcParam;

  const rc = rcParam || "";
  const rcArray = rc
    .slice(1)
    .split("/")
    .filter((string) => string);
  const [languageId, resourceIdFromUrl, bookId, chapter, verse] = rcArray;

  let resourceId = resourceIdFromUrl || null;

  return {
    hasUrlParams: !!hasUrlParams,
    isNewFormat: false,
    organization: ownerParam || null,
    languageId: languageId || null,
    resourceId: resourceId,
    reference: {
      bookId: bookId || null,
      chapter: chapter ? parseInt(chapter, 10) : null,
      verse: verse ? parseInt(verse, 10) : null,
    },
    // New format compatibility (empty arrays)
    scriptures: [],
    resources: []
  };
}

/**
 * Parse a resource path string into components
 * Format: /organization/languageId/resourceId/bookId/chapter/verse
 * @param {string} path - The resource path to parse
 * @returns {Object|null} Parsed resource object or null if invalid
 */
function parseResourcePath(path) {
  if (!path || typeof path !== 'string') return null;
  
  const parts = path.split('/').filter(Boolean);
  if (parts.length < 3) return null; // Need at least org/lang/type
  
  const [organization, languageId, resourceId, bookId, chapter, verse] = parts;
  
  return {
    organization,
    languageId,
    resourceId,
    bookId: bookId || null,
    chapter: chapter || null,
    verse: verse || null
  };
}

/**
 * Build a resource path string from components
 * @param {Object} resource - Resource object with org/lang/type/book/chapter/verse
 * @param {boolean} includeReference - Whether to include book/chapter/verse
 * @returns {string} Resource path string
 */
export function buildResourcePath(resource, includeReference = false) {
  const { organization, languageId, resourceId, bookId, chapter, verse } = resource;
  
  let path = `/${organization}/${languageId}/${resourceId}`;
  
  if (includeReference && bookId) {
    path += `/${bookId}`;
    if (chapter) {
      path += `/${chapter}`;
      if (verse) {
        path += `/${verse}`;
      }
    }
  }
  
  return path;
}

/**
 * Saves context to localStorage.
 * @param {string} key - The storage key
 * @param {any} value - The value to save
 */
export function save({ key, value }) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
    return false;
  }
}

/**
 * Loads context from localStorage.
 * @param {string} key - The storage key
 * @param {any} defaultValue - The default value if key not found
 * @returns {any} The loaded value or default
 */
export function load({ key, defaultValue }) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return defaultValue;
  }
}

/**
 * Merges context updates with the current context.
 * Handles special cases like OBS resourceId.
 * @param {Object} currentContext - The current context
 * @param {Object} updates - The updates to apply
 * @returns {Object} The merged context
 */
export function mergeContext(currentContext, updates) {
  let mergedContext = { ...currentContext, ...updates };

  // Special case: use 'obs' for bookId if resourceId is 'obs'
  if (updates.resourceId === "obs") {
    const reference = { ...mergedContext.reference, bookId: "obs" };
    mergedContext = { ...mergedContext, reference };
  }

  return mergedContext;
}

/**
 * Gets the default context structure.
 * @returns {Object} The default context
 */
export function getDefaultContext() {
  return {
    organization: "unfoldingWord",
    languageId: "en",
    resourceId: null,
    reference: {
      bookId: null,
      chapter: null,
      verse: null,
    },
  };
}

/**
 * Returns the chapter count for a given bookId, using manifest data if available, otherwise falling back to a static map.
 * @param {string} bookId - The book identifier (e.g., "gen")
 * @param {object} manifest - (Optional) The manifest object containing projects array
 * @returns {number} The number of chapters in the book
 */
export function getChapterCount(bookId, manifest) {
  // Try manifest first
  if (manifest && manifest.projects && Array.isArray(manifest.projects)) {
    const project = manifest.projects.find(
      (p) => p.identifier && p.identifier.toLowerCase() === bookId
    );
    if (project && Array.isArray(project.chapters) && project.chapters.length > 0) {
      return project.chapters.length;
    }
  }
  // Fallback static map
  const chapterCounts = {
    gen: 50,
    exo: 40,
    lev: 27,
    num: 36,
    deu: 34,
    jos: 24,
    jdg: 21,
    rut: 4,
    "1sa": 31,
    "2sa": 24,
    "1ki": 22,
    "2ki": 25,
    "1ch": 29,
    "2ch": 36,
    ezr: 10,
    neh: 13,
    est: 10,
    job: 42,
    psa: 150,
    pro: 31,
    ecc: 12,
    sng: 8,
    isa: 66,
    jer: 52,
    lam: 5,
    ezk: 48,
    dan: 12,
    hos: 14,
    jol: 3,
    amo: 9,
    oba: 1,
    jon: 4,
    mic: 7,
    nam: 3,
    hab: 3,
    zep: 3,
    hag: 2,
    zec: 14,
    mal: 4,
    mat: 28,
    mrk: 16,
    luk: 24,
    jhn: 21,
    act: 28,
    rom: 16,
    "1co": 16,
    "2co": 13,
    gal: 6,
    eph: 6,
    php: 4,
    col: 4,
    "1th": 5,
    "2th": 3,
    "1ti": 6,
    "2ti": 4,
    tit: 3,
    phm: 1,
    heb: 13,
    jas: 5,
    "1pe": 5,
    "2pe": 3,
    "1jn": 5,
    "2jn": 1,
    "3jn": 1,
    jud: 1,
    rev: 22,
  };
  return chapterCounts[bookId] || 25;
}
