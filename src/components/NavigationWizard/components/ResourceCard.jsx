/**
 * ResourceCard.jsx
 * Unified resource card component that works in both narrow (listing) and wide (header) modes
 */

import React, { useState, useEffect } from "react";
import { fetchResourceManifest } from "../../../services/manifestService";
import styles from "./ResourceCard.module.css";

// Helper function to extract and format metadata from manifest
function getResourceMetadata(manifest, resourceId) {
  if (!manifest) return null;

  const dublinCore = manifest.dublin_core || {};

  // Format version string
  const formatVersion = (version) => {
    if (!version) return null;
    if (typeof version === "number") return `v${version}`;
    if (version.includes("v")) return version;
    return `v${version}`;
  };

  // Format date string
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
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

  return {
    title: manifest.title || dublinCore.title || resourceId.toUpperCase(),
    description: dublinCore.description || manifest.description || null,
    organization: dublinCore.publisher || dublinCore.creator || dublinCore.contributor || null,
    version: formatVersion(dublinCore.version || manifest.version),
    updated: formatDate(dublinCore.modified || dublinCore.issued || manifest.modified),
    license: dublinCore.rights || manifest.license || null,
    language: dublinCore.language || manifest.language,
    subject: dublinCore.subject || manifest.subject,
    identifier: dublinCore.identifier || manifest.identifier || resourceId,
  };
}

export function ResourceCard({
  // Basic card props
  resourceId,
  title = "",
  subtitle = "",
  description = "",
  icon = "",
  avatar = "",
  badge = "",
  selected = false,
  onClick,
  disabled = false,
  loading = false,

  // Resource-specific props
  organization,
  languageId,

  // Layout props
  isDesktop = false,
  layout = "narrow", // narrow (for listing) or wide (for header)
  showMetadata = true,

  // Test props
  "data-testid": testId,
}) {
  const [manifest, setManifest] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState(null);

  // Fetch manifest data when in wide layout or when showMetadata is true
  useEffect(() => {
    let isMounted = true;

    const loadManifest = async () => {
      if (!showMetadata || !organization || !languageId || !resourceId) {
        return;
      }

      try {
        setMetadataLoading(true);
        setMetadataError(null);

        const manifestData = await fetchResourceManifest(organization, languageId, resourceId);

        if (isMounted && manifestData) {
          setManifest(manifestData);
          const resourceMetadata = getResourceMetadata(manifestData, resourceId);
          setMetadata(resourceMetadata);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Failed to load resource manifest:", err);
          setMetadataError(err.message);
        }
      } finally {
        if (isMounted) {
          setMetadataLoading(false);
        }
      }
    };

    loadManifest();

    return () => {
      isMounted = false;
    };
  }, [organization, languageId, resourceId, showMetadata]);

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e) => {
    if (!disabled && !loading && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.();
    }
  };

  // Use metadata title if available, fallback to provided title
  const displayTitle = metadata?.title || title || resourceId?.toUpperCase() || "";
  const displayDescription = description || subtitle;

  // Build CSS classes
  const cardClasses = [
    styles.resourceCard,
    styles[layout], // narrow or wide
    isDesktop ? styles.desktop : "",
    selected ? styles.selected : "",
    disabled ? styles.disabled : "",
    loading ? styles.loading : "",
    onClick ? styles.clickable : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Render icon/avatar
  const renderIcon = () => {
    if (loading) {
      return (
        <div className={styles.loadingContent}>
          <div className={`${styles.loadingSpinner} ${isDesktop ? styles.desktop : ""}`} />
        </div>
      );
    }

    // Check if avatar is a URL (image) or emoji/text
    if (avatar) {
      if (avatar.startsWith("http") || avatar.startsWith("/") || avatar.includes(".")) {
        // It's an image URL
        return (
          <img
            src={avatar}
            alt={displayTitle}
            className={styles.iconImage}
            onError={(e) => {
              e.target.style.display = "none";
              const fallback = e.target.nextElementSibling;
              if (fallback) {
                fallback.style.display = "flex";
              }
            }}
          />
        );
      } else {
        // It's an emoji or text
        return <div className={styles.fallbackIcon}>{avatar}</div>;
      }
    }

    if (icon) {
      return <div className={styles.fallbackIcon}>{icon}</div>;
    }

    // Default placeholder
    return <div className={styles.fallbackIcon}>📄</div>;
  };

  // Render metadata details (now shown in both layouts)
  const renderMetadata = () => {
    if (!showMetadata) return null;
    if (metadataLoading || !metadata) return null;

    const metadataItems = [
      { icon: "🏢", label: "Publisher", value: metadata.organization },
      { icon: "📖", label: "Version", value: metadata.version },
      { icon: "📅", label: "Updated", value: metadata.updated },
      { icon: "⚖️", label: "License", value: metadata.license },
    ].filter((item) => item.value);

    if (metadataItems.length === 0) return null;

    return (
      <div
        className={`${styles.metadata} ${isDesktop ? styles.desktop : ""} ${
          layout === "narrow" ? styles.metadataNarrow : styles.metadataWide
        }`}
      >
        {metadataItems.map((item, index) => (
          <div key={index} className={`${styles.metadataItem} ${isDesktop ? styles.desktop : ""}`}>
            <span className={`${styles.metadataIcon} ${isDesktop ? styles.desktop : ""}`}>
              {item.icon}
            </span>
            <span className={styles.metadataLabel}>{item.label}:</span>
            <span className={styles.metadataValue}>{item.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={cardClasses}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled && !loading ? 0 : -1}
      aria-pressed={onClick ? selected : undefined}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      data-testid={testId}
    >
      {/* Icon/Avatar container */}
      <div className={`${styles.iconContainer} ${isDesktop ? styles.desktop : ""}`}>
        {renderIcon()}
        {/* Fallback icon (hidden by default, shown if image fails) */}
        {avatar && (
          <div className={styles.fallbackIcon} style={{ display: "none" }}>
            {icon || "📄"}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className={`${styles.content} ${isDesktop ? styles.desktop : ""}`}>
        <div className={`${styles.mainContent} ${isDesktop ? styles.desktop : ""}`}>
          <h4 className={`${styles.title} ${isDesktop ? styles.desktop : ""}`}>{displayTitle}</h4>

          {/* Show metadata description in wide layout */}
          {layout === "wide" && metadata?.description && (
            <p className={`${styles.description} ${isDesktop ? styles.desktop : ""}`}>
              {metadata.description}
            </p>
          )}

          {/* Show provided description in narrow layout */}
          {layout === "narrow" && displayDescription && (
            <p className={`${styles.description} ${isDesktop ? styles.desktop : ""}`}>
              {displayDescription}
            </p>
          )}

          {/* Show resource identifier in wide layout */}
          {layout === "wide" && metadata?.identifier && (
            <div className={`${styles.resourceId} ${isDesktop ? styles.desktop : ""}`}>
              {metadata.identifier.toUpperCase()}
            </div>
          )}

          {/* Badge (if provided) */}
          {badge && (
            <div className={`${styles.badge} ${isDesktop ? styles.desktop : ""}`}>
              {typeof badge === "string" ? badge : badge.label || badge.text}
            </div>
          )}

          {/* Resource ID for narrow layout */}
          {layout === "narrow" && resourceId && (
            <div className={`${styles.resourceId} ${isDesktop ? styles.desktop : ""}`}>
              {resourceId.toUpperCase()}
            </div>
          )}
        </div>

        {/* Metadata (shown in both layouts) */}
        {renderMetadata()}
      </div>

      {/* Selection indicator (only for clickable cards) */}
      {onClick && (
        <div className={`${styles.selectionIndicator} ${isDesktop ? styles.desktop : ""}`}>
          <span className={styles.checkIcon}>✓</span>
        </div>
      )}
    </div>
  );
}
