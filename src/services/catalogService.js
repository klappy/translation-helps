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

// Promise cache to prevent duplicate simultaneous requests
const pendingRequests = new Map();

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

  // Check if there's already a pending request for this cache key
  if (pendingRequests.has(cacheKey)) {
    console.log(`🔄 Deduplicating request for ${cacheKey} - using existing promise`);
    return await pendingRequests.get(cacheKey);
  }

  // Start performance tracking
  const timerLabel = `fetch:${cacheKey}`;
  performanceTracker.startTimer(timerLabel);

  // Create the request promise
  const requestPromise = (async () => {
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
      // Clean up the pending request
      pendingRequests.delete(cacheKey);
    }
  })();

  // Store the promise to prevent duplicate requests
  pendingRequests.set(cacheKey, requestPromise);

  return await requestPromise;
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
            // Repository metrics for organization priority calculation
            stars_count: repo.stars_count || 0,
            forks_count: repo.forks_count || 0,
            watchers_count: repo.watchers_count || 0,
            size: repo.size || 0,
            open_issues_count: repo.open_issues_count || 0,
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
 * Search for ALL resources across all organizations for a language
 * Uses a single catalog search API call and filters client-side for maximum efficiency
 * @param {string} languageCode - The language code to search for
 * @param {string} stage - Release stage filter (prod, pre-prod, draft, latest)
 * @returns {Promise<Object>} Complete resource data with client-side filtering capabilities
 */
export const searchAllResourcesForLanguage = createOptimizedSearch(
  async function _searchAllResourcesForLanguage(languageCode, stage = "prod") {
    if (!languageCode) {
      return { resources: {}, metadata: {}, bySubject: {} };
    }

    const searchParams = new URLSearchParams({
      metadataType: "rc",
      lang: languageCode,
      stage: stage,
      limit: "200", // Higher limit to get ALL resources
    });

    // NO subject filter - get everything in one call!
    const url = `${CATALOG_SEARCH_URL}?${searchParams}`;
    const cacheKey = `all_resources_${languageCode}_${stage}`;

    try {
      console.log(`🌟 Fetching ALL resources for ${languageCode} in single API call: ${url}`);
      const data = await fetchWithCache(url, cacheKey);

      // Initialize comprehensive result structure
      const comprehensiveResult = {
        resources: {}, // Grouped by organization (backward compatible)
        bySubject: {}, // NEW: Grouped by subject type for easy filtering
        metadata: {
          languages: new Map(),
          organizations: new Map(),
          bookAvailability: new Map(),
          resourceTypesByOrg: new Map(),
          subjectBreakdown: new Map() // NEW: Count by subject
        }
      };

      // Handle different response structures
      let resourcesArray = null;
      if (data && Array.isArray(data)) {
        resourcesArray = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        resourcesArray = data.data;
      }

      if (resourcesArray) {
        // Initialize metadata collections to extract ALL available data
        const { metadata } = comprehensiveResult;

        resourcesArray.forEach((resource) => {
          // Extract organization
          let org = "unknown";
          if (typeof resource.owner === 'string') {
            org = resource.owner;
          } else if (resource.owner?.login) {
            org = resource.owner.login;
          } else if (resource.full_name) {
            org = resource.full_name.split("/")[0];
          }

          // Store organization metadata
          if (resource.repo?.owner && !metadata.organizations.has(org)) {
            metadata.organizations.set(org, {
              login: org,
              avatarUrl: resource.repo.owner.avatar_url,
              htmlUrl: resource.repo.owner.html_url,
              repoLanguages: resource.repo.owner.repo_languages || [],
              repoSubjects: resource.repo.owner.repo_subjects || [],
              description: resource.repo.owner.description,
              fullName: resource.repo.owner.full_name || org,
              resourceCount: 0
            });
          }

          // Increment resource count
          if (metadata.organizations.has(org)) {
            metadata.organizations.get(org).resourceCount++;
          }

          // Store language metadata
          if (resource.language && !metadata.languages.has(resource.language)) {
            metadata.languages.set(resource.language, {
              code: resource.language,
              name: resource.language_title || getLanguageName(resource.language),
              direction: resource.language_direction || getLanguageDirection(resource.language),
              isGateway: resource.language_is_gl || false,
              organizations: new Set()
            });
          }

          // Add organization to language
          if (resource.language && metadata.languages.has(resource.language)) {
            metadata.languages.get(resource.language).organizations.add(org);
          }

          // Track subjects
          const subject = resource.subject || 'Unknown';
          if (!metadata.subjectBreakdown.has(subject)) {
            metadata.subjectBreakdown.set(subject, 0);
          }
          metadata.subjectBreakdown.set(subject, metadata.subjectBreakdown.get(subject) + 1);

          // Store book availability
          const resourceKey = `${org}/${resource.name}`;
          if (resource.books && resource.books.length > 0) {
            metadata.bookAvailability.set(resourceKey, resource.books);
          }

          // Track resource types by organization
          if (!metadata.resourceTypesByOrg.has(org)) {
            metadata.resourceTypesByOrg.set(org, new Set());
          }
          if (resource.subject) {
            metadata.resourceTypesByOrg.get(org).add(resource.subject);
          }

          // Extract resource ID
          let resourceId = resource.name || resource.identifier;
          const languagePrefixPattern = new RegExp(`^${languageCode}_`);
          if (languagePrefixPattern.test(resourceId)) {
            resourceId = resourceId.replace(languagePrefixPattern, "");
          }

          // Create enhanced resource object
          const enhancedResource = {
            id: resourceId,
            name: resource.name || resource.identifier,
            fullName: resource.full_name,
            description: resource.description || resource.title,
            subject: resource.subject,
            organization: org,
            combinedId: `${org}/${resource.name}`,
            repoUrl: resource.html_url || resource.repo_url,
            avatarUrl: resource.avatar_url || resource.repo?.avatar_url,
            stage: resource.stage || stage,
            version: resource.version,
            modified: resource.modified,
            checking: resource.checking,
            organizationData: resource.repo?.owner || (typeof resource.owner === 'object' ? resource.owner : null),
            // Repository metrics for organization priority calculation
            stars_count: resource.repo?.stars_count || 0,
            forks_count: resource.repo?.forks_count || 0,
            watchers_count: resource.repo?.watchers_count || 0,
            size: resource.repo?.size || 0,
            open_issues_count: resource.repo?.open_issues_count || 0,
            // Enhanced data from API payload
            title: resource.title,
            abbreviation: resource.abbreviation,
            flavor: resource.flavor,
            flavorType: resource.flavor_type,
            languageTitle: resource.language_title,
            languageDirection: resource.language_direction,
            languageIsGateway: resource.language_is_gl,
            books: resource.books || [],
            ingredients: resource.ingredients || [],
            isValid: resource.is_valid,
            validationErrorsUrl: resource.validation_errors_url,
            _debug: {
              catalogId: resource.id,
              catalogUrl: resource.url
            }
          };

          // Group by organization (backward compatible)
          if (!comprehensiveResult.resources[org]) {
            comprehensiveResult.resources[org] = [];
          }
          comprehensiveResult.resources[org].push(enhancedResource);

          // NEW: Group by subject for easy filtering
          if (!comprehensiveResult.bySubject[subject]) {
            comprehensiveResult.bySubject[subject] = {};
          }
          if (!comprehensiveResult.bySubject[subject][org]) {
            comprehensiveResult.bySubject[subject][org] = [];
          }
          comprehensiveResult.bySubject[subject][org].push(enhancedResource);
        });

        // Sort resources within each organization and subject
        Object.keys(comprehensiveResult.resources).forEach((org) => {
          comprehensiveResult.resources[org].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
        });

        Object.keys(comprehensiveResult.bySubject).forEach(subject => {
          Object.keys(comprehensiveResult.bySubject[subject]).forEach(org => {
            comprehensiveResult.bySubject[subject][org].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
          });
        });

        // Finalize metadata
        const finalMetadata = {
          languages: Array.from(metadata.languages.values()).map(lang => ({
            ...lang,
            organizations: Array.from(lang.organizations).sort(),
            organizationCount: lang.organizations.size
          })),
          organizations: Array.from(metadata.organizations.values()),
          resourceTypesByOrg: Object.fromEntries(
            Array.from(metadata.resourceTypesByOrg.entries()).map(([org, types]) => [org, Array.from(types).sort()])
          ),
          bookAvailability: Object.fromEntries(metadata.bookAvailability.entries()),
          subjectBreakdown: Object.fromEntries(metadata.subjectBreakdown.entries()),
          searchParams: { languageCode, stage },
          totalResources: Object.values(comprehensiveResult.resources).reduce((sum, resources) => sum + resources.length, 0),
          timestamp: new Date().toISOString()
        };

        console.log(`🌟 Single API call returned ${finalMetadata.totalResources} resources from ${finalMetadata.organizations.length} organizations`);
        console.log(`📊 Subject breakdown:`, finalMetadata.subjectBreakdown);

        return {
          resources: comprehensiveResult.resources,
          bySubject: comprehensiveResult.bySubject,
          metadata: finalMetadata
        };
      }

      // Return empty structure if no resources found
      return {
        resources: {},
        bySubject: {},
        metadata: {
          languages: [],
          organizations: [],
          resourceTypesByOrg: {},
          bookAvailability: {},
          subjectBreakdown: {},
          searchParams: { languageCode, stage },
          totalResources: 0,
          timestamp: new Date().toISOString(),
          error: "No resources found"
        }
      };
    } catch (error) {
      console.error("Failed to search all resources:", error);
      return {
        resources: {},
        bySubject: {},
        metadata: {
          languages: [],
          organizations: [],
          resourceTypesByOrg: {},
          bookAvailability: {},
          subjectBreakdown: {},
          searchParams: { languageCode, stage },
          totalResources: 0,
          timestamp: new Date().toISOString(),
          error: error.message
        }
      };
    }
  }, {
    cacheKey: 'all-resources-single-call',
    debounceDelay: 500,
    enableCache: true,
    enablePreload: true
  }
);

/**
 * Legacy function - now uses the optimized single call with client-side filtering
 * @param {string} languageCode - The language code to search for
 * @param {string|null} subject - Optional subject filter (e.g., "Bible", "Translation Notes")
 * @param {string} stage - Release stage filter (prod, pre-prod, draft, latest)
 * @returns {Promise<Object>} Grouped results by organization
 */
export const searchResourcesAcrossOrgs = createOptimizedSearch(
  async function _searchResourcesAcrossOrgs(languageCode, subject = null, stage = "prod") {
  if (!languageCode) {
    return { resources: {}, metadata: {} };
  }

  // OPTIMIZATION: Use the single API call and filter client-side
  console.log(`🚀 Using optimized single API call for ${languageCode} ${subject ? `(filtering for ${subject})` : '(all resources)'}`);
  
  const allResourcesResult = await searchAllResourcesForLanguage(languageCode, stage);
  
  if (!subject) {
    // Return all resources if no subject filter
    return {
      resources: allResourcesResult.resources,
      metadata: allResourcesResult.metadata
    };
  }

  // Client-side filtering by subject (much faster than separate API calls)
  // Handle comma-separated subjects like "Aligned Bible,Bible"
  const requestedSubjects = subject.split(',').map(s => s.trim());
  const filteredBySubject = {};
  
  // Merge resources from all requested subjects
  requestedSubjects.forEach(requestedSubject => {
    const subjectResources = allResourcesResult.bySubject[requestedSubject] || {};
    Object.entries(subjectResources).forEach(([org, resources]) => {
      if (!filteredBySubject[org]) {
        filteredBySubject[org] = [];
      }
      filteredBySubject[org].push(...resources);
    });
  });
  
  // Remove duplicates within each organization
  Object.keys(filteredBySubject).forEach(org => {
    const seen = new Set();
    filteredBySubject[org] = filteredBySubject[org].filter(resource => {
      const key = `${resource.id || resource.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });
  
  console.log(`🔍 Client-side filtered for "${subject}" (${requestedSubjects.join(', ')}): ${Object.keys(filteredBySubject).length} organizations`);
  
  // Calculate filtered metadata
  const filteredMetadata = {
    ...allResourcesResult.metadata,
    totalResources: Object.values(filteredBySubject).reduce((sum, orgResources) => sum + orgResources.length, 0),
    filteredFor: subject,
    searchParams: { languageCode, subject, stage }
  };

  return {
    resources: filteredBySubject,
    metadata: filteredMetadata
  };

  }, {
    cacheKey: 'cross-org-search-optimized',
    debounceDelay: 500,
    enableCache: true,
    enablePreload: true
  }
);

/**
 * Get all available languages across all organizations that have scripture resources
 * OPTIMIZED: Uses the dedicated languages list endpoint instead of parsing individual resources
 * @param {boolean} includeOrgInfo - Whether to include organization information for each language
 * @returns {Promise<Object[]>} Array of language objects with optional organization info
 */
export async function fetchAllLanguages(includeOrgInfo = true) {
  const cacheKey = `all_languages_scripture_${includeOrgInfo}`;

  try {
    console.log(`🌐 Fetching all languages with scripture resources (OPTIMIZED)...`);
    
    // OPTIMIZATION: Use the dedicated languages list endpoint
    // This is MUCH faster than parsing individual resources
    const searchParams = new URLSearchParams({
      stage: "prod",
      subject: "Bible,Aligned Bible", // Comma-separated subjects
    });

    const url = `https://git.door43.org/api/v1/catalog/list/languages?${searchParams}`;
    const data = await fetchWithCache(url, cacheKey);

    if (data && data.data && Array.isArray(data.data)) {
      console.log(`🚀 Languages API returned ${data.data.length} languages directly`);
      
      // Transform API response to our expected format
      const languages = data.data
        .filter(lang => lang && lang.lc && lang.lc.length >= 2) // Valid language codes only
        .map(lang => {
          const result = {
            code: lang.lc,
            name: lang.ln || lang.ang || lang.lc.toUpperCase(),
            direction: lang.ld || 'ltr',
            // Additional metadata from the API
            anglicizedName: lang.ang,
            isGateway: lang.gw || false,
            countryCodes: lang.cc || [],
            region: lang.lr,
            homeCountry: lang.hc,
            alternatives: lang.alt || [],
            primaryKey: lang.pk
          };

          // Add organization info if requested
          if (includeOrgInfo) {
            // For the languages endpoint, we don't get org-specific data
            // But we can indicate that multiple organizations likely have resources
            result.organizations = ['Multiple']; // Placeholder - real org data would need separate calls
            result.organizationCount = 1; // Placeholder
          }

          return result;
        })
        .sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code));

      console.log(`✅ Found ${languages.length} languages with scripture resources (OPTIMIZED)`);
      return languages;
    }

    // Fallback to the old inefficient method if the optimized endpoint fails
    console.warn('📋 Languages list endpoint failed, falling back to resource parsing method');
    return await fetchAllLanguagesLegacy(includeOrgInfo);
  } catch (error) {
    console.error("Failed to fetch languages with scripture resources (optimized):", error);
    console.warn('📋 Falling back to legacy resource parsing method');
    return await fetchAllLanguagesLegacy(includeOrgInfo);
  }
}

/**
 * Legacy method - kept as fallback for the optimized fetchAllLanguages
 * @param {boolean} includeOrgInfo - Whether to include organization information for each language
 * @returns {Promise<Object[]>} Array of language objects with optional organization info
 */
async function fetchAllLanguagesLegacy(includeOrgInfo = true) {
  const cacheKey = `all_languages_scripture_legacy_${includeOrgInfo}`;

  try {
    console.log(`🌐 Fetching all languages with scripture resources (LEGACY METHOD)...`);
    
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

      console.log(`✅ Found ${languages.length} languages with scripture resources (LEGACY)`);
      return languages;
    }

    // Fallback to aggregating from known organizations
    return await fetchLanguagesFromKnownOrgs();
  } catch (error) {
    console.error("Failed to fetch languages with scripture resources (legacy):", error);
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
  searchAllResourcesForLanguage,
  fetchAllLanguages,
  analyzeResourceCompatibility,
  fetchOrganizationDetails,
};
