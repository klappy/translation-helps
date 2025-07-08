<script>
  export let isVisible = false;
  export let text = "Loading...";
</script>

{#if isVisible}
  <div class="loading-overlay">
    <div class="loading-content">
      <div class="spinner"></div>
      <p>{text}</p>
    </div>
  </div>
{/if}

<slot />

<style>
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  [data-theme="dark"] .loading-overlay {
    background: rgba(0, 0, 0, 0.9);
  }

  .loading-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid var(--color-border);
    border-top: 2px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-content p {
    margin: 0;
    color: var(--color-text);
    font-size: 0.9rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>