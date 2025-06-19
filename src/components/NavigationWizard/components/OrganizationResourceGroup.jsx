/**
 * OrganizationResourceGroup.jsx
 * Component to display resources grouped by organization with collapsible sections
 */

import React, { useState } from "react";
import { ResourceCard } from "./ResourceCard";
import styles from "./OrganizationResourceGroup.module.css";

export function OrganizationResourceGroup({ 
  organization, 
  resources, 
  selectedResources, 
  onResourceSelect, 
  isDesktop 
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!resources || resources.length === 0) {
    return null;
  }

  // Get organization stats
  const resourceCount = resources.length;
  const resourceTypes = [...new Set(resources.map(r => r.metadata.type))];
  const selectedCount = resources.filter(resource => {
    const resourceType = getResourceTypeKey(resource.metadata.type);
    return selectedResources[resourceType]?.organization === organization;
  }).length;

  // Check if this resource is selected
  const isResourceSelected = (resource) => {
    const resourceType = getResourceTypeKey(resource.metadata.type);
    const selected = selectedResources[resourceType];
    return selected && selected.organization === organization && selected.resourceId === resource.resourceId;
  };

  const handleResourceClick = (resource) => {
    onResourceSelect(resource);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${styles.organizationGroup} ${isDesktop ? styles.desktop : ""}`}>
      {/* Organization header */}
      <div 
        className={`${styles.organizationHeader} ${isDesktop ? styles.desktop : ""}`}
        onClick={toggleExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
        }}
      >
        <div className={styles.organizationInfo}>
          <div className={styles.organizationName}>
            <span className={styles.expandIcon}>
              {isExpanded ? '📂' : '📁'}
            </span>
            <h3 className={styles.orgTitle}>{organization}</h3>
          </div>
          <div className={styles.organizationStats}>
            <span className={styles.resourceCount}>
              {resourceCount} resource{resourceCount !== 1 ? 's' : ''}
            </span>
            {selectedCount > 0 && (
              <span className={styles.selectedCount}>
                {selectedCount} selected
              </span>
            )}
          </div>
        </div>
        
        {/* Resource types preview */}
        <div className={styles.resourceTypesPreview}>
          {resourceTypes.slice(0, 3).map((type, index) => (
            <span key={index} className={styles.resourceTypeTag}>
              {getResourceTypeIcon(type)} {type}
            </span>
          ))}
          {resourceTypes.length > 3 && (
            <span className={styles.moreTypes}>
              +{resourceTypes.length - 3} more
            </span>
          )}
        </div>

        <div className={styles.expandButton}>
          <span className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {/* Resources grid */}
      {isExpanded && (
        <div className={`${styles.resourcesGrid} ${isDesktop ? styles.desktop : ""}`}>
          {resources.map((resource) => (
            <div 
              key={resource.id}
              className={`${styles.resourceCardWrapper} ${
                isResourceSelected(resource) ? styles.selected : ''
              }`}
            >
              <ResourceCard
                resourceId={resource.resourceId}
                title={resource.title}
                subtitle={resource.description}
                description={resource.description}
                icon={resource.icon}
                avatar={resource.avatar}
                badge={resource.badge}
                selected={isResourceSelected(resource)}
                onClick={() => handleResourceClick(resource)}
                organization={resource.organization}
                languageId={resource.metadata?.languageId}
                isDesktop={isDesktop}
                layout="narrow"
                showMetadata={true}
              />
              
              {/* Resource type indicator */}
              <div className={styles.resourceTypeIndicator}>
                <span className={styles.typeIcon}>
                  {getResourceTypeIcon(resource.metadata.type)}
                </span>
                <span className={styles.typeName}>
                  {resource.metadata.type}
                </span>
              </div>

              {/* Selection overlay */}
              {isResourceSelected(resource) && (
                <div className={styles.selectionOverlay}>
                  <div className={styles.selectionIcon}>✓</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Collapsed state summary */}
      {!isExpanded && (
        <div className={styles.collapsedSummary}>
          <div className={styles.summaryText}>
            {selectedCount > 0 
              ? `${selectedCount} of ${resourceCount} resources selected`
              : `${resourceCount} resources available`
            }
          </div>
          <div className={styles.summaryTypes}>
            {resourceTypes.map((type, index) => (
              <span key={index} className={styles.summaryTypeIcon}>
                {getResourceTypeIcon(type)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
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

function getResourceTypeIcon(resourceType) {
  const iconMap = {
    "Bible Translation": "📖",
    "Study Notes": "📝",
    "Questions": "❓",
    "Words": "📋",
    "Academy": "🎓",
    "Other Resources": "📄"
  };
  return iconMap[resourceType] || "📄";
} 