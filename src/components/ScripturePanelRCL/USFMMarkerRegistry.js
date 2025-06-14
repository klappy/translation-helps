/**
 * USFMMarkerRegistry.js
 * Complete USFM 3.0 marker registry with all standard markers
 * This registry defines the properties and behavior of each USFM marker
 */

// Marker types
export const MARKER_TYPES = {
  PARAGRAPH: "paragraph",
  CHARACTER: "character",
  MILESTONE: "milestone",
  NOTE: "note",
};

// Complete USFM 3.0 marker registry
export const USFM_MARKERS = {
  // 1. Identification and Headers
  id: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "File identification" },
  usfm: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "USFM version" },
  ide: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "File encoding" },
  h: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Running header" },
  toc1: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Long table of contents",
  },
  toc2: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Short table of contents",
  },
  toc3: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Book abbreviation" },
  toca1: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Alternative TOC 1" },
  toca2: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Alternative TOC 2" },
  toca3: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Alternative TOC 3" },

  // 2. Main Titles and Headings
  mt: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Main title",
    hasLevels: true,
    maxLevel: 4,
  },
  mte: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Main title at ending",
    hasLevels: true,
    maxLevel: 2,
  },
  ms: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Major section heading",
    hasLevels: true,
    maxLevel: 3,
  },
  mr: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Major section reference range",
  },

  // 3. Chapter and Verse
  c: { type: MARKER_TYPES.MILESTONE, hasEndMarker: false, description: "Chapter number" },
  ca: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Alternate chapter number" },
  cl: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Chapter label" },
  cd: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Chapter description" },
  cp: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Published chapter character",
  },
  v: { type: MARKER_TYPES.MILESTONE, hasEndMarker: false, description: "Verse number" },
  va: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Alternate verse number" },
  vp: {
    type: MARKER_TYPES.CHARACTER,
    hasEndMarker: true,
    description: "Published verse character",
  },

  // 4. Paragraphs
  p: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Normal paragraph" },
  m: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Margin paragraph" },
  po: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Opening of an epistle" },
  pr: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Right-aligned paragraph" },
  cls: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Closure of an epistle" },
  pmo: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Embedded text opening" },
  pm: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Embedded text paragraph" },
  pmc: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Embedded text closing" },
  pmr: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Embedded text refrain" },
  pi: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Indented paragraph",
    hasLevels: true,
    maxLevel: 3,
  },
  mi: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Indented flush left paragraph",
  },
  nb: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "No break with previous paragraph",
  },
  pc: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Centered paragraph" },
  ph: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Hanging paragraph",
    hasLevels: true,
    maxLevel: 3,
  },
  phi: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Indented hanging paragraph",
  },

  // 5. Poetry
  q: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Poetic line",
    hasLevels: true,
    maxLevel: 4,
  },
  qr: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Right-aligned poetic line",
  },
  qc: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Centered poetic line" },
  qs: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Selah" },
  qa: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Acrostic heading" },
  qac: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Acrostic character" },
  qm: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Embedded text poetic line",
    hasLevels: true,
    maxLevel: 3,
  },
  qd: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Hebrew note" },

  // 6. Lists
  li: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "List entry",
    hasLevels: true,
    maxLevel: 4,
  },
  lf: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "List footer" },
  lim: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Embedded list entry",
    hasLevels: true,
    maxLevel: 4,
  },
  litl: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "List entry total" },
  lik: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Structured list entry" },
  liv: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "List entry verse",
    hasLevels: true,
    maxLevel: 4,
  },

  // 7. Section Headings
  s: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Section heading",
    hasLevels: true,
    maxLevel: 4,
  },
  sr: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Section reference range" },
  r: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Parallel reference" },
  d: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Descriptive title" },
  sp: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Speaker identification" },
  sd: {
    type: MARKER_TYPES.PARAGRAPH,
    hasEndMarker: false,
    description: "Semantic division",
    hasLevels: true,
    maxLevel: 4,
  },

  // 8. Character Formatting
  add: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Translator's addition" },
  bk: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Book name" },
  dc: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Deuterocanonical content" },
  k: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Keyword" },
  lit: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Liturgical note" },
  nd: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Name of deity" },
  ord: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Ordinal number" },
  pn: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Proper name" },
  png: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Geographic name" },
  qt: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Quoted text" },
  sig: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Signature" },
  sls: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Language switch" },
  tl: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Transliterated word" },
  wj: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Words of Jesus" },

  // 9. Word-level Markup
  w: {
    type: MARKER_TYPES.CHARACTER,
    hasEndMarker: true,
    description: "Word entry",
    supportsAttributes: true,
  },
  rb: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Ruby base text" },
  rt: { type: MARKER_TYPES.CHARACTER, hasEndMarker: true, description: "Ruby text" },
  "zaln-s": {
    type: MARKER_TYPES.MILESTONE,
    hasEndMarker: false,
    description: "Alignment start",
    supportsAttributes: true,
  },
  "zaln-e": { type: MARKER_TYPES.MILESTONE, hasEndMarker: false, description: "Alignment end" },

  // 10. Footnotes
  f: { type: MARKER_TYPES.NOTE, hasEndMarker: true, description: "Footnote" },
  fe: { type: MARKER_TYPES.NOTE, hasEndMarker: true, description: "Endnote" },
  fr: { type: MARKER_TYPES.CHARACTER, hasEndMarker: false, description: "Footnote reference" },
  fk: { type: MARKER_TYPES.CHARACTER, hasEndMarker: false, description: "Footnote keyword" },
  fq: { type: MARKER_TYPES.CHARACTER, hasEndMarker: false, description: "Footnote quotation" },
  fqa: {
    type: MARKER_TYPES.CHARACTER,
    hasEndMarker: false,
    description: "Footnote alternate translation",
  },
  fl: { type: MARKER_TYPES.CHARACTER, hasEndMarker: false, description: "Footnote label" },
  fw: { type: MARKER_TYPES.CHARACTER, hasEndMarker: false, description: "Footnote witness" },
  fp: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Footnote paragraph" },
  fv: { type: MARKER_TYPES.CHARACTER, hasEndMarker: false, description: "Footnote verse number" },
  ft: { type: MARKER_TYPES.CHARACTER, hasEndMarker: false, description: "Footnote text" },
  fdc: {
    type: MARKER_TYPES.CHARACTER,
    hasEndMarker: true,
    description: "Footnote deuterocanonical content",
  },
  fm: { type: MARKER_TYPES.CHARACTER, hasEndMarker: false, description: "Footnote mark" },

  // 11. Cross References
  x: { type: MARKER_TYPES.NOTE, hasEndMarker: true, description: "Cross reference" },
  xo: { type: MARKER_TYPES.CHARACTER, hasEndMarker: false, description: "Cross reference origin" },
  xk: { type: MARKER_TYPES.CHARACTER, hasEndMarker: false, description: "Cross reference keyword" },
  xq: {
    type: MARKER_TYPES.CHARACTER,
    hasEndMarker: false,
    description: "Cross reference quotation",
  },
  xt: {
    type: MARKER_TYPES.CHARACTER,
    hasEndMarker: false,
    description: "Cross reference target reference",
  },
  xta: {
    type: MARKER_TYPES.CHARACTER,
    hasEndMarker: false,
    description: "Cross reference target reference (Targum)",
  },
  xop: {
    type: MARKER_TYPES.CHARACTER,
    hasEndMarker: false,
    description: "Cross reference published origin",
  },
  xot: {
    type: MARKER_TYPES.CHARACTER,
    hasEndMarker: false,
    description: "Cross reference origin text",
  },
  xnt: {
    type: MARKER_TYPES.CHARACTER,
    hasEndMarker: false,
    description: "Cross reference note text",
  },
  xdc: {
    type: MARKER_TYPES.CHARACTER,
    hasEndMarker: true,
    description: "Cross reference deuterocanonical content",
  },

  // 12. Tables
  tr: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Table row" },
  th: {
    type: MARKER_TYPES.CHARACTER,
    hasEndMarker: false,
    description: "Table header cell",
    hasLevels: true,
    maxLevel: 5,
  },
  tc: {
    type: MARKER_TYPES.CHARACTER,
    hasEndMarker: false,
    description: "Table cell",
    hasLevels: true,
    maxLevel: 5,
  },
  tcr: {
    type: MARKER_TYPES.CHARACTER,
    hasEndMarker: false,
    description: "Right-aligned table cell",
    hasLevels: true,
    maxLevel: 5,
  },

  // 13. Special Features
  fig: {
    type: MARKER_TYPES.MILESTONE,
    hasEndMarker: true,
    description: "Figure/illustration",
    supportsAttributes: true,
  },
  cat: { type: MARKER_TYPES.PARAGRAPH, hasEndMarker: false, description: "Category entry" },
  esb: { type: MARKER_TYPES.NOTE, hasEndMarker: false, endMarker: "esbe", description: "Sidebar" },
  milestone: {
    type: MARKER_TYPES.MILESTONE,
    hasEndMarker: false,
    description: "Generic milestone",
    supportsAttributes: true,
  },

  // Special markers
  ts: { type: MARKER_TYPES.MILESTONE, hasEndMarker: true, description: "Text status" },
};

/**
 * Get marker information from the registry
 * @param {string} markerName - The marker name (without backslash)
 * @returns {object|null} Marker information or null if not found
 */
export function getMarkerInfo(markerName) {
  // Handle leveled markers (e.g., "mt1", "s2", "q3")
  const baseName = markerName.replace(/\d+$/, "");
  const level = markerName.match(/\d+$/)?.[0];

  const markerInfo = USFM_MARKERS[baseName] || USFM_MARKERS[markerName];

  if (markerInfo && level && markerInfo.hasLevels) {
    return {
      ...markerInfo,
      level: parseInt(level),
      fullName: markerName,
    };
  }

  return markerInfo ? { ...markerInfo, fullName: markerName } : null;
}

/**
 * Check if a marker is a valid USFM marker
 * @param {string} markerName - The marker name (without backslash)
 * @returns {boolean} True if valid marker
 */
export function isValidMarker(markerName) {
  return getMarkerInfo(markerName) !== null;
}

/**
 * Get the end marker name for a given marker
 * @param {string} markerName - The marker name (without backslash)
 * @returns {string|null} End marker name or null if no end marker
 */
export function getEndMarker(markerName) {
  const markerInfo = getMarkerInfo(markerName);
  if (!markerInfo) return null;

  if (markerInfo.endMarker) {
    return markerInfo.endMarker;
  }

  if (markerInfo.hasEndMarker) {
    return markerName + "*";
  }

  return null;
}

/**
 * Check if a marker supports attributes
 * @param {string} markerName - The marker name (without backslash)
 * @returns {boolean} True if marker supports attributes
 */
export function supportsAttributes(markerName) {
  const markerInfo = getMarkerInfo(markerName);
  return markerInfo?.supportsAttributes || false;
}

/**
 * Get all markers of a specific type
 * @param {string} markerType - The marker type from MARKER_TYPES
 * @returns {Array} Array of marker names
 */
export function getMarkersByType(markerType) {
  return Object.entries(USFM_MARKERS)
    .filter(([name, info]) => info.type === markerType)
    .map(([name]) => name);
}
