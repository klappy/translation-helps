/**
 * OrganizationResourceGroup.jsx
 * Component to display resources grouped by organization with collapsible sections
 * Decluttered UI with avatar-first design and progressive disclosure
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
  const selectedCount = resources.filter(resource => {
    const resourceType = getResourceTypeKey(resource.metadata.type);
    return selectedResources[resourceType]?.organization === organization;
  }).length;

  // Get organization avatar (use first resource's avatar as org avatar)
  const organizationAvatar = resources[0]?.avatar;

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
      {/* Organization header - clean and avatar-first */}
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
        {/* Organization avatar */}
        <div className={styles.organizationAvatar}>
          {organizationAvatar ? (
            organizationAvatar.startsWith('http') || organizationAvatar.startsWith('/') ? (
              <img 
                src={organizationAvatar} 
                alt={organization}
                className={styles.avatarImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className={styles.avatarFallback}>{organizationAvatar}</div>
            )
          ) : null}
          <div className={styles.avatarFallback} style={{ display: organizationAvatar ? 'none' : 'flex' }}>
            🏢
          </div>
        </div>

        <div className={styles.organizationInfo}>
          <h3 className={styles.orgTitle}>{organization}</h3>
          <div className={styles.organizationStats}>
            <span className={styles.resourceCount}>
              {resourceCount} {resourceCount === 1 ? 'resource' : 'resources'}
            </span>
            {selectedCount > 0 && (
              <span className={styles.selectedBadge}>
                {selectedCount}
              </span>
            )}
          </div>
        </div>
        
        <div className={styles.expandButton}>
          <span className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}>
            ▶
          </span>
        </div>
      </div>

      {/* Resources grid - cleaner layout */}
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
                showMetadata={false} // Hide metadata by default for cleaner look
              />
            </div>
          ))}
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