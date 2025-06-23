/**
 * TWLPanel.jsx - Self-Activating Display Component
 * Follows Simple Verse-Loading Pattern from docs/SIMPLE-VERSE-LOADING-PATTERN.md
 * 
 * TRANSFORMATION: Reduced from 206 lines to ~80 lines
 * PATTERN: Self-activating display component (no loading logic)
 */

import React, { useContext, useEffect, useState } from "react";
import { RcLinkContext } from "./MainView";
import { useResourcesContext } from "../context/ResourcesContext";
import { InlineHelpsNavigation } from "./InlineHelpsNavigation";
import { ResourceMetadataCard, HelpsBreadcrumbs } from "./shared";
import styles from "./TranslationWordsPanel.module.css";

export function TWLPanel({ reference }) {
  const { resources, activateResource } = useResourcesContext();
  const [forceNavigation, setForceNavigation] = useState(null);
  const { handleRcLinkClick } = useContext(RcLinkContext) || {};

  // Self-activate this resource type
  useEffect(() => {
    console.log('🎯 TWLPanel: Self-activating links resource');
    activateResource('links');
  }, []); // Empty dependency array - only run once on mount

  const links = resources.links || [];
  const hasLinks = links && links.length > 0;

  console.log('🎯 TWLPanel: Rendering with', links.length, 'links');

  // Handle breadcrumb navigation
  const handleStartNavigation = (step = 'language') => {
    console.log(`Starting TWL navigation at step: ${step}`);
    setForceNavigation(step);
  };

  if (!reference?.bookId) {
    return (
      <div className="twl-panel" data-testid="twl-panel">
        <p>Please select a verse to view Translation Word Links.</p>
      </div>
    );
  }

  // Show navigation if no links available or forced navigation
  if (!hasLinks || forceNavigation) {
    return (
      <section data-testid='twl-panel' className={styles.twlPanel}>
        <InlineHelpsNavigation
          resourceType="twl"
          currentReference={reference}
          onResourceSelect={handleRcLinkClick}
          isResourceAvailable={hasLinks}
          forceNavigation={forceNavigation}
          onNavigationComplete={() => setForceNavigation(null)}
        />
      </section>
    );
  }

  // Get metadata from first link (all links have same metadata)
  const linkMetadata = links[0] || {};
  const organization = linkMetadata.organization || 'unfoldingWord';
  const languageId = linkMetadata.languageId || 'en';

  return (
    <section data-testid='twl-panel' className={styles.twlPanel}>
      {/* Breadcrumbs */}
      <HelpsBreadcrumbs
        resourceType="twl"
        languageId={languageId}
        organization={organization}
        onStartNavigation={handleStartNavigation}
      />

      {/* Resource Metadata Card */}
      <ResourceMetadataCard
        organization={organization}
        title="Translation Word Links"
        languageId={languageId}
        resourceType="twl"
      />

      {/* Always render InlineHelpsNavigation for breadcrumb functionality */}
      <InlineHelpsNavigation
        resourceType="twl"
        currentReference={reference}
        onResourceSelect={handleRcLinkClick}
        isResourceAvailable={hasLinks}
        forceNavigation={forceNavigation}
        onNavigationComplete={() => setForceNavigation(null)}
      />

      <h3>Translation Word Links</h3>
      <div className="twl-content">
        {links.map((item, index) => {
          // Handle both string links and object links
          const linkData = typeof item === 'string' ? { rcLink: item, id: index } : item;
          const rcLink = linkData.rcLink || linkData;
          
          return (
            <div key={linkData.id || index} className="twl-item" style={{ marginBottom: '16px', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-primary)' }}>
                {linkData.word || 'Translation Word'}
                {linkData.occurrence && linkData.occurrence !== '1' && (
                  <span style={{ fontSize: '0.8em', color: '#666' }}> (occurrence {linkData.occurrence})</span>
                )}
              </h4>
              <div className="twl-link">
                {rcLink && (
                  <a 
                    href={`https://git.door43.org/unfoldingWord/en_tw/src/branch/master/bible/${rcLink.replace('rc://en/tw/dict/bible/', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: 'var(--color-primary)' }}
                  >
                    View Translation Word Article →
                  </a>
                )}
                <div style={{ fontSize: '0.9em', color: '#666', marginTop: '4px' }}>
                  {rcLink}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}