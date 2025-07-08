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

  let notes = [];
  let forceNavigation = null;
  let hasTriedLoading = false;
  let mixedResources = {};
  let organization = 'unfoldingWord';
  let languageId = 'en';

  // Subscribe to stores
  const unsubscribeResources = resourcesStore.subscribe((resources) => {
    notes = resources.notes || [];
  });

  const unsubscribeReference = referenceStore.subscribe((refStore) => {
    mixedResources = refStore.mixedResources || {};
    organization = refStore.organization || 'unfoldingWord';
    languageId = refStore.languageId || 'en';
  });

  // Self-activate this resource type (only once on mount)
  onMount(() => {
    resourcesStore.activateResource('notes');
    hasTriedLoading = true;
    
    return () => {
      unsubscribeResources();
      unsubscribeReference();
    };
  });

  $: hasNotes = notes && notes.length > 0;

  // Get actual selected resource metadata (not hardcoded defaults)
  function getSelectedResourceMetadata() {
    // Check if user has selected a specific resource configuration
    const selectedResource = mixedResources?.notes;
    
    return {
      organization: selectedResource?.organization || organization || 'unfoldingWord',
      languageId: selectedResource?.languageId || languageId || 'en'
    };
  }

  // Handle breadcrumb navigation
  function handleStartNavigation(step = 'language') {
    console.log(`Starting tN navigation at step: ${step}`);
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

  function toggleCollapsibleNote(event) {
    event.stopPropagation();
    event.currentTarget.classList.toggle('expanded');
  }

  // Get metadata from first note (all notes have same metadata)
  $: noteMetadata = notes[0] || {};
  $: selectedMetadata = getSelectedResourceMetadata();
  $: finalOrganization = selectedMetadata.organization || noteMetadata.organization || 'unfoldingWord';
  $: finalLanguageId = selectedMetadata.languageId || noteMetadata.languageId || 'en';
</script>

<!-- Show navigation if forced navigation is active -->
{#if forceNavigation}
  <section data-testid="translation-notes-panel" class="translation-notes-panel">
    <InlineHelpsNavigation
      resourceType="tn"
      currentReference={reference}
      onResourceSelect={onRcLinkClick}
      isResourceAvailable={hasNotes}
      {forceNavigation}
      onNavigationComplete={handleNavigationComplete}
    />
  </section>
<!-- Show empty verse state if we've tried loading and have no notes for this verse -->
{:else if hasTriedLoading && !hasNotes && reference?.verse}
  <section data-testid="translation-notes-panel" class="translation-notes-panel">
    <!-- Breadcrumbs -->
    <HelpsBreadcrumbs
      resourceType="tn"
      languageId={selectedMetadata.languageId}
      organization={selectedMetadata.organization}
      onStartNavigation={handleStartNavigation}
    />

    <h3 class="panel-header">
      Notes
      {#if selectedMetadata.organization !== 'unfoldingWord'}
        <span class="org-badge">from {selectedMetadata.organization}</span>
      {/if}
    </h3>

    <ul class="notes-list">
      <li class="note-card">
        <div class="note-text">
          No translation notes available for this verse.
        </div>
        <div class="note-tags">
          Current verse: <strong>{reference.bookId} {reference.chapter}:{reference.verse}</strong>
        </div>
        <div class="note-tags">
          Selected resource: <strong>{selectedMetadata.organization} • {selectedMetadata.languageId.toUpperCase()}</strong>
        </div>
      </li>
    </ul>

    <div class="tip-section">
      <p class="tip-text">
        <span class="tip-icon">💡</span>
        <span class="tip-bold">Tip:</span> Try navigating to a different verse that may have more content, or select a different organization/language combination.
      </p>
    </div>

    <!-- Resource Metadata Card - Moved to bottom -->
    <ResourceMetadataCard
      organization={selectedMetadata.organization}
      title="Translation Notes"
      languageId={selectedMetadata.languageId}
      resourceType="tn"
    />
  </section>
<!-- Show navigation if no notes available and haven't tried loading yet -->
{:else if !hasNotes}
  <section data-testid="translation-notes-panel" class="translation-notes-panel">
    <InlineHelpsNavigation
      resourceType="tn"
      currentReference={reference}
      onResourceSelect={onRcLinkClick}
      isResourceAvailable={hasNotes}
      {forceNavigation}
      onNavigationComplete={handleNavigationComplete}
    />
  </section>
<!-- Show notes when available -->
{:else}
  <section data-testid="translation-notes-panel" class="translation-notes-panel">
    <!-- Breadcrumbs -->
    <HelpsBreadcrumbs
      resourceType="tn"
      languageId={finalLanguageId}
      organization={finalOrganization}
      onStartNavigation={handleStartNavigation}
    />

    <h3 class="panel-header">
      Notes
      {#if finalOrganization !== 'unfoldingWord'}
        <span class="org-badge">from {finalOrganization}</span>
      {/if}
    </h3>

    <ul class="notes-list">
      {#each notes as note (note.id)}
        <li class="note-card">
          {#if note.quote}
            <div class="note-quote">
              "{note.quote}"
              {#if note.occurrence && note.occurrence !== "1"}
                <span class="note-occurrence"> (occurrence {note.occurrence})</span>
              {/if}
            </div>
          {/if}
          
          {#if (note.text || "").split(/\r\n|\r|\n/).length <= 10}
            <div class="note-text">
              {@html processMarkdownWithRcLinks(note.text, handleRcLinkInContent)}
            </div>
          {:else}
            <div
              class="note-text collapsible-note"
              on:click={toggleCollapsibleNote}
              on:keydown={toggleCollapsibleNote}
              title="Click to expand/collapse"
            >
              {@html processMarkdownWithRcLinks(note.text, handleRcLinkInContent)}
            </div>
          {/if}
          
          {#if note.tags}
            <div class="note-tags">Tags: {note.tags}</div>
          {/if}
          
          {#if note.supportReference}
            <div class="note-support-reference">
              See also: {@html processMarkdownWithRcLinks(note.supportReference, handleRcLinkInContent)}
            </div>
          {/if}
        </li>
      {/each}
    </ul>

    <!-- Resource Metadata Card - Moved to bottom -->
    <ResourceMetadataCard
      organization={finalOrganization}
      title="Translation Notes"
      languageId={finalLanguageId}
      resourceType="tn"
    />
  </section>
{/if}

<style>
  .translation-notes-panel {
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

  .notes-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .note-card {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: all 0.2s ease;
  }

  .note-card:hover {
    border-color: var(--color-primary-alpha);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .note-quote {
    font-style: italic;
    color: var(--color-primary);
    font-weight: 500;
    padding: 0.5rem;
    background: var(--color-primary-alpha);
    border-radius: 4px;
    border-left: 3px solid var(--color-primary);
  }

  .note-occurrence {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }

  .note-text {
    line-height: 1.6;
    color: var(--color-text);
  }

  .collapsible-note {
    max-height: 150px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    transition: max-height 0.3s ease;
  }

  .collapsible-note:not(.expanded):after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    background: linear-gradient(transparent, var(--color-background));
    pointer-events: none;
  }

  .collapsible-note.expanded {
    max-height: none;
  }

  .collapsible-note:hover {
    background: var(--color-hover);
  }

  .note-tags {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    font-style: italic;
  }

  .note-support-reference {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    border-top: 1px solid var(--color-border);
    padding-top: 0.5rem;
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
    .translation-notes-panel {
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

    .note-card {
      padding: 0.75rem;
    }

    .collapsible-note {
      max-height: 120px;
    }

    .tip-text {
      flex-direction: column;
      gap: 0.25rem;
    }
  }
</style>