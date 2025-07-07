<script>
  import { themeStore } from '$lib/stores/theme.js';
  
  const { isDark, toggleTheme } = themeStore;
</script>

<button 
  class="theme-toggle btn btn-secondary"
  on:click={toggleTheme}
  title={$isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  aria-label={$isDark ? 'Switch to light mode' : 'Switch to dark mode'}
>
  {#if $isDark}
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  {:else}
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  {/if}
  
  <span class="theme-text">
    {$isDark ? 'Light' : 'Dark'}
  </span>
</button>

<style>
  .theme-toggle {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-2) var(--spacing-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background-color: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: var(--font-size-sm);
  }

  .theme-toggle:hover {
    background-color: var(--color-surface-hover);
    border-color: var(--color-border-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .theme-toggle:active {
    transform: translateY(0);
  }

  .icon {
    width: 16px;
    height: 16px;
    stroke-width: 2;
  }

  .theme-text {
    font-weight: var(--font-weight-medium);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .theme-text {
      display: none;
    }
    
    .theme-toggle {
      padding: var(--spacing-2);
      min-width: var(--touch-target-min);
      min-height: var(--touch-target-min);
      justify-content: center;
    }
  }
</style>