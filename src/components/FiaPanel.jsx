/**
 * FIA Panel - Familiarization, Internalization, Application resources
 * Displays FIA images and maps for Bible study context
 * Follows existing panel patterns with self-activation
 */

import React, { useEffect, useState } from 'react';
import { useResourcesContext } from '../context/ResourcesContext';
import { ResourceMetadataCard, HelpsBreadcrumbs } from './shared';
import styles from './FiaPanel.module.css';

export function FiaPanel({ reference }) {
  const { resources, activateResource } = useResourcesContext();
  const [hasTriedLoading, setHasTriedLoading] = useState(false);
  
  // Self-activate FIA resources (following existing panel patterns)
  useEffect(() => {
    activateResource('fia');
    setHasTriedLoading(true);
  }, [activateResource]);

  const fiaData = resources.fia;
  const hasFiaContent = fiaData && fiaData.hasContent && 
    ((fiaData.images && fiaData.images.length > 0) || (fiaData.maps && fiaData.maps.length > 0));

  // Show empty state with consistent styling
  if (hasTriedLoading && !hasFiaContent && reference?.verse) {
    // Get default metadata for consistent styling
    const organization = 'BurritoTruck';
    const languageId = 'en';

    return (
      <section data-testid='fia-panel' className={styles.fiaPanel}>
        {/* Breadcrumbs */}
        <HelpsBreadcrumbs
          resourceType="fia"
          languageId={languageId}
          organization={organization}
          onStartNavigation={() => {}}
        />

        {/* Resource Metadata Card */}
        <ResourceMetadataCard
          organization={organization}
          title="FIA Resources"
          languageId={languageId}
          resourceType="fia"
        />

        <h3 className={styles.panelHeader}>
          FIA
          <span className={styles.orgBadge}>from {organization}</span>
        </h3>

        <div className={styles.itemsGrid}>
          <div className={styles.fiaItem}>
            <div className={styles.itemHeader}>
              <span className={styles.reference}>No FIA Resources</span>
            </div>
            <div className={styles.mediaContainer}>
              <div className={styles.mediaFallback}>
                <span className={styles.fallbackIcon}>🗺️</span>
                <p>No FIA images or maps available for this verse.</p>
                <small>Current verse: <strong>{reference.bookId} {reference.chapter}:{reference.verse}</strong></small>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tipSection}>
          <p className={styles.tipText}>
            <span className={styles.tipIcon}>💡</span>
            <span className={styles.tipBold}>Tip:</span> Try navigating to a different verse that may have more content.
          </p>
        </div>
      </section>
    );
  }

  // Show loading state if not tried loading yet
  if (!hasFiaContent) {
    return (
      <div className={styles.fiaPanel}>
        <div className={styles.emptyState}>
          <p>Loading FIA content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fiaPanel}>
      <div className={styles.header}>
        <h3>FIA Resources</h3>
        <p className={styles.subtitle}>Visual context for Bible study</p>
      </div>

      {fiaData.images && fiaData.images.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            📸 Images ({fiaData.images.length})
          </h4>
          <div className={styles.itemsGrid}>
            {fiaData.images.map((item, index) => (
              <FiaItem 
                key={`image-${index}`} 
                item={item} 
                type="images"
                fiaData={fiaData}
              />
            ))}
          </div>
        </div>
      )}

      {fiaData.maps && fiaData.maps.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            🗺️ Maps ({fiaData.maps.length})
          </h4>
          <div className={styles.itemsGrid}>
            {fiaData.maps.map((item, index) => (
              <FiaItem 
                key={`map-${index}`} 
                item={item} 
                type="maps"
                fiaData={fiaData}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual FIA item component with media display
 */
function FiaItem({ item, type, fiaData }) {
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Use the resolveMediaUrl function from fiaData which has the correct repository URLs
  const mediaUrl = fiaData?.resolveMediaUrl ? fiaData.resolveMediaUrl(item.HREF, type) : null;

  return (
    <div className={styles.fiaItem}>
      <div className={styles.itemHeader}>
        <span className={styles.reference}>{item.REF}</span>
        <button 
          className={styles.toggleButton}
          onClick={() => setShowDetails(!showDetails)}
          title="Show details"
        >
          {showDetails ? '▼' : '▶'}
        </button>
      </div>

      {/* Media display with fallback */}
      <div className={styles.mediaContainer}>
        {!imageError && mediaUrl ? (
          <img
            src={mediaUrl}
            alt={`FIA ${type} for ${item.REF}`}
            className={styles.mediaImage}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={styles.mediaFallback}>
            <span className={styles.fallbackIcon}>
              {type === 'images' ? '🖼️' : '🗺️'}
            </span>
            <p>Media not available</p>
            <small>{item.HREF}</small>
            {mediaUrl && <small>URL: {mediaUrl}</small>}
          </div>
        )}
      </div>

      {/* Expandable details */}
      {showDetails && (
        <div className={styles.itemDetails}>
          <div className={styles.detailRow}>
            <strong>ID:</strong> {item.ID || 'N/A'}
          </div>
          <div className={styles.detailRow}>
            <strong>Path:</strong> {item.HREF || 'N/A'}
          </div>
          <div className={styles.detailRow}>
            <strong>Resolved URL:</strong> {mediaUrl || 'N/A'}
          </div>
          {item.TAGS && (
            <div className={styles.detailRow}>
              <strong>Tags:</strong> {item.TAGS}
            </div>
          )}
          {item.SUPPORT && (
            <div className={styles.detailRow}>
              <strong>Support:</strong> {item.SUPPORT}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 