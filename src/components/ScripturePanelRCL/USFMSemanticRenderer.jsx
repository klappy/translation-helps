/**
 * USFMSemanticRenderer.jsx
 * React component for rendering USFM text with semantic HTML structure
 * Supports multiple view modes: preview, full, and debug
 */

import React, { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { parseUSFMToHTML, validateTextContentPreservation } from "./USFMSemanticParser.js";
import { ReferenceContext } from "../../context/ReferenceContext";
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
 * @param {Object} props.resourceDetails - Resource information to display
 */
export default function USFMSemanticRenderer({
  usfm = "",
  chapter = 1,
  mode = "preview",
  onVerseClick = null,
  selectedVerse = null,
  showModeToggle = true,
  options = {},
  resourceDetails = null,
  ...props
}) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // Local state for verse highlighting - no global context updates needed
  const [localSelectedVerse, setLocalSelectedVerse] = useState(selectedVerse);
  
  // Get updateContext from ReferenceContext for verse navigation
  const { updateContext, reference: currentReference } = useContext(ReferenceContext);

  // Update internal mode when prop changes
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Update local selected verse when prop changes
  useEffect(() => {
    setLocalSelectedVerse(selectedVerse);
  }, [selectedVerse]);

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

  // Handle verse clicks - now pure CSS highlighting with optional callback
  const handleVerseClick = useCallback(
    (event) => {
      // Find the closest verse element
      const verseElement = event.target.closest("v");
      if (!verseElement) return;

      // Extract verse number from the number element
      const numberElement = verseElement.querySelector("number");
      if (numberElement) {
        const verseNumber = parseInt(numberElement.textContent);
        if (!isNaN(verseNumber)) {
          // Update local highlighting immediately (pure CSS operation)
          setLocalSelectedVerse(verseNumber);
          
          // Update global reference context for verse navigation
          console.log("Verse clicked - updating global reference:", verseNumber);
          if (updateContext && currentReference) {
            updateContext({ 
              reference: {
                bookId: currentReference.bookId,
                chapter: parseInt(chapter), 
                verse: verseNumber 
              }
            });
          }
          
          // Optional callback for components that need to know about verse clicks
          // but this doesn't trigger re-renders of this component
          if (onVerseClick) {
            onVerseClick(verseNumber, chapter);
          }
        }
      }
    },
    [onVerseClick, chapter, updateContext, currentReference]
  );

  // Add selected class to verses - use local state for immediate highlighting
  useEffect(() => {
    if (localSelectedVerse === null || !renderedHTML) return;

    const verseElements = document.querySelectorAll("v");
    verseElements.forEach((verseElement) => {
      const numberElement = verseElement.querySelector("number");
      if (numberElement) {
        const verseNumber = parseInt(numberElement.textContent);
        if (verseNumber === localSelectedVerse) {
          verseElement.classList.add("selected");
        } else {
          verseElement.classList.remove("selected");
        }
      }
    });
  }, [localSelectedVerse, renderedHTML]);

  // Collapsible notes effect - ALWAYS call this hook
  useEffect(() => {
    if (!renderedHTML) return;
    
    // Wait for HTML to be rendered
    const container = document.querySelector(`.${styles["usfm-content"]}`);
    if (!container) return;

    // Helper to collapse a note if over 10 lines
    function processNoteElement(noteEl) {
      if (!noteEl) return;
      // Count lines by splitting on \n or by offsetHeight/lineHeight
      const text = noteEl.textContent || "";
      const lineCount = text.split("\n").length;
      // Fallback: estimate by height
      const lineHeight = parseFloat(getComputedStyle(noteEl).lineHeight) || 20;
      const estLines = Math.round(noteEl.offsetHeight / lineHeight);
      const isLong = lineCount > 10 || estLines > 10;
      if (!isLong) return;

      // Collapse note
      noteEl.style.maxHeight = `${lineHeight * 10}px`;
      noteEl.style.overflow = "hidden";
      noteEl.style.position = "relative";
      noteEl.setAttribute("data-collapsed", "true");

      // Add show more button if not already present
      if (
        !noteEl.nextSibling ||
        !noteEl.nextSibling.classList ||
        !noteEl.nextSibling.classList.contains("show-more-btn")
      ) {
        const btn = document.createElement("button");
        btn.textContent = "Show more";
        btn.className = "show-more-btn";
        btn.style.display = "block";
        btn.style.margin = "8px auto";
        btn.style.background = "#f8f9fa";
        btn.style.border = "1px solid #ccc";
        btn.style.borderRadius = "4px";
        btn.style.padding = "4px 12px";
        btn.style.cursor = "pointer";
        btn.onclick = function () {
          if (noteEl.getAttribute("data-collapsed") === "true") {
            noteEl.style.maxHeight = "none";
            noteEl.setAttribute("data-collapsed", "false");
            btn.textContent = "Show less";
          } else {
            noteEl.style.maxHeight = `${lineHeight * 10}px`;
            noteEl.setAttribute("data-collapsed", "true");
            btn.textContent = "Show more";
          }
        };
        noteEl.parentNode.insertBefore(btn, noteEl.nextSibling);
      }
    }

    // Process all <footnote> and <crossref> elements
    const notes = container.querySelectorAll("footnote, crossref");
    notes.forEach(processNoteElement);

    // Clean up: remove show-more buttons on unmount or rerender
    return () => {
      const btns = container.querySelectorAll(".show-more-btn");
      btns.forEach((btn) => btn.remove());
      notes.forEach((noteEl) => {
        noteEl.style.maxHeight = "";
        noteEl.style.overflow = "";
        noteEl.style.position = "";
        noteEl.removeAttribute("data-collapsed");
      });
    };
  }, [renderedHTML]);

  // Render loading state
  if (isLoading) {
    return (
      <div className={styles["usfm-semantic-renderer"]} data-testid="usfm-renderer">
        <div className={styles["loading-state"]}>Parsing USFM content...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={styles["usfm-semantic-renderer"]} data-testid="usfm-renderer">
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
      <div className={styles["usfm-semantic-renderer"]} data-testid="usfm-renderer">
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
    <div className={styles["usfm-semantic-renderer"]} data-testid="usfm-renderer" {...props}>
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

      <div className={styles["usfm-content"]}>
        {/* USFM Content */}
        <div
          onClick={handleVerseClick}
          dangerouslySetInnerHTML={{ __html: renderedHTML }}
        />

        {/* Resource Details - Moved to bottom */}
        {resourceDetails && (
          <div className={styles["resource-details"]}>
            <div className={styles["resource-detail-item"]}>
              <span className={styles["resource-icon"]}>🏢</span>
              <span>{resourceDetails.organization}</span>
            </div>
            <div className={styles["resource-detail-item"]}>
              <span className={styles["resource-icon"]}>📖</span>
              <span>
                {resourceDetails.title}
                {resourceDetails.version ? ` v${resourceDetails.version}` : ""}
              </span>
            </div>
            <div className={styles["resource-detail-item"]}>
              <span className={styles["resource-icon"]}>⚖️</span>
              <span>{resourceDetails.rights}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Export the component and related utilities
 */
export { parseUSFMToHTML, validateTextContentPreservation };
export * from "./USFMSemanticParser.js";
