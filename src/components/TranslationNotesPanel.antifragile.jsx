/**
 * TranslationNotesPanel.jsx
 * ANTIFRAGILE VERSION - Loads its own data and emits events
 */

import React, { useContext, useEffect, useState } from "react";
import { RcLinkContext } from "./MainView";
import { ReferenceContext } from "../context/ReferenceContext";
import { getNotesForVerseWithResourceData } from "../services/tnService";
import { searchResourcesAcrossOrgs } from "../services/catalogService";
import { processMarkdownWithRcLinks } from "../utils/markdownUtils.jsx";
import { InlineHelpsNavigation } from "./InlineHelpsNavigation";
import { ResourceMetadataCard, HelpsBreadcrumbs } from "./shared";
// Event bus removed - using direct ref access in ResourcesContext
import styles from "./TranslationNotesPanel.module.css";

export function TranslationNotesPanel({ reference }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { handleRcLinkClick } = useContext(RcLinkContext) || {};
  const { organization, languageId, getResourceOrganization, getResourceLanguage } = useContext(ReferenceContext);

  useEffect(() => {
    async function loadNotes() {
      if (!reference?.bookId || !reference?.chapter || !reference?.verse) {
        setNotes([]);
        return;
      }

      const tnOrganization = getResourceOrganization ? getResourceOrganization('tn') : organization;
      const tnLanguageId = getResourceLanguage ? getResourceLanguage('tn') : languageId;

      if (!tnOrganization || !tnLanguageId) {
        setError("Missing organization or language");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Get resource data from catalog
        const catalogResult = await searchResourcesAcrossOrgs(tnLanguageId, 'Translation Notes');
        const tnResource = catalogResult.resources[tnOrganization]?.find(r => r.id === 'tn');
        
        // 2. Load notes using the service
        let notesData = [];
        if (tnResource) {
          notesData = await getNotesForVerseWithResourceData(
            reference.bookId,
            reference.chapter,
            reference.verse,
            tnResource,
            tnLanguageId
          );
        }
        
        // 3. Update local state
        setNotes(notesData);
        
        // Event emission removed - ResourcesContext handles AI context directly
        console.log(`📡 TranslationNotesPanel: Emitted ${notesData.length} notes`);
        
      } catch (err) {
        console.error("Error loading translation notes:", err);
        setError(err.message);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, [reference, organization, languageId, getResourceOrganization, getResourceLanguage]);

  // Rest of the component remains the same...
  if (loading) {
    return <div>Loading translation notes...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <section data-testid='translation-notes-panel' className={styles.translationNotesPanel}>
      <h3>Translation Notes</h3>
      {notes.length === 0 ? (
        <p>No translation notes available for this verse.</p>
      ) : (
        <ul className={styles.notesList}>
          {notes.map((note, index) => (
            <li key={index} className={styles.noteCard}>
              {note.quote && <div className={styles.noteQuote}>"{note.quote}"</div>}
              <div className={styles.noteText}>{note.text}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
