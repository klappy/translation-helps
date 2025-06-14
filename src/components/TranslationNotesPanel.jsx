/**
 * TranslationNotesPanel.jsx
 * Table of tN entries.
 */

import React, { useContext, useEffect, useState } from "react";
import { ManifestsContext } from "../context/MultiManifestsContext";
import { RcLinkContext } from "./MainView";
import { ReferenceContext } from "../context/ReferenceContext";
import { getNotesForVerse, getNotesForBook } from "../services/tnService";
import { processMarkdownWithRcLinks } from "../utils/markdownUtils.jsx";
import styles from "./TranslationNotesPanel.module.css";

export function TranslationNotesPanel({ reference }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { manifests } = useContext(ManifestsContext);
  const { handleRcLinkClick } = useContext(RcLinkContext) || {};
  const { organization, languageId } = useContext(ReferenceContext);

  useEffect(() => {
    async function loadNotes() {
      if (!reference?.bookId) {
        setNotes([]);
        setError(null); // Clear any previous errors
        return;
      }

      // Check if we have required context
      if (!organization || !languageId) {
        if (!organization) {
          setError(
            "Please select an organization from the dropdown above to view translation notes."
          );
        } else if (!languageId) {
          setError("Please select a language from the dropdown above to view translation notes.");
        }
        setNotes([]);
        return;
      }

      const tnManifest = manifests.tn;
      if (!tnManifest) {
        console.log("tN manifest not loaded yet");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let parsedNotes = [];
        if (!reference.chapter && !reference.verse) {
          // Book-level context: get only book intro notes
          const allNotes = await getNotesForBook(
            reference.bookId,
            organization || "unfoldingWord",
            languageId || "en"
          );
          parsedNotes = allNotes.filter(
            (note) =>
              note.reference &&
              (note.reference === "front:intro" ||
                (note.verse === "intro" && note.chapter === "front"))
          );
        } else {
          // Chapter/verse context: get chapter/verse/intro notes
          parsedNotes = await getNotesForVerse(
            reference.bookId,
            reference.chapter || null,
            reference.verse || null,
            organization || "unfoldingWord",
            languageId || "en"
          );
        }

        setNotes(parsedNotes);
      } catch (err) {
        console.error("Error loading translation notes:", err);
        // Provide more user-friendly error messages
        if (err.message.includes("Not Found") || err.message.includes("404")) {
          setError(
            `Translation notes are not available for ${reference.bookId.toUpperCase()} ${
              reference.chapter
            }:${
              reference.verse
            } in the selected language/organization. Try selecting a different verse or language.`
          );
        } else {
          setError("Failed to load translation notes");
        }
        setNotes([]);
      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, [reference, manifests.tn]);

  // Only show empty state if there are no notes and not loading/error
  if (!loading && !error && (!notes || notes.length === 0)) {
    return (
      <section data-testid='translation-notes-panel' className={styles.translationNotesPanel}>
        <p className={styles.emptyState}>No translation notes available for this selection.</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section data-testid='translation-notes-panel' className={styles.translationNotesPanel}>
        <p className={styles.loadingState}>Loading translation notes...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section data-testid='translation-notes-panel' className={styles.translationNotesPanel}>
        <p className={styles.errorState}>{error}</p>
      </section>
    );
  }

  return (
    <section data-testid='translation-notes-panel' className={styles.translationNotesPanel}>
      <h3 className={styles.panelHeader}>Translation Notes</h3>
      {notes.length === 0 ? (
        <p className={styles.emptyState}>No translation notes available for this verse.</p>
      ) : (
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
      )}
    </section>
  );
}

/* (CollapsibleNote component removed; now handled by CSS) */
