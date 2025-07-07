<script>
  import { reference, organization, languageId, resourceId, updateContext } from '$lib/stores/reference.js';
  import { themeStore } from '$lib/stores/theme.js';
  import ThemeToggle from './ThemeToggle.svelte';
  import ReferenceSelector from './ReferenceSelector.svelte';
</script>

<nav class="navigation-bar">
  <div class="nav-left">
    <h1 class="app-title">
      <span class="brand">ETEN Lab</span>
      <span class="product">Translation Helps</span>
    </h1>
  </div>
  
  <div class="nav-center">
    <ReferenceSelector 
      reference={$reference}
      organization={$organization}
      languageId={$languageId}
      resourceId={$resourceId}
      {updateContext}
    />
  </div>
  
  <div class="nav-right">
    <ThemeToggle />
  </div>
</nav>

<style>
  .navigation-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-3) var(--spacing-4);
    background-color: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 20;
    min-height: 60px;
  }

  .nav-left,
  .nav-center,
  .nav-right {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .nav-center {
    justify-content: center;
  }

  .nav-right {
    justify-content: flex-end;
  }

  .app-title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
  }

  .brand {
    color: var(--color-primary);
    font-family: var(--font-family-heading);
  }

  .product {
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
    margin-left: var(--spacing-2);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .navigation-bar {
      flex-direction: column;
      gap: var(--spacing-2);
      padding: var(--spacing-2);
    }

    .nav-left,
    .nav-center,
    .nav-right {
      flex: none;
      width: 100%;
      justify-content: center;
    }

    .app-title {
      font-size: var(--font-size-md);
      text-align: center;
    }

    .product {
      display: block;
      margin-left: 0;
      margin-top: var(--spacing-1);
    }
  }
</style>