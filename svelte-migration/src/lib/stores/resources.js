/**
 * Resources Store - Svelte Port
 * Manages all resource loading and state
 * Replaces React ResourcesContext with Svelte stores
 */

import { writable, derived, get } from 'svelte/store';
import { reference, organization, languageId, resourceId, resourceOrganization, 
         currentResourceData, mixedResources, isInitialized } from './reference.js';

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

// Function to load resources (will be implemented with actual service calls)
export async function loadResourcesForReference(referenceData, activeResourcesSet) {
  const loadingSet = new Set(Array.from(activeResourcesSet));
  loadingResources.set(loadingSet);
  
  try {
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
    
    // For now, simulate loading with empty data
    // TODO: Implement actual resource loading with service layer
    const mockResults = {};
    
    for (const resourceType of activeResourcesSet) {
      if (resourceType === 'scripture') {
        mockResults[resourceType] = ''; // Will be USFM content
      } else {
        mockResults[resourceType] = []; // Will be arrays for notes, questions, etc.
      }
      
      // Remove from loading as each completes
      loadingResources.update(prev => {
        const newSet = new Set(prev);
        newSet.delete(resourceType);
        return newSet;
      });
    }
    
    // Update resources with loaded data
    resources.update(prev => ({ ...prev, ...mockResults }));
    
  } catch (error) {
    console.error('Error loading resources:', error);
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
      return;
    }
    
    // Load resources for current reference and active resources
    await loadResourcesForReference(data.reference, data.activeResources);
  });
}

// Cleanup function
export function cleanupResourceLoader() {
  if (unsubscribeResourceLoader) {
    unsubscribeResourceLoader();
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