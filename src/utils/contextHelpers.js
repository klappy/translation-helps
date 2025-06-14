/**
 * Context coordination utilities for URL handling and context persistence.
 * Based on the original helpers.js updateQueryFromContext and contextFromQuery functions.
 */

/**
 * Updates the browser URL to reflect the current context state.
 * @param {Object} context - The context to serialize to URL
 * @param {string} context.organization - The organization (owner)
 * @param {string} context.languageId - The language ID
 * @param {string} context.resourceId - The resource ID
 * @param {Object} context.reference - The reference object
 */
export function updateQueryFromContext(context) {
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

  // Strip language prefix from resourceId for RC URI construction
  // e.g., "en_ult" -> "ult" when languageId is "en"
  // Handle null/undefined resourceId gracefully
  let cleanResourceId = resourceId;
  if (resourceId && languageId && resourceId.startsWith(`${languageId}_`)) {
    cleanResourceId = resourceId.substring(languageId.length + 1);
  }
  const _resourceId = cleanResourceId ? `/${cleanResourceId}` : "";

  const _bookId = bookId ? `/${bookId}` : "";
  const _chapter = chapter ? `/${chapter}` : "";
  const _verse = verse ? `/${verse}` : "";

  // Only include rc parameter if we have meaningful content
  const rcContent = `${_languageId}${_resourceId}${_bookId}${_chapter}${_verse}`;
  const rc = rcContent && rcContent !== "/" ? `&rc=${rcContent}` : "";

  const path = window.location.pathname;
  const query = `${path}?${_organization}${rc}`;

  window.history.pushState(context, null, query);
}

/**
 * Parses the current URL to extract context information.
 * @returns {Object} The context parsed from URL parameters with hasUrlParams flag
 */
export function contextFromQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  const ownerParam = urlParams.get("owner");
  const rcParam = urlParams.get("rc");

  // Check if URL actually has parameters
  const hasUrlParams = ownerParam || rcParam;

  const rc = rcParam || "";
  const rcArray = rc
    .slice(1)
    .split("/")
    .filter((string) => string);
  const [languageId, resourceIdFromUrl, bookId, chapter, verse] = rcArray;

  // Reconstruct full resourceId with language prefix to match catalog API
  // e.g., languageId="en" + resourceIdFromUrl="ult" -> resourceId="en_ult"
  // Handle cases where resourceIdFromUrl might be missing
  let resourceId = null;
  if (resourceIdFromUrl && languageId) {
    resourceId = `${languageId}_${resourceIdFromUrl}`;
  } else if (resourceIdFromUrl) {
    // If we have resourceIdFromUrl but no languageId, use it as-is
    resourceId = resourceIdFromUrl;
  }

  return {
    hasUrlParams: !!hasUrlParams,
    organization: ownerParam || null, // NO defaults - return exactly what's in URL
    languageId: languageId || null, // NO defaults - return exactly what's in URL
    resourceId: resourceId,
    reference: {
      bookId: bookId || null,
      chapter: chapter || null,
      verse: verse || null,
    },
  };
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
    organization: "door43-catalog",
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
