<script>
  import Heading from '../lib/Heading.svelte';
  import Icon from '../lib/Icon.svelte';
  import BookIcon from 'svelte-heroicons/solid/BookOpen.svelte';
</script>

<section class="hero">
  <Icon icon={BookIcon} size={64} />
  <Heading level={1} text="Translation Helps" />
  <p class="tagline">Study resources at the speed of light.</p>
  <a class="cta" href="/showcase">Explore Showcase</a>
</section>

<style>
  .hero{
    display:flex;flex-direction:column;align-items:center;gap:1.25rem;
    padding:4rem 1rem;text-align:center;color:var(--color-text);
  }
  .tagline{font-size:var(--font-size-lg);margin:0;
  }
  .cta{
    background:var(--color-primary);color:#fff;padding:0.65rem 1.2rem;border-radius:var(--radius-md);
    text-decoration:none;font-weight:var(--font-weight-medium);
    transition:opacity .2s;
  }
  .cta:hover{opacity:0.85;}
</style>