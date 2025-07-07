<script>
import { theme, toggleTheme } from './theme/store.js';
</script>

<button on:click={toggleTheme} aria-label="toggle theme" style="background:none;border:0;cursor:pointer;color:var(--color-text);">
  { $theme === 'light' ? '🌙' : '☀️' }
</button>