/**
 * Resources Store - Svelte Port
 * Manages all resource loading and state
 * Replaces React ResourcesContext with Svelte stores
 */

import { writable, derived, get } from 'svelte/store';
import { reference, organization, languageId, resourceId, resourceOrganization, 
         currentResourceData, mixedResources, isInitialized } from './reference.js';
import { loadResourceForType } from '../utils/loadResourceForType.js';

// Resource loading will be implemented with the service layer
// For now, create the store structure

// Core resource data
export const resources = writable({});

// Loading state tracking
export const loadingResources = writable(new Set());

// Active resources (which resources are currently requested)
export const activeResources = writable(new Set(['scripture', 'notes', 'questions']));

// Derived store for easy access to specific resources
export const scripture = derived(
  [resources],
  ([$resources]) => $resources.scripture || null
);

export const notes = derived(
  [resources],
  ([$resources]) => $resources.notes || []
);

export const questions = derived(
  [resources],
  ([$resources]) => $resources.questions || []
);

export const words = derived(
  [resources],
  ([$resources]) => $resources.words || []
);

export const links = derived(
  [resources],
  ([$resources]) => $resources.links || []
);

// Function to activate a resource (equivalent to React's activateResource)
export function activateResource(resourceType) {
  const current = get(activeResources);
  if (!current.has(resourceType)) {
    activeResources.update(set => new Set(set).add(resourceType));
  }
}

// Function to get resource configuration for a specific resource type
function getResourceConfig(resourceType) {
  const $organization = get(organization);
  const $languageId = get(languageId);
  const $resourceId = get(resourceId);
  const $resourceOrganization = get(resourceOrganization);
  const $currentResourceData = get(currentResourceData);
  const $mixedResources = get(mixedResources);
  
  // Check if there's a specific configuration for this resource type
  const mixedResourceConfig = $mixedResources[resourceType];
  
  if (mixedResourceConfig) {
    return {
      organization: mixedResourceConfig.organization || $organization,
      languageId: mixedResourceConfig.languageId || $languageId,
      resourceId: mixedResourceConfig.resourceId || 
                 (resourceType === 'scripture' ? $resourceId : resourceType),
      resourceData: $currentResourceData
    };
  }
  
  // Use global configuration
  return {
    organization: (resourceType === 'scripture' && $resourceOrganization) ? 
                  $resourceOrganization : $organization,
    languageId: $languageId,
    resourceId: resourceType === 'scripture' ? $resourceId : resourceType,
    resourceData: $currentResourceData
  };
}

// Function to load resources using actual service layer
export async function loadResourcesForReference(referenceData, activeResourcesSet) {
  const loadingSet = new Set(Array.from(activeResourcesSet));
  loadingResources.set(loadingSet);
  
  try {
    console.log(`🔄 Resources Store: Loading resources for ${referenceData.bookId} ${referenceData.chapter}:${referenceData.verse}`);
    
    // Reference data is always updated immediately
    resources.update(prev => ({
      ...prev,
      reference: {
        bookId: referenceData.bookId,
        chapter: referenceData.chapter,
        verse: referenceData.verse,
        citation: `${referenceData.bookId} ${referenceData.chapter}:${referenceData.verse}`
      }
    }));
    
    // Load each active resource using the actual service layer
    const loadPromises = Array.from(activeResourcesSet).map(async (resourceType) => {
      try {
        console.log(`🎯 Resources Store: Loading ${resourceType}`);
        
        // Get resource configuration for this specific resource type
        const resourceConfig = getResourceConfig(resourceType);
        
        console.log(`📍 Resources Store: Config for ${resourceType}:`, resourceConfig);
        
        // Use the actual loadResourceForType service
        const resourceData = await loadResourceForType(
          resourceType,
          referenceData,
          resourceConfig
        );
        
        // Update the store with the loaded data
        resources.update(prev => ({
          ...prev,
          [resourceType]: resourceData
        }));
        
        console.log(`✅ Resources Store: Loaded ${resourceType}:`, 
                   Array.isArray(resourceData) ? `${resourceData.length} items` : 
                   typeof resourceData === 'string' ? `${resourceData.length} chars` : 
                   resourceData ? 'loaded' : 'null');
        
        // Remove from loading state
        loadingResources.update(prev => {
          const newSet = new Set(prev);
          newSet.delete(resourceType);
          return newSet;
        });
        
      } catch (error) {
        console.error(`❌ Resources Store: Error loading ${resourceType}:`, error);
        
        // Still remove from loading state and set empty value
        loadingResources.update(prev => {
          const newSet = new Set(prev);
          newSet.delete(resourceType);
          return newSet;
        });
        
        // Set appropriate empty value
        const emptyValue = ['notes', 'questions', 'words', 'links'].includes(resourceType) ? [] : null;
        resources.update(prev => ({
          ...prev,
          [resourceType]: emptyValue
        }));
      }
    });
    
    // Wait for all resources to complete
    await Promise.all(loadPromises);
    
    console.log(`🎉 Resources Store: All resources loaded for ${referenceData.bookId} ${referenceData.chapter}:${referenceData.verse}`);
    
  } catch (error) {
    console.error('❌ Resources Store: Error in loadResourcesForReference:', error);
  } finally {
    // Ensure loading state is cleared
    loadingResources.set(new Set());
  }
}

// Auto-load resources when reference or active resources change
let unsubscribeResourceLoader;

export function initializeResourceLoader() {
  // Clean up any existing subscription
  if (unsubscribeResourceLoader) {
    unsubscribeResourceLoader();
  }
  
  console.log('🚀 Resources Store: Initializing resource loader');
  
  // Subscribe to changes in reference, active resources, and other relevant stores
  unsubscribeResourceLoader = derived(
    [reference, activeResources, organization, languageId, resourceId, 
     resourceOrganization, currentResourceData, mixedResources, isInitialized],
    ([$reference, $activeResources, $organization, $languageId, $resourceId,
      $resourceOrganization, $currentResourceData, $mixedResources, $isInitialized]) => ({
      reference: $reference,
      activeResources: $activeResources,
      organization: $organization,
      languageId: $languageId,
      resourceId: $resourceId,
      resourceOrganization: $resourceOrganization,
      currentResourceData: $currentResourceData,
      mixedResources: $mixedResources,
      isInitialized: $isInitialized
    })
  ).subscribe(async (data) => {
    // Only load resources if initialized and we have a valid reference
    if (!data.isInitialized || !data.reference?.bookId) {
      console.log('📋 Resources Store: Skipping load - not initialized or invalid reference');
      return;
    }
    
    console.log('🔄 Resources Store: Dependencies changed, loading resources...', {
      reference: data.reference,
      activeResources: Array.from(data.activeResources),
      organization: data.organization,
      languageId: data.languageId,
      resourceId: data.resourceId
    });
    
    // Load resources for current reference and active resources
    await loadResourcesForReference(data.reference, data.activeResources);
  });
}

// Cleanup function
export function cleanupResourceLoader() {
  if (unsubscribeResourceLoader) {
    unsubscribeResourceLoader();
    console.log('🧹 Resources Store: Resource loader cleaned up');
  }
}

// Export the complete resources store
export const resourcesStore = {
  // Core stores
  resources,
  loadingResources,
  activeResources,
  
  // Derived stores for easy access
  scripture,
  notes,
  questions,
  words,
  links,
  
  // Functions
  activateResource,
  loadResourcesForReference,
  initializeResourceLoader,
  cleanupResourceLoader
};