/**
 * Reference Store - Svelte Port
 * Manages current reference state and organization/language selection
 * Replaces React ReferenceContext with Svelte stores
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

// Default reference
const DEFAULT_REFERENCE = {
  bookId: 'gen',
  chapter: 1,
  verse: 1
};

// Basic reference state
export const reference = writable(DEFAULT_REFERENCE);
export const organization = writable('unfoldingWord');
export const languageId = writable('en');
export const resourceId = writable('ult');

// Advanced mode and cross-organization support
export const advancedMode = writable(false);
export const resourceOrganization = writable(null);
export const currentResourceData = writable(null);

// New format arrays for resources
export const scriptures = writable([]);
export const resources = writable([]);

// Mixed resources for backward compatibility
export const mixedResources = writable({
  scripture: null,
  tn: null,
  tq: null,
  tw: null,
  twl: null
});

// Resource availability tracking
export const resourceAvailability = writable({
  tn: {},
  tq: {},
  tw: {},
  twl: {}
});

export const primaryOrganization = writable(null);
export const isInitialized = writable(false);

// Derived stores for commonly needed values
export const currentReference = derived(
  [reference],
  ([$reference]) => $reference
);

export const currentScripture = derived(
  [scriptures, organization, languageId, resourceId, reference],
  ([$scriptures, $organization, $languageId, $resourceId, $reference]) => {
    if ($scriptures.length > 0) {
      return $scriptures[0]; // Primary scripture
    }
    // Build default scripture path
    return `/${$organization}/${$languageId}/${$resourceId}/${$reference.bookId}/${$reference.chapter}/${$reference.verse}`;
  }
);

// URL parameter parsing and context helpers
function parseURLParameters() {
  if (!browser) return null;
  
  const params = new URLSearchParams(window.location.search);
  const scripturesParam = params.get('scriptures');
  const resourcesParam = params.get('resources');
  
  const context = {
    hasUrlParams: false,
    isNewFormat: false,
    scriptures: [],
    resources: [],
    reference: DEFAULT_REFERENCE,
    organization: 'unfoldingWord',
    languageId: 'en',
    resourceId: 'ult'
  };
  
  if (scripturesParam || resourcesParam) {
    context.hasUrlParams = true;
    context.isNewFormat = true;
    
    // Parse scriptures parameter: [/unfoldingWord/en/ult/gen/1/1]
    if (scripturesParam) {
      const scriptureMatch = scripturesParam.match(/\[([^\]]+)\]/);
      if (scriptureMatch) {
        context.scriptures = [scriptureMatch[1]];
        
        // Extract reference from scripture path
        const parts = scriptureMatch[1].split('/').filter(Boolean);
        if (parts.length >= 6) {
          context.organization = parts[0];
          context.languageId = parts[1];
          context.resourceId = parts[2];
          context.reference = {
            bookId: parts[3],
            chapter: parseInt(parts[4]),
            verse: parseInt(parts[5])
          };
        }
      }
    }
    
    // Parse resources parameter: [/unfoldingWord/en/tn,/unfoldingWord/en/tq]
    if (resourcesParam) {
      const resourceMatches = resourcesParam.match(/\[([^\]]+)\]/);
      if (resourceMatches) {
        context.resources = resourceMatches[1].split(',').map(r => r.trim());
      }
    }
  }
  
  return context;
}

function updateURL(contextData) {
  if (!browser) return;
  
  const params = new URLSearchParams();
  
  // Use new format with scriptures and resources arrays
  if (contextData.scriptures && contextData.scriptures.length > 0) {
    params.set('scriptures', `[${contextData.scriptures[0]}]`);
  }
  
  if (contextData.resources && contextData.resources.length > 0) {
    params.set('resources', `[${contextData.resources.join(',')}]`);
  }
  
  const newURL = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newURL);
}

// Initialize from URL on browser load
export function initializeFromURL() {
  if (!browser) return;
  
  const urlContext = parseURLParameters();
  
  if (urlContext && urlContext.hasUrlParams) {
    // Apply URL context to stores
    if (urlContext.reference) reference.set(urlContext.reference);
    if (urlContext.organization) organization.set(urlContext.organization);
    if (urlContext.languageId) languageId.set(urlContext.languageId);
    if (urlContext.resourceId) resourceId.set(urlContext.resourceId);
    if (urlContext.scriptures) scriptures.set(urlContext.scriptures);
    if (urlContext.resources) resources.set(urlContext.resources);
    
    // Convert resources to mixedResources for backward compatibility
    const newMixedResources = { scripture: null, tn: null, tq: null, tw: null, twl: null };
    urlContext.resources.forEach(resourcePath => {
      const parts = resourcePath.split('/').filter(Boolean);
      if (parts.length >= 3) {
        const resourceType = parts[2];
        if (['tn', 'tq', 'tw', 'twl'].includes(resourceType)) {
          newMixedResources[resourceType] = {
            organization: parts[0],
            languageId: parts[1],
            resourceId: parts[2]
          };
        }
      }
    });
    mixedResources.set(newMixedResources);
  } else {
    // Set defaults and create scripture path
    const defaultScripture = `/unfoldingWord/en/ult/${DEFAULT_REFERENCE.bookId}/${DEFAULT_REFERENCE.chapter}/${DEFAULT_REFERENCE.verse}`;
    scriptures.set([defaultScripture]);
    resources.set([]);
  }
  
  isInitialized.set(true);
}

// Update context function - main API for updating reference state
export function updateContext(updates) {
  const stores = {
    reference: get(reference),
    organization: get(organization),
    languageId: get(languageId),
    resourceId: get(resourceId),
    scriptures: get(scriptures),
    resources: get(resources),
    mixedResources: get(mixedResources)
  };
  
  let needsURLUpdate = false;
  
  if (updates.reference !== undefined) {
    reference.set(updates.reference);
    needsURLUpdate = true;
    
    // Update scriptures array with new reference
    const currentScriptures = get(scriptures);
    if (currentScriptures.length > 0) {
      const parts = currentScriptures[0].split('/').filter(Boolean);
      if (parts.length >= 6) {
        const newScripturePath = `/${parts[0]}/${parts[1]}/${parts[2]}/${updates.reference.bookId}/${updates.reference.chapter}/${updates.reference.verse}`;
        scriptures.set([newScripturePath]);
      }
    }
  }
  
  if (updates.organization !== undefined) {
    organization.set(updates.organization);
    needsURLUpdate = true;
  }
  
  if (updates.languageId !== undefined) {
    languageId.set(updates.languageId);
    needsURLUpdate = true;
    // Clear resource data when language changes
    currentResourceData.set(null);
  }
  
  if (updates.resourceId !== undefined) {
    resourceId.set(updates.resourceId);
    needsURLUpdate = true;
    // Clear resource data when resource changes
    currentResourceData.set(null);
  }
  
  if (updates.scriptures !== undefined) {
    scriptures.set(updates.scriptures);
    needsURLUpdate = true;
  }
  
  if (updates.resources !== undefined) {
    resources.set(updates.resources);
    needsURLUpdate = true;
  }
  
  if (updates.mixedResources !== undefined) {
    const current = get(mixedResources);
    mixedResources.set({ ...current, ...updates.mixedResources });
  }
  
  if (updates.resourceOrganization !== undefined) {
    resourceOrganization.set(updates.resourceOrganization);
  }
  
  if (updates.currentResourceData !== undefined) {
    currentResourceData.set(updates.currentResourceData);
  }
  
  if (updates.advancedMode !== undefined) {
    advancedMode.set(updates.advancedMode);
  }
  
  // Update URL if needed
  if (needsURLUpdate) {
    const currentStores = {
      scriptures: get(scriptures),
      resources: get(resources)
    };
    updateURL(currentStores);
  }
}

// Helper function to get resource organization
export function getResourceOrganization(resourceType = 'scripture') {
  const resourceFromArray = getResourceFromArray(resourceType);
  if (resourceFromArray?.organization) {
    return resourceFromArray.organization;
  }
  
  const $resourceOrganization = get(resourceOrganization);
  if (resourceType === 'scripture' && $resourceOrganization) {
    return $resourceOrganization;
  }
  
  const $mixedResources = get(mixedResources);
  if ($mixedResources[resourceType]?.organization) {
    return $mixedResources[resourceType].organization;
  }
  
  return get(organization);
}

// Helper function to get resource from arrays
function getResourceFromArray(resourceType) {
  const $resources = get(resources);
  const $scriptures = get(scriptures);
  
  // Check resources array
  const resourcePath = $resources.find(r => typeof r === 'string' && r.includes(`/${resourceType}/`));
  if (resourcePath) {
    const parts = resourcePath.split('/').filter(Boolean);
    if (parts.length >= 3) {
      return {
        organization: parts[0],
        languageId: parts[1],
        resourceId: parts[2]
      };
    }
  }
  
  // Check scriptures array for scripture type
  if (resourceType === 'scripture' && $scriptures.length > 0) {
    const scripturePath = $scriptures[0];
    if (typeof scripturePath === 'string') {
      const parts = scripturePath.split('/').filter(Boolean);
      if (parts.length >= 3) {
        return {
          organization: parts[0],
          languageId: parts[1],
          resourceId: parts[2]
        };
      }
    }
  }
  
  return null;
}

// Export the complete reference store
export const referenceStore = {
  // Core stores
  reference,
  organization,
  languageId,
  resourceId,
  
  // Advanced features
  advancedMode,
  resourceOrganization,
  currentResourceData,
  
  // Resource arrays
  scriptures,
  resources,
  mixedResources,
  
  // Metadata
  resourceAvailability,
  primaryOrganization,
  isInitialized,
  
  // Derived stores
  currentReference,
  currentScripture,
  
  // Functions
  initializeFromURL,
  updateContext,
  getResourceOrganization
};