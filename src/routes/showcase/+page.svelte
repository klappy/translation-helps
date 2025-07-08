<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  onMount(() => {
    goto('/showcase/overview');
  });
</script>

<div>
  <p>Redirecting to showcase overview...</p>
</div>