/**
 * SelectionCard.jsx
 * Card component for displaying selectable items in the wizard
 */

import React, { useState } from "react";
import styles from "./SelectionCard.module.css";

export function SelectionCard({
  id,
  title,
  subtitle,
  icon,
  fallbackIcon,
  badge,
  isSelected = false,
  onClick,
  isDesktop = false,
}) {
  const [imageError, setImageError] = useState(false);

  // Check if icon is a URL (avatar) or emoji/text
  const isAvatarUrl =
    icon && typeof icon === "string" && (icon.startsWith("http") || icon.startsWith("/"));
  const shouldShowAvatar = isAvatarUrl && !imageError;
  const displayIcon = shouldShowAvatar ? null : icon || fallbackIcon;

  // Build CSS classes
  const cardClasses = [
    styles.card,
    isDesktop ? styles.cardDesktop : styles.cardMobile,
    isSelected ? styles.cardSelected : ""
  ].filter(Boolean).join(" ");

  const iconClasses = [
    styles.icon,
    isDesktop ? styles.iconDesktop : styles.iconMobile
  ].join(" ");

  const avatarClasses = [
    styles.avatar,
    isDesktop ? styles.avatarDesktop : styles.avatarMobile
  ].join(" ");

  const titleClasses = [
    styles.title,
    isDesktop ? styles.titleDesktop : styles.titleMobile,
    isSelected ? styles.titleSelected : ""
  ].filter(Boolean).join(" ");

  const subtitleClasses = [
    styles.subtitle,
    isDesktop ? styles.subtitleDesktop : styles.subtitleMobile,
    isSelected ? styles.subtitleSelected : ""
  ].filter(Boolean).join(" ");

  const checkmarkClasses = [
    styles.checkmark,
    isDesktop ? styles.checkmarkDesktop : styles.checkmarkMobile
  ].join(" ");

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      data-testid={`selection-card-${id}`}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {shouldShowAvatar ? (
        <img 
          src={icon} 
          alt={title} 
          className={avatarClasses} 
          onError={() => setImageError(true)} 
        />
      ) : (
        displayIcon && <div className={iconClasses}>{displayIcon}</div>
      )}

      <div className={styles.content}>
        <h3 className={titleClasses}>{title}</h3>
        {subtitle && <p className={subtitleClasses}>{subtitle}</p>}
      </div>

      {badge && <div className={styles.badge}>{badge}</div>}

      {isSelected && <div className={checkmarkClasses}>✓</div>}
    </div>
  );
}
