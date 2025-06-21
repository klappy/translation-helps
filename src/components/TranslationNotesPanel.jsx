/**
 * TranslationNotesPanel.jsx - Self-Activating Display Component
 * Follows Simple Verse-Loading Pattern from docs/SIMPLE-VERSE-LOADING-PATTERN.md
 * 
 * TRANSFORMATION: Reduced from 213 lines to ~40 lines
 * PATTERN: Self-activating display component (no loading logic)
 */

import React, { useContext, useEffect, useState } from "react";
import { RcLinkContext } from "./MainView";
import { useResourcesContext } from "../context/ResourcesContext";
import { processMarkdownWithRcLinks } from "../utils/markdownUtils.jsx";
import { InlineHelpsNavigation } from "./InlineHelpsNavigation";
import { ResourceMetadataCard, HelpsBreadcrumbs } from "./shared";
import styles from "./TranslationNotesPanel.module.css";

export function TranslationNotesPanel({ reference }) {
  const { resources, activateResource } = useResourcesContext();
  const [forceNavigation, setForceNavigation] = useState(null);
  const { handleRcLinkClick } = useContext(RcLinkContext) || {};

  // Self-activate this resource type
  useEffect(() => {
    console.log('🎯 TranslationNotesPanel: Self-activating notes resource');
    activateResource('notes');
  }, [activateResource]);

  const notes = resources.notes || [];
  const hasNotes = notes && notes.length > 0;

  console.log('🎯 TranslationNotesPanel: Rendering with', notes.length, 'notes');

  // Handle breadcrumb navigation
  const handleStartNavigation = (step = 'language') => {
    console.log(`Starting tN navigation at step: ${step}`);
    setForceNavigation(step);
  };

  // Show navigation if no notes available or forced navigation
  if (!hasNotes || forceNavigation) {
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
  const organization = noteMetadata.organization || 'unfoldingWord';
  const languageId = noteMetadata.languageId || 'en';

  return (
    <section data-testid='translation-notes-panel' className={styles.translationNotesPanel}>
      {/* Breadcrumbs */}
      <HelpsBreadcrumbs
        resourceType="tn"
        languageId={languageId}
        organization={organization}
        onStartNavigation={handleStartNavigation}
      />

      {/* Resource Metadata Card */}
      <ResourceMetadataCard
        organization={organization}
        title="Translation Notes"
        languageId={languageId}
        resourceType="tn"
      />

      <h3 className={styles.panelHeader}>
        Translation Notes
        {organization !== 'unfoldingWord' && (
          <span className={styles.orgBadge}>from {organization}</span>
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
                        handleRcLinkClick(rcUri, languageId, organization);
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
                      handleRcLinkClick(rcUri, languageId, organization);
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
                    handleRcLinkClick(rcUri, languageId, organization);
                  }
                })}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
