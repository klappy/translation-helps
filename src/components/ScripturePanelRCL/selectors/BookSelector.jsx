/**
 * BookSelector.jsx
 * Book selection component with expandable inline chapter selection
 * Uses manifest data to show only available books
 */
import React, { useState, useMemo, useContext } from 'react';
import { AVAILABLE_BOOKS } from '../../../utils/defaultReference';
import { ReferenceContext } from '../../../context/ReferenceContext';
import { ManifestsContext } from '../../../context/MultiManifestsContext';
import { getBookEmoji } from "../../../utils/visualHelpers";
import { extractAvailableBooks, getBookChapterCount } from '../../../services/manifestService';
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

  const { languageId, getResourceId, getResourceOrganization } = useContext(ReferenceContext);
  const { manifests, isLoading: manifestsLoading } = useContext(ManifestsContext);

  // Get current resource information
  const currentResourceId = getResourceId('scripture');
  const currentOrganization = getResourceOrganization('scripture');

  // Get the manifest for the current resource
  const currentManifest = useMemo(() => {
    if (!currentResourceId || !manifests) return null;
    
    // Try different manifest key formats that the context might use
    const possibleKeys = [
      currentResourceId, // Simple resource ID
      `${currentOrganization}/${currentResourceId}`, // Organization/resource format
      languageId && currentResourceId.startsWith(`${languageId}_`) 
        ? currentResourceId.substring(languageId.length + 1) 
        : null // Strip language prefix if present
    ].filter(Boolean);
    
    for (const key of possibleKeys) {
      if (manifests[key]) {
        console.log(`📋 Found manifest for ${currentResourceId} using key: ${key}`);
        return manifests[key];
      }
    }
    
    console.warn(`📋 No manifest found for ${currentResourceId}, tried keys:`, possibleKeys);
    return null;
  }, [manifests, currentResourceId, currentOrganization, languageId]);

  // Get available books from manifest or fallback to all books
  const availableBooks = useMemo(() => {
    if (currentManifest) {
      try {
        // Extract books from manifest
        const manifestBooks = extractAvailableBooks(currentManifest);
        
        if (manifestBooks && manifestBooks.length > 0) {
          console.log(`📚 Found ${manifestBooks.length} books in manifest for ${currentResourceId}`);
          
          // Filter out non-Bible books (like Front Matter, etc.) and map to our standard format
          return manifestBooks
            .filter(manifestBook => {
              // Filter out Front Matter and other non-Bible content
              const isNonBibleContent = 
                manifestBook.id === 'frt' || 
                manifestBook.identifier === 'frt' ||
                manifestBook.categories?.includes('bible-frt') ||
                manifestBook.title === 'Front Matter';
              
              return !isNonBibleContent;
            })
            .map(manifestBook => {
              // Find the corresponding book in AVAILABLE_BOOKS for additional metadata
              const standardBook = AVAILABLE_BOOKS.find(book => book.id === manifestBook.id);
              
              return {
                id: manifestBook.id,
                name: manifestBook.title || standardBook?.name || manifestBook.id.toUpperCase(),
                manifestChapters: manifestBook.chapters,
                sort: manifestBook.sort || standardBook?.sort || 999,
                category: standardBook ? getBookCategory(standardBook) : 'Other'
              };
            })
            .sort((a, b) => a.sort - b.sort);
        }
      } catch (error) {
        console.warn(`📚 Error extracting books from manifest for ${currentResourceId}:`, error);
      }
    }
    
    // Fallback to all books if no manifest or no books in manifest
    console.log(`📚 No manifest data for ${currentResourceId}, showing all books`);
    return AVAILABLE_BOOKS.map(book => ({
      ...book,
      manifestChapters: null,
      category: getBookCategory(book)
    }));
  }, [currentManifest, currentResourceId]);

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
    // First try to get from manifest
    if (currentManifest) {
      const manifestChapterCount = getBookChapterCount(currentManifest, bookId);
      if (manifestChapterCount > 0) {
        return manifestChapterCount;
      }
    }
    
    // Fallback to static chapter counts
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

  // Show loading state if manifests are still loading
  if (manifestsLoading) {
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
          {currentManifest && (
            <span className={styles.manifestIndicator}>
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
                        {book.manifestChapters > 0 && (
                          <span className={styles.chapterCount}>
                            ({book.manifestChapters} chapters)
                          </span>
                        )}
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
