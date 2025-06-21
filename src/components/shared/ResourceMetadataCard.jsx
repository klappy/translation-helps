/**
 * ResourceMetadataCard.jsx
 * Reusable resource metadata card component for displaying organization, title, and license
 * Matches the Scripture panel's resource details styling
 */

import React from 'react';
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
    </div>
  );
} 