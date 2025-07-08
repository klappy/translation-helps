<script>
  import { onMount } from 'svelte';
  import { resourcesStore } from '$lib/stores/resources.js';
  import LoadingOverlay from './shared/LoadingOverlay.svelte';
  import LoadingSpinner from './shared/LoadingSpinner.svelte';
  import TabIcon from './shared/TabIcon.svelte';
  import TranslationNotesPanel from './TranslationNotesPanel.svelte';
  import TranslationQuestionsPanel from './TranslationQuestionsPanel.svelte';
  import TranslationWordsPanel from './TranslationWordsPanel.svelte';
  import ArticlePanel from './ArticlePanel.svelte';
  import LLMChatPanel from './LLMChatPanel.svelte';
  import FiaImagesPanel from './FiaImagesPanel.svelte';
  import FiaMapsPanel from './FiaMapsPanel.svelte';

  export let reference;

  let activeTab = 'tn';
  let dynamicTabs = [];
  let resources = {};
  let loadingResources = new Set();

  // Static tabs configuration
  const STATIC_TABS = [
    { id: "tn", label: "Notes", mobileLabel: "Notes", icon: "notes", component: TranslationNotesPanel, isStatic: true },
    { id: "tq", label: "Questions", mobileLabel: "Q&A", icon: "questions", component: TranslationQuestionsPanel, isStatic: true },
    { id: "tw", label: "Words", mobileLabel: "Words", icon: "words", component: TranslationWordsPanel, isStatic: true },
    { id: "fia-images", label: "Images", mobileLabel: "Pics", icon: "images", component: FiaImagesPanel, isStatic: true },
    { id: "fia-maps", label: "Maps", mobileLabel: "Maps", icon: "maps", component: FiaMapsPanel, isStatic: true },
    { id: "chat", label: "AI Assistant", mobileLabel: "AI", icon: "chat", component: LLMChatPanel, isStatic: true },
  ];

  // Subscribe to stores
  const unsubscribeResources = resourcesStore.subscribe((store) => {
    resources = store;
  });

  const unsubscribeLoadingResources = resourcesStore.loadingResources.subscribe((loading) => {
    loadingResources = loading;
  });

  onMount(() => {
    return () => {
      unsubscribeResources();
      unsubscribeLoadingResources();
    };
  });

  // Helper function to check if a specific resource is loading
  function isResourceLoading(tabId) {
    const resourceMap = {
      'tn': 'notes',
      'tq': 'questions', 
      'tw': 'words',
      'fia-images': 'fia',
      'fia-maps': 'fia'
    };
    const resourceType = resourceMap[tabId];
    return resourceType && loadingResources.has(resourceType);
  }

  // Helper function to get count for each resource type
  function getResourceCount(tabId) {
    // Show loading spinner in badge if resource is loading
    if (isResourceLoading(tabId)) {
      return 'loading';
    }

    switch (tabId) {
      case 'tn':
        return Array.isArray(resources.notes) ? resources.notes.length : 0;
      case 'tq':
        return Array.isArray(resources.questions) ? resources.questions.length : 0;
      case 'tw':
        // Count both words and links
        const wordsCount = Array.isArray(resources.words) ? resources.words.length : 0;
        const linksCount = Array.isArray(resources.links) ? resources.links.length : 0;
        return Math.max(wordsCount, linksCount); // Use the higher count
      case 'fia-images':
        if (resources.fia?.hasContent) {
          return Array.isArray(resources.fia.images) ? resources.fia.images.length : 0;
        }
        return 0;
      case 'fia-maps':
        if (resources.fia?.hasContent) {
          return Array.isArray(resources.fia.maps) ? resources.fia.maps.length : 0;
        }
        return 0;
      case 'chat':
        // Return total items loaded across all resources
        const totalItems = (
          (Array.isArray(resources.notes) ? resources.notes.length : 0) +
          (Array.isArray(resources.questions) ? resources.questions.length : 0) +
          (Array.isArray(resources.words) ? resources.words.length : 0) +
          (resources.fia?.hasContent ? (
            (Array.isArray(resources.fia.images) ? resources.fia.images.length : 0) +
            (Array.isArray(resources.fia.maps) ? resources.fia.maps.length : 0)
          ) : 0)
        );
        return totalItems > 0 ? totalItems : null;
      default:
        return null;
    }
  }

  // Combine static and dynamic tabs
  $: allTabs = [...STATIC_TABS, ...dynamicTabs];

  // Public API for parent components (equivalent to useImperativeHandle)
  export function switchToTab(tabId) {
    if (allTabs.find((tab) => tab.id === tabId)) {
      activeTab = tabId;
    }
  }

  export function getActiveTab() {
    return activeTab;
  }

  export function openArticleTab(article) {
    // Check if tab already exists by rcUri
    const existingTab = dynamicTabs.find((tab) => tab.articleData?.rcUri === article.rcUri);
    if (existingTab) {
      activeTab = existingTab.id;
      return;
    }

    // Use provided id or generate one from rcUri
    const tabId = article.id || article.rcUri.replace(/[^a-zA-Z0-9]/g, "_");

    // Create new dynamic tab
    const newTab = {
      id: tabId,
      label: article.title || "Article",
      component: ArticlePanel,
      isStatic: false,
      articleData: article,
    };

    dynamicTabs = [...dynamicTabs, newTab];
    activeTab = tabId;
  }

  export function closeTab(tabId) {
    // Only allow closing dynamic tabs
    const tabToClose = dynamicTabs.find((tab) => tab.id === tabId);
    if (tabToClose) {
      dynamicTabs = dynamicTabs.filter((tab) => tab.id !== tabId);

      // If closing active tab, switch to first available tab
      if (activeTab === tabId) {
        const remainingTabs = allTabs.filter((tab) => tab.id !== tabId);
        if (remainingTabs.length > 0) {
          activeTab = remainingTabs[0].id;
        }
      }
    }
  }

  function handleTabChange(tabId) {
    activeTab = tabId;
  }

  function handleCloseTab(tabId, event) {
    event.stopPropagation();
    const tabToClose = dynamicTabs.find((tab) => tab.id === tabId);
    if (tabToClose) {
      dynamicTabs = dynamicTabs.filter((tab) => tab.id !== tabId);

      // If closing active tab, switch to first available tab
      if (activeTab === tabId) {
        const remainingTabs = allTabs.filter((tab) => tab.id !== tabId);
        if (remainingTabs.length > 0) {
          activeTab = remainingTabs[0].id;
        }
      }
    }
  }
</script>

<div class="helps-tabs" data-testid="helps-tabs">
  <div class="tabs-header" role="tablist" aria-label="Translation helps tabs">
    {#each allTabs as tab (tab.id)}
      {@const count = getResourceCount(tab.id)}
      {@const isActive = activeTab === tab.id}
      {@const tabIsLoading = isResourceLoading(tab.id)}
      
      <div class="tab-container">
        <button
          role="tab"
          aria-selected={isActive}
          aria-controls="tabpanel-{tab.id}"
          id="tab-{tab.id}"
          on:click={() => handleTabChange(tab.id)}
          data-testid="tab-{tab.id}"
          class="tab-button {isActive ? 'active' : ''} {tabIsLoading ? 'loading' : ''}"
          tabindex={isActive ? 0 : -1}
        >
          {#if tab.icon}
            <TabIcon type={tab.icon} />
          {/if}
          <span class="desktop-label">{tab.label}</span>
          <span class="mobile-label">{tab.mobileLabel || tab.label}</span>
          {#if count !== null}
            <span 
              class="count-badge {count === 0 ? 'zero' : ''} {count === 'loading' ? 'loading-badge' : ''}"
              aria-label={count === 'loading' ? 'Loading...' : `${count} items`}
            >
              {#if count === 'loading'}
                <LoadingSpinner size="small" variant="white" />
              {:else}
                {count}
              {/if}
            </span>
          {/if}
        </button>
        {#if !tab.isStatic}
          <button
            on:click={(e) => handleCloseTab(tab.id, e)}
            class="close-button"
            aria-label="Close {tab.label} tab"
            tabindex={isActive ? 0 : -1}
          >
            ×
          </button>
        {/if}
      </div>
    {/each}
  </div>
  
  <div class="main-tab-content">
    <!-- Always render all static panels but only show the active one -->
    
    <LoadingOverlay 
      isVisible={activeTab === 'tn' && isResourceLoading('tn')}
      text="Loading Notes..."
    >
      <div 
        role="tabpanel"
        id="tabpanel-tn"
        aria-labelledby="tab-tn"
        data-testid="tab-content-tn"
        class="tab-panel"
        style="display: {activeTab === 'tn' ? 'block' : 'none'}"
        tabindex={activeTab === 'tn' ? 0 : -1}
      >
        <TranslationNotesPanel {reference} />
      </div>
    </LoadingOverlay>
    
    <LoadingOverlay 
      isVisible={activeTab === 'tq' && isResourceLoading('tq')}
      text="Loading Questions..."
    >
      <div 
        role="tabpanel"
        id="tabpanel-tq"
        aria-labelledby="tab-tq"
        data-testid="tab-content-tq"
        class="tab-panel"
        style="display: {activeTab === 'tq' ? 'block' : 'none'}"
        tabindex={activeTab === 'tq' ? 0 : -1}
      >
        <TranslationQuestionsPanel {reference} />
      </div>
    </LoadingOverlay>
    
    <LoadingOverlay 
      isVisible={activeTab === 'tw' && isResourceLoading('tw')}
      text="Loading Words..."
    >
      <div 
        role="tabpanel"
        id="tabpanel-tw"
        aria-labelledby="tab-tw"
        data-testid="tab-content-tw"
        class="tab-panel"
        style="display: {activeTab === 'tw' ? 'block' : 'none'}"
        tabindex={activeTab === 'tw' ? 0 : -1}
      >
        <TranslationWordsPanel {reference} />
      </div>
    </LoadingOverlay>
    
    <LoadingOverlay 
      isVisible={activeTab === 'fia-images' && isResourceLoading('fia-images')}
      text="Loading FIA Images..."
    >
      <div 
        role="tabpanel"
        id="tabpanel-fia-images"
        aria-labelledby="tab-fia-images"
        data-testid="tab-content-fia-images"
        class="tab-panel"
        style="display: {activeTab === 'fia-images' ? 'block' : 'none'}"
        tabindex={activeTab === 'fia-images' ? 0 : -1}
      >
        <FiaImagesPanel {reference} />
      </div>
    </LoadingOverlay>
    
    <LoadingOverlay 
      isVisible={activeTab === 'fia-maps' && isResourceLoading('fia-maps')}
      text="Loading FIA Maps..."
    >
      <div 
        role="tabpanel"
        id="tabpanel-fia-maps"
        aria-labelledby="tab-fia-maps"
        data-testid="tab-content-fia-maps"
        class="tab-panel"
        style="display: {activeTab === 'fia-maps' ? 'block' : 'none'}"
        tabindex={activeTab === 'fia-maps' ? 0 : -1}
      >
        <FiaMapsPanel {reference} />
      </div>
    </LoadingOverlay>
    
    <div 
      role="tabpanel"
      id="tabpanel-chat"
      aria-labelledby="tab-chat"
      data-testid="tab-content-chat"
      class="tab-panel"
      style="display: {activeTab === 'chat' ? 'block' : 'none'}"
      tabindex={activeTab === 'chat' ? 0 : -1}
    >
      <LLMChatPanel {reference} />
    </div>
    
    <!-- Dynamic tabs (articles) - only render when active -->
    {#each dynamicTabs as tab (tab.id)}
      <div
        role="tabpanel"
        id="tabpanel-{tab.id}"
        aria-labelledby="tab-{tab.id}"
        data-testid="tab-content-{tab.id}"
        class="tab-panel"
        style="display: {activeTab === tab.id ? 'block' : 'none'}"
        tabindex={activeTab === tab.id ? 0 : -1}
      >
        <ArticlePanel {reference} article={tab.articleData} />
      </div>
    {/each}
  </div>
</div>

<style>
  .helps-tabs {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-background);
    border-radius: 8px;
    overflow: hidden;
  }

  .tabs-header {
    display: flex;
    background: var(--color-header);
    border-bottom: 1px solid var(--color-border);
    padding: 0 0.5rem;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .tabs-header::-webkit-scrollbar {
    height: 4px;
  }

  .tabs-header::-webkit-scrollbar-track {
    background: var(--color-background);
  }

  .tabs-header::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 2px;
  }

  .tab-container {
    display: flex;
    align-items: center;
    position: relative;
    flex-shrink: 0;
  }

  .tab-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    white-space: nowrap;
    transition: all 0.2s ease;
    border-bottom: 2px solid transparent;
    position: relative;
  }

  .tab-button:hover {
    color: var(--color-text);
    background: var(--color-hover);
  }

  .tab-button.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
    background: var(--color-background);
  }

  .tab-button.loading {
    opacity: 0.7;
  }

  .desktop-label {
    display: block;
  }

  .mobile-label {
    display: none;
  }

  .count-badge {
    background: var(--color-primary);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.15rem 0.4rem;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .count-badge.zero {
    background: var(--color-text-secondary);
    opacity: 0.6;
  }

  .count-badge.loading-badge {
    background: var(--color-secondary);
    padding: 0.2rem 0.4rem;
  }

  .close-button {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: bold;
    padding: 0.25rem;
    margin-left: 0.25rem;
    border-radius: 3px;
    transition: all 0.2s ease;
    line-height: 1;
  }

  .close-button:hover {
    color: var(--color-error);
    background: var(--color-error-alpha);
  }

  .main-tab-content {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  .tab-panel {
    height: 100%;
    overflow: hidden;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .desktop-label {
      display: none;
    }

    .mobile-label {
      display: block;
    }

    .tab-button {
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
    }

    .tabs-header {
      padding: 0 0.25rem;
    }
  }

  /* Focus styles for accessibility */
  .tab-button:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }

  .close-button:focus {
    outline: 2px solid var(--color-error);
    outline-offset: -2px;
  }
</style>