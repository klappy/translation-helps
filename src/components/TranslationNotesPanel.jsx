/**
 * TranslationNotesPanel.jsx - Self-Activating Display Component
 * Enhanced with proper empty verse state messaging
 */

import React, { useContext, useEffect, useState } from "react";
import { RcLinkContext } from "./MainView";
import { ReferenceContext } from "../context/ReferenceContext";
import { useResourcesContext } from "../context/ResourcesContext";
import { processMarkdownWithRcLinks } from "../utils/markdownUtils.jsx";
import { InlineHelpsNavigation } from "./InlineHelpsNavigation";
import { ResourceMetadataCard, HelpsBreadcrumbs } from "./shared";
import styles from "./TranslationNotesPanel.module.css";

export function TranslationNotesPanel({ reference }) {
  const { resources, activateResource } = useResourcesContext();
  const { mixedResources, organization: defaultOrganization, languageId: defaultLanguageId } = useContext(ReferenceContext);
  const [forceNavigation, setForceNavigation] = useState(null);
  const [hasTriedLoading, setHasTriedLoading] = useState(false);
  const { handleRcLinkClick } = useContext(RcLinkContext) || {};

  // Self-activate this resource type (only once on mount)
  useEffect(() => {
    activateResource('notes');
    setHasTriedLoading(true);
  }, []); // Empty dependency array - only run once on mount

  const notes = resources.notes || [];
  const hasNotes = notes && notes.length > 0;

  // Get actual selected resource metadata (not hardcoded defaults)
  const getSelectedResourceMetadata = () => {
    // Check if user has selected a specific resource configuration
    const selectedResource = mixedResources?.notes;
    
    return {
      organization: selectedResource?.organization || defaultOrganization || 'unfoldingWord',
      languageId: selectedResource?.languageId || defaultLanguageId || 'en'
    };
  };

  // Render with available notes

  // Handle breadcrumb navigation
  const handleStartNavigation = (step = 'language') => {
    console.log(`Starting tN navigation at step: ${step}`);
    setForceNavigation(step);
  };

  // Show navigation if forced navigation is active
  if (forceNavigation) {
    return (
      <section data-testid='translation-notes-panel' className={styles.translationNotesPanel}>
        <InlineHelpsNavigation
          resourceType="tn"
          currentReference={reference}
          onResourceSelect={handleRcLinkClick}
          isResourceAvailable={hasNotes}
          forceNavigation={forceNavigation}
          onNavigationComplete={() => setForceNavigation(null)}
        />
      </section>
    );
  }

  // Show empty verse state if we've tried loading and have no notes for this verse
  if (hasTriedLoading && !hasNotes && reference?.verse) {
    // Get actual selected resource metadata instead of hardcoded defaults
    const { organization, languageId } = getSelectedResourceMetadata();

    return (
      <section data-testid='translation-notes-panel' className={styles.translationNotesPanel}>
        {/* Breadcrumbs */}
        <HelpsBreadcrumbs
          resourceType="tn"
          languageId={languageId}
          organization={organization}
          onStartNavigation={handleStartNavigation}
        />

        <h3 className={styles.panelHeader}>
          Notes
          {organization !== 'unfoldingWord' && (
            <span className={styles.orgBadge}>from {organization}</span>
          )}
        </h3>

        <ul className={styles.notesList}>
          <li className={styles.noteCard}>
            <div className={styles.noteText}>
              No translation notes available for this verse.
            </div>
            <div className={styles.noteTags}>
              Current verse: <strong>{reference.bookId} {reference.chapter}:{reference.verse}</strong>
            </div>
            <div className={styles.noteTags}>
              Selected resource: <strong>{organization} • {languageId.toUpperCase()}</strong>
            </div>
          </li>
        </ul>

        <div className={styles.tipSection}>
          <p className={styles.tipText}>
            <span className={styles.tipIcon}>💡</span>
            <span className={styles.tipBold}>Tip:</span> Try navigating to a different verse that may have more content, or select a different organization/language combination.
          </p>
        </div>

        {/* Resource Metadata Card - Moved to bottom */}
        <ResourceMetadataCard
          organization={organization}
          title="Translation Notes"
          languageId={languageId}
          resourceType="tn"
        />
      </section>
    );
  }

  // Show navigation if no notes available and haven't tried loading yet
  if (!hasNotes) {
    return (
      <section data-testid='translation-notes-panel' className={styles.translationNotesPanel}>
        <InlineHelpsNavigation
          resourceType="tn"
          currentReference={reference}
          onResourceSelect={handleRcLinkClick}
          isResourceAvailable={hasNotes}
          forceNavigation={forceNavigation}
          onNavigationComplete={() => setForceNavigation(null)}
        />
      </section>
    );
  }

  // Get metadata from first note (all notes have same metadata)
  const noteMetadata = notes[0] || {};
  const { organization, languageId } = getSelectedResourceMetadata();
  // Fallback to note metadata if somehow no selection exists
  const finalOrganization = organization || noteMetadata.organization || 'unfoldingWord';
  const finalLanguageId = languageId || noteMetadata.languageId || 'en';

  return (
    <section data-testid='translation-notes-panel' className={styles.translationNotesPanel}>
      {/* Breadcrumbs */}
      <HelpsBreadcrumbs
        resourceType="tn"
        languageId={finalLanguageId}
        organization={finalOrganization}
        onStartNavigation={handleStartNavigation}
      />

      <h3 className={styles.panelHeader}>
        Notes
        {finalOrganization !== 'unfoldingWord' && (
          <span className={styles.orgBadge}>from {finalOrganization}</span>
        )}
      </h3>

      <ul className={styles.notesList}>
        {notes.map((note) => (
          <li key={note.id} className={styles.noteCard}>
            {note.quote && (
              <div className={styles.noteQuote}>
                "{note.quote}"
                {note.occurrence && note.occurrence !== "1" && (
                  <span className={styles.noteOccurrence}> (occurrence {note.occurrence})</span>
                )}
              </div>
            )}
            {(() => {
              const lineCount = (note.text || "").split(/\r\n|\r|\n/).length;
              if (lineCount <= 10) {
                return (
                  <div className={styles.noteText}>
                    {processMarkdownWithRcLinks(note.text, (rcUri) => {
                      if (handleRcLinkClick) {
                        handleRcLinkClick(rcUri, finalLanguageId, finalOrganization);
                      }
                    })}
                  </div>
                );
              }
              return (
                <div
                  className={`${styles.noteText} ${styles.collapsibleNote}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.classList.toggle(styles.expanded);
                  }}
                  title='Click to expand/collapse'
                >
                  {processMarkdownWithRcLinks(note.text, (rcUri) => {
                    if (handleRcLinkClick) {
                      handleRcLinkClick(rcUri, finalLanguageId, finalOrganization);
                    }
                  })}
                </div>
              );
            })()}
            {note.tags && <div className={styles.noteTags}>Tags: {note.tags}</div>}
            {note.supportReference && (
              <div className={styles.noteSupportReference}>
                See also:{" "}
                {processMarkdownWithRcLinks(note.supportReference, (rcUri) => {
                  if (handleRcLinkClick) {
                    handleRcLinkClick(rcUri, finalLanguageId, finalOrganization);
                  }
                })}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Resource Metadata Card - Moved to bottom */}
      <ResourceMetadataCard
        organization={finalOrganization}
        title="Translation Notes"
        languageId={finalLanguageId}
        resourceType="tn"
      />
    </section>
  );
}
