/**
 * ScripturePanelRCL.jsx - Simple Verse-Loading Pattern
 * Enhanced scripture panel using simple-text-editor-rcl for rich USFM rendering
 * 
 * TRANSFORMATION: Converted to use ResourcesContext for scripture loading
 * PATTERN: Self-activating display component (scripture from ResourcesContext)
 */
import React, { useState, useEffect, useContext, useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import { ReferenceContext } from "../../context/ReferenceContext";
import { useResourcesContext } from "../../context/ResourcesContext";
import { fetchBook, isBookAvailable } from "../../services/scriptureService";
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
  const { resources, activateResource } = useResourcesContext();
  const [showSearch, setShowSearch] = useState(false);
  const [showDebugMode, setShowDebugMode] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showHelpsSummary, setShowHelpsSummary] = useState(false);
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
    console.log('🎯 ScripturePanelRCL: Self-activating scripture resource');
    activateResource('scripture');
  }, [activateResource]);

  // Get scripture from ResourcesContext (Simple Verse-Loading Pattern)
  const usfmContent = resources.scripture || "";
  const loading = !resources.scripture && !!reference?.bookId;
  const error = resources.scripture === null ? "Failed to load scripture" : null;

  // Expose data to parent components via ref
  useImperativeHandle(ref, () => ({
    getData: () => ({
      usfmContent,
      loading,
      error,
      reference,
      resourceType: 'scripture'
    })
  }));

  // Debug: Log render
  console.log("[ScripturePanelRCL] Rendering with:", {
    reference,
    organization,
    languageId,
    resourceId,
    resourceOrganization: getResourceOrganization ? getResourceOrganization('scripture') : 'NO_FUNC',
    hasResourceData: !!currentResourceData,
    availableBooks: currentResourceData?.books?.length || 0,
    usfmContentLength: usfmContent?.length,
    resourcesScriptureLength: resources.scripture?.length || 0,
  });

  // Simple Verse-Loading Pattern: Scripture loading now handled by ResourcesContext

  // Accept both chapter and verse for context update
  const handleVerseClick = (verseNum, chapterNum) => {
    // If chapterNum is not provided, use the current reference
    const newChapter = chapterNum || reference?.chapter;
    const newReference = {
      ...currentReference,
      chapter: newChapter,
      verse: verseNum
    };
    updateContext({ reference: newReference });
    if (onVerseClick) {
      onVerseClick(verseNum, newChapter);
    }
  };

  const handleNavigationChange = (navigating) => {
    setIsNavigating(navigating);
  };

  const handleOrganizationChange = async (resourceType, organization) => {
    console.log(`🔄 Changing ${resourceType} organization to:`, organization);
    
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

  // Auto-show summary if there are multiple organizations available
  useEffect(() => {
    if (shouldShowHelpsSummary && !showHelpsSummary) {
      const totalOrganizations = new Set();
      Object.values(resourceAvailability).forEach(typeAvailability => {
        Object.keys(typeAvailability).forEach(org => totalOrganizations.add(org));
      });
      
      // Auto-show if we have resources from multiple organizations
      if (totalOrganizations.size > 1) {
        setShowHelpsSummary(true);
      }
    }
  }, [shouldShowHelpsSummary, resourceAvailability, showHelpsSummary]);

  // Show loading state if content is loading
  if (loading) {
    return (
      <section data-testid='scripture-panel-rcl' className={styles["scripture-panel"]}>
        {/* Integrated Navigation - Always show breadcrumbs */}
        <ScripturePanelNavigation onNavigationChange={handleNavigationChange} />
        <div className={styles["loading-state"]}>Loading scripture...</div>
      </section>
    );
  }

  // Show message if no reference is selected
  if (!reference?.bookId) {
      return (
    <section data-testid='scripture-panel-rcl' className={styles["scripture-panel"]}>
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
      <section data-testid='scripture-panel-rcl' className={styles["scripture-panel"]}>
        {/* Integrated Navigation - Always show breadcrumbs */}
        <ScripturePanelNavigation onNavigationChange={handleNavigationChange} />
        <div className={styles["error-state"]}>{error}</div>
      </section>
    );
  }

  // Debug: Log before rendering provider
  console.log("[ScripturePanelRCL] About to render provider with:", {
    usfmContentLength: usfmContent?.length,
    usfmFirst100: usfmContent?.substring(0, 100),
    hasResourceData: !!currentResourceData,
    resourceTitle: currentResourceData?.title || 'Unknown',
    fromResourcesContext: true
  });

  return (
    <section data-testid='scripture-panel-rcl' className={styles["scripture-panel"]}>
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

          {/* Scripture Content with integrated resource details */}
          <USFMSemanticRenderer
            usfm={extractChapterUSFM(usfmContent, reference.chapter)}
            chapter={reference.chapter}
            selectedVerse={reference.verse}
            onVerseClick={handleVerseClick}
            mode={showDebugMode ? 'debug' : 'preview'}
            showModeToggle={false}
            resourceDetails={{
              organization: (getResourceOrganization ? getResourceOrganization('scripture') : organization) || "Door43-Catalog",
              title: currentResourceData?.title || currentResourceData?.description || resourceId?.toUpperCase() || "",
              version: currentResourceData?.version,
              rights: "CC BY-SA 4.0" // Default rights, could be enhanced with API data
            }}
          />
        </>
      ) : null}
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

export default ScripturePanelRCL;
