<script>
  export let icon;
  export let size = 24;
  // icon is a Svelte component (from svelte-heroicons)
</script>

<svelte:component this={icon} {size} />