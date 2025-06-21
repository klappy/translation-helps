/**
 * LanguageSelector.jsx
 * Language selection component with search functionality
 * Shows languages that have scripture resources available with enhanced metadata
 */
import React, { useState, useEffect, useMemo } from 'react';
import { fetchAllLanguages } from '../../../services/catalogService';
import { getLanguageFlag, getEnhancedLanguageDisplay } from '../../../utils/visualHelpers';
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
    if (!searchTerm.trim()) {
      // Group gateway languages first, then sort each group alphabetically
      const gatewayLanguages = allLanguages
        .filter(lang => lang.isGateway)
        .sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code));
      
      const nonGatewayLanguages = allLanguages
        .filter(lang => !lang.isGateway)
        .sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code));
      
      return [...gatewayLanguages, ...nonGatewayLanguages];
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = allLanguages.filter(lang => 
      lang.name.toLowerCase().includes(term) ||
      lang.code.toLowerCase().includes(term) ||
      (lang.anglicizedName && lang.anglicizedName.toLowerCase().includes(term))
    );
    
    // Even when filtering, prioritize gateway languages
    const gatewayFiltered = filtered
      .filter(lang => lang.isGateway)
      .sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code));
    
    const nonGatewayFiltered = filtered
      .filter(lang => !lang.isGateway)
      .sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code));
    
    return [...gatewayFiltered, ...nonGatewayFiltered];
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
          <>
            {filteredLanguages.map((language, index) => {
              const displayInfo = getEnhancedLanguageDisplay(language);
              const isFirstNonGateway = index > 0 && 
                filteredLanguages[index - 1].isGateway && 
                !language.isGateway;
              
              return (
                <React.Fragment key={language.code}>
                  {/* Separator between gateway and non-gateway languages */}
                  {isFirstNonGateway && !searchTerm && (
                    <div className={styles.languageSeparator}>
                      <span className={styles.separatorText}>Other Languages</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleLanguageSelect(language)}
                    className={styles.languageItem}
                  >
                    <div className={styles.languageInfo}>
                      <div className={styles.languageHeader}>
                        <div className={styles.languageName}>
                          {displayInfo.primaryFlag && (
                            <span className={styles.primaryFlag}>{displayInfo.primaryFlag}</span>
                          )}
                          {displayInfo.primaryName}
                          {displayInfo.nativeName && displayInfo.nativeName !== displayInfo.primaryName && (
                            <span className={styles.nativeName}>({displayInfo.nativeName})</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Country code and flags row */}
                      {(displayInfo.countryFlags || displayInfo.code) && (
                        <div className={styles.countryFlags}>
                          <span className="badge">{displayInfo.code}</span>
                          {displayInfo.countryFlags && (
                            <>
                              <span className={styles.flagsLabel}>•</span>
                              <span className={styles.flags}>{displayInfo.countryFlags}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Tags section */}
                    <div className={styles.languageTags}>
                      {displayInfo.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="badge small"
                          title={tag.title}
                        >
                          {tag.emoji} {tag.text}
                        </span>
                      ))}
                      {!displayInfo.tags.length && (
                        <span className="badge small">Available</span>
                      )}
                    </div>
                  </button>
                </React.Fragment>
              );
            })}
          </>
        ) : (
          <div className={styles.emptyState}>
            {searchTerm ? 'No languages found' : 'No languages with scripture resources available'}
          </div>
        )}
      </div>
    </div>
  );
}
