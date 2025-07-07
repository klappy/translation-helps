<script>
  export let items = [];
</script>

<section class="grid">
  {#each items as item}
    <article class="card" role="article">
      <img src={item.thumbnail} alt={item.title} />
      <h3>{item.title}</h3>
    </article>
  {/each}
</section>

<style>
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:1rem;}
  .card{background:#fff;border-radius:var(--radius-md);box-shadow:0 2px 4px rgba(0,0,0,.05);padding:0.5rem;text-align:center;}
  img{width:100%;height:100px;object-fit:cover;border-radius:var(--radius-sm);}
  h3{font-size:var(--font-size-sm);margin:0.5rem 0 0;}
  :global([data-theme='dark']) .card{background:#2a2a2a;color:var(--color-text);}
</style>