/**
 * ReferenceContext.jsx
 * Context for managing current reference state and organization/language selection
 * Enhanced with cross-organization resource support and new URL format
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { DEFAULT_REFERENCE } from "../utils/defaultReference";
import { updateQueryFromContext, contextFromQuery, buildResourcePath } from "../utils/contextHelpers";
import logger from '../utils/logger';
import { searchResourcesAcrossOrgs } from "../services/catalogService";
// Event bus removed - using direct ref access in ResourcesContext

const ReferenceContext = createContext();

export const useReferenceContext = () => {
  const context = useContext(ReferenceContext);
  if (!context) {
    throw new Error("useReferenceContext must be used within a ReferenceProvider");
  }
  return context;
};

export function ReferenceProvider({ children }) {
  // Basic reference state
  const [reference, setReference] = useState(DEFAULT_REFERENCE);
  const [organization, setOrganization] = useState("unfoldingWord");
  const [languageId, setLanguageId] = useState("en");
  const [resourceId, setResourceId] = useState("ult");

  // New format: scriptures and resources arrays
  const [scriptures, setScriptures] = useState([]);
  const [resources, setResources] = useState([]);

  // Advanced mode state for cross-organization support
  const [advancedMode, setAdvancedMode] = useState(false);
  const [resourceOrganization, setResourceOrganization] = useState(null);
  
  // Resource data from search API - contains books list and metadata
  const [currentResourceData, setCurrentResourceData] = useState(null);
  
  // Mixed resources state for cross-organization support (legacy compatibility)
  const [mixedResources, setMixedResources] = useState({
    scripture: null,
    tn: null,
    tq: null,
    tw: null,
    twl: null
  });

  // Resource availability and primary organization preference
  const [resourceAvailability, setResourceAvailability] = useState({
    tn: {},
    tq: {},
    tw: {},
    twl: {}
  });
  const [primaryOrganization, setPrimaryOrganization] = useState(null);

  // Initialization state
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize context from URL on mount - URL is source of truth
  useEffect(() => {
    function syncContextFromUrl() {
      try {
        const urlContext = contextFromQuery();
        // Parsing URL context

        if (urlContext && urlContext.hasUrlParams) {
          if (urlContext.isNewFormat) {
            // New format: scriptures/resources arrays
            // Using new URL format
            setScriptures(urlContext.scriptures || []);
            setResources(urlContext.resources || []);
            
            // Set legacy compatibility values from primary scripture
            if (urlContext.organization) setOrganization(urlContext.organization);
            if (urlContext.languageId) setLanguageId(urlContext.languageId);
            if (urlContext.resourceId) setResourceId(urlContext.resourceId);
            if (urlContext.reference && urlContext.reference.bookId) {
              setReference(urlContext.reference);
            }
            
            // Convert resources array to mixedResources for backward compatibility
            const newMixedResources = { scripture: null, tn: null, tq: null, tw: null, twl: null };
            urlContext.resources.forEach(resource => {
              if (resource.resourceId && ['tn', 'tq', 'tw', 'twl'].includes(resource.resourceId)) {
                newMixedResources[resource.resourceId] = {
                  organization: resource.organization,
                  languageId: resource.languageId,
                  resourceId: resource.resourceId
                };
              }
            });
            setMixedResources(newMixedResources);
            
          } else {
            // Legacy format: owner & rc parameters
            // Using legacy URL format
            if (urlContext.organization) setOrganization(urlContext.organization);
            if (urlContext.languageId) setLanguageId(urlContext.languageId);
            if (urlContext.resourceId) setResourceId(urlContext.resourceId);
            if (urlContext.reference && urlContext.reference.bookId) {
              setReference(urlContext.reference);
            }
            
            // Convert legacy to new format
            if (urlContext.organization && urlContext.languageId && urlContext.resourceId) {
              const primaryScripture = buildResourcePath({
                organization: urlContext.organization,
                languageId: urlContext.languageId,
                resourceId: urlContext.resourceId,
                bookId: urlContext.reference?.bookId,
                chapter: urlContext.reference?.chapter,
                verse: urlContext.reference?.verse
              }, true);
              
              setScriptures([primaryScripture]);
            }
          }
          
          // URL context applied successfully
        } else {
          // Case 1: Fresh open with no URI parameters - use defaults and create new format
          const defaultOrg = "unfoldingWord";
          const defaultLang = "en";
          const defaultResource = "ult";
          const defaultRef = DEFAULT_REFERENCE;
          
          setOrganization(defaultOrg);
          setLanguageId(defaultLang);
          setResourceId(defaultResource);
          setReference(defaultRef);
          
          // Create default scripture path for new format
          const defaultScripture = buildResourcePath({
            organization: defaultOrg,
            languageId: defaultLang,
            resourceId: defaultResource,
            bookId: defaultRef.bookId,
            chapter: defaultRef.chapter,
            verse: defaultRef.verse
          }, true);
          
          setScriptures([defaultScripture]);
          setResources([]);
          // Using default context with new format
        }

        setIsInitialized(true);
      } catch (e) {
        logger.error("Failed to parse URL context:", e);
        setIsInitialized(true);
      }
    }

    // Initial load
    syncContextFromUrl();

    // Listen for URL changes (popstate for browser navigation, hashchange for SPA routing)
    window.addEventListener("popstate", syncContextFromUrl);
    window.addEventListener("hashchange", syncContextFromUrl);

    return () => {
      window.removeEventListener("popstate", syncContextFromUrl);
      window.removeEventListener("hashchange", syncContextFromUrl);
    };
  }, []);

  // Update URL only after initialization and when context changes due to user action
  useEffect(() => {
    if (!isInitialized) return; // Don't update URL during initialization

    // Determine which format to use based on current state
    const hasNewFormatData = scriptures.length > 0 || resources.length > 0;
    
    if (hasNewFormatData) {
      // Use new format
      const context = {
        reference,
        scriptures,
        resources
      };
      updateQueryFromContext(context);
    } else {
      // Use legacy format
      const effectiveOrganization = resourceOrganization || organization;
      const context = {
        organization: effectiveOrganization,
        languageId,
        resourceId,
        reference,
      };
      updateQueryFromContext(context);
    }
  }, [isInitialized, organization, languageId, resourceId, reference, resourceOrganization, scriptures, resources, mixedResources]);

  // Auto-fetch resource data when we have URL parameters or when resource changes
  useEffect(() => {
    async function fetchResourceDataForUrl() {
      // Only fetch if we're initialized and have required params
      if (!isInitialized || !languageId || !resourceId) {
        return;
      }
      
      // Check if we need to fetch new data (resource changed or no data)
      const needsNewData = !currentResourceData || 
        (currentResourceData.id !== resourceId) ||
        (currentResourceData.languageId !== languageId);
      
      if (!needsNewData) {
        return;
      }

      try {
        const targetOrg = resourceOrganization || organization;
        console.warn(`🔍 ReferenceContext: Fetching resource metadata for ${targetOrg}/${languageId}/${resourceId}`);
        
        // Fetch all resources for this language to find the specific resource
        const result = await searchResourcesAcrossOrgs(languageId, 'Aligned Bible,Bible');
        const { resources } = result;

        // Find the specific resource ONLY in the user's selected organization
        let foundResource = null;
        
        if (resources[targetOrg]) {
          foundResource = resources[targetOrg].find(res => res.id === resourceId);
          if (foundResource) {
            console.warn(`✅ ReferenceContext: Found ${resourceId} metadata in ${targetOrg}`);
            
            // Ensure the resource data has the correct languageId for comparison
            const enrichedResourceData = {
              ...foundResource,
              languageId: foundResource.languageId || languageId,
              organization: targetOrg // Make sure organization is correctly set
            };
            
            setCurrentResourceData(enrichedResourceData);
          } else {
            console.error(`❌ ReferenceContext: Resource ${resourceId} NOT found in ${targetOrg}`);
            console.warn(`Available resources in ${targetOrg}:`, resources[targetOrg]?.map(r => r.id) || 'none');
            // Clear currentResourceData so it doesn't show wrong organization
            setCurrentResourceData(null);
          }
        } else {
          console.error(`❌ ReferenceContext: Organization ${targetOrg} not found in search results`);
          console.warn(`Available organizations:`, Object.keys(resources));
          setCurrentResourceData(null);
        }
      } catch (error) {
        console.error('❌ ReferenceContext: Failed to fetch resource metadata:', error);
        setCurrentResourceData(null);
      }
    }

    fetchResourceDataForUrl();
  }, [isInitialized, languageId, resourceId, organization, resourceOrganization]);

  // Helper function to update a specific resource in the resources array
  const updateResourceInArray = (resourceType, resourceData) => {
    setResources(prev => {
      // Filter out existing resource of this type (only check strings)
      const filtered = prev.filter(r => typeof r === 'string' && !r.includes(`/${resourceType}/`));
      if (resourceData) {
        const resourcePath = buildResourcePath(resourceData, false);
        return [...filtered, resourcePath];
      }
      return filtered;
    });
    
    // Also update mixedResources for backward compatibility
    setMixedResources(prev => ({
      ...prev,
      [resourceType]: resourceData
    }));
  };

  // Helper function to get resource data for a specific type from arrays
  const getResourceFromArray = useCallback((resourceType) => {
    // Check resources array first (contains string paths)
    const resourcePath = resources.find(r => typeof r === 'string' && r.includes(`/${resourceType}/`));
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
    
    // Check scriptures array for scripture type (contains string paths)
    if (resourceType === 'scripture' && scriptures.length > 0) {
      const scripturePath = scriptures[0]; // Primary scripture
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
    
    // Fall back to mixedResources
    return mixedResources[resourceType];
  }, [resources, scriptures, mixedResources]);

  // Update context with backward compatibility
  const updateContext = (updates) => {

    if (updates.reference !== undefined) {
      console.log('🔄 ReferenceContext: Updating reference from', reference, 'to', updates.reference);
      setReference(updates.reference);
      
      // CRITICAL FIX: Update scriptures array when reference changes
      // This ensures URL stays in sync with the reference
      if (scriptures.length > 0) {
        const updatedScriptures = scriptures.map(scripture => {
          // Update the primary scripture (first one) with new reference
          if (scripture === scriptures[0]) {
            const newScripturePath = buildResourcePath({
              organization,
              languageId,
              resourceId,
              bookId: updates.reference.bookId,
              chapter: updates.reference.chapter,
              verse: updates.reference.verse
            }, true);
            console.log('🔄 ReferenceContext: Updating scripture path from', scripture, 'to', newScripturePath);
            return newScripturePath;
          }
          return scripture;
        });
        setScriptures(updatedScriptures);
        console.log('✅ ReferenceContext: Updated scriptures array for URL sync');
      }
      
      // Event emission removed - ResourcesContext handles reference changes directly
    }
    if (updates.organization !== undefined) {
      setOrganization(updates.organization);
      // In basic mode, clear resource-specific organization when global org changes
      if (!advancedMode) {
        setResourceOrganization(null);
      }
    }
    if (updates.languageId !== undefined) {
      setLanguageId(updates.languageId);
      // Clear resource organization and data when language changes since resources may not be available
      if (updates.languageId !== languageId) {
        setResourceOrganization(null);
        setCurrentResourceData(null);
      }
    }
    if (updates.resourceId !== undefined) {
      setResourceId(updates.resourceId);
      // Clear resource data when resource changes to trigger re-fetch
      if (updates.resourceId !== resourceId) {
        setCurrentResourceData(null);
      }
    }
    
    // Advanced mode specific updates
    if (updates.advancedMode !== undefined) {
      setAdvancedMode(updates.advancedMode);
      
      // When switching to basic mode, clear advanced mode state
      if (!updates.advancedMode) {
        setResourceOrganization(null);
        setMixedResources({
          scripture: null,
          tn: null,
          tq: null,
          tw: null,
          twl: null
        });
      }
    }
    
    if (updates.resourceOrganization !== undefined) {
      setResourceOrganization(updates.resourceOrganization);
      
      // CRITICAL FIX: Update scriptures array when resourceOrganization changes
      // This ensures the scripture switches to the new organization
      if (scriptures.length > 0) {
        const updatedScriptures = scriptures.map(scripture => {
          // Update the primary scripture (first one) with new organization
          if (scripture === scriptures[0]) {
            const newScripturePath = buildResourcePath({
              organization: updates.resourceOrganization, // Use new organization
              languageId,
              resourceId,
              bookId: reference.bookId,
              chapter: reference.chapter,
              verse: reference.verse
            }, true);
            console.log('🔄 ReferenceContext: Updating scripture organization from', scripture, 'to', newScripturePath);
            return newScripturePath;
          }
          return scripture;
        });
        setScriptures(updatedScriptures);
        console.log('✅ ReferenceContext: Updated scriptures array for organization change');
      }
    }
    
    if (updates.currentResourceData !== undefined) {
      setCurrentResourceData(updates.currentResourceData);
    }
    
    if (updates.mixedResources !== undefined) {
      const newMixedResources = {
        ...mixedResources,
        ...updates.mixedResources
      };
      setMixedResources(newMixedResources);
      
      // Update resources array to match
      Object.entries(updates.mixedResources).forEach(([resourceType, resourceData]) => {
        if (resourceData && ['tn', 'tq', 'tw', 'twl'].includes(resourceType)) {
          updateResourceInArray(resourceType, resourceData);
        }
      });
    }
    
    if (updates.resourceAvailability !== undefined) {
      setResourceAvailability(prev => ({
        ...prev,
        ...updates.resourceAvailability
      }));
    }
    
    if (updates.primaryOrganization !== undefined) {
      setPrimaryOrganization(updates.primaryOrganization);
    }
    
    // New format updates
    if (updates.scriptures !== undefined) {
      setScriptures(updates.scriptures);
    }
    
    if (updates.resources !== undefined) {
      setResources(updates.resources);
    }
  };

  // Helper function to get the effective organization for a resource type
  const getResourceOrganization = useCallback((resourceType = 'scripture') => {
    // Check new format first
    const resourceFromArray = getResourceFromArray(resourceType);
    if (resourceFromArray?.organization) {
      return resourceFromArray.organization;
    }
    
    // Always check for resource-specific organization first (not just in advanced mode)
    if (resourceType === 'scripture' && resourceOrganization) {
      return resourceOrganization;
    }
    
    // Check mixed resources configuration for all resource types (not just in advanced mode)
    // This enables automatic cross-organization discovery for translation helps
    if (mixedResources[resourceType]?.organization) {
      return mixedResources[resourceType].organization;
    }
    
    // Fall back to global organization
    return organization;
  }, [organization, resourceOrganization, mixedResources, resources, scriptures]);

  // Helper function to get the effective language for a resource type
  const getResourceLanguage = useCallback((resourceType = 'scripture') => {
    // Check new format first
    const resourceFromArray = getResourceFromArray(resourceType);
    if (resourceFromArray?.languageId) {
      return resourceFromArray.languageId;
    }
    
    // Check mixed resources configuration for resource-specific language
    if (mixedResources[resourceType]?.languageId) {
      return mixedResources[resourceType].languageId;
    }
    
    // Fall back to global language
    return languageId;
  }, [languageId, mixedResources, resources, scriptures]);

  // Helper function to get the effective resource ID for a resource type
  const getResourceId = useCallback((resourceType = 'scripture') => {
    // Check new format first
    const resourceFromArray = getResourceFromArray(resourceType);
    if (resourceFromArray?.resourceId) {
      return resourceFromArray.resourceId;
    }
    
    if (advancedMode && mixedResources[resourceType]?.resourceId) {
      return mixedResources[resourceType].resourceId;
    }
    
    // Default resource IDs for different types
    const defaultResourceIds = {
      scripture: resourceId,
      tn: 'tn',
      tq: 'tq', 
      tw: 'tw',
      twl: 'twl'
    };
    
    return defaultResourceIds[resourceType] || resourceId;
  }, [resourceId, advancedMode, mixedResources, resources, scriptures]);

  // Helper function to check if we're using mixed organizations
  const isUsingMixedOrganizations = () => {
    if (!advancedMode && resources.length === 0) return false;
    
    const orgs = new Set();
    orgs.add(getResourceOrganization('scripture'));
    orgs.add(getResourceOrganization('tn'));
    orgs.add(getResourceOrganization('tq'));
    orgs.add(getResourceOrganization('tw'));
    orgs.add(getResourceOrganization('twl'));
    
    return orgs.size > 1;
  };

  const value = {
    // Basic state
    reference,
    organization,
    languageId,
    resourceId,
    updateContext,
    
    // New format state
    scriptures,
    resources,
    updateResourceInArray,
    getResourceFromArray,
    
    // Advanced mode state
    advancedMode,
    resourceOrganization,
    currentResourceData,
    mixedResources,
    
    // Resource discovery state
    resourceAvailability,
    primaryOrganization,
    
    // Helper functions
    getResourceOrganization,
    getResourceLanguage,
    getResourceId,
    isUsingMixedOrganizations,
    
    // Backward compatibility - these maintain the existing API
    setReference,
    setOrganization,
    setLanguageId,
    setResourceId,
  };

  // Expose context to window for testing in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Expose context to window for testing
      window.ReferenceContext = value;
    }
  }, [value]);

  return <ReferenceContext.Provider value={value}>{children}</ReferenceContext.Provider>;
}

export { ReferenceContext };
