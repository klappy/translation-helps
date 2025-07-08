<script>
  import { onMount } from 'svelte';
  import { resourcesStore } from '$lib/stores/resources.js';
  import { referenceStore } from '$lib/stores/reference.js';
  import { processRcLinks } from '$lib/utils/rcLinkUtils.js';
  import RcLink from './shared/RcLink.svelte';
  import InlineHelpsNavigation from './InlineHelpsNavigation.svelte';
  import ResourceMetadataCard from './shared/ResourceMetadataCard.svelte';
  import HelpsBreadcrumbs from './shared/HelpsBreadcrumbs.svelte';

  export let reference;
  export let onWordClick = null;
  export let onRcLinkClick = null;

  let words = [];
  let links = [];
  let forceNavigation = null;
  let hasTriedLoading = false;
  let mixedResources = {};
  let organization = 'unfoldingWord';
  let languageId = 'en';

  // Subscribe to stores
  const unsubscribeResources = resourcesStore.subscribe((resources) => {
    words = resources.words || [];
    links = resources.links || [];
  });

  const unsubscribeReference = referenceStore.subscribe((refStore) => {
    mixedResources = refStore.mixedResources || {};
    organization = refStore.organization || 'unfoldingWord';
    languageId = refStore.languageId || 'en';
  });

  // Self-activate both words and links resource types
  onMount(() => {
    console.log('🎯 TranslationWordsPanel: Self-activating words and links resources');
    resourcesStore.activateResource('words');
    resourcesStore.activateResource('links');
    hasTriedLoading = true;
    
    return () => {
      unsubscribeResources();
      unsubscribeReference();
    };
  });

  $: hasWords = words && words.length > 0;

  // Get actual selected resource metadata (not hardcoded defaults)
  function getSelectedResourceMetadata() {
    // Check if user has selected a specific resource configuration
    const selectedResource = mixedResources?.words;
    
    return {
      organization: selectedResource?.organization || organization || 'unfoldingWord',
      languageId: selectedResource?.languageId || languageId || 'en'
    };
  }

  // Handle breadcrumb navigation
  function handleStartNavigation(step = 'language') {
    console.log(`Starting tW navigation at step: ${step}`);
    forceNavigation = step;
  }

  function handleNavigationComplete() {
    forceNavigation = null;
  }

  /**
   * Extracts a summary from article content (first sentence or paragraph)
   * @param {string} content - Article content
   * @returns {string} Summary text
   */
  function extractSummary(content) {
    if (!content) return "";

    // Find first definition section or paragraph
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines and headers
      if (!trimmed || trimmed.startsWith("#")) continue;

      // Return first meaningful sentence/paragraph
      if (trimmed.length > 20) {
        return trimmed.split(".")[0] + ".";
      }
    }

    return content.substring(0, 150) + (content.length > 150 ? "..." : "");
  }

  function handleWordClick(word) {
    // First try the provided callback
    if (onWordClick) {
      onWordClick(word);
      return;
    }

    // If no callback provided, and we have the rc link context, open as new tab
    if (onRcLinkClick && word.rcUri) {
      onRcLinkClick(word.rcUri, word.languageId, word.organization);
    }
  }

  function handleRcLinkInContent(rcUri) {
    if (onRcLinkClick) {
      const { organization: finalOrganization, languageId: finalLanguageId } = getSelectedResourceMetadata();
      onRcLinkClick(rcUri, finalLanguageId, finalOrganization);
    }
  }

  function handleRcLinkClick(rcUri, languageId, organization) {
    if (onRcLinkClick) {
      onRcLinkClick(rcUri, languageId, organization);
    }
  }

  // Get metadata from first word (all words have same metadata)
  $: wordMetadata = words[0] || {};
  $: selectedMetadata = getSelectedResourceMetadata();
  $: finalOrganization = selectedMetadata.organization || wordMetadata.organization || 'unfoldingWord';
  $: finalLanguageId = selectedMetadata.languageId || wordMetadata.languageId || 'en';

  // Debug logging
  $: console.log('🎯 TranslationWordsPanel: Rendering with', words.length, 'words and', links.length, 'links');
</script>

{#if !reference?.verse}
  <section data-testid="translation-words-panel" class="translation-words-panel">
    <p class="empty-state">Select a verse to view translation words.</p>
  </section>
<!-- Show navigation if forced navigation is active -->
{:else if forceNavigation}
  <section data-testid="translation-words-panel" class="translation-words-panel">
    <InlineHelpsNavigation
      resourceType="tw"
      currentReference={reference}
      onResourceSelect={onRcLinkClick}
      isResourceAvailable={hasWords}
      {forceNavigation}
      onNavigationComplete={handleNavigationComplete}
    />
    {#if links.length > 0}
      <details class="debug-info">
        <summary class="debug-summary">Debug Info</summary>
        <p>Found {links.length} TWL link(s) for this verse:</p>
        <ul class="debug-list">
          {#each links as link, index}
            <li class="debug-item">
              {typeof link === 'string' ? link : link.rcLink || 'Unknown link'}
            </li>
          {/each}
        </ul>
      </details>
    {/if}
  </section>
<!-- Show empty verse state if we've tried loading and have no words for this verse -->
{:else if hasTriedLoading && !hasWords && reference?.verse}
  <section data-testid="translation-words-panel" class="translation-words-panel">
    <!-- Breadcrumbs -->
    <HelpsBreadcrumbs
      resourceType="tw"
      languageId={selectedMetadata.languageId}
      organization={selectedMetadata.organization}
      onStartNavigation={handleStartNavigation}
    />

    <h3 class="panel-header">
      Words
      {#if selectedMetadata.organization !== 'unfoldingWord'}
        <span class="org-badge">from {selectedMetadata.organization}</span>
      {/if}
    </h3>

    <div class="words-list">
      <div class="word-card">
        <h4 class="word-title">
          No Translation Words
        </h4>
        <p class="word-summary">
          No translation words are linked to this verse.
        </p>
        <p class="rc-link">
          Current verse: <strong>{reference.bookId} {reference.chapter}:{reference.verse}</strong>
        </p>
        <p class="rc-link">
          Selected resource: <strong>{selectedMetadata.organization} • {selectedMetadata.languageId.toUpperCase()}</strong>
        </p>
      </div>

      <div class="tip-section">
        <p class="tip-text">
          <span class="tip-icon">💡</span>
          <span class="tip-bold">Tip:</span> Try navigating to a different verse that may have more content, or select a different organization/language combination.
        </p>
      </div>
    </div>

    {#if links.length > 0}
      <details class="debug-info">
        <summary class="debug-summary">Debug Info</summary>
        <p>Found {links.length} TWL link(s) but no articles loaded.</p>
        <ul class="debug-list">
          {#each links as link, index}
            <li class="debug-item">
              {typeof link === 'string' ? link : link.rcLink || 'Unknown link'}
            </li>
          {/each}
        </ul>
      </details>
    {/if}

    <!-- Resource Metadata Card - Moved to bottom -->
    <ResourceMetadataCard
      organization={selectedMetadata.organization}
      title="Translation Words"
      languageId={selectedMetadata.languageId}
      resourceType="tw"
    />
  </section>
<!-- Show navigation if no words available and haven't tried loading yet -->
{:else if !hasWords}
  <section data-testid="translation-words-panel" class="translation-words-panel">
    <InlineHelpsNavigation
      resourceType="tw"
      currentReference={reference}
      onResourceSelect={onRcLinkClick}
      isResourceAvailable={hasWords}
      {forceNavigation}
      onNavigationComplete={handleNavigationComplete}
    />
    {#if links.length > 0}
      <details class="debug-info">
        <summary class="debug-summary">Debug Info</summary>
        <p>Found {links.length} TWL link(s) for this verse:</p>
        <ul class="debug-list">
          {#each links as link, index}
            <li class="debug-item">
              {typeof link === 'string' ? link : link.rcLink || 'Unknown link'}
            </li>
          {/each}
        </ul>
      </details>
    {/if}
  </section>
<!-- Show words when available -->
{:else}
  <section data-testid="translation-words-panel" class="translation-words-panel">
    <!-- Breadcrumbs -->
    <HelpsBreadcrumbs
      resourceType="tw"
      languageId={finalLanguageId}
      organization={finalOrganization}
      onStartNavigation={handleStartNavigation}
    />

    <h3 class="panel-header">
      Words
      {#if finalOrganization !== 'unfoldingWord'}
        <span class="org-badge">from {finalOrganization}</span>
      {/if}
    </h3>

    <div class="words-list">
      {#each words as word, index}
        {@const isClickable = onWordClick || (onRcLinkClick && word.rcUri)}
        {@const summary = word.summary || extractSummary(word.content)}
        <div
          class="word-card {!isClickable ? 'non-clickable' : ''}"
          on:click={() => handleWordClick(word)}
          on:keydown={() => handleWordClick(word)}
        >
          <h4 class="word-title">
            {word.title || word.term}
            {#if isClickable}
              <span class="click-indicator">Click to view full article →</span>
            {/if}
          </h4>

          <p class="word-summary">
            {@html processRcLinks(summary, handleRcLinkInContent)}
          </p>

          <!-- Hidden full content for chat context extraction -->
          {#if word.content}
            <div class="visually-hidden" aria-hidden="true">
              {word.content}
            </div>
          {/if}

          {#if word.rcUri}
            <p
              class="rc-link"
              on:click|stopPropagation
              on:keydown|stopPropagation
            >
              <RcLink
                rcUri={word.rcUri}
                onRcLinkClick={(rcUri) => handleRcLinkClick(rcUri, finalLanguageId, finalOrganization)}
              >
                {word.rcUri}
              </RcLink>
            </p>
          {/if}
        </div>
      {/each}

      <div class="tip-section">
        <p class="tip-text">
          <span class="tip-icon">💡</span>
          <span class="tip-bold">Tip:</span> These words are linked to this verse
          through Translation Words Links (TWL).
          {#if onWordClick || onRcLinkClick}
            Click any word above to view the complete article.
          {/if}
        </p>
      </div>
    </div>

    <!-- Resource Metadata Card - Moved to bottom -->
    <ResourceMetadataCard
      organization={finalOrganization}
      title="Translation Words"
      languageId={finalLanguageId}
      resourceType="tw"
    />
  </section>
{/if}

<style>
  .translation-words-panel {
    padding: 1rem;
    background: var(--color-panel);
    border-radius: 8px;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .empty-state {
    text-align: center;
    color: var(--color-text-secondary);
    font-style: italic;
    padding: 2rem;
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

  .words-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .word-card {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .word-card:hover {
    border-color: var(--color-primary-alpha);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .word-card.non-clickable {
    cursor: default;
  }

  .word-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .click-indicator {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    font-weight: 400;
    font-style: italic;
  }

  .word-summary {
    color: var(--color-text);
    line-height: 1.6;
    margin: 0;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .rc-link {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    margin: 0;
    font-family: monospace;
  }

  .tip-section {
    background: var(--color-info-alpha);
    border: 1px solid var(--color-info);
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
    color: var(--color-info);
  }

  .debug-info {
    background: var(--color-warning-alpha);
    border: 1px solid var(--color-warning);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .debug-summary {
    cursor: pointer;
    font-weight: 600;
    color: var(--color-warning);
    margin-bottom: 0.5rem;
  }

  .debug-list {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }

  .debug-item {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    font-family: monospace;
    margin-bottom: 0.25rem;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .translation-words-panel {
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

    .word-card {
      padding: 0.75rem;
    }

    .word-title {
      font-size: 1rem;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .click-indicator {
      font-size: 0.75rem;
    }

    .tip-text {
      flex-direction: column;
      gap: 0.25rem;
    }
  }
</style>