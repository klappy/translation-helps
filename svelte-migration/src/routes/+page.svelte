<script>
  import { onMount } from 'svelte';
  import { referenceStore } from '$lib/stores/reference.js';
  import { resourcesStore } from '$lib/stores/resources.js';
  import { themeStore } from '$lib/stores/theme.js';
  
  import MainView from '$lib/components/MainView.svelte';
  
  onMount(() => {
    // Initialize stores
    themeStore.initializeTheme();
    referenceStore.initializeFromURL();
    resourcesStore.initializeResourceLoader();
    
    // Cleanup on unmount
    return () => {
      resourcesStore.cleanupResourceLoader();
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
</style>