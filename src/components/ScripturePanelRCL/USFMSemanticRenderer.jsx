/**
 * USFMSemanticRenderer.jsx
 * React component for rendering USFM text with semantic HTML structure
 * Supports multiple view modes: preview, full, and debug
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { parseUSFMToHTML, validateTextContentPreservation } from "./USFMSemanticParser.js";
import styles from "./USFMSemanticRenderer.module.css";

/**
 * USFM Semantic Renderer Component
 * @param {Object} props - Component props
 * @param {string} props.usfm - USFM text to render
 * @param {number} props.chapter - Chapter number to display
 * @param {string} props.mode - Rendering mode (preview, full, debug)
 * @param {function} props.onVerseClick - Callback for verse clicks
 * @param {number} props.selectedVerse - Currently selected verse number
 * @param {boolean} props.showModeToggle - Whether to show mode toggle buttons
 * @param {Object} props.options - Additional rendering options
 */
export default function USFMSemanticRenderer({
  usfm = "",
  chapter = 1,
  mode = "preview",
  onVerseClick = null,
  selectedVerse = null,
  showModeToggle = true,
  options = {},
  ...props
}) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Parse USFM and render to HTML
  const renderedHTML = useMemo(() => {
    if (!usfm.trim()) return "";

    try {
      setError(null);
      setIsLoading(true);

      // Parse USFM directly to semantic HTML
      const html = parseUSFMToHTML(usfm, currentMode);

      // Validate that textContent is preserved
      if (process.env.NODE_ENV === "development") {
        const isValid = validateTextContentPreservation(usfm, html);
        if (!isValid) {
          console.warn("USFM textContent preservation validation failed");
        }
      }

      setIsLoading(false);
      return html;
    } catch (err) {
      console.error("USFM parsing/rendering error:", err);
      setError(err.message);
      setIsLoading(false);
      return "";
    }
  }, [usfm, currentMode]);

  // Handle mode changes
  const handleModeChange = useCallback((newMode) => {
    setCurrentMode(newMode);
  }, []);

  // Handle verse clicks
  const handleVerseClick = useCallback(
    (event) => {
      if (!onVerseClick) return;

      // Find the closest verse element
      const verseElement = event.target.closest("v");
      if (!verseElement) return;

      // Extract verse number from the number element
      const numberElement = verseElement.querySelector("number");
      if (numberElement) {
        const verseNumber = parseInt(numberElement.textContent);
        if (!isNaN(verseNumber)) {
          onVerseClick(verseNumber, chapter);
        }
      }
    },
    [onVerseClick, chapter]
  );

  // Add selected class to verses
  useEffect(() => {
    if (selectedVerse === null) return;

    const verseElements = document.querySelectorAll("v");
    verseElements.forEach((verseElement) => {
      const numberElement = verseElement.querySelector("number");
      if (numberElement) {
        const verseNumber = parseInt(numberElement.textContent);
        if (verseNumber === selectedVerse) {
          verseElement.classList.add("selected");
        } else {
          verseElement.classList.remove("selected");
        }
      }
    });
  }, [selectedVerse, renderedHTML]);

  // Render loading state
  if (isLoading) {
    return (
      <div className={styles["usfm-semantic-renderer"]}>
        <div className={styles["loading-state"]}>Parsing USFM content...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={styles["usfm-semantic-renderer"]}>
        <div className={styles["error-state"]}>
          <strong>USFM Parsing Error:</strong>
          <br />
          {error}
        </div>
      </div>
    );
  }

  // Render empty state - MUST preserve empty textContent for specification compliance
  if (!usfm.trim()) {
    return (
      <div className={styles["usfm-semantic-renderer"]}>
        {showModeToggle && (
          <div className={styles["mode-toggle"]}>
            <button
              className={`${styles["mode-button"]} ${
                currentMode === "preview" ? styles.active : ""
              }`}
              onClick={() => handleModeChange("preview")}
              type='button'
            >
              Preview
            </button>
            <button
              className={`${styles["mode-button"]} ${currentMode === "full" ? styles.active : ""}`}
              onClick={() => handleModeChange("full")}
              type='button'
            >
              Full
            </button>
            <button
              className={`${styles["mode-button"]} ${currentMode === "debug" ? styles.active : ""}`}
              onClick={() => handleModeChange("debug")}
              type='button'
            >
              Debug
            </button>
          </div>
        )}
        <div className={styles["usfm-content"]} />
      </div>
    );
  }

  return (
    <div className={styles["usfm-semantic-renderer"]} {...props}>
      {showModeToggle && (
        <div className={styles["mode-toggle"]}>
          <button
            className={`${styles["mode-button"]} ${currentMode === "preview" ? styles.active : ""}`}
            onClick={() => handleModeChange("preview")}
            type='button'
          >
            Preview
          </button>
          <button
            className={`${styles["mode-button"]} ${currentMode === "full" ? styles.active : ""}`}
            onClick={() => handleModeChange("full")}
            type='button'
          >
            Full
          </button>
          <button
            className={`${styles["mode-button"]} ${currentMode === "debug" ? styles.active : ""}`}
            onClick={() => handleModeChange("debug")}
            type='button'
          >
            Debug
          </button>
        </div>
      )}

      <div
        className={styles["usfm-content"]}
        onClick={handleVerseClick}
        dangerouslySetInnerHTML={{ __html: renderedHTML }}
      />
    </div>
  );
}

/**
 * Export the component and related utilities
 */
export { parseUSFMToHTML, validateTextContentPreservation };
export * from "./USFMSemanticParser.js";
