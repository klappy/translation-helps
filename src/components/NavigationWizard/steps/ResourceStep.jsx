/**
 * ResourceStep.jsx
 * Third step of the wizard: Resource selection
 * Enhanced with cross-organization resource discovery and compatibility warnings
 */

import React, { useState, useEffect, useMemo } from "react";
import { useResources } from "../../../hooks/useResources";
import { searchResourcesAcrossOrgs, analyzeResourceCompatibility } from "../../../services/catalogService";
import { SearchableGrid } from "../SearchableGrid";
import { ResourceCard } from "../components/ResourceCard";
import { CompatibilityWarnings } from "../components/CompatibilityWarnings";
import { OrganizationResourceGroup } from "../components/OrganizationResourceGroup";
import styles from "../NavigationWizard.module.css";

export function ResourceStep({ onNext, onPrevious, onStepChange, wizardData, isDesktop, advancedMode }) {
  // State for cross-organization resources
  const [crossOrgResources, setCrossOrgResources] = useState({});
  const [crossOrgLoading, setCrossOrgLoading] = useState(false);
  const [crossOrgError, setCrossOrgError] = useState(null);
  const [selectedResources, setSelectedResources] = useState(wizardData.mixedResources || {});
  const [searchQuery, setSearchQuery] = useState("");

  // Basic mode: use existing useResources hook
  const { resources: basicResources, loading: basicLoading, error: basicError } = useResources(
    !advancedMode ? wizardData.organization : null,
    wizardData.languageId
  );

  // Advanced mode: fetch cross-organization resources
  useEffect(() => {
    if (!advancedMode || !wizardData.languageId) {
      setCrossOrgResources({});
      return;
    }

    const fetchCrossOrgResources = async () => {
      setCrossOrgLoading(true);
      setCrossOrgError(null);

      try {
        console.log('🔍 Fetching cross-organization resources for language:', wizardData.languageId);
        
        // Fetch different resource types
        const [bibleResources, notesResources, questionsResources, wordsResources] = await Promise.all([
          searchResourcesAcrossOrgs(wizardData.languageId, 'Bible'),
          searchResourcesAcrossOrgs(wizardData.languageId, 'Translation Notes'),
          searchResourcesAcrossOrgs(wizardData.languageId, 'Translation Questions'),
          searchResourcesAcrossOrgs(wizardData.languageId, 'Translation Words')
        ]);

        // Merge all resource types
        const allResources = {};
        
        // Helper function to merge resources by organization
        const mergeResources = (sourceResources) => {
          Object.entries(sourceResources).forEach(([org, resources]) => {
            if (!allResources[org]) {
              allResources[org] = [];
            }
            allResources[org].push(...resources);
          });
        };

        mergeResources(bibleResources);
        mergeResources(notesResources);
        mergeResources(questionsResources);
        mergeResources(wordsResources);

        // Sort resources within each organization
        Object.keys(allResources).forEach(org => {
          allResources[org].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
        });

        setCrossOrgResources(allResources);
        console.log('✅ Loaded cross-organization resources:', Object.keys(allResources));
      } catch (error) {
        console.error('❌ Failed to fetch cross-organization resources:', error);
        setCrossOrgError(error.message);
      } finally {
        setCrossOrgLoading(false);
      }
    };

    fetchCrossOrgResources();
  }, [advancedMode, wizardData.languageId]);

  // Transform resources for display based on mode
  const resourceItems = useMemo(() => {
    if (advancedMode) {
      // Advanced mode: flatten cross-org resources for search
      const allItems = [];
      Object.entries(crossOrgResources).forEach(([org, resources]) => {
        resources.forEach(resource => {
          allItems.push({
            id: resource.combinedId || `${org}/${resource.id}`,
            resourceId: resource.id,
            name: resource.name || resource.id,
            title: resource.name || resource.id,
            description: resource.description || getResourceDescription(resource),
            subtitle: resource.description || getResourceDescription(resource),
            avatar: resource.avatarUrl,
            icon: getResourceIcon(resource.id),
            badge: getResourceBadge(resource),
            organization: org,
            organizationBadge: org,
            metadata: {
              type: getResourceType(resource.id),
              subject: resource.subject,
              organization: org,
              stage: resource.stage,
              version: resource.version,
            },
          });
        });
      });
      return allItems;
    } else {
      // Basic mode: use single organization resources
      return basicResources?.map((resource) => ({
        id: resource.id,
        resourceId: resource.id,
        name: resource.name || resource.id,
        title: resource.name || resource.id,
        description: resource.description || getResourceDescription(resource),
        subtitle: resource.description || getResourceDescription(resource),
        avatar: resource.avatarUrl,
        icon: getResourceIcon(resource.id),
        badge: getResourceBadge(resource),
        organization: wizardData.organization,
        metadata: {
          type: getResourceType(resource.id),
          subject: resource.subject,
        },
      })) || [];
    }
  }, [advancedMode, crossOrgResources, basicResources, wizardData.organization]);

  // Filter resources based on search query
  const filteredResourceItems = useMemo(() => {
    if (!searchQuery.trim()) return resourceItems;
    
    const query = searchQuery.toLowerCase();
    return resourceItems.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.organization.toLowerCase().includes(query) ||
      item.metadata.type.toLowerCase().includes(query)
    );
  }, [resourceItems, searchQuery]);

  // Group resources by organization for advanced mode
  const groupedResources = useMemo(() => {
    if (!advancedMode) return null;

    const groups = {};
    filteredResourceItems.forEach(item => {
      if (!groups[item.organization]) {
        groups[item.organization] = [];
      }
      groups[item.organization].push(item);
    });

    return groups;
  }, [advancedMode, filteredResourceItems]);

  // Analyze compatibility of selected resources
  const compatibilityAnalysis = useMemo(() => {
    if (!advancedMode) return null;

    const selectedResourceList = Object.values(selectedResources).filter(Boolean);
    if (selectedResourceList.length === 0) return null;

    return analyzeResourceCompatibility(selectedResourceList);
  }, [advancedMode, selectedResources]);

  // Handle resource selection
  const handleResourceSelect = (resource) => {
    if (advancedMode) {
      // Advanced mode: handle mixed resource selection
      const resourceType = getResourceTypeKey(resource.metadata.type);
      const newSelectedResources = {
        ...selectedResources,
        [resourceType]: {
          organization: resource.organization,
          resourceId: resource.resourceId,
          name: resource.name,
          combinedId: resource.id
        }
      };

      setSelectedResources(newSelectedResources);
      
      // Update wizard data
      onStepChange(2, { 
        mixedResources: newSelectedResources,
        resourceOrganization: resource.organization // Set primary resource org
      });
    } else {
      // Basic mode: single resource selection
      onStepChange(3, { resourceId: resource.resourceId });
    }
  };

  // Handle resource deselection in advanced mode
  const handleResourceDeselect = (resourceType) => {
    if (!advancedMode) return;

    const newSelectedResources = {
      ...selectedResources,
      [resourceType]: null
    };

    setSelectedResources(newSelectedResources);
    onStepChange(2, { mixedResources: newSelectedResources });
  };

  // Check if we can proceed
  const canProceed = advancedMode 
    ? Object.values(selectedResources).some(Boolean)
    : Boolean(wizardData.resourceId);

  // Determine loading and error states
  const loading = advancedMode ? crossOrgLoading : basicLoading;
  const error = advancedMode ? crossOrgError : basicError;

  // Find selected resource for basic mode
  const selectedResource = !advancedMode 
    ? resourceItems.find((resource) => resource.id === wizardData.resourceId)
    : null;

  return (
    <div className={`${styles.stepContainer} ${isDesktop ? styles.desktop : ""}`}>
      {/* Step header */}
      <div className={`${styles.stepHeader} ${isDesktop ? styles.desktop : ""}`}>
        <h2 className={`${styles.stepTitle} ${isDesktop ? styles.desktop : ""}`}>
          {advancedMode ? 'Choose Mixed Resources' : 'Choose Resource'}
        </h2>
        <p className={`${styles.stepDescription} ${isDesktop ? styles.desktop : ""}`}>
          {advancedMode 
            ? 'Select resources from different organizations to create your custom resource collection.'
            : 'Select the Bible translation resource you want to access.'
          }
        </p>
      </div>

      {/* Compatibility warnings for advanced mode */}
      {advancedMode && compatibilityAnalysis && (
        <CompatibilityWarnings 
          analysis={compatibilityAnalysis}
          isDesktop={isDesktop}
        />
      )}

      {/* Content area */}
      <div className={`${styles.stepContent} ${isDesktop ? styles.desktop : ""}`}>
        {advancedMode ? (
          // Advanced mode: grouped resource display
          <div className={styles.advancedResourceContainer}>
            {/* Search bar */}
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search resources across organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${styles.searchInput} ${isDesktop ? styles.desktop : ""}`}
              />
            </div>

            {/* Selected resources summary */}
            {Object.values(selectedResources).some(Boolean) && (
              <div className={styles.selectedResourcesSummary}>
                <h3>Selected Resources</h3>
                <div className={styles.selectedResourcesList}>
                  {Object.entries(selectedResources).map(([type, resource]) => {
                    if (!resource) return null;
                    return (
                      <div key={type} className={styles.selectedResourceItem}>
                        <span className={styles.resourceType}>{getResourceTypeLabel(type)}:</span>
                        <span className={styles.resourceName}>{resource.name}</span>
                        <span className={styles.resourceOrg}>({resource.organization})</span>
                        <button
                          onClick={() => handleResourceDeselect(type)}
                          className={styles.deselectButton}
                          title="Remove this resource"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Organization groups */}
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner} />
                <p>Loading resources from all organizations...</p>
              </div>
            ) : error ? (
              <div className={styles.errorState}>
                <p>Error loading resources: {error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
              </div>
            ) : (
              <div className={styles.organizationGroups}>
                {Object.entries(groupedResources || {}).map(([org, orgResources]) => (
                  <OrganizationResourceGroup
                    key={org}
                    organization={org}
                    resources={orgResources}
                    selectedResources={selectedResources}
                    onResourceSelect={handleResourceSelect}
                    isDesktop={isDesktop}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Basic mode: standard resource grid
          <SearchableGrid
            items={filteredResourceItems}
            selectedItem={selectedResource}
            onItemSelect={handleResourceSelect}
            searchPlaceholder='Search resources...'
            emptyMessage='No resources found for this language'
            emptyIcon='📄'
            isDesktop={isDesktop}
            isLoading={loading}
            error={error}
            getItemKey={(item) => item.id}
            getItemTitle={(item) => item.title}
            getItemSubtitle={(item) => item.description}
            getItemIcon={(item) => item.icon}
            getItemAvatar={(item) => item.avatar}
            CustomCard={ResourceCard}
            cardProps={{
              layout: "narrow",
              organization: wizardData.organization,
              languageId: wizardData.languageId,
              showMetadata: true,
            }}
          />
        )}
      </div>

      {/* Navigation */}
      <div className={`${styles.stepNavigation} ${isDesktop ? styles.desktop : ""}`}>
        <button
          type='button'
          className={`${styles.navigationButton} ${styles.secondary} ${
            isDesktop ? styles.desktop : ""
          }`}
          onClick={onPrevious}
        >
          Back
        </button>
        <button
          type='button'
          className={`${styles.navigationButton} ${styles.primary} ${
            isDesktop ? styles.desktop : ""
          }`}
          onClick={onNext}
          disabled={!canProceed}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Helper functions
function getResourceDescription(resource) {
  const descriptions = {
    "Bible Translation": `${resource.subject || "Bible"} • ${resource.id.toUpperCase()}`,
    "Study Notes": "Translation Notes",
    Questions: "Translation Questions",
    Words: "Translation Words",
    Academy: "Translation Academy",
  };

  const type = getResourceType(resource.id);
  return (
    descriptions[type] ||
    resource.description ||
    `${resource.subject || "Resource"} • ${resource.id.toUpperCase()}`
  );
}

function getResourceIcon(resourceId) {
  const icons = {
    ult: "📖",
    ust: "📚",
    utn: "📝",
    utq: "❓",
    utw: "📋",
    uta: "🎓",
    obs: "📚",
    bible: "📖",
    tn: "📝",
    tq: "❓",
    tw: "📋",
    ta: "🎓",
  };

  const id = resourceId.toLowerCase();
  return icons[id] || "📄";
}

function getResourceBadge(resource) {
  if (resource.id.toLowerCase().includes("ult")) return "Literal";
  if (resource.id.toLowerCase().includes("ust")) return "Simplified";
  if (resource.id.toLowerCase().includes("obs")) return "Stories";
  return null;
}

function getResourceType(resourceId) {
  const id = resourceId.toLowerCase();
  if (["ult", "ust", "bible", "obs"].includes(id)) return "Bible Translation";
  if (["utn", "tn"].includes(id)) return "Study Notes";
  if (["utq", "tq"].includes(id)) return "Questions";
  if (["utw", "tw"].includes(id)) return "Words";
  if (["uta", "ta"].includes(id)) return "Academy";
  return "Other Resources";
}

function getResourceTypeKey(resourceType) {
  const typeMap = {
    "Bible Translation": "scripture",
    "Study Notes": "tn",
    "Questions": "tq",
    "Words": "tw",
    "Academy": "ta"
  };
  return typeMap[resourceType] || "other";
}

function getResourceTypeLabel(typeKey) {
  const labelMap = {
    scripture: "Scripture",
    tn: "Translation Notes",
    tq: "Translation Questions",
    tw: "Translation Words",
    ta: "Translation Academy",
    twl: "Translation Word List"
  };
  return labelMap[typeKey] || typeKey;
}
