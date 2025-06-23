/**
 * TranslationQuestionsPanel.jsx - Self-Activating Display Component
 * Enhanced with proper empty verse state messaging
 */

import React, { useContext, useEffect, useState } from "react";
import { RcLinkContext } from "./MainView";
import { ReferenceContext } from "../context/ReferenceContext";
import { useResourcesContext } from "../context/ResourcesContext";
import { processMarkdownWithRcLinks } from "../utils/markdownUtils.jsx";
import { InlineHelpsNavigation } from "./InlineHelpsNavigation";
import { ResourceMetadataCard, HelpsBreadcrumbs } from "./shared";
import styles from "./TranslationQuestionsPanel.module.css";

export function TranslationQuestionsPanel({ reference }) {
  const { resources, activateResource } = useResourcesContext();
  const { mixedResources, organization: defaultOrganization, languageId: defaultLanguageId } = useContext(ReferenceContext);
  const [forceNavigation, setForceNavigation] = useState(null);
  const [hasTriedLoading, setHasTriedLoading] = useState(false);
  const { handleRcLinkClick } = useContext(RcLinkContext) || {};

  // Self-activate this resource type
  useEffect(() => {
    console.log('🎯 TranslationQuestionsPanel: Self-activating questions resource');
    activateResource('questions');
    setHasTriedLoading(true);
  }, []); // Empty dependency array - only run once on mount

  const questions = resources.questions || [];
  const hasQuestions = questions && questions.length > 0;

  console.log('🎯 TranslationQuestionsPanel: Rendering with', questions.length, 'questions');

  // Get actual selected resource metadata (not hardcoded defaults)
  const getSelectedResourceMetadata = () => {
    // Check if user has selected a specific resource configuration
    const selectedResource = mixedResources?.questions;
    
    return {
      organization: selectedResource?.organization || defaultOrganization || 'unfoldingWord',
      languageId: selectedResource?.languageId || defaultLanguageId || 'en'
    };
  };

  // Handle breadcrumb navigation
  const handleStartNavigation = (step = 'language') => {
    console.log(`Starting tQ navigation at step: ${step}`);
    setForceNavigation(step);
  };

  // Show navigation if forced navigation is active
  if (forceNavigation) {
    return (
      <section
        data-testid='translation-questions-panel'
        className={styles.translationQuestionsPanel}
      >
        <InlineHelpsNavigation
          resourceType="tq"
          currentReference={reference}
          onResourceSelect={handleRcLinkClick}
          isResourceAvailable={hasQuestions}
          forceNavigation={forceNavigation}
          onNavigationComplete={() => setForceNavigation(null)}
        />
      </section>
    );
  }

  // Show empty verse state if we've tried loading and have no questions for this verse
  if (hasTriedLoading && !hasQuestions && reference?.verse) {
    // Get actual selected resource metadata instead of hardcoded defaults
    const { organization, languageId } = getSelectedResourceMetadata();

    return (
      <section data-testid='translation-questions-panel' className={styles.translationQuestionsPanel}>
        {/* Breadcrumbs */}
        <HelpsBreadcrumbs
          resourceType="tq"
          languageId={languageId}
          organization={organization}
          onStartNavigation={handleStartNavigation}
        />

        <h3 className={styles.panelHeader}>
          Questions
          {organization !== 'unfoldingWord' && (
            <span className={styles.orgBadge}>from {organization}</span>
          )}
        </h3>

        <div className={styles.questionsList}>
          <div className={styles.questionCard}>
            <div className={styles.questionText}>
              <strong>Q:</strong> No translation questions available for this verse.
            </div>
            <div className={styles.answerText}>
              <strong>A:</strong> Current verse: <strong>{reference.bookId} {reference.chapter}:{reference.verse}</strong>
            </div>
            <div className={styles.answerText}>
              Selected resource: <strong>{organization} • {languageId.toUpperCase()}</strong>
            </div>
          </div>
        </div>

        <div className={styles.tipSection}>
          <p className={styles.tipText}>
            <span className={styles.tipIcon}>💡</span>
            <span className={styles.tipBold}>Tip:</span> Try navigating to a different verse that may have more content, or select a different organization/language combination.
          </p>
        </div>

        {/* Resource Metadata Card - Moved to bottom */}
        <ResourceMetadataCard
          organization={organization}
          title="Translation Questions"
          languageId={languageId}
          resourceType="tq"
        />
      </section>
    );
  }

  // Show navigation if no questions available and haven't tried loading yet
  if (!hasQuestions) {
    return (
      <section
        data-testid='translation-questions-panel'
        className={styles.translationQuestionsPanel}
      >
        <InlineHelpsNavigation
          resourceType="tq"
          currentReference={reference}
          onResourceSelect={handleRcLinkClick}
          isResourceAvailable={hasQuestions}
          forceNavigation={forceNavigation}
          onNavigationComplete={() => setForceNavigation(null)}
        />
      </section>
    );
  }

  // Get metadata from first question (all questions have same metadata)
  const questionMetadata = questions[0] || {};
  const { organization, languageId } = getSelectedResourceMetadata();
  // Fallback to question metadata if somehow no selection exists
  const finalOrganization = organization || questionMetadata.organization || 'unfoldingWord';
  const finalLanguageId = languageId || questionMetadata.languageId || 'en';

  return (
    <section data-testid='translation-questions-panel' className={styles.translationQuestionsPanel}>
      {/* Breadcrumbs */}
      <HelpsBreadcrumbs
        resourceType="tq"
        languageId={finalLanguageId}
        organization={finalOrganization}
        onStartNavigation={handleStartNavigation}
      />

      <h3 className={styles.panelHeader}>
        Questions
        {finalOrganization !== 'unfoldingWord' && (
          <span className={styles.orgBadge}>from {finalOrganization}</span>
        )}
      </h3>

      <div className={styles.questionsList}>
        {questions.map((qa) => (
          <div key={qa.id} className={styles.questionCard}>
            <div className={styles.questionText}>
              <strong>Q:</strong>{" "}
              {processMarkdownWithRcLinks(qa.question, (rcUri) => {
                if (handleRcLinkClick) {
                  handleRcLinkClick(rcUri, finalLanguageId, finalOrganization);
                }
              })}
            </div>
            <div className={styles.answerText}>
              <strong>A:</strong>{" "}
              {processMarkdownWithRcLinks(qa.answer, (rcUri) => {
                if (handleRcLinkClick) {
                  handleRcLinkClick(rcUri, finalLanguageId, finalOrganization);
                }
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Resource Metadata Card - Moved to bottom */}
      <ResourceMetadataCard
        organization={finalOrganization}
        title="Translation Questions"
        languageId={finalLanguageId}
        resourceType="tq"
      />
    </section>
  );
}
