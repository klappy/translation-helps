<script>
  import { onMount } from 'svelte';
  import { resourcesStore } from '$lib/stores/resources.js';
  import InlineHelpsNavigation from './InlineHelpsNavigation.svelte';
  import ResourceMetadataCard from './shared/ResourceMetadataCard.svelte';
  import HelpsBreadcrumbs from './shared/HelpsBreadcrumbs.svelte';

  export let reference;
  export let onRcLinkClick = null;

  let links = [];
  let forceNavigation = null;

  // Subscribe to stores
  const unsubscribeResources = resourcesStore.subscribe((resources) => {
    links = resources.links || [];
  });

  // Self-activate this resource type
  onMount(() => {
    console.log('🎯 TWLPanel: Self-activating links resource');
    resourcesStore.activateResource('links');
    
    return () => {
      unsubscribeResources();
    };
  });

  $: hasLinks = links && links.length > 0;

  // Handle breadcrumb navigation
  function handleStartNavigation(step = 'language') {
    console.log(`Starting TWL navigation at step: ${step}`);
    forceNavigation = step;
  }

  function handleNavigationComplete() {
    forceNavigation = null;
  }

  function handleLinkClick(rcLink, languageId, organization) {
    if (onRcLinkClick) {
      onRcLinkClick(rcLink, languageId, organization);
    }
  }

  // Get metadata from first link (all links have same metadata)
  $: linkMetadata = links[0] || {};
  $: organization = linkMetadata.organization || 'unfoldingWord';
  $: languageId = linkMetadata.languageId || 'en';

  // Debug logging
  $: console.log('🎯 TWLPanel: Rendering with', links.length, 'links');
</script>

{#if !reference?.bookId}
  <div class="twl-panel" data-testid="twl-panel">
    <p>Please select a verse to view Translation Word Links.</p>
  </div>
<!-- Show navigation if no links available or forced navigation -->
{:else if !hasLinks || forceNavigation}
  <section data-testid="twl-panel" class="twl-panel">
    <InlineHelpsNavigation
      resourceType="twl"
      currentReference={reference}
      onResourceSelect={onRcLinkClick}
      isResourceAvailable={hasLinks}
      {forceNavigation}
      onNavigationComplete={handleNavigationComplete}
    />
  </section>
<!-- Show links when available -->
{:else}
  <section data-testid="twl-panel" class="twl-panel">
    <!-- Breadcrumbs -->
    <HelpsBreadcrumbs
      resourceType="twl"
      {languageId}
      {organization}
      onStartNavigation={handleStartNavigation}
    />

    <!-- Always render InlineHelpsNavigation for breadcrumb functionality -->
    <InlineHelpsNavigation
      resourceType="twl"
      currentReference={reference}
      onResourceSelect={onRcLinkClick}
      isResourceAvailable={hasLinks}
      {forceNavigation}
      onNavigationComplete={handleNavigationComplete}
    />

    <h3>Translation Word Links</h3>
    <div class="twl-content">
      {#each links as item, index}
        {@const linkData = typeof item === 'string' ? { rcLink: item, id: index } : item}
        {@const rcLink = linkData.rcLink || linkData}
        <div class="twl-item">
          <h4 class="twl-title">
            {linkData.word || 'Translation Word'}
            {#if linkData.occurrence && linkData.occurrence !== '1'}
              <span class="occurrence"> (occurrence {linkData.occurrence})</span>
            {/if}
          </h4>
          <div class="twl-link">
            {#if rcLink}
              <button 
                on:click={() => handleLinkClick(rcLink, languageId, organization)}
                class="link-button"
              >
                View Translation Word Article →
              </button>
            {/if}
            <div class="link-text">
              {rcLink}
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Resource Metadata Card - Moved to bottom -->
    <ResourceMetadataCard
      {organization}
      title="Translation Word Links"
      {languageId}
      resourceType="twl"
    />
  </section>
{/if}

<style>
  .twl-panel {
    padding: 1rem;
    background: var(--color-panel);
    border-radius: 8px;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .twl-panel h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text);
  }

  .twl-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .twl-item {
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-background);
    transition: all 0.2s ease;
  }

  .twl-item:hover {
    border-color: var(--color-primary-alpha);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .twl-title {
    margin: 0 0 0.5rem 0;
    color: var(--color-primary);
    font-size: 1.1rem;
    font-weight: 600;
  }

  .occurrence {
    font-size: 0.8em;
    color: var(--color-text-secondary);
    font-weight: 400;
  }

  .twl-link {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .link-button {
    background: none;
    border: none;
    color: var(--color-primary);
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    font: inherit;
    text-align: left;
    transition: color 0.2s ease;
  }

  .link-button:hover {
    color: var(--color-primary-hover);
  }

  .link-text {
    font-size: 0.9em;
    color: var(--color-text-secondary);
    font-family: monospace;
  }

  /* Empty state styling */
  .twl-panel p {
    text-align: center;
    color: var(--color-text-secondary);
    font-style: italic;
    padding: 2rem;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .twl-panel {
      padding: 0.5rem;
    }

    .twl-item {
      padding: 0.5rem;
    }

    .twl-title {
      font-size: 1rem;
    }
  }
</style>