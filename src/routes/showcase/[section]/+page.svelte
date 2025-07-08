<script>
  import { page } from '$app/stores';
  import ShowcaseContent from '$lib/components/showcase/ShowcaseContent.svelte';
  
  $: section = $page.params.section || 'overview';
</script>

<ShowcaseContent {section} />