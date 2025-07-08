<script>
  export let size = 'medium'; // small, medium, large
  export let variant = 'default'; // default, white
</script>

<div class="loading-spinner {size} {variant}"></div>

<style>
  .loading-spinner {
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-spinner.small {
    width: 1rem;
    height: 1rem;
    border: 2px solid transparent;
    border-top: 2px solid var(--color-primary);
  }

  .loading-spinner.medium {
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid var(--color-border);
    border-top: 2px solid var(--color-primary);
  }

  .loading-spinner.large {
    width: 2rem;
    height: 2rem;
    border: 3px solid var(--color-border);
    border-top: 3px solid var(--color-primary);
  }

  .loading-spinner.white {
    border-color: rgba(255, 255, 255, 0.3);
    border-top-color: white;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>