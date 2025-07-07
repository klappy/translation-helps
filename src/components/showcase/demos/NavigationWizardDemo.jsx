/**
 * NavigationWizardDemo.jsx
 * Interactive demonstration of the navigation wizard
 * Shows step-by-step book/chapter selection with intelligent defaults
 */

import React, { useState } from 'react';
import styles from './NavigationWizardDemo.module.css';

export function NavigationWizardDemo() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');

  // Mock data for demo
  const organizations = ['unfoldingWord', 'Door43-Catalog', 'STR'];
  const languages = ['English', 'Spanish', 'French', 'Hindi'];
  const books = ['Genesis', 'Exodus', 'Matthew', 'Romans', 'Titus'];
  const chapters = [1, 2, 3, 4, 5];

  const steps = [
    { id: 1, label: 'Organization', field: 'organization' },
    { id: 2, label: 'Language', field: 'language' },
    { id: 3, label: 'Book', field: 'book' },
    { id: 4, label: 'Chapter', field: 'chapter' },
    { id: 5, label: 'Complete', field: 'complete' }
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedOrg('');
    setSelectedLang('');
    setSelectedBook('');
    setSelectedChapter('');
  };

  const getSelectionForStep = (step) => {
    switch(step) {
      case 1: return selectedOrg;
      case 2: return selectedLang;
      case 3: return selectedBook;
      case 4: return selectedChapter;
      default: return '';
    }
  };

  const canProceed = () => {
    switch(currentStep) {
      case 1: return selectedOrg !== '';
      case 2: return selectedLang !== '';
      case 3: return selectedBook !== '';
      case 4: return selectedChapter !== '';
      default: return false;
    }
  };

  return (
    <div className={styles.demoContainer} data-testid="navigation-wizard-demo">
      <div className={styles.demoPanel}>
        <h3 className={styles.demoTitle}>Live Navigation Wizard Demo</h3>
        
        <div className={styles.wizardContainer}>
          {/* Progress Indicator */}
          <div className={styles.progressIndicator} data-testid="progress-indicator">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`${styles.progressStep} ${
                  currentStep === step.id ? styles.active : ''
                } ${
                  currentStep > step.id ? styles.completed : ''
                }`}
                data-testid={`step-${step.id}`}
              >
                <div className={styles.stepNumber}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <div className={styles.stepLabel}>{step.label}</div>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className={styles.stepContent}>
            {currentStep === 1 && (
              <div className={styles.selectionStep} data-testid="org-selection">
                <h4>Select Organization</h4>
                <p>Choose the organization that provides your preferred translation resources.</p>
                <div className={styles.optionGrid}>
                  {organizations.map(org => (
                    <button
                      key={org}
                      className={`${styles.optionButton} ${selectedOrg === org ? styles.selected : ''}`}
                      onClick={() => setSelectedOrg(org)}
                      data-testid={`org-${org}`}
                    >
                      {org}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className={styles.selectionStep} data-testid="lang-selection">
                <h4>Select Language</h4>
                <p>Choose your preferred language for translation resources.</p>
                <div className={styles.optionGrid}>
                  {languages.map(lang => (
                    <button
                      key={lang}
                      className={`${styles.optionButton} ${selectedLang === lang ? styles.selected : ''}`}
                      onClick={() => setSelectedLang(lang)}
                      data-testid={`lang-${lang}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className={styles.selectionStep} data-testid="book-selection">
                <h4>Select Book</h4>
                <p>Choose the biblical book you want to study.</p>
                <div className={styles.optionGrid}>
                  {books.map(book => (
                    <button
                      key={book}
                      className={`${styles.optionButton} ${selectedBook === book ? styles.selected : ''}`}
                      onClick={() => setSelectedBook(book)}
                      data-testid={`book-${book}`}
                    >
                      {book}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className={styles.selectionStep} data-testid="chapter-selection">
                <h4>Select Chapter</h4>
                <p>Choose the chapter you want to focus on.</p>
                <div className={styles.optionGrid}>
                  {chapters.map(chapter => (
                    <button
                      key={chapter}
                      className={`${styles.optionButton} ${selectedChapter === chapter ? styles.selected : ''}`}
                      onClick={() => setSelectedChapter(chapter)}
                      data-testid={`chapter-${chapter}`}
                    >
                      Chapter {chapter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className={styles.completionStep} data-testid="completion">
                <div className={styles.completionIcon}>🎉</div>
                <h4>Navigation Complete!</h4>
                <div className={styles.selectionSummary}>
                  <div className={styles.summaryItem}>
                    <strong>Organization:</strong> {selectedOrg}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Language:</strong> {selectedLang}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Book:</strong> {selectedBook}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Chapter:</strong> {selectedChapter}
                  </div>
                </div>
                <p className={styles.completionMessage}>
                  Ready to load translation resources for <strong>{selectedBook} {selectedChapter}</strong>!
                </p>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className={styles.wizardControls}>
            <button
              className={styles.controlButton}
              onClick={handlePrevious}
              disabled={currentStep === 1}
              data-testid="previous-button"
            >
              ← Previous
            </button>
            
            <div className={styles.stepIndicator}>
              Step {currentStep} of {steps.length}
            </div>
            
            {currentStep < 5 ? (
              <button
                className={`${styles.controlButton} ${styles.primaryButton}`}
                onClick={handleNext}
                disabled={!canProceed()}
                data-testid="next-button"
              >
                Next →
              </button>
            ) : (
              <button
                className={`${styles.controlButton} ${styles.resetButton}`}
                onClick={handleReset}
                data-testid="reset-button"
              >
                Start Over
              </button>
            )}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className={styles.featureHighlights}>
          <div className={styles.highlight}>
            <span className={styles.highlightIcon}>🎯</span>
            <span>Intelligent Defaults</span>
          </div>
          <div className={styles.highlight}>
            <span className={styles.highlightIcon}>⚡</span>
            <span>Fast Navigation</span>
          </div>
          <div className={styles.highlight}>
            <span className={styles.highlightIcon}>🔄</span>
            <span>Step Validation</span>
          </div>
          <div className={styles.highlight}>
            <span className={styles.highlightIcon}>📱</span>
            <span>Mobile Friendly</span>
          </div>
        </div>
      </div>
    </div>
  );
} 