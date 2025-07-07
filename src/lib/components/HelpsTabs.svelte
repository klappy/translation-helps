<script>
  import { notes, questions, words, loadingResources } from '$lib/stores/resources.js';
  
  export let reference;
  
  let activeTab = 'notes';
  
  const tabs = [
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'questions', label: 'Questions', icon: '❓' },
    { id: 'words', label: 'Words', icon: '📚' }
  ];
  
  function setActiveTab(tabId) {
    activeTab = tabId;
  }
  
  // Mock data for demo
  const mockNotes = [
    {
      id: 'note1',
      verse: 1,
      title: 'In the beginning',
      content: 'This phrase indicates the start of all creation. It establishes God as the Creator of everything.'
    },
    {
      id: 'note2',
      verse: 2,
      title: 'without form and void',
      content: 'The Hebrew words "tohu wabohu" describe a state of emptiness and chaos before God brought order.'
    }
  ];
  
  const mockQuestions = [
    {
      id: 'q1',
      verse: 1,
      question: 'What did God create in the beginning?',
      answer: 'God created the heavens and the earth.'
    },
    {
      id: 'q2',
      verse: 3,
      question: 'What was the first thing God spoke into existence?',
      answer: 'Light was the first thing God spoke into existence.'
    }
  ];
  
  const mockWords = [
    {
      id: 'word1',
      term: 'God',
      definition: 'The supreme being who created and rules over all things.',
      references: ['Genesis 1:1']
    },
    {
      id: 'word2',
      term: 'heavens',
      definition: 'The sky, space, and spiritual realm where God dwells.',
      references: ['Genesis 1:1']
    }
  ];
  
  $: currentData = activeTab === 'notes' ? ($notes.length ? $notes : mockNotes) :
                   activeTab === 'questions' ? ($questions.length ? $questions : mockQuestions) :
                   activeTab === 'words' ? ($words.length ? $words : mockWords) : [];
  
  $: isLoading = $loadingResources.has(activeTab);
</script>

<div class="helps-tabs">
  <div class="tabs-header">
    <div class="tabs-nav">
      {#each tabs as tab}
        <button 
          class="tab-button"
          class:tab-active={activeTab === tab.id}
          on:click={() => setActiveTab(tab.id)}
        >
          <span class="tab-icon">{tab.icon}</span>
          <span class="tab-label">{tab.label}</span>
        </button>
      {/each}
    </div>
  </div>
  
  <div class="tab-content">
    {#if isLoading}
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading {activeTab}...</p>
      </div>
    {:else if currentData.length === 0}
      <div class="empty-state">
        <p>No {activeTab} available for this verse.</p>
      </div>
    {:else}
      <div class="content-list">
        {#each currentData as item}
          <div class="content-item card">
            {#if activeTab === 'notes'}
              <h4 class="item-title">{item.title}</h4>
              <p class="item-content">{item.content}</p>
              <div class="item-meta">Verse {item.verse}</div>
            {:else if activeTab === 'questions'}
              <h4 class="item-title">{item.question}</h4>
              <p class="item-content">{item.answer}</p>
              <div class="item-meta">Verse {item.verse}</div>
            {:else if activeTab === 'words'}
              <h4 class="item-title">{item.term}</h4>
              <p class="item-content">{item.definition}</p>
              <div class="item-meta">
                {#if item.references}
                  References: {item.references.join(', ')}
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .helps-tabs {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .tabs-header {
    background-color: var(--color-surface-secondary);
    border-bottom: 1px solid var(--color-border);
    padding: var(--spacing-2);
  }

  .tabs-nav {
    display: flex;
    gap: var(--spacing-1);
  }

  .tab-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-2) var(--spacing-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background-color: var(--color-surface);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .tab-button:hover {
    background-color: var(--color-surface-hover);
    color: var(--color-text);
    border-color: var(--color-border-hover);
  }

  .tab-active {
    background-color: var(--color-primary);
    color: var(--color-text-on-primary);
    border-color: var(--color-primary);
  }

  .tab-active:hover {
    background-color: var(--color-primary-hover);
    border-color: var(--color-primary-hover);
  }

  .tab-icon {
    font-size: var(--font-size-md);
  }

  .tab-content {
    flex: 1;
    padding: var(--spacing-4);
    overflow-y: auto;
  }

  .content-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .content-item {
    padding: var(--spacing-3);
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .item-title {
    margin: 0 0 var(--spacing-2) 0;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
  }

  .item-content {
    margin: 0 0 var(--spacing-2) 0;
    line-height: var(--line-height-relaxed);
    color: var(--color-text);
  }

  .item-meta {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    font-style: italic;
  }

  .loading-state,
  .empty-state {
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
    .tabs-header {
      padding: var(--spacing-1);
    }

    .tab-button {
      padding: var(--spacing-2);
      font-size: var(--font-size-xs);
    }

    .tab-label {
      display: none;
    }

    .tab-content {
      padding: var(--spacing-3);
    }

    .content-item {
      padding: var(--spacing-2);
    }

    .item-title {
      font-size: var(--font-size-sm);
    }
  }
</style>