<script>
  import { reference, organization, languageId, updateContext } from '$stores/reference.js';
  import { activateResource } from '$stores/resources.js';
  import ScripturePanel from './ScripturePanel.svelte';
  import HelpsTabs from './HelpsTabs.svelte';
  import NavigationBar from './NavigationBar.svelte';
  
  let activeHelpsTab = "tn";
  let activeMobileTab = "scripture";
  let helpsTabsRef;

  function handleVerseClick(verseNum) {
    // Verse clicks are now pure CSS highlighting operations
    console.log("Verse clicked:", verseNum, "(highlighting handled locally)");
  }

  // Handle rc:// link clicks to open article tabs or switch to appropriate internal tabs
  async function handleRcLinkClick(rcUri, contextLanguageId, contextOrganization) {
    if (!rcUri || !rcUri.startsWith("rc://")) {
      console.warn("Invalid rc:// URI:", rcUri);
      return;
    }

    // Use provided context or fall back to default context
    const effectiveLanguageId = contextLanguageId || $languageId || "en";
    const effectiveOrganization = contextOrganization || $organization || "unfoldingWord";

    // Parse the rc:// URI to determine the appropriate tab
    const uriParts = rcUri.split("/");
    if (uriParts.length < 4) {
      console.warn("Malformed rc:// URI:", rcUri);
      return;
    }

    const rcLanguageId = uriParts[2]; // Language from RC link
    const resourceType = uriParts[3]; // tw, tn, tq, etc.
    const rcPath = uriParts[4]; // help, kt, etc.

    // Check if this is a resource selection RC link (has /help/ path)
    const isResourceSelection = rcPath === 'help' && uriParts.length >= 7;
    
    if (isResourceSelection) {
      console.log('🔗 Handling resource selection RC link:', rcUri);
      
      // Map external resource IDs to internal resource types
      const resourceTypeMap = {
        'tn': 'notes',
        'tq': 'questions', 
        'tw': 'words',
        'twl': 'links',
        'ta': 'ta'
      };
      
      const internalResourceType = resourceTypeMap[resourceType] || resourceType;
      
      console.log('📍 Setting mixed resource:', {
        externalType: resourceType,
        internalType: internalResourceType,
        languageId: rcLanguageId,
        organization: effectiveOrganization
      });
      
      // Update mixed resources configuration
      updateContext({
        mixedResources: {
          [internalResourceType]: {
            languageId: rcLanguageId,
            organization: effectiveOrganization,
            resourceId: resourceType
          }
        }
      });
      
      // Trigger resource reload with new configuration
      activateResource(internalResourceType);
      console.log(`Resource ${internalResourceType} activated and will reload with new configuration`);
      
      return;
    }

    switch (resourceType) {
      case "tw":
        // For translation words, fetch the full article and open in new tab
        try {
          console.log("Fetching TW article for:", rcUri);
          // TODO: Implement article loading
          // const article = await getArticle(rcUri, effectiveLanguageId, effectiveOrganization);
          
          // if (article && !article.error && helpsTabsRef) {
          //   console.log("Opening TW article in new tab:", article.title);
          //   helpsTabsRef.openArticleTab(article);
          // }
        } catch (error) {
          console.error("Error handling TW link:", error);
        }
        break;
      case "tn":
        console.log("Translation Notes resource will self-activate");
        break;
      case "tq":
        console.log("Translation Questions resource will self-activate");
        break;
      case "ta":
        // TODO: Implement Translation Academy article loading
        console.log("Translation Academy link:", rcUri);
        break;
      default:
        // For other external resources, open in new tab
        console.log("Opening external resource:", rcUri);
        break;
    }
  }

  // Provide rc link handler to child components
  import { setContext } from 'svelte';
  setContext('rcLinkHandler', handleRcLinkClick);
</script>

<main data-testid="main-view" class="main-view">
  <!-- Navigation Bar -->
  <NavigationBar />
  
  <!-- Mobile Tab Navigation -->
  <div class="mobile-tab-nav">
    <button
      class="mobile-tab"
      class:mobile-tab-active={activeMobileTab === "scripture"}
      on:click={() => activeMobileTab = "scripture"}
    >
      Scripture
    </button>
    <button
      class="mobile-tab"
      class:mobile-tab-active={activeMobileTab === "resources"}
      on:click={() => activeMobileTab = "resources"}
    >
      Resources
    </button>
  </div>
  
  <!-- Main Content Area -->
  <div class="content-area">
    <!-- Scripture Panel -->
    <div
      class="scripture-panel"
      class:mobile-panel-active={activeMobileTab === "scripture"}
    >
      <ScripturePanel {reference} {handleVerseClick} />
    </div>

    <!-- Translation Helps -->
    <div
      class="helps-panel"
      class:mobile-panel-active={activeMobileTab === "resources"}
    >
      <HelpsTabs bind:this={helpsTabsRef} {reference} />
    </div>
  </div>
</main>

<style>
  .main-view {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--color-background);
    color: var(--color-text);
  }

  .mobile-tab-nav {
    display: flex;
    background-color: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .mobile-tab {
    flex: 1;
    padding: var(--spacing-3);
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: var(--font-size-md);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .mobile-tab:hover {
    background-color: var(--color-surface-hover);
    color: var(--color-text);
  }

  .mobile-tab-active {
    color: var(--color-primary);
    background-color: var(--color-surface-secondary);
    border-bottom: 2px solid var(--color-primary);
  }

  .content-area {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .scripture-panel,
  .helps-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .scripture-panel {
    border-right: 1px solid var(--color-border);
  }

  /* Mobile responsive design */
  @media (max-width: 768px) {
    .mobile-tab-nav {
      display: flex;
    }

    .content-area {
      position: relative;
    }

    .scripture-panel,
    .helps-panel {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0;
      transform: translateX(100%);
      transition: all var(--transition-normal);
      pointer-events: none;
    }

    .mobile-panel-active {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }

    .scripture-panel {
      border-right: none;
    }
  }

  /* Desktop design */
  @media (min-width: 769px) {
    .mobile-tab-nav {
      display: none;
    }

    .scripture-panel,
    .helps-panel {
      position: static;
      opacity: 1;
      transform: none;
      pointer-events: auto;
    }
  }
</style>