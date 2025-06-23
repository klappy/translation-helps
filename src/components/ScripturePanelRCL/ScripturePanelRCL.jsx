/**
 * ScripturePanelRCL.jsx - Simple Verse-Loading Pattern
 * Enhanced scripture panel using simple-text-editor-rcl for rich USFM rendering
 * 
 * TRANSFORMATION: Converted to use ResourcesContext for scripture loading
 * PATTERN: Self-activating display component (scripture from ResourcesContext)
 */
import React, { useState, useEffect, useContext, useMemo, useRef, useImperativeHandle, forwardRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ReferenceContext } from "../../context/ReferenceContext";
import { useResourcesContext } from "../../context/ResourcesContext";
import { fetchBook, isBookAvailable } from "../../services/scriptureService";
import { useSwipeNavigation } from "../../hooks/useSwipeNavigation";
// Simple Verse-Loading Pattern: Get scripture from ResourcesContext

import USFMSemanticRenderer from "./USFMSemanticRenderer";
import SearchPanel from "./SearchPanel";
import { ScripturePanelNavigation } from "./ScripturePanelNavigation";
import { TranslationHelpsSummary } from "../TranslationHelpsSummary";
import styles from "./ScripturePanelRCL.module.css";

/**
 * @param {object} props
 * @param {object} props.reference - Reference object { bookId, chapter, verse }
 * @param {function} props.onVerseClick - Callback when a verse is clicked
 */
const ScripturePanelRCL = React.memo(forwardRef(function ScripturePanelRCL({ reference, onVerseClick }, ref) {
  const { resources, activateResource, loadingResources } = useResourcesContext();
  const [showSearch, setShowSearch] = useState(false);
  const [showDebugMode, setShowDebugMode] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showHelpsSummary, setShowHelpsSummary] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState('');
  const [isSliding, setIsSliding] = useState(false);
  const [fabStyles, setFabStyles] = useState({});
  const scripturePanelRef = useRef(null);
  const { 
    organization, 
    languageId, 
    resourceId, 
    reference: currentReference, 
    updateContext, 
    getResourceOrganization,
    currentResourceData,
    resourceAvailability,
    mixedResources
  } = useContext(ReferenceContext);

  // Self-activate scripture resource
  useEffect(() => {
    activateResource('scripture');
  }, []); // Empty dependency array - only run once on mount

  // Chapter navigation with swipe gestures (YouVersion-style)
  const handlePreviousChapter = useCallback(() => {
    // CRITICAL FIX: Ensure chapter is parsed as integer to prevent string concatenation
    const currentChapter = parseInt(reference?.chapter, 10) || 1;
    
    if (currentChapter > 1 && !isSliding) {
      setIsSliding(true);
      setSlideDirection('right');
      
      setTimeout(() => {
        const newChapter = currentChapter - 1;
        
        const newReference = {
          ...currentReference,
          chapter: newChapter,
          verse: 1
        };
        updateContext({ reference: newReference });
        
        setTimeout(() => {
          setIsSliding(false);
          setSlideDirection('');
        }, 300);
      }, 150);
    }
  }, [reference?.chapter, currentReference, updateContext, isSliding]);

  const handleNextChapter = useCallback(() => {
    // CRITICAL FIX: Ensure chapter is parsed as integer to prevent string concatenation
    const currentChapter = parseInt(reference?.chapter, 10) || 1;
    const maxChapters = getMaxChaptersForBook(reference?.bookId);
    
    if (currentChapter < maxChapters && !isSliding) {
      setIsSliding(true);
      setSlideDirection('left');
      
      setTimeout(() => {
        const newChapter = currentChapter + 1;
        
        const newReference = {
          ...currentReference,
          chapter: newChapter,
          verse: 1
        };
        updateContext({ reference: newReference });
        
        setTimeout(() => {
          setIsSliding(false);
          setSlideDirection('');
        }, 300);
      }, 150);
    }
  }, [reference?.chapter, reference?.bookId, currentReference, updateContext, isSliding]);

  // Swipe navigation hook
  const swipeRef = useSwipeNavigation({
    onSwipeLeft: handleNextChapter,
    onSwipeRight: handlePreviousChapter,
    enabled: !isNavigating && !!reference?.bookId
  });

  // Get scripture from ResourcesContext (Simple Verse-Loading Pattern)
  const usfmContent = resources.scripture || "";
  
  // ANTI-FRAGILE: Only show loading for scripture specifically, not all resources
  const hasContentForCurrentBook = usfmContent && usfmContent.includes(`\\id ${reference?.bookId?.toUpperCase()}`);
  const scriptureLoading = loadingResources.has('scripture') && !hasContentForCurrentBook && !isSliding;
  const error = resources.scripture === null ? "Failed to load scripture" : null;

  // Expose data to parent components via ref
  useImperativeHandle(ref, () => ({
    getData: () => ({
      usfmContent,
      loading: scriptureLoading,
      error,
      reference,
      resourceType: 'scripture'
    })
  }));



  // Simple Verse-Loading Pattern: Scripture loading now handled by ResourcesContext

  // Accept both chapter and verse for context update
  const handleVerseClick = (verseNum, chapterNum) => {
    // Verse clicks should only update highlighting, not global context
    // This prevents unnecessary re-renders of the scripture component
    console.log("Verse clicked for highlighting:", verseNum);
    
    // Only call the optional parent callback
    if (onVerseClick) {
      onVerseClick(verseNum, chapterNum);
    }
    
    // NOTE: No context update here - verse highlighting is handled locally
    // If global context updates are needed for helps panels, they should be
    // triggered by explicit navigation actions, not verse clicks
  };

  const handleNavigationChange = (navigating) => {
    setIsNavigating(navigating);
  };

  const handleOrganizationChange = async (resourceType, organization) => {
    // Changing organization for resource type
    
    // Update the mixed resources with the new organization selection
    const newMixedResources = {
      ...mixedResources,
      [resourceType]: {
        ...mixedResources[resourceType],
        organization
      }
    };
    
    updateContext({ mixedResources: newMixedResources });
  };

  // Show helps summary when we have discovery data and are not navigating
  const shouldShowHelpsSummary = !isNavigating && 
    resourceAvailability && 
    Object.keys(resourceAvailability).some(type => Object.keys(resourceAvailability[type]).length > 0);

  // Auto-show summary if there are multiple organizations available (memoized for performance)
  const totalOrganizations = useMemo(() => {
    if (!resourceAvailability) return 0;
    const orgs = new Set();
    Object.values(resourceAvailability).forEach(typeAvailability => {
      Object.keys(typeAvailability).forEach(org => orgs.add(org));
    });
    return orgs.size;
  }, [resourceAvailability]);

  useEffect(() => {
    if (shouldShowHelpsSummary && !showHelpsSummary && totalOrganizations > 1) {
      setShowHelpsSummary(true);
    }
  }, [shouldShowHelpsSummary, showHelpsSummary, totalOrganizations]);

  // Detect FIA modal state and adjust z-index accordingly (throttled for performance)
  useEffect(() => {
    let timeoutId;
    
    const checkForModals = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const lightboxExists = document.querySelector('.lightbox') !== null;
        setIsModalOpen(lightboxExists);
      }, 50); // Throttle modal detection
    };

    // Check immediately
    checkForModals();

    // Set up observer for DOM changes (only watch for class changes on body)
    const observer = new MutationObserver(checkForModals);
    observer.observe(document.body, {
      childList: true,
      attributes: true,
      attributeFilter: ['class'],
      subtree: false // Don't watch entire subtree for performance
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  // Calculate FAB positioning based on scripture panel dimensions (throttled for performance)
  useEffect(() => {
    let timeoutId;
    
    const updateFabPosition = () => {
      if (scripturePanelRef.current) {
        const rect = scripturePanelRef.current.getBoundingClientRect();
        const padding = window.innerWidth <= 768 ? 15 : 30;
        
        setFabStyles({
          left: `${rect.left + padding}px`,
          right: `${window.innerWidth - rect.right + padding}px`,
          width: `${rect.width - (padding * 2)}px`,
        });
      }
    };

    const throttledUpdate = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(updateFabPosition, 100); // Throttle to 100ms
    };

    // Update immediately on mount
    updateFabPosition();
    
    // Throttled updates for resize/scroll
    window.addEventListener('resize', throttledUpdate);
    window.addEventListener('scroll', throttledUpdate);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('resize', throttledUpdate);
      window.removeEventListener('scroll', throttledUpdate);
    };
  }, []); // Remove reference dependency - only calculate once on mount

  // Loading state is now handled by LoadingOverlay wrapper - no internal loading needed

  // Show message if no reference is selected
  if (!reference?.bookId) {
      return (
    <section 
      data-testid='scripture-panel-rcl' 
      className={`${styles["scripture-panel"]} ${isModalOpen ? styles["modal-open"] : ""}`}
    >
      {/* Integrated Navigation - Always show breadcrumbs */}
      <ScripturePanelNavigation onNavigationChange={handleNavigationChange} />
      
      <div className={styles["empty-state"]}>
        Please complete the selections above to view scripture.
      </div>
    </section>
  );
  }

  // Show error state
  if (error) {
    return (
      <section 
        data-testid='scripture-panel-rcl' 
        className={`${styles["scripture-panel"]} ${isModalOpen ? styles["modal-open"] : ""}`}
      >
        {/* Integrated Navigation - Always show breadcrumbs */}
        <ScripturePanelNavigation onNavigationChange={handleNavigationChange} />
        <div className={styles["error-state"]}>{error}</div>
      </section>
    );
  }



  return (
    <section 
      ref={scripturePanelRef}
      data-testid='scripture-panel-rcl' 
      className={`${styles["scripture-panel"]} ${isModalOpen ? styles["modal-open"] : ""}`}
    >
      {/* Integrated Navigation */}
      <ScripturePanelNavigation 
        onNavigationChange={handleNavigationChange}
        showSearch={showSearch}
        onToggleSearch={() => setShowSearch(!showSearch)}
        showDebugMode={showDebugMode}
        onToggleDebugMode={() => setShowDebugMode(!showDebugMode)}
      />

      {/* Content Area - Show navigation UI or scripture content */}
      {!isNavigating ? (
        <>
          {/* Translation Helps Summary */}
          {shouldShowHelpsSummary && (
            <TranslationHelpsSummary
              availability={resourceAvailability}
              optimal={mixedResources}
              onOrganizationChange={handleOrganizationChange}
              isCollapsed={!showHelpsSummary}
              onToggleCollapsed={() => setShowHelpsSummary(!showHelpsSummary)}
            />
          )}

          {/* Search Panel */}
          {showSearch && (
            <div className={styles["search-panel"]}>
              <SearchPanel
                org={getResourceOrganization ? getResourceOrganization('scripture') : organization}
                lang={languageId}
                abbr={reference.bookId ? reference.bookId.toUpperCase() : ""}
                usfm={usfmContent}
                resourceData={currentResourceData}
                onResultClick={handleVerseClick}
                hideResourceInfo={true}
              />
            </div>
          )}

          {/* Scripture Content with integrated resource details and swipe navigation */}
          <div ref={swipeRef} className={`${styles.scriptureSwipeContainer} ${isSliding ? styles[`slide${slideDirection.charAt(0).toUpperCase() + slideDirection.slice(1)}`] : ''}`}>
            <USFMSemanticRenderer
              usfm={extractChapterUSFM(usfmContent, reference.chapter)}
              chapter={reference.chapter}
              selectedVerse={reference.verse}
              onVerseClick={handleVerseClick}
              mode={showDebugMode ? 'debug' : 'preview'}
              showModeToggle={false}
              resourceDetails={{
                organization: getResourceOrganization ? getResourceOrganization('scripture') : organization,
                title: currentResourceData?.title || currentResourceData?.description || resourceId?.toUpperCase() || "",
                version: currentResourceData?.version,
                rights: "CC BY-SA 4.0" // Default rights, could be enhanced with API data
              }}
            />
          </div>
        </>
      ) : null}

      {/* Floating Action Buttons for Chapter Navigation - Always visible when we have a book */}
      {reference?.bookId && createPortal(
        <div className={styles.chapterNavFabs} style={fabStyles}>
          <button
            onClick={handlePreviousChapter}
            className={`${styles.fabButton} ${styles.fabPrevious}`}
            disabled={reference?.chapter <= 1}
            title="Previous Chapter"
            aria-label="Previous Chapter"
          >
            ‹
          </button>
          <button
            onClick={handleNextChapter}
            className={`${styles.fabButton} ${styles.fabNext}`}
            disabled={reference?.chapter >= getMaxChaptersForBook(reference?.bookId)}
            title="Next Chapter"
            aria-label="Next Chapter"
          >
            ›
          </button>
        </div>,
        document.body
      )}
    </section>
  );
}));

/**
 * Extracts the USFM for a specific chapter from the full book USFM.
 * Returns an empty string if not found.
 * @param {string} usfm - Full book USFM
 * @param {number|string} chapter - Chapter number to extract
 * @returns {string} USFM for the selected chapter
 */
function extractChapterUSFM(usfm, chapter) {
  if (!usfm || !chapter) return "";
  // USFM chapter marker: \c {chapter}
  const chapterNum = parseInt(chapter, 10);
  if (isNaN(chapterNum)) return "";

  // Find start of this chapter
  const chapterStartPattern = new RegExp(`\\\\c[ \\t]+${chapterNum}\\b`);
  const chapterEndPattern = new RegExp(`\\\\c[ \\t]+${chapterNum + 1}\\b`);

  // Find headers (everything before the first \c marker)
  const firstChapterMatch = /\\c[ \t]+\d+\b/.exec(usfm);
  const headers = firstChapterMatch ? usfm.slice(0, firstChapterMatch.index).trim() + "\n" : "";

  const startMatch = chapterStartPattern.exec(usfm);
  if (!startMatch) return headers; // If chapter not found, just return headers

  const startIdx = startMatch.index;
  const endMatch = chapterEndPattern.exec(usfm.slice(startIdx + 1));
  const endIdx = endMatch ? startIdx + 1 + endMatch.index : usfm.length;

  return (headers + usfm.slice(startIdx, endIdx)).trim();
}

/**
 * Get maximum chapters for a book (no API call needed)
 * @param {string} bookId - Book identifier
 * @returns {number} Maximum chapter count
 */
function getMaxChaptersForBook(bookId) {
  const chapterCounts = {
    // Old Testament
    'gen': 50, 'exo': 40, 'lev': 27, 'num': 36, 'deu': 34,
    'jos': 24, 'jdg': 21, 'rut': 4, '1sa': 31, '2sa': 24,
    '1ki': 22, '2ki': 25, '1ch': 29, '2ch': 36, 'ezr': 10,
    'neh': 13, 'est': 10, 'job': 42, 'psa': 150, 'pro': 31,
    'ecc': 12, 'sng': 8, 'isa': 66, 'jer': 52, 'lam': 5,
    'ezk': 48, 'dan': 12, 'hos': 14, 'jol': 3, 'amo': 9,
    'oba': 1, 'jon': 4, 'mic': 7, 'nam': 3, 'hab': 3,
    'zep': 3, 'hag': 2, 'zec': 14, 'mal': 4,
    
    // New Testament
    'mat': 28, 'mrk': 16, 'luk': 24, 'jhn': 21, 'act': 28,
    'rom': 16, '1co': 16, '2co': 13, 'gal': 6, 'eph': 6,
    'php': 4, 'col': 4, '1th': 5, '2th': 3, '1ti': 6,
    '2ti': 4, 'tit': 3, 'phm': 1, 'heb': 13, 'jas': 5,
    '1pe': 5, '2pe': 3, '1jn': 5, '2jn': 1, '3jn': 1,
    'jud': 1, 'rev': 22
  };
  
  return chapterCounts[bookId?.toLowerCase()] || 50;
}

export default ScripturePanelRCL;
