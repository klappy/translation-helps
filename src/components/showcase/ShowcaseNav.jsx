/**
 * ShowcaseNav.jsx
 * Sidebar navigation for the documentation showcase
 * Displays organized sections and subsections
 */

import React from 'react';
import styles from './ShowcaseNav.module.css';

const showcaseSections = [
  {
    id: 'overview',
    title: '🏠 Overview',
    description: 'Project introduction and showcase purpose'
  },
  {
    id: 'architecture',
    title: '🏗️ Architecture Gallery',
    description: 'Design patterns and system architecture',
    subsections: [
      { id: 'simple-pattern', title: 'Simple Verse-Loading Pattern' },
      { id: 'self-activating', title: 'Self-Activating Panels' },
      { id: 'url-driven', title: 'URL-Driven State' },
      { id: 'cross-org', title: 'Cross-Organization Support' }
    ]
  },
  {
    id: 'components',
    title: '🎨 Component Showcase',
    description: 'Interactive UI components and examples',
    subsections: [
      { id: 'navigation-wizard', title: 'Navigation Wizard' },
      { id: 'scripture-panel', title: 'Scripture Panel' },
      { id: 'translation-helps', title: 'Translation Helps' },
      { id: 'theme-system', title: 'Theme System' }
    ]
  },
  {
    id: 'performance',
    title: '⚡ Performance Victories',
    description: 'Optimization achievements and metrics',
    subsections: [
      { id: 'api-optimization', title: '90% API Optimization' },
      { id: 'loading-states', title: 'Loading States' },
      { id: 'error-handling', title: 'Error Handling' }
    ]
  },
  {
    id: 'innovation',
    title: '💡 Innovation Highlights',
    description: 'Cutting-edge features and capabilities',
    subsections: [
      { id: 'twl-integration', title: 'TWL Integration' },
      { id: 'fia-resources', title: 'FIA Resources' },
      { id: 'llm-chat', title: 'LLM Chat' },
      { id: 'rc-links', title: 'RC Links' }
    ]
  },
  {
    id: 'interactive',
    title: '🎮 Interactive Experiences',
    description: 'Hands-on demos and playgrounds',
    subsections: [
      { id: 'live-playground', title: 'Live Playground' },
      { id: 'pattern-explorer', title: 'Pattern Explorer' },
      { id: 'api-explorer', title: 'API Explorer' }
    ]
  },
  {
    id: 'metrics',
    title: '📊 Metrics & Achievements',
    description: 'Project statistics and impact',
    subsections: [
      { id: 'project-stats', title: 'Project Statistics' },
      { id: 'evolution-timeline', title: 'Architecture Evolution' },
      { id: 'community-impact', title: 'Community Impact' }
    ]
  }
];

export function ShowcaseNav({ selectedSection, onSectionSelect }) {
  const handleSectionClick = (sectionId) => {
    onSectionSelect(sectionId);
  };

  const isActive = (sectionId) => {
    return selectedSection === sectionId || selectedSection?.startsWith(sectionId);
  };

  return (
    <nav className={styles.navContainer}>
      {/* Header */}
      <div className={styles.navHeader}>
        <h2 className={styles.navTitle}>
          🚀 Translation Helps Showcase
        </h2>
        <p className={styles.navSubtitle}>
          Explore our achievements and get inspired!
        </p>
      </div>

      {/* Navigation Items */}
      <div className={styles.navItems}>
        {showcaseSections.map((section) => (
          <div key={section.id} className={styles.navSection}>
            <button
              className={`${styles.navButton} ${isActive(section.id) ? styles.active : ''}`}
              onClick={() => handleSectionClick(section.id)}
              title={section.description}
            >
              <span className={styles.navButtonTitle}>{section.title}</span>
              {section.subsections && (
                <span className={styles.navButtonArrow}>
                  {isActive(section.id) ? '▼' : '▶'}
                </span>
              )}
            </button>

            {/* Subsections */}
            {section.subsections && isActive(section.id) && (
              <div className={styles.navSubsections}>
                {section.subsections.map((subsection) => (
                  <button
                    key={subsection.id}
                    className={`${styles.navSubButton} ${selectedSection === `${section.id}/${subsection.id}` ? styles.activeSubsection : ''}`}
                    onClick={() => handleSectionClick(`${section.id}/${subsection.id}`)}
                  >
                    {subsection.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={styles.navFooter}>
        <p className={styles.navFooterText}>
          Built with the Translation Helps architecture
        </p>
        <div className={styles.navFooterLinks}>
          <a href="/" className={styles.navFooterLink}>← Back to App</a>
          <a href="https://github.com/klappy/translation-helps" target="_blank" rel="noopener noreferrer" className={styles.navFooterLink}>
            GitHub →
          </a>
        </div>
      </div>
    </nav>
  );
} 