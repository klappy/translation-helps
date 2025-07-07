<script>
  export let path = '/';
  $: segments = path.split('/').filter(Boolean);
</script>

<nav class="crumbs">
  {#if segments.length === 0}
    <span class="seg">Home</span>
  {:else}
    <a class="seg" href="/">Home</a>
    {#each segments as seg, i}
      <span class="sep">/</span>
      {#if i === segments.length - 1}
        <span class="seg current">{seg}</span>
      {:else}
        <a class="seg" href={'/' + segments.slice(0,i+1).join('/')}>{seg}</a>
      {/if}
    {/each}
  {/if}
</nav>

<style>
  .crumbs{font-size:var(--font-size-sm);color:var(--color-text);display:flex;align-items:center;gap:0.25rem;flex-wrap:wrap;}
  .seg{opacity:0.7;text-transform:capitalize;}
  .seg.current{font-weight:var(--font-weight-medium);opacity:1;}
  .seg:hover{text-decoration:underline;}
  .sep{opacity:0.5;}
</style>