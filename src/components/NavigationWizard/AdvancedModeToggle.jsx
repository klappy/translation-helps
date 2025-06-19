/**
 * AdvancedModeToggle.jsx
 * Toggle component for switching between basic and advanced wizard modes
 */

import React from 'react';
import { useReferenceContext } from '../../context/ReferenceContext';
import styles from './AdvancedModeToggle.module.css';

export function AdvancedModeToggle({ className = '' }) {
  const { advancedMode, updateContext, isUsingMixedOrganizations } = useReferenceContext();

  const handleToggle = () => {
    const newAdvancedMode = !advancedMode;
    
    // Show confirmation if switching away from advanced mode with mixed resources
    if (advancedMode && isUsingMixedOrganizations()) {
      const confirmed = window.confirm(
        'Switching to basic mode will reset your mixed organization selections. Continue?'
      );
      if (!confirmed) return;
    }

    updateContext({ advancedMode: newAdvancedMode });
  };

  return (
    <div className={`${styles.toggleContainer} ${className}`} data-testid="advanced-mode-toggle">
      <div className={styles.toggleWrapper}>
        <label className={styles.toggleLabel}>
          <span className={`${styles.modeLabel} ${!advancedMode ? styles.active : ''}`}>
            Basic Mode
          </span>
          
          <div className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={advancedMode}
              onChange={handleToggle}
              className={styles.toggleInput}
              aria-label="Toggle between basic and advanced modes"
            />
            <span className={styles.toggleSlider}></span>
          </div>
          
          <span className={`${styles.modeLabel} ${advancedMode ? styles.active : ''}`}>
            Advanced Mode
          </span>
        </label>
      </div>
      
      <div className={styles.modeDescription}>
        {advancedMode ? (
          <span className={styles.description}>
            Mix resources from different organizations
            {isUsingMixedOrganizations() && (
              <span className={styles.mixedIndicator}> • Using mixed organizations</span>
            )}
          </span>
        ) : (
          <span className={styles.description}>
            Use resources from a single organization
          </span>
        )}
      </div>
    </div>
  );
} 