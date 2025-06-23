/**
 * ResourceMetadataCard.jsx
 * Reusable resource metadata card component for displaying organization, title, and license
 * Matches the Scripture panel's resource details styling
 */

import React from 'react';
import { TabIcon } from './TabIcon';
import styles from './ResourceMetadataCard.module.css';

export function ResourceMetadataCard({
  organization,
  title,
  version,
  rights = "CC BY-SA 4.0",
  languageId,
  resourceType
}) {
  if (!organization && !title) {
    return null;
  }

  // Generate DCS repository URL
  const getRepositoryUrl = () => {
    if (!organization || !languageId || !resourceType) {
      return null;
    }
    
    // Map resource types to DCS repository naming convention
    const resourceMap = {
      'tn': 'tn',
      'tq': 'tq', 
      'tw': 'tw',
      'twl': 'twl',
      'ta': 'ta',
      'scripture': 'ult', // Default to ULT for scripture
      'fia': 'fia'
    };
    
    const repoSuffix = resourceMap[resourceType] || resourceType;
    return `https://git.door43.org/${organization}/${languageId}_${repoSuffix}`;
  };

  const repositoryUrl = getRepositoryUrl();

  return (
    <div className={styles.resourceDetails}>
      {organization && (
        <div className={styles.resourceDetailItem}>
          <span className={styles.resourceIcon}>🏢</span>
          <span>{organization}</span>
        </div>
      )}
      
      {title && (
        <div className={styles.resourceDetailItem}>
          <span className={styles.resourceIcon}>📖</span>
          <span>
            {title}
            {version && ` v${version}`}
          </span>
        </div>
      )}
      
      {rights && (
        <div className={styles.resourceDetailItem}>
          <span className={styles.resourceIcon}>⚖️</span>
          <span>{rights}</span>
        </div>
      )}
      
      {repositoryUrl && (
        <div className={styles.resourceDetailItem}>
          <a 
            href={repositoryUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.githubLink}
            title={`View ${title || resourceType} source repository`}
            aria-label={`Open ${title || resourceType} source repository on DCS`}
          >
            <TabIcon type="github" className={styles.githubIcon} />
            <span>Source</span>
          </a>
        </div>
      )}
    </div>
  );
} 