/**
 * FIA Panel - Familiarization, Internalization, Application resources
 * Displays FIA images and maps for Bible study context
 * Follows existing panel patterns with self-activation
 */

import React, { useEffect, useState } from 'react';
import { useResourcesContext } from '../context/ResourcesContext';
import { resolveFiaMediaUrl } from '../services/fiaService';
import styles from './FiaPanel.module.css';

export function FiaPanel() {
  const { resources, activateResource } = useResourcesContext();
  
  // Self-activate FIA resources (following existing panel patterns)
  useEffect(() => {
    activateResource('fia');
  }, [activateResource]);

  const fiaData = resources.fia;

  if (!fiaData || !fiaData.hasContent) {
    return (
      <div className={styles.fiaPanel}>
        <div className={styles.emptyState}>
          <p>No FIA content available for this verse</p>
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
function FiaItem({ item, type }) {
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const mediaUrl = resolveFiaMediaUrl(item.HREF, type);

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
        {!imageError ? (
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