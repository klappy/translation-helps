<script>
  export let organization;
  export let title;
  export let languageId;
  export let resourceType;

  const resourceIcons = {
    tn: '📝',
    tq: '❓',
    tw: '📚',
    twl: '🔗',
    fia: '🎨'
  };

  $: icon = resourceIcons[resourceType] || '📄';
</script>

<div class="metadata-card">
  <div class="metadata-header">
    <span class="metadata-icon">{icon}</span>
    <h4 class="metadata-title">{title}</h4>
  </div>
  
  <div class="metadata-content">
    <div class="metadata-row">
      <span class="metadata-label">Organization:</span>
      <span class="metadata-value">{organization}</span>
    </div>
    
    <div class="metadata-row">
      <span class="metadata-label">Language:</span>
      <span class="metadata-value">{languageId?.toUpperCase()}</span>
    </div>
    
    <div class="metadata-row">
      <span class="metadata-label">Type:</span>
      <span class="metadata-value">{resourceType?.toUpperCase()}</span>
    </div>
  </div>
</div>

<style>
  .metadata-card {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .metadata-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .metadata-icon {
    font-size: 1.2rem;
  }

  .metadata-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .metadata-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .metadata-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
  }

  .metadata-label {
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .metadata-value {
    color: var(--color-text);
    font-weight: 600;
    font-family: monospace;
    background: var(--color-panel);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    border: 1px solid var(--color-border);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .metadata-card {
      padding: 0.75rem;
    }

    .metadata-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .metadata-value {
      align-self: stretch;
      text-align: center;
    }
  }
</style>