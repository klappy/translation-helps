/**
 * ChapterSelector.jsx
 * Chapter selection component with grid layout
 */
import React, { useMemo } from 'react';
import { AVAILABLE_BOOKS } from '../../../utils/defaultReference';
import styles from './ChapterSelector.module.css';

export function ChapterSelector({ onSelect, onBack, bookId }) {
  // Get book info
  const book = useMemo(() => {
    return AVAILABLE_BOOKS.find(b => b.id === bookId);
  }, [bookId]);

  // Generate chapter numbers (assuming max 150 chapters for any book)
  const chapters = useMemo(() => {
    if (!book) return [];
    
    // For now, use a reasonable default. In a real app, you'd get this from manifest data
    const maxChapters = getMaxChaptersForBook(bookId);
    return Array.from({ length: maxChapters }, (_, i) => i + 1);
  }, [book, bookId]);

  const handleChapterSelect = (chapterNum) => {
    onSelect(chapterNum);
  };

  if (!book) {
    return (
      <div className={styles.selectorContainer}>
        <div className={styles.header}>
          <button onClick={onBack} className={styles.backButton}>
            ← Back
          </button>
          <h3 className={styles.title}>Select Chapter</h3>
          <div className={styles.spacer} />
        </div>
        <div className={styles.emptyState}>Book not found</div>
      </div>
    );
  }

  return (
    <div className={styles.selectorContainer}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
        <h3 className={styles.title}>{book.name}</h3>
        <div className={styles.spacer} />
      </div>

      {/* Chapter Grid */}
      <div className={styles.gridContainer}>
        <div className={styles.chapterGrid}>
          {chapters.map(chapterNum => (
            <button
              key={chapterNum}
              onClick={() => handleChapterSelect(chapterNum)}
              className={styles.chapterButton}
            >
              {chapterNum}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Get approximate max chapters for a book
 * In a real implementation, this would come from manifest data
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
  
  return chapterCounts[bookId] || 50; // Default to 50 if unknown
}
