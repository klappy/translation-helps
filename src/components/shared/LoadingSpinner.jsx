/**
 * LoadingSpinner.jsx
 * Beautiful, accessible loading spinner with multiple variants
 * Follows ETEN Lab design system
 */

import React from 'react';
import styles from './LoadingSpinner.module.css';

export const LoadingSpinner = ({ 
  size = 'medium', 
  variant = 'primary', 
  text = null,
  className = '',
  'aria-label': ariaLabel = 'Loading...'
}) => {
  const spinnerClasses = [
    styles.spinner,
    styles[size],
    styles[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.container} role="status" aria-label={ariaLabel}>
      <div className={spinnerClasses}>
        <div className={styles.ring}></div>
        <div className={styles.ring}></div>
        <div className={styles.ring}></div>
      </div>
      {text && (
        <div className={styles.text} aria-live="polite">
          {text}
        </div>
      )}
    </div>
  );
};

export const LoadingOverlay = ({ 
  isVisible, 
  text = 'Loading...', 
  children,
  className = ''
}) => {
  if (!isVisible) return children;

  return (
    <div className={`${styles.overlayContainer} ${className}`}>
      <div className={styles.overlay}>
        <LoadingSpinner size="large" text={text} />
      </div>
      <div className={styles.overlayContent}>
        {children}
      </div>
    </div>
  );
};

export const LoadingCard = ({ 
  text = 'Loading content...', 
  height = '200px',
  className = ''
}) => {
  return (
    <div 
      className={`${styles.loadingCard} ${className}`}
      style={{ minHeight: height }}
    >
      <LoadingSpinner size="medium" text={text} />
    </div>
  );
}; 