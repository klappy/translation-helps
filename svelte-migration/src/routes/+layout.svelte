<script>
  import '../app.css';
  import { onMount } from 'svelte';
  
  onMount(() => {
    // Theme initialization - check system preference and localStorage
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', theme);
  });
</script>

<div class="app">
  <slot />
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--color-background);
    color: var(--color-text);
  }
</style>