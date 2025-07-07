import { c as create_ssr_component } from "../../chunks/ssr.js";
const css = {
  code: ".app.svelte-hc875a{display:flex;flex-direction:column;min-height:100vh;background-color:var(--color-background);color:var(--color-text)}",
  map: `{"version":3,"file":"+layout.svelte","sources":["+layout.svelte"],"sourcesContent":["<script>\\n  import '../app.css';\\n  import { onMount } from 'svelte';\\n  \\n  onMount(() => {\\n    // Theme initialization - check system preference and localStorage\\n    const savedTheme = localStorage.getItem('theme');\\n    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;\\n    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');\\n    \\n    document.documentElement.setAttribute('data-theme', theme);\\n  });\\n<\/script>\\n\\n<div class=\\"app\\">\\n  <slot />\\n</div>\\n\\n<style>\\n  .app {\\n    display: flex;\\n    flex-direction: column;\\n    min-height: 100vh;\\n    background-color: var(--color-background);\\n    color: var(--color-text);\\n  }\\n</style>"],"names":[],"mappings":"AAmBE,kBAAK,CACH,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,UAAU,CAAE,KAAK,CACjB,gBAAgB,CAAE,IAAI,kBAAkB,CAAC,CACzC,KAAK,CAAE,IAAI,YAAY,CACzB"}`
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<div class="app svelte-hc875a">${slots.default ? slots.default({}) : ``} </div>`;
});
export {
  Layout as default
};
