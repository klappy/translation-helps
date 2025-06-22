/**
 * TranslationWordsPanel.jsx - Self-Activating Display Component
 * Enhanced with proper empty verse state messaging
 */

import React, { useContext, useEffect, useState } from "react";
import { RcLinkContext } from "./MainView";
import { useResourcesContext } from "../context/ResourcesContext";
import { processRcLinks, RcLink } from "../utils/rcLinkUtils.jsx";
import { InlineHelpsNavigation } from "./InlineHelpsNavigation";
import { ResourceMetadataCard, HelpsBreadcrumbs } from "./shared";
import styles from "./TranslationWordsPanel.module.css";

/**
 * Extracts a summary from article content (first sentence or paragraph)
 * @param {string} content - Article content
 * @returns {string} Summary text
 */
function extractSummary(content) {
  if (!content) return "";

  // Find first definition section or paragraph
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and headers
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Return first meaningful sentence/paragraph
    if (trimmed.length > 20) {
      return trimmed.split(".")[0] + ".";
    }
  }

  return content.substring(0, 150) + (content.length > 150 ? "..." : "");
}

export function TranslationWordsPanel({ reference, onWordClick }) {
  const { resources, activateResource } = useResourcesContext();
  const [forceNavigation, setForceNavigation] = useState(null);
  const [hasTriedLoading, setHasTriedLoading] = useState(false);
  const { handleRcLinkClick } = useContext(RcLinkContext) || {};

  // Self-activate both words and links resource types
  useEffect(() => {
    console.log('🎯 TranslationWordsPanel: Self-activating words and links resources');
    activateResource('words');
    activateResource('links');
    setHasTriedLoading(true);
  }, [activateResource]);

  const words = resources.words || [];
  const links = resources.links || [];
  const hasWords = words && words.length > 0;

  console.log('🎯 TranslationWordsPanel: Rendering with', words.length, 'words and', links.length, 'links');

  // Handle breadcrumb navigation
  const handleStartNavigation = (step = 'language') => {
    console.log(`Starting tW navigation at step: ${step}`);
    setForceNavigation(step);
  };

  const handleWordClick = (word) => {
    // First try the provided callback
    if (onWordClick) {
      onWordClick(word);
      return;
    }

    // If no callback provided, and we have the rc link context, open as new tab
    if (handleRcLinkClick && word.rcUri) {
      handleRcLinkClick(word.rcUri, word.languageId, word.organization);
    }
  };

  if (!reference?.verse) {
    return (
      <section data-testid='translation-words-panel' className={styles.translationWordsPanel}>
        <p className={styles.emptyState}>Select a verse to view translation words.</p>
      </section>
    );
  }

  // Show navigation if forced navigation is active
  if (forceNavigation) {
    return (
      <section data-testid='translation-words-panel' className={styles.translationWordsPanel}>
        <InlineHelpsNavigation
          resourceType="tw"
          currentReference={reference}
          onResourceSelect={handleRcLinkClick}
          isResourceAvailable={hasWords}
          forceNavigation={forceNavigation}
          onNavigationComplete={() => setForceNavigation(null)}
        />
        {links.length > 0 && (
          <details className={styles.debugInfo}>
            <summary className={styles.debugSummary}>Debug Info</summary>
            <p>Found {links.length} TWL link(s) for this verse:</p>
            <ul className={styles.debugList}>
              {links.map((link, index) => (
                <li key={`debug-link-${index}-${typeof link === 'string' ? link : link.rcLink || 'unknown'}`} className={styles.debugItem}>
                  {typeof link === 'string' ? link : link.rcLink || 'Unknown link'}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
    );
  }

  // Show empty verse state if we've tried loading and have no words for this verse
  if (hasTriedLoading && !hasWords && reference?.verse) {
    // Get default metadata for consistent styling
    const organization = 'unfoldingWord';
    const languageId = 'en';

    return (
      <section data-testid='translation-words-panel' className={styles.translationWordsPanel}>
        {/* Breadcrumbs */}
        <HelpsBreadcrumbs
          resourceType="tw"
          languageId={languageId}
          organization={organization}
          onStartNavigation={handleStartNavigation}
        />

        {/* Resource Metadata Card */}
        <ResourceMetadataCard
          organization={organization}
          title="Translation Words"
          languageId={languageId}
          resourceType="tw"
        />

        <h3 className={styles.panelHeader}>
          Words
          {organization !== 'unfoldingWord' && (
            <span className={styles.orgBadge}>from {organization}</span>
          )}
        </h3>

        <div className={styles.wordsList}>
          <div className={styles.wordCard}>
            <h4 className={styles.wordTitle}>
              No Translation Words
            </h4>
            <p className={styles.wordSummary}>
              No translation words are linked to this verse.
            </p>
            <p className={styles.rcLink}>
              Current verse: <strong>{reference.bookId} {reference.chapter}:{reference.verse}</strong>
            </p>
          </div>

          <div className={styles.tipSection}>
            <p className={styles.tipText}>
              <span className={styles.tipIcon}>💡</span>
              <span className={styles.tipBold}>Tip:</span> Try navigating to a different verse that may have more content.
            </p>
          </div>
        </div>

        {links.length > 0 && (
          <details className={styles.debugInfo}>
            <summary className={styles.debugSummary}>Debug Info</summary>
            <p>Found {links.length} TWL link(s) but no articles loaded.</p>
            <ul className={styles.debugList}>
              {links.map((link, index) => (
                <li key={`empty-debug-link-${index}-${typeof link === 'string' ? link : link.rcLink || 'unknown'}`} className={styles.debugItem}>
                  {typeof link === 'string' ? link : link.rcLink || 'Unknown link'}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
    );
  }

  // Show navigation if no words available and haven't tried loading yet
  if (!hasWords) {
    return (
      <section data-testid='translation-words-panel' className={styles.translationWordsPanel}>
        <InlineHelpsNavigation
          resourceType="tw"
          currentReference={reference}
          onResourceSelect={handleRcLinkClick}
          isResourceAvailable={hasWords}
          forceNavigation={forceNavigation}
          onNavigationComplete={() => setForceNavigation(null)}
        />
        {links.length > 0 && (
          <details className={styles.debugInfo}>
            <summary className={styles.debugSummary}>Debug Info</summary>
            <p>Found {links.length} TWL link(s) for this verse:</p>
            <ul className={styles.debugList}>
              {links.map((link, index) => (
                <li key={`debug-link-${index}-${typeof link === 'string' ? link : link.rcLink || 'unknown'}`} className={styles.debugItem}>
                  {typeof link === 'string' ? link : link.rcLink || 'Unknown link'}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
    );
  }

  // Get metadata from first word (all words have same metadata)
  const wordMetadata = words[0] || {};
  const organization = wordMetadata.organization || 'unfoldingWord';
  const languageId = wordMetadata.languageId || 'en';

  return (
    <section data-testid='translation-words-panel' className={styles.translationWordsPanel}>
      {/* Breadcrumbs */}
      <HelpsBreadcrumbs
        resourceType="tw"
        languageId={languageId}
        organization={organization}
        onStartNavigation={handleStartNavigation}
      />

      {/* Resource Metadata Card */}
      <ResourceMetadataCard
        organization={organization}
        title="Translation Words"
        languageId={languageId}
        resourceType="tw"
      />

      {/* Always render InlineHelpsNavigation for breadcrumb functionality */}
      <InlineHelpsNavigation
        resourceType="tw"
        currentReference={reference}
        onResourceSelect={handleRcLinkClick}
        isResourceAvailable={hasWords}
        forceNavigation={forceNavigation}
        onNavigationComplete={() => setForceNavigation(null)}
      />

      <h3 className={styles.panelHeader}>
        Words
        {organization !== 'unfoldingWord' && (
          <span className={styles.orgBadge}>from {organization}</span>
        )}
      </h3>

      <div className={styles.wordsList}>
        {words.map((word) => {
          const isClickable = onWordClick || (handleRcLinkClick && word.rcUri);
          // Use existing summary if available, otherwise extract from content
          const summary = word.summary || extractSummary(word.content);
          
          return (
            <div
              key={word.id}
              className={`${styles.wordCard} ${!isClickable ? styles.nonClickable : ""}`}
              onClick={() => handleWordClick(word)}
            >
              <h4 className={styles.wordTitle}>
                {word.title || word.term}
                {isClickable && (
                  <span className={styles.clickIndicator}>Click to view full article →</span>
                )}
              </h4>

              <p className={styles.wordSummary}>
                {processRcLinks(summary, (rcUri) => {
                  if (handleRcLinkClick) {
                    handleRcLinkClick(rcUri, languageId, organization);
                  }
                })}
              </p>

              {/* Hidden full content for chat context extraction */}
              {word.content && (
                <div className={styles.visuallyHidden} aria-hidden='true'>
                  {word.content}
                </div>
              )}

              {word.rcUri && (
                <p
                  className={styles.rcLink}
                  onClick={(e) => e.stopPropagation()} // Prevent triggering parent onClick
                >
                  <RcLink
                    rcUri={word.rcUri}
                    onRcLinkClick={(rcUri) => {
                      if (handleRcLinkClick) {
                        handleRcLinkClick(rcUri, languageId, organization);
                      }
                    }}
                  >
                    {word.rcUri}
                  </RcLink>
                </p>
              )}
            </div>
          );
        })}

        <div className={styles.tipSection}>
          <p className={styles.tipText}>
            <span className={styles.tipIcon}>💡</span>
            <span className={styles.tipBold}>Tip:</span> These words are linked to this verse
            through Translation Words Links (TWL).
            {(onWordClick || handleRcLinkClick) &&
              " Click any word above to view the complete article."}
          </p>
        </div>
      </div>
    </section>
  );
}
