/**
 * BookSelector.jsx
 * Book selection component with expandable inline chapter selection
 * Uses manifest data to show only available books
 */
import React, { useState, useMemo, useContext } from 'react';
import { AVAILABLE_BOOKS } from '../../../utils/defaultReference';
import { ReferenceContext } from '../../../context/ReferenceContext';
// Note: ManifestsContext removed - now using resource data from ReferenceContext
import { getBookEmoji } from "../../../utils/visualHelpers";
// Note: manifestService imports removed - using resource data directly
import styles from './BookSelector.module.css';

// Helper function to categorize books
const getBookCategory = (book) => {
  // Categorize books (this could be enhanced with more detailed categories)
  const otBooks = ['gen', 'exo', 'lev', 'num', 'deu', 'jos', 'jdg', 'rut', '1sa', '2sa', 
                   '1ki', '2ki', '1ch', '2ch', 'ezr', 'neh', 'est', 'job', 'psa', 'pro', 
                   'ecc', 'sng', 'isa', 'jer', 'lam', 'ezk', 'dan', 'hos', 'jol', 'amo', 
                   'oba', 'jon', 'mic', 'nam', 'hab', 'zep', 'hag', 'zec', 'mal'];
  
  return otBooks.includes(book.id) ? 'Old Testament' : 'New Testament';
};

export function BookSelector({ onSelect, onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState('traditional'); // 'traditional' or 'alphabetical'
  const [expandedBook, setExpandedBook] = useState(null); // Track which book is expanded

  const { languageId, getResourceId, getResourceOrganization, currentResourceData } = useContext(ReferenceContext);

  // Get current resource information
  const currentResourceId = getResourceId('scripture');
  const currentOrganization = getResourceOrganization('scripture');

  // Use resource data from ReferenceContext instead of manifests
  const resourceAvailable = currentResourceData !== null;

  // Get available books from resource data or fallback to all books
  const availableBooks = useMemo(() => {
    if (currentResourceData && currentResourceData.books) {
      // Found books in resource data
      
      // Map the books from resource data to our standard format
      return currentResourceData.books
        .map(bookId => {
          // Find the corresponding book in AVAILABLE_BOOKS for additional metadata
          const standardBook = AVAILABLE_BOOKS.find(book => book.id === bookId);
          
          if (!standardBook) {
            console.warn(`📚 Unknown book ID: ${bookId}`);
            return null;
          }
          
          return {
            id: bookId,
            name: standardBook.name,
                         // Chapter count determined dynamically via getMaxChaptersForBook
            sort: standardBook.sort,
            category: getBookCategory(standardBook)
          };
        })
        .filter(Boolean) // Remove null entries
        .sort((a, b) => a.sort - b.sort);
    }
    
    // Fallback to all books if no resource data
    // No resource data, showing all books
    return AVAILABLE_BOOKS.map(book => ({
      ...book,
      // Chapter count determined dynamically via getMaxChaptersForBook
      category: getBookCategory(book)
    }));
  }, [currentResourceData, currentResourceId]);

  const sortedBooks = useMemo(() => {
    const books = [...availableBooks];
    
    if (sortMode === 'alphabetical') {
      return books.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // Traditional order (already sorted by sort field)
    return books;
  }, [availableBooks, sortMode]);

  const filteredBooks = useMemo(() => {
    if (!searchTerm.trim()) return sortedBooks;
    
    const term = searchTerm.toLowerCase();
    return sortedBooks.filter(book => 
      book.name.toLowerCase().includes(term) ||
      book.id.toLowerCase().includes(term)
    );
  }, [sortedBooks, searchTerm]);

  const handleBookClick = (book) => {
    // Toggle expansion for the clicked book
    if (expandedBook === book.id) {
      setExpandedBook(null); // Collapse if already expanded
    } else {
      setExpandedBook(book.id); // Expand this book
    }
  };

  const handleChapterSelect = (bookId, chapterNum) => {
    // Select the book and chapter
    onSelect({ bookId, chapter: chapterNum });
  };



  const getMaxChaptersForBook = (bookId) => {
    // Use static chapter counts (manifest-based chapter counting removed)
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
  };

  const groupedBooks = useMemo(() => {
    const groups = {};
    
    filteredBooks.forEach(book => {
      const category = book.category || getBookCategory(book);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(book);
    });
    
    return groups;
  }, [filteredBooks]);

  // Show loading state if resource data is not available
  if (!resourceAvailable) {
    return (
      <div className={styles.selectorContainer}>
        <div className={styles.header}>
          <button onClick={onBack} className={styles.backButton}>
            ← Back
          </button>
          <h3 className={styles.title}>Select Book</h3>
          <div className={styles.spacer} />
        </div>
        <div className={styles.emptyState}>Loading available books...</div>
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
        <h3 className={styles.title}>
          Select Book
          {currentResourceData && (
            <span className={styles.resourceIndicator}>
              ({availableBooks.length} available)
            </span>
          )}
        </h3>
        <div className={styles.spacer} />
      </div>

      {/* Search */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          autoFocus
        />
      </div>

      {/* Sort Toggle */}
      <div className={styles.sortContainer}>
        <button
          onClick={() => setSortMode('traditional')}
          className={`${styles.sortButton} ${sortMode === 'traditional' ? styles.active : ''}`}
        >
          Traditional
        </button>
        <button
          onClick={() => setSortMode('alphabetical')}
          className={`${styles.sortButton} ${sortMode === 'alphabetical' ? styles.active : ''}`}
        >
          Alphabetical
        </button>
      </div>

      {/* Book Groups */}
      <div className={styles.listContainer}>
        {Object.keys(groupedBooks).length > 0 ? (
          Object.entries(groupedBooks).map(([category, books]) => (
            <div key={category} className={styles.bookGroup}>
              <div className={styles.groupHeader}>
                <h4 className={styles.categoryName}>{category}</h4>
              </div>
              
              {books.map(book => (
                <div key={book.id} className={styles.bookSection}>
                  <button
                    onClick={() => handleBookClick(book)}
                    className={`${styles.bookItem} ${expandedBook === book.id ? styles.expanded : ''}`}
                  >
                    <div className={styles.bookInfo}>
                      <div className={styles.bookName}>
                        {getBookEmoji(book.id)} {book.name}
                        <span className={styles.chapterCount}>
                          ({getMaxChaptersForBook(book.id)} chapters)
                        </span>
                      </div>
                      <div className={styles.bookId}>{book.id.toUpperCase()}</div>
                    </div>
                    <div className={styles.bookArrow}>
                      {expandedBook === book.id ? '▲' : '▼'}
                    </div>
                  </button>

                  {/* Expandable Chapter Grid */}
                  {expandedBook === book.id && (
                    <div className={styles.chapterGrid}>
                      {Array.from({ length: getMaxChaptersForBook(book.id) }, (_, i) => i + 1).map(chapterNum => (
                        <button
                          key={chapterNum}
                          onClick={() => handleChapterSelect(book.id, chapterNum)}
                          className={styles.chapterButton}
                        >
                          {chapterNum}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            {searchTerm ? 'No books found' : 'No books available'}
          </div>
        )}
      </div>
    </div>
  );
}
