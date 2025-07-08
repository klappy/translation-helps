<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import NavigationBar from '$lib/components/NavigationBar.svelte';
  import SplashScreen from '$lib/components/SplashScreen.svelte';
  import DevelopmentReminder from '$lib/components/DevelopmentReminder.svelte';
  import '../app.css';
  
  let showSplash = false;

  onMount(() => {
    // Check if user has seen splash before
    const hasSeenSplash = localStorage.getItem('hasSeenSplash');
    const showSplashParam = $page.url.searchParams.get('splash');
    
    // Show splash only on first visit or if explicitly requested
    showSplash = !hasSeenSplash || showSplashParam === 'true';

    // Initialize theme on app load
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  });

  function handleSplashComplete() {
    // Mark that user has seen splash
    localStorage.setItem('hasSeenSplash', 'true');
    showSplash = false;
  }
</script>

{#if showSplash}
  <SplashScreen onComplete={handleSplashComplete} />
{:else}
  <div 
    style="
      background-color: var(--color-background); 
      min-height: 100vh;
      color: var(--color-text);
    "
  >
    <NavigationBar />
    <main>
      <slot />
    </main>
    <DevelopmentReminder />
  </div>
{/if}