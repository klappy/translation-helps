/**
 * OptimizedUSFMRenderer.jsx
 * Performance-optimized USFM renderer using shared ProskommaContext
 * Eliminates duplicate proskomma instances and USFM imports
 */
import React, { useContext, useMemo, useEffect, useState, useCallback } from "react";
import { ReferenceContext } from "../../context/ReferenceContext";
import { useProskommaContext } from "../../context/ProskommaContext";
import styles from "./USFMRenderer.module.css";

// Custom hook for parsing chapter content into individual verses using GraphQL data
function useChapterVersesFromGraphQL(chapterData) {
  return useMemo(() => {
    if (!chapterData?.docSet?.document?.sequences?.[0]?.blocks) return {};

    const verses = {};
    const blocks = chapterData.docSet.document.sequences[0].blocks;

    for (const block of blocks) {
      if (!block.text || !block.bs) continue;

      // Extract chapter/verse from block scopes
      const chapterScope = block.bs.find((b) => b.payload?.startsWith("chapter/"));
      const verseScope = block.bs.find((b) => b.payload?.startsWith("verse/"));

      if (chapterScope && verseScope) {
        const chapter = parseInt(chapterScope.payload.split("/")[1]);
        const verse = parseInt(verseScope.payload.split("/")[1]);

        if (!verses[verse]) {
          verses[verse] = {
            text: "",
            verse,
            chapter,
          };
        }

        // Append text to the verse (blocks might be split)
        verses[verse].text += (verses[verse].text ? " " : "") + block.text.trim();
      }
    }

    return verses;
  }, [chapterData]);
}

/**
 * @param {object} props
 * @param {number} props.selectedVerse - Currently selected verse number
 * @param {function} props.onVerseClick - Callback when a verse is clicked
 * @param {string} props.org - Organization
 * @param {string} props.lang - Language code
 * @param {string} props.abbr - Book abbreviation
 * @param {string} props.usfm - USFM content
 * @param {number} props.chapter - Current chapter to display
 */
const OptimizedUSFMRenderer = React.memo(function OptimizedUSFMRenderer({
  selectedVerse,
  onVerseClick,
  org,
  lang,
  abbr,
  usfm,
  chapter,
}) {
  const { updateReference } = useContext(ReferenceContext);
  const { queryChapter, isImporting } = useProskommaContext();
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if import is in progress
  const importInProgress = isImporting(org, lang, abbr, usfm);

  // Load chapter data when parameters change
  const loadChapterData = useCallback(async () => {
    if (!org || !lang || !abbr || !usfm || !chapter) {
      console.log("📋 OptimizedUSFMRenderer: Missing required parameters");
      return;
    }

    if (importInProgress) {
      console.log("⏳ OptimizedUSFMRenderer: Import in progress, waiting...");
      setLoading(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🔍 OptimizedUSFMRenderer: Querying chapter", chapter, "for book", abbr);

      const data = await queryChapter(org, lang, abbr, usfm, abbr, chapter);

      if (!data) {
        throw new Error("No data returned from proskomma query");
      }

      console.log("✅ OptimizedUSFMRenderer: Chapter data loaded:", {
        chapter,
        blocksCount: data?.docSet?.document?.sequences?.[0]?.blocks?.length || 0,
      });

      setChapterData(data);
    } catch (err) {
      console.error("❌ OptimizedUSFMRenderer: Error loading chapter:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [org, lang, abbr, usfm, chapter, importInProgress, queryChapter]);

  // Effect to load chapter data
  useEffect(() => {
    loadChapterData();
  }, [loadChapterData]);

  // Parse verses from chapter data
  const verses = useChapterVersesFromGraphQL(chapterData);

  // Debug verses parsing
  console.log("📖 OptimizedUSFMRenderer: Verses parsed:", {
    versesCount: Object.keys(verses).length,
    verseNumbers: Object.keys(verses)
      .map((k) => parseInt(k))
      .sort((a, b) => a - b),
    firstVerse: verses[1]
      ? {
          verse: verses[1].verse,
          textLength: verses[1].text?.length,
          text: verses[1].text?.substring(0, 100),
        }
      : null,
  });

  // Handle loading states
  if (!usfm || !org || !lang || !abbr) {
    return (
      <div data-testid='usfm-renderer' className={styles["error-state"]}>
        Missing scripture context.
      </div>
    );
  }

  if (importInProgress || loading) {
    return (
      <div data-testid='usfm-renderer' className={styles["loading-additional"]}>
        {importInProgress ? "Importing scripture..." : `Loading chapter ${chapter}...`}
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid='usfm-renderer' className={styles["error-state"]}>
        Error loading chapter: {error}
      </div>
    );
  }

  // Render verse-by-verse using optimized proskomma data
  return (
    <div className={styles["usfm-renderer"]} data-testid='usfm-renderer'>
      {chapter && Object.keys(verses).length > 0 ? (
        <div className={styles.chapter} key={chapter}>
          <div className={styles["chapter-header"]}>Chapter {chapter}</div>
          <div className={styles.verses}>
            {Object.values(verses)
              .sort((a, b) => a.verse - b.verse)
              .map((verseData) => (
                <div
                  className={`${styles.verse} ${
                    verseData.verse === selectedVerse ? styles.selected : ""
                  }`}
                  key={verseData.verse}
                  onClick={() => {
                    updateReference({ chapter: chapter, verse: verseData.verse });
                    if (onVerseClick) onVerseClick(verseData.verse, chapter);
                  }}
                >
                  <span className={styles["verse-number"]}>{verseData.verse}</span>
                  <span className={styles["verse-text"]}>{verseData.text}</span>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div data-testid='usfm-renderer' className={styles["empty-state"]}>
          {chapter ? `No verses found for chapter ${chapter}` : "Please select a chapter to view"}
        </div>
      )}
    </div>
  );
});

export default OptimizedUSFMRenderer;
