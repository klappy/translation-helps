/**
 * OptimizedSearchPanel.jsx
 * Performance-optimized search component using shared ProskommaContext
 * Eliminates duplicate proskomma instances and USFM imports
 */
import React, { useState, useContext, useRef, useCallback, useMemo, useEffect } from "react";
import { ReferenceContext } from "../../context/ReferenceContext";
import { useProskommaContext } from "../../context/ProskommaContext";
import styles from "./SearchPanel.module.css";

/**
 * @param {object} props
 * @param {string} props.org - Organization
 * @param {string} props.lang - Language code
 * @param {string} props.abbr - Book abbreviation
 * @param {string} props.usfm - USFM content
 * @param {object} [props.manifest] - Bible resource manifest for display info
 * @param {function} props.onResultClick - Callback when a search result is clicked
 */
export default function OptimizedSearchPanel({ org, lang, abbr, usfm, manifest, onResultClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [fallbackResults, setFallbackResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const debounceTimeoutRef = useRef(null);
  const { updateReference } = useContext(ReferenceContext);
  const { searchText, isImporting } = useProskommaContext();

  // Check if import is in progress
  const importInProgress = isImporting(org, lang, abbr, usfm);

  const parseReferenceString = useCallback((ref) => {
    if (!ref) return { chapter: "?", verse: "?" };
    const match = ref.match(/\s(\d+):(\d+(?:-\d+)?)/);
    if (match) {
      return { chapter: parseInt(match[1]), verse: match[2] };
    }
    return { chapter: "?", verse: "?" };
  }, []);

  // Debounce search term to prevent search on every keystroke
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Fallback: Direct USFM text search when proskomma search fails or returns no results
  const performFallbackSearch = useCallback(
    (term) => {
      if (!term || !usfm) return [];

      console.log("🔍 Using fallback search for:", term);
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
        if (cleanText.toLowerCase().includes(term.toLowerCase())) {
          results.push({
            text: cleanText,
            chapter: verseBlock.chapter,
            verse: verseBlock.verse,
            reference: `${abbr.toUpperCase()} ${verseBlock.chapter}:${verseBlock.verse}`,
            scopeLabels: [`chapter/${verseBlock.chapter}`, `verse/${verseBlock.verse}`],
          });
        }
      }

      console.log("🔍 Fallback search found:", results.length, "results");
      return results;
    },
    [usfm, abbr]
  );

  // Perform search using optimized proskomma context
  const performSearch = useCallback(
    async (term) => {
      if (!term.trim() || !org || !lang || !abbr || !usfm) {
        setSearchResults([]);
        setFallbackResults([]);
        return;
      }

      if (importInProgress) {
        console.log("⏳ Search waiting for import to complete...");
        setSearching(true);
        return;
      }

      try {
        setSearching(true);
        setSearchError("");

        console.log("🔍 OptimizedSearchPanel: Searching for:", term);

        // Try proskomma search first
        const proskommaResults = await searchText(org, lang, abbr, usfm, term);

        if (proskommaResults && proskommaResults.length > 0) {
          console.log("✅ Proskomma search found:", proskommaResults.length, "results");
          setSearchResults(proskommaResults);
          setFallbackResults([]);
        } else {
          console.log("📝 Proskomma search returned no results, trying fallback");
          // Fall back to direct text search
          const fallback = performFallbackSearch(term);
          setSearchResults([]);
          setFallbackResults(fallback);
        }
      } catch (error) {
        console.error("❌ Search error:", error);
        setSearchError(error.message);
        // Try fallback search on error
        const fallback = performFallbackSearch(term);
        setSearchResults([]);
        setFallbackResults(fallback);
      } finally {
        setSearching(false);
      }
    },
    [org, lang, abbr, usfm, importInProgress, searchText, performFallbackSearch]
  );

  // Trigger search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    } else {
      setSearchResults([]);
      setFallbackResults([]);
      setSearchError("");
    }
  }, [debouncedSearchTerm, performSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    // The search will automatically trigger when searchTerm changes due to debouncing
  };

  const handleResultClick = (result) => {
    let chapter;
    let verse;
    if (result.scopeLabels && Array.isArray(result.scopeLabels)) {
      const chapterMatch = result.scopeLabels.find((label) => label.startsWith("chapter/"));
      const verseMatch = result.scopeLabels.find((label) => label.startsWith("verse/"));
      if (chapterMatch && verseMatch) {
        chapter = parseInt(chapterMatch.split("/")[1]);
        verse = verseMatch.split("/")[1];
      }
    }

    if (!chapter || !verse) {
      const parsed = parseReferenceString(result.reference);
      chapter = parsed.chapter !== "?" ? parsed.chapter : undefined;
      verse = parsed.verse !== "?" ? parsed.verse : undefined;
    }

    if (chapter && verse) {
      const verseNum = parseInt(String(verse).split("-")[0]);
      updateReference({ chapter, verse: verseNum });
      if (onResultClick) {
        onResultClick(verseNum, chapter, result);
      }
    }
  };

  // Don't show search if import isn't complete
  if (importInProgress) {
    return <div className={styles.loadingState}>Preparing search...</div>;
  }

  const allResults = [...searchResults, ...fallbackResults];
  const hasResults = allResults.length > 0;

  return (
    <div className={styles.searchPanel}>
      {/* Search Context - show current book and resource info */}
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
          disabled={!searchTerm.trim() || searching}
          className={styles.searchButton}
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Search Error */}
      {searchError && <div className={styles.errorState}>{searchError}</div>}

      {/* Search Results */}
      {hasResults && searchTerm && !searchError && (
        <div className={styles.resultsSection}>
          <h4 className={styles.resultsHeader}>
            Found {allResults.length} result(s) for "{searchTerm}"
            {fallbackResults.length > 0 && searchResults.length === 0 && (
              <span className={styles.resultsSubtitle}> (direct text search)</span>
            )}
          </h4>
          <div className={styles.resultsList}>
            {allResults.map((result, index) => {
              const isFromFallback = index >= searchResults.length;
              let chapter = result.chapter;
              let verse = result.verse;

              if (!chapter || !verse) {
                const parsed = parseReferenceString(result.reference);
                if (!chapter) chapter = parsed.chapter;
                if (!verse) verse = parsed.verse;
              }

              chapter = chapter ?? "?";
              verse = verse ?? "?";

              return (
                <div
                  key={`${isFromFallback ? "fallback" : "proskomma"}-${index}`}
                  onClick={() => handleResultClick(result)}
                  className={styles.resultItem}
                >
                  <div className={styles.resultReference}>
                    {abbr.toUpperCase()} {chapter}:{verse}
                  </div>
                  <div className={styles.resultText}>{result.text || "No text available"}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchTerm && !hasResults && !searching && !searchError && (
        <div className={styles.noResults}>No results found for "{searchTerm}"</div>
      )}

      {/* Loading */}
      {searching && <div className={styles.loadingState}>Searching...</div>}
    </div>
  );
}
