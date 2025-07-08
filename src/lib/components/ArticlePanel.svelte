<script>
  export let reference;
  export let article = null;
</script>

<div class="article-panel">
  {#if article}
    <h2>{article.title || 'Article'}</h2>
    <div class="article-content">
      {#if article.content}
        {@html article.content}
      {:else}
        <p>Article content not available.</p>
      {/if}
    </div>
    {#if article.rcUri}
      <div class="article-meta">
        <small>RC URI: {article.rcUri}</small>
      </div>
    {/if}
  {:else}
    <div class="empty-state">
      <p>No article selected.</p>
    </div>
  {/if}
</div>

<style>
  .article-panel {
    padding: 1rem;
    background: var(--color-panel);
    border-radius: 8px;
    height: 100%;
    overflow-y: auto;
  }

  .article-panel h2 {
    margin: 0 0 1rem 0;
    color: var(--color-primary);
    font-size: 1.4rem;
  }

  .article-content {
    line-height: 1.6;
    color: var(--color-text);
    margin-bottom: 1rem;
  }

  .article-meta {
    border-top: 1px solid var(--color-border);
    padding-top: 1rem;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--color-text-secondary);
    font-style: italic;
  }
</style>