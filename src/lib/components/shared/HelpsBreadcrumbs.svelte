<script>
  export let resourceType;
  export let languageId;
  export let organization;
  export let onStartNavigation = null;

  const resourceDisplayNames = {
    tn: 'Translation Notes',
    tq: 'Translation Questions',
    tw: 'Translation Words',
    twl: 'Translation Word Links',
    fia: 'FIA Resources'
  };

  function handleNavigate(step) {
    if (onStartNavigation) {
      onStartNavigation(step);
    }
  }
</script>

<nav class="breadcrumbs">
  <div class="breadcrumb-item">
    <span class="breadcrumb-text">{resourceDisplayNames[resourceType] || 'Resource'}</span>
  </div>
  
  <div class="breadcrumb-separator">›</div>
  
  <button 
    class="breadcrumb-item breadcrumb-button"
    on:click={() => handleNavigate('language')}
    title="Change language"
  >
    <span class="breadcrumb-text">{languageId?.toUpperCase() || 'Language'}</span>
  </button>
  
  <div class="breadcrumb-separator">›</div>
  
  <button 
    class="breadcrumb-item breadcrumb-button"
    on:click={() => handleNavigate('organization')}
    title="Change organization"
  >
    <span class="breadcrumb-text">{organization || 'Organization'}</span>
  </button>
</nav>

<style>
  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: var(--color-background);
    border-radius: 6px;
    border: 1px solid var(--color-border);
    font-size: 0.9rem;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;
    min-height: 1.5rem;
  }

  .breadcrumb-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background 0.2s ease;
    color: var(--color-primary);
    text-decoration: underline;
  }

  .breadcrumb-button:hover {
    background: var(--color-hover);
    color: var(--color-primary-hover);
  }

  .breadcrumb-text {
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .breadcrumb-button .breadcrumb-text {
    color: inherit;
  }

  .breadcrumb-separator {
    color: var(--color-text-secondary);
    font-weight: bold;
    opacity: 0.6;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .breadcrumbs {
      font-size: 0.8rem;
      gap: 0.25rem;
    }
    
    .breadcrumb-button {
      padding: 0.2rem 0.4rem;
    }
  }
</style>