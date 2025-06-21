/**
 * useResources.js
 * Hook for fetching and managing resource data by organization and language from DCS catalog API
 * Enhanced with cross-organization support for advanced mode
 */

import { useState, useEffect } from "react";
import { fetchBibleResources, searchResourcesAcrossOrgs } from "../services/catalogService.js";

/**
 * Hook for fetching available resources for a specific organization and language
 * Enhanced to support cross-organization resource discovery
 * @param {string} organization - The organization/owner name (null for cross-org mode)
 * @param {string} language - The language ID
 * @param {Object} options - Additional options for resource fetching
 * @param {boolean} options.crossOrganization - Whether to search across organizations
 * @param {string} options.resourceType - Filter by specific resource type
 * @returns {Object} Object containing resources array, loading state, and error
 */
export function useResources(organization, language, options = {}) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [organizationBreakdown, setOrganizationBreakdown] = useState({});

  const { crossOrganization = false, resourceType = null } = options;

  useEffect(() => {
    let isMounted = true;

    const loadResources = async () => {
      console.log("🔍 useResources - loadResources called:", { 
        organization, 
        language, 
        crossOrganization, 
        resourceType 
      });

      if (!language) {
        console.log("⚠️ Missing language:", { organization, language });
        setResources([]);
        setOrganizationBreakdown({});
        setLoading(false);
        setError(null);
        return;
      }

      // For cross-organization mode, organization can be null
      if (!crossOrganization && !organization) {
        console.log("⚠️ Missing organization for single-org mode:", { organization, language });
        setResources([]);
        setOrganizationBreakdown({});
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (crossOrganization) {
          // Cross-organization resource discovery
          console.log("🌐 Fetching cross-organization resources for:", language, resourceType);
          
          let crossOrgData = {};
          let allMetadata = { organizations: [], languages: [], totalResources: 0 };
          
          if (resourceType) {
            // Fetch specific resource type - now returns enhanced structure
            const result = await searchResourcesAcrossOrgs(language, resourceType);
            crossOrgData = result?.resources || result; // Handle both old and new structure
            allMetadata = result?.metadata || allMetadata;
            
            console.log(`📊 Enhanced metadata for ${resourceType}:`, {
              totalResources: allMetadata.totalResources,
              organizations: allMetadata.organizations?.length || 0,
              languages: allMetadata.languages?.length || 0
            });
          } else {
            // Fetch all resource types and merge - now returns enhanced structures
            const [bibleResult, notesResult, questionsResult, wordsResult] = await Promise.all([
              searchResourcesAcrossOrgs(language, 'Bible').catch(() => ({ resources: {}, metadata: {} })),
              searchResourcesAcrossOrgs(language, 'Translation Notes').catch(() => ({ resources: {}, metadata: {} })),
              searchResourcesAcrossOrgs(language, 'Translation Questions').catch(() => ({ resources: {}, metadata: {} })),
              searchResourcesAcrossOrgs(language, 'Translation Words').catch(() => ({ resources: {}, metadata: {} }))
            ]);

            // Extract resources from enhanced structure (backward compatibility)
            const bibleResources = bibleResult?.resources || bibleResult;
            const notesResources = notesResult?.resources || notesResult;
            const questionsResources = questionsResult?.resources || questionsResult;
            const wordsResources = wordsResult?.resources || wordsResult;

            // Merge metadata from all calls
            const allOrgMetadata = new Map();
            [bibleResult, notesResult, questionsResult, wordsResult].forEach(result => {
              if (result?.metadata?.organizations) {
                result.metadata.organizations.forEach(org => {
                  allOrgMetadata.set(org.login, org);
                });
              }
            });

            allMetadata = {
              organizations: Array.from(allOrgMetadata.values()),
              languages: bibleResult?.metadata?.languages || [],
              totalResources: (bibleResult?.metadata?.totalResources || 0) + 
                             (notesResult?.metadata?.totalResources || 0) + 
                             (questionsResult?.metadata?.totalResources || 0) + 
                             (wordsResult?.metadata?.totalResources || 0)
            };

            console.log(`📊 Combined enhanced metadata:`, {
              totalResources: allMetadata.totalResources,
              organizations: allMetadata.organizations.length,
              languages: allMetadata.languages.length
            });

            // Merge all resource types
            const allOrgs = new Set([
              ...Object.keys(bibleResources),
              ...Object.keys(notesResources),
              ...Object.keys(questionsResources),
              ...Object.keys(wordsResources)
            ]);

            allOrgs.forEach(org => {
              crossOrgData[org] = [
                ...(bibleResources[org] || []),
                ...(notesResources[org] || []),
                ...(questionsResources[org] || []),
                ...(wordsResources[org] || [])
              ];
            });
          }

          // Flatten cross-org data into a single array with organization attribution
          const flattenedResources = [];
          Object.entries(crossOrgData).forEach(([org, orgResources]) => {
            orgResources.forEach(resource => {
              flattenedResources.push({
                ...resource,
                organization: org,
                combinedId: `${org}/${resource.id}`,
                isFromCrossOrg: true
              });
            });
          });

          console.log("✅ Cross-organization resources fetched:", flattenedResources.length, "resources from", Object.keys(crossOrgData).length, "organizations");

          if (isMounted) {
            setResources(flattenedResources);
            setOrganizationBreakdown(crossOrgData);
            console.log("🔄 Cross-org resources set in state:", flattenedResources.length, "items");
          }

        } else {
          // Single organization resource fetching (existing behavior)
          console.log("📡 Fetching Bible resources for:", organization, language);
          const data = await fetchBibleResources(organization, language);
          console.log("✅ Bible resources fetched:", data);

          if (isMounted) {
            const enhancedResources = data.map(resource => ({
              ...resource,
              organization: organization,
              combinedId: `${organization}/${resource.id}`,
              isFromCrossOrg: false
            }));

            setResources(enhancedResources);
            setOrganizationBreakdown({ [organization]: data });
            console.log("🔄 Resources set in state:", enhancedResources.length, "items");
          }
        }

      } catch (err) {
        if (isMounted) {
          setError(err.message);
          console.error(`Failed to load resources for ${crossOrganization ? 'cross-org' : organization}/${language}:`, err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadResources();

    return () => {
      isMounted = false;
    };
  }, [organization, language, crossOrganization, resourceType]);

  return {
    resources,
    loading,
    error,
    organizationBreakdown, // New: breakdown of resources by organization
    
    // Enhanced diagnostics
    diagnostics: {
      totalResources: resources.length,
      organizationCount: Object.keys(organizationBreakdown).length,
      crossOrganizationMode: crossOrganization,
      resourceType: resourceType,
      organizations: Object.keys(organizationBreakdown),
    }
  };
}

/**
 * Enhanced hook specifically for cross-organization resource discovery
 * @param {string} language - The language ID
 * @param {string} resourceType - Optional resource type filter
 * @returns {Object} Object containing cross-org resources, loading state, and error
 */
export function useCrossOrgResources(language, resourceType = null) {
  return useResources(null, language, { 
    crossOrganization: true, 
    resourceType 
  });
}

/**
 * Hook for fetching resources with organization-specific configuration
 * @param {Object} resourceConfig - Resource configuration object
 * @param {string} resourceConfig.organization - Organization name
 * @param {string} resourceConfig.language - Language ID
 * @param {string} resourceConfig.resourceType - Resource type filter
 * @returns {Object} Object containing resources, loading state, and error
 */
export function useResourcesWithConfig(resourceConfig) {
  const { organization, language, resourceType, crossOrganization = false } = resourceConfig || {};
  
  return useResources(organization, language, { 
    crossOrganization, 
    resourceType 
  });
}

export default useResources;
