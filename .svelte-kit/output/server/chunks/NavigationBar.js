import { g as get_store_value, c as create_ssr_component, a as subscribe, d as add_attribute, e as escape, b as each, v as validate_component } from "./ssr.js";
import { d as derived, w as writable } from "./index.js";
const DEFAULT_REFERENCE = {
  bookId: "gen",
  chapter: 1,
  verse: 1
};
const reference = writable(DEFAULT_REFERENCE);
const organization = writable("unfoldingWord");
const languageId = writable("en");
const resourceId = writable("ult");
const advancedMode = writable(false);
const resourceOrganization = writable(null);
const currentResourceData = writable(null);
const scriptures = writable([]);
const resources = writable([]);
const mixedResources = writable({
  scripture: null,
  tn: null,
  tq: null,
  tw: null,
  twl: null
});
const resourceAvailability = writable({
  tn: {},
  tq: {},
  tw: {},
  twl: {}
});
const primaryOrganization = writable(null);
const isInitialized = writable(false);
const currentReference = derived(
  [reference],
  ([$reference]) => $reference
);
const currentScripture = derived(
  [scriptures, organization, languageId, resourceId, reference],
  ([$scriptures, $organization, $languageId, $resourceId, $reference]) => {
    if ($scriptures.length > 0) {
      return $scriptures[0];
    }
    return `/${$organization}/${$languageId}/${$resourceId}/${$reference.bookId}/${$reference.chapter}/${$reference.verse}`;
  }
);
function initializeFromURL() {
  return;
}
function updateContext(updates) {
  ({
    reference: get_store_value(reference),
    organization: get_store_value(organization),
    languageId: get_store_value(languageId),
    resourceId: get_store_value(resourceId),
    scriptures: get_store_value(scriptures),
    resources: get_store_value(resources),
    mixedResources: get_store_value(mixedResources)
  });
  let needsURLUpdate = false;
  if (updates.reference !== void 0) {
    reference.set(updates.reference);
    needsURLUpdate = true;
    const currentScriptures = get_store_value(scriptures);
    if (currentScriptures.length > 0) {
      const parts = currentScriptures[0].split("/").filter(Boolean);
      if (parts.length >= 6) {
        const newScripturePath = `/${parts[0]}/${parts[1]}/${parts[2]}/${updates.reference.bookId}/${updates.reference.chapter}/${updates.reference.verse}`;
        scriptures.set([newScripturePath]);
      }
    }
  }
  if (updates.organization !== void 0) {
    organization.set(updates.organization);
    needsURLUpdate = true;
  }
  if (updates.languageId !== void 0) {
    languageId.set(updates.languageId);
    needsURLUpdate = true;
    currentResourceData.set(null);
  }
  if (updates.resourceId !== void 0) {
    resourceId.set(updates.resourceId);
    needsURLUpdate = true;
    currentResourceData.set(null);
  }
  if (updates.scriptures !== void 0) {
    scriptures.set(updates.scriptures);
    needsURLUpdate = true;
  }
  if (updates.resources !== void 0) {
    resources.set(updates.resources);
    needsURLUpdate = true;
  }
  if (updates.mixedResources !== void 0) {
    const current = get_store_value(mixedResources);
    mixedResources.set({ ...current, ...updates.mixedResources });
  }
  if (updates.resourceOrganization !== void 0) {
    resourceOrganization.set(updates.resourceOrganization);
  }
  if (updates.currentResourceData !== void 0) {
    currentResourceData.set(updates.currentResourceData);
  }
  if (updates.advancedMode !== void 0) {
    advancedMode.set(updates.advancedMode);
  }
  if (needsURLUpdate) {
    ({
      scriptures: get_store_value(scriptures),
      resources: get_store_value(resources)
    });
  }
}
function getResourceOrganization(resourceType = "scripture") {
  const resourceFromArray = getResourceFromArray(resourceType);
  if (resourceFromArray?.organization) {
    return resourceFromArray.organization;
  }
  const $resourceOrganization = get_store_value(resourceOrganization);
  if (resourceType === "scripture" && $resourceOrganization) {
    return $resourceOrganization;
  }
  const $mixedResources = get_store_value(mixedResources);
  if ($mixedResources[resourceType]?.organization) {
    return $mixedResources[resourceType].organization;
  }
  return get_store_value(organization);
}
function getResourceFromArray(resourceType) {
  const $resources = get_store_value(resources);
  const $scriptures = get_store_value(scriptures);
  const resourcePath = $resources.find((r) => typeof r === "string" && r.includes(`/${resourceType}/`));
  if (resourcePath) {
    const parts = resourcePath.split("/").filter(Boolean);
    if (parts.length >= 3) {
      return {
        organization: parts[0],
        languageId: parts[1],
        resourceId: parts[2]
      };
    }
  }
  if (resourceType === "scripture" && $scriptures.length > 0) {
    const scripturePath = $scriptures[0];
    if (typeof scripturePath === "string") {
      const parts = scripturePath.split("/").filter(Boolean);
      if (parts.length >= 3) {
        return {
          organization: parts[0],
          languageId: parts[1],
          resourceId: parts[2]
        };
      }
    }
  }
  return null;
}
const referenceStore = {
  // Core stores
  reference,
  organization,
  languageId,
  resourceId,
  // Advanced features
  advancedMode,
  resourceOrganization,
  currentResourceData,
  // Resource arrays
  scriptures,
  resources,
  mixedResources,
  // Metadata
  resourceAvailability,
  primaryOrganization,
  isInitialized,
  // Derived stores
  currentReference,
  currentScripture,
  // Functions
  initializeFromURL,
  updateContext,
  getResourceOrganization
};
const isDark = writable(true);
const themeStore = {
  isDark
};
const css$2 = {
  code: ".theme-toggle.svelte-bv3rmt{display:flex;align-items:center;gap:var(--spacing-2);padding:var(--spacing-2) var(--spacing-3);border:1px solid var(--color-border);border-radius:var(--radius-md);background-color:var(--color-surface);color:var(--color-text);cursor:pointer;transition:all var(--transition-fast);font-size:var(--font-size-sm)}.theme-toggle.svelte-bv3rmt:hover{background-color:var(--color-surface-hover);border-color:var(--color-border-hover);transform:translateY(-1px);box-shadow:var(--shadow-sm)}.theme-toggle.svelte-bv3rmt:active{transform:translateY(0)}.icon.svelte-bv3rmt{width:16px;height:16px;stroke-width:2}.theme-text.svelte-bv3rmt{font-weight:var(--font-weight-medium)}@media(max-width: 768px){.theme-text.svelte-bv3rmt{display:none}.theme-toggle.svelte-bv3rmt{padding:var(--spacing-2);min-width:var(--touch-target-min);min-height:var(--touch-target-min);justify-content:center}}",
  map: `{"version":3,"file":"ThemeToggle.svelte","sources":["ThemeToggle.svelte"],"sourcesContent":["<script>\\n  import { themeStore } from '$lib/stores/theme.js';\\n  \\n  const { isDark, toggleTheme } = themeStore;\\n<\/script>\\n\\n<button \\n  class=\\"theme-toggle btn btn-secondary\\"\\n  on:click={toggleTheme}\\n  title={$isDark ? 'Switch to light mode' : 'Switch to dark mode'}\\n  aria-label={$isDark ? 'Switch to light mode' : 'Switch to dark mode'}\\n>\\n  {#if $isDark}\\n    <svg class=\\"icon\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\">\\n      <circle cx=\\"12\\" cy=\\"12\\" r=\\"5\\"/>\\n      <line x1=\\"12\\" y1=\\"1\\" x2=\\"12\\" y2=\\"3\\"/>\\n      <line x1=\\"12\\" y1=\\"21\\" x2=\\"12\\" y2=\\"23\\"/>\\n      <line x1=\\"4.22\\" y1=\\"4.22\\" x2=\\"5.64\\" y2=\\"5.64\\"/>\\n      <line x1=\\"18.36\\" y1=\\"18.36\\" x2=\\"19.78\\" y2=\\"19.78\\"/>\\n      <line x1=\\"1\\" y1=\\"12\\" x2=\\"3\\" y2=\\"12\\"/>\\n      <line x1=\\"21\\" y1=\\"12\\" x2=\\"23\\" y2=\\"12\\"/>\\n      <line x1=\\"4.22\\" y1=\\"19.78\\" x2=\\"5.64\\" y2=\\"18.36\\"/>\\n      <line x1=\\"18.36\\" y1=\\"5.64\\" x2=\\"19.78\\" y2=\\"4.22\\"/>\\n    </svg>\\n  {:else}\\n    <svg class=\\"icon\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\">\\n      <path d=\\"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z\\"/>\\n    </svg>\\n  {/if}\\n  \\n  <span class=\\"theme-text\\">\\n    {$isDark ? 'Light' : 'Dark'}\\n  </span>\\n</button>\\n\\n<style>\\n  .theme-toggle {\\n    display: flex;\\n    align-items: center;\\n    gap: var(--spacing-2);\\n    padding: var(--spacing-2) var(--spacing-3);\\n    border: 1px solid var(--color-border);\\n    border-radius: var(--radius-md);\\n    background-color: var(--color-surface);\\n    color: var(--color-text);\\n    cursor: pointer;\\n    transition: all var(--transition-fast);\\n    font-size: var(--font-size-sm);\\n  }\\n\\n  .theme-toggle:hover {\\n    background-color: var(--color-surface-hover);\\n    border-color: var(--color-border-hover);\\n    transform: translateY(-1px);\\n    box-shadow: var(--shadow-sm);\\n  }\\n\\n  .theme-toggle:active {\\n    transform: translateY(0);\\n  }\\n\\n  .icon {\\n    width: 16px;\\n    height: 16px;\\n    stroke-width: 2;\\n  }\\n\\n  .theme-text {\\n    font-weight: var(--font-weight-medium);\\n  }\\n\\n  /* Mobile responsive */\\n  @media (max-width: 768px) {\\n    .theme-text {\\n      display: none;\\n    }\\n    \\n    .theme-toggle {\\n      padding: var(--spacing-2);\\n      min-width: var(--touch-target-min);\\n      min-height: var(--touch-target-min);\\n      justify-content: center;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AAoCE,2BAAc,CACZ,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,IAAI,WAAW,CAAC,CACrB,OAAO,CAAE,IAAI,WAAW,CAAC,CAAC,IAAI,WAAW,CAAC,CAC1C,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,aAAa,CAAE,IAAI,WAAW,CAAC,CAC/B,gBAAgB,CAAE,IAAI,eAAe,CAAC,CACtC,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,GAAG,CAAC,IAAI,iBAAiB,CAAC,CACtC,SAAS,CAAE,IAAI,cAAc,CAC/B,CAEA,2BAAa,MAAO,CAClB,gBAAgB,CAAE,IAAI,qBAAqB,CAAC,CAC5C,YAAY,CAAE,IAAI,oBAAoB,CAAC,CACvC,SAAS,CAAE,WAAW,IAAI,CAAC,CAC3B,UAAU,CAAE,IAAI,WAAW,CAC7B,CAEA,2BAAa,OAAQ,CACnB,SAAS,CAAE,WAAW,CAAC,CACzB,CAEA,mBAAM,CACJ,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,YAAY,CAAE,CAChB,CAEA,yBAAY,CACV,WAAW,CAAE,IAAI,oBAAoB,CACvC,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,yBAAY,CACV,OAAO,CAAE,IACX,CAEA,2BAAc,CACZ,OAAO,CAAE,IAAI,WAAW,CAAC,CACzB,SAAS,CAAE,IAAI,kBAAkB,CAAC,CAClC,UAAU,CAAE,IAAI,kBAAkB,CAAC,CACnC,eAAe,CAAE,MACnB,CACF"}`
};
const ThemeToggle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $isDark, $$unsubscribe_isDark;
  const { isDark: isDark2 } = themeStore;
  $$unsubscribe_isDark = subscribe(isDark2, (value) => $isDark = value);
  $$result.css.add(css$2);
  $$unsubscribe_isDark();
  return `<button class="theme-toggle btn btn-secondary svelte-bv3rmt"${add_attribute("title", $isDark ? "Switch to light mode" : "Switch to dark mode", 0)}${add_attribute("aria-label", $isDark ? "Switch to light mode" : "Switch to dark mode", 0)}>${$isDark ? `<svg class="icon svelte-bv3rmt" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : `<svg class="icon svelte-bv3rmt" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`} <span class="theme-text svelte-bv3rmt">${escape($isDark ? "Light" : "Dark")}</span> </button>`;
});
const css$1 = {
  code: ".reference-selector.svelte-af8x00{display:flex;align-items:center;gap:var(--spacing-2);background-color:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--spacing-2)}.selector-group.svelte-af8x00{display:flex;align-items:center}.selector.svelte-af8x00{padding:var(--spacing-2) var(--spacing-3);border:1px solid var(--color-border);border-radius:var(--radius-sm);background-color:var(--color-surface);color:var(--color-text);font-size:var(--font-size-md);font-family:var(--font-family);cursor:pointer;transition:all var(--transition-fast);min-width:80px}.selector.svelte-af8x00:hover{border-color:var(--color-border-hover);background-color:var(--color-surface-hover)}.selector.svelte-af8x00:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 2px rgba(var(--color-primary-rgb), 0.2)}.book-selector.svelte-af8x00{min-width:120px}.chapter-selector.svelte-af8x00,.verse-selector.svelte-af8x00{min-width:60px;text-align:center}.separator.svelte-af8x00{color:var(--color-text-secondary);font-weight:var(--font-weight-bold);font-size:var(--font-size-lg)}@media(max-width: 768px){.reference-selector.svelte-af8x00{flex-wrap:wrap;justify-content:center;gap:var(--spacing-1)}.selector.svelte-af8x00{font-size:var(--font-size-sm);padding:var(--spacing-1) var(--spacing-2)}.book-selector.svelte-af8x00{min-width:100px}.chapter-selector.svelte-af8x00,.verse-selector.svelte-af8x00{min-width:50px}}",
  map: `{"version":3,"file":"ReferenceSelector.svelte","sources":["ReferenceSelector.svelte"],"sourcesContent":["<script>\\n  export let reference;\\n  export let organization;\\n  export let languageId;\\n  export let resourceId;\\n  export let updateContext;\\n\\n  // Simple book list for demo - in real app this would come from catalog\\n  const books = [\\n    { id: 'gen', name: 'Genesis' },\\n    { id: 'exo', name: 'Exodus' },\\n    { id: 'mat', name: 'Matthew' },\\n    { id: 'mrk', name: 'Mark' },\\n    { id: 'luk', name: 'Luke' },\\n    { id: 'jhn', name: 'John' },\\n    { id: 'rom', name: 'Romans' },\\n    { id: 'tit', name: 'Titus' }\\n  ];\\n\\n  function handleBookChange(event) {\\n    updateContext({\\n      reference: {\\n        ...reference,\\n        bookId: event.target.value,\\n        chapter: 1,\\n        verse: 1\\n      }\\n    });\\n  }\\n\\n  function handleChapterChange(event) {\\n    updateContext({\\n      reference: {\\n        ...reference,\\n        chapter: parseInt(event.target.value),\\n        verse: 1\\n      }\\n    });\\n  }\\n\\n  function handleVerseChange(event) {\\n    updateContext({\\n      reference: {\\n        ...reference,\\n        verse: parseInt(event.target.value)\\n      }\\n    });\\n  }\\n\\n  // Generate chapter options (simplified - normally would come from book metadata)\\n  $: maxChapters = reference.bookId === 'tit' ? 3 : \\n                   reference.bookId === 'jhn' ? 21 : \\n                   reference.bookId === 'gen' ? 50 : 28;\\n  \\n  $: chapters = Array.from({ length: maxChapters }, (_, i) => i + 1);\\n  \\n  // Generate verse options (simplified - normally would come from chapter metadata)\\n  $: maxVerses = reference.chapter === 1 ? 31 : 25;\\n  $: verses = Array.from({ length: maxVerses }, (_, i) => i + 1);\\n<\/script>\\n\\n<div class=\\"reference-selector\\">\\n  <div class=\\"selector-group\\">\\n    <label for=\\"book-select\\" class=\\"sr-only\\">Book</label>\\n    <select \\n      id=\\"book-select\\"\\n      class=\\"selector book-selector\\"\\n      value={reference.bookId}\\n      on:change={handleBookChange}\\n    >\\n      {#each books as book}\\n        <option value={book.id}>{book.name}</option>\\n      {/each}\\n    </select>\\n  </div>\\n\\n  <span class=\\"separator\\">:</span>\\n\\n  <div class=\\"selector-group\\">\\n    <label for=\\"chapter-select\\" class=\\"sr-only\\">Chapter</label>\\n    <select \\n      id=\\"chapter-select\\"\\n      class=\\"selector chapter-selector\\"\\n      value={reference.chapter}\\n      on:change={handleChapterChange}\\n    >\\n      {#each chapters as chapter}\\n        <option value={chapter}>{chapter}</option>\\n      {/each}\\n    </select>\\n  </div>\\n\\n  <span class=\\"separator\\">:</span>\\n\\n  <div class=\\"selector-group\\">\\n    <label for=\\"verse-select\\" class=\\"sr-only\\">Verse</label>\\n    <select \\n      id=\\"verse-select\\"\\n      class=\\"selector verse-selector\\"\\n      value={reference.verse}\\n      on:change={handleVerseChange}\\n    >\\n      {#each verses as verse}\\n        <option value={verse}>{verse}</option>\\n      {/each}\\n    </select>\\n  </div>\\n</div>\\n\\n<style>\\n  .reference-selector {\\n    display: flex;\\n    align-items: center;\\n    gap: var(--spacing-2);\\n    background-color: var(--color-surface);\\n    border: 1px solid var(--color-border);\\n    border-radius: var(--radius-md);\\n    padding: var(--spacing-2);\\n  }\\n\\n  .selector-group {\\n    display: flex;\\n    align-items: center;\\n  }\\n\\n  .selector {\\n    padding: var(--spacing-2) var(--spacing-3);\\n    border: 1px solid var(--color-border);\\n    border-radius: var(--radius-sm);\\n    background-color: var(--color-surface);\\n    color: var(--color-text);\\n    font-size: var(--font-size-md);\\n    font-family: var(--font-family);\\n    cursor: pointer;\\n    transition: all var(--transition-fast);\\n    min-width: 80px;\\n  }\\n\\n  .selector:hover {\\n    border-color: var(--color-border-hover);\\n    background-color: var(--color-surface-hover);\\n  }\\n\\n  .selector:focus {\\n    outline: none;\\n    border-color: var(--color-primary);\\n    box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);\\n  }\\n\\n  .book-selector {\\n    min-width: 120px;\\n  }\\n\\n  .chapter-selector,\\n  .verse-selector {\\n    min-width: 60px;\\n    text-align: center;\\n  }\\n\\n  .separator {\\n    color: var(--color-text-secondary);\\n    font-weight: var(--font-weight-bold);\\n    font-size: var(--font-size-lg);\\n  }\\n\\n  /* Mobile responsive */\\n  @media (max-width: 768px) {\\n    .reference-selector {\\n      flex-wrap: wrap;\\n      justify-content: center;\\n      gap: var(--spacing-1);\\n    }\\n\\n    .selector {\\n      font-size: var(--font-size-sm);\\n      padding: var(--spacing-1) var(--spacing-2);\\n    }\\n\\n    .book-selector {\\n      min-width: 100px;\\n    }\\n\\n    .chapter-selector,\\n    .verse-selector {\\n      min-width: 50px;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AA8GE,iCAAoB,CAClB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,IAAI,WAAW,CAAC,CACrB,gBAAgB,CAAE,IAAI,eAAe,CAAC,CACtC,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,aAAa,CAAE,IAAI,WAAW,CAAC,CAC/B,OAAO,CAAE,IAAI,WAAW,CAC1B,CAEA,6BAAgB,CACd,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MACf,CAEA,uBAAU,CACR,OAAO,CAAE,IAAI,WAAW,CAAC,CAAC,IAAI,WAAW,CAAC,CAC1C,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,aAAa,CAAE,IAAI,WAAW,CAAC,CAC/B,gBAAgB,CAAE,IAAI,eAAe,CAAC,CACtC,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,WAAW,CAAE,IAAI,aAAa,CAAC,CAC/B,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,GAAG,CAAC,IAAI,iBAAiB,CAAC,CACtC,SAAS,CAAE,IACb,CAEA,uBAAS,MAAO,CACd,YAAY,CAAE,IAAI,oBAAoB,CAAC,CACvC,gBAAgB,CAAE,IAAI,qBAAqB,CAC7C,CAEA,uBAAS,MAAO,CACd,OAAO,CAAE,IAAI,CACb,YAAY,CAAE,IAAI,eAAe,CAAC,CAClC,UAAU,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,KAAK,IAAI,mBAAmB,CAAC,CAAC,CAAC,GAAG,CAC1D,CAEA,4BAAe,CACb,SAAS,CAAE,KACb,CAEA,+BAAiB,CACjB,6BAAgB,CACd,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,MACd,CAEA,wBAAW,CACT,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,WAAW,CAAE,IAAI,kBAAkB,CAAC,CACpC,SAAS,CAAE,IAAI,cAAc,CAC/B,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,iCAAoB,CAClB,SAAS,CAAE,IAAI,CACf,eAAe,CAAE,MAAM,CACvB,GAAG,CAAE,IAAI,WAAW,CACtB,CAEA,uBAAU,CACR,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,OAAO,CAAE,IAAI,WAAW,CAAC,CAAC,IAAI,WAAW,CAC3C,CAEA,4BAAe,CACb,SAAS,CAAE,KACb,CAEA,+BAAiB,CACjB,6BAAgB,CACd,SAAS,CAAE,IACb,CACF"}`
};
const ReferenceSelector = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let maxChapters;
  let chapters;
  let maxVerses;
  let verses;
  let { reference: reference2 } = $$props;
  let { organization: organization2 } = $$props;
  let { languageId: languageId2 } = $$props;
  let { resourceId: resourceId2 } = $$props;
  let { updateContext: updateContext2 } = $$props;
  const books = [
    { id: "gen", name: "Genesis" },
    { id: "exo", name: "Exodus" },
    { id: "mat", name: "Matthew" },
    { id: "mrk", name: "Mark" },
    { id: "luk", name: "Luke" },
    { id: "jhn", name: "John" },
    { id: "rom", name: "Romans" },
    { id: "tit", name: "Titus" }
  ];
  if ($$props.reference === void 0 && $$bindings.reference && reference2 !== void 0) $$bindings.reference(reference2);
  if ($$props.organization === void 0 && $$bindings.organization && organization2 !== void 0) $$bindings.organization(organization2);
  if ($$props.languageId === void 0 && $$bindings.languageId && languageId2 !== void 0) $$bindings.languageId(languageId2);
  if ($$props.resourceId === void 0 && $$bindings.resourceId && resourceId2 !== void 0) $$bindings.resourceId(resourceId2);
  if ($$props.updateContext === void 0 && $$bindings.updateContext && updateContext2 !== void 0) $$bindings.updateContext(updateContext2);
  $$result.css.add(css$1);
  maxChapters = reference2.bookId === "tit" ? 3 : reference2.bookId === "jhn" ? 21 : reference2.bookId === "gen" ? 50 : 28;
  chapters = Array.from({ length: maxChapters }, (_, i) => i + 1);
  maxVerses = reference2.chapter === 1 ? 31 : 25;
  verses = Array.from({ length: maxVerses }, (_, i) => i + 1);
  return `<div class="reference-selector svelte-af8x00"><div class="selector-group svelte-af8x00"><label for="book-select" class="sr-only" data-svelte-h="svelte-1tumje6">Book</label> <select id="book-select" class="selector book-selector svelte-af8x00"${add_attribute("value", reference2.bookId, 0)}>${each(books, (book) => {
    return `<option${add_attribute("value", book.id, 0)}>${escape(book.name)}</option>`;
  })}</select></div> <span class="separator svelte-af8x00" data-svelte-h="svelte-1o1dh8">:</span> <div class="selector-group svelte-af8x00"><label for="chapter-select" class="sr-only" data-svelte-h="svelte-r15zqk">Chapter</label> <select id="chapter-select" class="selector chapter-selector svelte-af8x00"${add_attribute("value", reference2.chapter, 0)}>${each(chapters, (chapter) => {
    return `<option${add_attribute("value", chapter, 0)}>${escape(chapter)}</option>`;
  })}</select></div> <span class="separator svelte-af8x00" data-svelte-h="svelte-1o1dh8">:</span> <div class="selector-group svelte-af8x00"><label for="verse-select" class="sr-only" data-svelte-h="svelte-sdanh0">Verse</label> <select id="verse-select" class="selector verse-selector svelte-af8x00"${add_attribute("value", reference2.verse, 0)}>${each(verses, (verse) => {
    return `<option${add_attribute("value", verse, 0)}>${escape(verse)}</option>`;
  })}</select></div> </div>`;
});
const css = {
  code: ".navigation-bar.svelte-cdztfy{display:flex;align-items:center;justify-content:space-between;padding:var(--spacing-3) var(--spacing-4);background-color:var(--color-surface);border-bottom:1px solid var(--color-border);position:sticky;top:0;z-index:20;min-height:60px}.nav-left.svelte-cdztfy,.nav-center.svelte-cdztfy,.nav-right.svelte-cdztfy{flex:1;display:flex;align-items:center}.nav-center.svelte-cdztfy{justify-content:center}.nav-right.svelte-cdztfy{justify-content:flex-end}.app-title.svelte-cdztfy{margin:0;font-size:var(--font-size-lg);font-weight:var(--font-weight-bold);color:var(--color-text)}.brand.svelte-cdztfy{color:var(--color-primary);font-family:var(--font-family-heading)}.product.svelte-cdztfy{color:var(--color-text-secondary);font-weight:var(--font-weight-medium);margin-left:var(--spacing-2)}@media(max-width: 768px){.navigation-bar.svelte-cdztfy{flex-direction:column;gap:var(--spacing-2);padding:var(--spacing-2)}.nav-left.svelte-cdztfy,.nav-center.svelte-cdztfy,.nav-right.svelte-cdztfy{flex:none;width:100%;justify-content:center}.app-title.svelte-cdztfy{font-size:var(--font-size-md);text-align:center}.product.svelte-cdztfy{display:block;margin-left:0;margin-top:var(--spacing-1)}}",
  map: `{"version":3,"file":"NavigationBar.svelte","sources":["NavigationBar.svelte"],"sourcesContent":["<script>\\n  import { reference, organization, languageId, resourceId, updateContext } from '$lib/stores/reference.js';\\n  import { themeStore } from '$lib/stores/theme.js';\\n  import ThemeToggle from './ThemeToggle.svelte';\\n  import ReferenceSelector from './ReferenceSelector.svelte';\\n<\/script>\\n\\n<nav class=\\"navigation-bar\\">\\n  <div class=\\"nav-left\\">\\n    <h1 class=\\"app-title\\">\\n      <span class=\\"brand\\">ETEN Lab</span>\\n      <span class=\\"product\\">Translation Helps</span>\\n    </h1>\\n  </div>\\n  \\n  <div class=\\"nav-center\\">\\n    <ReferenceSelector \\n      reference={$reference}\\n      organization={$organization}\\n      languageId={$languageId}\\n      resourceId={$resourceId}\\n      {updateContext}\\n    />\\n  </div>\\n  \\n  <div class=\\"nav-right\\">\\n    <ThemeToggle />\\n  </div>\\n</nav>\\n\\n<style>\\n  .navigation-bar {\\n    display: flex;\\n    align-items: center;\\n    justify-content: space-between;\\n    padding: var(--spacing-3) var(--spacing-4);\\n    background-color: var(--color-surface);\\n    border-bottom: 1px solid var(--color-border);\\n    position: sticky;\\n    top: 0;\\n    z-index: 20;\\n    min-height: 60px;\\n  }\\n\\n  .nav-left,\\n  .nav-center,\\n  .nav-right {\\n    flex: 1;\\n    display: flex;\\n    align-items: center;\\n  }\\n\\n  .nav-center {\\n    justify-content: center;\\n  }\\n\\n  .nav-right {\\n    justify-content: flex-end;\\n  }\\n\\n  .app-title {\\n    margin: 0;\\n    font-size: var(--font-size-lg);\\n    font-weight: var(--font-weight-bold);\\n    color: var(--color-text);\\n  }\\n\\n  .brand {\\n    color: var(--color-primary);\\n    font-family: var(--font-family-heading);\\n  }\\n\\n  .product {\\n    color: var(--color-text-secondary);\\n    font-weight: var(--font-weight-medium);\\n    margin-left: var(--spacing-2);\\n  }\\n\\n  /* Mobile responsive */\\n  @media (max-width: 768px) {\\n    .navigation-bar {\\n      flex-direction: column;\\n      gap: var(--spacing-2);\\n      padding: var(--spacing-2);\\n    }\\n\\n    .nav-left,\\n    .nav-center,\\n    .nav-right {\\n      flex: none;\\n      width: 100%;\\n      justify-content: center;\\n    }\\n\\n    .app-title {\\n      font-size: var(--font-size-md);\\n      text-align: center;\\n    }\\n\\n    .product {\\n      display: block;\\n      margin-left: 0;\\n      margin-top: var(--spacing-1);\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AA+BE,6BAAgB,CACd,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,aAAa,CAC9B,OAAO,CAAE,IAAI,WAAW,CAAC,CAAC,IAAI,WAAW,CAAC,CAC1C,gBAAgB,CAAE,IAAI,eAAe,CAAC,CACtC,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CAC5C,QAAQ,CAAE,MAAM,CAChB,GAAG,CAAE,CAAC,CACN,OAAO,CAAE,EAAE,CACX,UAAU,CAAE,IACd,CAEA,uBAAS,CACT,yBAAW,CACX,wBAAW,CACT,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MACf,CAEA,yBAAY,CACV,eAAe,CAAE,MACnB,CAEA,wBAAW,CACT,eAAe,CAAE,QACnB,CAEA,wBAAW,CACT,MAAM,CAAE,CAAC,CACT,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,WAAW,CAAE,IAAI,kBAAkB,CAAC,CACpC,KAAK,CAAE,IAAI,YAAY,CACzB,CAEA,oBAAO,CACL,KAAK,CAAE,IAAI,eAAe,CAAC,CAC3B,WAAW,CAAE,IAAI,qBAAqB,CACxC,CAEA,sBAAS,CACP,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,WAAW,CAAE,IAAI,oBAAoB,CAAC,CACtC,WAAW,CAAE,IAAI,WAAW,CAC9B,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,6BAAgB,CACd,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,IAAI,WAAW,CAAC,CACrB,OAAO,CAAE,IAAI,WAAW,CAC1B,CAEA,uBAAS,CACT,yBAAW,CACX,wBAAW,CACT,IAAI,CAAE,IAAI,CACV,KAAK,CAAE,IAAI,CACX,eAAe,CAAE,MACnB,CAEA,wBAAW,CACT,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,UAAU,CAAE,MACd,CAEA,sBAAS,CACP,OAAO,CAAE,KAAK,CACd,WAAW,CAAE,CAAC,CACd,UAAU,CAAE,IAAI,WAAW,CAC7B,CACF"}`
};
const NavigationBar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $reference, $$unsubscribe_reference;
  let $organization, $$unsubscribe_organization;
  let $languageId, $$unsubscribe_languageId;
  let $resourceId, $$unsubscribe_resourceId;
  $$unsubscribe_reference = subscribe(reference, (value) => $reference = value);
  $$unsubscribe_organization = subscribe(organization, (value) => $organization = value);
  $$unsubscribe_languageId = subscribe(languageId, (value) => $languageId = value);
  $$unsubscribe_resourceId = subscribe(resourceId, (value) => $resourceId = value);
  $$result.css.add(css);
  $$unsubscribe_reference();
  $$unsubscribe_organization();
  $$unsubscribe_languageId();
  $$unsubscribe_resourceId();
  return `<nav class="navigation-bar svelte-cdztfy"><div class="nav-left svelte-cdztfy" data-svelte-h="svelte-syq5qq"><h1 class="app-title svelte-cdztfy"><span class="brand svelte-cdztfy">ETEN Lab</span> <span class="product svelte-cdztfy">Translation Helps</span></h1></div> <div class="nav-center svelte-cdztfy">${validate_component(ReferenceSelector, "ReferenceSelector").$$render(
    $$result,
    {
      reference: $reference,
      organization: $organization,
      languageId: $languageId,
      resourceId: $resourceId,
      updateContext
    },
    {},
    {}
  )}</div> <div class="nav-right svelte-cdztfy">${validate_component(ThemeToggle, "ThemeToggle").$$render($$result, {}, {}, {})}</div> </nav>`;
});
export {
  NavigationBar as N,
  resourceId as a,
  resourceOrganization as b,
  currentResourceData as c,
  referenceStore as d,
  isInitialized as i,
  languageId as l,
  mixedResources as m,
  organization as o,
  reference as r,
  updateContext as u
};
