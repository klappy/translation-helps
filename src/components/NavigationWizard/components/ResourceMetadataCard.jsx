/**
 * ResourceMetadataCard.jsx
 * Reusable component for displaying resource metadata with manifest data
 */

import React, { useState, useEffect } from "react";
// Note: manifestService removed after manifest elimination
import styles from "../NavigationWizard.module.css";

// Helper function to extract and format metadata from manifest
function getResourceMetadata(manifest, resourceId) {
  if (!manifest) return null;

  const dublinCore = manifest.dublin_core || {};

  // Format version string
  const formatVersion = (version) => {
    if (!version) return "Unknown Version";
    if (typeof version === "number") return `v${version}`;
    if (version.includes("v")) return version;
    return `v${version}`;
  };

  // Format date string
  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown Date";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Get resource type display name
  const getResourceTypeDisplay = (id) => {
    const types = {
      ult: "Literal Text Bible",
      ust: "Simplified Text Bible",
      utn: "Translation Notes",
      utq: "Translation Questions",
      utw: "Translation Words",
      tw: "Translation Words",
      tn: "Translation Notes",
      tq: "Translation Questions",
      ta: "Translation Academy",
      obs: "Open Bible Stories",
    };
    return types[id.toLowerCase()] || "Bible Resource";
  };

  return {
    title: manifest.title || dublinCore.title || getResourceTypeDisplay(resourceId),
    organization:
      dublinCore.publisher || dublinCore.creator || dublinCore.contributor || "Unknown Publisher",
    version: formatVersion(dublinCore.version || manifest.version),
    updated: formatDate(dublinCore.modified || dublinCore.issued || manifest.modified),
    license: dublinCore.rights || manifest.license || "Unknown License",
    language: dublinCore.language || manifest.language,
    subject: dublinCore.subject || manifest.subject || "Bible",
  };
}

export function ResourceMetadataCard({
  organization,
  languageId,
  resourceId,
  isDesktop,
  showTitle = true,
  compact = false,
}) {
  const [manifest, setManifest] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Note: Manifest loading removed after manifest elimination
  // Generate basic metadata from props
  useEffect(() => {
    const getResourceTypeDisplay = (id) => {
      const types = {
        ult: "Literal Text Bible",
        ust: "Simplified Text Bible", 
        utn: "Translation Notes",
        utq: "Translation Questions",
        utw: "Translation Words",
        tw: "Translation Words",
        tn: "Translation Notes",
        tq: "Translation Questions",
        ta: "Translation Academy",
        obs: "Open Bible Stories",
      };
      return types[id.toLowerCase()] || "Bible Resource";
    };

    // Create basic metadata from props (no manifest needed)
    const basicMetadata = {
      title: getResourceTypeDisplay(resourceId),
      organization: organization || "Unknown Publisher",
      version: "Latest",
      updated: "Recently",
      license: "CC BY-SA 4.0",
    };

    setMetadata(basicMetadata);
    setLoading(false);
  }, [organization, languageId, resourceId]);

  // Don't render anything while loading or if no data
  if (loading || !metadata) {
    return null;
  }

  if (error) {
    return (
      <div
        className={`${styles.resourceMetadata} ${isDesktop ? styles.desktop : ""} ${
          compact ? styles.compact : ""
        }`}
      >
        <div className={styles.errorMessage}>Unable to load resource details</div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.resourceMetadata} ${isDesktop ? styles.desktop : ""} ${
        compact ? styles.compact : ""
      }`}
    >
      <div>
        {showTitle && (
          <h3 className={`${styles.resourceTitle} ${isDesktop ? styles.desktop : ""}`}>
            {metadata.title}
          </h3>
        )}
        <div className={`${styles.resourceDetails} ${isDesktop ? styles.desktop : ""}`}>
          <div className={`${styles.resourceDetail} ${isDesktop ? styles.desktop : ""}`}>
            <span className={`${styles.resourceIcon} ${isDesktop ? styles.desktop : ""}`}>🏢</span>
            <span className={styles.resourceLabel}>Publisher:</span>
            <span className={styles.resourceValue}>{metadata.organization}</span>
          </div>
          <div className={`${styles.resourceDetail} ${isDesktop ? styles.desktop : ""}`}>
            <span className={`${styles.resourceIcon} ${isDesktop ? styles.desktop : ""}`}>📖</span>
            <span className={styles.resourceLabel}>Version:</span>
            <span className={styles.resourceValue}>{metadata.version}</span>
          </div>
          <div className={`${styles.resourceDetail} ${isDesktop ? styles.desktop : ""}`}>
            <span className={`${styles.resourceIcon} ${isDesktop ? styles.desktop : ""}`}>📅</span>
            <span className={styles.resourceLabel}>Updated:</span>
            <span className={styles.resourceValue}>{metadata.updated}</span>
          </div>
          <div className={`${styles.resourceDetail} ${isDesktop ? styles.desktop : ""}`}>
            <span className={`${styles.resourceIcon} ${isDesktop ? styles.desktop : ""}`}>⚖️</span>
            <span className={styles.resourceLabel}>License:</span>
            <span className={styles.resourceValue}>{metadata.license}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
