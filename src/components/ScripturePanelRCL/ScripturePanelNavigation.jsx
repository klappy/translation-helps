/**
 * ScripturePanelNavigation.jsx
 * Integrated navigation component for scripture panel with breadcrumbs and controls
 */
import React, { useState, useContext, useEffect } from 'react';
import { ReferenceContext } from '../../context/ReferenceContext';
import { LanguageSelector } from './selectors/LanguageSelector';
import { ResourceSelector } from './selectors/ResourceSelector';
import { BookSelector } from './selectors/BookSelector';
import { getBookEmoji, getResourceIcon, getLanguageFlag } from "../../utils/visualHelpers";
import styles from './ScripturePanelNavigation.module.css';

export function ScripturePanelNavigation({ 
  onNavigationChange, 
  showSearch, 
  onToggleSearch, 
  showDebugMode, 
  onToggleDebugMode 
}) {
  const [currentStep, setCurrentStep] = useState('complete');
  const [slideDirection, setSlideDirection] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false); // Prevent multiple transitions
  const { 
    reference, 
    organization, 
    languageId, 
    resourceId, 
    resourceOrganization,
    updateContext 
  } = useContext(ReferenceContext);

  // Notify parent of navigation state changes
  useEffect(() => {
    if (onNavigationChange) {
      onNavigationChange(currentStep !== 'complete');
    }
  }, [currentStep, onNavigationChange]);

  // Auto-start navigation if context is incomplete - with debounce to prevent multiple triggers
  useEffect(() => {
    if (isTransitioning) return; // Prevent multiple transitions
    
    const timer = setTimeout(() => {
      // Only auto-advance if we're currently at 'complete' step (not manually navigating)
      if (currentStep !== 'complete') return;
      
      if (!languageId) {
        setCurrentStep('language');
        setSlideDirection('left');
      } else if (!resourceId) {
        setCurrentStep('resource');
        setSlideDirection('left');
      } else if (!reference?.bookId || !reference?.chapter) {
        setCurrentStep('book');
        setSlideDirection('left');
      } else {
        setCurrentStep('complete');
      }
    }, 100); // Small debounce to prevent rapid fire

    return () => clearTimeout(timer);
  }, [languageId, resourceId, reference, isTransitioning]); // Removed currentStep from dependencies

  const handleStepChange = (step, direction = 'left') => {
    setIsTransitioning(true);
    setSlideDirection(direction);
    setCurrentStep(step);
    
    // Clear transition flag after a short delay
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const handleLanguageSelect = async (language) => {
    console.log('🌐 ScripturePanelNavigation: Language selected:', language);
    
    // Handle both language object and language code for backward compatibility
    const languageCode = typeof language === 'object' ? language.code : language;
    
    // IMMEDIATE: Update context and move to resource step first
    updateContext({ 
      languageId: languageCode,
      // Reset downstream selections when language changes
      resourceId: null,
      reference: { bookId: null, chapter: 1, verse: 1 }
    });
    
    // IMMEDIATE: Move to resource step
    handleStepChange('resource', 'left');
    
    // ASYNC: Do translation helps discovery in background (don't block UI)
    try {
      const { discoverAllTranslationHelps, selectOptimalOrganizations } = await import('../../services/translationHelpsDiscovery.js');
      
      console.log('🔍 Discovering translation helps for:', languageCode);
      const availability = await discoverAllTranslationHelps(languageCode);
      
      // Select optimal organizations (no primary preference, no scripture org yet)
      const optimal = selectOptimalOrganizations(availability, null, null);
      
      console.log('✅ Translation helps discovered:', optimal);
      
      // Update context with discovered resources (don't change navigation state)
      updateContext({ 
        mixedResources: optimal
      });
    } catch (error) {
      console.warn('⚠️ Translation helps discovery failed:', error);
      // Fallback - just continue without mixed resources
    }
  };

  const handleResourceSelect = (resource) => {
    console.log('📚 ScripturePanelNavigation: Resource selected:', resource);
    console.log('📚 About to update context with:', {
      resourceId: resource.id,
      resourceOrganization: resource.organization,
      hasResourceData: !!resource,
      availableBooks: resource.books ? resource.books.length : 0
    });
    
    // IMMEDIATE: Update context with resource selection AND resource data
    updateContext({ 
      resourceId: resource.id,
      resourceOrganization: resource.organization,
      currentResourceData: resource, // Store the full resource data from search API
      // Reset book selection when resource changes, keep same position if book exists
      reference: reference?.bookId 
        ? reference 
        : { bookId: null, chapter: 1, verse: 1 }
    });
    
    console.log('📚 Context updated with resource data, now navigating to book selection');
    
    // IMMEDIATE: Navigate to book selection
    handleStepChange('book', 'left');
  };

  const handleBookSelect = ({ bookId, chapter }) => {
    console.log('📖 ScripturePanelNavigation: Book selected:', { bookId, chapter });
    console.log('📖 Current context before book select:', { 
      organization, 
      languageId, 
      resourceId, 
      resourceOrganization 
    });
    

    
    updateContext({ 
      reference: { 
        bookId, 
        chapter: chapter || 1, 
        verse: 1 
      }
    });
    handleStepChange('complete', 'left');
  };

  const handleBack = () => {
    if (currentStep === 'resource') {
      handleStepChange('language', 'right');
    } else if (currentStep === 'book') {
      handleStepChange('resource', 'right');
    } else {
      handleStepChange('complete', 'right');
    }
  };

  const handleClose = () => {
    // Close the current panel and return to complete state
    handleStepChange('complete', 'right');
  };

  const handleToggleStep = (step) => {
    // Toggle without animation for breadcrumb clicks
    setCurrentStep(step === currentStep ? 'complete' : step);
  };

  // Get display names for breadcrumbs
  const getLanguageName = () => {
    if (!languageId) return null;
    // Simple mapping for common languages
    const languageNames = {
      'en': 'English',
      'es': 'Spanish', 
      'fr': 'French',
      'de': 'German',
      'pt': 'Portuguese',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'ru': 'Russian',
      'ja': 'Japanese'
    };
    const name = languageNames[languageId] || languageId.toUpperCase();
    return name; // No flag here - shown separately in icon
  };

  const getResourceName = () => {
    if (!resourceId) return null;
    return resourceId.toUpperCase(); // No icon here - shown separately
  };

  // Get the appropriate icon for the current resource based on book content
  const getCurrentResourceIcon = () => {
    if (!resourceId) return '📖';
    
    // If we have current resource data with book information, use enhanced icons
    const { currentResourceData } = useContext(ReferenceContext);
    if (currentResourceData?.books) {
      return getResourceBookIcon(currentResourceData);
    }
    
    // Fallback to general resource icon
    return getResourceIcon(resourceId);
  };

  // Enhanced book icon function for current resource
  const getResourceBookIcon = (resource) => {
    if (!resource?.books || !Array.isArray(resource.books)) {
      return getResourceIcon(resource?.id || resourceId);
    }

    // Old Testament books (39 books)
    const otBooks = [
      'gen', 'exo', 'lev', 'num', 'deu', 'jos', 'jdg', 'rut', '1sa', '2sa',
      '1ki', '2ki', '1ch', '2ch', 'ezr', 'neh', 'est', 'job', 'psa', 'pro',
      'ecc', 'sng', 'isa', 'jer', 'lam', 'ezk', 'dan', 'hos', 'jol', 'amo',
      'oba', 'jon', 'mic', 'nam', 'hab', 'zep', 'hag', 'zec', 'mal'
    ];

    // New Testament books (27 books)
    const ntBooks = [
      'mat', 'mrk', 'luk', 'jhn', 'act', 'rom', '1co', '2co', 'gal', 'eph',
      'php', 'col', '1th', '2th', '1ti', '2ti', 'tit', 'phm', 'heb', 'jas',
      '1pe', '2pe', '1jn', '2jn', '3jn', 'jud', 'rev'
    ];

    const bookIds = resource.books.map(book => 
      typeof book === 'string' ? book.toLowerCase() : book.id?.toLowerCase()
    ).filter(Boolean);

    const otCount = bookIds.filter(id => otBooks.includes(id)).length;
    const ntCount = bookIds.filter(id => ntBooks.includes(id)).length;

    // Complete Bible gets the full Bible icon
    if (otCount === 39 && ntCount === 27) {
      return '📖';
    }

    // Mixed OT/NT gets Bible icon
    if (otCount > 0 && ntCount > 0) {
      return '📖';
    }

    // Old Testament only
    if (otCount > 0 && ntCount === 0) {
      return '📜';
    }

    // New Testament only
    if (ntCount > 0 && otCount === 0) {
      return '✝️';
    }

    // Fallback to general resource icon
    return getResourceIcon(resource.id || resourceId);
  };

  const getBookName = () => {
    if (!reference?.bookId) return null;
    // Simple mapping for common book names
    const bookNames = {
      'gen': 'Genesis', 'exo': 'Exodus', 'lev': 'Leviticus', 'num': 'Numbers', 'deu': 'Deuteronomy',
      'jos': 'Joshua', 'jdg': 'Judges', 'rut': 'Ruth', '1sa': '1 Samuel', '2sa': '2 Samuel',
      '1ki': '1 Kings', '2ki': '2 Kings', '1ch': '1 Chronicles', '2ch': '2 Chronicles',
      'ezr': 'Ezra', 'neh': 'Nehemiah', 'est': 'Esther', 'job': 'Job', 'psa': 'Psalms',
      'pro': 'Proverbs', 'ecc': 'Ecclesiastes', 'sng': 'Song of Songs', 'isa': 'Isaiah',
      'jer': 'Jeremiah', 'lam': 'Lamentations', 'ezk': 'Ezekiel', 'dan': 'Daniel',
      'hos': 'Hosea', 'jol': 'Joel', 'amo': 'Amos', 'oba': 'Obadiah', 'jon': 'Jonah',
      'mic': 'Micah', 'nam': 'Nahum', 'hab': 'Habakkuk', 'zep': 'Zephaniah',
      'hag': 'Haggai', 'zec': 'Zechariah', 'mal': 'Malachi',
      'mat': 'Matthew', 'mrk': 'Mark', 'luk': 'Luke', 'jhn': 'John', 'act': 'Acts',
      'rom': 'Romans', '1co': '1 Corinthians', '2co': '2 Corinthians', 'gal': 'Galatians',
      'eph': 'Ephesians', 'php': 'Philippians', 'col': 'Colossians', '1th': '1 Thessalonians',
      '2th': '2 Thessalonians', '1ti': '1 Timothy', '2ti': '2 Timothy', 'tit': 'Titus',
      'phm': 'Philemon', 'heb': 'Hebrews', 'jas': 'James', '1pe': '1 Peter', '2pe': '2 Peter',
      '1jn': '1 John', '2jn': '2 John', '3jn': '3 John', 'jud': 'Jude', 'rev': 'Revelation'
    };
    const name = bookNames[reference.bookId] || reference.bookId.toUpperCase();
    return name; // No emoji here - shown separately
  };

  const getChapterVerse = () => {
    if (!reference?.chapter) return null;
    return `${reference.chapter}:${reference.verse || 1}`;
  };

  return (
    <div className={styles.navigationContainer}>
      {/* Breadcrumbs with Control Buttons */}
      <div className={styles.breadcrumbs}>
        <div className={styles.breadcrumbsContent}>
          {/* Language Breadcrumb */}
          <button
            onClick={() => handleToggleStep('language')}
            className={`${styles.breadcrumbButton} ${languageId ? styles.completed : styles.incomplete}`}
            title={languageId ? `Change ${getLanguageName()}` : 'Select Language'}
            disabled={currentStep === 'language'}
          >
            <span style={{ fontSize: '12px' }}>
              {languageId ? (getLanguageFlag(languageId) || '🌐') : '🌐'}
            </span>
            <span>{getLanguageName() || 'Language'}</span>
            {languageId && <span style={{ fontSize: '9px', marginLeft: '3px' }}>✓</span>}
          </button>

          {languageId && (
            <>
              <span className={styles.separator}>›</span>
              <button
                onClick={() => handleToggleStep('resource')}
                className={`${styles.breadcrumbButton} ${resourceId ? styles.completed : styles.incomplete}`}
                title={resourceId ? `Change ${getResourceName()}` : 'Select Resource'}
                disabled={currentStep === 'resource'}
              >
                <span style={{ fontSize: '12px' }}>
                  {getCurrentResourceIcon()}
                </span>
                <span>{getResourceName() || 'Resource'}</span>
                {resourceId && <span style={{ fontSize: '9px', marginLeft: '3px' }}>✓</span>}
              </button>
            </>
          )}

          {resourceId && (
            <>
              <span className={styles.separator}>›</span>
              <button
                onClick={() => handleToggleStep('book')}
                className={`${styles.breadcrumbButton} ${reference?.bookId ? styles.completed : styles.incomplete}`}
                title={reference?.bookId ? `${getBookName()} ${getChapterVerse()} - Click to change` : 'Select Book'}
              >
                <span style={{ fontSize: '12px' }}>
                  {reference?.bookId ? getBookEmoji(reference.bookId) : '📚'}
                </span>
                <span>
                  {reference?.bookId ? `${getBookName()} ${getChapterVerse()}` : 'Book'}
                </span>
                {reference?.bookId && <span style={{ fontSize: '9px', marginLeft: '3px' }}>✓</span>}
              </button>
            </>
          )}
        </div>

        {/* Control Buttons - styled like theme toggle */}
        <div className={styles.controlButtons}>
          <button
            onClick={onToggleSearch}
            className={`${styles.controlButton} ${showSearch ? styles.active : ''}`}
            title={showSearch ? "Hide Search" : "Show Search"}
            aria-label={showSearch ? "Hide Search" : "Show Search"}
          >
            🔍
          </button>
        </div>
      </div>

      {/* Selection Container */}
      {currentStep !== 'complete' && (
        <div className={`${styles.selectionContainer} ${styles[slideDirection]}`}>
          {currentStep === 'language' && (
            <LanguageSelector onSelect={handleLanguageSelect} />
          )}
          {currentStep === 'resource' && (
            <ResourceSelector onSelect={handleResourceSelect} onBack={handleBack} languageId={languageId} />
          )}
          {currentStep === 'book' && (
            <BookSelector 
              onSelect={handleBookSelect} 
              onBack={handleClose}
              autoExpandCurrent={true}
              currentBookId={reference?.bookId}
              currentChapter={reference?.chapter}
              showChapterSelection={true}
            />
          )}
        </div>
      )}
    </div>
  );
}
