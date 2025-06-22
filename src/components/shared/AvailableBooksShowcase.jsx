/**
 * AvailableBooksShowcase.jsx
 * Reusable component to showcase which books have content available
 * Uses existing visual components for consistency
 */

import React from 'react';
import { TabIcon } from './TabIcon';
import styles from './AvailableBooksShowcase.module.css';

// Available books data - centralized for consistency
const AVAILABLE_BOOKS = {
  fia: {
    oldTestament: [
      { id: 'gen', name: 'Genesis', chapters: '1-50' },
      { id: 'exo', name: 'Exodus', chapters: '1-40' },
      { id: 'num', name: 'Numbers', chapters: '1-36' },
      { id: 'job', name: 'Job', chapters: '1-42' }
    ],
    newTestament: [
      { id: 'mat', name: 'Matthew', chapters: '1-28' },
      { id: 'mrk', name: 'Mark', chapters: '1-16' },
      { id: 'luk', name: 'Luke', chapters: '1-24' },
      { id: 'jhn', name: 'John', chapters: '1-21' },
      { id: 'act', name: 'Acts', chapters: '1-28' },
      { id: 'eph', name: 'Ephesians', chapters: '1-6' }
    ]
  }
};

export const AvailableBooksShowcase = ({ 
  resourceType = 'fia', 
  icon = 'images',
  title = 'Available Books',
  description = 'These books have content available:',
  onBookSelect = null
}) => {
  const books = AVAILABLE_BOOKS[resourceType];
  
  if (!books) {
    return null;
  }

  const handleBookClick = (book) => {
    if (onBookSelect) {
      onBookSelect(book);
    }
  };

  return (
    <div className={styles.showcase}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.iconWrapper}>
            <TabIcon type={icon} />
          </div>
          <div className={styles.titleText}>
            <h4 className={styles.title}>{title}</h4>
            <p className={styles.description}>{description}</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {books.oldTestament && books.oldTestament.length > 0 && (
          <div className={styles.testament}>
            <h5 className={styles.testamentTitle}>Old Testament</h5>
            <div className={styles.booksList}>
              {books.oldTestament.map((book) => (
                <div
                  key={book.id}
                  className={`${styles.bookCard} ${onBookSelect ? styles.clickable : ''}`}
                  onClick={() => handleBookClick(book)}
                  role={onBookSelect ? 'button' : undefined}
                  tabIndex={onBookSelect ? 0 : undefined}
                >
                  <div className={styles.bookName}>{book.name}</div>
                  <div className={styles.bookDetails}>
                    <span className={styles.bookId}>{book.id.toUpperCase()}</span>
                    {book.chapters && (
                      <span className={styles.bookChapters}>Ch. {book.chapters}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {books.newTestament && books.newTestament.length > 0 && (
          <div className={styles.testament}>
            <h5 className={styles.testamentTitle}>New Testament</h5>
            <div className={styles.booksList}>
              {books.newTestament.map((book) => (
                <div
                  key={book.id}
                  className={`${styles.bookCard} ${onBookSelect ? styles.clickable : ''}`}
                  onClick={() => handleBookClick(book)}
                  role={onBookSelect ? 'button' : undefined}
                  tabIndex={onBookSelect ? 0 : undefined}
                >
                  <div className={styles.bookName}>{book.name}</div>
                  <div className={styles.bookDetails}>
                    <span className={styles.bookId}>{book.id.toUpperCase()}</span>
                    {book.chapters && (
                      <span className={styles.bookChapters}>Ch. {book.chapters}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.suggestion}>
          <span className={styles.suggestionIcon}>💡</span>
          <span className={styles.suggestionText}>
            {onBookSelect 
              ? 'Click any book above to navigate and see available content'
              : 'Navigate to any of these books to see available content'
            }
          </span>
        </div>
      </div>
    </div>
  );
}; 