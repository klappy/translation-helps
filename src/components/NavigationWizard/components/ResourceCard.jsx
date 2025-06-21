/**
 * ResourceCard.jsx
 * Unified resource card component that works in both narrow (listing) and wide (header) modes
 * Updated with cleaner design and progressive disclosure
 */

import React, { useState, useEffect } from "react";
// Note: manifestService removed after manifest elimination
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
  showMetadata = false, // Changed default to false for cleaner look

  // Test props
  "data-testid": testId,
}) {
  const [manifest, setManifest] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Note: Manifest loading removed after manifest elimination
  // Metadata is now passed as props or derived from resource data

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

  // Render icon/avatar with priority: avatar URL > emoji avatar > icon > default
  const renderIcon = () => {
    if (loading) {
      return (
        <div className={styles.loadingContent}>
          <div className={`${styles.loadingSpinner} ${isDesktop ? styles.desktop : ""}`} />
        </div>
      );
    }

    // Priority: avatar URL > emoji avatar > icon > default
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

    // Default placeholder based on resource type
    return <div className={styles.fallbackIcon}>📄</div>;
  };

  // Get resource type for badge display
  const getResourceTypeBadge = () => {
    if (badge) return badge;
    
    // Derive type from resourceId
    const id = resourceId?.toLowerCase() || "";
    if (id.includes("ult") || id.includes("bible")) return "Bible";
    if (id.includes("tn") || id.includes("notes")) return "Notes";
    if (id.includes("tq") || id.includes("questions")) return "Q&A";
    if (id.includes("tw") || id.includes("words")) return "Words";
    if (id.includes("ta") || id.includes("academy")) return "Guide";
    return null;
  };

  // Render metadata details (progressive disclosure)
  const renderMetadata = () => {
    if (!showMetadata && !showDetails) return null;
    if (metadataLoading || !metadata) return null;

    const metadataItems = [
      { icon: "🏢", label: "Publisher", value: metadata.organization },
      { icon: "📖", label: "Version", value: metadata.version },
      { icon: "📅", label: "Updated", value: metadata.updated },
      { icon: "⚖️", label: "License", value: metadata.license },
    ].filter((item) => item.value);

    if (metadataItems.length === 0) return null;

    return (
      <div className={`${styles.metadata} ${isDesktop ? styles.desktop : ""}`}>
        {metadataItems.map((item, index) => (
          <div key={index} className={`${styles.metadataItem} ${isDesktop ? styles.desktop : ""}`}>
            <span className={styles.metadataIcon}>{item.icon}</span>
            <span className={styles.metadataLabel}>{item.label}:</span>
            <span className={styles.metadataValue}>{item.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const typeBadge = getResourceTypeBadge();

  return (
    <div
      className={cardClasses}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
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
        {avatar && avatar.startsWith("http") && (
          <div className={styles.fallbackIcon} style={{ display: "none" }}>
            {icon || "📄"}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className={`${styles.content} ${isDesktop ? styles.desktop : ""}`}>
        <div className={`${styles.mainContent} ${isDesktop ? styles.desktop : ""}`}>
          <h4 className={`${styles.title} ${isDesktop ? styles.desktop : ""}`}>{displayTitle}</h4>

          {/* Resource type badge - subtle */}
          {typeBadge && (
            <span className={`${styles.typeBadge} ${isDesktop ? styles.desktop : ""}`}>
              {typeof typeBadge === "string" ? typeBadge : typeBadge.label || typeBadge.text}
            </span>
          )}

          {/* Description - only show in wide layout or on hover */}
          {(layout === "wide" || showDetails) && displayDescription && (
            <p className={`${styles.description} ${isDesktop ? styles.desktop : ""}`}>
              {displayDescription}
            </p>
          )}
        </div>

        {/* Metadata - progressive disclosure */}
        {renderMetadata()}
      </div>

      {/* Selection indicator - minimal and clean */}
      {onClick && selected && (
        <div className={`${styles.selectionIndicator} ${isDesktop ? styles.desktop : ""}`}>
          <span className={styles.checkIcon}>✓</span>
        </div>
      )}
    </div>
  );
}
