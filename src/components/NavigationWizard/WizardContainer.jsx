/**
 * WizardContainer.jsx
 * Main container for the step-by-step navigation wizard
 * Manages state, step flow, and integrates with existing ReferenceContext
 * Enhanced with advanced mode support for cross-organization resources
 */

import React, { useState, useContext, useEffect, useCallback } from "react";
import { ReferenceContext } from "../../context/ReferenceContext";
import { StepIndicator } from "./StepIndicator";
import { AdvancedModeToggle } from "./AdvancedModeToggle";
import { OrganizationStep } from "./steps/OrganizationStep";
import { LanguageStep } from "./steps/LanguageStep";
import { ResourceStep } from "./steps/ResourceStep";
import { BookStep } from "./steps/BookStep";
import { ChapterVerseStep } from "./steps/ChapterVerseStep";
import { useWizardState } from "./hooks/useWizardState";
import { useNavigationHistory } from "./hooks/useNavigationHistory";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import styles from "./NavigationWizard.module.css";

// Basic mode steps (original workflow)
const BASIC_STEPS = {
  ORGANIZATION: 0,
  LANGUAGE: 1,
  RESOURCE: 2,
  BOOK: 3,
  CHAPTER_VERSE: 4,
};

// Advanced mode steps (cross-organization workflow)
const ADVANCED_STEPS = {
  LANGUAGE: 0,
  RESOURCE: 1,
  BOOK: 2,
  CHAPTER_VERSE: 3,
};

const BASIC_STEP_NAMES = ["Organization", "Language", "Resource", "Book", "Chapter & Verse"];
const ADVANCED_STEP_NAMES = ["Language", "Mixed Resources", "Book", "Chapter & Verse"];

export function WizardContainer({ onComplete, isDesktop = false, initialStep = null }) {
  const { 
    organization, 
    languageId, 
    resourceId, 
    reference, 
    advancedMode,
    resourceOrganization,
    mixedResources,
    updateContext 
  } = useContext(ReferenceContext);

  // Get current step configuration based on mode
  const getStepConfig = () => {
    return advancedMode ? {
      steps: ADVANCED_STEPS,
      stepNames: ADVANCED_STEP_NAMES,
      maxStep: 3
    } : {
      steps: BASIC_STEPS,
      stepNames: BASIC_STEP_NAMES,
      maxStep: 4
    };
  };

  // Determine initial step based on mode and context
  const getInitialStep = () => {
    const config = getStepConfig();
    
    // If initialStep is explicitly provided, use it (from breadcrumb navigation)
    if (initialStep !== null) {
      return Math.max(0, Math.min(config.maxStep, initialStep - 1));
    }

    if (advancedMode) {
      // Advanced mode workflow: Language → Resource → Book → Chapter/Verse
      if (languageId && mixedResources && Object.values(mixedResources).some(r => r) && reference?.bookId && reference?.chapter) {
        return ADVANCED_STEPS.CHAPTER_VERSE;
      } else if (languageId && mixedResources && Object.values(mixedResources).some(r => r) && reference?.bookId) {
        return ADVANCED_STEPS.BOOK;
      } else if (languageId && mixedResources && Object.values(mixedResources).some(r => r)) {
        return ADVANCED_STEPS.RESOURCE;
      } else if (languageId) {
        return ADVANCED_STEPS.LANGUAGE;
      }
      return ADVANCED_STEPS.LANGUAGE;
    } else {
      // Basic mode workflow: Organization → Language → Resource → Book → Chapter/Verse
      if (organization && languageId && resourceId && reference?.bookId && reference?.chapter) {
        return BASIC_STEPS.CHAPTER_VERSE;
      } else if (organization && languageId && resourceId && reference?.bookId) {
        return BASIC_STEPS.BOOK;
      } else if (organization && languageId && resourceId) {
        return BASIC_STEPS.RESOURCE;
      } else if (organization && languageId) {
        return BASIC_STEPS.LANGUAGE;
      } else if (organization) {
        return BASIC_STEPS.ORGANIZATION;
      }
      return BASIC_STEPS.ORGANIZATION;
    }
  };

  const [currentStep, setCurrentStep] = useState(getInitialStep());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [wizardData, setWizardData] = useState({
    // Basic fields
    organization: organization || null,
    languageId: languageId || null,
    resourceId: resourceId || null,
    bookId: reference?.bookId || null,
    chapter: reference?.chapter || null,
    verse: reference?.verse || null,
    
    // Advanced mode fields
    advancedMode: advancedMode || false,
    resourceOrganization: resourceOrganization || null,
    mixedResources: mixedResources || {
      scripture: null,
      tn: null,
      tq: null,
      tw: null,
      twl: null
    }
  });

  // Custom hooks
  const { saveSelection, getRecentSelections } = useNavigationHistory();
  const { validateStep, canProceed } = useWizardState(wizardData);

  // Update step when mode changes or context changes
  useEffect(() => {
    if (initialStep !== null) {
      // Don't auto-change step if explicitly set by breadcrumb
      return;
    }

    const newStep = getInitialStep();
    if (newStep !== currentStep) {
      setCurrentStep(newStep);
    }
  }, [organization, languageId, resourceId, reference, advancedMode, mixedResources, initialStep]);

  const handleStepChange = useCallback(
    (stepIndex, data = {}) => {
      if (isTransitioning) return;

      setIsTransitioning(true);

      // Update wizard data
      setWizardData((prev) => ({ ...prev, ...data }));

      // Update context if data provided
      if (Object.keys(data).length > 0) {
        const contextUpdate = {};

        if (data.organization !== undefined) {
          contextUpdate.organization = data.organization;
          // Reset downstream selections when organization changes
          contextUpdate.languageId = null;
          contextUpdate.resourceId = null;
          contextUpdate.reference = { bookId: null, chapter: null, verse: null };
        }

        if (data.languageId !== undefined) {
          contextUpdate.languageId = data.languageId;
          // Reset downstream selections when language changes
          if (!contextUpdate.resourceId === undefined) {
            contextUpdate.resourceId = null;
            contextUpdate.reference = { bookId: null, chapter: null, verse: null };
          }
        }

        if (data.resourceId !== undefined) {
          contextUpdate.resourceId = data.resourceId;
          // Reset downstream selections when resource changes
          if (!contextUpdate.reference) {
            contextUpdate.reference = { bookId: null, chapter: null, verse: null };
          }
        }

        if (data.bookId !== undefined || data.chapter !== undefined || data.verse !== undefined) {
          contextUpdate.reference = {
            bookId: data.bookId ?? reference?.bookId ?? null,
            chapter: data.chapter ?? reference?.chapter ?? null,
            verse: data.verse ?? reference?.verse ?? null,
          };
        }

        updateContext(contextUpdate);
      }

      // Change step with animation delay
      setTimeout(() => {
        setCurrentStep(stepIndex);
        setIsTransitioning(false);
      }, 150);
    },
    [isTransitioning, updateContext, reference]
  );

  const handleNext = useCallback(() => {
    const config = getStepConfig();
    if (currentStep < config.maxStep && canProceed(currentStep)) {
      handleStepChange(currentStep + 1);
    }
  }, [currentStep, canProceed, handleStepChange, advancedMode]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    }
  }, [currentStep, handleStepChange]);

  const handleEscape = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  const isStepValid = useCallback(
    (stepIndex) => {
      // Allow navigation to any step that is at or before the current step
      if (stepIndex <= currentStep) {
        return true;
      }

      if (advancedMode) {
        // Advanced mode validation
        switch (stepIndex) {
          case ADVANCED_STEPS.LANGUAGE:
            return true; // Language step is always accessible in advanced mode
          case ADVANCED_STEPS.RESOURCE:
            return wizardData.languageId !== null;
          case ADVANCED_STEPS.BOOK:
            return wizardData.languageId !== null && 
                   wizardData.mixedResources && 
                   Object.values(wizardData.mixedResources).some(r => r !== null);
          case ADVANCED_STEPS.CHAPTER_VERSE:
            return wizardData.languageId !== null && 
                   wizardData.mixedResources && 
                   Object.values(wizardData.mixedResources).some(r => r !== null) &&
                   wizardData.bookId !== null;
          default:
            return false;
        }
      } else {
        // Basic mode validation (original logic)
        switch (stepIndex) {
          case BASIC_STEPS.ORGANIZATION:
            return true; // Organization step is always accessible
          case BASIC_STEPS.LANGUAGE:
            return wizardData.organization !== null;
          case BASIC_STEPS.RESOURCE:
            return wizardData.organization !== null && wizardData.languageId !== null;
          case BASIC_STEPS.BOOK:
            return (
              wizardData.organization !== null &&
              wizardData.languageId !== null &&
              wizardData.resourceId !== null
            );
          case BASIC_STEPS.CHAPTER_VERSE:
            return (
              wizardData.organization !== null &&
              wizardData.languageId !== null &&
              wizardData.resourceId !== null &&
              wizardData.bookId !== null
            );
          default:
            return false;
        }
      }
    },
    [wizardData, currentStep, advancedMode]
  );

  const handleJumpToStep = useCallback(
    (stepIndex) => {
      if (isStepValid(stepIndex) && !isTransitioning) {
        handleStepChange(stepIndex);
      }
    },
    [isStepValid, isTransitioning, handleStepChange]
  );

  const handleWizardComplete = useCallback(() => {
    // Save to history
    saveSelection({
      organization: wizardData.organization,
      languageId: wizardData.languageId,
      resourceId: wizardData.resourceId,
      bookId: wizardData.bookId,
      chapter: wizardData.chapter,
      verse: wizardData.verse,
      timestamp: Date.now(),
    });

    if (onComplete) {
      onComplete(wizardData);
    }
  }, [wizardData, saveSelection, onComplete]);

  // Keyboard navigation
  useKeyboardNavigation({
    onNext: handleNext,
    onPrevious: handlePrevious,
    onEscape: handleEscape,
    enabled: !isTransitioning,
  });

  const renderCurrentStep = () => {
    const commonProps = {
      onNext: handleNext,
      onPrevious: handlePrevious,
      onStepChange: handleStepChange,
      wizardData,
      isTransitioning,
      isDesktop,
      advancedMode, // Pass advanced mode to steps
    };

    if (advancedMode) {
      // Advanced mode step rendering
      switch (currentStep) {
        case ADVANCED_STEPS.LANGUAGE:
          return <LanguageStep {...commonProps} />;
        case ADVANCED_STEPS.RESOURCE:
          return <ResourceStep {...commonProps} />;
        case ADVANCED_STEPS.BOOK:
          return <BookStep {...commonProps} />;
        case ADVANCED_STEPS.CHAPTER_VERSE:
          return <ChapterVerseStep {...commonProps} onComplete={handleWizardComplete} />;
        default:
          return <LanguageStep {...commonProps} />;
      }
    } else {
      // Basic mode step rendering (original logic)
      switch (currentStep) {
        case BASIC_STEPS.ORGANIZATION:
          return <OrganizationStep {...commonProps} />;
        case BASIC_STEPS.LANGUAGE:
          return <LanguageStep {...commonProps} />;
        case BASIC_STEPS.RESOURCE:
          return <ResourceStep {...commonProps} />;
        case BASIC_STEPS.BOOK:
          return <BookStep {...commonProps} />;
        case BASIC_STEPS.CHAPTER_VERSE:
          return <ChapterVerseStep {...commonProps} onComplete={handleWizardComplete} />;
        default:
          return <OrganizationStep {...commonProps} />;
      }
    }
  };

  const config = getStepConfig();

  return (
    <div
      className={`${styles.wizardContainer} ${isDesktop ? styles.desktop : ""} ${advancedMode ? styles.advancedMode : styles.basicMode}`}
      data-testid='navigation-wizard'
    >
      <AdvancedModeToggle className={styles.modeToggle} />
      
      <StepIndicator
        currentStep={currentStep}
        stepNames={config.stepNames}
        onStepClick={handleJumpToStep}
        canJumpTo={isStepValid}
        isDesktop={isDesktop}
        advancedMode={advancedMode}
      />

      <div
        className={`${styles.wizardContent} ${isDesktop ? styles.desktop : ""} ${
          isTransitioning ? styles.transitioning : ""
        }`}
      >
        {renderCurrentStep()}
      </div>
    </div>
  );
}

export { BASIC_STEPS, ADVANCED_STEPS, BASIC_STEP_NAMES, ADVANCED_STEP_NAMES };
