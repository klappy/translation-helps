/**
 * ReferenceContext.jsx
 * Context for managing current reference state and organization/language selection
 * Enhanced with cross-organization resource support
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { DEFAULT_REFERENCE } from "../utils/defaultReference";
import { updateQueryFromContext, contextFromQuery } from "../utils/contextHelpers";

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
  const [organization, setOrganization] = useState("Door43-Catalog");
  const [languageId, setLanguageId] = useState("en");
  const [resourceId, setResourceId] = useState("ult");

  // Advanced mode state for cross-organization support
  const [advancedMode, setAdvancedMode] = useState(false);
  const [resourceOrganization, setResourceOrganization] = useState(null);
  
  // Mixed resources state for advanced mode
  const [mixedResources, setMixedResources] = useState({
    scripture: null,
    tn: null,
    tq: null,
    tw: null,
    twl: null
  });

  // Initialization state
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize context from URL on mount - URL is source of truth
  useEffect(() => {
    function syncContextFromUrl() {
      try {
        const urlContext = contextFromQuery();

        if (urlContext && urlContext.hasUrlParams) {
          // Case 2: URI parameters exist - use them exactly, NO defaults
          if (urlContext.organization) setOrganization(urlContext.organization);
          if (urlContext.languageId) setLanguageId(urlContext.languageId);
          if (urlContext.resourceId) setResourceId(urlContext.resourceId);
          if (urlContext.reference && urlContext.reference.bookId) {
            setReference(urlContext.reference);
          }
        } else {
          // Case 1: Fresh open with no URI parameters - use defaults ONLY
          setOrganization("Door43-Catalog");
          setLanguageId("en");
          setResourceId("ult");
          setReference(DEFAULT_REFERENCE);
        }

        setIsInitialized(true);
      } catch (e) {
        console.error("Failed to parse URL context:", e);
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

    // Use the effective organization for URL (resource-specific if available, otherwise global)
    const effectiveOrganization = resourceOrganization || organization;
    
    const context = {
      organization: effectiveOrganization,
      languageId,
      resourceId,
      reference,
    };

    try {
      updateQueryFromContext(context);
    } catch (e) {
      console.error("Failed to update URL from context:", e);
    }
  }, [isInitialized, organization, languageId, resourceId, reference, resourceOrganization]);

  // Update context with backward compatibility
  const updateContext = (updates) => {
    console.log("🔄 ReferenceContext.updateContext called with:", updates);

    if (updates.reference !== undefined) {
      setReference(updates.reference);
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
      // Clear resource organization when language changes since resources may not be available
      if (updates.languageId !== languageId) {
        setResourceOrganization(null);
      }
    }
    if (updates.resourceId !== undefined) {
      setResourceId(updates.resourceId);
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
    }
    
    if (updates.mixedResources !== undefined) {
      setMixedResources(prev => ({
        ...prev,
        ...updates.mixedResources
      }));
    }
  };

  // Helper function to get the effective organization for a resource type
  const getResourceOrganization = (resourceType = 'scripture') => {
    // Always check for resource-specific organization first (not just in advanced mode)
    if (resourceType === 'scripture' && resourceOrganization) {
      return resourceOrganization;
    }
    
    // In advanced mode, also check mixed resources configuration
    if (advancedMode && mixedResources[resourceType]?.organization) {
      return mixedResources[resourceType].organization;
    }
    
    // Fall back to global organization
    return organization;
  };

  // Helper function to get the effective resource ID for a resource type
  const getResourceId = (resourceType = 'scripture') => {
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
  };

  // Helper function to check if we're using mixed organizations
  const isUsingMixedOrganizations = () => {
    if (!advancedMode) return false;
    
    const orgs = new Set();
    orgs.add(getResourceOrganization('scripture'));
    orgs.add(getResourceOrganization('tn'));
    orgs.add(getResourceOrganization('tq'));
    orgs.add(getResourceOrganization('tw'));
    orgs.add(getResourceOrganization('twl'));
    
    return orgs.size > 1;
  };

  // Debug logging for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📍 ReferenceContext state:', {
        reference,
        organization,
        languageId,
        resourceId,
        advancedMode,
        resourceOrganization,
        mixedResources,
        isUsingMixedOrgs: isUsingMixedOrganizations()
      });
    }
  }, [reference, organization, languageId, resourceId, advancedMode, resourceOrganization, mixedResources]);

  const value = {
    // Basic state
    reference,
    organization,
    languageId,
    resourceId,
    updateContext,
    
    // Advanced mode state
    advancedMode,
    resourceOrganization,
    mixedResources,
    
    // Helper functions
    getResourceOrganization,
    getResourceId,
    isUsingMixedOrganizations,
    
    // Backward compatibility - these maintain the existing API
    setReference,
    setOrganization,
    setLanguageId,
    setResourceId,
  };

  return <ReferenceContext.Provider value={value}>{children}</ReferenceContext.Provider>;
}

export { ReferenceContext };
