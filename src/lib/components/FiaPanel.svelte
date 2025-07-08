<script>
  import { onMount } from 'svelte';
  import { resourcesStore } from '$lib/stores/resources.js';
  import ResourceMetadataCard from './shared/ResourceMetadataCard.svelte';
  import HelpsBreadcrumbs from './shared/HelpsBreadcrumbs.svelte';
  import FiaItem from './FiaItem.svelte';

  export let reference;

  let fiaData = null;
  let hasTriedLoading = false;

  // Subscribe to stores
  const unsubscribeResources = resourcesStore.subscribe((resources) => {
    fiaData = resources.fia;
  });

  // Self-activate FIA resources (following existing panel patterns)
  onMount(() => {
    resourcesStore.activateResource('fia');
    hasTriedLoading = true;
    
    return () => {
      unsubscribeResources();
    };
  });

  $: hasFiaContent = fiaData && fiaData.hasContent && 
    ((fiaData.images && fiaData.images.length > 0) || (fiaData.maps && fiaData.maps.length > 0));
</script>

<!-- Show empty state with consistent styling -->
{#if hasTriedLoading && !hasFiaContent && reference?.verse}
  <section data-testid="fia-panel" class="fia-panel">
    <!-- Breadcrumbs -->
    <HelpsBreadcrumbs
      resourceType="fia"
      languageId="en"
      organization="BurritoTruck"
      onStartNavigation={() => {}}
    />

    <h3 class="panel-header">
      FIA
      <span class="org-badge">from BurritoTruck</span>
    </h3>

    <div class="items-grid">
      <div class="fia-item">
        <div class="item-header">
          <span class="reference">No FIA Resources</span>
        </div>
        <div class="media-container">
          <div class="media-fallback">
            <span class="fallback-icon">🗺️</span>
            <p>No FIA images or maps available for this verse.</p>
            <small>Current verse: <strong>{reference.bookId} {reference.chapter}:{reference.verse}</strong></small>
          </div>
        </div>
      </div>
    </div>

    <div class="tip-section">
      <p class="tip-text">
        <span class="tip-icon">💡</span>
        <span class="tip-bold">Tip:</span> Try navigating to a different verse that may have more content.
      </p>
    </div>

    <!-- Resource Metadata Card - Moved to bottom -->
    <ResourceMetadataCard
      organization="BurritoTruck"
      title="FIA Resources"
      languageId="en"
      resourceType="fia"
    />
  </section>
<!-- Show loading state if not tried loading yet -->
{:else if !hasFiaContent}
  <div class="fia-panel">
    <div class="empty-state">
      <p>Loading FIA content...</p>
    </div>
  </div>
<!-- Show FIA content when available -->
{:else}
  <div class="fia-panel">
    <div class="header">
      <h3>FIA Resources</h3>
      <p class="subtitle">Visual context for Bible study</p>
    </div>

    {#if fiaData.images && fiaData.images.length > 0}
      <div class="section">
        <h4 class="section-title">
          📸 Images ({fiaData.images.length})
        </h4>
        <div class="items-grid">
          {#each fiaData.images as item, index}
            <FiaItem 
              {item}
              type="images"
              {fiaData}
            />
          {/each}
        </div>
      </div>
    {/if}

    {#if fiaData.maps && fiaData.maps.length > 0}
      <div class="section">
        <h4 class="section-title">
          🗺️ Maps ({fiaData.maps.length})
        </h4>
        <div class="items-grid">
          {#each fiaData.maps as item, index}
            <FiaItem 
              {item}
              type="maps"
              {fiaData}
            />
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .fia-panel {
    padding: 1rem;
    background: var(--color-panel);
    border-radius: 8px;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 1rem;
  }

  .header h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .subtitle {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
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

  .section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .fia-item {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .fia-item:hover {
    border-color: var(--color-primary-alpha);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: var(--color-header);
    border-bottom: 1px solid var(--color-border);
  }

  .reference {
    font-weight: 600;
    color: var(--color-primary);
    font-size: 0.9rem;
  }

  .media-container {
    position: relative;
    aspect-ratio: 16/9;
    background: var(--color-background);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .media-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-text-secondary);
    text-align: center;
    padding: 1rem;
  }

  .fallback-icon {
    font-size: 2rem;
    opacity: 0.6;
  }

  .media-fallback p {
    margin: 0;
    font-size: 0.9rem;
  }

  .media-fallback small {
    font-size: 0.8rem;
    opacity: 0.8;
    word-break: break-all;
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

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--color-text-secondary);
    font-style: italic;
  }

  .empty-state p {
    margin: 0;
    font-size: 1.1rem;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .fia-panel {
      padding: 0.5rem;
    }

    .items-grid {
      grid-template-columns: 1fr;
    }

    .header h3 {
      font-size: 1.2rem;
    }

    .section-title {
      font-size: 1rem;
    }

    .panel-header {
      font-size: 1.1rem;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .tip-text {
      flex-direction: column;
      gap: 0.25rem;
    }
  }
</style>