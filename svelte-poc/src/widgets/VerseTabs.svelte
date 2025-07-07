<script>
  import { createEventDispatcher } from 'svelte';
  export let tabs = [];
  export let active = 0;
  const dispatch = createEventDispatcher();
  function select(i){
    dispatch('change', i);
  }
</script>

<div role="tablist" class="tabs">
  {#each tabs as label, i}
    <button
      role="tab"
      class:selected={i===active}
      aria-selected={i===active}
      on:click={() => select(i)}
      on:keydown={(e)=>e.key==='ArrowRight' && select((i+1)%tabs.length)}
    >{label}</button>
  {/each}
</div>

<style>
  .tabs{display:flex;gap:0.25rem;overflow-x:auto;}
  button{border:0;background:none;padding:0.5rem 0.75rem;border-radius:var(--radius-sm);font-size:var(--font-size-sm);cursor:pointer;}
  button.selected{background:var(--color-primary);color:#fff;font-weight:var(--font-weight-medium);}
</style>