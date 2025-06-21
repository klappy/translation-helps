/**
 * InlineHelpsNavigation.jsx
 * Reusable inline navigation component for translation helps panels
 * Allows selecting alternative languages and organizations when resources are not available
 * Redesigned to match Scripture navigation UI patterns
 */
import React, { useState, useContext, useEffect } from 'react';
import { ReferenceContext } from '../../context/ReferenceContext';
import { LanguageSelector } from '../ScripturePanelRCL/selectors/LanguageSelector';
import { ResourceGrid } from '../shared/ResourceGrid';
import { searchResourcesAcrossOrgs } from '../../services/catalogService';
import { getResourceIcon, getLanguageFlag } from '../../utils/visualHelpers';
import styles from './InlineHelpsNavigation.module.css';

// Resource type mapping for API searches
const RESOURCE_TYPE_MAP = {
  tn: 'TSV Translation Notes',
  tq: 'TSV Translation Questions', 
  tw: 'Translation Words',
  twl: 'TSV Translation Words Links'
};

// Display names for UI
const RESOURCE_DISPLAY_NAMES = {
  tn: 'Translation Notes',
  tq: 'Translation Questions',
  tw: 'Translation Words', 
  twl: 'Translation Word Links'
};

export function InlineHelpsNavigation({
  resourceType,
  currentReference,
  onResourceSelect,
  isResourceAvailable = false,
  forceNavigation = null, // New prop to force navigation to specific step
  onNavigationComplete = null // Callback when navigation is completed/cancelled
}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState('language');
  const [slideDirection, setSlideDirection] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [availableResources, setAvailableResources] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { languageId, organization } = useContext(ReferenceContext);

  // Handle forced navigation from breadcrumbs
  useEffect(() => {
    if (forceNavigation) {
      console.log(`Force navigation to step: ${forceNavigation}`);
      setIsNavigating(true);
      setCurrentStep(forceNavigation);
      setSlideDirection('left');
      setError(null);
      
      // If forcing organization step, we need a language first
      if (forceNavigation === 'organization' && languageId) {
        setSelectedLanguage(languageId);
        loadAvailableResources(languageId);
      }
    }
  }, [forceNavigation]);

  // Don't show navigation if resource is available
  if (isResourceAvailable && !forceNavigation) {
    return null;
  }

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setCurrentStep('language');
    setSlideDirection('left');
    setError(null);
  };

  const handleCancel = () => {
    setIsNavigating(false);
    setCurrentStep('language');
    setSelectedLanguage(null);
    setAvailableResources({});
    setError(null);
    
    // Notify parent that navigation is complete
    if (onNavigationComplete) {
      onNavigationComplete();
    }
  };

  const handleLanguageSelect = async (language) => {
    console.log('🌐 InlineHelpsNavigation: Language selected:', language);
    
    // Handle both language object and language code
    const languageCode = typeof language === 'object' ? language.code : language;
    setSelectedLanguage(languageCode);
    
    // Move to organization step
    setCurrentStep('organization');
    setSlideDirection('left');
    
    // Load available resources for this language and resource type
    await loadAvailableResources(languageCode);
  };

  const loadAvailableResources = async (languageCode) => {
    setLoading(true);
    setError(null);
    
    try {
      const subjectFilter = RESOURCE_TYPE_MAP[resourceType];
      console.log(`🔍 Searching for ${subjectFilter} in ${languageCode}`);
      
      const result = await searchResourcesAcrossOrgs(languageCode, subjectFilter);
      
      if (result?.resources && Object.keys(result.resources).length > 0) {
        setAvailableResources(result.resources);
        console.log('✅ Found resources:', Object.keys(result.resources));
      } else {
        setError(`No ${RESOURCE_DISPLAY_NAMES[resourceType]} found for ${languageCode}`);
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

  const handleResourceSelect = (resource) => {
    console.log('📚 InlineHelpsNavigation: Resource selected:', resource);
    
    // Generate RC link according to our documentation format
    const rcLink = `rc://${selectedLanguage}/${resourceType}/help/${currentReference.bookId}/${currentReference.chapter}/${currentReference.verse}`;
    
    console.log('🔗 Generated RC link:', rcLink);
    
    // Call the parent's RC link handler
    if (onResourceSelect) {
      onResourceSelect(rcLink, selectedLanguage, resource.organization);
    }
    
    // Close navigation
    handleCancel();
  };

  const handleBack = () => {
    if (currentStep === 'organization') {
      setCurrentStep('language');
      setSlideDirection('right');
      setSelectedLanguage(null);
      setAvailableResources({});
    }
  };

  const renderLanguageStep = () => (
    <LanguageSelector onSelect={handleLanguageSelect} />
  );

  const renderOrganizationStep = () => (
    <ResourceGrid
      resources={availableResources}
      onSelect={handleResourceSelect}
      onBack={handleBack}
      title={`Select ${RESOURCE_DISPLAY_NAMES[resourceType]}`}
      searchPlaceholder={`Search ${RESOURCE_DISPLAY_NAMES[resourceType].toLowerCase()}...`}
      loading={loading}
      error={error}
      emptyMessage={`No ${RESOURCE_DISPLAY_NAMES[resourceType]} available in ${selectedLanguage}`}
      resourceType="helps"
    />
  );

  return (
    <div className={styles.navigationContainer}>
      {!isNavigating ? (
        // Collapsed state - show "not available" message with action button
        <div className={styles.noResourceMessage}>
          <div className={styles.messageCard}>
            <div className={styles.messageIcon}>
              {getResourceIcon(resourceType)}
            </div>
            <div className={styles.messageContent}>
              <p className={styles.messageTitle}>
                {RESOURCE_DISPLAY_NAMES[resourceType]} not available
              </p>
              <p className={styles.messageSubtitle}>
                in current language/organization selection
              </p>
            </div>
            <button 
              onClick={handleStartNavigation}
              className={styles.findButton}
            >
              Find Alternative
            </button>
          </div>
        </div>
      ) : (
        // Navigation active - show selection interface
        <div className={styles.navigationPanel}>
          <div className={`${styles.selectionContainer} ${styles[slideDirection]}`}>
            {currentStep === 'language' && renderLanguageStep()}
            {currentStep === 'organization' && renderOrganizationStep()}
          </div>
        </div>
      )}
    </div>
  );
}
