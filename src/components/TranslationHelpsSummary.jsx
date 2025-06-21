/**
 * TranslationHelpsSummary.jsx
 * Shows discovered translation helps across organizations with selection controls
 */
import React, { useState } from 'react';
import { getResourceStatus } from '../services/translationHelpsDiscovery';
import styles from './TranslationHelpsSummary.module.css';

const HELP_TYPES = {
  tn: { 
    name: 'Translation Notes', 
    icon: '📝',
    description: 'Explanatory notes for translators'
  },
  tq: { 
    name: 'Translation Questions', 
    icon: '❓',
    description: 'Comprehension and checking questions'
  },
  tw: { 
    name: 'Translation Words', 
    icon: '📚',
    description: 'Key term definitions and explanations'
  },
  twl: { 
    name: 'Translation Word Links', 
    icon: '🔗',
    description: 'Connections between words and their occurrences'
  }
};

export function TranslationHelpsSummary({ 
  availability, 
  optimal, 
  onOrganizationChange,
  isCollapsed = false,
  onToggleCollapsed
}) {
  const [expandedTypes, setExpandedTypes] = useState(new Set());

  const toggleExpanded = (type) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  const handleOrganizationSelect = (resourceType, organization) => {
    if (onOrganizationChange) {
      onOrganizationChange(resourceType, organization);
    }
  };

  const getCompletionPercentage = (resourceData) => {
    if (!resourceData || !resourceData.books) return 0;
    const bookCount = resourceData.books.length;
    // Rough estimate: 66 books in Bible
    return Math.min(Math.round((bookCount / 66) * 100), 100);
  };

  const getQualityBadge = (resourceData) => {
    if (!resourceData) return null;
    
    const checkingLevel = parseInt(resourceData.checking_level) || 0;
    const stage = resourceData.stage || 'unknown';
    
    if (checkingLevel >= 3 && stage === 'prod') return { text: 'Complete', class: 'complete' };
    if (checkingLevel >= 2) return { text: 'Reviewed', class: 'reviewed' };
    if (checkingLevel >= 1) return { text: 'Draft', class: 'draft' };
    return { text: 'In Progress', class: 'progress' };
  };

  const totalAvailable = Object.values(availability).filter(
    typeAvailability => Object.keys(typeAvailability).length > 0
  ).length;

  const totalOptimal = Object.values(optimal).filter(Boolean).length;

  if (isCollapsed) {
    return (
      <div className={styles.summaryCollapsed} onClick={onToggleCollapsed}>
        <div className={styles.collapsedHeader}>
          <span className={styles.summaryIcon}>📚</span>
          <span className={styles.summaryText}>
            Translation Helps: {totalOptimal}/{Object.keys(HELP_TYPES).length} available
          </span>
          <span className={styles.expandIcon}>▼</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.helpsSummary}>
      <div className={styles.summaryHeader}>
        <h3 className={styles.title}>
          📚 Translation Helps Discovery
          {onToggleCollapsed && (
            <button 
              onClick={onToggleCollapsed}
              className={styles.collapseButton}
              title="Collapse summary"
            >
              ▲
            </button>
          )}
        </h3>
        <p className={styles.description}>
          Resources automatically discovered from {Object.keys(availability).reduce((orgs, type) => {
            Object.keys(availability[type]).forEach(org => orgs.add(org));
            return orgs;
          }, new Set()).size} organizations
        </p>
      </div>

      <div className={styles.helpsGrid}>
        {Object.entries(HELP_TYPES).map(([key, config]) => {
          const isExpanded = expandedTypes.has(key);
          const typeAvailability = availability[key] || {};
          const selectedResource = optimal[key];
          const hasOptions = Object.keys(typeAvailability).length > 0;

          return (
            <div key={key} className={styles.helpType}>
              <div className={styles.helpHeader}>
                <div className={styles.helpInfo}>
                  <span className={styles.helpIcon}>{config.icon}</span>
                  <div className={styles.helpDetails}>
                    <h4 className={styles.helpName}>{config.name}</h4>
                    <p className={styles.helpDescription}>{config.description}</p>
                  </div>
                </div>
                
                <div className={styles.helpStatus}>
                  {selectedResource ? (
                    <div className={styles.selectedOrg}>
                      <span className={styles.orgName}>from {selectedResource.organization}</span>
                      {selectedResource.selectionReason && (
                        <span className={styles.selectionReason} title={`Selected because: ${selectedResource.selectionReason}`}>
                          {selectedResource.selectionReason === 'primary' && '⭐'}
                          {selectedResource.selectionReason === 'scripture-consistency' && '🔗'}
                          {selectedResource.selectionReason === 'best-quality' && '🏆'}
                          {selectedResource.selectionReason === 'fallback' && '📋'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className={styles.notAvailable}>Not available</span>
                  )}
                  
                  {hasOptions && (
                    <button
                      onClick={() => toggleExpanded(key)}
                      className={styles.expandButton}
                      title={isExpanded ? 'Hide options' : 'Show all options'}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  )}
                </div>
              </div>

              {selectedResource && (
                <div className={styles.resourceDetails}>
                  <div className={styles.resourceStats}>
                    <span className={styles.bookCount}>
                      {selectedResource.books?.length || 0} books
                    </span>
                    <span className={styles.completion}>
                      {getCompletionPercentage(selectedResource)}% complete
                    </span>
                    {getQualityBadge(selectedResource) && (
                      <span className={`${styles.qualityBadge} ${styles[getQualityBadge(selectedResource).class]}`}>
                        {getQualityBadge(selectedResource).text}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {isExpanded && hasOptions && (
                <div className={styles.orgOptions}>
                  <h5 className={styles.optionsTitle}>Available from:</h5>
                  <div className={styles.orgList}>
                    {Object.entries(typeAvailability).map(([org, data]) => {
                      const isSelected = selectedResource?.organization === org;
                      const quality = getQualityBadge(data);
                      
                      return (
                        <button
                          key={org}
                          className={`${styles.orgOption} ${isSelected ? styles.selected : ''}`}
                          onClick={() => handleOrganizationSelect(key, org)}
                          disabled={isSelected}
                        >
                          <div className={styles.orgInfo}>
                            <span className={styles.orgName}>{org}</span>
                            <div className={styles.orgStats}>
                              <span className={styles.bookCount}>
                                {data.books?.length || 0} books
                              </span>
                              <span className={styles.completion}>
                                {getCompletionPercentage(data)}%
                              </span>
                              {quality && (
                                <span className={`${styles.qualityBadge} ${styles[quality.class]}`}>
                                  {quality.text}
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <span className={styles.selectedIndicator}>✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalAvailable === 0 && (
        <div className={styles.noHelpsAvailable}>
          <span className={styles.noHelpsIcon}>📭</span>
          <p className={styles.noHelpsText}>
            No translation helps found for this language across any organization.
          </p>
        </div>
      )}
    </div>
  );
} 