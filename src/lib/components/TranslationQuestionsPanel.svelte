<script>
  import { onMount } from 'svelte';
  import { resourcesStore } from '$lib/stores/resources.js';
  import { referenceStore } from '$lib/stores/reference.js';
  import { processMarkdownWithRcLinks } from '$lib/utils/markdownUtils.js';
  import InlineHelpsNavigation from './InlineHelpsNavigation.svelte';
  import ResourceMetadataCard from './shared/ResourceMetadataCard.svelte';
  import HelpsBreadcrumbs from './shared/HelpsBreadcrumbs.svelte';

  export let reference;
  export let onRcLinkClick = null;

  let questions = [];
  let forceNavigation = null;
  let hasTriedLoading = false;
  let mixedResources = {};
  let organization = 'unfoldingWord';
  let languageId = 'en';

  // Subscribe to stores
  const unsubscribeResources = resourcesStore.subscribe((resources) => {
    questions = resources.questions || [];
  });

  const unsubscribeReference = referenceStore.subscribe((refStore) => {
    mixedResources = refStore.mixedResources || {};
    organization = refStore.organization || 'unfoldingWord';
    languageId = refStore.languageId || 'en';
  });

  // Self-activate this resource type
  onMount(() => {
    console.log('🎯 TranslationQuestionsPanel: Self-activating questions resource');
    resourcesStore.activateResource('questions');
    hasTriedLoading = true;
    
    return () => {
      unsubscribeResources();
      unsubscribeReference();
    };
  });

  $: hasQuestions = questions && questions.length > 0;

  // Get actual selected resource metadata (not hardcoded defaults)
  function getSelectedResourceMetadata() {
    // Check if user has selected a specific resource configuration
    const selectedResource = mixedResources?.questions;
    
    return {
      organization: selectedResource?.organization || organization || 'unfoldingWord',
      languageId: selectedResource?.languageId || languageId || 'en'
    };
  }

  // Handle breadcrumb navigation
  function handleStartNavigation(step = 'language') {
    console.log(`Starting tQ navigation at step: ${step}`);
    forceNavigation = step;
  }

  function handleNavigationComplete() {
    forceNavigation = null;
  }

  function handleRcLinkInContent(rcUri) {
    if (onRcLinkClick) {
      const { organization: finalOrganization, languageId: finalLanguageId } = getSelectedResourceMetadata();
      onRcLinkClick(rcUri, finalLanguageId, finalOrganization);
    }
  }

  // Get metadata from first question (all questions have same metadata)
  $: questionMetadata = questions[0] || {};
  $: selectedMetadata = getSelectedResourceMetadata();
  $: finalOrganization = selectedMetadata.organization || questionMetadata.organization || 'unfoldingWord';
  $: finalLanguageId = selectedMetadata.languageId || questionMetadata.languageId || 'en';

  // Debug logging
  $: console.log('🎯 TranslationQuestionsPanel: Rendering with', questions.length, 'questions');
</script>

<!-- Show navigation if forced navigation is active -->
{#if forceNavigation}
  <section data-testid="translation-questions-panel" class="translation-questions-panel">
    <InlineHelpsNavigation
      resourceType="tq"
      currentReference={reference}
      onResourceSelect={onRcLinkClick}
      isResourceAvailable={hasQuestions}
      {forceNavigation}
      onNavigationComplete={handleNavigationComplete}
    />
  </section>
<!-- Show empty verse state if we've tried loading and have no questions for this verse -->
{:else if hasTriedLoading && !hasQuestions && reference?.verse}
  <section data-testid="translation-questions-panel" class="translation-questions-panel">
    <!-- Breadcrumbs -->
    <HelpsBreadcrumbs
      resourceType="tq"
      languageId={selectedMetadata.languageId}
      organization={selectedMetadata.organization}
      onStartNavigation={handleStartNavigation}
    />

    <h3 class="panel-header">
      Questions
      {#if selectedMetadata.organization !== 'unfoldingWord'}
        <span class="org-badge">from {selectedMetadata.organization}</span>
      {/if}
    </h3>

    <div class="questions-list">
      <div class="question-card">
        <div class="question-text">
          <strong>Q:</strong> No translation questions available for this verse.
        </div>
        <div class="answer-text">
          <strong>A:</strong> Current verse: <strong>{reference.bookId} {reference.chapter}:{reference.verse}</strong>
        </div>
        <div class="answer-text">
          Selected resource: <strong>{selectedMetadata.organization} • {selectedMetadata.languageId.toUpperCase()}</strong>
        </div>
      </div>
    </div>

    <div class="tip-section">
      <p class="tip-text">
        <span class="tip-icon">💡</span>
        <span class="tip-bold">Tip:</span> Try navigating to a different verse that may have more content, or select a different organization/language combination.
      </p>
    </div>

    <!-- Resource Metadata Card - Moved to bottom -->
    <ResourceMetadataCard
      organization={selectedMetadata.organization}
      title="Translation Questions"
      languageId={selectedMetadata.languageId}
      resourceType="tq"
    />
  </section>
<!-- Show navigation if no questions available and haven't tried loading yet -->
{:else if !hasQuestions}
  <section data-testid="translation-questions-panel" class="translation-questions-panel">
    <InlineHelpsNavigation
      resourceType="tq"
      currentReference={reference}
      onResourceSelect={onRcLinkClick}
      isResourceAvailable={hasQuestions}
      {forceNavigation}
      onNavigationComplete={handleNavigationComplete}
    />
  </section>
<!-- Show questions when available -->
{:else}
  <section data-testid="translation-questions-panel" class="translation-questions-panel">
    <!-- Breadcrumbs -->
    <HelpsBreadcrumbs
      resourceType="tq"
      languageId={finalLanguageId}
      organization={finalOrganization}
      onStartNavigation={handleStartNavigation}
    />

    <h3 class="panel-header">
      Questions
      {#if finalOrganization !== 'unfoldingWord'}
        <span class="org-badge">from {finalOrganization}</span>
      {/if}
    </h3>

    <div class="questions-list">
      {#each questions as qa (qa.id)}
        <div class="question-card">
          <div class="question-text">
            <strong>Q:</strong> {@html processMarkdownWithRcLinks(qa.question, handleRcLinkInContent)}
          </div>
          <div class="answer-text">
            <strong>A:</strong> {@html processMarkdownWithRcLinks(qa.answer, handleRcLinkInContent)}
          </div>
        </div>
      {/each}
    </div>

    <!-- Resource Metadata Card - Moved to bottom -->
    <ResourceMetadataCard
      organization={finalOrganization}
      title="Translation Questions"
      languageId={finalLanguageId}
      resourceType="tq"
    />
  </section>
{/if}

<style>
  .translation-questions-panel {
    padding: 1rem;
    background: var(--color-panel);
    border-radius: 8px;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .panel-header {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .org-badge {
    background: var(--color-secondary-alpha);
    color: var(--color-secondary);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .questions-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .question-card {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: all 0.2s ease;
  }

  .question-card:hover {
    border-color: var(--color-primary-alpha);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .question-text {
    color: var(--color-text);
    line-height: 1.6;
    padding: 0.5rem;
    background: var(--color-primary-alpha);
    border-radius: 4px;
    border-left: 3px solid var(--color-primary);
  }

  .question-text strong {
    color: var(--color-primary);
    font-weight: 600;
  }

  .answer-text {
    color: var(--color-text);
    line-height: 1.6;
    padding: 0.5rem;
    background: var(--color-success-alpha);
    border-radius: 4px;
    border-left: 3px solid var(--color-success);
  }

  .answer-text strong {
    color: var(--color-success);
    font-weight: 600;
  }

  .tip-section {
    background: var(--color-warning-alpha);
    border: 1px solid var(--color-warning);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .tip-text {
    margin: 0;
    color: var(--color-text);
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .tip-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .tip-bold {
    font-weight: 600;
    color: var(--color-warning);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .translation-questions-panel {
      padding: 0.5rem;
    }

    .panel-header {
      font-size: 1.1rem;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .org-badge {
      font-size: 0.75rem;
    }

    .question-card {
      padding: 0.75rem;
    }

    .question-text,
    .answer-text {
      padding: 0.4rem;
    }

    .tip-text {
      flex-direction: column;
      gap: 0.25rem;
    }
  }
</style>