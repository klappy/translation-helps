/**
 * MultiManifestsContext.js
 * Context to provide DCS manifests for multiple resources.
 * Enhanced with cross-organization support for advanced mode
 */

import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { fetchManifest } from "../services/dcsClient";
import { ReferenceContext } from "./ReferenceContext";
import { fetchBibleResources, fetchAllLanguages } from "../services/catalogService";

export const ManifestsContext = createContext({ manifests: {}, isLoading: false });

// Base resource IDs that are always loaded (Translation Notes, Questions, Words, etc.)
const BASE_RESOURCE_IDS = ["tn", "tq", "tw", "twl"];

/**
 * Provider that fetches and provides manifests for multiple resources.
 * Automatically subscribes to organization and languageId from ReferenceContext.
 * Enhanced with cross-organization support for advanced mode.
 */
export function MultiManifestsProvider({ children }) {
  const [manifests, setManifests] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const currentLoadingRef = useRef(""); // Track current loading operation to prevent race conditions
  const { 
    organization, 
    languageId, 
    advancedMode, 
    mixedResources,
    getResourceOrganization,
    getResourceId 
  } = useContext(ReferenceContext);

  useEffect(() => {
    async function loadManifests() {
      if (!languageId) {
        setManifests({});
        setIsLoading(false);
        currentLoadingRef.current = "";
        return;
      }

      // Create a unique key for this loading operation to prevent race conditions
      const currentLoadingKey = `${organization}-${languageId}-${advancedMode ? 'advanced' : 'basic'}`;
      currentLoadingRef.current = currentLoadingKey;
      setIsLoading(true);

      console.log(`🔄 MultiManifestsContext: Starting load for ${currentLoadingKey}`);

      const loadedManifests = {};
      let resourceConfigurations = [];

      try {
        if (advancedMode) {
          // Advanced mode: Load manifests for mixed resources from different organizations
          console.log('📋 Advanced mode: Loading manifests for mixed resources');
          
          // Build resource configurations from mixed resources
          const resourceTypes = ['scripture', 'tn', 'tq', 'tw', 'twl'];
          
          resourceTypes.forEach(resourceType => {
            if (mixedResources[resourceType]) {
              // Use mixed resource configuration
              resourceConfigurations.push({
                organization: mixedResources[resourceType].organization,
                resourceId: mixedResources[resourceType].resourceId,
                type: resourceType,
                key: `${mixedResources[resourceType].organization}/${mixedResources[resourceType].resourceId}`
              });
            } else {
              // Fallback to default organization for this resource type
              const defaultResourceIds = {
                scripture: 'ult', // Default scripture resource
                tn: 'tn',
                tq: 'tq',
                tw: 'tw',
                twl: 'twl'
              };
              
              resourceConfigurations.push({
                organization: organization || 'Door43-Catalog',
                resourceId: defaultResourceIds[resourceType],
                type: resourceType,
                key: `${organization || 'Door43-Catalog'}/${defaultResourceIds[resourceType]}`
              });
            }
          });

          // Also try to load available Bible resources from the primary organization
          try {
            const bibleResources = await fetchBibleResources(organization || 'Door43-Catalog', languageId);
            const bibleResourceIds = bibleResources
              .map((resource) => {
                if (resource.id && languageId && resource.id.startsWith(`${languageId}_`)) {
                  return resource.id.substring(languageId.length + 1);
                }
                return resource.id;
              })
              .filter(Boolean);

            // Add additional Bible resources that aren't already configured
            bibleResourceIds.forEach(resourceId => {
              const key = `${organization || 'Door43-Catalog'}/${resourceId}`;
              if (!resourceConfigurations.find(config => config.key === key)) {
                resourceConfigurations.push({
                  organization: organization || 'Door43-Catalog',
                  resourceId: resourceId,
                  type: 'bible',
                  key: key
                });
              }
            });

            console.log("📚 Available Bible resource IDs for primary org:", bibleResourceIds);
          } catch (error) {
            console.warn("⚠️ Failed to fetch Bible resources for primary org:", error);
          }

        } else {
          // Basic mode: Use single organization approach (existing logic)
          if (!organization) {
            setManifests({});
            setIsLoading(false);
            currentLoadingRef.current = "";
            return;
          }

          let allResourceIds = [...BASE_RESOURCE_IDS];

          try {
            // Fetch available Bible resources dynamically
            const bibleResources = await fetchBibleResources(organization, languageId);
            const bibleResourceIds = bibleResources
              .map((resource) => {
                if (resource.id && languageId && resource.id.startsWith(`${languageId}_`)) {
                  return resource.id.substring(languageId.length + 1);
                }
                return resource.id;
              })
              .filter(Boolean);

            console.log("📚 Available Bible resource IDs:", bibleResourceIds);
            allResourceIds = [...BASE_RESOURCE_IDS, ...bibleResourceIds];

            // Remove duplicates
            allResourceIds = [...new Set(allResourceIds)];
          } catch (error) {
            console.warn("⚠️ Failed to fetch Bible resources, using base resources only:", error);
            // Fallback to base resources + common Bible resources
            allResourceIds = [...BASE_RESOURCE_IDS, "ult", "ust", "t4t"];
          }

          // Convert to resource configurations for consistent processing
          resourceConfigurations = allResourceIds.map(resourceId => ({
            organization: organization,
            resourceId: resourceId,
            type: BASE_RESOURCE_IDS.includes(resourceId) ? resourceId : 'bible',
            key: `${organization}/${resourceId}`
          }));
        }

        console.log("📋 Loading manifests for resource configurations:", resourceConfigurations);

        // Load manifests for all resource configurations in parallel
        const promises = resourceConfigurations.map(async (config) => {
          try {
            const manifest = await fetchManifest(languageId, config.resourceId, config.organization);
            return { 
              config, 
              manifest,
              success: true
            };
          } catch (error) {
            console.error(`Failed to load manifest for ${config.organization}/${config.resourceId}:`, error);
            return { 
              config, 
              manifest: null,
              success: false,
              error: error.message
            };
          }
        });

        const results = await Promise.all(promises);

        // Only update state if this is still the active loading operation (prevent race conditions)
        if (currentLoadingRef.current === currentLoadingKey) {
          results.forEach(({ config, manifest, success, error }) => {
            if (success && manifest) {
              // Store with both combined key and legacy key for backward compatibility
              loadedManifests[config.key] = manifest;
              loadedManifests[config.resourceId] = manifest;
              console.log(`✅ Loaded manifest for ${config.organization}/${config.resourceId}`);
            } else {
              console.warn(`❌ Failed to load manifest for ${config.organization}/${config.resourceId}:`, error);
            }
          });

          const successfulLoads = results.filter(r => r.success).length;
          const totalAttempts = results.length;

          console.log(
            `✅ MultiManifestsContext: Completed load for ${currentLoadingKey}, loaded ${successfulLoads}/${totalAttempts} manifests`
          );
          
          setManifests(loadedManifests);
          setIsLoading(false);
        } else {
          console.log(
            `🚫 MultiManifestsContext: Discarding stale load result for ${currentLoadingKey} (current: ${currentLoadingRef.current})`
          );
        }

      } catch (error) {
        console.error("Error in manifest loading process:", error);
        if (currentLoadingRef.current === currentLoadingKey) {
          setIsLoading(false);
        }
      }
    }

    loadManifests();
  }, [languageId, organization, advancedMode, mixedResources]);

  // Enhanced context value with cross-organization information
  const contextValue = {
    manifests,
    isLoading,
    
    // Enhanced diagnostics for cross-organization support
    diagnostics: {
      advancedMode,
      totalManifests: Object.keys(manifests).length,
      manifestKeys: Object.keys(manifests),
      crossOrganizationManifests: advancedMode && mixedResources ? Object.keys(mixedResources).length : 0,
    }
  };

  return (
    <ManifestsContext.Provider value={contextValue}>
      {children}
    </ManifestsContext.Provider>
  );
}
