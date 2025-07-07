<script>
  import ThemeToggle from './ThemeToggle.svelte';
  export let app = 'Translation Helps';
  export let sub = 'ETEN Innovation Lab';
</script>

<nav class="nav-bar">
  <div class="logo">
    <img src="/eten-lab-icon.png" alt="ETEN Lab" />
    <div class="logo-text">
      <h1>{app}</h1>
      <p>{sub}</p>
    </div>
  </div>
  <div class="actions">
    <ThemeToggle />
  </div>
</nav>

<style>
  .nav-bar {
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:0.5rem 1rem;
    background:var(--color-primary);
    color:#fff;
  }
  .logo {display:flex;align-items:center;gap:0.5rem;}
  img {width:40px;height:40px;border-radius:var(--radius-md);}
  h1{font-family:var(--font-family);font-size:var(--font-size-lg);margin:0;font-weight:var(--font-weight-bold);} 
  p{margin:0;font-size:var(--font-size-sm);opacity:0.85;}
  .actions{display:flex;align-items:center;gap:0.5rem;}
</style>