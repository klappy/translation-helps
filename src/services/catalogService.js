/**
 * catalogService.js
 * Service for DCS catalog API integration to discover organizations, languages, and resources
 * Enhanced with performance optimizations for cross-organization resource discovery
 */

import { 
  resourceCache, 
  manifestCache, 
  organizationCache,
  createOptimizedSearch,
  performanceTracker,
  apiRequestBatcher
} from '../utils/performanceOptimizations.js';

const BASE_CATALOG_URL = "https://git.door43.org/api/v1/catalog/list";
const CATALOG_SEARCH_URL = "https://git.door43.org/api/v1/catalog/search";

/**
 * Cache for API responses with timeout
 */
class CatalogCache {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
  }

  get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new CatalogCache();

/**
 * Enhanced fetch with performance optimizations, caching and error handling
 * @param {string} url - The URL to fetch
 * @param {string} cacheKey - Cache key for storing results
 * @returns {Promise<any>} API response data
 */
async function fetchWithCache(url, cacheKey) {
  // Check enhanced cache first
  const cached = resourceCache.get(cacheKey) || cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Start performance tracking
  const timerLabel = `fetch:${cacheKey}`;
  performanceTracker.startTimer(timerLabel);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Store in both caches for redundancy
    cache.set(cacheKey, data);
    resourceCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    
    // Return cached data if available, even if expired
    const expiredCache = cache.cache.get(cacheKey);
    if (expiredCache) {
      console.warn(`Using expired cache for ${cacheKey}`);
      return expiredCache.data;
    }
    throw error;
  } finally {
    performanceTracker.endTimer(timerLabel);
  }
}

/**
 * Fetches available organizations/owners from DCS catalog API
 * @returns {Promise<Object[]>} Array of organization objects with metadata
 */
export async function fetchOrganizations() {
  const fallbackOrganizations = [
    {
      login: "unfoldingWord",
      full_name: "unfoldingWord",
      description: "Open Bible resources for every language",
      avatar_url: null,
      website: "https://unfoldingword.org",
    },
    {
      login: "door43-catalog",
      full_name: "Door43 Catalog",
      description: "Community-driven translation hub",
      avatar_url: null,
      website: "https://door43.org",
    },
    {
      login: "STR",
      full_name: "STR",
      description: "Scripture Translation Resources",
      avatar_url: null,
      website: null,
    },
    {
      login: "WA",
      full_name: "WA",
      description: "Wycliffe Associates",
      avatar_url: null,
      website: null,
    },
  ];

  try {
    const url = `${BASE_CATALOG_URL}/owners`;
    const data = await fetchWithCache(url, "organizations");

    if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
      // Extract full organization objects from API response
      const organizations = data.data
        .filter((org) => org && org.login)
        .map((org) => ({
          login: org.login,
          full_name: org.full_name || org.login,
          description: org.description || `Organization: ${org.full_name || org.login}`,
          avatar_url: org.avatar_url || null,
          website: org.website || null,
          location: org.location || null,
          repo_count: org.repo_count || 0,
          visibility: org.visibility || "public",
        }))
        .sort((a, b) => (a.full_name || a.login).localeCompare(b.full_name || b.login));

      return organizations.length > 0 ? organizations : fallbackOrganizations;
    }

    return fallbackOrganizations;
  } catch (error) {
    console.warn("Failed to fetch organizations from API, using fallback data:", error);
    return fallbackOrganizations;
  }
}

/**
 * Fetches available languages for a specific organization
 * @param {string} owner - The organization/owner name
 * @returns {Promise<Object[]>} Array of language objects with code, name, and metadata
 */
export async function fetchLanguages(owner) {
  if (!owner) {
    return [];
  }

  const fallbackLanguages = [
    { code: "en", name: "English", direction: "ltr" },
    { code: "es", name: "Spanish", direction: "ltr" },
    { code: "fr", name: "French", direction: "ltr" },
    { code: "pt", name: "Portuguese", direction: "ltr" },
    { code: "hi", name: "Hindi", direction: "ltr" },
    { code: "ar", name: "Arabic", direction: "rtl" },
    { code: "sw", name: "Swahili", direction: "ltr" },
    { code: "zh", name: "Chinese", direction: "ltr" },
    { code: "ru", name: "Russian", direction: "ltr" },
    { code: "de", name: "German", direction: "ltr" },
    { code: "it", name: "Italian", direction: "ltr" },
    { code: "ja", name: "Japanese", direction: "ltr" },
    { code: "ko", name: "Korean", direction: "ltr" },
    { code: "nl", name: "Dutch", direction: "ltr" },
    { code: "pl", name: "Polish", direction: "ltr" },
    { code: "tr", name: "Turkish", direction: "ltr" },
    { code: "vi", name: "Vietnamese", direction: "ltr" },
    { code: "th", name: "Thai", direction: "ltr" },
    { code: "id", name: "Indonesian", direction: "ltr" },
    { code: "ms", name: "Malay", direction: "ltr" },
  ];

  try {
    const url = `${BASE_CATALOG_URL}/languages?owner=${encodeURIComponent(owner)}`;
    const data = await fetchWithCache(url, `languages_${owner}`);

    if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
      // Extract language objects from API response
      const languages = data.data
        .filter((lang) => lang && lang.lc)
        .map((lang) => {
          // Debug logging to identify language ID corruption
          console.log("🔍 Raw language from API:", lang);
          console.log("🔍 Extracted lang.lc:", lang.lc);

          return {
            code: lang.lc,
            name: lang.ln || lang.lc,
            direction: lang.ld || "ltr",
            raw: lang,
          };
        })
        .sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code));

      // Log the final transformed languages
      console.log("🔍 Final languages array:", languages);

      return languages.length > 0 ? languages : fallbackLanguages;
    }

    return fallbackLanguages;
  } catch (error) {
    console.warn(`Failed to fetch languages for ${owner} from API, using fallback data:`, error);
    return fallbackLanguages;
  }
}

/**
 * Fetches available resources/subjects for a specific organization and language
 * @param {string} owner - The organization/owner name
 * @param {string|Object} language - The language ID (string) or language object with code property
 * @returns {Promise<string[]>} Array of resource IDs
 */
export async function fetchResources(owner, language) {
  if (!owner || !language) {
    return [];
  }

  // Extract language code from string or object
  const languageCode = typeof language === "string" ? language : language.code;
  if (!languageCode) {
    return [];
  }

  const fallbackResources = ["ult", "ust", "tn", "tq", "tw", "twl", "ta"];

  try {
    const url = `${BASE_CATALOG_URL}/subjects?owner=${encodeURIComponent(
      owner
    )}&lang=${encodeURIComponent(languageCode)}`;
    const data = await fetchWithCache(url, `resources_${owner}_${languageCode}`);

    if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
      // Extract resource identifiers from API response
      const resources = data.data
        .filter((resource) => resource && typeof resource === "string")
        .sort();

      return resources.length > 0 ? resources : fallbackResources;
    }

    return fallbackResources;
  } catch (error) {
    console.warn(
      `Failed to fetch resources for ${owner}/${language} from API, using fallback data:`,
      error
    );
    return fallbackResources;
  }
}

/**
 * Fetches available Bible resources for a specific organization and language
 * @param {string} owner - The organization/owner name
 * @param {string|Object} language - The language ID or language object
 * @returns {Promise<Object[]>} Array of Bible repository objects
 */
export async function fetchBibleResources(owner, language) {
  if (!owner || !language) {
    return [];
  }

  const languageCode = typeof language === "string" ? language : language.code;
  if (!languageCode) {
    return [];
  }

  const fallbackResources = [
    {
      id: "ult",
      name: "ult",
      fullName: "unfoldingWord/en_ult",
      description: "unfoldingWord Literal Text",
      subject: "Aligned Bible",
      repoUrl: "https://git.door43.org/unfoldingWord/en_ult",
      avatarUrl: null,
      owner: null,
    },
    {
      id: "ust",
      name: "ust",
      fullName: "unfoldingWord/en_ust",
      description: "unfoldingWord Simplified Text",
      subject: "Aligned Bible",
      repoUrl: "https://git.door43.org/unfoldingWord/en_ust",
      avatarUrl: null,
      owner: null,
    },
  ];

  try {
    const searchParams = new URLSearchParams({
      owner: owner,
      lang: languageCode,
      subject: "Bible,Aligned Bible", // Filter for Bible subjects only
      limit: "50",
    });

    const url = `https://git.door43.org/api/v1/repos/search?${searchParams}`;
    const data = await fetchWithCache(url, `bible_resources_${owner}_${languageCode}`);

    if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
      // Filter and format Bible resources
      const resources = data.data
        .filter(
          (repo) =>
            repo && repo.name && (repo.subject === "Bible" || repo.subject === "Aligned Bible")
        )
        .map((repo) => {
          // Extract resource ID by removing language prefix
          // Repository names are typically in format "{language}_{resource}" (e.g., "en_ult")
          let resourceId = repo.name;
          const languagePrefixPattern = new RegExp(`^${languageCode}_`);
          if (languagePrefixPattern.test(repo.name)) {
            resourceId = repo.name.replace(languagePrefixPattern, "");
          }

          return {
            id: resourceId, // Use stripped resource ID (e.g., "ult" instead of "en_ult")
            name: repo.name, // Keep full repository name for display
            fullName: repo.full_name,
            description: repo.description || repo.name,
            subject: repo.subject,
            repoUrl: repo.html_url || repo.repo_url,
            avatarUrl: repo.avatar_url || null, // Repository avatar
            owner: repo.owner || null, // Owner information
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      return resources.length > 0 ? resources : fallbackResources;
    }

    return fallbackResources;
  } catch (error) {
    console.warn(`Failed to fetch Bible resources for ${owner}/${languageCode}:`, error);
    return fallbackResources;
  }
}

/**
 * Clears all cached catalog data
 */
export function clearCatalogCache() {
  cache.clear();
}

/**
 * Pre-loads catalog data for better UX
 * @param {string} owner - Optional organization to pre-load
 */
export async function preloadCatalogData(owner = null) {
  try {
    // Always pre-load organizations
    await fetchOrganizations();

    if (owner) {
      // Pre-load languages for specific organization
      await fetchLanguages(owner);
    }
  } catch (error) {
    console.warn("Failed to preload catalog data:", error);
  }
}

/**
 * Search for resources across all organizations by language and subject
 * Uses the catalog search API that doesn't require organization filtering
 * Enhanced with performance optimizations and intelligent caching
 * @param {string} languageCode - The language code to search for
 * @param {string|null} subject - Optional subject filter (e.g., "Bible", "Translation Notes")
 * @param {string} stage - Release stage filter (prod, pre-prod, draft, latest)
 * @returns {Promise<Object>} Grouped results by organization
 */
export const searchResourcesAcrossOrgs = createOptimizedSearch(
  async function _searchResourcesAcrossOrgs(languageCode, subject = null, stage = "prod") {
  if (!languageCode) {
    return {};
  }

  const searchParams = new URLSearchParams({
    metadataType: "rc",
    lang: languageCode,
    stage: stage,
    limit: "100",
  });

  if (subject) {
    searchParams.append("subject", subject);
  }

  const url = `${CATALOG_SEARCH_URL}?${searchParams}`;
  const cacheKey = `cross_org_search_${languageCode}_${subject || "all"}_${stage}`;

  try {
    console.log(`🔍 Searching resources across organizations: ${url}`);
    const data = await fetchWithCache(url, cacheKey);

    // Group results by organization for display
    const groupedResults = {};
    
    // Handle different response structures
    let resourcesArray = null;
    if (data && Array.isArray(data)) {
      // Handle case where data is directly an array
      resourcesArray = data;
    } else if (data && data.data && Array.isArray(data.data)) {
      // Handle case where data is wrapped in a data property
      resourcesArray = data.data;
    }

    if (resourcesArray) {
      resourcesArray.forEach((resource) => {
        // Extract organization from the resource data - handle both string and object owner formats
        let org = "unknown";
        if (typeof resource.owner === 'string') {
          org = resource.owner;
        } else if (resource.owner?.login) {
          org = resource.owner.login;
        } else if (resource.full_name) {
          org = resource.full_name.split("/")[0];
        }
        
        if (!groupedResults[org]) {
          groupedResults[org] = [];
        }

        // Extract resource ID by removing language prefix if present
        let resourceId = resource.name || resource.identifier;
        const languagePrefixPattern = new RegExp(`^${languageCode}_`);
        if (languagePrefixPattern.test(resourceId)) {
          resourceId = resourceId.replace(languagePrefixPattern, "");
        }

        groupedResults[org].push({
          id: resourceId,
          name: resource.name || resource.identifier,
          fullName: resource.full_name,
          description: resource.description || resource.title,
          subject: resource.subject,
          organization: org,
          combinedId: `${org}/${resource.name}`, // Unique identifier
          repoUrl: resource.html_url || resource.repo_url,
          avatarUrl: resource.avatar_url || resource.repo?.avatar_url, // Repository avatar
          stage: resource.stage || stage,
          version: resource.version,
          modified: resource.modified,
          checking: resource.checking,
          // Organization metadata for displaying logos - use repo.owner for full metadata
          organizationData: resource.repo?.owner || (typeof resource.owner === 'object' ? resource.owner : null),
          raw: resource, // Keep raw data for debugging
        });
      });

      // Sort resources within each organization
      Object.keys(groupedResults).forEach((org) => {
        groupedResults[org].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
      });

      console.log(`✅ Found resources from ${Object.keys(groupedResults).length} organizations:`, 
                  Object.keys(groupedResults));
    }

    return groupedResults;
  } catch (error) {
    console.error("Failed to search resources across organizations:", error);
    
    // Fallback: try to get resources from known organizations
    const fallbackOrgs = ["unfoldingWord", "door43-catalog", "STR", "WA"];
    const fallbackResults = {};
    
    for (const org of fallbackOrgs) {
      try {
        const orgResources = await fetchBibleResources(org, languageCode);
        if (orgResources.length > 0) {
          fallbackResults[org] = orgResources.map(r => ({
            ...r,
            organization: org,
            combinedId: `${org}/${r.name}`,
          }));
        }
      } catch (fallbackError) {
        console.warn(`Fallback failed for ${org}:`, fallbackError);
      }
    }
    
    return fallbackResults;
  }
  }, {
    cacheKey: 'cross-org-search',
    debounceDelay: 500,
    enableCache: true,
    enablePreload: true
  }
);

/**
 * Get all available languages across all organizations that have scripture resources
 * @param {boolean} includeOrgInfo - Whether to include organization information for each language
 * @returns {Promise<Object[]>} Array of language objects with optional organization info
 */
export async function fetchAllLanguages(includeOrgInfo = true) {
  const cacheKey = `all_languages_scripture_${includeOrgInfo}`;

  try {
    console.log(`🌐 Fetching all languages with scripture resources...`);
    
    // Use the cross-organization search to find languages with Bible resources
    const searchParams = new URLSearchParams({
      metadataType: "rc",
      subject: "Aligned Bible,Bible", // Comma-separated subjects work with v1 API
      stage: "prod",
      limit: "1000", // Large limit to get all available languages
    });

    const url = `${CATALOG_SEARCH_URL}?${searchParams}`;
    const data = await fetchWithCache(url, cacheKey);

    if (data && data.data && Array.isArray(data.data)) {
      // Deduplicate languages and collect organization info
      const languageMap = new Map();

      data.data.forEach((resource) => {
        // Extract language from resource name or metadata
        let langCode = null;
        
        // Try to extract from resource name (e.g., "en_ult" -> "en")
        if (resource.name && resource.name.includes('_')) {
          const parts = resource.name.split('_');
          if (parts.length >= 2) {
            langCode = parts[0];
          }
        }
        
        // Fallback to lang field if available
        if (!langCode && resource.lang) {
          langCode = resource.lang;
        }
        
        // Skip if we couldn't determine language
        if (!langCode || langCode.length < 2) return;

        // Initialize language entry if not exists
        if (!languageMap.has(langCode)) {
          languageMap.set(langCode, {
            code: langCode,
            name: getLanguageName(langCode), // Use helper function for name
            direction: getLanguageDirection(langCode), // Use helper function for direction
            organizations: includeOrgInfo ? new Set() : null,
            resourceCount: 0,
          });
        }

        const langEntry = languageMap.get(langCode);
        langEntry.resourceCount++;

        // Add organization info if requested and available
        if (includeOrgInfo && resource.owner?.login) {
          langEntry.organizations.add(resource.owner.login);
        } else if (includeOrgInfo && resource.full_name) {
          const org = resource.full_name.split('/')[0];
          if (org) {
            langEntry.organizations.add(org);
          }
        }
      });

      const languages = Array.from(languageMap.values())
        .filter(lang => lang.resourceCount > 0) // Only languages with resources
        .map((lang) => ({
          ...lang,
          organizations: includeOrgInfo && lang.organizations 
            ? Array.from(lang.organizations).sort() 
            : undefined,
          organizationCount: includeOrgInfo && lang.organizations 
            ? lang.organizations.size 
            : undefined,
        }));

      // Sort by name
      languages.sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code));

      console.log(`✅ Found ${languages.length} languages with scripture resources`);
      return languages;
    }

    // Fallback to aggregating from known organizations
    return await fetchLanguagesFromKnownOrgs();
  } catch (error) {
    console.error("Failed to fetch languages with scripture resources:", error);
    return await fetchLanguagesFromKnownOrgs();
  }
}

/**
 * Helper function to get language name from code
 * @param {string} langCode - Language code
 * @returns {string} Language name
 */
function getLanguageName(langCode) {
  const languageNames = {
    'en': 'English',
    'es': 'Spanish', 
    'fr': 'French',
    'de': 'German',
    'pt': 'Portuguese',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'nl': 'Dutch',
    'pl': 'Polish',
    'tr': 'Turkish',
    'vi': 'Vietnamese',
    'th': 'Thai',
    'id': 'Indonesian',
    'ms': 'Malay',
    'sw': 'Swahili',
    'it': 'Italian',
    'he': 'Hebrew',
    'el': 'Greek',
    'la': 'Latin',
    'ur': 'Urdu',
    'bn': 'Bengali',
    'ta': 'Tamil',
    'te': 'Telugu',
    'ml': 'Malayalam',
    'kn': 'Kannada',
    'gu': 'Gujarati',
    'pa': 'Punjabi',
    'or': 'Odia',
    'as': 'Assamese',
    'mr': 'Marathi',
    'ne': 'Nepali',
    'si': 'Sinhala',
    'my': 'Myanmar',
    'km': 'Khmer',
    'lo': 'Lao',
    'ka': 'Georgian',
    'am': 'Amharic',
    'ti': 'Tigrinya',
    'om': 'Oromo',
    'so': 'Somali',
    'rw': 'Kinyarwanda',
    'rn': 'Kirundi',
    'lg': 'Luganda',
    'zu': 'Zulu',
    'xh': 'Xhosa',
    'af': 'Afrikaans',
    'st': 'Sesotho',
    'tn': 'Setswana',
    've': 'Tshivenda',
    'ts': 'Tsonga',
    'ss': 'Swati',
    'nr': 'Ndebele',
    'nso': 'Northern Sotho'
  };
  
  return languageNames[langCode] || langCode.toUpperCase();
}

/**
 * Helper function to get language direction from code
 * @param {string} langCode - Language code
 * @returns {string} Language direction ('ltr' or 'rtl')
 */
function getLanguageDirection(langCode) {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi', 'ji', 'iw', 'ku', 'ps'];
  return rtlLanguages.includes(langCode) ? 'rtl' : 'ltr';
}

/**
 * Fallback method to aggregate languages from known organizations
 * @returns {Promise<Object[]>} Array of language objects
 */
async function fetchLanguagesFromKnownOrgs() {
  const knownOrgs = ["unfoldingWord", "door43-catalog", "STR", "WA"];
  const languageMap = new Map();

  console.log("📋 Falling back to known organizations for language discovery");

  for (const org of knownOrgs) {
    try {
      const orgLanguages = await fetchLanguages(org);
      orgLanguages.forEach((lang) => {
        if (!languageMap.has(lang.code)) {
          languageMap.set(lang.code, {
            code: lang.code,
            name: lang.name,
            direction: lang.direction,
            organizations: new Set(),
          });
        }
        languageMap.get(lang.code).organizations.add(org);
      });
    } catch (error) {
      console.warn(`Failed to fetch languages for ${org}:`, error);
    }
  }

  const languages = Array.from(languageMap.values()).map((lang) => ({
    ...lang,
    organizations: Array.from(lang.organizations).sort(),
    organizationCount: lang.organizations.size,
  }));

  languages.sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code));
  return languages;
}

/**
 * Get resource compatibility information for mixed-organization usage
 * @param {Object[]} resources - Array of resources from potentially different organizations
 * @returns {Object} Compatibility analysis
 */
export function analyzeResourceCompatibility(resources) {
  if (!resources || resources.length === 0) {
    return { 
      compatible: true, 
      warnings: [], 
      organizations: [],
      subjects: [],
      stages: [],
      analysis: {
        multiOrg: false,
        mixedQuality: false,
        resourceTypes: 0
      }
    };
  }

  const organizations = [...new Set(resources.map(r => r.organization))];
  const subjects = [...new Set(resources.map(r => r.subject))];
  const stages = [...new Set(resources.map(r => r.stage))];
  
  const warnings = [];
  
  // Check for mixed organizations
  if (organizations.length > 1) {
    warnings.push({
      type: "mixed_organizations",
      message: `Resources from ${organizations.length} different organizations: ${organizations.join(", ")}`,
      severity: "warning",
      recommendation: "Ensure translation philosophies are compatible"
    });
  }
  
  // Check for mixed stages (quality levels)
  if (stages.length > 1) {
    const hasNonProd = stages.some(stage => stage !== "prod");
    if (hasNonProd) {
      warnings.push({
        type: "mixed_quality",
        message: `Mixed quality levels: ${stages.join(", ")}`,
        severity: "caution",
        recommendation: "Consider using production-quality resources only"
      });
    }
  }
  
  // Check for missing complementary resources
  const hasScripture = subjects.some(s => s?.toLowerCase().includes("bible"));
  const hasNotes = subjects.some(s => s?.toLowerCase().includes("notes"));
  const hasQuestions = subjects.some(s => s?.toLowerCase().includes("questions"));
  
  if (hasScripture && !hasNotes) {
    warnings.push({
      type: "missing_complement",
      message: "Scripture selected but no Translation Notes found",
      severity: "info",
      recommendation: "Consider adding Translation Notes for better context"
    });
  }

  return {
    compatible: warnings.filter(w => w.severity === "error").length === 0,
    warnings,
    organizations,
    subjects,
    stages,
    analysis: {
      multiOrg: organizations.length > 1,
      mixedQuality: stages.length > 1,
      resourceTypes: subjects.length,
    }
  };
}

/**
 * Get enhanced organization information including resource statistics
 * @param {string} orgLogin - Organization login/identifier
 * @returns {Promise<Object|null>} Enhanced organization object
 */
export async function fetchOrganizationDetails(orgLogin) {
  if (!orgLogin) return null;

  const cacheKey = `org_details_${orgLogin}`;
  
  try {
    // Use the organization API endpoint for detailed info
    const url = `https://git.door43.org/api/v1/orgs/${encodeURIComponent(orgLogin)}`;
    const data = await fetchWithCache(url, cacheKey);
    
    if (data) {
      return {
        login: data.username || data.login,
        full_name: data.full_name || data.username || data.login,
        description: data.description,
        avatar_url: data.avatar_url,
        website: data.website,
        location: data.location,
        visibility: data.visibility,
        repo_count: data.repo_count || 0,
        // Enhanced fields from the API response
        repo_languages: data.repo_languages || [],
        repo_subjects: data.repo_subjects || [],
        created: data.created,
        updated: data.updated,
      };
    }
    
    return null;
  } catch (error) {
    console.warn(`Failed to fetch details for organization ${orgLogin}:`, error);
    return null;
  }
}

export default {
  fetchOrganizations,
  fetchLanguages,
  fetchResources,
  fetchBibleResources,
  clearCatalogCache,
  preloadCatalogData,
  searchResourcesAcrossOrgs,
  fetchAllLanguages,
  analyzeResourceCompatibility,
  fetchOrganizationDetails,
};
