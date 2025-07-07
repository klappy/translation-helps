<script>
  import Heading from '../lib/Heading.svelte';
  import ThemeToggle from '../lib/ThemeToggle.svelte';
  import { theme } from '../lib/theme/store.js';
</script>

<section class="settings">
  <Heading level={2} text="Settings" />
  <div class="row">
    <label>Dark Mode</label>
    <ThemeToggle />
  </div>
  <p>Current theme: {$theme}</p>
</section>

<style>
  .settings{padding:2rem 1rem;color:var(--color-text);max-width:600px;margin:0 auto;}
  .row{display:flex;align-items:center;justify-content:space-between;margin-top:1rem;}
</style>