<script>
  import ThemeToggle from './ThemeToggle.svelte';
  import MenuIcon from 'svelte-heroicons/outline/Bars3.svelte';
  import CloseIcon from 'svelte-heroicons/outline/XMark.svelte';
  export let app = 'Translation Helps';
  export let sub = 'ETEN Innovation Lab';
  let open = false;
</script>

<nav class="nav-bar">
  <div class="logo">
    <img src="/eten-lab-icon.png" alt="ETEN Lab" />
    <div class="logo-text">
      <h1>{app}</h1>
      <p>{sub}</p>
    </div>
  </div>
  <div class="spacer" />
  <div class="actions desktop">
    <ThemeToggle />
  </div>
  <button class="icon-button mobile" aria-label="menu" on:click={() => open = !open}>
    {#if open}
      <CloseIcon size={28} />
    {:else}
      <MenuIcon size={28} />
    {/if}
  </button>
</nav>

{#if open}
  <div class="mobile-sheet mobile">
    <ThemeToggle />
  </div>
{/if}

<style>
  .nav-bar {
    display:flex;
    align-items:center;
    padding:0.5rem 1rem;
    background:linear-gradient(90deg,var(--color-primary) 0%,var(--color-primary-accent) 100%);
    color:#fff;
  }
  .logo {display:flex;align-items:center;gap:0.5rem;}
  img {width:40px;height:40px;border-radius:var(--radius-md);}  
  h1{font-family:var(--font-family);font-size:var(--font-size-lg);margin:0;font-weight:var(--font-weight-bold);}  
  p{margin:0;font-size:var(--font-size-sm);opacity:0.85;}
  .actions{display:flex;align-items:center;gap:0.5rem;}
  .spacer{flex:1 1 auto;}
  .icon-button{background:none;border:0;color:#fff;cursor:pointer;}
  @media(min-width:600px){
    .mobile{display:none;}
    .desktop{display:flex;}
  }
  @media(max-width:599px){
    .desktop{display:none;}
    .mobile{display:block;}
    .mobile-sheet{background:var(--color-primary);padding:0.75rem 1rem;display:flex;gap:1rem;}
  }
</style>