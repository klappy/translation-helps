/**
 * LanguageSelector.jsx
 * Language selection component with search functionality
 * Shows languages that have scripture resources available
 */
import React, { useState, useEffect, useMemo } from 'react';
import { fetchAllLanguages } from '../../../services/catalogService';
import { getLanguageFlag } from '../../../utils/visualHelpers';
import styles from './LanguageSelector.module.css';

export function LanguageSelector({ onSelect, onBack, slideDirection }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [allLanguages, setAllLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all languages that have scripture resources
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🌐 Fetching languages with scripture resources...');
        const languages = await fetchAllLanguages(true);
        
        console.log(`✅ Loaded ${languages.length} languages with scripture resources`);
        setAllLanguages(languages);
      } catch (err) {
        console.error('Failed to load languages:', err);
        setError('Failed to load languages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadLanguages();
  }, []);

  const filteredLanguages = useMemo(() => {
    if (!searchTerm.trim()) return allLanguages;
    
    const term = searchTerm.toLowerCase();
    return allLanguages.filter(lang => 
      lang.name.toLowerCase().includes(term) ||
      lang.code.toLowerCase().includes(term)
    );
  }, [allLanguages, searchTerm]);

  const handleLanguageSelect = (language) => {
    console.log('🌐 Language selected:', language);
    // Pass the full language object to ensure proper context update
    onSelect(language);
  };

  return (
    <div className={styles.selectorContainer}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
        <h3 className={styles.title}>Select Language</h3>
        <div className={styles.spacer} />
      </div>

      {/* Search */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search languages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          autoFocus
        />
      </div>

      {/* Language List */}
      <div className={styles.listContainer}>
        {loading ? (
          <div className={styles.emptyState}>Loading languages with scripture resources...</div>
        ) : error ? (
          <div className={styles.emptyState}>{error}</div>
        ) : filteredLanguages.length > 0 ? (
          filteredLanguages.map(language => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language)}
              className={styles.languageItem}
            >
              <div className={styles.languageInfo}>
                <div className={styles.languageName}>
                  {getLanguageFlag(language.code)} {language.name}
                </div>
                <div className={styles.languageCode}>{language.code.toUpperCase()}</div>
              </div>
              <div className={styles.organizationCount}>
                {language.organizationCount 
                  ? `${language.organizationCount} organization${language.organizationCount !== 1 ? 's' : ''}`
                  : 'Available'
                }
              </div>
            </button>
          ))
        ) : (
          <div className={styles.emptyState}>
            {searchTerm ? 'No languages found' : 'No languages with scripture resources available'}
          </div>
        )}
      </div>
    </div>
  );
}
