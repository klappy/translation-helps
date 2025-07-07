import { b as get_store_value, c as create_ssr_component, a as subscribe, e as escape, d as each, f as add_attribute, v as validate_component, s as setContext } from "../../chunks/ssr.js";
import { d as derived, w as writable } from "../../chunks/index.js";
import "js-yaml";
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
const resources$1 = writable([]);
const mixedResources = writable({
  scripture: null,
  tn: null,
  tq: null,
  tw: null,
  twl: null
});
derived(
  [reference],
  ([$reference]) => $reference
);
derived(
  [scriptures, organization, languageId, resourceId, reference],
  ([$scriptures, $organization, $languageId, $resourceId, $reference]) => {
    if ($scriptures.length > 0) {
      return $scriptures[0];
    }
    return `/${$organization}/${$languageId}/${$resourceId}/${$reference.bookId}/${$reference.chapter}/${$reference.verse}`;
  }
);
function updateContext(updates) {
  ({
    reference: get_store_value(reference),
    organization: get_store_value(organization),
    languageId: get_store_value(languageId),
    resourceId: get_store_value(resourceId),
    scriptures: get_store_value(scriptures),
    resources: get_store_value(resources$1),
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
    resources$1.set(updates.resources);
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
      resources: get_store_value(resources$1)
    });
  }
}
const resources = writable({});
const loadingResources = writable(/* @__PURE__ */ new Set());
const activeResources = writable(/* @__PURE__ */ new Set(["scripture", "notes", "questions"]));
const scripture = derived(
  [resources],
  ([$resources]) => $resources.scripture || null
);
const notes = derived(
  [resources],
  ([$resources]) => $resources.notes || []
);
const questions = derived(
  [resources],
  ([$resources]) => $resources.questions || []
);
const words = derived(
  [resources],
  ([$resources]) => $resources.words || []
);
derived(
  [resources],
  ([$resources]) => $resources.links || []
);
function activateResource(resourceType) {
  const current = get_store_value(activeResources);
  if (!current.has(resourceType)) {
    activeResources.update((set) => new Set(set).add(resourceType));
  }
}
const isDark = writable(true);
const themeStore = {
  isDark
};
const css$6 = {
  code: ".scripture-panel.svelte-1g2rypg{display:flex;flex-direction:column;height:100%;background-color:var(--color-surface);border-radius:var(--radius-lg);overflow:hidden}.scripture-header.svelte-1g2rypg{display:flex;align-items:center;justify-content:space-between;padding:var(--spacing-4);background-color:var(--color-surface-secondary);border-bottom:1px solid var(--color-border)}.scripture-title.svelte-1g2rypg{margin:0;font-size:var(--font-size-xl);font-weight:var(--font-weight-bold);color:var(--color-text);font-family:var(--font-family-heading)}.loading-indicator.svelte-1g2rypg{display:flex;align-items:center;gap:var(--spacing-2)}.scripture-content.svelte-1g2rypg{flex:1;padding:var(--spacing-4);overflow-y:auto;background-color:var(--color-surface)}.scripture-text.svelte-1g2rypg{line-height:var(--line-height-relaxed);font-size:var(--font-size-md);color:var(--color-text)}.scripture-text.svelte-1g2rypg .verse{margin-bottom:var(--spacing-3);padding:var(--spacing-2);border-radius:var(--radius-sm);cursor:pointer;transition:all var(--transition-fast);min-height:var(--verse-min-height);display:flex;align-items:flex-start;gap:var(--spacing-2)}.scripture-text.svelte-1g2rypg .verse:hover{background-color:var(--color-verse-background-hover)}.scripture-text.svelte-1g2rypg .verse-number{font-weight:var(--font-weight-bold);color:var(--color-verse-number);font-size:var(--font-size-sm);min-width:20px;text-align:right;flex-shrink:0;margin-top:2px}.loading-state.svelte-1g2rypg{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--spacing-4);height:200px;color:var(--color-text-secondary)}@media(max-width: 768px){.scripture-header.svelte-1g2rypg{padding:var(--spacing-3)}.scripture-title.svelte-1g2rypg{font-size:var(--font-size-lg)}.scripture-content.svelte-1g2rypg{padding:var(--spacing-3)}.scripture-text.svelte-1g2rypg{font-size:var(--font-size-md)}}",
  map: `{"version":3,"file":"ScripturePanel.svelte","sources":["ScripturePanel.svelte"],"sourcesContent":["<script>\\n  import { scripture, loadingResources } from '$lib/stores/resources.js';\\n  \\n  export let reference;\\n  export let handleVerseClick;\\n  \\n  $: isLoading = $loadingResources.has('scripture');\\n  \\n  // Mock scripture data for demo\\n  $: mockScripture = \`\\n    <div class=\\"verse\\" data-verse=\\"1\\">\\n      <span class=\\"verse-number\\">1</span>\\n      In the beginning, God created the heavens and the earth.\\n    </div>\\n    <div class=\\"verse\\" data-verse=\\"2\\">\\n      <span class=\\"verse-number\\">2</span>\\n      The earth was without form and void, and darkness was over the face of the deep.\\n    </div>\\n    <div class=\\"verse\\" data-verse=\\"3\\">\\n      <span class=\\"verse-number\\">3</span>\\n      And God said, \\"Let there be light,\\" and there was light.\\n    </div>\\n  \`;\\n  \\n  function handleVerseClickLocal(event) {\\n    const verseElement = event.target.closest('.verse');\\n    if (verseElement) {\\n      const verseNumber = verseElement.dataset.verse;\\n      handleVerseClick(parseInt(verseNumber));\\n    }\\n  }\\n<\/script>\\n\\n<div class=\\"scripture-panel\\">\\n  <div class=\\"scripture-header\\">\\n    <h2 class=\\"scripture-title\\">\\n      {reference.bookId} {reference.chapter}:{reference.verse}\\n    </h2>\\n    {#if isLoading}\\n      <div class=\\"loading-indicator\\">\\n        <div class=\\"loading-spinner\\"></div>\\n      </div>\\n    {/if}\\n  </div>\\n  \\n  <div class=\\"scripture-content\\">\\n    {#if isLoading}\\n      <div class=\\"loading-state\\">\\n        <div class=\\"loading-spinner\\"></div>\\n        <p>Loading scripture...</p>\\n      </div>\\n    {:else if $scripture}\\n      <div class=\\"scripture-text\\" on:click={handleVerseClickLocal}>\\n        {@html $scripture}\\n      </div>\\n    {:else}\\n      <div class=\\"scripture-text\\" on:click={handleVerseClickLocal}>\\n        {@html mockScripture}\\n      </div>\\n    {/if}\\n  </div>\\n</div>\\n\\n<style>\\n  .scripture-panel {\\n    display: flex;\\n    flex-direction: column;\\n    height: 100%;\\n    background-color: var(--color-surface);\\n    border-radius: var(--radius-lg);\\n    overflow: hidden;\\n  }\\n\\n  .scripture-header {\\n    display: flex;\\n    align-items: center;\\n    justify-content: space-between;\\n    padding: var(--spacing-4);\\n    background-color: var(--color-surface-secondary);\\n    border-bottom: 1px solid var(--color-border);\\n  }\\n\\n  .scripture-title {\\n    margin: 0;\\n    font-size: var(--font-size-xl);\\n    font-weight: var(--font-weight-bold);\\n    color: var(--color-text);\\n    font-family: var(--font-family-heading);\\n  }\\n\\n  .loading-indicator {\\n    display: flex;\\n    align-items: center;\\n    gap: var(--spacing-2);\\n  }\\n\\n  .scripture-content {\\n    flex: 1;\\n    padding: var(--spacing-4);\\n    overflow-y: auto;\\n    background-color: var(--color-surface);\\n  }\\n\\n  .scripture-text {\\n    line-height: var(--line-height-relaxed);\\n    font-size: var(--font-size-md);\\n    color: var(--color-text);\\n  }\\n\\n  .scripture-text :global(.verse) {\\n    margin-bottom: var(--spacing-3);\\n    padding: var(--spacing-2);\\n    border-radius: var(--radius-sm);\\n    cursor: pointer;\\n    transition: all var(--transition-fast);\\n    min-height: var(--verse-min-height);\\n    display: flex;\\n    align-items: flex-start;\\n    gap: var(--spacing-2);\\n  }\\n\\n  .scripture-text :global(.verse:hover) {\\n    background-color: var(--color-verse-background-hover);\\n  }\\n\\n  .scripture-text :global(.verse-number) {\\n    font-weight: var(--font-weight-bold);\\n    color: var(--color-verse-number);\\n    font-size: var(--font-size-sm);\\n    min-width: 20px;\\n    text-align: right;\\n    flex-shrink: 0;\\n    margin-top: 2px;\\n  }\\n\\n  .loading-state {\\n    display: flex;\\n    flex-direction: column;\\n    align-items: center;\\n    justify-content: center;\\n    gap: var(--spacing-4);\\n    height: 200px;\\n    color: var(--color-text-secondary);\\n  }\\n\\n  /* Mobile responsive */\\n  @media (max-width: 768px) {\\n    .scripture-header {\\n      padding: var(--spacing-3);\\n    }\\n\\n    .scripture-title {\\n      font-size: var(--font-size-lg);\\n    }\\n\\n    .scripture-content {\\n      padding: var(--spacing-3);\\n    }\\n\\n    .scripture-text {\\n      font-size: var(--font-size-md);\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AAgEE,+BAAiB,CACf,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,IAAI,eAAe,CAAC,CACtC,aAAa,CAAE,IAAI,WAAW,CAAC,CAC/B,QAAQ,CAAE,MACZ,CAEA,gCAAkB,CAChB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,aAAa,CAC9B,OAAO,CAAE,IAAI,WAAW,CAAC,CACzB,gBAAgB,CAAE,IAAI,yBAAyB,CAAC,CAChD,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAC7C,CAEA,+BAAiB,CACf,MAAM,CAAE,CAAC,CACT,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,WAAW,CAAE,IAAI,kBAAkB,CAAC,CACpC,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,WAAW,CAAE,IAAI,qBAAqB,CACxC,CAEA,iCAAmB,CACjB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,IAAI,WAAW,CACtB,CAEA,iCAAmB,CACjB,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,IAAI,WAAW,CAAC,CACzB,UAAU,CAAE,IAAI,CAChB,gBAAgB,CAAE,IAAI,eAAe,CACvC,CAEA,8BAAgB,CACd,WAAW,CAAE,IAAI,qBAAqB,CAAC,CACvC,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,KAAK,CAAE,IAAI,YAAY,CACzB,CAEA,8BAAe,CAAS,MAAQ,CAC9B,aAAa,CAAE,IAAI,WAAW,CAAC,CAC/B,OAAO,CAAE,IAAI,WAAW,CAAC,CACzB,aAAa,CAAE,IAAI,WAAW,CAAC,CAC/B,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,GAAG,CAAC,IAAI,iBAAiB,CAAC,CACtC,UAAU,CAAE,IAAI,kBAAkB,CAAC,CACnC,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,UAAU,CACvB,GAAG,CAAE,IAAI,WAAW,CACtB,CAEA,8BAAe,CAAS,YAAc,CACpC,gBAAgB,CAAE,IAAI,8BAA8B,CACtD,CAEA,8BAAe,CAAS,aAAe,CACrC,WAAW,CAAE,IAAI,kBAAkB,CAAC,CACpC,KAAK,CAAE,IAAI,oBAAoB,CAAC,CAChC,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,KAAK,CACjB,WAAW,CAAE,CAAC,CACd,UAAU,CAAE,GACd,CAEA,6BAAe,CACb,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,GAAG,CAAE,IAAI,WAAW,CAAC,CACrB,MAAM,CAAE,KAAK,CACb,KAAK,CAAE,IAAI,sBAAsB,CACnC,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,gCAAkB,CAChB,OAAO,CAAE,IAAI,WAAW,CAC1B,CAEA,+BAAiB,CACf,SAAS,CAAE,IAAI,cAAc,CAC/B,CAEA,iCAAmB,CACjB,OAAO,CAAE,IAAI,WAAW,CAC1B,CAEA,8BAAgB,CACd,SAAS,CAAE,IAAI,cAAc,CAC/B,CACF"}`
};
const ScripturePanel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isLoading;
  let mockScripture;
  let $loadingResources, $$unsubscribe_loadingResources;
  let $scripture, $$unsubscribe_scripture;
  $$unsubscribe_loadingResources = subscribe(loadingResources, (value) => $loadingResources = value);
  $$unsubscribe_scripture = subscribe(scripture, (value) => $scripture = value);
  let { reference: reference2 } = $$props;
  let { handleVerseClick: handleVerseClick2 } = $$props;
  if ($$props.reference === void 0 && $$bindings.reference && reference2 !== void 0) $$bindings.reference(reference2);
  if ($$props.handleVerseClick === void 0 && $$bindings.handleVerseClick && handleVerseClick2 !== void 0) $$bindings.handleVerseClick(handleVerseClick2);
  $$result.css.add(css$6);
  isLoading = $loadingResources.has("scripture");
  mockScripture = `
    <div class="verse" data-verse="1">
      <span class="verse-number">1</span>
      In the beginning, God created the heavens and the earth.
    </div>
    <div class="verse" data-verse="2">
      <span class="verse-number">2</span>
      The earth was without form and void, and darkness was over the face of the deep.
    </div>
    <div class="verse" data-verse="3">
      <span class="verse-number">3</span>
      And God said, "Let there be light," and there was light.
    </div>
  `;
  $$unsubscribe_loadingResources();
  $$unsubscribe_scripture();
  return `<div class="scripture-panel svelte-1g2rypg"><div class="scripture-header svelte-1g2rypg"><h2 class="scripture-title svelte-1g2rypg">${escape(reference2.bookId)} ${escape(reference2.chapter)}:${escape(reference2.verse)}</h2> ${isLoading ? `<div class="loading-indicator svelte-1g2rypg" data-svelte-h="svelte-1pgak15"><div class="loading-spinner"></div></div>` : ``}</div> <div class="scripture-content svelte-1g2rypg">${isLoading ? `<div class="loading-state svelte-1g2rypg" data-svelte-h="svelte-tcg3gl"><div class="loading-spinner"></div> <p>Loading scripture...</p></div>` : `${$scripture ? `<div class="scripture-text svelte-1g2rypg"><!-- HTML_TAG_START -->${$scripture}<!-- HTML_TAG_END --></div>` : `<div class="scripture-text svelte-1g2rypg"><!-- HTML_TAG_START -->${mockScripture}<!-- HTML_TAG_END --></div>`}`}</div> </div>`;
});
const css$5 = {
  code: ".helps-tabs.svelte-s3qv04{display:flex;flex-direction:column;height:100%;background-color:var(--color-surface);border-radius:var(--radius-lg);overflow:hidden}.tabs-header.svelte-s3qv04{background-color:var(--color-surface-secondary);border-bottom:1px solid var(--color-border);padding:var(--spacing-2)}.tabs-nav.svelte-s3qv04{display:flex;gap:var(--spacing-1)}.tab-button.svelte-s3qv04{display:flex;align-items:center;gap:var(--spacing-2);padding:var(--spacing-2) var(--spacing-3);border:1px solid var(--color-border);border-radius:var(--radius-md);background-color:var(--color-surface);color:var(--color-text-secondary);cursor:pointer;transition:all var(--transition-fast);font-size:var(--font-size-sm);font-weight:var(--font-weight-medium)}.tab-button.svelte-s3qv04:hover{background-color:var(--color-surface-hover);color:var(--color-text);border-color:var(--color-border-hover)}.tab-active.svelte-s3qv04{background-color:var(--color-primary);color:var(--color-text-on-primary);border-color:var(--color-primary)}.tab-active.svelte-s3qv04:hover{background-color:var(--color-primary-hover);border-color:var(--color-primary-hover)}.tab-icon.svelte-s3qv04{font-size:var(--font-size-md)}.tab-content.svelte-s3qv04{flex:1;padding:var(--spacing-4);overflow-y:auto}.content-list.svelte-s3qv04{display:flex;flex-direction:column;gap:var(--spacing-3)}.content-item.svelte-s3qv04{padding:var(--spacing-3);background-color:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md)}.item-title.svelte-s3qv04{margin:0 0 var(--spacing-2) 0;font-size:var(--font-size-md);font-weight:var(--font-weight-semibold);color:var(--color-text)}.item-content.svelte-s3qv04{margin:0 0 var(--spacing-2) 0;line-height:var(--line-height-relaxed);color:var(--color-text)}.item-meta.svelte-s3qv04{font-size:var(--font-size-xs);color:var(--color-text-secondary);font-style:italic}.loading-state.svelte-s3qv04,.empty-state.svelte-s3qv04{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--spacing-4);height:200px;color:var(--color-text-secondary)}@media(max-width: 768px){.tabs-header.svelte-s3qv04{padding:var(--spacing-1)}.tab-button.svelte-s3qv04{padding:var(--spacing-2);font-size:var(--font-size-xs)}.tab-label.svelte-s3qv04{display:none}.tab-content.svelte-s3qv04{padding:var(--spacing-3)}.content-item.svelte-s3qv04{padding:var(--spacing-2)}.item-title.svelte-s3qv04{font-size:var(--font-size-sm)}}",
  map: `{"version":3,"file":"HelpsTabs.svelte","sources":["HelpsTabs.svelte"],"sourcesContent":["<script>\\n  import { notes, questions, words, loadingResources } from '$lib/stores/resources.js';\\n  \\n  export let reference;\\n  \\n  let activeTab = 'notes';\\n  \\n  const tabs = [\\n    { id: 'notes', label: 'Notes', icon: '📝' },\\n    { id: 'questions', label: 'Questions', icon: '❓' },\\n    { id: 'words', label: 'Words', icon: '📚' }\\n  ];\\n  \\n  function setActiveTab(tabId) {\\n    activeTab = tabId;\\n  }\\n  \\n  // Mock data for demo\\n  const mockNotes = [\\n    {\\n      id: 'note1',\\n      verse: 1,\\n      title: 'In the beginning',\\n      content: 'This phrase indicates the start of all creation. It establishes God as the Creator of everything.'\\n    },\\n    {\\n      id: 'note2',\\n      verse: 2,\\n      title: 'without form and void',\\n      content: 'The Hebrew words \\"tohu wabohu\\" describe a state of emptiness and chaos before God brought order.'\\n    }\\n  ];\\n  \\n  const mockQuestions = [\\n    {\\n      id: 'q1',\\n      verse: 1,\\n      question: 'What did God create in the beginning?',\\n      answer: 'God created the heavens and the earth.'\\n    },\\n    {\\n      id: 'q2',\\n      verse: 3,\\n      question: 'What was the first thing God spoke into existence?',\\n      answer: 'Light was the first thing God spoke into existence.'\\n    }\\n  ];\\n  \\n  const mockWords = [\\n    {\\n      id: 'word1',\\n      term: 'God',\\n      definition: 'The supreme being who created and rules over all things.',\\n      references: ['Genesis 1:1']\\n    },\\n    {\\n      id: 'word2',\\n      term: 'heavens',\\n      definition: 'The sky, space, and spiritual realm where God dwells.',\\n      references: ['Genesis 1:1']\\n    }\\n  ];\\n  \\n  $: currentData = activeTab === 'notes' ? ($notes.length ? $notes : mockNotes) :\\n                   activeTab === 'questions' ? ($questions.length ? $questions : mockQuestions) :\\n                   activeTab === 'words' ? ($words.length ? $words : mockWords) : [];\\n  \\n  $: isLoading = $loadingResources.has(activeTab);\\n<\/script>\\n\\n<div class=\\"helps-tabs\\">\\n  <div class=\\"tabs-header\\">\\n    <div class=\\"tabs-nav\\">\\n      {#each tabs as tab}\\n        <button \\n          class=\\"tab-button\\"\\n          class:tab-active={activeTab === tab.id}\\n          on:click={() => setActiveTab(tab.id)}\\n        >\\n          <span class=\\"tab-icon\\">{tab.icon}</span>\\n          <span class=\\"tab-label\\">{tab.label}</span>\\n        </button>\\n      {/each}\\n    </div>\\n  </div>\\n  \\n  <div class=\\"tab-content\\">\\n    {#if isLoading}\\n      <div class=\\"loading-state\\">\\n        <div class=\\"loading-spinner\\"></div>\\n        <p>Loading {activeTab}...</p>\\n      </div>\\n    {:else if currentData.length === 0}\\n      <div class=\\"empty-state\\">\\n        <p>No {activeTab} available for this verse.</p>\\n      </div>\\n    {:else}\\n      <div class=\\"content-list\\">\\n        {#each currentData as item}\\n          <div class=\\"content-item card\\">\\n            {#if activeTab === 'notes'}\\n              <h4 class=\\"item-title\\">{item.title}</h4>\\n              <p class=\\"item-content\\">{item.content}</p>\\n              <div class=\\"item-meta\\">Verse {item.verse}</div>\\n            {:else if activeTab === 'questions'}\\n              <h4 class=\\"item-title\\">{item.question}</h4>\\n              <p class=\\"item-content\\">{item.answer}</p>\\n              <div class=\\"item-meta\\">Verse {item.verse}</div>\\n            {:else if activeTab === 'words'}\\n              <h4 class=\\"item-title\\">{item.term}</h4>\\n              <p class=\\"item-content\\">{item.definition}</p>\\n              <div class=\\"item-meta\\">\\n                {#if item.references}\\n                  References: {item.references.join(', ')}\\n                {/if}\\n              </div>\\n            {/if}\\n          </div>\\n        {/each}\\n      </div>\\n    {/if}\\n  </div>\\n</div>\\n\\n<style>\\n  .helps-tabs {\\n    display: flex;\\n    flex-direction: column;\\n    height: 100%;\\n    background-color: var(--color-surface);\\n    border-radius: var(--radius-lg);\\n    overflow: hidden;\\n  }\\n\\n  .tabs-header {\\n    background-color: var(--color-surface-secondary);\\n    border-bottom: 1px solid var(--color-border);\\n    padding: var(--spacing-2);\\n  }\\n\\n  .tabs-nav {\\n    display: flex;\\n    gap: var(--spacing-1);\\n  }\\n\\n  .tab-button {\\n    display: flex;\\n    align-items: center;\\n    gap: var(--spacing-2);\\n    padding: var(--spacing-2) var(--spacing-3);\\n    border: 1px solid var(--color-border);\\n    border-radius: var(--radius-md);\\n    background-color: var(--color-surface);\\n    color: var(--color-text-secondary);\\n    cursor: pointer;\\n    transition: all var(--transition-fast);\\n    font-size: var(--font-size-sm);\\n    font-weight: var(--font-weight-medium);\\n  }\\n\\n  .tab-button:hover {\\n    background-color: var(--color-surface-hover);\\n    color: var(--color-text);\\n    border-color: var(--color-border-hover);\\n  }\\n\\n  .tab-active {\\n    background-color: var(--color-primary);\\n    color: var(--color-text-on-primary);\\n    border-color: var(--color-primary);\\n  }\\n\\n  .tab-active:hover {\\n    background-color: var(--color-primary-hover);\\n    border-color: var(--color-primary-hover);\\n  }\\n\\n  .tab-icon {\\n    font-size: var(--font-size-md);\\n  }\\n\\n  .tab-content {\\n    flex: 1;\\n    padding: var(--spacing-4);\\n    overflow-y: auto;\\n  }\\n\\n  .content-list {\\n    display: flex;\\n    flex-direction: column;\\n    gap: var(--spacing-3);\\n  }\\n\\n  .content-item {\\n    padding: var(--spacing-3);\\n    background-color: var(--color-surface);\\n    border: 1px solid var(--color-border);\\n    border-radius: var(--radius-md);\\n  }\\n\\n  .item-title {\\n    margin: 0 0 var(--spacing-2) 0;\\n    font-size: var(--font-size-md);\\n    font-weight: var(--font-weight-semibold);\\n    color: var(--color-text);\\n  }\\n\\n  .item-content {\\n    margin: 0 0 var(--spacing-2) 0;\\n    line-height: var(--line-height-relaxed);\\n    color: var(--color-text);\\n  }\\n\\n  .item-meta {\\n    font-size: var(--font-size-xs);\\n    color: var(--color-text-secondary);\\n    font-style: italic;\\n  }\\n\\n  .loading-state,\\n  .empty-state {\\n    display: flex;\\n    flex-direction: column;\\n    align-items: center;\\n    justify-content: center;\\n    gap: var(--spacing-4);\\n    height: 200px;\\n    color: var(--color-text-secondary);\\n  }\\n\\n  /* Mobile responsive */\\n  @media (max-width: 768px) {\\n    .tabs-header {\\n      padding: var(--spacing-1);\\n    }\\n\\n    .tab-button {\\n      padding: var(--spacing-2);\\n      font-size: var(--font-size-xs);\\n    }\\n\\n    .tab-label {\\n      display: none;\\n    }\\n\\n    .tab-content {\\n      padding: var(--spacing-3);\\n    }\\n\\n    .content-item {\\n      padding: var(--spacing-2);\\n    }\\n\\n    .item-title {\\n      font-size: var(--font-size-sm);\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AA6HE,yBAAY,CACV,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,IAAI,eAAe,CAAC,CACtC,aAAa,CAAE,IAAI,WAAW,CAAC,CAC/B,QAAQ,CAAE,MACZ,CAEA,0BAAa,CACX,gBAAgB,CAAE,IAAI,yBAAyB,CAAC,CAChD,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CAC5C,OAAO,CAAE,IAAI,WAAW,CAC1B,CAEA,uBAAU,CACR,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,IAAI,WAAW,CACtB,CAEA,yBAAY,CACV,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,IAAI,WAAW,CAAC,CACrB,OAAO,CAAE,IAAI,WAAW,CAAC,CAAC,IAAI,WAAW,CAAC,CAC1C,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,aAAa,CAAE,IAAI,WAAW,CAAC,CAC/B,gBAAgB,CAAE,IAAI,eAAe,CAAC,CACtC,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,GAAG,CAAC,IAAI,iBAAiB,CAAC,CACtC,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,WAAW,CAAE,IAAI,oBAAoB,CACvC,CAEA,yBAAW,MAAO,CAChB,gBAAgB,CAAE,IAAI,qBAAqB,CAAC,CAC5C,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,YAAY,CAAE,IAAI,oBAAoB,CACxC,CAEA,yBAAY,CACV,gBAAgB,CAAE,IAAI,eAAe,CAAC,CACtC,KAAK,CAAE,IAAI,uBAAuB,CAAC,CACnC,YAAY,CAAE,IAAI,eAAe,CACnC,CAEA,yBAAW,MAAO,CAChB,gBAAgB,CAAE,IAAI,qBAAqB,CAAC,CAC5C,YAAY,CAAE,IAAI,qBAAqB,CACzC,CAEA,uBAAU,CACR,SAAS,CAAE,IAAI,cAAc,CAC/B,CAEA,0BAAa,CACX,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,IAAI,WAAW,CAAC,CACzB,UAAU,CAAE,IACd,CAEA,2BAAc,CACZ,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,IAAI,WAAW,CACtB,CAEA,2BAAc,CACZ,OAAO,CAAE,IAAI,WAAW,CAAC,CACzB,gBAAgB,CAAE,IAAI,eAAe,CAAC,CACtC,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,aAAa,CAAE,IAAI,WAAW,CAChC,CAEA,yBAAY,CACV,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,WAAW,CAAC,CAAC,CAAC,CAC9B,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,WAAW,CAAE,IAAI,sBAAsB,CAAC,CACxC,KAAK,CAAE,IAAI,YAAY,CACzB,CAEA,2BAAc,CACZ,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,WAAW,CAAC,CAAC,CAAC,CAC9B,WAAW,CAAE,IAAI,qBAAqB,CAAC,CACvC,KAAK,CAAE,IAAI,YAAY,CACzB,CAEA,wBAAW,CACT,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,UAAU,CAAE,MACd,CAEA,4BAAc,CACd,0BAAa,CACX,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,GAAG,CAAE,IAAI,WAAW,CAAC,CACrB,MAAM,CAAE,KAAK,CACb,KAAK,CAAE,IAAI,sBAAsB,CACnC,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,0BAAa,CACX,OAAO,CAAE,IAAI,WAAW,CAC1B,CAEA,yBAAY,CACV,OAAO,CAAE,IAAI,WAAW,CAAC,CACzB,SAAS,CAAE,IAAI,cAAc,CAC/B,CAEA,wBAAW,CACT,OAAO,CAAE,IACX,CAEA,0BAAa,CACX,OAAO,CAAE,IAAI,WAAW,CAC1B,CAEA,2BAAc,CACZ,OAAO,CAAE,IAAI,WAAW,CAC1B,CAEA,yBAAY,CACV,SAAS,CAAE,IAAI,cAAc,CAC/B,CACF"}`
};
const HelpsTabs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentData;
  let isLoading;
  let $loadingResources, $$unsubscribe_loadingResources;
  let $$unsubscribe_words;
  let $$unsubscribe_questions;
  let $notes, $$unsubscribe_notes;
  $$unsubscribe_loadingResources = subscribe(loadingResources, (value) => $loadingResources = value);
  $$unsubscribe_words = subscribe(words, (value) => value);
  $$unsubscribe_questions = subscribe(questions, (value) => value);
  $$unsubscribe_notes = subscribe(notes, (value) => $notes = value);
  let { reference: reference2 } = $$props;
  let activeTab = "notes";
  const tabs = [
    { id: "notes", label: "Notes", icon: "📝" },
    {
      id: "questions",
      label: "Questions",
      icon: "❓"
    },
    { id: "words", label: "Words", icon: "📚" }
  ];
  const mockNotes = [
    {
      id: "note1",
      verse: 1,
      title: "In the beginning",
      content: "This phrase indicates the start of all creation. It establishes God as the Creator of everything."
    },
    {
      id: "note2",
      verse: 2,
      title: "without form and void",
      content: 'The Hebrew words "tohu wabohu" describe a state of emptiness and chaos before God brought order.'
    }
  ];
  if ($$props.reference === void 0 && $$bindings.reference && reference2 !== void 0) $$bindings.reference(reference2);
  $$result.css.add(css$5);
  currentData = $notes.length ? $notes : mockNotes;
  isLoading = $loadingResources.has(activeTab);
  $$unsubscribe_loadingResources();
  $$unsubscribe_words();
  $$unsubscribe_questions();
  $$unsubscribe_notes();
  return `<div class="helps-tabs svelte-s3qv04"><div class="tabs-header svelte-s3qv04"><div class="tabs-nav svelte-s3qv04">${each(tabs, (tab) => {
    return `<button class="${["tab-button svelte-s3qv04", activeTab === tab.id ? "tab-active" : ""].join(" ").trim()}"><span class="tab-icon svelte-s3qv04">${escape(tab.icon)}</span> <span class="tab-label svelte-s3qv04">${escape(tab.label)}</span> </button>`;
  })}</div></div> <div class="tab-content svelte-s3qv04">${isLoading ? `<div class="loading-state svelte-s3qv04"><div class="loading-spinner"></div> <p>Loading ${escape(activeTab)}...</p></div>` : `${currentData.length === 0 ? `<div class="empty-state svelte-s3qv04"><p>No ${escape(activeTab)} available for this verse.</p></div>` : `<div class="content-list svelte-s3qv04">${each(currentData, (item) => {
    return `<div class="content-item card svelte-s3qv04">${`<h4 class="item-title svelte-s3qv04">${escape(item.title)}</h4> <p class="item-content svelte-s3qv04">${escape(item.content)}</p> <div class="item-meta svelte-s3qv04">Verse ${escape(item.verse)}</div>`} </div>`;
  })}</div>`}`}</div> </div>`;
});
const css$4 = {
  code: ".theme-toggle.svelte-bv3rmt{display:flex;align-items:center;gap:var(--spacing-2);padding:var(--spacing-2) var(--spacing-3);border:1px solid var(--color-border);border-radius:var(--radius-md);background-color:var(--color-surface);color:var(--color-text);cursor:pointer;transition:all var(--transition-fast);font-size:var(--font-size-sm)}.theme-toggle.svelte-bv3rmt:hover{background-color:var(--color-surface-hover);border-color:var(--color-border-hover);transform:translateY(-1px);box-shadow:var(--shadow-sm)}.theme-toggle.svelte-bv3rmt:active{transform:translateY(0)}.icon.svelte-bv3rmt{width:16px;height:16px;stroke-width:2}.theme-text.svelte-bv3rmt{font-weight:var(--font-weight-medium)}@media(max-width: 768px){.theme-text.svelte-bv3rmt{display:none}.theme-toggle.svelte-bv3rmt{padding:var(--spacing-2);min-width:var(--touch-target-min);min-height:var(--touch-target-min);justify-content:center}}",
  map: `{"version":3,"file":"ThemeToggle.svelte","sources":["ThemeToggle.svelte"],"sourcesContent":["<script>\\n  import { themeStore } from '$lib/stores/theme.js';\\n  \\n  const { isDark, toggleTheme } = themeStore;\\n<\/script>\\n\\n<button \\n  class=\\"theme-toggle btn btn-secondary\\"\\n  on:click={toggleTheme}\\n  title={$isDark ? 'Switch to light mode' : 'Switch to dark mode'}\\n  aria-label={$isDark ? 'Switch to light mode' : 'Switch to dark mode'}\\n>\\n  {#if $isDark}\\n    <svg class=\\"icon\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\">\\n      <circle cx=\\"12\\" cy=\\"12\\" r=\\"5\\"/>\\n      <line x1=\\"12\\" y1=\\"1\\" x2=\\"12\\" y2=\\"3\\"/>\\n      <line x1=\\"12\\" y1=\\"21\\" x2=\\"12\\" y2=\\"23\\"/>\\n      <line x1=\\"4.22\\" y1=\\"4.22\\" x2=\\"5.64\\" y2=\\"5.64\\"/>\\n      <line x1=\\"18.36\\" y1=\\"18.36\\" x2=\\"19.78\\" y2=\\"19.78\\"/>\\n      <line x1=\\"1\\" y1=\\"12\\" x2=\\"3\\" y2=\\"12\\"/>\\n      <line x1=\\"21\\" y1=\\"12\\" x2=\\"23\\" y2=\\"12\\"/>\\n      <line x1=\\"4.22\\" y1=\\"19.78\\" x2=\\"5.64\\" y2=\\"18.36\\"/>\\n      <line x1=\\"18.36\\" y1=\\"5.64\\" x2=\\"19.78\\" y2=\\"4.22\\"/>\\n    </svg>\\n  {:else}\\n    <svg class=\\"icon\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\">\\n      <path d=\\"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z\\"/>\\n    </svg>\\n  {/if}\\n  \\n  <span class=\\"theme-text\\">\\n    {$isDark ? 'Light' : 'Dark'}\\n  </span>\\n</button>\\n\\n<style>\\n  .theme-toggle {\\n    display: flex;\\n    align-items: center;\\n    gap: var(--spacing-2);\\n    padding: var(--spacing-2) var(--spacing-3);\\n    border: 1px solid var(--color-border);\\n    border-radius: var(--radius-md);\\n    background-color: var(--color-surface);\\n    color: var(--color-text);\\n    cursor: pointer;\\n    transition: all var(--transition-fast);\\n    font-size: var(--font-size-sm);\\n  }\\n\\n  .theme-toggle:hover {\\n    background-color: var(--color-surface-hover);\\n    border-color: var(--color-border-hover);\\n    transform: translateY(-1px);\\n    box-shadow: var(--shadow-sm);\\n  }\\n\\n  .theme-toggle:active {\\n    transform: translateY(0);\\n  }\\n\\n  .icon {\\n    width: 16px;\\n    height: 16px;\\n    stroke-width: 2;\\n  }\\n\\n  .theme-text {\\n    font-weight: var(--font-weight-medium);\\n  }\\n\\n  /* Mobile responsive */\\n  @media (max-width: 768px) {\\n    .theme-text {\\n      display: none;\\n    }\\n    \\n    .theme-toggle {\\n      padding: var(--spacing-2);\\n      min-width: var(--touch-target-min);\\n      min-height: var(--touch-target-min);\\n      justify-content: center;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AAoCE,2BAAc,CACZ,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,IAAI,WAAW,CAAC,CACrB,OAAO,CAAE,IAAI,WAAW,CAAC,CAAC,IAAI,WAAW,CAAC,CAC1C,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,aAAa,CAAE,IAAI,WAAW,CAAC,CAC/B,gBAAgB,CAAE,IAAI,eAAe,CAAC,CACtC,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,GAAG,CAAC,IAAI,iBAAiB,CAAC,CACtC,SAAS,CAAE,IAAI,cAAc,CAC/B,CAEA,2BAAa,MAAO,CAClB,gBAAgB,CAAE,IAAI,qBAAqB,CAAC,CAC5C,YAAY,CAAE,IAAI,oBAAoB,CAAC,CACvC,SAAS,CAAE,WAAW,IAAI,CAAC,CAC3B,UAAU,CAAE,IAAI,WAAW,CAC7B,CAEA,2BAAa,OAAQ,CACnB,SAAS,CAAE,WAAW,CAAC,CACzB,CAEA,mBAAM,CACJ,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,YAAY,CAAE,CAChB,CAEA,yBAAY,CACV,WAAW,CAAE,IAAI,oBAAoB,CACvC,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,yBAAY,CACV,OAAO,CAAE,IACX,CAEA,2BAAc,CACZ,OAAO,CAAE,IAAI,WAAW,CAAC,CACzB,SAAS,CAAE,IAAI,kBAAkB,CAAC,CAClC,UAAU,CAAE,IAAI,kBAAkB,CAAC,CACnC,eAAe,CAAE,MACnB,CACF"}`
};
const ThemeToggle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $isDark, $$unsubscribe_isDark;
  const { isDark: isDark2 } = themeStore;
  $$unsubscribe_isDark = subscribe(isDark2, (value) => $isDark = value);
  $$result.css.add(css$4);
  $$unsubscribe_isDark();
  return `<button class="theme-toggle btn btn-secondary svelte-bv3rmt"${add_attribute("title", $isDark ? "Switch to light mode" : "Switch to dark mode", 0)}${add_attribute("aria-label", $isDark ? "Switch to light mode" : "Switch to dark mode", 0)}>${$isDark ? `<svg class="icon svelte-bv3rmt" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : `<svg class="icon svelte-bv3rmt" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`} <span class="theme-text svelte-bv3rmt">${escape($isDark ? "Light" : "Dark")}</span> </button>`;
});
const css$3 = {
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
  $$result.css.add(css$3);
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
const css$2 = {
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
  $$result.css.add(css$2);
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
const css$1 = {
  code: ".main-view.svelte-utwg3m{display:flex;flex-direction:column;height:100vh;background-color:var(--color-background);color:var(--color-text)}.mobile-tab-nav.svelte-utwg3m{display:flex;background-color:var(--color-surface);border-bottom:1px solid var(--color-border);position:sticky;top:0;z-index:10}.mobile-tab.svelte-utwg3m{flex:1;padding:var(--spacing-3);border:none;background:transparent;color:var(--color-text-secondary);font-size:var(--font-size-md);cursor:pointer;transition:all var(--transition-fast)}.mobile-tab.svelte-utwg3m:hover{background-color:var(--color-surface-hover);color:var(--color-text)}.mobile-tab-active.svelte-utwg3m{color:var(--color-primary);background-color:var(--color-surface-secondary);border-bottom:2px solid var(--color-primary)}.content-area.svelte-utwg3m{display:flex;flex:1;overflow:hidden}.scripture-panel.svelte-utwg3m,.helps-panel.svelte-utwg3m{flex:1;display:flex;flex-direction:column;overflow:hidden}.scripture-panel.svelte-utwg3m{border-right:1px solid var(--color-border)}@media(max-width: 768px){.mobile-tab-nav.svelte-utwg3m{display:flex}.content-area.svelte-utwg3m{position:relative}.scripture-panel.svelte-utwg3m,.helps-panel.svelte-utwg3m{position:absolute;top:0;left:0;right:0;bottom:0;opacity:0;transform:translateX(100%);transition:all var(--transition-normal);pointer-events:none}.mobile-panel-active.svelte-utwg3m{opacity:1;transform:translateX(0);pointer-events:auto}.scripture-panel.svelte-utwg3m{border-right:none}}@media(min-width: 769px){.mobile-tab-nav.svelte-utwg3m{display:none}.scripture-panel.svelte-utwg3m,.helps-panel.svelte-utwg3m{position:static;opacity:1;transform:none;pointer-events:auto}}",
  map: `{"version":3,"file":"MainView.svelte","sources":["MainView.svelte"],"sourcesContent":["<script>\\n  import { reference, organization, languageId, updateContext } from '$lib/stores/reference.js';\\n  import { activateResource } from '$lib/stores/resources.js';\\n  import ScripturePanel from './ScripturePanel.svelte';\\n  import HelpsTabs from './HelpsTabs.svelte';\\n  import NavigationBar from './NavigationBar.svelte';\\n  \\n  let activeHelpsTab = \\"tn\\";\\n  let activeMobileTab = \\"scripture\\";\\n  let helpsTabsRef;\\n\\n  function handleVerseClick(verseNum) {\\n    // Verse clicks are now pure CSS highlighting operations\\n    console.log(\\"Verse clicked:\\", verseNum, \\"(highlighting handled locally)\\");\\n  }\\n\\n  // Handle rc:// link clicks to open article tabs or switch to appropriate internal tabs\\n  async function handleRcLinkClick(rcUri, contextLanguageId, contextOrganization) {\\n    if (!rcUri || !rcUri.startsWith(\\"rc://\\")) {\\n      console.warn(\\"Invalid rc:// URI:\\", rcUri);\\n      return;\\n    }\\n\\n    // Use provided context or fall back to default context\\n    const effectiveLanguageId = contextLanguageId || $languageId || \\"en\\";\\n    const effectiveOrganization = contextOrganization || $organization || \\"unfoldingWord\\";\\n\\n    // Parse the rc:// URI to determine the appropriate tab\\n    const uriParts = rcUri.split(\\"/\\");\\n    if (uriParts.length < 4) {\\n      console.warn(\\"Malformed rc:// URI:\\", rcUri);\\n      return;\\n    }\\n\\n    const rcLanguageId = uriParts[2]; // Language from RC link\\n    const resourceType = uriParts[3]; // tw, tn, tq, etc.\\n    const rcPath = uriParts[4]; // help, kt, etc.\\n\\n    // Check if this is a resource selection RC link (has /help/ path)\\n    const isResourceSelection = rcPath === 'help' && uriParts.length >= 7;\\n    \\n    if (isResourceSelection) {\\n      console.log('🔗 Handling resource selection RC link:', rcUri);\\n      \\n      // Map external resource IDs to internal resource types\\n      const resourceTypeMap = {\\n        'tn': 'notes',\\n        'tq': 'questions', \\n        'tw': 'words',\\n        'twl': 'links',\\n        'ta': 'ta'\\n      };\\n      \\n      const internalResourceType = resourceTypeMap[resourceType] || resourceType;\\n      \\n      console.log('📍 Setting mixed resource:', {\\n        externalType: resourceType,\\n        internalType: internalResourceType,\\n        languageId: rcLanguageId,\\n        organization: effectiveOrganization\\n      });\\n      \\n      // Update mixed resources configuration\\n      updateContext({\\n        mixedResources: {\\n          [internalResourceType]: {\\n            languageId: rcLanguageId,\\n            organization: effectiveOrganization,\\n            resourceId: resourceType\\n          }\\n        }\\n      });\\n      \\n      // Trigger resource reload with new configuration\\n      activateResource(internalResourceType);\\n      console.log(\`Resource \${internalResourceType} activated and will reload with new configuration\`);\\n      \\n      return;\\n    }\\n\\n    switch (resourceType) {\\n      case \\"tw\\":\\n        // For translation words, fetch the full article and open in new tab\\n        try {\\n          console.log(\\"Fetching TW article for:\\", rcUri);\\n          // TODO: Implement article loading\\n          // const article = await getArticle(rcUri, effectiveLanguageId, effectiveOrganization);\\n          \\n          // if (article && !article.error && helpsTabsRef) {\\n          //   console.log(\\"Opening TW article in new tab:\\", article.title);\\n          //   helpsTabsRef.openArticleTab(article);\\n          // }\\n        } catch (error) {\\n          console.error(\\"Error handling TW link:\\", error);\\n        }\\n        break;\\n      case \\"tn\\":\\n        console.log(\\"Translation Notes resource will self-activate\\");\\n        break;\\n      case \\"tq\\":\\n        console.log(\\"Translation Questions resource will self-activate\\");\\n        break;\\n      case \\"ta\\":\\n        // TODO: Implement Translation Academy article loading\\n        console.log(\\"Translation Academy link:\\", rcUri);\\n        break;\\n      default:\\n        // For other external resources, open in new tab\\n        console.log(\\"Opening external resource:\\", rcUri);\\n        break;\\n    }\\n  }\\n\\n  // Provide rc link handler to child components\\n  import { setContext } from 'svelte';\\n  setContext('rcLinkHandler', handleRcLinkClick);\\n<\/script>\\n\\n<main data-testid=\\"main-view\\" class=\\"main-view\\">\\n  <!-- Navigation Bar -->\\n  <NavigationBar />\\n  \\n  <!-- Mobile Tab Navigation -->\\n  <div class=\\"mobile-tab-nav\\">\\n    <button\\n      class=\\"mobile-tab\\"\\n      class:mobile-tab-active={activeMobileTab === \\"scripture\\"}\\n      on:click={() => activeMobileTab = \\"scripture\\"}\\n    >\\n      Scripture\\n    </button>\\n    <button\\n      class=\\"mobile-tab\\"\\n      class:mobile-tab-active={activeMobileTab === \\"resources\\"}\\n      on:click={() => activeMobileTab = \\"resources\\"}\\n    >\\n      Resources\\n    </button>\\n  </div>\\n  \\n  <!-- Main Content Area -->\\n  <div class=\\"content-area\\">\\n    <!-- Scripture Panel -->\\n    <div\\n      class=\\"scripture-panel\\"\\n      class:mobile-panel-active={activeMobileTab === \\"scripture\\"}\\n    >\\n      <ScripturePanel reference={$reference} {handleVerseClick} />\\n    </div>\\n\\n    <!-- Translation Helps -->\\n    <div\\n      class=\\"helps-panel\\"\\n      class:mobile-panel-active={activeMobileTab === \\"resources\\"}\\n    >\\n      <HelpsTabs bind:this={helpsTabsRef} reference={$reference} />\\n    </div>\\n  </div>\\n</main>\\n\\n<style>\\n  .main-view {\\n    display: flex;\\n    flex-direction: column;\\n    height: 100vh;\\n    background-color: var(--color-background);\\n    color: var(--color-text);\\n  }\\n\\n  .mobile-tab-nav {\\n    display: flex;\\n    background-color: var(--color-surface);\\n    border-bottom: 1px solid var(--color-border);\\n    position: sticky;\\n    top: 0;\\n    z-index: 10;\\n  }\\n\\n  .mobile-tab {\\n    flex: 1;\\n    padding: var(--spacing-3);\\n    border: none;\\n    background: transparent;\\n    color: var(--color-text-secondary);\\n    font-size: var(--font-size-md);\\n    cursor: pointer;\\n    transition: all var(--transition-fast);\\n  }\\n\\n  .mobile-tab:hover {\\n    background-color: var(--color-surface-hover);\\n    color: var(--color-text);\\n  }\\n\\n  .mobile-tab-active {\\n    color: var(--color-primary);\\n    background-color: var(--color-surface-secondary);\\n    border-bottom: 2px solid var(--color-primary);\\n  }\\n\\n  .content-area {\\n    display: flex;\\n    flex: 1;\\n    overflow: hidden;\\n  }\\n\\n  .scripture-panel,\\n  .helps-panel {\\n    flex: 1;\\n    display: flex;\\n    flex-direction: column;\\n    overflow: hidden;\\n  }\\n\\n  .scripture-panel {\\n    border-right: 1px solid var(--color-border);\\n  }\\n\\n  /* Mobile responsive design */\\n  @media (max-width: 768px) {\\n    .mobile-tab-nav {\\n      display: flex;\\n    }\\n\\n    .content-area {\\n      position: relative;\\n    }\\n\\n    .scripture-panel,\\n    .helps-panel {\\n      position: absolute;\\n      top: 0;\\n      left: 0;\\n      right: 0;\\n      bottom: 0;\\n      opacity: 0;\\n      transform: translateX(100%);\\n      transition: all var(--transition-normal);\\n      pointer-events: none;\\n    }\\n\\n    .mobile-panel-active {\\n      opacity: 1;\\n      transform: translateX(0);\\n      pointer-events: auto;\\n    }\\n\\n    .scripture-panel {\\n      border-right: none;\\n    }\\n  }\\n\\n  /* Desktop design */\\n  @media (min-width: 769px) {\\n    .mobile-tab-nav {\\n      display: none;\\n    }\\n\\n    .scripture-panel,\\n    .helps-panel {\\n      position: static;\\n      opacity: 1;\\n      transform: none;\\n      pointer-events: auto;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AAiKE,wBAAW,CACT,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,MAAM,CAAE,KAAK,CACb,gBAAgB,CAAE,IAAI,kBAAkB,CAAC,CACzC,KAAK,CAAE,IAAI,YAAY,CACzB,CAEA,6BAAgB,CACd,OAAO,CAAE,IAAI,CACb,gBAAgB,CAAE,IAAI,eAAe,CAAC,CACtC,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CAC5C,QAAQ,CAAE,MAAM,CAChB,GAAG,CAAE,CAAC,CACN,OAAO,CAAE,EACX,CAEA,yBAAY,CACV,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,IAAI,WAAW,CAAC,CACzB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,WAAW,CACvB,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,GAAG,CAAC,IAAI,iBAAiB,CACvC,CAEA,yBAAW,MAAO,CAChB,gBAAgB,CAAE,IAAI,qBAAqB,CAAC,CAC5C,KAAK,CAAE,IAAI,YAAY,CACzB,CAEA,gCAAmB,CACjB,KAAK,CAAE,IAAI,eAAe,CAAC,CAC3B,gBAAgB,CAAE,IAAI,yBAAyB,CAAC,CAChD,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,eAAe,CAC9C,CAEA,2BAAc,CACZ,OAAO,CAAE,IAAI,CACb,IAAI,CAAE,CAAC,CACP,QAAQ,CAAE,MACZ,CAEA,8BAAgB,CAChB,0BAAa,CACX,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,QAAQ,CAAE,MACZ,CAEA,8BAAiB,CACf,YAAY,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAC5C,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,6BAAgB,CACd,OAAO,CAAE,IACX,CAEA,2BAAc,CACZ,QAAQ,CAAE,QACZ,CAEA,8BAAgB,CAChB,0BAAa,CACX,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,CAAC,CACV,SAAS,CAAE,WAAW,IAAI,CAAC,CAC3B,UAAU,CAAE,GAAG,CAAC,IAAI,mBAAmB,CAAC,CACxC,cAAc,CAAE,IAClB,CAEA,kCAAqB,CACnB,OAAO,CAAE,CAAC,CACV,SAAS,CAAE,WAAW,CAAC,CAAC,CACxB,cAAc,CAAE,IAClB,CAEA,8BAAiB,CACf,YAAY,CAAE,IAChB,CACF,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,6BAAgB,CACd,OAAO,CAAE,IACX,CAEA,8BAAgB,CAChB,0BAAa,CACX,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,CAAC,CACV,SAAS,CAAE,IAAI,CACf,cAAc,CAAE,IAClB,CACF"}`
};
function handleVerseClick(verseNum) {
  console.log("Verse clicked:", verseNum, "(highlighting handled locally)");
}
const MainView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $organization, $$unsubscribe_organization;
  let $$unsubscribe_languageId;
  let $reference, $$unsubscribe_reference;
  $$unsubscribe_organization = subscribe(organization, (value) => $organization = value);
  $$unsubscribe_languageId = subscribe(languageId, (value) => value);
  $$unsubscribe_reference = subscribe(reference, (value) => $reference = value);
  let helpsTabsRef;
  async function handleRcLinkClick(rcUri, contextLanguageId, contextOrganization) {
    if (!rcUri || !rcUri.startsWith("rc://")) {
      console.warn("Invalid rc:// URI:", rcUri);
      return;
    }
    const effectiveOrganization = contextOrganization || $organization || "unfoldingWord";
    const uriParts = rcUri.split("/");
    if (uriParts.length < 4) {
      console.warn("Malformed rc:// URI:", rcUri);
      return;
    }
    const rcLanguageId = uriParts[2];
    const resourceType = uriParts[3];
    const rcPath = uriParts[4];
    const isResourceSelection = rcPath === "help" && uriParts.length >= 7;
    if (isResourceSelection) {
      console.log("🔗 Handling resource selection RC link:", rcUri);
      const resourceTypeMap = {
        "tn": "notes",
        "tq": "questions",
        "tw": "words",
        "twl": "links",
        "ta": "ta"
      };
      const internalResourceType = resourceTypeMap[resourceType] || resourceType;
      console.log("📍 Setting mixed resource:", {
        externalType: resourceType,
        internalType: internalResourceType,
        languageId: rcLanguageId,
        organization: effectiveOrganization
      });
      updateContext({
        mixedResources: {
          [internalResourceType]: {
            languageId: rcLanguageId,
            organization: effectiveOrganization,
            resourceId: resourceType
          }
        }
      });
      activateResource(internalResourceType);
      console.log(`Resource ${internalResourceType} activated and will reload with new configuration`);
      return;
    }
    switch (resourceType) {
      case "tw":
        try {
          console.log("Fetching TW article for:", rcUri);
        } catch (error) {
          console.error(
            "Error handling TW link:",
            error
          );
        }
        break;
      case "tn":
        console.log("Translation Notes resource will self-activate");
        break;
      case "tq":
        console.log("Translation Questions resource will self-activate");
        break;
      case "ta":
        console.log("Translation Academy link:", rcUri);
        break;
      default:
        console.log("Opening external resource:", rcUri);
        break;
    }
  }
  setContext("rcLinkHandler", handleRcLinkClick);
  $$result.css.add(css$1);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<main data-testid="main-view" class="main-view svelte-utwg3m"> ${validate_component(NavigationBar, "NavigationBar").$$render($$result, {}, {}, {})}  <div class="mobile-tab-nav svelte-utwg3m"><button class="${[
      "mobile-tab svelte-utwg3m",
      "mobile-tab-active"
    ].join(" ").trim()}" data-svelte-h="svelte-nafwyu">Scripture</button> <button class="${[
      "mobile-tab svelte-utwg3m",
      ""
    ].join(" ").trim()}" data-svelte-h="svelte-1rnn03o">Resources</button></div>  <div class="content-area svelte-utwg3m"> <div class="${[
      "scripture-panel svelte-utwg3m",
      "mobile-panel-active"
    ].join(" ").trim()}">${validate_component(ScripturePanel, "ScripturePanel").$$render($$result, { reference: $reference, handleVerseClick }, {}, {})}</div>  <div class="${[
      "helps-panel svelte-utwg3m",
      ""
    ].join(" ").trim()}">${validate_component(HelpsTabs, "HelpsTabs").$$render(
      $$result,
      {
        reference: $reference,
        this: helpsTabsRef
      },
      {
        this: ($$value) => {
          helpsTabsRef = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div></div> </main>`;
  } while (!$$settled);
  $$unsubscribe_organization();
  $$unsubscribe_languageId();
  $$unsubscribe_reference();
  return $$rendered;
});
const css = {
  code: "body{margin:0;padding:0;overflow:hidden}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  import { onMount } from 'svelte';\\n  import { referenceStore } from '$lib/stores/reference.js';\\n  import { resourcesStore } from '$lib/stores/resources.js';\\n  import { themeStore } from '$lib/stores/theme.js';\\n  \\n  import MainView from '$lib/components/MainView.svelte';\\n  \\n  onMount(() => {\\n    console.log('🚀 App: Starting initialization...');\\n    \\n    // Initialize stores\\n    themeStore.initializeTheme();\\n    console.log('✅ App: Theme initialized');\\n    \\n    referenceStore.initializeFromURL();\\n    console.log('✅ App: Reference store initialized');\\n    \\n    resourcesStore.initializeResourceLoader();\\n    console.log('✅ App: Resource loader initialized');\\n    \\n    console.log('🎉 App: All systems ready!');\\n    \\n    // Cleanup on unmount\\n    return () => {\\n      resourcesStore.cleanupResourceLoader();\\n      console.log('🧹 App: Cleanup complete');\\n    };\\n  });\\n<\/script>\\n\\n<svelte:head>\\n  <title>ETEN Innovation Lab Translation Helps</title>\\n  <meta name=\\"description\\" content=\\"Bible translation resources from ETEN Innovation Lab\\" />\\n</svelte:head>\\n\\n<MainView />\\n\\n<style>\\n  /* Page-specific styles if needed */\\n  :global(body) {\\n    margin: 0;\\n    padding: 0;\\n    overflow: hidden;\\n  }\\n</style>"],"names":[],"mappings":"AAwCU,IAAM,CACZ,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,MACZ"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-1v3fjp8_START -->${$$result.title = `<title>ETEN Innovation Lab Translation Helps</title>`, ""}<meta name="description" content="Bible translation resources from ETEN Innovation Lab"><!-- HEAD_svelte-1v3fjp8_END -->`, ""} ${validate_component(MainView, "MainView").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
