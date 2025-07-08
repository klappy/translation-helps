<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import ShowcaseNav from '$lib/components/showcase/ShowcaseNav.svelte';
  import ShowcaseContent from '$lib/components/showcase/ShowcaseContent.svelte';
  
  let mobileNavOpen = false;
  
  $: selectedSection = $page.params.section || 'overview';
  
  function handleSectionSelect(section) {
    goto(`/showcase/${section}`);
    mobileNavOpen = false; // Close mobile nav after selection
  }
  
  function toggleMobileNav() {
    mobileNavOpen = !mobileNavOpen;
  }
</script>

<div class="showcase-container">
  <!-- Mobile nav toggle -->
  <button 
    class="mobile-nav-toggle"
    on:click={toggleMobileNav}
    aria-label="Toggle navigation"
  >
    ☰
  </button>

  <!-- Sidebar Navigation -->
  <aside class="sidebar {mobileNavOpen ? 'sidebar-open' : ''}">
    <ShowcaseNav 
      {selectedSection}
      onSectionSelect={handleSectionSelect}
    />
  </aside>

  <!-- Main Content Area -->
  <main class="main-content">
    <slot />
  </main>

  <!-- Mobile overlay -->
  {#if mobileNavOpen}
    <div 
      class="mobile-overlay"
      on:click={() => mobileNavOpen = false}
      on:keydown={() => mobileNavOpen = false}
    />
  {/if}
</div>

<style>
  .showcase-container {
    display: flex;
    min-height: 100vh;
    background: var(--color-background);
    color: var(--color-text);
  }

  .mobile-nav-toggle {
    display: none;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1001;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem;
    cursor: pointer;
    font-size: 1.2rem;
  }

  .sidebar {
    width: 300px;
    background: var(--color-panel);
    border-right: 1px solid var(--color-border);
    overflow-y: auto;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1000;
  }

  .sidebar-open {
    transform: translateX(0);
  }

  .main-content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    margin-left: 300px;
  }

  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  /* Desktop styles */
  @media (min-width: 768px) {
    .sidebar {
      position: relative;
      transform: translateX(0);
    }

    .main-content {
      margin-left: 0;
    }
  }

  /* Mobile styles */
  @media (max-width: 767px) {
    .mobile-nav-toggle {
      display: block;
    }

    .main-content {
      margin-left: 0;
      padding: 1rem;
    }
  }
</style>