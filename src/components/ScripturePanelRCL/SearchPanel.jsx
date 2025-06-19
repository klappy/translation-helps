/**
 * SearchPanel.jsx
 * Direct USFM text search component using custom parser
 */
import React, { useState, useContext, useRef, useCallback, useMemo, useEffect } from "react";
import { ReferenceContext } from "../../context/ReferenceContext";
import styles from "./SearchPanel.module.css";

/**
 * @param {object} props
 * @param {string} props.org - Organization
 * @param {string} props.lang - Language code
 * @param {string} props.abbr - Book abbreviation
 * @param {string} props.usfm - USFM content
 * @param {object} [props.manifest] - Bible resource manifest for display info
 * @param {function} props.onResultClick - Callback when a search result is clicked
 * @param {boolean} [props.hideResourceInfo] - Whether to hide the resource info section
 */
export default function SearchPanel({ org, lang, abbr, usfm, manifest, onResultClick, hideResourceInfo = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeoutRef = useRef(null);
  const { reference, updateContext } = useContext(ReferenceContext);

  // Debounce search term to prevent search on every keystroke
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setIsSearching(true);
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 300); // 300ms delay

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Direct USFM text search
  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm || !usfm) {
      return [];
    }

    console.log("🔍 Direct USFM search for:", debouncedSearchTerm);
    const results = [];

    // Split USFM into verses, handling multi-line verse content
    const verseBlocks = [];
    const lines = usfm.split("\n");
    let currentChapter = null;
    let currentVerse = null;
    let currentVerseContent = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track chapter
      const chapterMatch = line.match(/^\\c (\d+)/);
      if (chapterMatch) {
        // Save previous verse if we have one
        if (currentChapter && currentVerse && currentVerseContent) {
          verseBlocks.push({
            chapter: currentChapter,
            verse: currentVerse,
            content: currentVerseContent.trim(),
          });
        }
        currentChapter = parseInt(chapterMatch[1]);
        currentVerse = null;
        currentVerseContent = "";
        continue;
      }

      // Track verse start
      const verseMatch = line.match(/^\\v (\d+)(.*)$/);
      if (verseMatch && currentChapter) {
        // Save previous verse if we have one
        if (currentVerse && currentVerseContent) {
          verseBlocks.push({
            chapter: currentChapter,
            verse: currentVerse,
            content: currentVerseContent.trim(),
          });
        }

        currentVerse = parseInt(verseMatch[1]);
        currentVerseContent = verseMatch[2] || "";
        continue;
      }

      // Accumulate verse content from subsequent lines
      if (currentVerse && currentChapter) {
        // Skip lines that start with backslash (USFM tags) unless they're part of verse content
        if (!line.startsWith("\\") || line.includes("\\w ")) {
          currentVerseContent += " " + line;
        }
      }
    }

    // Don't forget the last verse
    if (currentChapter && currentVerse && currentVerseContent) {
      verseBlocks.push({
        chapter: currentChapter,
        verse: currentVerse,
        content: currentVerseContent.trim(),
      });
    }

    // Now search through the verses
    for (const verseBlock of verseBlocks) {
      // Clean up USFM markup to get readable text
      let cleanText = verseBlock.content;

      // Extract text from \w tags more carefully - handle both formats:
      // \w word|attributes\w* and \w word \w*
      cleanText = cleanText.replace(/\\w\s+([^\\]*?)(?:\|[^\\]*?)?\\w\*/g, (match, word) => {
        return word.trim();
      });

      // Remove alignment markers and other USFM tags
      cleanText = cleanText.replace(/\\zaln-s[^\\]*?\\?\*/g, " ");
      cleanText = cleanText.replace(/\\zaln-e\\?\*/g, " ");

      // Remove any remaining USFM tags
      cleanText = cleanText.replace(/\\[a-z]+[-\w]*\s*[^\\]*?\*/g, " ");
      cleanText = cleanText.replace(/\\[a-z]+[-\w]*\s*/g, " ");

      // Remove pipe-separated attributes
      cleanText = cleanText.replace(/\|[^|]*?\*/g, "");

      // Normalize whitespace and punctuation
      cleanText = cleanText
        .replace(/\s*,\s*/g, ", ") // Fix comma spacing
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();

      // Case-insensitive search
      if (cleanText.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
        results.push({
          text: cleanText,
          chapter: verseBlock.chapter,
          verse: verseBlock.verse,
          reference: `${abbr.toUpperCase()} ${verseBlock.chapter}:${verseBlock.verse}`,
          scopeLabels: [`chapter/${verseBlock.chapter}`, `verse/${verseBlock.verse}`],
        });
      }
    }

    console.log("🔍 Direct search found:", results.length, "results");
    return results;
  }, [debouncedSearchTerm, usfm, abbr]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    // The search will automatically trigger when searchTerm changes
  };

  const handleResultClick = useCallback(
    (result) => {
      const chapter = result.chapter;
      const verse = result.verse;

      if (chapter && verse) {
        const verseNum = parseInt(String(verse).split("-")[0]);
        // Update the reference using the new context API
        const newReference = {
          ...reference,
          chapter,
          verse: verseNum
        };
        updateContext({ reference: newReference });
        
        if (onResultClick) {
          onResultClick(verseNum, chapter, result);
        }
      }
    },
    [reference, updateContext, onResultClick]
  );

  return (
    <div className={styles.searchPanel}>
      {/* Search Context - conditionally show resource info */}
      {!hideResourceInfo && (
        <div className={styles.searchContext}>
          <div>
            <h4 className={styles.searchCurrentBook}>
              {abbr ? `${abbr.toUpperCase()} Search` : "Scripture Search"}
            </h4>
          </div>
          <div className={styles.searchResourceInfo}>
            <div className={styles.searchResourceDetail}>
              <span className={styles.resourceIcon}>🏢</span>
              <span>{org || "unfoldingWord"}</span>
            </div>
            <div className={styles.searchResourceDetail}>
              <span className={styles.resourceIcon}>📖</span>
              <span>
                {manifest?.dublin_core?.title || manifest?.title || ""}
                {manifest?.version ? ` v${manifest.version}` : ""}
              </span>
            </div>
            <div className={styles.searchResourceDetail}>
              <span className={styles.resourceIcon}>⚖️</span>
              <span>{manifest?.dublin_core?.rights || manifest?.rights || ""}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchInputGroup}>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search scripture text...'
            className={styles.searchInput}
          />
        </div>
        <button
          type='submit'
          disabled={!searchTerm.trim() || isSearching}
          className={styles.searchButton}
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className={styles.resultsSection}>
          <h4 className={styles.resultsHeader}>
            Found {searchResults.length} result(s) for "{debouncedSearchTerm}"
          </h4>
          <div className={styles.resultsList}>
            {searchResults.map((result, index) => (
              <div
                key={`result-${index}`}
                onClick={() => handleResultClick(result)}
                className={styles.resultItem}
              >
                <div className={styles.resultReference}>{result.reference}</div>
                <div className={styles.resultText}>{result.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {debouncedSearchTerm && searchResults.length === 0 && !isSearching && (
        <div className={styles.noResults}>No results found for "{debouncedSearchTerm}"</div>
      )}
    </div>
  );
}
