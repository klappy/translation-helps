<script>
  import { onMount } from 'svelte';

  export let item;
  export let type;
  export let fiaData;

  let imageError = false;
  let showDetails = false;

  // Use the resolveMediaUrl function from fiaData which has the correct repository URLs
  $: mediaUrl = fiaData?.resolveMediaUrl ? fiaData.resolveMediaUrl(item.HREF, type) : null;

  function toggleDetails() {
    showDetails = !showDetails;
  }

  function handleImageError() {
    imageError = true;
  }
</script>

<div class="fia-item">
  <div class="item-header">
    <span class="reference">{item.REF}</span>
    <button 
      class="toggle-button"
      on:click={toggleDetails}
      title="Show details"
    >
      {showDetails ? '▼' : '▶'}
    </button>
  </div>

  <!-- Media display with fallback -->
  <div class="media-container">
    {#if !imageError && mediaUrl}
      <img
        src={mediaUrl}
        alt="FIA {type} for {item.REF}"
        class="media-image"
        loading="lazy"
        on:error={handleImageError}
      />
    {:else}
      <div class="media-fallback">
        <span class="fallback-icon">
          {type === 'images' ? '🖼️' : '🗺️'}
        </span>
        <p>Media not available</p>
        <small>{item.HREF}</small>
        {#if mediaUrl}
          <small>URL: {mediaUrl}</small>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Expandable details -->
  {#if showDetails}
    <div class="item-details">
      <div class="detail-row">
        <strong>ID:</strong> {item.ID || 'N/A'}
      </div>
      <div class="detail-row">
        <strong>Path:</strong> {item.HREF || 'N/A'}
      </div>
      <div class="detail-row">
        <strong>Resolved URL:</strong> {mediaUrl || 'N/A'}
      </div>
      {#if item.TAGS}
        <div class="detail-row">
          <strong>Tags:</strong> {item.TAGS}
        </div>
      {/if}
      {#if item.SUPPORT}
        <div class="detail-row">
          <strong>Support:</strong> {item.SUPPORT}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
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

  .toggle-button {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .toggle-button:hover {
    background: var(--color-hover);
    color: var(--color-text);
  }

  .media-container {
    position: relative;
    aspect-ratio: 16/9;
    background: var(--color-background);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .media-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease;
  }

  .media-image:hover {
    transform: scale(1.02);
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

  .item-details {
    padding: 0.75rem;
    background: var(--color-panel);
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-row {
    display: flex;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .detail-row strong {
    color: var(--color-text);
    min-width: 80px;
  }

  .detail-row {
    color: var(--color-text-secondary);
    word-break: break-all;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .item-header {
      padding: 0.5rem;
    }

    .reference {
      font-size: 0.8rem;
    }

    .toggle-button {
      font-size: 0.8rem;
    }

    .media-fallback {
      padding: 0.75rem;
    }

    .item-details {
      padding: 0.5rem;
    }

    .detail-row {
      font-size: 0.8rem;
    }
  }
</style>