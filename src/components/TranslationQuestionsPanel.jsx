/**
 * TranslationQuestionsPanel.jsx - Self-Activating Display Component
 * Follows Simple Verse-Loading Pattern from docs/SIMPLE-VERSE-LOADING-PATTERN.md
 * 
 * TRANSFORMATION: Reduced from 184 lines to ~60 lines
 * PATTERN: Self-activating display component (no loading logic)
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
  const { handleRcLinkClick } = useContext(RcLinkContext) || {};

  // Self-activate this resource type
  useEffect(() => {
    console.log('🎯 TranslationQuestionsPanel: Self-activating questions resource');
    activateResource('questions');
  }, [activateResource]);

  const questions = resources.questions || [];
  const hasQuestions = questions && questions.length > 0;

  console.log('🎯 TranslationQuestionsPanel: Rendering with', questions.length, 'questions');

  // Handle breadcrumb navigation
  const handleStartNavigation = (step = 'language') => {
    console.log(`Starting tQ navigation at step: ${step}`);
    setForceNavigation(step);
  };

  // Show navigation if no questions available or forced navigation
  if (!hasQuestions || forceNavigation) {
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
        Translation Questions
        {organization !== 'unfoldingWord' && (
          <span className={styles.orgBadge}>from {organization}</span>
        )}
      </h3>

      <div className={styles.questionsList}>
        {questions.map((qa) => (
          <div key={qa.id} className={styles.questionCard}>
            <p className={styles.questionText}>
              Q:{" "}
              {processMarkdownWithRcLinks(qa.question, (rcUri) => {
                if (handleRcLinkClick) {
                  handleRcLinkClick(rcUri, languageId, organization);
                }
              })}
            </p>
            <p className={styles.answerText}>
              A:{" "}
              {processMarkdownWithRcLinks(qa.answer, (rcUri) => {
                if (handleRcLinkClick) {
                  handleRcLinkClick(rcUri, languageId, organization);
                }
              })}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
