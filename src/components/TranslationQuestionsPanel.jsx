/**
 * TranslationQuestionsPanel.jsx - Self-Activating Display Component
 * Enhanced with proper empty verse state messaging
 */

import React, { useContext, useEffect, useState } from "react";
import { RcLinkContext } from "./MainView";
import { useResourcesContext } from "../context/ResourcesContext";
import { processMarkdownWithRcLinks } from "../utils/markdownUtils.jsx";
import { InlineHelpsNavigation } from "./InlineHelpsNavigation";
import { ResourceMetadataCard, HelpsBreadcrumbs } from "./shared";
import styles from "./TranslationQuestionsPanel.module.css";

export function TranslationQuestionsPanel({ reference }) {
  const { resources, activateResource } = useResourcesContext();
  const [forceNavigation, setForceNavigation] = useState(null);
  const [hasTriedLoading, setHasTriedLoading] = useState(false);
  const { handleRcLinkClick } = useContext(RcLinkContext) || {};

  // Self-activate this resource type
  useEffect(() => {
    console.log('🎯 TranslationQuestionsPanel: Self-activating questions resource');
    activateResource('questions');
    setHasTriedLoading(true);
  }, [activateResource]);

  const questions = resources.questions || [];
  const hasQuestions = questions && questions.length > 0;

  console.log('🎯 TranslationQuestionsPanel: Rendering with', questions.length, 'questions');

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
    // Get default metadata for consistent styling
    const organization = 'unfoldingWord';
    const languageId = 'en';

    return (
      <section data-testid='translation-questions-panel' className={styles.translationQuestionsPanel}>
        {/* Breadcrumbs */}
        <HelpsBreadcrumbs
          resourceType="tq"
          languageId={languageId}
          organization={organization}
          onStartNavigation={handleStartNavigation}
        />

        {/* Resource Metadata Card */}
        <ResourceMetadataCard
          organization={organization}
          title="Translation Questions"
          languageId={languageId}
          resourceType="tq"
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
          </div>
        </div>

        <div className={styles.tipSection}>
          <p className={styles.tipText}>
            <span className={styles.tipIcon}>💡</span>
            <span className={styles.tipBold}>Tip:</span> Try navigating to a different verse that may have more content.
          </p>
        </div>
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
  const organization = questionMetadata.organization || 'unfoldingWord';
  const languageId = questionMetadata.languageId || 'en';

  return (
    <section data-testid='translation-questions-panel' className={styles.translationQuestionsPanel}>
      {/* Breadcrumbs */}
      <HelpsBreadcrumbs
        resourceType="tq"
        languageId={languageId}
        organization={organization}
        onStartNavigation={handleStartNavigation}
      />

      {/* Resource Metadata Card */}
      <ResourceMetadataCard
        organization={organization}
        title="Translation Questions"
        languageId={languageId}
        resourceType="tq"
      />

      <h3 className={styles.panelHeader}>
        Questions
        {organization !== 'unfoldingWord' && (
          <span className={styles.orgBadge}>from {organization}</span>
        )}
      </h3>

      <div className={styles.questionsList}>
        {questions.map((qa) => (
          <div key={qa.id} className={styles.questionCard}>
            <div className={styles.questionText}>
              <strong>Q:</strong>{" "}
              {processMarkdownWithRcLinks(qa.question, (rcUri) => {
                if (handleRcLinkClick) {
                  handleRcLinkClick(rcUri, languageId, organization);
                }
              })}
            </div>
            <div className={styles.answerText}>
              <strong>A:</strong>{" "}
              {processMarkdownWithRcLinks(qa.answer, (rcUri) => {
                if (handleRcLinkClick) {
                  handleRcLinkClick(rcUri, languageId, organization);
                }
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
