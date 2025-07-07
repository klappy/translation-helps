<script>
  import { onMount } from 'svelte';
  import { referenceStore } from '$lib/stores/reference.js';
  import { resourcesStore } from '$lib/stores/resources.js';
  import { themeStore } from '$lib/stores/theme.js';
  
  import MainView from '$lib/components/MainView.svelte';
  
  onMount(() => {
    console.log('🚀 App: Starting initialization...');
    
    // Initialize stores
    themeStore.initializeTheme();
    console.log('✅ App: Theme initialized');
    
    referenceStore.initializeFromURL();
    console.log('✅ App: Reference store initialized');
    
    resourcesStore.initializeResourceLoader();
    console.log('✅ App: Resource loader initialized');
    
    console.log('🎉 App: All systems ready!');
    
    // Cleanup on unmount
    return () => {
      resourcesStore.cleanupResourceLoader();
      console.log('🧹 App: Cleanup complete');
    };
  });
</script>

<svelte:head>
  <title>ETEN Innovation Lab Translation Helps</title>
  <meta name="description" content="Bible translation resources from ETEN Innovation Lab" />
</svelte:head>

<MainView />

<style>
  /* Page-specific styles if needed */
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
</style>