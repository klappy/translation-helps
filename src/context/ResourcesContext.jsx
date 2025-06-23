/**
 * ResourcesContext.jsx - Simple Verse-Loading Pattern
 * Unified context for managing all translation resources
 * Follows Simple Verse-Loading Pattern from docs/SIMPLE-VERSE-LOADING-PATTERN.md
 * 
 * TRANSFORMATION: Reduced from 264 lines to ~80 lines
 * PATTERN: Single source of truth with self-activating panels
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useReferenceContext } from "./ReferenceContext";
import { loadResourceForType } from "../utils/loadResourceForType";

const ResourcesContext = createContext();

export const useResourcesContext = () => {
  const context = useContext(ResourcesContext);
  if (!context) {
    throw new Error("useResourcesContext must be used within a ResourcesProvider");
  }
  return context;
};

export function ResourcesProvider({ children }) {
  const { 
    reference, 
    organization, 
    languageId, 
    resourceId,
    resourceOrganization,
    getResourceOrganization,
    getResourceLanguage, 
    getResourceId,
    currentResourceData,
    mixedResources
  } = useReferenceContext();
  const [resources, setResources] = useState({});
  const [loadingResources, setLoadingResources] = useState(new Set());
  
  // Parse URL parameters for initial active resources and configurations
  const [activeResources, setActiveResources] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const resourcesParam = params.get('resources');
    
    if (resourcesParam) {
      // Parse: [/unfoldingWord/en/tn,/unfoldingWord/en/tq,/unfoldingWord/en/tw]
      const resourceMatches = resourcesParam.match(/\/([^\/,\]]+)\/([^\/,\]]+)\/([^\/,\]]+)/g);
      const resourceTypes = resourceMatches ? resourceMatches.map(match => {
        const [, , , type] = match.match(/\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
        // Map URL types to internal types
        return type === 'tn' ? 'notes' : 
               type === 'tq' ? 'questions' : 
               type === 'tw' ? 'words' : 
               type === 'twl' ? 'links' : 
               type;
      }) : [];
      return new Set(['scripture', ...resourceTypes]);
    }
    
    // Default active resources
    return new Set(['scripture', 'notes', 'questions']);
  });
  
  // ANTI-FRAGILE: Load resources independently but in one batch to prevent infinite loops
  useEffect(() => {
    if (!reference?.bookId) {
      setResources({});
      setLoadingResources(new Set());
      return;
    }
    
    const resourcesToLoad = Array.from(activeResources);
    if (resourcesToLoad.length === 0) {
      setLoadingResources(new Set());
      return;
    }
    
    // Mark all resources as loading
    setLoadingResources(new Set(resourcesToLoad));
    
    // Load all resources in parallel but update independently - ANTI-FRAGILE
    Promise.allSettled(
      resourcesToLoad.map(async (type) => {
        try {
          // Calculate config directly from state values
          let resourceOrg, resourceLang, resourceRes;
          
          // For scripture, use the actual selected resource organization
          if (type === 'scripture') {
            resourceOrg = resourceOrganization || organization;
            resourceLang = languageId;
            resourceRes = resourceId;
          } else {
            // For translation helps, start with selected scripture organization
            resourceOrg = resourceOrganization || organization;
            resourceLang = languageId;
            
            // Default resource IDs for translation helps
            if (type === 'notes') resourceRes = 'tn';
            else if (type === 'questions') resourceRes = 'tq';
            else if (type === 'words') resourceRes = 'tw';
            else if (type === 'links') resourceRes = 'twl';
            else resourceRes = type;
          }
          
          // Check mixedResources for overrides (this takes precedence over everything)
          if (mixedResources[type]) {
            resourceOrg = mixedResources[type].organization || resourceOrg;
            resourceLang = mixedResources[type].languageId || resourceLang;
            resourceRes = mixedResources[type].resourceId || resourceRes;
          }
          
          const config = {
            organization: resourceOrg,
            languageId: resourceLang,
            resourceId: resourceRes
          };
          
          // Add resource data if available for scripture
          if (type === 'scripture' && currentResourceData) {
            config.resourceData = currentResourceData;
          }
          
          const result = await loadResourceForType(type, reference, config);
          
          // Update this resource immediately when it loads - ANTI-FRAGILE
          setResources(prev => ({
            ...prev,
            [type]: result,
            reference: {
              bookId: reference.bookId,
              chapter: reference.chapter,
              verse: reference.verse,
              citation: `${reference.bookId} ${reference.chapter}:${reference.verse}`
            }
          }));
          
          // Remove from loading immediately when done
          setLoadingResources(prev => {
            const newSet = new Set(prev);
            newSet.delete(type);
            return newSet;
          });
          
          return { type, result };
          
        } catch (error) {
          // Set failed resource to null immediately - ANTI-FRAGILE
          setResources(prev => ({
            ...prev,
            [type]: null
          }));
          
          // Remove from loading even if failed
          setLoadingResources(prev => {
            const newSet = new Set(prev);
            newSet.delete(type);
            return newSet;
          });
          
          return { type, result: null, error };
        }
      })
    ).then(() => {
      // Final cleanup - ensure loading state is clear
      setLoadingResources(new Set());
    });
  }, [reference?.bookId, reference?.chapter, reference?.verse, activeResources, organization, languageId, resourceId, resourceOrganization, currentResourceData, mixedResources]); // Added resourceOrganization to dependencies
  
  // Panel self-activation: Panels can request resources they need
  const activateResource = useCallback((resourceType) => {
    setActiveResources(prev => {
      // Only trigger update if the resource isn't already active
      if (prev.has(resourceType)) {
        return prev; // No change, won't trigger useEffect
      }
      
      // Activating new resource type
      const newSet = new Set(prev);
      newSet.add(resourceType);
      return newSet;
    });
  }, []); // Empty dependency array to prevent recreation
  
      return (
      <ResourcesContext.Provider value={{ 
        resources, 
        activateResource, 
        loadingResources 
      }}>
        {children}
      </ResourcesContext.Provider>
    );
}

// Legacy exports for compatibility during transition
export const useResourcesData = () => {
  console.warn('useResourcesData is deprecated. Use useResourcesContext instead.');
  const { resources } = useResourcesContext();
  return {
    resources: {
      scripture: resources.scripture,
      translationNotes: resources.notes || [],
      translationQuestions: resources.questions || [],
      translationWords: resources.words || [],
      translationWordLinks: resources.links || [],
    }
  };
};

export const useAutoLoadResources = () => {
  console.warn('useAutoLoadResources is deprecated. Resources now load automatically.');
  return { loadResources: () => Promise.resolve() };
};
