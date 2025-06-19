/**
 * CompatibilityWarnings.jsx
 * Component to display compatibility warnings for mixed-organization resources
 */

import React from "react";
import styles from "./CompatibilityWarnings.module.css";

export function CompatibilityWarnings({ analysis, isDesktop }) {
  if (!analysis || (!analysis.warnings?.length && !analysis.recommendations?.length)) {
    return null;
  }

  const { warnings = [], recommendations = [], score = 0 } = analysis;

  // Determine overall compatibility level
  const getCompatibilityLevel = (score) => {
    if (score >= 80) return { level: 'high', label: 'High Compatibility', color: 'green' };
    if (score >= 60) return { level: 'medium', label: 'Medium Compatibility', color: 'orange' };
    return { level: 'low', label: 'Low Compatibility', color: 'red' };
  };

  const compatibility = getCompatibilityLevel(score);

  return (
    <div className={`${styles.compatibilityWarnings} ${isDesktop ? styles.desktop : ""}`}>
      {/* Compatibility score header */}
      <div className={`${styles.compatibilityHeader} ${styles[compatibility.level]}`}>
        <div className={styles.compatibilityIcon}>
          {compatibility.level === 'high' && '✅'}
          {compatibility.level === 'medium' && '⚠️'}
          {compatibility.level === 'low' && '❌'}
        </div>
        <div className={styles.compatibilityInfo}>
          <h3 className={styles.compatibilityTitle}>{compatibility.label}</h3>
          <p className={styles.compatibilityScore}>Compatibility Score: {score}%</p>
        </div>
      </div>

      {/* Warnings section */}
      {warnings.length > 0 && (
        <div className={styles.warningsSection}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.warningIcon}>⚠️</span>
            Potential Issues
          </h4>
          <ul className={styles.warningsList}>
            {warnings.map((warning, index) => (
              <li key={index} className={styles.warningItem}>
                <span className={styles.warningType}>{warning.type}:</span>
                <span className={styles.warningMessage}>{warning.message}</span>
                {warning.severity && (
                  <span className={`${styles.severityBadge} ${styles[warning.severity.toLowerCase()]}`}>
                    {warning.severity}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations section */}
      {recommendations.length > 0 && (
        <div className={styles.recommendationsSection}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.recommendationIcon}>💡</span>
            Recommendations
          </h4>
          <ul className={styles.recommendationsList}>
            {recommendations.map((recommendation, index) => (
              <li key={index} className={styles.recommendationItem}>
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expandable details */}
      <details className={styles.compatibilityDetails}>
        <summary className={styles.detailsSummary}>
          View Compatibility Analysis Details
        </summary>
        <div className={styles.detailsContent}>
          <p className={styles.detailsDescription}>
            This analysis compares the selected resources for potential compatibility issues 
            including translation philosophy differences, versioning conflicts, and organizational 
            approach variations.
          </p>
          
          {analysis.organizations && (
            <div className={styles.organizationsInvolved}>
              <h5>Organizations Involved:</h5>
              <ul>
                {analysis.organizations.map((org, index) => (
                  <li key={index}>{org}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.resourceTypes && (
            <div className={styles.resourceTypesInvolved}>
              <h5>Resource Types:</h5>
              <ul>
                {analysis.resourceTypes.map((type, index) => (
                  <li key={index}>{type}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </details>
    </div>
  );
} 