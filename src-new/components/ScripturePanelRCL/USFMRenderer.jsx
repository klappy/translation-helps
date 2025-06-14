/**
 * USFMRenderer.jsx
 * Optimized USFM renderer with proper memoization to prevent excessive re-renders
 * Uses efficient USFM parsing and caching to improve performance
 */
import React, { useContext, useMemo, useCallback, useState, useEffect } from "react";
import { ReferenceContext } from "../../context/ReferenceContext";
import styles from "./USFMRenderer.module.css";

// Cache for parsed verses to avoid re-parsing on every render
const versesCache = new Map();

// Generate cache key for USFM content
function generateCacheKey(usfm, chapter) {
  return `${usfm?.length || 0}-${chapter}-${usfm?.substring(0, 100) || ""}`;
}

// Helper function to save a verse to the verses object
function saveVerse(verses, verseNum, content) {
  if (verseNum && content && content.trim()) {
    const cleanedText = cleanUSFMText(content.trim());
    if (cleanedText) {
      verses[verseNum] = {
        text: cleanedText,
        verse: verseNum,
      };
    }
  }
}

// Helper function to process text content and split on inline verse numbers
function processVerseContent(content, currentVerse, verses) {
  if (!content || !currentVerse) return { lastVerse: currentVerse, remainingContent: content };

  console.log(
    `🔍 Processing verse content for verse ${currentVerse}:`,
    content.substring(0, 200) + "..."
  );

  // Look for inline verse numbers like ". 3 And he is..." or "! 4 Not so..."
  // Pattern: punctuation + space + digits + space + capital letter (start of sentence)
  const inlineVersePattern = /([.!?])\s+(\d+)\s+([A-Z])/g;

  let lastIndex = 0;
  let lastVerse = currentVerse;
  let remainingContent = content;
  let match;
  let foundSplits = [];

  // Find all matches first
  while ((match = inlineVersePattern.exec(content)) !== null) {
    const [fullMatch, punctuation, verseNumStr, firstLetter] = match;
    const verseNum = parseInt(verseNumStr);

    // Make sure this looks like a valid verse number (reasonable range)
    if (verseNum > 0 && verseNum <= 200 && verseNum > currentVerse) {
      foundSplits.push({
        match,
        verseNum,
        punctuation,
        firstLetter,
        fullMatch,
        index: match.index,
      });
    }
  }

  console.log(
    `📝 Found ${foundSplits.length} inline verse splits:`,
    foundSplits.map((s) => `v${s.verseNum} at index ${s.index}`)
  );

  // Process splits in order
  for (let i = 0; i < foundSplits.length; i++) {
    const split = foundSplits[i];

    // Content before this verse split
    const beforeContent = content.substring(lastIndex, split.index + 1); // Include punctuation

    if (lastVerse && beforeContent.trim()) {
      console.log(`💾 Saving verse ${lastVerse}:`, beforeContent.trim().substring(0, 100) + "...");
      saveVerse(verses, lastVerse, beforeContent.trim());
    }

    // Move to next verse
    lastVerse = split.verseNum;
    lastIndex = split.index + 1 + split.punctuation.length + 1; // After punctuation + space

    console.log(`⏭️ Moving to verse ${lastVerse}, new index: ${lastIndex}`);
  }

  // Handle remaining content after last split
  if (lastIndex < content.length) {
    remainingContent = content.substring(lastIndex);
    console.log(
      `📄 Remaining content for verse ${lastVerse}:`,
      remainingContent.substring(0, 100) + "..."
    );
  } else {
    remainingContent = "";
  }

  return { lastVerse, remainingContent };
}

// Optimized USFM parsing function with caching
function parseUSFMToVerses(usfm, chapter) {
  if (!usfm || !chapter) return {};

  const cacheKey = generateCacheKey(usfm, chapter);

  // Return cached result if available
  if (versesCache.has(cacheKey)) {
    console.log("📚 Using cached verses for chapter", chapter);
    return versesCache.get(cacheKey);
  }

  console.log("🔄 Parsing USFM for chapter", chapter, "- Content length:", usfm.length);

  // Debug: Show raw USFM content for this chapter to understand the format
  const chapterStartPattern = new RegExp(`\\\\c ${chapter}\\b`);
  const chapterEndPattern = new RegExp(`\\\\c ${parseInt(chapter) + 1}\\b`);
  const chapterStartIndex = usfm.search(chapterStartPattern);
  const chapterEndIndex = usfm.search(chapterEndPattern);

  if (chapterStartIndex >= 0) {
    const chapterContent =
      chapterEndIndex >= 0
        ? usfm.substring(chapterStartIndex, chapterEndIndex)
        : usfm.substring(chapterStartIndex, chapterStartIndex + 2000); // First 2000 chars if no next chapter

    console.log("📖 Raw USFM content for chapter", chapter, ":");
    console.log(chapterContent);
    console.log("📖 End raw USFM content");
  }

  const verses = {};
  const lines = usfm.split("\n");
  let currentChapter = null;
  let currentVerse = null;
  let currentVerseContent = "";
  let inTargetChapter = false;
  const targetChapter = parseInt(chapter); // Ensure target is an integer

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track chapter markers
    const chapterMatch = line.match(/^\\c (\d+)/);
    if (chapterMatch) {
      const chapterNum = parseInt(chapterMatch[1]);

      // Save previous verse before switching chapters
      if (currentVerse && currentVerseContent && inTargetChapter) {
        // Process any inline verse numbers in the accumulated content
        const { lastVerse, remainingContent } = processVerseContent(
          currentVerseContent,
          currentVerse,
          verses
        );
        saveVerse(verses, lastVerse, remainingContent);
      }

      // Update chapter tracking
      currentChapter = chapterNum;
      inTargetChapter = chapterNum === targetChapter;

      // If we've moved past our target chapter, stop processing
      if (chapterNum > targetChapter && Object.keys(verses).length > 0) {
        break;
      }

      // Reset verse tracking
      currentVerse = null;
      currentVerseContent = "";
      continue;
    }

    // Only process content if we're in the target chapter
    if (!inTargetChapter) {
      continue;
    }

    // Track verse markers within our target chapter - can appear at start of line or after poetry markup
    const verseMatch = line.match(/\\v (\d+)(.*)$/);
    if (verseMatch) {
      // Save previous verse if we have one (process inline verses first)
      if (currentVerse && currentVerseContent) {
        const { lastVerse, remainingContent } = processVerseContent(
          currentVerseContent,
          currentVerse,
          verses
        );
        saveVerse(verses, lastVerse, remainingContent);
      }

      // Extract content before the verse marker (if any) and add to previous verse
      const beforeVerseMarker = line.substring(0, line.indexOf("\\v"));
      if (currentVerse && beforeVerseMarker.trim()) {
        const existingContent = verses[currentVerse]?.text || currentVerseContent || "";
        const combinedContent = existingContent + " " + beforeVerseMarker.trim();
        saveVerse(verses, currentVerse, combinedContent);
      }

      // Start new verse
      currentVerse = parseInt(verseMatch[1]);
      currentVerseContent = verseMatch[2] || "";
      continue;
    }

    // Accumulate verse content for current verse
    if (currentVerse) {
      // Include lines that don't start with \ (continuation of verse text)
      // Also include \w tags (word markup) and \zaln tags but skip other USFM tags
      if (!line.startsWith("\\") || line.includes("\\w ") || line.includes("\\zaln")) {
        currentVerseContent += " " + line;
      }
    }
  }

  // Don't forget the last verse (process inline verses first)
  if (currentVerse && currentVerseContent && inTargetChapter) {
    const { lastVerse, remainingContent } = processVerseContent(
      currentVerseContent,
      currentVerse,
      verses
    );
    saveVerse(verses, lastVerse, remainingContent);
  }

  console.log("✅ Parsed", Object.keys(verses).length, "verses for chapter", chapter);

  // Cache the result
  versesCache.set(cacheKey, verses);

  // Clean old cache entries (keep last 5)
  if (versesCache.size > 5) {
    const keys = Array.from(versesCache.keys());
    const oldKey = keys[0];
    versesCache.delete(oldKey);
  }

  return verses;
}

// Clean USFM markup to get readable text
function cleanUSFMText(text) {
  if (!text) return "";

  let cleanText = text;

  // Extract text from \w tags - handle both formats:
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

  return cleanText;
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
const USFMRenderer = React.memo(function USFMRenderer({
  selectedVerse,
  onVerseClick,
  org,
  lang,
  abbr,
  usfm,
  chapter,
}) {
  const { updateReference } = useContext(ReferenceContext);

  // Parse USFM directly to verses for this chapter using custom parser
  const verses = useMemo(() => {
    if (!usfm || !chapter) return {};

    // Use our optimized parsing function with caching
    return parseUSFMToVerses(usfm, chapter);
  }, [usfm, chapter]);

  // Handle loading states
  if (!usfm || !chapter) {
    return (
      <div data-testid='usfm-renderer' className={styles["error-state"]}>
        Missing scripture content or chapter.
      </div>
    );
  }

  // Handle verse click with memoized callback
  const handleVerseClick = useCallback(
    (verseNum) => {
      updateReference({ chapter: chapter, verse: verseNum });
      if (onVerseClick) onVerseClick(verseNum, chapter);
    },
    [chapter, updateReference, onVerseClick]
  );

  // Render verses directly from USFM parsing
  return (
    <div className={styles["usfm-renderer"]} data-testid='usfm-renderer'>
      {Object.keys(verses).length > 0 ? (
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
                  onClick={() => handleVerseClick(verseData.verse)}
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

export default USFMRenderer;
