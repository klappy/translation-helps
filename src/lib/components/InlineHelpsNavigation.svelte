<script>
  import { onMount } from 'svelte';

  export let resourceType;
  export let currentReference;
  export let onResourceSelect = null;
  export let isResourceAvailable = false;
  export let forceNavigation = null;
  export let onNavigationComplete = null;

  let isNavigating = false;
  let currentStep = 'language';
  let selectedLanguage = null;
  let availableResources = {};
  let loading = false;
  let error = null;

  // Resource type mapping
  const RESOURCE_TYPE_MAP = {
    tn: 'TSV Translation Notes',
    tq: 'TSV Translation Questions', 
    tw: 'Translation Words',
    twl: 'TSV Translation Words Links'
  };

  // Display names for UI
  const RESOURCE_DISPLAY_NAMES = {
    tn: 'Translation Notes',
    tq: 'Translation Questions',
    tw: 'Translation Words', 
    twl: 'Translation Word Links'
  };

  // Handle forced navigation from breadcrumbs
  $: {
    if (forceNavigation) {
      console.log(`Force navigation to step: ${forceNavigation}`);
      isNavigating = true;
      currentStep = forceNavigation;
      error = null;
    }
  }

  // Don't show navigation if resource is available
  $: showComponent = !isResourceAvailable || forceNavigation;

  function handleStartNavigation() {
    isNavigating = true;
    currentStep = 'language';
    error = null;
  }

  function handleCancel() {
    isNavigating = false;
    currentStep = 'language';
    selectedLanguage = null;
    availableResources = {};
    error = null;
    
    // Notify parent that navigation is complete
    if (onNavigationComplete) {
      onNavigationComplete();
    }
  }

  function handleLanguageSelect(language) {
    console.log('🌐 InlineHelpsNavigation: Language selected:', language);
    selectedLanguage = language;
    currentStep = 'organization';
    // TODO: Load available resources
  }

  function handleResourceSelect(resource) {
    console.log('📚 InlineHelpsNavigation: Resource selected:', resource);
    
    // Generate RC link
    const rcLink = `rc://${selectedLanguage}/${resourceType}/help/${currentReference.bookId}/${currentReference.chapter}/${currentReference.verse}`;
    
    // Call the parent's RC link handler
    if (onResourceSelect) {
      onResourceSelect(rcLink, selectedLanguage, resource.organization);
    }
    
    // Close navigation
    handleCancel();
  }

  function handleBack() {
    if (currentStep === 'organization') {
      currentStep = 'language';
      selectedLanguage = null;
      availableResources = {};
    }
  }
</script>

{#if showComponent}
  <div class="navigation-container">
    {#if !isNavigating}
      <!-- Collapsed state - show "not available" message with action button -->
      <div class="no-resource-message">
        <div class="message-card">
          <div class="message-icon">
            {resourceType === 'tn' ? '📝' : resourceType === 'tq' ? '❓' : resourceType === 'tw' ? '📚' : '🔗'}
          </div>
          <div class="message-content">
            <p class="message-title">
              {RESOURCE_DISPLAY_NAMES[resourceType]} not available
            </p>
            <p class="message-subtitle">
              in current language/organization selection
            </p>
          </div>
          <button 
            on:click={handleStartNavigation}
            class="find-button"
          >
            Find Alternative
          </button>
        </div>
      </div>
    {:else}
      <!-- Navigation active - show selection interface -->
      <div class="navigation-panel">
        <div class="selection-container">
          {#if currentStep === 'language'}
            <div class="language-step">
              <h3>Select Language</h3>
              <div class="language-grid">
                <button on:click={() => handleLanguageSelect('en')} class="language-option">
                  🇺🇸 English
                </button>
                <button on:click={() => handleLanguageSelect('es')} class="language-option">
                  🇪🇸 Spanish
                </button>
                <button on:click={() => handleLanguageSelect('fr')} class="language-option">
                  🇫🇷 French
                </button>
              </div>
              <button on:click={handleCancel} class="cancel-button">
                Cancel
              </button>
            </div>
          {:else if currentStep === 'organization'}
            <div class="organization-step">
              <h3>Select {RESOURCE_DISPLAY_NAMES[resourceType]}</h3>
              <p>Language: {selectedLanguage}</p>
              
              <div class="org-grid">
                <button 
                  on:click={() => handleResourceSelect({ organization: 'unfoldingWord' })}
                  class="org-option"
                >
                  unfoldingWord
                </button>
                <button 
                  on:click={() => handleResourceSelect({ organization: 'Door43' })}
                  class="org-option"
                >
                  Door43
                </button>
              </div>
              
              <div class="nav-buttons">
                <button on:click={handleBack} class="back-button">
                  ← Back
                </button>
                <button on:click={handleCancel} class="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .navigation-container {
    background: var(--color-panel);
    border-radius: 8px;
    overflow: hidden;
  }

  .no-resource-message {
    padding: 1rem;
  }

  .message-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-warning-alpha);
    border: 1px solid var(--color-warning);
    border-radius: 8px;
  }

  .message-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .message-content {
    flex: 1;
  }

  .message-title {
    margin: 0 0 0.25rem 0;
    font-weight: 600;
    color: var(--color-text);
  }

  .message-subtitle {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
  }

  .find-button {
    background: var(--color-primary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s ease;
  }

  .find-button:hover {
    background: var(--color-primary-hover);
  }

  .navigation-panel {
    padding: 1rem;
    background: var(--color-background);
  }

  .selection-container {
    background: var(--color-panel);
    border-radius: 8px;
    padding: 1.5rem;
  }

  .language-step h3,
  .organization-step h3 {
    margin: 0 0 1rem 0;
    color: var(--color-text);
  }

  .language-grid,
  .org-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .language-option,
  .org-option {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    padding: 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .language-option:hover,
  .org-option:hover {
    border-color: var(--color-primary);
    background: var(--color-hover);
  }

  .nav-buttons {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .back-button,
  .cancel-button {
    background: var(--color-secondary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .back-button:hover,
  .cancel-button:hover {
    background: var(--color-secondary-hover);
  }

  .cancel-button {
    background: var(--color-error);
  }

  .cancel-button:hover {
    background: var(--color-error-hover);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .message-card {
      flex-direction: column;
      text-align: center;
      gap: 0.75rem;
    }

    .language-grid,
    .org-grid {
      grid-template-columns: 1fr;
    }

    .nav-buttons {
      flex-direction: column;
    }
  }
</style>