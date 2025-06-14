/**
 * ChapterVerseStep.jsx
 * Final step of the wizard: Chapter and verse selection
 */

import React, { useState, useMemo } from "react";
import styles from "../NavigationWizard.module.css";
import { getChapterCount } from "../../../utils/contextHelpers";

export function ChapterVerseStep({
  onNext,
  onPrevious,
  onComplete,
  onStepChange,
  wizardData,
  isDesktop,
}) {
  const [selectedChapter, setSelectedChapter] = useState(wizardData.chapter || 1);

  // Use shared utility for chapter count (manifest-aware if manifest is available)
  const chapterCount = getChapterCount(wizardData.bookId);

  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
    onStepChange(4, {
      bookId: wizardData.bookId,
      chapter: chapter,
    });
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const bookDisplayName = useMemo(() => {
    const bookNames = {
      gen: "Genesis",
      exo: "Exodus",
      mat: "Matthew",
      mrk: "Mark",
      luk: "Luke",
      jhn: "John",
      act: "Acts",
      rom: "Romans",
      tit: "Titus",
      phm: "Philemon",
      rev: "Revelation",
    };
    return bookNames[wizardData.bookId] || wizardData.bookId?.toUpperCase();
  }, [wizardData.bookId]);

  const renderNumberGrid = (count, selected, onSelect, label) => {
    const numbers = Array.from({ length: count }, (_, i) => i + 1);

    return (
      <div className={`${styles.numberGridSection} ${isDesktop ? styles.desktop : ""}`}>
        <h3 className={`${styles.numberGridTitle} ${isDesktop ? styles.desktop : ""}`}>{label}</h3>
        <div className={`${styles.numberGrid} ${isDesktop ? styles.desktop : ""}`}>
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => onSelect(num)}
              className={`${styles.numberButton} ${selected === num ? styles.selected : ""} ${
                isDesktop ? styles.desktop : ""
              }`}
              data-testid={`${label.toLowerCase()}-${num}`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.stepContainer} ${isDesktop ? styles.desktop : ""}`}>
      {/* Step header */}
      <div className={`${styles.stepHeader} ${isDesktop ? styles.desktop : ""}`}>
        <h2 className={`${styles.stepTitle} ${isDesktop ? styles.desktop : ""}`}>Choose Chapter</h2>
        <p className={`${styles.stepDescription} ${isDesktop ? styles.desktop : ""}`}>
          Select the chapter in <strong>{bookDisplayName}</strong> you want to study.
        </p>
      </div>

      {/* Content area */}
      <div className={`${styles.stepContent} ${isDesktop ? styles.desktop : ""}`}>
        {/* Chapter Selection */}
        {renderNumberGrid(chapterCount, selectedChapter, handleChapterSelect, "Chapter")}

        {/* Summary */}
        <div className={`${styles.summarySection} ${isDesktop ? styles.desktop : ""}`}>
          <div className={`${styles.summaryTitle} ${isDesktop ? styles.desktop : ""}`}>
            Selected Reference
          </div>
          <div className={`${styles.summaryReference} ${isDesktop ? styles.desktop : ""}`}>
            {bookDisplayName} {selectedChapter}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`${styles.stepNavigation} ${isDesktop ? styles.desktop : ""}`}>
        <button
          type='button'
          className={`${styles.navigationButton} ${styles.secondary} ${
            isDesktop ? styles.desktop : ""
          }`}
          onClick={onPrevious}
        >
          Back
        </button>
        <button
          type='button'
          className={`${styles.navigationButton} ${styles.primary} ${styles.complete} ${
            isDesktop ? styles.desktop : ""
          }`}
          onClick={handleComplete}
          data-testid='complete-button'
        >
          Complete Selection
        </button>
      </div>
    </div>
  );
}
