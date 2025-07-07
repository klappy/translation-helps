<script>
  export let reference;
  export let organization;
  export let languageId;
  export let resourceId;
  export let updateContext;

  // Simple book list for demo - in real app this would come from catalog
  const books = [
    { id: 'gen', name: 'Genesis' },
    { id: 'exo', name: 'Exodus' },
    { id: 'mat', name: 'Matthew' },
    { id: 'mrk', name: 'Mark' },
    { id: 'luk', name: 'Luke' },
    { id: 'jhn', name: 'John' },
    { id: 'rom', name: 'Romans' },
    { id: 'tit', name: 'Titus' }
  ];

  function handleBookChange(event) {
    updateContext({
      reference: {
        ...reference,
        bookId: event.target.value,
        chapter: 1,
        verse: 1
      }
    });
  }

  function handleChapterChange(event) {
    updateContext({
      reference: {
        ...reference,
        chapter: parseInt(event.target.value),
        verse: 1
      }
    });
  }

  function handleVerseChange(event) {
    updateContext({
      reference: {
        ...reference,
        verse: parseInt(event.target.value)
      }
    });
  }

  // Generate chapter options (simplified - normally would come from book metadata)
  $: maxChapters = reference.bookId === 'tit' ? 3 : 
                   reference.bookId === 'jhn' ? 21 : 
                   reference.bookId === 'gen' ? 50 : 28;
  
  $: chapters = Array.from({ length: maxChapters }, (_, i) => i + 1);
  
  // Generate verse options (simplified - normally would come from chapter metadata)
  $: maxVerses = reference.chapter === 1 ? 31 : 25;
  $: verses = Array.from({ length: maxVerses }, (_, i) => i + 1);
</script>

<div class="reference-selector">
  <div class="selector-group">
    <label for="book-select" class="sr-only">Book</label>
    <select 
      id="book-select"
      class="selector book-selector"
      value={reference.bookId}
      on:change={handleBookChange}
    >
      {#each books as book}
        <option value={book.id}>{book.name}</option>
      {/each}
    </select>
  </div>

  <span class="separator">:</span>

  <div class="selector-group">
    <label for="chapter-select" class="sr-only">Chapter</label>
    <select 
      id="chapter-select"
      class="selector chapter-selector"
      value={reference.chapter}
      on:change={handleChapterChange}
    >
      {#each chapters as chapter}
        <option value={chapter}>{chapter}</option>
      {/each}
    </select>
  </div>

  <span class="separator">:</span>

  <div class="selector-group">
    <label for="verse-select" class="sr-only">Verse</label>
    <select 
      id="verse-select"
      class="selector verse-selector"
      value={reference.verse}
      on:change={handleVerseChange}
    >
      {#each verses as verse}
        <option value={verse}>{verse}</option>
      {/each}
    </select>
  </div>
</div>

<style>
  .reference-selector {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--spacing-2);
  }

  .selector-group {
    display: flex;
    align-items: center;
  }

  .selector {
    padding: var(--spacing-2) var(--spacing-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background-color: var(--color-surface);
    color: var(--color-text);
    font-size: var(--font-size-md);
    font-family: var(--font-family);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-width: 80px;
  }

  .selector:hover {
    border-color: var(--color-border-hover);
    background-color: var(--color-surface-hover);
  }

  .selector:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
  }

  .book-selector {
    min-width: 120px;
  }

  .chapter-selector,
  .verse-selector {
    min-width: 60px;
    text-align: center;
  }

  .separator {
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-lg);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .reference-selector {
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--spacing-1);
    }

    .selector {
      font-size: var(--font-size-sm);
      padding: var(--spacing-1) var(--spacing-2);
    }

    .book-selector {
      min-width: 100px;
    }

    .chapter-selector,
    .verse-selector {
      min-width: 50px;
    }
  }
</style>