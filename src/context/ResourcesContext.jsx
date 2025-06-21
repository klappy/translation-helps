/**
 * ResourcesContext.jsx - Simple Verse-Loading Pattern
 * Unified context for managing all translation resources
 * Follows Simple Verse-Loading Pattern from docs/SIMPLE-VERSE-LOADING-PATTERN.md
 * 
 * TRANSFORMATION: Reduced from 264 lines to ~80 lines
 * PATTERN: Single source of truth with self-activating panels
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  const { reference, organization, languageId, resourceId } = useReferenceContext();
  const [resources, setResources] = useState({});
  
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
  
  // Parse URL for resource configurations (cross-organization support)
  const [resourceConfigs, setResourceConfigs] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const configs = { 
      scripture: { organization: 'unfoldingWord', languageId: 'en', resourceId: 'ult' } 
    };
    
    // Parse scriptures parameter: [/unfoldingWord/en/ult/tit/1/1]
    const scripturesParam = params.get('scriptures');
    if (scripturesParam) {
      const scriptureMatch = scripturesParam.match(/\[\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(\d+)\/(\d+)\]/);
      if (scriptureMatch) {
        const [, org, lang, resource] = scriptureMatch;
        configs.scripture = { organization: org, languageId: lang, resourceId: resource };
      }
    }
    
    // Parse resources parameter: [/unfoldingWord/en/tn,/unfoldingWord/en/tq]
    const resourcesParam = params.get('resources');
    if (resourcesParam) {
      const resourceMatches = resourcesParam.match(/\/([^\/,\]]+)\/([^\/,\]]+)\/([^\/,\]]+)/g);
      if (resourceMatches) {
        resourceMatches.forEach(match => {
          const [, org, lang, type] = match.match(/\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
          // Map URL types to internal types and store configs
          const resourceType = type === 'tn' ? 'notes' : 
                              type === 'tq' ? 'questions' : 
                              type === 'tw' ? 'words' : 
                              type === 'twl' ? 'links' : 
                              type;
          configs[resourceType] = { organization: org, languageId: lang };
        });
      }
    } else {
      // Default resource configs
      configs.notes = { organization: 'unfoldingWord', languageId: 'en' };
      configs.questions = { organization: 'unfoldingWord', languageId: 'en' };
    }
    
    return configs;
  });
  
  // Single useEffect - loads ONLY active resources for current verse
  useEffect(() => {
    if (!reference?.bookId || !reference?.chapter || !reference?.verse) {
      console.log('🎯 ResourcesContext: No reference, skipping load');
      return;
    }
    
    console.log(`🎯 ResourcesContext: Loading resources for ${reference.bookId} ${reference.chapter}:${reference.verse}`);
    console.log(`🎯 Active resources:`, Array.from(activeResources));
    
    const resourcesToLoad = Array.from(activeResources);
    
    // Load resources with simple config - let services handle their own complexity
    Promise.allSettled(
      resourcesToLoad.map(type => {
        const config = resourceConfigs[type] || { organization: 'unfoldingWord', languageId: 'en' };
        console.log(`🎯 Loading ${type} with config:`, config);
        return loadResourceForType(type, reference, config);
      })
    ).then(results => {
      const newResources = {};
      
      resourcesToLoad.forEach((type, index) => {
        const result = results[index];
        if (result.status === 'fulfilled') {
          newResources[type] = result.value;
          console.log(`✅ ${type} loaded:`, result.value ? 'Success' : 'Empty');
        } else {
          newResources[type] = null;
          console.error(`❌ ${type} failed:`, result.reason);
        }
      });
      
      // Add reference metadata for LLM context
      newResources.reference = {
        bookId: reference.bookId,
        chapter: reference.chapter,
        verse: reference.verse,
        citation: `${reference.bookId} ${reference.chapter}:${reference.verse}`
      };
      
      console.log('🎯 ResourcesContext: Setting new resources:', Object.keys(newResources));
      setResources(newResources);
    }).catch(error => {
      console.error('❌ ResourcesContext: Failed to load resources:', error);
    });
  }, [reference, activeResources]);
  
  // Panel self-activation: Panels can request resources they need
  const activateResource = useCallback((resourceType) => {
    console.log(`🎯 ResourcesContext: Activating resource type: ${resourceType}`);
    setActiveResources(prev => {
      // Only trigger update if the resource isn't already active
      if (prev.has(resourceType)) {
        console.log(`🎯 ResourcesContext: ${resourceType} already active, skipping`);
        return prev; // No change, won't trigger useEffect
      }
      
      const newSet = new Set(prev);
      newSet.add(resourceType);
      return newSet;
    });
  }, []);
  
  return (
    <ResourcesContext.Provider value={{ resources, activateResource }}>
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
