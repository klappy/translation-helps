/**
 * ChapterVerseStep.jsx
 * Final step of the wizard: Chapter and verse selection
 */

import React, { useState, useMemo } from "react";
import styles from "../NavigationWizard.module.css";
import { parseNaturalReference } from "../../../utils/parseNaturalReference";

export function ChapterVerseStep({
  onPrevious,
  onComplete,
  onStepChange,
  wizardData,
  isDesktop,
}) {
  const [inputValue, setInputValue] = useState(
    wizardData.bookId && wizardData.chapter
      ? `${wizardData.bookId.toUpperCase()} ${wizardData.chapter}:${wizardData.verse}`
      : ""
  );
  const [error, setError] = useState(null);

  const parsedReference = useMemo(() => parseNaturalReference(inputValue), [inputValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseNaturalReference(inputValue);
    if (parsed) {
      setError(null);
      onStepChange(4, {
        bookId: parsed.bookId,
        chapter: parsed.chapter,
        verse: parsed.verse,
      });
      if (onComplete) onComplete();
    } else {
      setError("Invalid reference. Use format 'JHN 3:16'");
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


  return (
    <div className={`${styles.stepContainer} ${isDesktop ? styles.desktop : ""}`}>
      {/* Step header */}
      <div className={`${styles.stepHeader} ${isDesktop ? styles.desktop : ""}`}>
        <h2 className={`${styles.stepTitle} ${isDesktop ? styles.desktop : ""}`}>
          Choose Chapter & Verse
        </h2>
        <p className={`${styles.stepDescription} ${isDesktop ? styles.desktop : ""}`}>
          Select the chapter and verse in <strong>{bookDisplayName}</strong> you want to study.
        </p>
      </div>

      {/* Content area */}
      <div className={`${styles.stepContent} ${isDesktop ? styles.desktop : ""}`}>
        <form onSubmit={handleSubmit} id='referenceForm' className={styles.referenceForm}>
          <input
            type='text'
            className={styles.referenceInput}
            placeholder='e.g., JHN 3:16'
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
            }}
            data-testid='reference-input'
          />
          {error && <div className={styles.errorMessage}>{error}</div>}
        </form>

        <div className={`${styles.summarySection} ${isDesktop ? styles.desktop : ""}`}>
          <div className={`${styles.summaryTitle} ${isDesktop ? styles.desktop : ""}`}>Selected Reference</div>
          <div className={`${styles.summaryReference} ${isDesktop ? styles.desktop : ""}`}> 
            {parsedReference ? `${parsedReference.bookId.toUpperCase()} ${parsedReference.chapter}:${parsedReference.verse}` : ""}
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
          type='submit'
          className={`${styles.navigationButton} ${styles.primary} ${styles.complete} ${
            isDesktop ? styles.desktop : ""
          }`}
          form='referenceForm'
          data-testid='complete-button'
        >
          Complete Selection
        </button>
      </div>
    </div>
  );
}
