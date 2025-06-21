/**
 * TranslationHelpsNavigation.jsx
 * Inline navigation component for translation helps panels
 * Allows selecting language and organization when resource is not available
 * Enhanced with biblical iconography and detailed book counts
 */
import React, { useState, useContext, useEffect } from 'react';
import { ReferenceContext } from '../../context/ReferenceContext';
import { searchResourcesAcrossOrgs } from '../../services/catalogService';
import { getResourceIcon, getLanguageFlag } from '../../utils/visualHelpers';
import styles from './TranslationHelpsNavigation.module.css';

const RESOURCE_TYPE_MAP = {
  tn: 'Translation Notes',
  tq: 'Translation Questions',
  tw: 'Translation Words',
  twl: 'Translation Word Links'
};

const RESOURCE_DISPLAY_NAMES = {
  tn: 'Translation Notes',
  tq: 'Translation Questions',
  tw: 'Translation Words',
  twl: 'Translation Word Links'
};

// Enhanced book count analysis for Bible resources
const getDetailedBookCount = (resource) => {
  if (!resource.books || !Array.isArray(resource.books)) {
    return null;
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
  const totalCount = bookIds.length;

  return {
    total: totalCount,
    ot: otCount,
    nt: ntCount,
    hasOT: otCount > 0,
    hasNT: ntCount > 0,
    isCompleteOT: otCount === 39,
    isCompleteNT: ntCount === 27,
    isCompleteBible: otCount === 39 && ntCount === 27
  };
};

const getEnhancedBookCountDisplay = (resource) => {
  const detailed = getDetailedBookCount(resource);
  if (!detailed) {
    // Fallback to simple count
    const count = resource.books?.length || 0;
    if (count === 0) return 'No books';
    if (count === 1) return '1 book';
    return `${count} books`;
  }

  if (detailed.total === 0) return 'No books';
  if (detailed.total === 1) return '1 book';

  // If it's a complete Bible
  if (detailed.isCompleteBible) {
    return '📖 Complete Bible (66 books)';
  }

  // If it has both OT and NT
  if (detailed.hasOT && detailed.hasNT) {
    return `📜 OT: ${detailed.ot} • ✝️ NT: ${detailed.nt}`;
  }

  // If it's only OT
  if (detailed.hasOT && !detailed.hasNT) {
    if (detailed.isCompleteOT) {
      return '📜 Complete Old Testament (39 books)';
    }
    return `📜 Old Testament (${detailed.ot} books)`;
  }

  // If it's only NT
  if (detailed.hasNT && !detailed.hasOT) {
    if (detailed.isCompleteNT) {
      return '✝️ Complete New Testament (27 books)';
    }
    return `✝️ New Testament (${detailed.nt} books)`;
  }

  // Fallback for edge cases
  return `📚 ${detailed.total} books`;
};

// Get the appropriate icon for the resource based on book content
const getResourceBookIcon = (resource) => {
  const detailed = getDetailedBookCount(resource);
  if (!detailed) {
    // Fallback to general resource icon
    return getResourceIcon(resource.id);
  }

  // Complete Bible gets the full Bible icon
  if (detailed.isCompleteBible) {
    return '📖';
  }

  // Mixed OT/NT gets Bible icon
  if (detailed.hasOT && detailed.hasNT) {
    return '📖';
  }

  // Old Testament only
  if (detailed.hasOT && !detailed.hasNT) {
    return '📜';
  }

  // New Testament only
  if (detailed.hasNT && !detailed.hasOT) {
    return '✝️';
  }

  // Fallback to general resource icon
  return getResourceIcon(resource.id);
};

export function TranslationHelpsNavigation({ 
  resourceType, 
  onResourceSelect,
  currentOrganization,
  currentLanguageId 
}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState('complete');
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableResources, setAvailableResources] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguageId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { updateContext, mixedResources } = useContext(ReferenceContext);

  // Determine if we should show navigation
  const showNavigation = !currentOrganization || isNavigating;

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setCurrentStep('language');
    loadAvailableLanguages();
  };

  const handleCancel = () => {
    setIsNavigating(false);
    setCurrentStep('complete');
    setSelectedLanguage(currentLanguageId);
    setError(null);
  };

  const loadAvailableLanguages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For now, we'll use a predefined list of common languages
      // In the future, this could query the API for all available languages
      const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ar', name: 'Arabic' },
        { code: 'hi', name: 'Hindi' },
        { code: 'ru', name: 'Russian' },
        { code: 'ja', name: 'Japanese' }
      ];
      
      setAvailableLanguages(languages);
    } catch (err) {
      console.error('Failed to load languages:', err);
      setError('Failed to load available languages');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = async (languageCode) => {
    setSelectedLanguage(languageCode);
    setCurrentStep('organization');
    await loadAvailableResources(languageCode);
  };

  const loadAvailableResources = async (languageId) => {
    setLoading(true);
    setError(null);
    
    try {
      const subjectFilter = RESOURCE_TYPE_MAP[resourceType];
      const result = await searchResourcesAcrossOrgs(languageId, subjectFilter);
      
      if (result?.resources && Object.keys(result.resources).length > 0) {
        setAvailableResources(result.resources);
      } else {
        setError(`No ${RESOURCE_DISPLAY_NAMES[resourceType]} found for this language`);
        setAvailableResources({});
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
      setError('Failed to load available resources');
      setAvailableResources({});
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationSelect = (organization, resource) => {
    // Update mixed resources in context
    const updatedMixedResources = {
      ...mixedResources,
      [resourceType]: {
        organization,
        resourceId: resource.id,
        languageId: selectedLanguage,
        resource
      }
    };
    
    updateContext({ mixedResources: updatedMixedResources });
    
    // Notify parent component
    if (onResourceSelect) {
      onResourceSelect({
        organization,
        languageId: selectedLanguage,
        resourceId: resource.id,
        resource
      });
    }
    
    // Close navigation
    setIsNavigating(false);
    setCurrentStep('complete');
  };

  const renderLanguageStep = () => (
    <div className={styles.stepContent}>
      <h4 className={styles.stepTitle}>Select Language for {RESOURCE_DISPLAY_NAMES[resourceType]}</h4>
      <div className={styles.optionsGrid}>
        {availableLanguages.map(lang => (
          <button
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            className={styles.optionButton}
          >
            <span className={styles.flag}>{getLanguageFlag(lang.code)}</span>
            <span className={styles.optionName}>{lang.name}</span>
            <span className={styles.optionCode}>{lang.code}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderOrganizationStep = () => (
    <div className={styles.stepContent}>
      <h4 className={styles.stepTitle}>Select Organization</h4>
      {Object.keys(availableResources).length === 0 ? (
        <p className={styles.noResults}>
          No {RESOURCE_DISPLAY_NAMES[resourceType]} available in {selectedLanguage}
        </p>
      ) : (
        <div className={styles.organizationList}>
          {Object.entries(availableResources).map(([org, resources]) => (
            <div key={org} className={styles.organizationGroup}>
              <h5 className={styles.organizationName}>{org}</h5>
              <div className={styles.resourceList}>
                {resources.map(resource => (
                  <button
                    key={resource.id}
                    onClick={() => handleOrganizationSelect(org, resource)}
                    className={styles.resourceButton}
                  >
                    <span className={styles.resourceIcon}>{getResourceBookIcon(resource)}</span>
                    <div className={styles.resourceInfo}>
                      <span className={styles.resourceName}>{resource.title || resource.id}</span>
                      <span className={styles.resourceMeta}>
                        {getEnhancedBookCountDisplay(resource)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!showNavigation) {
    return null;
  }

  return (
    <div className={styles.navigationContainer}>
      {!isNavigating ? (
        <div className={styles.noResourceMessage}>
          <p>{RESOURCE_DISPLAY_NAMES[resourceType]} not available in current selection.</p>
          <button 
            onClick={handleStartNavigation}
            className={styles.selectButton}
          >
            Find {RESOURCE_DISPLAY_NAMES[resourceType]} in another language/organization
          </button>
        </div>
      ) : (
        <div className={styles.navigationPanel}>
          <div className={styles.navigationHeader}>
            <button onClick={handleCancel} className={styles.cancelButton}>
              ← Cancel
            </button>
            <span className={styles.navigationTitle}>
              Select {RESOURCE_DISPLAY_NAMES[resourceType]}
            </span>
          </div>
          
          {loading && (
            <div className={styles.loading}>Loading...</div>
          )}
          
          {error && (
            <div className={styles.error}>{error}</div>
          )}
          
          {!loading && !error && (
            <>
              {currentStep === 'language' && renderLanguageStep()}
              {currentStep === 'organization' && renderOrganizationStep()}
            </>
          )}
        </div>
      )}
    </div>
  );
}
