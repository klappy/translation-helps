<script>
  export let level = 1; // h1 by default
  export let text = '';
  const Tag = `h${level}`;
</script>

<svelte:component this={Tag} style="font-family:var(--font-family);font-weight:var(--font-weight-bold);margin:0;">
  {text}
</svelte:component>