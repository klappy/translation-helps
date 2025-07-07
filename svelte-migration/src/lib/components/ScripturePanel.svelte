<script>
  import { scripture, loadingResources } from '$lib/stores/resources.js';
  
  export let reference;
  export let handleVerseClick;
  
  $: isLoading = $loadingResources.has('scripture');
  
  // Mock scripture data for demo
  $: mockScripture = `
    <div class="verse" data-verse="1">
      <span class="verse-number">1</span>
      In the beginning, God created the heavens and the earth.
    </div>
    <div class="verse" data-verse="2">
      <span class="verse-number">2</span>
      The earth was without form and void, and darkness was over the face of the deep.
    </div>
    <div class="verse" data-verse="3">
      <span class="verse-number">3</span>
      And God said, "Let there be light," and there was light.
    </div>
  `;
  
  function handleVerseClickLocal(event) {
    const verseElement = event.target.closest('.verse');
    if (verseElement) {
      const verseNumber = verseElement.dataset.verse;
      handleVerseClick(parseInt(verseNumber));
    }
  }
</script>

<div class="scripture-panel">
  <div class="scripture-header">
    <h2 class="scripture-title">
      {reference.bookId} {reference.chapter}:{reference.verse}
    </h2>
    {#if isLoading}
      <div class="loading-indicator">
        <div class="loading-spinner"></div>
      </div>
    {/if}
  </div>
  
  <div class="scripture-content">
    {#if isLoading}
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading scripture...</p>
      </div>
    {:else if $scripture}
      <div class="scripture-text" on:click={handleVerseClickLocal}>
        {@html $scripture}
      </div>
    {:else}
      <div class="scripture-text" on:click={handleVerseClickLocal}>
        {@html mockScripture}
      </div>
    {/if}
  </div>
</div>

<style>
  .scripture-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .scripture-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-4);
    background-color: var(--color-surface-secondary);
    border-bottom: 1px solid var(--color-border);
  }

  .scripture-title {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
    font-family: var(--font-family-heading);
  }

  .loading-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
  }

  .scripture-content {
    flex: 1;
    padding: var(--spacing-4);
    overflow-y: auto;
    background-color: var(--color-surface);
  }

  .scripture-text {
    line-height: var(--line-height-relaxed);
    font-size: var(--font-size-md);
    color: var(--color-text);
  }

  .scripture-text :global(.verse) {
    margin-bottom: var(--spacing-3);
    padding: var(--spacing-2);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-height: var(--verse-min-height);
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-2);
  }

  .scripture-text :global(.verse:hover) {
    background-color: var(--color-verse-background-hover);
  }

  .scripture-text :global(.verse-number) {
    font-weight: var(--font-weight-bold);
    color: var(--color-verse-number);
    font-size: var(--font-size-sm);
    min-width: 20px;
    text-align: right;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-4);
    height: 200px;
    color: var(--color-text-secondary);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .scripture-header {
      padding: var(--spacing-3);
    }

    .scripture-title {
      font-size: var(--font-size-lg);
    }

    .scripture-content {
      padding: var(--spacing-3);
    }

    .scripture-text {
      font-size: var(--font-size-md);
    }
  }
</style>