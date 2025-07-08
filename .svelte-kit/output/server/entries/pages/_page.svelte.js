import { g as get_store_value, c as create_ssr_component, a as subscribe, e as escape, v as validate_component, b as each, o as onDestroy, d as add_attribute, s as setContext } from "../../chunks/ssr.js";
import { r as reference, o as organization, l as languageId, a as resourceId, b as resourceOrganization, c as currentResourceData, m as mixedResources, i as isInitialized, d as referenceStore, N as NavigationBar, u as updateContext } from "../../chunks/NavigationBar.js";
import { d as derived, w as writable } from "../../chunks/index.js";
import "js-yaml";
const BASE_URL = "https://git.door43.org";
function rawBaseUrl(organization2, languageId2, resourceId2) {
  const repoName = resourceId2.startsWith(`${languageId2}_`) ? resourceId2 : `${languageId2}_${resourceId2}`;
  return `${BASE_URL}/${organization2}/${repoName}/raw/branch/master`;
}
async function fetchResourceFile(languageId2, resourceId2, filePath, organization2 = "unfoldingWord") {
  const url = `${rawBaseUrl(organization2, languageId2, resourceId2)}/${filePath}`;
  console.warn(`🌐 DCS Client: Fetching ${url}`);
  try {
    const res = await fetch(url);
    console.warn(`🌐 DCS Client: Response ${res.status} ${res.statusText} for ${url}`);
    if (!res.ok) {
      const errorMsg = `Failed to load ${filePath} for ${languageId2}_${resourceId2}: ${res.status} ${res.statusText}`;
      console.error(`❌ DCS Client: ${errorMsg}`);
      console.error(`❌ DCS Client: Full URL was: ${url}`);
      throw new Error(errorMsg);
    }
    const text = await res.text();
    console.warn(`✅ DCS Client: Successfully fetched ${filePath} (${text.length} chars) from ${organization2}`);
    return text;
  } catch (error) {
    console.error(`❌ DCS Client: Network error fetching ${url}:`, error);
    throw error;
  }
}
async function fetchBookWithFallback({
  bookId,
  organization: organization2 = "unfoldingWord",
  languageId: languageId2 = "en",
  resourceId: resourceId2 = "ult",
  resourceData = null
}) {
  console.warn(`🔍 Scripture Service: Fetching ${bookId} from ${organization2}/${languageId2}/${resourceId2}`);
  try {
    let filePath;
    if (resourceData && resourceData.ingredients) {
      const bookFile = resourceData.ingredients.find(
        (ingredient) => ingredient.identifier === bookId || ingredient.path?.includes(`${bookId}.usfm`) || ingredient.path?.includes(`${bookId.toUpperCase()}.usfm`)
      );
      if (bookFile) {
        filePath = bookFile.path;
        console.warn(`📖 Scripture Service: Using ingredient path: ${filePath}`);
      } else {
        console.warn(`⚠️ Scripture Service: Book ${bookId} not found in ingredients, using fallback`);
        filePath = `${bookId.toUpperCase()}.usfm`;
      }
    } else {
      filePath = `${bookId.toUpperCase()}.usfm`;
      console.warn(`📖 Scripture Service: Using standard path: ${filePath}`);
    }
    const usfmContent = await fetchResourceFile(
      languageId2,
      resourceId2,
      filePath,
      organization2
    );
    if (usfmContent && usfmContent.trim()) {
      console.warn(`✅ Scripture Service: Successfully loaded ${bookId} (${usfmContent.length} characters)`);
      return usfmContent;
    } else {
      console.error(`❌ Scripture Service: Empty or invalid USFM content for ${bookId}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Scripture Service: Error fetching ${bookId} from ${organization2}:`, error);
    if (organization2 !== "unfoldingWord") {
      console.warn(`🔄 Scripture Service: Attempting unfoldingWord fallback for ${bookId}`);
      try {
        const fallbackContent = await fetchBookWithFallback({
          bookId,
          organization: "unfoldingWord",
          languageId: languageId2,
          resourceId: resourceId2,
          resourceData: null
          // Don't use resourceData for fallback
        });
        if (fallbackContent) {
          console.warn(`⚠️ Scripture Service: Loaded ${bookId} from unfoldingWord fallback`);
          return fallbackContent;
        }
      } catch (fallbackError) {
        console.error(`❌ Scripture Service: Fallback also failed for ${bookId}:`, fallbackError);
      }
    }
    return null;
  }
}
async function loadResourceForType(resourceType, reference2, resourceConfig = {}) {
  if (!reference2 || typeof reference2 !== "object") {
    console.warn(`loadResourceForType: Invalid reference provided for ${resourceType}`);
    return null;
  }
  if (!resourceConfig || typeof resourceConfig !== "object") {
    resourceConfig = {};
  }
  const { bookId, chapter, verse } = reference2;
  if (!bookId || !chapter || !verse) {
    console.warn(`loadResourceForType: Incomplete reference for ${resourceType}:`, reference2);
    return null;
  }
  const {
    organization: organization2 = "unfoldingWord",
    languageId: languageId2 = "en",
    resourceId: resourceId2 = resourceType === "scripture" ? "ult" : resourceType,
    resourceData = null
  } = resourceConfig;
  console.warn(`🎯 loadResourceForType: Loading ${resourceType} for ${bookId} ${chapter}:${verse} from ${organization2}/${languageId2}/${resourceId2}`);
  try {
    switch (resourceType) {
      case "scripture":
        try {
          console.warn(`🔍 Scripture: Attempting primary load from ${organization2}/${languageId2}/${resourceId2}`);
          const rawUsfm = await fetchBookWithFallback({
            bookId,
            organization: organization2,
            languageId: languageId2,
            resourceId: resourceId2,
            ...resourceData && { resourceData }
          });
          if (rawUsfm) {
            console.warn(`✅ Scripture: Primary load SUCCESSFUL from ${organization2} (${rawUsfm.length} chars)`);
            return rawUsfm;
          } else {
            console.error(`❌ Scripture: Primary load from ${organization2} returned null/empty`);
          }
          return null;
        } catch (primaryError) {
          console.error(`❌ Scripture: Primary load from ${organization2} FAILED with error:`, primaryError);
          if (organization2 !== "unfoldingWord") {
            console.warn(`🔄 Scripture: Attempting unfoldingWord fallback due to ${organization2} failure`);
            try {
              const fallbackUsfm = await fetchBookWithFallback({
                bookId,
                organization: "unfoldingWord",
                languageId: languageId2,
                resourceId: resourceId2,
                resourceData: null
                // Don't use resourceData for fallback org
              });
              if (fallbackUsfm) {
                console.warn(`⚠️ Scripture (FALLBACK): Loaded from unfoldingWord instead of ${organization2} (${fallbackUsfm.length} chars)`);
                console.error(`🚨 THIS IS THE PROBLEM! User selected ${organization2} but got unfoldingWord fallback!`);
                return fallbackUsfm;
              } else {
                console.error(`❌ Scripture: unfoldingWord fallback also returned null/empty`);
              }
              return null;
            } catch (fallbackError) {
              console.error(`❌ Scripture: Both ${organization2} and unfoldingWord failed:`, { primaryError, fallbackError });
              throw primaryError;
            }
          } else {
            console.error(`❌ Scripture: unfoldingWord primary load failed, no fallback available`);
            throw primaryError;
          }
        }
      case "notes":
        console.warn(`📝 Notes: Service not yet ported - returning mock data`);
        return [
          {
            id: "note1",
            verse,
            title: `Note for ${bookId} ${chapter}:${verse}`,
            content: "Translation note content will be loaded when tnService is ported."
          }
        ];
      case "questions":
        console.warn(`❓ Questions: Service not yet ported - returning mock data`);
        return [
          {
            id: "q1",
            verse,
            question: `What does ${bookId} ${chapter}:${verse} teach us?`,
            answer: "Translation question content will be loaded when tqService is ported."
          }
        ];
      case "words":
        console.warn(`📚 Words: Service not yet ported - returning mock data`);
        return [
          {
            id: "word1",
            term: "God",
            definition: "Translation word content will be loaded when twService is ported.",
            references: [`${bookId} ${chapter}:${verse}`]
          }
        ];
      case "links":
        console.warn(`🔗 Links: Service not yet ported - returning mock data`);
        return [
          {
            id: "link1",
            verse,
            word: "example",
            link: "rc://*/tw/dict/bible/kt/example"
          }
        ];
      case "fiaimages":
        console.warn(`🖼️ FIA Images: Service not yet ported - returning empty array`);
        return [];
      case "fiamaps":
        console.warn(`🗺️ FIA Maps: Service not yet ported - returning empty array`);
        return [];
      case "fia":
        console.warn(`🎨 FIA Content: Service not yet ported - returning empty array`);
        return [];
      default:
        console.warn(`Unknown resource type: ${resourceType}`);
        return null;
    }
  } catch (error) {
    console.error(`Error loading ${resourceType} for ${bookId} ${chapter}:${verse}:`, error);
    if (["notes", "questions", "words", "links"].includes(resourceType)) {
      return [];
    }
    return null;
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
const links = derived(
  [resources],
  ([$resources]) => $resources.links || []
);
function activateResource(resourceType) {
  const current = get_store_value(activeResources);
  if (!current.has(resourceType)) {
    activeResources.update((set) => new Set(set).add(resourceType));
  }
}
function getResourceConfig(resourceType) {
  const $organization = get_store_value(organization);
  const $languageId = get_store_value(languageId);
  const $resourceId = get_store_value(resourceId);
  const $resourceOrganization = get_store_value(resourceOrganization);
  const $currentResourceData = get_store_value(currentResourceData);
  const $mixedResources = get_store_value(mixedResources);
  const mixedResourceConfig = $mixedResources[resourceType];
  if (mixedResourceConfig) {
    return {
      organization: mixedResourceConfig.organization || $organization,
      languageId: mixedResourceConfig.languageId || $languageId,
      resourceId: mixedResourceConfig.resourceId || (resourceType === "scripture" ? $resourceId : resourceType),
      resourceData: $currentResourceData
    };
  }
  return {
    organization: resourceType === "scripture" && $resourceOrganization ? $resourceOrganization : $organization,
    languageId: $languageId,
    resourceId: resourceType === "scripture" ? $resourceId : resourceType,
    resourceData: $currentResourceData
  };
}
async function loadResourcesForReference(referenceData, activeResourcesSet) {
  const loadingSet = new Set(Array.from(activeResourcesSet));
  loadingResources.set(loadingSet);
  try {
    console.log(`🔄 Resources Store: Loading resources for ${referenceData.bookId} ${referenceData.chapter}:${referenceData.verse}`);
    resources.update((prev) => ({
      ...prev,
      reference: {
        bookId: referenceData.bookId,
        chapter: referenceData.chapter,
        verse: referenceData.verse,
        citation: `${referenceData.bookId} ${referenceData.chapter}:${referenceData.verse}`
      }
    }));
    const loadPromises = Array.from(activeResourcesSet).map(async (resourceType) => {
      try {
        console.log(`🎯 Resources Store: Loading ${resourceType}`);
        const resourceConfig = getResourceConfig(resourceType);
        console.log(`📍 Resources Store: Config for ${resourceType}:`, resourceConfig);
        const resourceData = await loadResourceForType(
          resourceType,
          referenceData,
          resourceConfig
        );
        resources.update((prev) => ({
          ...prev,
          [resourceType]: resourceData
        }));
        console.log(
          `✅ Resources Store: Loaded ${resourceType}:`,
          Array.isArray(resourceData) ? `${resourceData.length} items` : typeof resourceData === "string" ? `${resourceData.length} chars` : resourceData ? "loaded" : "null"
        );
        loadingResources.update((prev) => {
          const newSet = new Set(prev);
          newSet.delete(resourceType);
          return newSet;
        });
      } catch (error) {
        console.error(`❌ Resources Store: Error loading ${resourceType}:`, error);
        loadingResources.update((prev) => {
          const newSet = new Set(prev);
          newSet.delete(resourceType);
          return newSet;
        });
        const emptyValue = ["notes", "questions", "words", "links"].includes(resourceType) ? [] : null;
        resources.update((prev) => ({
          ...prev,
          [resourceType]: emptyValue
        }));
      }
    });
    await Promise.all(loadPromises);
    console.log(`🎉 Resources Store: All resources loaded for ${referenceData.bookId} ${referenceData.chapter}:${referenceData.verse}`);
  } catch (error) {
    console.error("❌ Resources Store: Error in loadResourcesForReference:", error);
  } finally {
    loadingResources.set(/* @__PURE__ */ new Set());
  }
}
let unsubscribeResourceLoader;
function initializeResourceLoader() {
  if (unsubscribeResourceLoader) {
    unsubscribeResourceLoader();
  }
  console.log("🚀 Resources Store: Initializing resource loader");
  unsubscribeResourceLoader = derived(
    [
      reference,
      activeResources,
      organization,
      languageId,
      resourceId,
      resourceOrganization,
      currentResourceData,
      mixedResources,
      isInitialized
    ],
    ([
      $reference,
      $activeResources,
      $organization,
      $languageId,
      $resourceId,
      $resourceOrganization,
      $currentResourceData,
      $mixedResources,
      $isInitialized
    ]) => ({
      reference: $reference,
      activeResources: $activeResources,
      organization: $organization,
      languageId: $languageId,
      resourceId: $resourceId,
      resourceOrganization: $resourceOrganization,
      currentResourceData: $currentResourceData,
      mixedResources: $mixedResources,
      isInitialized: $isInitialized
    })
  ).subscribe(async (data) => {
    if (!data.isInitialized || !data.reference?.bookId) {
      console.log("📋 Resources Store: Skipping load - not initialized or invalid reference");
      return;
    }
    console.log("🔄 Resources Store: Dependencies changed, loading resources...", {
      reference: data.reference,
      activeResources: Array.from(data.activeResources),
      organization: data.organization,
      languageId: data.languageId,
      resourceId: data.resourceId
    });
    await loadResourcesForReference(data.reference, data.activeResources);
  });
}
function cleanupResourceLoader() {
  if (unsubscribeResourceLoader) {
    unsubscribeResourceLoader();
    console.log("🧹 Resources Store: Resource loader cleaned up");
  }
}
const resourcesStore = {
  // Core stores
  resources,
  loadingResources,
  activeResources,
  // Derived stores for easy access
  scripture,
  notes,
  questions,
  words,
  links,
  // Functions
  activateResource,
  loadResourcesForReference,
  initializeResourceLoader,
  cleanupResourceLoader
};
const css$h = {
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
  $$result.css.add(css$h);
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
const css$g = {
  code: ".loading-overlay.svelte-1vhefzi.svelte-1vhefzi{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255, 255, 255, 0.9);display:flex;align-items:center;justify-content:center;z-index:10}.loading-content.svelte-1vhefzi.svelte-1vhefzi{text-align:center;display:flex;flex-direction:column;align-items:center;gap:1rem}.spinner.svelte-1vhefzi.svelte-1vhefzi{width:2rem;height:2rem;border:2px solid var(--color-border);border-top:2px solid var(--color-primary);border-radius:50%;animation:svelte-1vhefzi-spin 1s linear infinite}.loading-content.svelte-1vhefzi p.svelte-1vhefzi{margin:0;color:var(--color-text);font-size:0.9rem}@keyframes svelte-1vhefzi-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}",
  map: '{"version":3,"file":"LoadingOverlay.svelte","sources":["LoadingOverlay.svelte"],"sourcesContent":["<script>\\n  export let isVisible = false;\\n  export let text = \\"Loading...\\";\\n<\/script>\\n\\n{#if isVisible}\\n  <div class=\\"loading-overlay\\">\\n    <div class=\\"loading-content\\">\\n      <div class=\\"spinner\\"></div>\\n      <p>{text}</p>\\n    </div>\\n  </div>\\n{/if}\\n\\n<slot />\\n\\n<style>\\n  .loading-overlay {\\n    position: absolute;\\n    top: 0;\\n    left: 0;\\n    right: 0;\\n    bottom: 0;\\n    background: rgba(255, 255, 255, 0.9);\\n    display: flex;\\n    align-items: center;\\n    justify-content: center;\\n    z-index: 10;\\n  }\\n\\n  [data-theme=\\"dark\\"] .loading-overlay {\\n    background: rgba(0, 0, 0, 0.9);\\n  }\\n\\n  .loading-content {\\n    text-align: center;\\n    display: flex;\\n    flex-direction: column;\\n    align-items: center;\\n    gap: 1rem;\\n  }\\n\\n  .spinner {\\n    width: 2rem;\\n    height: 2rem;\\n    border: 2px solid var(--color-border);\\n    border-top: 2px solid var(--color-primary);\\n    border-radius: 50%;\\n    animation: spin 1s linear infinite;\\n  }\\n\\n  .loading-content p {\\n    margin: 0;\\n    color: var(--color-text);\\n    font-size: 0.9rem;\\n  }\\n\\n  @keyframes spin {\\n    0% { transform: rotate(0deg); }\\n    100% { transform: rotate(360deg); }\\n  }\\n</style>"],"names":[],"mappings":"AAiBE,8CAAiB,CACf,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,CAAC,CACT,UAAU,CAAE,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CACpC,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,OAAO,CAAE,EACX,CAMA,8CAAiB,CACf,UAAU,CAAE,MAAM,CAClB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,IACP,CAEA,sCAAS,CACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,eAAe,CAAC,CAC1C,aAAa,CAAE,GAAG,CAClB,SAAS,CAAE,mBAAI,CAAC,EAAE,CAAC,MAAM,CAAC,QAC5B,CAEA,+BAAgB,CAAC,gBAAE,CACjB,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,SAAS,CAAE,MACb,CAEA,WAAW,mBAAK,CACd,EAAG,CAAE,SAAS,CAAE,OAAO,IAAI,CAAG,CAC9B,IAAK,CAAE,SAAS,CAAE,OAAO,MAAM,CAAG,CACpC"}'
};
const LoadingOverlay = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isVisible = false } = $$props;
  let { text = "Loading..." } = $$props;
  if ($$props.isVisible === void 0 && $$bindings.isVisible && isVisible !== void 0) $$bindings.isVisible(isVisible);
  if ($$props.text === void 0 && $$bindings.text && text !== void 0) $$bindings.text(text);
  $$result.css.add(css$g);
  return `${isVisible ? `<div class="loading-overlay svelte-1vhefzi"><div class="loading-content svelte-1vhefzi"><div class="spinner svelte-1vhefzi"></div> <p class="svelte-1vhefzi">${escape(text)}</p></div></div>` : ``} ${slots.default ? slots.default({}) : ``}`;
});
const css$f = {
  code: ".loading-spinner.svelte-hdu0qo{border-radius:50%;animation:svelte-hdu0qo-spin 1s linear infinite}.loading-spinner.small.svelte-hdu0qo{width:1rem;height:1rem;border:2px solid transparent;border-top:2px solid var(--color-primary)}.loading-spinner.medium.svelte-hdu0qo{width:1.5rem;height:1.5rem;border:2px solid var(--color-border);border-top:2px solid var(--color-primary)}.loading-spinner.large.svelte-hdu0qo{width:2rem;height:2rem;border:3px solid var(--color-border);border-top:3px solid var(--color-primary)}.loading-spinner.white.svelte-hdu0qo{border-color:rgba(255, 255, 255, 0.3);border-top-color:white}@keyframes svelte-hdu0qo-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}",
  map: `{"version":3,"file":"LoadingSpinner.svelte","sources":["LoadingSpinner.svelte"],"sourcesContent":["<script>\\n  export let size = 'medium'; // small, medium, large\\n  export let variant = 'default'; // default, white\\n<\/script>\\n\\n<div class=\\"loading-spinner {size} {variant}\\"></div>\\n\\n<style>\\n  .loading-spinner {\\n    border-radius: 50%;\\n    animation: spin 1s linear infinite;\\n  }\\n\\n  .loading-spinner.small {\\n    width: 1rem;\\n    height: 1rem;\\n    border: 2px solid transparent;\\n    border-top: 2px solid var(--color-primary);\\n  }\\n\\n  .loading-spinner.medium {\\n    width: 1.5rem;\\n    height: 1.5rem;\\n    border: 2px solid var(--color-border);\\n    border-top: 2px solid var(--color-primary);\\n  }\\n\\n  .loading-spinner.large {\\n    width: 2rem;\\n    height: 2rem;\\n    border: 3px solid var(--color-border);\\n    border-top: 3px solid var(--color-primary);\\n  }\\n\\n  .loading-spinner.white {\\n    border-color: rgba(255, 255, 255, 0.3);\\n    border-top-color: white;\\n  }\\n\\n  @keyframes spin {\\n    0% { transform: rotate(0deg); }\\n    100% { transform: rotate(360deg); }\\n  }\\n</style>"],"names":[],"mappings":"AAQE,8BAAiB,CACf,aAAa,CAAE,GAAG,CAClB,SAAS,CAAE,kBAAI,CAAC,EAAE,CAAC,MAAM,CAAC,QAC5B,CAEA,gBAAgB,oBAAO,CACrB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CAC7B,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,eAAe,CAC3C,CAEA,gBAAgB,qBAAQ,CACtB,KAAK,CAAE,MAAM,CACb,MAAM,CAAE,MAAM,CACd,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,eAAe,CAC3C,CAEA,gBAAgB,oBAAO,CACrB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,eAAe,CAC3C,CAEA,gBAAgB,oBAAO,CACrB,YAAY,CAAE,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CACtC,gBAAgB,CAAE,KACpB,CAEA,WAAW,kBAAK,CACd,EAAG,CAAE,SAAS,CAAE,OAAO,IAAI,CAAG,CAC9B,IAAK,CAAE,SAAS,CAAE,OAAO,MAAM,CAAG,CACpC"}`
};
const LoadingSpinner = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { size = "medium" } = $$props;
  let { variant = "default" } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
  if ($$props.variant === void 0 && $$bindings.variant && variant !== void 0) $$bindings.variant(variant);
  $$result.css.add(css$f);
  return `<div class="${"loading-spinner " + escape(size, true) + " " + escape(variant, true) + " svelte-hdu0qo"}"></div>`;
});
const css$e = {
  code: ".tab-icon.svelte-1trttqp{font-size:1rem;display:inline-block}",
  map: `{"version":3,"file":"TabIcon.svelte","sources":["TabIcon.svelte"],"sourcesContent":["<script>\\n  export let type;\\n\\n  const iconMap = {\\n    notes: '📝',\\n    questions: '❓',\\n    words: '📚',\\n    images: '🖼️',\\n    maps: '🗺️',\\n    chat: '💬',\\n    article: '📄'\\n  };\\n\\n  $: icon = iconMap[type] || '📄';\\n<\/script>\\n\\n<span class=\\"tab-icon\\" aria-hidden=\\"true\\">\\n  {icon}\\n</span>\\n\\n<style>\\n  .tab-icon {\\n    font-size: 1rem;\\n    display: inline-block;\\n  }\\n</style>"],"names":[],"mappings":"AAqBE,wBAAU,CACR,SAAS,CAAE,IAAI,CACf,OAAO,CAAE,YACX"}`
};
const TabIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let icon;
  let { type } = $$props;
  const iconMap = {
    notes: "📝",
    questions: "❓",
    words: "📚",
    images: "🖼️",
    maps: "🗺️",
    chat: "💬",
    article: "📄"
  };
  if ($$props.type === void 0 && $$bindings.type && type !== void 0) $$bindings.type(type);
  $$result.css.add(css$e);
  icon = iconMap[type] || "📄";
  return `<span class="tab-icon svelte-1trttqp" aria-hidden="true">${escape(icon)} </span>`;
});
function preprocessRcLinks(content) {
  if (!content || typeof content !== "string") {
    return content;
  }
  const existingLinks = [];
  let protectedContent = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const placeholder = `__EXISTING_LINK_${existingLinks.length}__`;
    existingLinks.push(match);
    return placeholder;
  });
  const rcLinkRegex = /rc:\/\/[^\s)]+/g;
  protectedContent = protectedContent.replace(rcLinkRegex, (match) => {
    return `[${match}](${match})`;
  });
  existingLinks.forEach((link, index) => {
    const placeholder = `__EXISTING_LINK_${index}__`;
    protectedContent = protectedContent.replace(placeholder, link);
  });
  return protectedContent;
}
function simpleMarkdownToHtml(text) {
  if (!text || typeof text !== "string") {
    return "";
  }
  let html = text;
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/\n/g, "<br>");
  html = html.replace(/(.+?)(<br><br>|$)/g, "<p>$1</p>");
  return html;
}
function processMarkdownWithRcLinks(text, onRcLinkClick) {
  if (!text || typeof text !== "string") {
    return "";
  }
  const processedContent = preprocessRcLinks(text);
  let html = simpleMarkdownToHtml(processedContent);
  html = html.replace(/\[([^\]]+)\]\((rc:\/\/[^)]+)\)/g, (match, text2, rcUri) => {
    return `<button class="rc-link-button" data-rc-uri="${rcUri}" style="background: none; border: none; color: var(--color-primary); text-decoration: underline; cursor: pointer; padding: 0; font: inherit;">${text2}</button>`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return html;
}
const css$d = {
  code: ".navigation-container.svelte-3opyxh.svelte-3opyxh{background:var(--color-panel);border-radius:8px;overflow:hidden}.no-resource-message.svelte-3opyxh.svelte-3opyxh{padding:1rem}.message-card.svelte-3opyxh.svelte-3opyxh{display:flex;align-items:center;gap:1rem;padding:1rem;background:var(--color-warning-alpha);border:1px solid var(--color-warning);border-radius:8px}.message-icon.svelte-3opyxh.svelte-3opyxh{font-size:1.5rem;flex-shrink:0}.message-content.svelte-3opyxh.svelte-3opyxh{flex:1}.message-title.svelte-3opyxh.svelte-3opyxh{margin:0 0 0.25rem 0;font-weight:600;color:var(--color-text)}.message-subtitle.svelte-3opyxh.svelte-3opyxh{margin:0;font-size:0.9rem;color:var(--color-text-secondary)}.find-button.svelte-3opyxh.svelte-3opyxh{background:var(--color-primary);color:white;border:none;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-weight:500;transition:background 0.2s ease}.find-button.svelte-3opyxh.svelte-3opyxh:hover{background:var(--color-primary-hover)}.navigation-panel.svelte-3opyxh.svelte-3opyxh{padding:1rem;background:var(--color-background)}.selection-container.svelte-3opyxh.svelte-3opyxh{background:var(--color-panel);border-radius:8px;padding:1.5rem}.language-step.svelte-3opyxh h3.svelte-3opyxh,.organization-step.svelte-3opyxh h3.svelte-3opyxh{margin:0 0 1rem 0;color:var(--color-text)}.language-grid.svelte-3opyxh.svelte-3opyxh,.org-grid.svelte-3opyxh.svelte-3opyxh{display:grid;grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));gap:0.75rem;margin-bottom:1rem}.language-option.svelte-3opyxh.svelte-3opyxh,.org-option.svelte-3opyxh.svelte-3opyxh{background:var(--color-background);border:1px solid var(--color-border);padding:0.75rem;border-radius:6px;cursor:pointer;transition:all 0.2s ease;text-align:left}.language-option.svelte-3opyxh.svelte-3opyxh:hover,.org-option.svelte-3opyxh.svelte-3opyxh:hover{border-color:var(--color-primary);background:var(--color-hover)}.nav-buttons.svelte-3opyxh.svelte-3opyxh{display:flex;gap:0.75rem;margin-top:1rem}.back-button.svelte-3opyxh.svelte-3opyxh,.cancel-button.svelte-3opyxh.svelte-3opyxh{background:var(--color-secondary);color:white;border:none;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;transition:background 0.2s ease}.back-button.svelte-3opyxh.svelte-3opyxh:hover,.cancel-button.svelte-3opyxh.svelte-3opyxh:hover{background:var(--color-secondary-hover)}.cancel-button.svelte-3opyxh.svelte-3opyxh{background:var(--color-error)}.cancel-button.svelte-3opyxh.svelte-3opyxh:hover{background:var(--color-error-hover)}@media(max-width: 768px){.message-card.svelte-3opyxh.svelte-3opyxh{flex-direction:column;text-align:center;gap:0.75rem}.language-grid.svelte-3opyxh.svelte-3opyxh,.org-grid.svelte-3opyxh.svelte-3opyxh{grid-template-columns:1fr}.nav-buttons.svelte-3opyxh.svelte-3opyxh{flex-direction:column}}",
  map: `{"version":3,"file":"InlineHelpsNavigation.svelte","sources":["InlineHelpsNavigation.svelte"],"sourcesContent":["<script>\\n  import { onMount } from 'svelte';\\n\\n  export let resourceType;\\n  export let currentReference;\\n  export let onResourceSelect = null;\\n  export let isResourceAvailable = false;\\n  export let forceNavigation = null;\\n  export let onNavigationComplete = null;\\n\\n  let isNavigating = false;\\n  let currentStep = 'language';\\n  let selectedLanguage = null;\\n  let availableResources = {};\\n  let loading = false;\\n  let error = null;\\n\\n  // Resource type mapping\\n  const RESOURCE_TYPE_MAP = {\\n    tn: 'TSV Translation Notes',\\n    tq: 'TSV Translation Questions', \\n    tw: 'Translation Words',\\n    twl: 'TSV Translation Words Links'\\n  };\\n\\n  // Display names for UI\\n  const RESOURCE_DISPLAY_NAMES = {\\n    tn: 'Translation Notes',\\n    tq: 'Translation Questions',\\n    tw: 'Translation Words', \\n    twl: 'Translation Word Links'\\n  };\\n\\n  // Handle forced navigation from breadcrumbs\\n  $: {\\n    if (forceNavigation) {\\n      console.log(\`Force navigation to step: \${forceNavigation}\`);\\n      isNavigating = true;\\n      currentStep = forceNavigation;\\n      error = null;\\n    }\\n  }\\n\\n  // Don't show navigation if resource is available\\n  $: showComponent = !isResourceAvailable || forceNavigation;\\n\\n  function handleStartNavigation() {\\n    isNavigating = true;\\n    currentStep = 'language';\\n    error = null;\\n  }\\n\\n  function handleCancel() {\\n    isNavigating = false;\\n    currentStep = 'language';\\n    selectedLanguage = null;\\n    availableResources = {};\\n    error = null;\\n    \\n    // Notify parent that navigation is complete\\n    if (onNavigationComplete) {\\n      onNavigationComplete();\\n    }\\n  }\\n\\n  function handleLanguageSelect(language) {\\n    console.log('🌐 InlineHelpsNavigation: Language selected:', language);\\n    selectedLanguage = language;\\n    currentStep = 'organization';\\n    // TODO: Load available resources\\n  }\\n\\n  function handleResourceSelect(resource) {\\n    console.log('📚 InlineHelpsNavigation: Resource selected:', resource);\\n    \\n    // Generate RC link\\n    const rcLink = \`rc://\${selectedLanguage}/\${resourceType}/help/\${currentReference.bookId}/\${currentReference.chapter}/\${currentReference.verse}\`;\\n    \\n    // Call the parent's RC link handler\\n    if (onResourceSelect) {\\n      onResourceSelect(rcLink, selectedLanguage, resource.organization);\\n    }\\n    \\n    // Close navigation\\n    handleCancel();\\n  }\\n\\n  function handleBack() {\\n    if (currentStep === 'organization') {\\n      currentStep = 'language';\\n      selectedLanguage = null;\\n      availableResources = {};\\n    }\\n  }\\n<\/script>\\n\\n{#if showComponent}\\n  <div class=\\"navigation-container\\">\\n    {#if !isNavigating}\\n      <!-- Collapsed state - show \\"not available\\" message with action button -->\\n      <div class=\\"no-resource-message\\">\\n        <div class=\\"message-card\\">\\n          <div class=\\"message-icon\\">\\n            {resourceType === 'tn' ? '📝' : resourceType === 'tq' ? '❓' : resourceType === 'tw' ? '📚' : '🔗'}\\n          </div>\\n          <div class=\\"message-content\\">\\n            <p class=\\"message-title\\">\\n              {RESOURCE_DISPLAY_NAMES[resourceType]} not available\\n            </p>\\n            <p class=\\"message-subtitle\\">\\n              in current language/organization selection\\n            </p>\\n          </div>\\n          <button \\n            on:click={handleStartNavigation}\\n            class=\\"find-button\\"\\n          >\\n            Find Alternative\\n          </button>\\n        </div>\\n      </div>\\n    {:else}\\n      <!-- Navigation active - show selection interface -->\\n      <div class=\\"navigation-panel\\">\\n        <div class=\\"selection-container\\">\\n          {#if currentStep === 'language'}\\n            <div class=\\"language-step\\">\\n              <h3>Select Language</h3>\\n              <div class=\\"language-grid\\">\\n                <button on:click={() => handleLanguageSelect('en')} class=\\"language-option\\">\\n                  🇺🇸 English\\n                </button>\\n                <button on:click={() => handleLanguageSelect('es')} class=\\"language-option\\">\\n                  🇪🇸 Spanish\\n                </button>\\n                <button on:click={() => handleLanguageSelect('fr')} class=\\"language-option\\">\\n                  🇫🇷 French\\n                </button>\\n              </div>\\n              <button on:click={handleCancel} class=\\"cancel-button\\">\\n                Cancel\\n              </button>\\n            </div>\\n          {:else if currentStep === 'organization'}\\n            <div class=\\"organization-step\\">\\n              <h3>Select {RESOURCE_DISPLAY_NAMES[resourceType]}</h3>\\n              <p>Language: {selectedLanguage}</p>\\n              \\n              <div class=\\"org-grid\\">\\n                <button \\n                  on:click={() => handleResourceSelect({ organization: 'unfoldingWord' })}\\n                  class=\\"org-option\\"\\n                >\\n                  unfoldingWord\\n                </button>\\n                <button \\n                  on:click={() => handleResourceSelect({ organization: 'Door43' })}\\n                  class=\\"org-option\\"\\n                >\\n                  Door43\\n                </button>\\n              </div>\\n              \\n              <div class=\\"nav-buttons\\">\\n                <button on:click={handleBack} class=\\"back-button\\">\\n                  ← Back\\n                </button>\\n                <button on:click={handleCancel} class=\\"cancel-button\\">\\n                  Cancel\\n                </button>\\n              </div>\\n            </div>\\n          {/if}\\n        </div>\\n      </div>\\n    {/if}\\n  </div>\\n{/if}\\n\\n<style>\\n  .navigation-container {\\n    background: var(--color-panel);\\n    border-radius: 8px;\\n    overflow: hidden;\\n  }\\n\\n  .no-resource-message {\\n    padding: 1rem;\\n  }\\n\\n  .message-card {\\n    display: flex;\\n    align-items: center;\\n    gap: 1rem;\\n    padding: 1rem;\\n    background: var(--color-warning-alpha);\\n    border: 1px solid var(--color-warning);\\n    border-radius: 8px;\\n  }\\n\\n  .message-icon {\\n    font-size: 1.5rem;\\n    flex-shrink: 0;\\n  }\\n\\n  .message-content {\\n    flex: 1;\\n  }\\n\\n  .message-title {\\n    margin: 0 0 0.25rem 0;\\n    font-weight: 600;\\n    color: var(--color-text);\\n  }\\n\\n  .message-subtitle {\\n    margin: 0;\\n    font-size: 0.9rem;\\n    color: var(--color-text-secondary);\\n  }\\n\\n  .find-button {\\n    background: var(--color-primary);\\n    color: white;\\n    border: none;\\n    padding: 0.5rem 1rem;\\n    border-radius: 6px;\\n    cursor: pointer;\\n    font-weight: 500;\\n    transition: background 0.2s ease;\\n  }\\n\\n  .find-button:hover {\\n    background: var(--color-primary-hover);\\n  }\\n\\n  .navigation-panel {\\n    padding: 1rem;\\n    background: var(--color-background);\\n  }\\n\\n  .selection-container {\\n    background: var(--color-panel);\\n    border-radius: 8px;\\n    padding: 1.5rem;\\n  }\\n\\n  .language-step h3,\\n  .organization-step h3 {\\n    margin: 0 0 1rem 0;\\n    color: var(--color-text);\\n  }\\n\\n  .language-grid,\\n  .org-grid {\\n    display: grid;\\n    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));\\n    gap: 0.75rem;\\n    margin-bottom: 1rem;\\n  }\\n\\n  .language-option,\\n  .org-option {\\n    background: var(--color-background);\\n    border: 1px solid var(--color-border);\\n    padding: 0.75rem;\\n    border-radius: 6px;\\n    cursor: pointer;\\n    transition: all 0.2s ease;\\n    text-align: left;\\n  }\\n\\n  .language-option:hover,\\n  .org-option:hover {\\n    border-color: var(--color-primary);\\n    background: var(--color-hover);\\n  }\\n\\n  .nav-buttons {\\n    display: flex;\\n    gap: 0.75rem;\\n    margin-top: 1rem;\\n  }\\n\\n  .back-button,\\n  .cancel-button {\\n    background: var(--color-secondary);\\n    color: white;\\n    border: none;\\n    padding: 0.5rem 1rem;\\n    border-radius: 6px;\\n    cursor: pointer;\\n    transition: background 0.2s ease;\\n  }\\n\\n  .back-button:hover,\\n  .cancel-button:hover {\\n    background: var(--color-secondary-hover);\\n  }\\n\\n  .cancel-button {\\n    background: var(--color-error);\\n  }\\n\\n  .cancel-button:hover {\\n    background: var(--color-error-hover);\\n  }\\n\\n  /* Responsive design */\\n  @media (max-width: 768px) {\\n    .message-card {\\n      flex-direction: column;\\n      text-align: center;\\n      gap: 0.75rem;\\n    }\\n\\n    .language-grid,\\n    .org-grid {\\n      grid-template-columns: 1fr;\\n    }\\n\\n    .nav-buttons {\\n      flex-direction: column;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"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"}`
};
const InlineHelpsNavigation = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let showComponent;
  let { resourceType } = $$props;
  let { currentReference } = $$props;
  let { onResourceSelect = null } = $$props;
  let { isResourceAvailable = false } = $$props;
  let { forceNavigation = null } = $$props;
  let { onNavigationComplete = null } = $$props;
  let isNavigating = false;
  let currentStep = "language";
  let selectedLanguage = null;
  const RESOURCE_DISPLAY_NAMES = {
    tn: "Translation Notes",
    tq: "Translation Questions",
    tw: "Translation Words",
    twl: "Translation Word Links"
  };
  if ($$props.resourceType === void 0 && $$bindings.resourceType && resourceType !== void 0) $$bindings.resourceType(resourceType);
  if ($$props.currentReference === void 0 && $$bindings.currentReference && currentReference !== void 0) $$bindings.currentReference(currentReference);
  if ($$props.onResourceSelect === void 0 && $$bindings.onResourceSelect && onResourceSelect !== void 0) $$bindings.onResourceSelect(onResourceSelect);
  if ($$props.isResourceAvailable === void 0 && $$bindings.isResourceAvailable && isResourceAvailable !== void 0) $$bindings.isResourceAvailable(isResourceAvailable);
  if ($$props.forceNavigation === void 0 && $$bindings.forceNavigation && forceNavigation !== void 0) $$bindings.forceNavigation(forceNavigation);
  if ($$props.onNavigationComplete === void 0 && $$bindings.onNavigationComplete && onNavigationComplete !== void 0) $$bindings.onNavigationComplete(onNavigationComplete);
  $$result.css.add(css$d);
  {
    {
      if (forceNavigation) {
        console.log(`Force navigation to step: ${forceNavigation}`);
        isNavigating = true;
        currentStep = forceNavigation;
      }
    }
  }
  showComponent = !isResourceAvailable || forceNavigation;
  return `${showComponent ? `<div class="navigation-container svelte-3opyxh">${!isNavigating ? ` <div class="no-resource-message svelte-3opyxh"><div class="message-card svelte-3opyxh"><div class="message-icon svelte-3opyxh">${escape(resourceType === "tn" ? "📝" : resourceType === "tq" ? "❓" : resourceType === "tw" ? "📚" : "🔗")}</div> <div class="message-content svelte-3opyxh"><p class="message-title svelte-3opyxh">${escape(RESOURCE_DISPLAY_NAMES[resourceType])} not available</p> <p class="message-subtitle svelte-3opyxh" data-svelte-h="svelte-1bvy737">in current language/organization selection</p></div> <button class="find-button svelte-3opyxh" data-svelte-h="svelte-li763t">Find Alternative</button></div></div>` : ` <div class="navigation-panel svelte-3opyxh"><div class="selection-container svelte-3opyxh">${currentStep === "language" ? `<div class="language-step svelte-3opyxh"><h3 class="svelte-3opyxh" data-svelte-h="svelte-1s30fg">Select Language</h3> <div class="language-grid svelte-3opyxh"><button class="language-option svelte-3opyxh" data-svelte-h="svelte-8ylpd5">🇺🇸 English</button> <button class="language-option svelte-3opyxh" data-svelte-h="svelte-chy1a2">🇪🇸 Spanish</button> <button class="language-option svelte-3opyxh" data-svelte-h="svelte-1jafltc">🇫🇷 French</button></div> <button class="cancel-button svelte-3opyxh" data-svelte-h="svelte-jvm2jc">Cancel</button></div>` : `${currentStep === "organization" ? `<div class="organization-step svelte-3opyxh"><h3 class="svelte-3opyxh">Select ${escape(RESOURCE_DISPLAY_NAMES[resourceType])}</h3> <p>Language: ${escape(selectedLanguage)}</p> <div class="org-grid svelte-3opyxh"><button class="org-option svelte-3opyxh" data-svelte-h="svelte-e49c2f">unfoldingWord</button> <button class="org-option svelte-3opyxh" data-svelte-h="svelte-1ixzmwj">Door43</button></div> <div class="nav-buttons svelte-3opyxh"><button class="back-button svelte-3opyxh" data-svelte-h="svelte-9u9gi9">← Back</button> <button class="cancel-button svelte-3opyxh" data-svelte-h="svelte-12ze9nc">Cancel</button></div></div>` : ``}`}</div></div>`}</div>` : ``}`;
});
const css$c = {
  code: ".metadata-card.svelte-1ml74wz{background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;padding:1rem;margin-top:1rem}.metadata-header.svelte-1ml74wz{display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:1px solid var(--color-border)}.metadata-icon.svelte-1ml74wz{font-size:1.2rem}.metadata-title.svelte-1ml74wz{margin:0;font-size:1rem;font-weight:600;color:var(--color-text)}.metadata-content.svelte-1ml74wz{display:flex;flex-direction:column;gap:0.5rem}.metadata-row.svelte-1ml74wz{display:flex;justify-content:space-between;align-items:center;font-size:0.9rem}.metadata-label.svelte-1ml74wz{color:var(--color-text-secondary);font-weight:500}.metadata-value.svelte-1ml74wz{color:var(--color-text);font-weight:600;font-family:monospace;background:var(--color-panel);padding:0.2rem 0.4rem;border-radius:4px;border:1px solid var(--color-border)}@media(max-width: 768px){.metadata-card.svelte-1ml74wz{padding:0.75rem}.metadata-row.svelte-1ml74wz{flex-direction:column;align-items:flex-start;gap:0.25rem}.metadata-value.svelte-1ml74wz{align-self:stretch;text-align:center}}",
  map: `{"version":3,"file":"ResourceMetadataCard.svelte","sources":["ResourceMetadataCard.svelte"],"sourcesContent":["<script>\\n  export let organization;\\n  export let title;\\n  export let languageId;\\n  export let resourceType;\\n\\n  const resourceIcons = {\\n    tn: '📝',\\n    tq: '❓',\\n    tw: '📚',\\n    twl: '🔗',\\n    fia: '🎨'\\n  };\\n\\n  $: icon = resourceIcons[resourceType] || '📄';\\n<\/script>\\n\\n<div class=\\"metadata-card\\">\\n  <div class=\\"metadata-header\\">\\n    <span class=\\"metadata-icon\\">{icon}</span>\\n    <h4 class=\\"metadata-title\\">{title}</h4>\\n  </div>\\n  \\n  <div class=\\"metadata-content\\">\\n    <div class=\\"metadata-row\\">\\n      <span class=\\"metadata-label\\">Organization:</span>\\n      <span class=\\"metadata-value\\">{organization}</span>\\n    </div>\\n    \\n    <div class=\\"metadata-row\\">\\n      <span class=\\"metadata-label\\">Language:</span>\\n      <span class=\\"metadata-value\\">{languageId?.toUpperCase()}</span>\\n    </div>\\n    \\n    <div class=\\"metadata-row\\">\\n      <span class=\\"metadata-label\\">Type:</span>\\n      <span class=\\"metadata-value\\">{resourceType?.toUpperCase()}</span>\\n    </div>\\n  </div>\\n</div>\\n\\n<style>\\n  .metadata-card {\\n    background: var(--color-background);\\n    border: 1px solid var(--color-border);\\n    border-radius: 8px;\\n    padding: 1rem;\\n    margin-top: 1rem;\\n  }\\n\\n  .metadata-header {\\n    display: flex;\\n    align-items: center;\\n    gap: 0.5rem;\\n    margin-bottom: 0.75rem;\\n    padding-bottom: 0.5rem;\\n    border-bottom: 1px solid var(--color-border);\\n  }\\n\\n  .metadata-icon {\\n    font-size: 1.2rem;\\n  }\\n\\n  .metadata-title {\\n    margin: 0;\\n    font-size: 1rem;\\n    font-weight: 600;\\n    color: var(--color-text);\\n  }\\n\\n  .metadata-content {\\n    display: flex;\\n    flex-direction: column;\\n    gap: 0.5rem;\\n  }\\n\\n  .metadata-row {\\n    display: flex;\\n    justify-content: space-between;\\n    align-items: center;\\n    font-size: 0.9rem;\\n  }\\n\\n  .metadata-label {\\n    color: var(--color-text-secondary);\\n    font-weight: 500;\\n  }\\n\\n  .metadata-value {\\n    color: var(--color-text);\\n    font-weight: 600;\\n    font-family: monospace;\\n    background: var(--color-panel);\\n    padding: 0.2rem 0.4rem;\\n    border-radius: 4px;\\n    border: 1px solid var(--color-border);\\n  }\\n\\n  /* Responsive design */\\n  @media (max-width: 768px) {\\n    .metadata-card {\\n      padding: 0.75rem;\\n    }\\n\\n    .metadata-row {\\n      flex-direction: column;\\n      align-items: flex-start;\\n      gap: 0.25rem;\\n    }\\n\\n    .metadata-value {\\n      align-self: stretch;\\n      text-align: center;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AA0CE,6BAAe,CACb,UAAU,CAAE,IAAI,kBAAkB,CAAC,CACnC,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,IACd,CAEA,+BAAiB,CACf,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,MAAM,CACX,aAAa,CAAE,OAAO,CACtB,cAAc,CAAE,MAAM,CACtB,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAC7C,CAEA,6BAAe,CACb,SAAS,CAAE,MACb,CAEA,8BAAgB,CACd,MAAM,CAAE,CAAC,CACT,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,YAAY,CACzB,CAEA,gCAAkB,CAChB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,MACP,CAEA,4BAAc,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,aAAa,CAC9B,WAAW,CAAE,MAAM,CACnB,SAAS,CAAE,MACb,CAEA,8BAAgB,CACd,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,WAAW,CAAE,GACf,CAEA,8BAAgB,CACd,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,WAAW,CAAE,GAAG,CAChB,WAAW,CAAE,SAAS,CACtB,UAAU,CAAE,IAAI,aAAa,CAAC,CAC9B,OAAO,CAAE,MAAM,CAAC,MAAM,CACtB,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CACtC,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,6BAAe,CACb,OAAO,CAAE,OACX,CAEA,4BAAc,CACZ,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,UAAU,CACvB,GAAG,CAAE,OACP,CAEA,8BAAgB,CACd,UAAU,CAAE,OAAO,CACnB,UAAU,CAAE,MACd,CACF"}`
};
const ResourceMetadataCard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let icon;
  let { organization: organization2 } = $$props;
  let { title } = $$props;
  let { languageId: languageId2 } = $$props;
  let { resourceType } = $$props;
  const resourceIcons = {
    tn: "📝",
    tq: "❓",
    tw: "📚",
    twl: "🔗",
    fia: "🎨"
  };
  if ($$props.organization === void 0 && $$bindings.organization && organization2 !== void 0) $$bindings.organization(organization2);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
  if ($$props.languageId === void 0 && $$bindings.languageId && languageId2 !== void 0) $$bindings.languageId(languageId2);
  if ($$props.resourceType === void 0 && $$bindings.resourceType && resourceType !== void 0) $$bindings.resourceType(resourceType);
  $$result.css.add(css$c);
  icon = resourceIcons[resourceType] || "📄";
  return `<div class="metadata-card svelte-1ml74wz"><div class="metadata-header svelte-1ml74wz"><span class="metadata-icon svelte-1ml74wz">${escape(icon)}</span> <h4 class="metadata-title svelte-1ml74wz">${escape(title)}</h4></div> <div class="metadata-content svelte-1ml74wz"><div class="metadata-row svelte-1ml74wz"><span class="metadata-label svelte-1ml74wz" data-svelte-h="svelte-1jxxgi0">Organization:</span> <span class="metadata-value svelte-1ml74wz">${escape(organization2)}</span></div> <div class="metadata-row svelte-1ml74wz"><span class="metadata-label svelte-1ml74wz" data-svelte-h="svelte-jx1a1j">Language:</span> <span class="metadata-value svelte-1ml74wz">${escape(languageId2?.toUpperCase())}</span></div> <div class="metadata-row svelte-1ml74wz"><span class="metadata-label svelte-1ml74wz" data-svelte-h="svelte-1btchm1">Type:</span> <span class="metadata-value svelte-1ml74wz">${escape(resourceType?.toUpperCase())}</span></div></div> </div>`;
});
const css$b = {
  code: ".breadcrumbs.svelte-56f1r0.svelte-56f1r0{display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;padding:0.5rem;background:var(--color-background);border-radius:6px;border:1px solid var(--color-border);font-size:0.9rem}.breadcrumb-item.svelte-56f1r0.svelte-56f1r0{display:flex;align-items:center;min-height:1.5rem}.breadcrumb-button.svelte-56f1r0.svelte-56f1r0{background:none;border:none;cursor:pointer;padding:0.25rem 0.5rem;border-radius:4px;transition:background 0.2s ease;color:var(--color-primary);text-decoration:underline}.breadcrumb-button.svelte-56f1r0.svelte-56f1r0:hover{background:var(--color-hover);color:var(--color-primary-hover)}.breadcrumb-text.svelte-56f1r0.svelte-56f1r0{color:var(--color-text-secondary);font-weight:500}.breadcrumb-button.svelte-56f1r0 .breadcrumb-text.svelte-56f1r0{color:inherit}.breadcrumb-separator.svelte-56f1r0.svelte-56f1r0{color:var(--color-text-secondary);font-weight:bold;opacity:0.6}@media(max-width: 768px){.breadcrumbs.svelte-56f1r0.svelte-56f1r0{font-size:0.8rem;gap:0.25rem}.breadcrumb-button.svelte-56f1r0.svelte-56f1r0{padding:0.2rem 0.4rem}}",
  map: `{"version":3,"file":"HelpsBreadcrumbs.svelte","sources":["HelpsBreadcrumbs.svelte"],"sourcesContent":["<script>\\n  export let resourceType;\\n  export let languageId;\\n  export let organization;\\n  export let onStartNavigation = null;\\n\\n  const resourceDisplayNames = {\\n    tn: 'Translation Notes',\\n    tq: 'Translation Questions',\\n    tw: 'Translation Words',\\n    twl: 'Translation Word Links',\\n    fia: 'FIA Resources'\\n  };\\n\\n  function handleNavigate(step) {\\n    if (onStartNavigation) {\\n      onStartNavigation(step);\\n    }\\n  }\\n<\/script>\\n\\n<nav class=\\"breadcrumbs\\">\\n  <div class=\\"breadcrumb-item\\">\\n    <span class=\\"breadcrumb-text\\">{resourceDisplayNames[resourceType] || 'Resource'}</span>\\n  </div>\\n  \\n  <div class=\\"breadcrumb-separator\\">›</div>\\n  \\n  <button \\n    class=\\"breadcrumb-item breadcrumb-button\\"\\n    on:click={() => handleNavigate('language')}\\n    title=\\"Change language\\"\\n  >\\n    <span class=\\"breadcrumb-text\\">{languageId?.toUpperCase() || 'Language'}</span>\\n  </button>\\n  \\n  <div class=\\"breadcrumb-separator\\">›</div>\\n  \\n  <button \\n    class=\\"breadcrumb-item breadcrumb-button\\"\\n    on:click={() => handleNavigate('organization')}\\n    title=\\"Change organization\\"\\n  >\\n    <span class=\\"breadcrumb-text\\">{organization || 'Organization'}</span>\\n  </button>\\n</nav>\\n\\n<style>\\n  .breadcrumbs {\\n    display: flex;\\n    align-items: center;\\n    gap: 0.5rem;\\n    margin-bottom: 1rem;\\n    padding: 0.5rem;\\n    background: var(--color-background);\\n    border-radius: 6px;\\n    border: 1px solid var(--color-border);\\n    font-size: 0.9rem;\\n  }\\n\\n  .breadcrumb-item {\\n    display: flex;\\n    align-items: center;\\n    min-height: 1.5rem;\\n  }\\n\\n  .breadcrumb-button {\\n    background: none;\\n    border: none;\\n    cursor: pointer;\\n    padding: 0.25rem 0.5rem;\\n    border-radius: 4px;\\n    transition: background 0.2s ease;\\n    color: var(--color-primary);\\n    text-decoration: underline;\\n  }\\n\\n  .breadcrumb-button:hover {\\n    background: var(--color-hover);\\n    color: var(--color-primary-hover);\\n  }\\n\\n  .breadcrumb-text {\\n    color: var(--color-text-secondary);\\n    font-weight: 500;\\n  }\\n\\n  .breadcrumb-button .breadcrumb-text {\\n    color: inherit;\\n  }\\n\\n  .breadcrumb-separator {\\n    color: var(--color-text-secondary);\\n    font-weight: bold;\\n    opacity: 0.6;\\n  }\\n\\n  /* Responsive design */\\n  @media (max-width: 768px) {\\n    .breadcrumbs {\\n      font-size: 0.8rem;\\n      gap: 0.25rem;\\n    }\\n    \\n    .breadcrumb-button {\\n      padding: 0.2rem 0.4rem;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AAgDE,wCAAa,CACX,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,MAAM,CACX,aAAa,CAAE,IAAI,CACnB,OAAO,CAAE,MAAM,CACf,UAAU,CAAE,IAAI,kBAAkB,CAAC,CACnC,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,SAAS,CAAE,MACb,CAEA,4CAAiB,CACf,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,UAAU,CAAE,MACd,CAEA,8CAAmB,CACjB,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,OAAO,CACf,OAAO,CAAE,OAAO,CAAC,MAAM,CACvB,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,UAAU,CAAC,IAAI,CAAC,IAAI,CAChC,KAAK,CAAE,IAAI,eAAe,CAAC,CAC3B,eAAe,CAAE,SACnB,CAEA,8CAAkB,MAAO,CACvB,UAAU,CAAE,IAAI,aAAa,CAAC,CAC9B,KAAK,CAAE,IAAI,qBAAqB,CAClC,CAEA,4CAAiB,CACf,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,WAAW,CAAE,GACf,CAEA,gCAAkB,CAAC,8BAAiB,CAClC,KAAK,CAAE,OACT,CAEA,iDAAsB,CACpB,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,WAAW,CAAE,IAAI,CACjB,OAAO,CAAE,GACX,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,wCAAa,CACX,SAAS,CAAE,MAAM,CACjB,GAAG,CAAE,OACP,CAEA,8CAAmB,CACjB,OAAO,CAAE,MAAM,CAAC,MAClB,CACF"}`
};
const HelpsBreadcrumbs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { resourceType } = $$props;
  let { languageId: languageId2 } = $$props;
  let { organization: organization2 } = $$props;
  let { onStartNavigation = null } = $$props;
  const resourceDisplayNames = {
    tn: "Translation Notes",
    tq: "Translation Questions",
    tw: "Translation Words",
    twl: "Translation Word Links",
    fia: "FIA Resources"
  };
  if ($$props.resourceType === void 0 && $$bindings.resourceType && resourceType !== void 0) $$bindings.resourceType(resourceType);
  if ($$props.languageId === void 0 && $$bindings.languageId && languageId2 !== void 0) $$bindings.languageId(languageId2);
  if ($$props.organization === void 0 && $$bindings.organization && organization2 !== void 0) $$bindings.organization(organization2);
  if ($$props.onStartNavigation === void 0 && $$bindings.onStartNavigation && onStartNavigation !== void 0) $$bindings.onStartNavigation(onStartNavigation);
  $$result.css.add(css$b);
  return `<nav class="breadcrumbs svelte-56f1r0"><div class="breadcrumb-item svelte-56f1r0"><span class="breadcrumb-text svelte-56f1r0">${escape(resourceDisplayNames[resourceType] || "Resource")}</span></div> <div class="breadcrumb-separator svelte-56f1r0" data-svelte-h="svelte-144ktrs">›</div> <button class="breadcrumb-item breadcrumb-button svelte-56f1r0" title="Change language"><span class="breadcrumb-text svelte-56f1r0">${escape(languageId2?.toUpperCase() || "Language")}</span></button> <div class="breadcrumb-separator svelte-56f1r0" data-svelte-h="svelte-144ktrs">›</div> <button class="breadcrumb-item breadcrumb-button svelte-56f1r0" title="Change organization"><span class="breadcrumb-text svelte-56f1r0">${escape(organization2 || "Organization")}</span></button> </nav>`;
});
const css$a = {
  code: ".translation-notes-panel.svelte-1s93tdx{padding:1rem;background:var(--color-panel);border-radius:8px;height:100%;overflow-y:auto;display:flex;flex-direction:column;gap:1rem}.panel-header.svelte-1s93tdx{font-size:1.2rem;font-weight:600;margin:0;color:var(--color-text);display:flex;align-items:center;gap:0.5rem}.org-badge.svelte-1s93tdx{background:var(--color-secondary-alpha);color:var(--color-secondary);padding:0.2rem 0.5rem;border-radius:4px;font-size:0.8rem;font-weight:500}.notes-list.svelte-1s93tdx{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem}.note-card.svelte-1s93tdx{background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;padding:1rem;display:flex;flex-direction:column;gap:0.5rem;transition:all 0.2s ease}.note-card.svelte-1s93tdx:hover{border-color:var(--color-primary-alpha);box-shadow:0 2px 8px rgba(0, 0, 0, 0.1)}.note-quote.svelte-1s93tdx{font-style:italic;color:var(--color-primary);font-weight:500;padding:0.5rem;background:var(--color-primary-alpha);border-radius:4px;border-left:3px solid var(--color-primary)}.note-occurrence.svelte-1s93tdx{color:var(--color-text-secondary);font-size:0.9rem}.note-text.svelte-1s93tdx{line-height:1.6;color:var(--color-text)}.collapsible-note.svelte-1s93tdx{max-height:150px;overflow:hidden;cursor:pointer;position:relative;transition:max-height 0.3s ease}.collapsible-note.svelte-1s93tdx:not(.expanded):after{content:'';position:absolute;bottom:0;left:0;right:0;height:50px;background:linear-gradient(transparent, var(--color-background));pointer-events:none}.collapsible-note.svelte-1s93tdx:hover{background:var(--color-hover)}.note-tags.svelte-1s93tdx{font-size:0.9rem;color:var(--color-text-secondary);font-style:italic}.note-support-reference.svelte-1s93tdx{font-size:0.9rem;color:var(--color-text-secondary);border-top:1px solid var(--color-border);padding-top:0.5rem}.tip-section.svelte-1s93tdx{background:var(--color-warning-alpha);border:1px solid var(--color-warning);border-radius:8px;padding:1rem;margin-top:1rem}.tip-text.svelte-1s93tdx{margin:0;color:var(--color-text);display:flex;align-items:flex-start;gap:0.5rem}.tip-icon.svelte-1s93tdx{font-size:1.2rem;flex-shrink:0}.tip-bold.svelte-1s93tdx{font-weight:600;color:var(--color-warning)}@media(max-width: 768px){.translation-notes-panel.svelte-1s93tdx{padding:0.5rem}.panel-header.svelte-1s93tdx{font-size:1.1rem;flex-direction:column;align-items:flex-start;gap:0.25rem}.org-badge.svelte-1s93tdx{font-size:0.75rem}.note-card.svelte-1s93tdx{padding:0.75rem}.collapsible-note.svelte-1s93tdx{max-height:120px}.tip-text.svelte-1s93tdx{flex-direction:column;gap:0.25rem}}",
  map: `{"version":3,"file":"TranslationNotesPanel.svelte","sources":["TranslationNotesPanel.svelte"],"sourcesContent":["<script>\\n  import { onMount } from 'svelte';\\n  import { resourcesStore } from '$lib/stores/resources.js';\\n  import { referenceStore } from '$lib/stores/reference.js';\\n  import { processMarkdownWithRcLinks } from '$lib/utils/markdownUtils.js';\\n  import InlineHelpsNavigation from './InlineHelpsNavigation.svelte';\\n  import ResourceMetadataCard from './shared/ResourceMetadataCard.svelte';\\n  import HelpsBreadcrumbs from './shared/HelpsBreadcrumbs.svelte';\\n\\n  export let reference;\\n  export let onRcLinkClick = null;\\n\\n  let notes = [];\\n  let forceNavigation = null;\\n  let hasTriedLoading = false;\\n  let mixedResources = {};\\n  let organization = 'unfoldingWord';\\n  let languageId = 'en';\\n\\n  // Subscribe to stores\\n  const unsubscribeResources = resourcesStore.subscribe((resources) => {\\n    notes = resources.notes || [];\\n  });\\n\\n  const unsubscribeReference = referenceStore.subscribe((refStore) => {\\n    mixedResources = refStore.mixedResources || {};\\n    organization = refStore.organization || 'unfoldingWord';\\n    languageId = refStore.languageId || 'en';\\n  });\\n\\n  // Self-activate this resource type (only once on mount)\\n  onMount(() => {\\n    resourcesStore.activateResource('notes');\\n    hasTriedLoading = true;\\n    \\n    return () => {\\n      unsubscribeResources();\\n      unsubscribeReference();\\n    };\\n  });\\n\\n  $: hasNotes = notes && notes.length > 0;\\n\\n  // Get actual selected resource metadata (not hardcoded defaults)\\n  function getSelectedResourceMetadata() {\\n    // Check if user has selected a specific resource configuration\\n    const selectedResource = mixedResources?.notes;\\n    \\n    return {\\n      organization: selectedResource?.organization || organization || 'unfoldingWord',\\n      languageId: selectedResource?.languageId || languageId || 'en'\\n    };\\n  }\\n\\n  // Handle breadcrumb navigation\\n  function handleStartNavigation(step = 'language') {\\n    console.log(\`Starting tN navigation at step: \${step}\`);\\n    forceNavigation = step;\\n  }\\n\\n  function handleNavigationComplete() {\\n    forceNavigation = null;\\n  }\\n\\n  function handleRcLinkInContent(rcUri) {\\n    if (onRcLinkClick) {\\n      const { organization: finalOrganization, languageId: finalLanguageId } = getSelectedResourceMetadata();\\n      onRcLinkClick(rcUri, finalLanguageId, finalOrganization);\\n    }\\n  }\\n\\n  function toggleCollapsibleNote(event) {\\n    event.stopPropagation();\\n    event.currentTarget.classList.toggle('expanded');\\n  }\\n\\n  // Get metadata from first note (all notes have same metadata)\\n  $: noteMetadata = notes[0] || {};\\n  $: selectedMetadata = getSelectedResourceMetadata();\\n  $: finalOrganization = selectedMetadata.organization || noteMetadata.organization || 'unfoldingWord';\\n  $: finalLanguageId = selectedMetadata.languageId || noteMetadata.languageId || 'en';\\n<\/script>\\n\\n<!-- Show navigation if forced navigation is active -->\\n{#if forceNavigation}\\n  <section data-testid=\\"translation-notes-panel\\" class=\\"translation-notes-panel\\">\\n    <InlineHelpsNavigation\\n      resourceType=\\"tn\\"\\n      currentReference={reference}\\n      onResourceSelect={onRcLinkClick}\\n      isResourceAvailable={hasNotes}\\n      {forceNavigation}\\n      onNavigationComplete={handleNavigationComplete}\\n    />\\n  </section>\\n<!-- Show empty verse state if we've tried loading and have no notes for this verse -->\\n{:else if hasTriedLoading && !hasNotes && reference?.verse}\\n  <section data-testid=\\"translation-notes-panel\\" class=\\"translation-notes-panel\\">\\n    <!-- Breadcrumbs -->\\n    <HelpsBreadcrumbs\\n      resourceType=\\"tn\\"\\n      languageId={selectedMetadata.languageId}\\n      organization={selectedMetadata.organization}\\n      onStartNavigation={handleStartNavigation}\\n    />\\n\\n    <h3 class=\\"panel-header\\">\\n      Notes\\n      {#if selectedMetadata.organization !== 'unfoldingWord'}\\n        <span class=\\"org-badge\\">from {selectedMetadata.organization}</span>\\n      {/if}\\n    </h3>\\n\\n    <ul class=\\"notes-list\\">\\n      <li class=\\"note-card\\">\\n        <div class=\\"note-text\\">\\n          No translation notes available for this verse.\\n        </div>\\n        <div class=\\"note-tags\\">\\n          Current verse: <strong>{reference.bookId} {reference.chapter}:{reference.verse}</strong>\\n        </div>\\n        <div class=\\"note-tags\\">\\n          Selected resource: <strong>{selectedMetadata.organization} • {selectedMetadata.languageId.toUpperCase()}</strong>\\n        </div>\\n      </li>\\n    </ul>\\n\\n    <div class=\\"tip-section\\">\\n      <p class=\\"tip-text\\">\\n        <span class=\\"tip-icon\\">💡</span>\\n        <span class=\\"tip-bold\\">Tip:</span> Try navigating to a different verse that may have more content, or select a different organization/language combination.\\n      </p>\\n    </div>\\n\\n    <!-- Resource Metadata Card - Moved to bottom -->\\n    <ResourceMetadataCard\\n      organization={selectedMetadata.organization}\\n      title=\\"Translation Notes\\"\\n      languageId={selectedMetadata.languageId}\\n      resourceType=\\"tn\\"\\n    />\\n  </section>\\n<!-- Show navigation if no notes available and haven't tried loading yet -->\\n{:else if !hasNotes}\\n  <section data-testid=\\"translation-notes-panel\\" class=\\"translation-notes-panel\\">\\n    <InlineHelpsNavigation\\n      resourceType=\\"tn\\"\\n      currentReference={reference}\\n      onResourceSelect={onRcLinkClick}\\n      isResourceAvailable={hasNotes}\\n      {forceNavigation}\\n      onNavigationComplete={handleNavigationComplete}\\n    />\\n  </section>\\n<!-- Show notes when available -->\\n{:else}\\n  <section data-testid=\\"translation-notes-panel\\" class=\\"translation-notes-panel\\">\\n    <!-- Breadcrumbs -->\\n    <HelpsBreadcrumbs\\n      resourceType=\\"tn\\"\\n      languageId={finalLanguageId}\\n      organization={finalOrganization}\\n      onStartNavigation={handleStartNavigation}\\n    />\\n\\n    <h3 class=\\"panel-header\\">\\n      Notes\\n      {#if finalOrganization !== 'unfoldingWord'}\\n        <span class=\\"org-badge\\">from {finalOrganization}</span>\\n      {/if}\\n    </h3>\\n\\n    <ul class=\\"notes-list\\">\\n      {#each notes as note (note.id)}\\n        <li class=\\"note-card\\">\\n          {#if note.quote}\\n            <div class=\\"note-quote\\">\\n              \\"{note.quote}\\"\\n              {#if note.occurrence && note.occurrence !== \\"1\\"}\\n                <span class=\\"note-occurrence\\"> (occurrence {note.occurrence})</span>\\n              {/if}\\n            </div>\\n          {/if}\\n          \\n          {#if (note.text || \\"\\").split(/\\\\r\\\\n|\\\\r|\\\\n/).length <= 10}\\n            <div class=\\"note-text\\">\\n              {@html processMarkdownWithRcLinks(note.text, handleRcLinkInContent)}\\n            </div>\\n          {:else}\\n            <div\\n              class=\\"note-text collapsible-note\\"\\n              on:click={toggleCollapsibleNote}\\n              on:keydown={toggleCollapsibleNote}\\n              title=\\"Click to expand/collapse\\"\\n            >\\n              {@html processMarkdownWithRcLinks(note.text, handleRcLinkInContent)}\\n            </div>\\n          {/if}\\n          \\n          {#if note.tags}\\n            <div class=\\"note-tags\\">Tags: {note.tags}</div>\\n          {/if}\\n          \\n          {#if note.supportReference}\\n            <div class=\\"note-support-reference\\">\\n              See also: {@html processMarkdownWithRcLinks(note.supportReference, handleRcLinkInContent)}\\n            </div>\\n          {/if}\\n        </li>\\n      {/each}\\n    </ul>\\n\\n    <!-- Resource Metadata Card - Moved to bottom -->\\n    <ResourceMetadataCard\\n      organization={finalOrganization}\\n      title=\\"Translation Notes\\"\\n      languageId={finalLanguageId}\\n      resourceType=\\"tn\\"\\n    />\\n  </section>\\n{/if}\\n\\n<style>\\n  .translation-notes-panel {\\n    padding: 1rem;\\n    background: var(--color-panel);\\n    border-radius: 8px;\\n    height: 100%;\\n    overflow-y: auto;\\n    display: flex;\\n    flex-direction: column;\\n    gap: 1rem;\\n  }\\n\\n  .panel-header {\\n    font-size: 1.2rem;\\n    font-weight: 600;\\n    margin: 0;\\n    color: var(--color-text);\\n    display: flex;\\n    align-items: center;\\n    gap: 0.5rem;\\n  }\\n\\n  .org-badge {\\n    background: var(--color-secondary-alpha);\\n    color: var(--color-secondary);\\n    padding: 0.2rem 0.5rem;\\n    border-radius: 4px;\\n    font-size: 0.8rem;\\n    font-weight: 500;\\n  }\\n\\n  .notes-list {\\n    list-style: none;\\n    padding: 0;\\n    margin: 0;\\n    display: flex;\\n    flex-direction: column;\\n    gap: 1rem;\\n  }\\n\\n  .note-card {\\n    background: var(--color-background);\\n    border: 1px solid var(--color-border);\\n    border-radius: 8px;\\n    padding: 1rem;\\n    display: flex;\\n    flex-direction: column;\\n    gap: 0.5rem;\\n    transition: all 0.2s ease;\\n  }\\n\\n  .note-card:hover {\\n    border-color: var(--color-primary-alpha);\\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\\n  }\\n\\n  .note-quote {\\n    font-style: italic;\\n    color: var(--color-primary);\\n    font-weight: 500;\\n    padding: 0.5rem;\\n    background: var(--color-primary-alpha);\\n    border-radius: 4px;\\n    border-left: 3px solid var(--color-primary);\\n  }\\n\\n  .note-occurrence {\\n    color: var(--color-text-secondary);\\n    font-size: 0.9rem;\\n  }\\n\\n  .note-text {\\n    line-height: 1.6;\\n    color: var(--color-text);\\n  }\\n\\n  .collapsible-note {\\n    max-height: 150px;\\n    overflow: hidden;\\n    cursor: pointer;\\n    position: relative;\\n    transition: max-height 0.3s ease;\\n  }\\n\\n  .collapsible-note:not(.expanded):after {\\n    content: '';\\n    position: absolute;\\n    bottom: 0;\\n    left: 0;\\n    right: 0;\\n    height: 50px;\\n    background: linear-gradient(transparent, var(--color-background));\\n    pointer-events: none;\\n  }\\n\\n  .collapsible-note.expanded {\\n    max-height: none;\\n  }\\n\\n  .collapsible-note:hover {\\n    background: var(--color-hover);\\n  }\\n\\n  .note-tags {\\n    font-size: 0.9rem;\\n    color: var(--color-text-secondary);\\n    font-style: italic;\\n  }\\n\\n  .note-support-reference {\\n    font-size: 0.9rem;\\n    color: var(--color-text-secondary);\\n    border-top: 1px solid var(--color-border);\\n    padding-top: 0.5rem;\\n  }\\n\\n  .tip-section {\\n    background: var(--color-warning-alpha);\\n    border: 1px solid var(--color-warning);\\n    border-radius: 8px;\\n    padding: 1rem;\\n    margin-top: 1rem;\\n  }\\n\\n  .tip-text {\\n    margin: 0;\\n    color: var(--color-text);\\n    display: flex;\\n    align-items: flex-start;\\n    gap: 0.5rem;\\n  }\\n\\n  .tip-icon {\\n    font-size: 1.2rem;\\n    flex-shrink: 0;\\n  }\\n\\n  .tip-bold {\\n    font-weight: 600;\\n    color: var(--color-warning);\\n  }\\n\\n  /* Responsive design */\\n  @media (max-width: 768px) {\\n    .translation-notes-panel {\\n      padding: 0.5rem;\\n    }\\n\\n    .panel-header {\\n      font-size: 1.1rem;\\n      flex-direction: column;\\n      align-items: flex-start;\\n      gap: 0.25rem;\\n    }\\n\\n    .org-badge {\\n      font-size: 0.75rem;\\n    }\\n\\n    .note-card {\\n      padding: 0.75rem;\\n    }\\n\\n    .collapsible-note {\\n      max-height: 120px;\\n    }\\n\\n    .tip-text {\\n      flex-direction: column;\\n      gap: 0.25rem;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"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"}`
};
const TranslationNotesPanel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let hasNotes;
  let noteMetadata;
  let selectedMetadata;
  let finalOrganization;
  let finalLanguageId;
  let { reference: reference2 } = $$props;
  let { onRcLinkClick = null } = $$props;
  let notes2 = [];
  let forceNavigation = null;
  let mixedResources2 = {};
  let organization2 = "unfoldingWord";
  let languageId2 = "en";
  resourcesStore.subscribe((resources2) => {
    notes2 = resources2.notes || [];
  });
  referenceStore.subscribe((refStore) => {
    mixedResources2 = refStore.mixedResources || {};
    organization2 = refStore.organization || "unfoldingWord";
    languageId2 = refStore.languageId || "en";
  });
  function getSelectedResourceMetadata() {
    const selectedResource = mixedResources2?.notes;
    return {
      organization: selectedResource?.organization || organization2 || "unfoldingWord",
      languageId: selectedResource?.languageId || languageId2 || "en"
    };
  }
  function handleStartNavigation(step = "language") {
    console.log(`Starting tN navigation at step: ${step}`);
    forceNavigation = step;
  }
  function handleNavigationComplete() {
    forceNavigation = null;
  }
  if ($$props.reference === void 0 && $$bindings.reference && reference2 !== void 0) $$bindings.reference(reference2);
  if ($$props.onRcLinkClick === void 0 && $$bindings.onRcLinkClick && onRcLinkClick !== void 0) $$bindings.onRcLinkClick(onRcLinkClick);
  $$result.css.add(css$a);
  hasNotes = notes2 && notes2.length > 0;
  noteMetadata = notes2[0] || {};
  selectedMetadata = getSelectedResourceMetadata();
  finalOrganization = selectedMetadata.organization || noteMetadata.organization || "unfoldingWord";
  finalLanguageId = selectedMetadata.languageId || noteMetadata.languageId || "en";
  return ` ${forceNavigation ? `<section data-testid="translation-notes-panel" class="translation-notes-panel svelte-1s93tdx">${validate_component(InlineHelpsNavigation, "InlineHelpsNavigation").$$render(
    $$result,
    {
      resourceType: "tn",
      currentReference: reference2,
      onResourceSelect: onRcLinkClick,
      isResourceAvailable: hasNotes,
      forceNavigation,
      onNavigationComplete: handleNavigationComplete
    },
    {},
    {}
  )}</section> ` : `${`${!hasNotes ? `<section data-testid="translation-notes-panel" class="translation-notes-panel svelte-1s93tdx">${validate_component(InlineHelpsNavigation, "InlineHelpsNavigation").$$render(
    $$result,
    {
      resourceType: "tn",
      currentReference: reference2,
      onResourceSelect: onRcLinkClick,
      isResourceAvailable: hasNotes,
      forceNavigation,
      onNavigationComplete: handleNavigationComplete
    },
    {},
    {}
  )}</section> ` : `<section data-testid="translation-notes-panel" class="translation-notes-panel svelte-1s93tdx"> ${validate_component(HelpsBreadcrumbs, "HelpsBreadcrumbs").$$render(
    $$result,
    {
      resourceType: "tn",
      languageId: finalLanguageId,
      organization: finalOrganization,
      onStartNavigation: handleStartNavigation
    },
    {},
    {}
  )} <h3 class="panel-header svelte-1s93tdx">Notes
      ${finalOrganization !== "unfoldingWord" ? `<span class="org-badge svelte-1s93tdx">from ${escape(finalOrganization)}</span>` : ``}</h3> <ul class="notes-list svelte-1s93tdx">${each(notes2, (note) => {
    return `<li class="note-card svelte-1s93tdx">${note.quote ? `<div class="note-quote svelte-1s93tdx">&quot;${escape(note.quote)}&quot;
              ${note.occurrence && note.occurrence !== "1" ? `<span class="note-occurrence svelte-1s93tdx">(occurrence ${escape(note.occurrence)})</span>` : ``} </div>` : ``} ${(note.text || "").split(/\r\n|\r|\n/).length <= 10 ? `<div class="note-text svelte-1s93tdx"><!-- HTML_TAG_START -->${processMarkdownWithRcLinks(note.text)}<!-- HTML_TAG_END --> </div>` : `<div class="note-text collapsible-note svelte-1s93tdx" title="Click to expand/collapse"><!-- HTML_TAG_START -->${processMarkdownWithRcLinks(note.text)}<!-- HTML_TAG_END --> </div>`} ${note.tags ? `<div class="note-tags svelte-1s93tdx">Tags: ${escape(note.tags)}</div>` : ``} ${note.supportReference ? `<div class="note-support-reference svelte-1s93tdx">See also: <!-- HTML_TAG_START -->${processMarkdownWithRcLinks(note.supportReference)}<!-- HTML_TAG_END --> </div>` : ``} </li>`;
  })}</ul>  ${validate_component(ResourceMetadataCard, "ResourceMetadataCard").$$render(
    $$result,
    {
      organization: finalOrganization,
      title: "Translation Notes",
      languageId: finalLanguageId,
      resourceType: "tn"
    },
    {},
    {}
  )}</section>`}`}`}`;
});
const css$9 = {
  code: ".translation-questions-panel.svelte-b0zmje.svelte-b0zmje{padding:1rem;background:var(--color-panel);border-radius:8px;height:100%;overflow-y:auto;display:flex;flex-direction:column;gap:1rem}.panel-header.svelte-b0zmje.svelte-b0zmje{font-size:1.2rem;font-weight:600;margin:0;color:var(--color-text);display:flex;align-items:center;gap:0.5rem}.org-badge.svelte-b0zmje.svelte-b0zmje{background:var(--color-secondary-alpha);color:var(--color-secondary);padding:0.2rem 0.5rem;border-radius:4px;font-size:0.8rem;font-weight:500}.questions-list.svelte-b0zmje.svelte-b0zmje{display:flex;flex-direction:column;gap:1rem}.question-card.svelte-b0zmje.svelte-b0zmje{background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;padding:1rem;display:flex;flex-direction:column;gap:0.75rem;transition:all 0.2s ease}.question-card.svelte-b0zmje.svelte-b0zmje:hover{border-color:var(--color-primary-alpha);box-shadow:0 2px 8px rgba(0, 0, 0, 0.1)}.question-text.svelte-b0zmje.svelte-b0zmje{color:var(--color-text);line-height:1.6;padding:0.5rem;background:var(--color-primary-alpha);border-radius:4px;border-left:3px solid var(--color-primary)}.question-text.svelte-b0zmje strong.svelte-b0zmje{color:var(--color-primary);font-weight:600}.answer-text.svelte-b0zmje.svelte-b0zmje{color:var(--color-text);line-height:1.6;padding:0.5rem;background:var(--color-success-alpha);border-radius:4px;border-left:3px solid var(--color-success)}.answer-text.svelte-b0zmje strong.svelte-b0zmje{color:var(--color-success);font-weight:600}.tip-section.svelte-b0zmje.svelte-b0zmje{background:var(--color-warning-alpha);border:1px solid var(--color-warning);border-radius:8px;padding:1rem;margin-top:1rem}.tip-text.svelte-b0zmje.svelte-b0zmje{margin:0;color:var(--color-text);display:flex;align-items:flex-start;gap:0.5rem}.tip-icon.svelte-b0zmje.svelte-b0zmje{font-size:1.2rem;flex-shrink:0}.tip-bold.svelte-b0zmje.svelte-b0zmje{font-weight:600;color:var(--color-warning)}@media(max-width: 768px){.translation-questions-panel.svelte-b0zmje.svelte-b0zmje{padding:0.5rem}.panel-header.svelte-b0zmje.svelte-b0zmje{font-size:1.1rem;flex-direction:column;align-items:flex-start;gap:0.25rem}.org-badge.svelte-b0zmje.svelte-b0zmje{font-size:0.75rem}.question-card.svelte-b0zmje.svelte-b0zmje{padding:0.75rem}.question-text.svelte-b0zmje.svelte-b0zmje,.answer-text.svelte-b0zmje.svelte-b0zmje{padding:0.4rem}.tip-text.svelte-b0zmje.svelte-b0zmje{flex-direction:column;gap:0.25rem}}",
  map: `{"version":3,"file":"TranslationQuestionsPanel.svelte","sources":["TranslationQuestionsPanel.svelte"],"sourcesContent":["<script>\\n  import { onMount } from 'svelte';\\n  import { resourcesStore } from '$lib/stores/resources.js';\\n  import { referenceStore } from '$lib/stores/reference.js';\\n  import { processMarkdownWithRcLinks } from '$lib/utils/markdownUtils.js';\\n  import InlineHelpsNavigation from './InlineHelpsNavigation.svelte';\\n  import ResourceMetadataCard from './shared/ResourceMetadataCard.svelte';\\n  import HelpsBreadcrumbs from './shared/HelpsBreadcrumbs.svelte';\\n\\n  export let reference;\\n  export let onRcLinkClick = null;\\n\\n  let questions = [];\\n  let forceNavigation = null;\\n  let hasTriedLoading = false;\\n  let mixedResources = {};\\n  let organization = 'unfoldingWord';\\n  let languageId = 'en';\\n\\n  // Subscribe to stores\\n  const unsubscribeResources = resourcesStore.subscribe((resources) => {\\n    questions = resources.questions || [];\\n  });\\n\\n  const unsubscribeReference = referenceStore.subscribe((refStore) => {\\n    mixedResources = refStore.mixedResources || {};\\n    organization = refStore.organization || 'unfoldingWord';\\n    languageId = refStore.languageId || 'en';\\n  });\\n\\n  // Self-activate this resource type\\n  onMount(() => {\\n    console.log('🎯 TranslationQuestionsPanel: Self-activating questions resource');\\n    resourcesStore.activateResource('questions');\\n    hasTriedLoading = true;\\n    \\n    return () => {\\n      unsubscribeResources();\\n      unsubscribeReference();\\n    };\\n  });\\n\\n  $: hasQuestions = questions && questions.length > 0;\\n\\n  // Get actual selected resource metadata (not hardcoded defaults)\\n  function getSelectedResourceMetadata() {\\n    // Check if user has selected a specific resource configuration\\n    const selectedResource = mixedResources?.questions;\\n    \\n    return {\\n      organization: selectedResource?.organization || organization || 'unfoldingWord',\\n      languageId: selectedResource?.languageId || languageId || 'en'\\n    };\\n  }\\n\\n  // Handle breadcrumb navigation\\n  function handleStartNavigation(step = 'language') {\\n    console.log(\`Starting tQ navigation at step: \${step}\`);\\n    forceNavigation = step;\\n  }\\n\\n  function handleNavigationComplete() {\\n    forceNavigation = null;\\n  }\\n\\n  function handleRcLinkInContent(rcUri) {\\n    if (onRcLinkClick) {\\n      const { organization: finalOrganization, languageId: finalLanguageId } = getSelectedResourceMetadata();\\n      onRcLinkClick(rcUri, finalLanguageId, finalOrganization);\\n    }\\n  }\\n\\n  // Get metadata from first question (all questions have same metadata)\\n  $: questionMetadata = questions[0] || {};\\n  $: selectedMetadata = getSelectedResourceMetadata();\\n  $: finalOrganization = selectedMetadata.organization || questionMetadata.organization || 'unfoldingWord';\\n  $: finalLanguageId = selectedMetadata.languageId || questionMetadata.languageId || 'en';\\n\\n  // Debug logging\\n  $: console.log('🎯 TranslationQuestionsPanel: Rendering with', questions.length, 'questions');\\n<\/script>\\n\\n<!-- Show navigation if forced navigation is active -->\\n{#if forceNavigation}\\n  <section data-testid=\\"translation-questions-panel\\" class=\\"translation-questions-panel\\">\\n    <InlineHelpsNavigation\\n      resourceType=\\"tq\\"\\n      currentReference={reference}\\n      onResourceSelect={onRcLinkClick}\\n      isResourceAvailable={hasQuestions}\\n      {forceNavigation}\\n      onNavigationComplete={handleNavigationComplete}\\n    />\\n  </section>\\n<!-- Show empty verse state if we've tried loading and have no questions for this verse -->\\n{:else if hasTriedLoading && !hasQuestions && reference?.verse}\\n  <section data-testid=\\"translation-questions-panel\\" class=\\"translation-questions-panel\\">\\n    <!-- Breadcrumbs -->\\n    <HelpsBreadcrumbs\\n      resourceType=\\"tq\\"\\n      languageId={selectedMetadata.languageId}\\n      organization={selectedMetadata.organization}\\n      onStartNavigation={handleStartNavigation}\\n    />\\n\\n    <h3 class=\\"panel-header\\">\\n      Questions\\n      {#if selectedMetadata.organization !== 'unfoldingWord'}\\n        <span class=\\"org-badge\\">from {selectedMetadata.organization}</span>\\n      {/if}\\n    </h3>\\n\\n    <div class=\\"questions-list\\">\\n      <div class=\\"question-card\\">\\n        <div class=\\"question-text\\">\\n          <strong>Q:</strong> No translation questions available for this verse.\\n        </div>\\n        <div class=\\"answer-text\\">\\n          <strong>A:</strong> Current verse: <strong>{reference.bookId} {reference.chapter}:{reference.verse}</strong>\\n        </div>\\n        <div class=\\"answer-text\\">\\n          Selected resource: <strong>{selectedMetadata.organization} • {selectedMetadata.languageId.toUpperCase()}</strong>\\n        </div>\\n      </div>\\n    </div>\\n\\n    <div class=\\"tip-section\\">\\n      <p class=\\"tip-text\\">\\n        <span class=\\"tip-icon\\">💡</span>\\n        <span class=\\"tip-bold\\">Tip:</span> Try navigating to a different verse that may have more content, or select a different organization/language combination.\\n      </p>\\n    </div>\\n\\n    <!-- Resource Metadata Card - Moved to bottom -->\\n    <ResourceMetadataCard\\n      organization={selectedMetadata.organization}\\n      title=\\"Translation Questions\\"\\n      languageId={selectedMetadata.languageId}\\n      resourceType=\\"tq\\"\\n    />\\n  </section>\\n<!-- Show navigation if no questions available and haven't tried loading yet -->\\n{:else if !hasQuestions}\\n  <section data-testid=\\"translation-questions-panel\\" class=\\"translation-questions-panel\\">\\n    <InlineHelpsNavigation\\n      resourceType=\\"tq\\"\\n      currentReference={reference}\\n      onResourceSelect={onRcLinkClick}\\n      isResourceAvailable={hasQuestions}\\n      {forceNavigation}\\n      onNavigationComplete={handleNavigationComplete}\\n    />\\n  </section>\\n<!-- Show questions when available -->\\n{:else}\\n  <section data-testid=\\"translation-questions-panel\\" class=\\"translation-questions-panel\\">\\n    <!-- Breadcrumbs -->\\n    <HelpsBreadcrumbs\\n      resourceType=\\"tq\\"\\n      languageId={finalLanguageId}\\n      organization={finalOrganization}\\n      onStartNavigation={handleStartNavigation}\\n    />\\n\\n    <h3 class=\\"panel-header\\">\\n      Questions\\n      {#if finalOrganization !== 'unfoldingWord'}\\n        <span class=\\"org-badge\\">from {finalOrganization}</span>\\n      {/if}\\n    </h3>\\n\\n    <div class=\\"questions-list\\">\\n      {#each questions as qa (qa.id)}\\n        <div class=\\"question-card\\">\\n          <div class=\\"question-text\\">\\n            <strong>Q:</strong> {@html processMarkdownWithRcLinks(qa.question, handleRcLinkInContent)}\\n          </div>\\n          <div class=\\"answer-text\\">\\n            <strong>A:</strong> {@html processMarkdownWithRcLinks(qa.answer, handleRcLinkInContent)}\\n          </div>\\n        </div>\\n      {/each}\\n    </div>\\n\\n    <!-- Resource Metadata Card - Moved to bottom -->\\n    <ResourceMetadataCard\\n      organization={finalOrganization}\\n      title=\\"Translation Questions\\"\\n      languageId={finalLanguageId}\\n      resourceType=\\"tq\\"\\n    />\\n  </section>\\n{/if}\\n\\n<style>\\n  .translation-questions-panel {\\n    padding: 1rem;\\n    background: var(--color-panel);\\n    border-radius: 8px;\\n    height: 100%;\\n    overflow-y: auto;\\n    display: flex;\\n    flex-direction: column;\\n    gap: 1rem;\\n  }\\n\\n  .panel-header {\\n    font-size: 1.2rem;\\n    font-weight: 600;\\n    margin: 0;\\n    color: var(--color-text);\\n    display: flex;\\n    align-items: center;\\n    gap: 0.5rem;\\n  }\\n\\n  .org-badge {\\n    background: var(--color-secondary-alpha);\\n    color: var(--color-secondary);\\n    padding: 0.2rem 0.5rem;\\n    border-radius: 4px;\\n    font-size: 0.8rem;\\n    font-weight: 500;\\n  }\\n\\n  .questions-list {\\n    display: flex;\\n    flex-direction: column;\\n    gap: 1rem;\\n  }\\n\\n  .question-card {\\n    background: var(--color-background);\\n    border: 1px solid var(--color-border);\\n    border-radius: 8px;\\n    padding: 1rem;\\n    display: flex;\\n    flex-direction: column;\\n    gap: 0.75rem;\\n    transition: all 0.2s ease;\\n  }\\n\\n  .question-card:hover {\\n    border-color: var(--color-primary-alpha);\\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\\n  }\\n\\n  .question-text {\\n    color: var(--color-text);\\n    line-height: 1.6;\\n    padding: 0.5rem;\\n    background: var(--color-primary-alpha);\\n    border-radius: 4px;\\n    border-left: 3px solid var(--color-primary);\\n  }\\n\\n  .question-text strong {\\n    color: var(--color-primary);\\n    font-weight: 600;\\n  }\\n\\n  .answer-text {\\n    color: var(--color-text);\\n    line-height: 1.6;\\n    padding: 0.5rem;\\n    background: var(--color-success-alpha);\\n    border-radius: 4px;\\n    border-left: 3px solid var(--color-success);\\n  }\\n\\n  .answer-text strong {\\n    color: var(--color-success);\\n    font-weight: 600;\\n  }\\n\\n  .tip-section {\\n    background: var(--color-warning-alpha);\\n    border: 1px solid var(--color-warning);\\n    border-radius: 8px;\\n    padding: 1rem;\\n    margin-top: 1rem;\\n  }\\n\\n  .tip-text {\\n    margin: 0;\\n    color: var(--color-text);\\n    display: flex;\\n    align-items: flex-start;\\n    gap: 0.5rem;\\n  }\\n\\n  .tip-icon {\\n    font-size: 1.2rem;\\n    flex-shrink: 0;\\n  }\\n\\n  .tip-bold {\\n    font-weight: 600;\\n    color: var(--color-warning);\\n  }\\n\\n  /* Responsive design */\\n  @media (max-width: 768px) {\\n    .translation-questions-panel {\\n      padding: 0.5rem;\\n    }\\n\\n    .panel-header {\\n      font-size: 1.1rem;\\n      flex-direction: column;\\n      align-items: flex-start;\\n      gap: 0.25rem;\\n    }\\n\\n    .org-badge {\\n      font-size: 0.75rem;\\n    }\\n\\n    .question-card {\\n      padding: 0.75rem;\\n    }\\n\\n    .question-text,\\n    .answer-text {\\n      padding: 0.4rem;\\n    }\\n\\n    .tip-text {\\n      flex-direction: column;\\n      gap: 0.25rem;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"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"}`
};
const TranslationQuestionsPanel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let hasQuestions;
  let questionMetadata;
  let selectedMetadata;
  let finalOrganization;
  let finalLanguageId;
  let { reference: reference2 } = $$props;
  let { onRcLinkClick = null } = $$props;
  let questions2 = [];
  let forceNavigation = null;
  let mixedResources2 = {};
  let organization2 = "unfoldingWord";
  let languageId2 = "en";
  resourcesStore.subscribe((resources2) => {
    questions2 = resources2.questions || [];
  });
  referenceStore.subscribe((refStore) => {
    mixedResources2 = refStore.mixedResources || {};
    organization2 = refStore.organization || "unfoldingWord";
    languageId2 = refStore.languageId || "en";
  });
  function getSelectedResourceMetadata() {
    const selectedResource = mixedResources2?.questions;
    return {
      organization: selectedResource?.organization || organization2 || "unfoldingWord",
      languageId: selectedResource?.languageId || languageId2 || "en"
    };
  }
  function handleStartNavigation(step = "language") {
    console.log(`Starting tQ navigation at step: ${step}`);
    forceNavigation = step;
  }
  function handleNavigationComplete() {
    forceNavigation = null;
  }
  if ($$props.reference === void 0 && $$bindings.reference && reference2 !== void 0) $$bindings.reference(reference2);
  if ($$props.onRcLinkClick === void 0 && $$bindings.onRcLinkClick && onRcLinkClick !== void 0) $$bindings.onRcLinkClick(onRcLinkClick);
  $$result.css.add(css$9);
  hasQuestions = questions2 && questions2.length > 0;
  questionMetadata = questions2[0] || {};
  selectedMetadata = getSelectedResourceMetadata();
  finalOrganization = selectedMetadata.organization || questionMetadata.organization || "unfoldingWord";
  finalLanguageId = selectedMetadata.languageId || questionMetadata.languageId || "en";
  {
    console.log("🎯 TranslationQuestionsPanel: Rendering with", questions2.length, "questions");
  }
  return ` ${forceNavigation ? `<section data-testid="translation-questions-panel" class="translation-questions-panel svelte-b0zmje">${validate_component(InlineHelpsNavigation, "InlineHelpsNavigation").$$render(
    $$result,
    {
      resourceType: "tq",
      currentReference: reference2,
      onResourceSelect: onRcLinkClick,
      isResourceAvailable: hasQuestions,
      forceNavigation,
      onNavigationComplete: handleNavigationComplete
    },
    {},
    {}
  )}</section> ` : `${`${!hasQuestions ? `<section data-testid="translation-questions-panel" class="translation-questions-panel svelte-b0zmje">${validate_component(InlineHelpsNavigation, "InlineHelpsNavigation").$$render(
    $$result,
    {
      resourceType: "tq",
      currentReference: reference2,
      onResourceSelect: onRcLinkClick,
      isResourceAvailable: hasQuestions,
      forceNavigation,
      onNavigationComplete: handleNavigationComplete
    },
    {},
    {}
  )}</section> ` : `<section data-testid="translation-questions-panel" class="translation-questions-panel svelte-b0zmje"> ${validate_component(HelpsBreadcrumbs, "HelpsBreadcrumbs").$$render(
    $$result,
    {
      resourceType: "tq",
      languageId: finalLanguageId,
      organization: finalOrganization,
      onStartNavigation: handleStartNavigation
    },
    {},
    {}
  )} <h3 class="panel-header svelte-b0zmje">Questions
      ${finalOrganization !== "unfoldingWord" ? `<span class="org-badge svelte-b0zmje">from ${escape(finalOrganization)}</span>` : ``}</h3> <div class="questions-list svelte-b0zmje">${each(questions2, (qa) => {
    return `<div class="question-card svelte-b0zmje"><div class="question-text svelte-b0zmje"><strong class="svelte-b0zmje" data-svelte-h="svelte-1pyeh1v">Q:</strong> <!-- HTML_TAG_START -->${processMarkdownWithRcLinks(qa.question)}<!-- HTML_TAG_END --></div> <div class="answer-text svelte-b0zmje"><strong class="svelte-b0zmje" data-svelte-h="svelte-8s7sg3">A:</strong> <!-- HTML_TAG_START -->${processMarkdownWithRcLinks(qa.answer)}<!-- HTML_TAG_END --></div> </div>`;
  })}</div>  ${validate_component(ResourceMetadataCard, "ResourceMetadataCard").$$render(
    $$result,
    {
      organization: finalOrganization,
      title: "Translation Questions",
      languageId: finalLanguageId,
      resourceType: "tq"
    },
    {},
    {}
  )}</section>`}`}`}`;
});
function processRcLinks(text, onRcLinkClick) {
  if (!text || typeof text !== "string") {
    return text;
  }
  const rcLinkRegex = /rc:\/\/[^\s)]+/g;
  return text.replace(rcLinkRegex, (match) => {
    return `<button class="rc-link-button" data-rc-uri="${match}" style="background: none; border: none; color: var(--color-primary); text-decoration: underline; cursor: pointer; padding: 0; font: inherit; display: inline;" title="Navigate to ${match}">${match}</button>`;
  });
}
const css$8 = {
  code: ".rc-link.svelte-1pkvw2a{background:none;border:none;color:var(--color-primary);text-decoration:underline;cursor:pointer;padding:0;font:inherit;display:inline;transition:color 0.2s ease}.rc-link.svelte-1pkvw2a:hover{color:var(--color-primary-hover)}.rc-link.svelte-1pkvw2a:focus{outline:2px solid var(--color-primary);outline-offset:1px}",
  map: '{"version":3,"file":"RcLink.svelte","sources":["RcLink.svelte"],"sourcesContent":["<script>\\n  export let rcUri;\\n  export let onRcLinkClick = null;\\n\\n  function handleClick(event) {\\n    event.preventDefault();\\n    if (onRcLinkClick) {\\n      onRcLinkClick(rcUri);\\n    }\\n  }\\n<\/script>\\n\\n<button\\n  on:click={handleClick}\\n  class=\\"rc-link\\"\\n  title=\\"Navigate to {rcUri}\\"\\n>\\n  <slot>{rcUri}</slot>\\n</button>\\n\\n<style>\\n  .rc-link {\\n    background: none;\\n    border: none;\\n    color: var(--color-primary);\\n    text-decoration: underline;\\n    cursor: pointer;\\n    padding: 0;\\n    font: inherit;\\n    display: inline;\\n    transition: color 0.2s ease;\\n  }\\n\\n  .rc-link:hover {\\n    color: var(--color-primary-hover);\\n  }\\n\\n  .rc-link:focus {\\n    outline: 2px solid var(--color-primary);\\n    outline-offset: 1px;\\n  }\\n</style>"],"names":[],"mappings":"AAqBE,uBAAS,CACP,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,eAAe,CAAC,CAC3B,eAAe,CAAE,SAAS,CAC1B,MAAM,CAAE,OAAO,CACf,OAAO,CAAE,CAAC,CACV,IAAI,CAAE,OAAO,CACb,OAAO,CAAE,MAAM,CACf,UAAU,CAAE,KAAK,CAAC,IAAI,CAAC,IACzB,CAEA,uBAAQ,MAAO,CACb,KAAK,CAAE,IAAI,qBAAqB,CAClC,CAEA,uBAAQ,MAAO,CACb,OAAO,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,eAAe,CAAC,CACvC,cAAc,CAAE,GAClB"}'
};
const RcLink = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { rcUri } = $$props;
  let { onRcLinkClick = null } = $$props;
  if ($$props.rcUri === void 0 && $$bindings.rcUri && rcUri !== void 0) $$bindings.rcUri(rcUri);
  if ($$props.onRcLinkClick === void 0 && $$bindings.onRcLinkClick && onRcLinkClick !== void 0) $$bindings.onRcLinkClick(onRcLinkClick);
  $$result.css.add(css$8);
  return `<button class="rc-link svelte-1pkvw2a" title="${"Navigate to " + escape(rcUri, true)}">${slots.default ? slots.default({}) : `${escape(rcUri)}`} </button>`;
});
const css$7 = {
  code: ".translation-words-panel.svelte-rcfbaw{padding:1rem;background:var(--color-panel);border-radius:8px;height:100%;overflow-y:auto;display:flex;flex-direction:column;gap:1rem}.empty-state.svelte-rcfbaw{text-align:center;color:var(--color-text-secondary);font-style:italic;padding:2rem}.panel-header.svelte-rcfbaw{font-size:1.2rem;font-weight:600;margin:0;color:var(--color-text);display:flex;align-items:center;gap:0.5rem}.org-badge.svelte-rcfbaw{background:var(--color-secondary-alpha);color:var(--color-secondary);padding:0.2rem 0.5rem;border-radius:4px;font-size:0.8rem;font-weight:500}.words-list.svelte-rcfbaw{display:flex;flex-direction:column;gap:1rem}.word-card.svelte-rcfbaw{background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;padding:1rem;display:flex;flex-direction:column;gap:0.5rem;transition:all 0.2s ease;cursor:pointer}.word-card.svelte-rcfbaw:hover{border-color:var(--color-primary-alpha);box-shadow:0 2px 8px rgba(0, 0, 0, 0.1)}.word-card.non-clickable.svelte-rcfbaw{cursor:default}.word-title.svelte-rcfbaw{font-size:1.1rem;font-weight:600;margin:0;color:var(--color-primary);display:flex;align-items:center;justify-content:space-between;gap:0.5rem}.click-indicator.svelte-rcfbaw{font-size:0.8rem;color:var(--color-text-secondary);font-weight:400;font-style:italic}.word-summary.svelte-rcfbaw{color:var(--color-text);line-height:1.6;margin:0}.visually-hidden.svelte-rcfbaw{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);white-space:nowrap;border:0}.rc-link.svelte-rcfbaw{font-size:0.9rem;color:var(--color-text-secondary);margin:0;font-family:monospace}.tip-section.svelte-rcfbaw{background:var(--color-info-alpha);border:1px solid var(--color-info);border-radius:8px;padding:1rem;margin-top:1rem}.tip-text.svelte-rcfbaw{margin:0;color:var(--color-text);display:flex;align-items:flex-start;gap:0.5rem}.tip-icon.svelte-rcfbaw{font-size:1.2rem;flex-shrink:0}.tip-bold.svelte-rcfbaw{font-weight:600;color:var(--color-info)}.debug-info.svelte-rcfbaw{background:var(--color-warning-alpha);border:1px solid var(--color-warning);border-radius:8px;padding:1rem;margin-top:1rem}.debug-summary.svelte-rcfbaw{cursor:pointer;font-weight:600;color:var(--color-warning);margin-bottom:0.5rem}.debug-list.svelte-rcfbaw{list-style-type:disc;padding-left:1.5rem;margin:0.5rem 0}.debug-item.svelte-rcfbaw{color:var(--color-text-secondary);font-size:0.9rem;font-family:monospace;margin-bottom:0.25rem}@media(max-width: 768px){.translation-words-panel.svelte-rcfbaw{padding:0.5rem}.panel-header.svelte-rcfbaw{font-size:1.1rem;flex-direction:column;align-items:flex-start;gap:0.25rem}.org-badge.svelte-rcfbaw{font-size:0.75rem}.word-card.svelte-rcfbaw{padding:0.75rem}.word-title.svelte-rcfbaw{font-size:1rem;flex-direction:column;align-items:flex-start;gap:0.25rem}.click-indicator.svelte-rcfbaw{font-size:0.75rem}.tip-text.svelte-rcfbaw{flex-direction:column;gap:0.25rem}}",
  map: `{"version":3,"file":"TranslationWordsPanel.svelte","sources":["TranslationWordsPanel.svelte"],"sourcesContent":["<script>\\n  import { onMount } from 'svelte';\\n  import { resourcesStore } from '$lib/stores/resources.js';\\n  import { referenceStore } from '$lib/stores/reference.js';\\n  import { processRcLinks } from '$lib/utils/rcLinkUtils.js';\\n  import RcLink from './shared/RcLink.svelte';\\n  import InlineHelpsNavigation from './InlineHelpsNavigation.svelte';\\n  import ResourceMetadataCard from './shared/ResourceMetadataCard.svelte';\\n  import HelpsBreadcrumbs from './shared/HelpsBreadcrumbs.svelte';\\n\\n  export let reference;\\n  export let onWordClick = null;\\n  export let onRcLinkClick = null;\\n\\n  let words = [];\\n  let links = [];\\n  let forceNavigation = null;\\n  let hasTriedLoading = false;\\n  let mixedResources = {};\\n  let organization = 'unfoldingWord';\\n  let languageId = 'en';\\n\\n  // Subscribe to stores\\n  const unsubscribeResources = resourcesStore.subscribe((resources) => {\\n    words = resources.words || [];\\n    links = resources.links || [];\\n  });\\n\\n  const unsubscribeReference = referenceStore.subscribe((refStore) => {\\n    mixedResources = refStore.mixedResources || {};\\n    organization = refStore.organization || 'unfoldingWord';\\n    languageId = refStore.languageId || 'en';\\n  });\\n\\n  // Self-activate both words and links resource types\\n  onMount(() => {\\n    console.log('🎯 TranslationWordsPanel: Self-activating words and links resources');\\n    resourcesStore.activateResource('words');\\n    resourcesStore.activateResource('links');\\n    hasTriedLoading = true;\\n    \\n    return () => {\\n      unsubscribeResources();\\n      unsubscribeReference();\\n    };\\n  });\\n\\n  $: hasWords = words && words.length > 0;\\n\\n  // Get actual selected resource metadata (not hardcoded defaults)\\n  function getSelectedResourceMetadata() {\\n    // Check if user has selected a specific resource configuration\\n    const selectedResource = mixedResources?.words;\\n    \\n    return {\\n      organization: selectedResource?.organization || organization || 'unfoldingWord',\\n      languageId: selectedResource?.languageId || languageId || 'en'\\n    };\\n  }\\n\\n  // Handle breadcrumb navigation\\n  function handleStartNavigation(step = 'language') {\\n    console.log(\`Starting tW navigation at step: \${step}\`);\\n    forceNavigation = step;\\n  }\\n\\n  function handleNavigationComplete() {\\n    forceNavigation = null;\\n  }\\n\\n  /**\\n   * Extracts a summary from article content (first sentence or paragraph)\\n   * @param {string} content - Article content\\n   * @returns {string} Summary text\\n   */\\n  function extractSummary(content) {\\n    if (!content) return \\"\\";\\n\\n    // Find first definition section or paragraph\\n    const lines = content.split(\\"\\\\n\\");\\n    for (const line of lines) {\\n      const trimmed = line.trim();\\n      // Skip empty lines and headers\\n      if (!trimmed || trimmed.startsWith(\\"#\\")) continue;\\n\\n      // Return first meaningful sentence/paragraph\\n      if (trimmed.length > 20) {\\n        return trimmed.split(\\".\\")[0] + \\".\\";\\n      }\\n    }\\n\\n    return content.substring(0, 150) + (content.length > 150 ? \\"...\\" : \\"\\");\\n  }\\n\\n  function handleWordClick(word) {\\n    // First try the provided callback\\n    if (onWordClick) {\\n      onWordClick(word);\\n      return;\\n    }\\n\\n    // If no callback provided, and we have the rc link context, open as new tab\\n    if (onRcLinkClick && word.rcUri) {\\n      onRcLinkClick(word.rcUri, word.languageId, word.organization);\\n    }\\n  }\\n\\n  function handleRcLinkInContent(rcUri) {\\n    if (onRcLinkClick) {\\n      const { organization: finalOrganization, languageId: finalLanguageId } = getSelectedResourceMetadata();\\n      onRcLinkClick(rcUri, finalLanguageId, finalOrganization);\\n    }\\n  }\\n\\n  function handleRcLinkClick(rcUri, languageId, organization) {\\n    if (onRcLinkClick) {\\n      onRcLinkClick(rcUri, languageId, organization);\\n    }\\n  }\\n\\n  // Get metadata from first word (all words have same metadata)\\n  $: wordMetadata = words[0] || {};\\n  $: selectedMetadata = getSelectedResourceMetadata();\\n  $: finalOrganization = selectedMetadata.organization || wordMetadata.organization || 'unfoldingWord';\\n  $: finalLanguageId = selectedMetadata.languageId || wordMetadata.languageId || 'en';\\n\\n  // Debug logging\\n  $: console.log('🎯 TranslationWordsPanel: Rendering with', words.length, 'words and', links.length, 'links');\\n<\/script>\\n\\n{#if !reference?.verse}\\n  <section data-testid=\\"translation-words-panel\\" class=\\"translation-words-panel\\">\\n    <p class=\\"empty-state\\">Select a verse to view translation words.</p>\\n  </section>\\n<!-- Show navigation if forced navigation is active -->\\n{:else if forceNavigation}\\n  <section data-testid=\\"translation-words-panel\\" class=\\"translation-words-panel\\">\\n    <InlineHelpsNavigation\\n      resourceType=\\"tw\\"\\n      currentReference={reference}\\n      onResourceSelect={onRcLinkClick}\\n      isResourceAvailable={hasWords}\\n      {forceNavigation}\\n      onNavigationComplete={handleNavigationComplete}\\n    />\\n    {#if links.length > 0}\\n      <details class=\\"debug-info\\">\\n        <summary class=\\"debug-summary\\">Debug Info</summary>\\n        <p>Found {links.length} TWL link(s) for this verse:</p>\\n        <ul class=\\"debug-list\\">\\n          {#each links as link, index}\\n            <li class=\\"debug-item\\">\\n              {typeof link === 'string' ? link : link.rcLink || 'Unknown link'}\\n            </li>\\n          {/each}\\n        </ul>\\n      </details>\\n    {/if}\\n  </section>\\n<!-- Show empty verse state if we've tried loading and have no words for this verse -->\\n{:else if hasTriedLoading && !hasWords && reference?.verse}\\n  <section data-testid=\\"translation-words-panel\\" class=\\"translation-words-panel\\">\\n    <!-- Breadcrumbs -->\\n    <HelpsBreadcrumbs\\n      resourceType=\\"tw\\"\\n      languageId={selectedMetadata.languageId}\\n      organization={selectedMetadata.organization}\\n      onStartNavigation={handleStartNavigation}\\n    />\\n\\n    <h3 class=\\"panel-header\\">\\n      Words\\n      {#if selectedMetadata.organization !== 'unfoldingWord'}\\n        <span class=\\"org-badge\\">from {selectedMetadata.organization}</span>\\n      {/if}\\n    </h3>\\n\\n    <div class=\\"words-list\\">\\n      <div class=\\"word-card\\">\\n        <h4 class=\\"word-title\\">\\n          No Translation Words\\n        </h4>\\n        <p class=\\"word-summary\\">\\n          No translation words are linked to this verse.\\n        </p>\\n        <p class=\\"rc-link\\">\\n          Current verse: <strong>{reference.bookId} {reference.chapter}:{reference.verse}</strong>\\n        </p>\\n        <p class=\\"rc-link\\">\\n          Selected resource: <strong>{selectedMetadata.organization} • {selectedMetadata.languageId.toUpperCase()}</strong>\\n        </p>\\n      </div>\\n\\n      <div class=\\"tip-section\\">\\n        <p class=\\"tip-text\\">\\n          <span class=\\"tip-icon\\">💡</span>\\n          <span class=\\"tip-bold\\">Tip:</span> Try navigating to a different verse that may have more content, or select a different organization/language combination.\\n        </p>\\n      </div>\\n    </div>\\n\\n    {#if links.length > 0}\\n      <details class=\\"debug-info\\">\\n        <summary class=\\"debug-summary\\">Debug Info</summary>\\n        <p>Found {links.length} TWL link(s) but no articles loaded.</p>\\n        <ul class=\\"debug-list\\">\\n          {#each links as link, index}\\n            <li class=\\"debug-item\\">\\n              {typeof link === 'string' ? link : link.rcLink || 'Unknown link'}\\n            </li>\\n          {/each}\\n        </ul>\\n      </details>\\n    {/if}\\n\\n    <!-- Resource Metadata Card - Moved to bottom -->\\n    <ResourceMetadataCard\\n      organization={selectedMetadata.organization}\\n      title=\\"Translation Words\\"\\n      languageId={selectedMetadata.languageId}\\n      resourceType=\\"tw\\"\\n    />\\n  </section>\\n<!-- Show navigation if no words available and haven't tried loading yet -->\\n{:else if !hasWords}\\n  <section data-testid=\\"translation-words-panel\\" class=\\"translation-words-panel\\">\\n    <InlineHelpsNavigation\\n      resourceType=\\"tw\\"\\n      currentReference={reference}\\n      onResourceSelect={onRcLinkClick}\\n      isResourceAvailable={hasWords}\\n      {forceNavigation}\\n      onNavigationComplete={handleNavigationComplete}\\n    />\\n    {#if links.length > 0}\\n      <details class=\\"debug-info\\">\\n        <summary class=\\"debug-summary\\">Debug Info</summary>\\n        <p>Found {links.length} TWL link(s) for this verse:</p>\\n        <ul class=\\"debug-list\\">\\n          {#each links as link, index}\\n            <li class=\\"debug-item\\">\\n              {typeof link === 'string' ? link : link.rcLink || 'Unknown link'}\\n            </li>\\n          {/each}\\n        </ul>\\n      </details>\\n    {/if}\\n  </section>\\n<!-- Show words when available -->\\n{:else}\\n  <section data-testid=\\"translation-words-panel\\" class=\\"translation-words-panel\\">\\n    <!-- Breadcrumbs -->\\n    <HelpsBreadcrumbs\\n      resourceType=\\"tw\\"\\n      languageId={finalLanguageId}\\n      organization={finalOrganization}\\n      onStartNavigation={handleStartNavigation}\\n    />\\n\\n    <h3 class=\\"panel-header\\">\\n      Words\\n      {#if finalOrganization !== 'unfoldingWord'}\\n        <span class=\\"org-badge\\">from {finalOrganization}</span>\\n      {/if}\\n    </h3>\\n\\n    <div class=\\"words-list\\">\\n      {#each words as word, index}\\n        {@const isClickable = onWordClick || (onRcLinkClick && word.rcUri)}\\n        {@const summary = word.summary || extractSummary(word.content)}\\n        <div\\n          class=\\"word-card {!isClickable ? 'non-clickable' : ''}\\"\\n          on:click={() => handleWordClick(word)}\\n          on:keydown={() => handleWordClick(word)}\\n        >\\n          <h4 class=\\"word-title\\">\\n            {word.title || word.term}\\n            {#if isClickable}\\n              <span class=\\"click-indicator\\">Click to view full article →</span>\\n            {/if}\\n          </h4>\\n\\n          <p class=\\"word-summary\\">\\n            {@html processRcLinks(summary, handleRcLinkInContent)}\\n          </p>\\n\\n          <!-- Hidden full content for chat context extraction -->\\n          {#if word.content}\\n            <div class=\\"visually-hidden\\" aria-hidden=\\"true\\">\\n              {word.content}\\n            </div>\\n          {/if}\\n\\n          {#if word.rcUri}\\n            <p\\n              class=\\"rc-link\\"\\n              on:click|stopPropagation\\n              on:keydown|stopPropagation\\n            >\\n              <RcLink\\n                rcUri={word.rcUri}\\n                onRcLinkClick={(rcUri) => handleRcLinkClick(rcUri, finalLanguageId, finalOrganization)}\\n              >\\n                {word.rcUri}\\n              </RcLink>\\n            </p>\\n          {/if}\\n        </div>\\n      {/each}\\n\\n      <div class=\\"tip-section\\">\\n        <p class=\\"tip-text\\">\\n          <span class=\\"tip-icon\\">💡</span>\\n          <span class=\\"tip-bold\\">Tip:</span> These words are linked to this verse\\n          through Translation Words Links (TWL).\\n          {#if onWordClick || onRcLinkClick}\\n            Click any word above to view the complete article.\\n          {/if}\\n        </p>\\n      </div>\\n    </div>\\n\\n    <!-- Resource Metadata Card - Moved to bottom -->\\n    <ResourceMetadataCard\\n      organization={finalOrganization}\\n      title=\\"Translation Words\\"\\n      languageId={finalLanguageId}\\n      resourceType=\\"tw\\"\\n    />\\n  </section>\\n{/if}\\n\\n<style>\\n  .translation-words-panel {\\n    padding: 1rem;\\n    background: var(--color-panel);\\n    border-radius: 8px;\\n    height: 100%;\\n    overflow-y: auto;\\n    display: flex;\\n    flex-direction: column;\\n    gap: 1rem;\\n  }\\n\\n  .empty-state {\\n    text-align: center;\\n    color: var(--color-text-secondary);\\n    font-style: italic;\\n    padding: 2rem;\\n  }\\n\\n  .panel-header {\\n    font-size: 1.2rem;\\n    font-weight: 600;\\n    margin: 0;\\n    color: var(--color-text);\\n    display: flex;\\n    align-items: center;\\n    gap: 0.5rem;\\n  }\\n\\n  .org-badge {\\n    background: var(--color-secondary-alpha);\\n    color: var(--color-secondary);\\n    padding: 0.2rem 0.5rem;\\n    border-radius: 4px;\\n    font-size: 0.8rem;\\n    font-weight: 500;\\n  }\\n\\n  .words-list {\\n    display: flex;\\n    flex-direction: column;\\n    gap: 1rem;\\n  }\\n\\n  .word-card {\\n    background: var(--color-background);\\n    border: 1px solid var(--color-border);\\n    border-radius: 8px;\\n    padding: 1rem;\\n    display: flex;\\n    flex-direction: column;\\n    gap: 0.5rem;\\n    transition: all 0.2s ease;\\n    cursor: pointer;\\n  }\\n\\n  .word-card:hover {\\n    border-color: var(--color-primary-alpha);\\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\\n  }\\n\\n  .word-card.non-clickable {\\n    cursor: default;\\n  }\\n\\n  .word-title {\\n    font-size: 1.1rem;\\n    font-weight: 600;\\n    margin: 0;\\n    color: var(--color-primary);\\n    display: flex;\\n    align-items: center;\\n    justify-content: space-between;\\n    gap: 0.5rem;\\n  }\\n\\n  .click-indicator {\\n    font-size: 0.8rem;\\n    color: var(--color-text-secondary);\\n    font-weight: 400;\\n    font-style: italic;\\n  }\\n\\n  .word-summary {\\n    color: var(--color-text);\\n    line-height: 1.6;\\n    margin: 0;\\n  }\\n\\n  .visually-hidden {\\n    position: absolute;\\n    width: 1px;\\n    height: 1px;\\n    padding: 0;\\n    margin: -1px;\\n    overflow: hidden;\\n    clip: rect(0, 0, 0, 0);\\n    white-space: nowrap;\\n    border: 0;\\n  }\\n\\n  .rc-link {\\n    font-size: 0.9rem;\\n    color: var(--color-text-secondary);\\n    margin: 0;\\n    font-family: monospace;\\n  }\\n\\n  .tip-section {\\n    background: var(--color-info-alpha);\\n    border: 1px solid var(--color-info);\\n    border-radius: 8px;\\n    padding: 1rem;\\n    margin-top: 1rem;\\n  }\\n\\n  .tip-text {\\n    margin: 0;\\n    color: var(--color-text);\\n    display: flex;\\n    align-items: flex-start;\\n    gap: 0.5rem;\\n  }\\n\\n  .tip-icon {\\n    font-size: 1.2rem;\\n    flex-shrink: 0;\\n  }\\n\\n  .tip-bold {\\n    font-weight: 600;\\n    color: var(--color-info);\\n  }\\n\\n  .debug-info {\\n    background: var(--color-warning-alpha);\\n    border: 1px solid var(--color-warning);\\n    border-radius: 8px;\\n    padding: 1rem;\\n    margin-top: 1rem;\\n  }\\n\\n  .debug-summary {\\n    cursor: pointer;\\n    font-weight: 600;\\n    color: var(--color-warning);\\n    margin-bottom: 0.5rem;\\n  }\\n\\n  .debug-list {\\n    list-style-type: disc;\\n    padding-left: 1.5rem;\\n    margin: 0.5rem 0;\\n  }\\n\\n  .debug-item {\\n    color: var(--color-text-secondary);\\n    font-size: 0.9rem;\\n    font-family: monospace;\\n    margin-bottom: 0.25rem;\\n  }\\n\\n  /* Responsive design */\\n  @media (max-width: 768px) {\\n    .translation-words-panel {\\n      padding: 0.5rem;\\n    }\\n\\n    .panel-header {\\n      font-size: 1.1rem;\\n      flex-direction: column;\\n      align-items: flex-start;\\n      gap: 0.25rem;\\n    }\\n\\n    .org-badge {\\n      font-size: 0.75rem;\\n    }\\n\\n    .word-card {\\n      padding: 0.75rem;\\n    }\\n\\n    .word-title {\\n      font-size: 1rem;\\n      flex-direction: column;\\n      align-items: flex-start;\\n      gap: 0.25rem;\\n    }\\n\\n    .click-indicator {\\n      font-size: 0.75rem;\\n    }\\n\\n    .tip-text {\\n      flex-direction: column;\\n      gap: 0.25rem;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AA6UE,sCAAyB,CACvB,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,IAAI,aAAa,CAAC,CAC9B,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,IACP,CAEA,0BAAa,CACX,UAAU,CAAE,MAAM,CAClB,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,UAAU,CAAE,MAAM,CAClB,OAAO,CAAE,IACX,CAEA,2BAAc,CACZ,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,MACP,CAEA,wBAAW,CACT,UAAU,CAAE,IAAI,uBAAuB,CAAC,CACxC,KAAK,CAAE,IAAI,iBAAiB,CAAC,CAC7B,OAAO,CAAE,MAAM,CAAC,MAAM,CACtB,aAAa,CAAE,GAAG,CAClB,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GACf,CAEA,yBAAY,CACV,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,IACP,CAEA,wBAAW,CACT,UAAU,CAAE,IAAI,kBAAkB,CAAC,CACnC,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,IAAI,CACb,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,MAAM,CACX,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CACzB,MAAM,CAAE,OACV,CAEA,wBAAU,MAAO,CACf,YAAY,CAAE,IAAI,qBAAqB,CAAC,CACxC,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CACzC,CAEA,UAAU,4BAAe,CACvB,MAAM,CAAE,OACV,CAEA,yBAAY,CACV,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,IAAI,eAAe,CAAC,CAC3B,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,aAAa,CAC9B,GAAG,CAAE,MACP,CAEA,8BAAiB,CACf,SAAS,CAAE,MAAM,CACjB,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,WAAW,CAAE,GAAG,CAChB,UAAU,CAAE,MACd,CAEA,2BAAc,CACZ,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,CACV,CAEA,8BAAiB,CACf,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,CACX,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,MAAM,CAChB,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACtB,WAAW,CAAE,MAAM,CACnB,MAAM,CAAE,CACV,CAEA,sBAAS,CACP,SAAS,CAAE,MAAM,CACjB,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,MAAM,CAAE,CAAC,CACT,WAAW,CAAE,SACf,CAEA,0BAAa,CACX,UAAU,CAAE,IAAI,kBAAkB,CAAC,CACnC,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,YAAY,CAAC,CACnC,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,IACd,CAEA,uBAAU,CACR,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,UAAU,CACvB,GAAG,CAAE,MACP,CAEA,uBAAU,CACR,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,CACf,CAEA,uBAAU,CACR,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,YAAY,CACzB,CAEA,yBAAY,CACV,UAAU,CAAE,IAAI,qBAAqB,CAAC,CACtC,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,eAAe,CAAC,CACtC,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,IACd,CAEA,4BAAe,CACb,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,eAAe,CAAC,CAC3B,aAAa,CAAE,MACjB,CAEA,yBAAY,CACV,eAAe,CAAE,IAAI,CACrB,YAAY,CAAE,MAAM,CACpB,MAAM,CAAE,MAAM,CAAC,CACjB,CAEA,yBAAY,CACV,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,SAAS,CACtB,aAAa,CAAE,OACjB,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,sCAAyB,CACvB,OAAO,CAAE,MACX,CAEA,2BAAc,CACZ,SAAS,CAAE,MAAM,CACjB,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,UAAU,CACvB,GAAG,CAAE,OACP,CAEA,wBAAW,CACT,SAAS,CAAE,OACb,CAEA,wBAAW,CACT,OAAO,CAAE,OACX,CAEA,yBAAY,CACV,SAAS,CAAE,IAAI,CACf,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,UAAU,CACvB,GAAG,CAAE,OACP,CAEA,8BAAiB,CACf,SAAS,CAAE,OACb,CAEA,uBAAU,CACR,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,OACP,CACF"}`
};
function extractSummary(content) {
  if (!content) return "";
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed.length > 20) {
      return trimmed.split(".")[0] + ".";
    }
  }
  return content.substring(0, 150) + (content.length > 150 ? "..." : "");
}
const TranslationWordsPanel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let hasWords;
  let wordMetadata;
  let selectedMetadata;
  let finalOrganization;
  let finalLanguageId;
  let { reference: reference2 } = $$props;
  let { onWordClick = null } = $$props;
  let { onRcLinkClick = null } = $$props;
  let words2 = [];
  let links2 = [];
  let forceNavigation = null;
  let mixedResources2 = {};
  let organization2 = "unfoldingWord";
  let languageId2 = "en";
  resourcesStore.subscribe((resources2) => {
    words2 = resources2.words || [];
    links2 = resources2.links || [];
  });
  referenceStore.subscribe((refStore) => {
    mixedResources2 = refStore.mixedResources || {};
    organization2 = refStore.organization || "unfoldingWord";
    languageId2 = refStore.languageId || "en";
  });
  function getSelectedResourceMetadata() {
    const selectedResource = mixedResources2?.words;
    return {
      organization: selectedResource?.organization || organization2 || "unfoldingWord",
      languageId: selectedResource?.languageId || languageId2 || "en"
    };
  }
  function handleStartNavigation(step = "language") {
    console.log(`Starting tW navigation at step: ${step}`);
    forceNavigation = step;
  }
  function handleNavigationComplete() {
    forceNavigation = null;
  }
  function handleRcLinkClick(rcUri, languageId3, organization3) {
    if (onRcLinkClick) {
      onRcLinkClick(rcUri, languageId3, organization3);
    }
  }
  if ($$props.reference === void 0 && $$bindings.reference && reference2 !== void 0) $$bindings.reference(reference2);
  if ($$props.onWordClick === void 0 && $$bindings.onWordClick && onWordClick !== void 0) $$bindings.onWordClick(onWordClick);
  if ($$props.onRcLinkClick === void 0 && $$bindings.onRcLinkClick && onRcLinkClick !== void 0) $$bindings.onRcLinkClick(onRcLinkClick);
  $$result.css.add(css$7);
  hasWords = words2 && words2.length > 0;
  wordMetadata = words2[0] || {};
  selectedMetadata = getSelectedResourceMetadata();
  finalOrganization = selectedMetadata.organization || wordMetadata.organization || "unfoldingWord";
  finalLanguageId = selectedMetadata.languageId || wordMetadata.languageId || "en";
  {
    console.log("🎯 TranslationWordsPanel: Rendering with", words2.length, "words and", links2.length, "links");
  }
  return `${!reference2?.verse ? `<section data-testid="translation-words-panel" class="translation-words-panel svelte-rcfbaw" data-svelte-h="svelte-1hc84c5"><p class="empty-state svelte-rcfbaw">Select a verse to view translation words.</p></section> ` : `${forceNavigation ? `<section data-testid="translation-words-panel" class="translation-words-panel svelte-rcfbaw">${validate_component(InlineHelpsNavigation, "InlineHelpsNavigation").$$render(
    $$result,
    {
      resourceType: "tw",
      currentReference: reference2,
      onResourceSelect: onRcLinkClick,
      isResourceAvailable: hasWords,
      forceNavigation,
      onNavigationComplete: handleNavigationComplete
    },
    {},
    {}
  )} ${links2.length > 0 ? `<details class="debug-info svelte-rcfbaw"><summary class="debug-summary svelte-rcfbaw" data-svelte-h="svelte-f7aluk">Debug Info</summary> <p>Found ${escape(links2.length)} TWL link(s) for this verse:</p> <ul class="debug-list svelte-rcfbaw">${each(links2, (link, index) => {
    return `<li class="debug-item svelte-rcfbaw">${escape(typeof link === "string" ? link : link.rcLink || "Unknown link")} </li>`;
  })}</ul></details>` : ``}</section> ` : `${`${!hasWords ? `<section data-testid="translation-words-panel" class="translation-words-panel svelte-rcfbaw">${validate_component(InlineHelpsNavigation, "InlineHelpsNavigation").$$render(
    $$result,
    {
      resourceType: "tw",
      currentReference: reference2,
      onResourceSelect: onRcLinkClick,
      isResourceAvailable: hasWords,
      forceNavigation,
      onNavigationComplete: handleNavigationComplete
    },
    {},
    {}
  )} ${links2.length > 0 ? `<details class="debug-info svelte-rcfbaw"><summary class="debug-summary svelte-rcfbaw" data-svelte-h="svelte-f7aluk">Debug Info</summary> <p>Found ${escape(links2.length)} TWL link(s) for this verse:</p> <ul class="debug-list svelte-rcfbaw">${each(links2, (link, index) => {
    return `<li class="debug-item svelte-rcfbaw">${escape(typeof link === "string" ? link : link.rcLink || "Unknown link")} </li>`;
  })}</ul></details>` : ``}</section> ` : `<section data-testid="translation-words-panel" class="translation-words-panel svelte-rcfbaw"> ${validate_component(HelpsBreadcrumbs, "HelpsBreadcrumbs").$$render(
    $$result,
    {
      resourceType: "tw",
      languageId: finalLanguageId,
      organization: finalOrganization,
      onStartNavigation: handleStartNavigation
    },
    {},
    {}
  )} <h3 class="panel-header svelte-rcfbaw">Words
      ${finalOrganization !== "unfoldingWord" ? `<span class="org-badge svelte-rcfbaw">from ${escape(finalOrganization)}</span>` : ``}</h3> <div class="words-list svelte-rcfbaw">${each(words2, (word, index) => {
    let isClickable = onWordClick || onRcLinkClick && word.rcUri, summary = word.summary || extractSummary(word.content);
    return `  <div class="${"word-card " + escape(!isClickable ? "non-clickable" : "", true) + " svelte-rcfbaw"}"><h4 class="word-title svelte-rcfbaw">${escape(word.title || word.term)} ${isClickable ? `<span class="click-indicator svelte-rcfbaw" data-svelte-h="svelte-1op3tzq">Click to view full article →</span>` : ``}</h4> <p class="word-summary svelte-rcfbaw"><!-- HTML_TAG_START -->${processRcLinks(summary)}<!-- HTML_TAG_END --></p>  ${word.content ? `<div class="visually-hidden svelte-rcfbaw" aria-hidden="true">${escape(word.content)} </div>` : ``} ${word.rcUri ? `<p class="rc-link svelte-rcfbaw">${validate_component(RcLink, "RcLink").$$render(
      $$result,
      {
        rcUri: word.rcUri,
        onRcLinkClick: (rcUri) => handleRcLinkClick(rcUri, finalLanguageId, finalOrganization)
      },
      {},
      {
        default: () => {
          return `${escape(word.rcUri)} `;
        }
      }
    )} </p>` : ``} </div>`;
  })} <div class="tip-section svelte-rcfbaw"><p class="tip-text svelte-rcfbaw"><span class="tip-icon svelte-rcfbaw" data-svelte-h="svelte-187ghi4">💡</span> <span class="tip-bold svelte-rcfbaw" data-svelte-h="svelte-1oxr7hj">Tip:</span> These words are linked to this verse
          through Translation Words Links (TWL).
          ${onWordClick || onRcLinkClick ? `Click any word above to view the complete article.` : ``}</p></div></div>  ${validate_component(ResourceMetadataCard, "ResourceMetadataCard").$$render(
    $$result,
    {
      organization: finalOrganization,
      title: "Translation Words",
      languageId: finalLanguageId,
      resourceType: "tw"
    },
    {},
    {}
  )}</section>`}`}`}`}`;
});
const css$6 = {
  code: ".article-panel.svelte-qm6k1r.svelte-qm6k1r{padding:1rem;background:var(--color-panel);border-radius:8px;height:100%;overflow-y:auto}.article-panel.svelte-qm6k1r h2.svelte-qm6k1r{margin:0 0 1rem 0;color:var(--color-primary);font-size:1.4rem}.article-content.svelte-qm6k1r.svelte-qm6k1r{line-height:1.6;color:var(--color-text);margin-bottom:1rem}.article-meta.svelte-qm6k1r.svelte-qm6k1r{border-top:1px solid var(--color-border);padding-top:1rem;color:var(--color-text-secondary);font-size:0.9rem}.empty-state.svelte-qm6k1r.svelte-qm6k1r{display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-secondary);font-style:italic}",
  map: `{"version":3,"file":"ArticlePanel.svelte","sources":["ArticlePanel.svelte"],"sourcesContent":["<script>\\n  export let reference;\\n  export let article = null;\\n<\/script>\\n\\n<div class=\\"article-panel\\">\\n  {#if article}\\n    <h2>{article.title || 'Article'}</h2>\\n    <div class=\\"article-content\\">\\n      {#if article.content}\\n        {@html article.content}\\n      {:else}\\n        <p>Article content not available.</p>\\n      {/if}\\n    </div>\\n    {#if article.rcUri}\\n      <div class=\\"article-meta\\">\\n        <small>RC URI: {article.rcUri}</small>\\n      </div>\\n    {/if}\\n  {:else}\\n    <div class=\\"empty-state\\">\\n      <p>No article selected.</p>\\n    </div>\\n  {/if}\\n</div>\\n\\n<style>\\n  .article-panel {\\n    padding: 1rem;\\n    background: var(--color-panel);\\n    border-radius: 8px;\\n    height: 100%;\\n    overflow-y: auto;\\n  }\\n\\n  .article-panel h2 {\\n    margin: 0 0 1rem 0;\\n    color: var(--color-primary);\\n    font-size: 1.4rem;\\n  }\\n\\n  .article-content {\\n    line-height: 1.6;\\n    color: var(--color-text);\\n    margin-bottom: 1rem;\\n  }\\n\\n  .article-meta {\\n    border-top: 1px solid var(--color-border);\\n    padding-top: 1rem;\\n    color: var(--color-text-secondary);\\n    font-size: 0.9rem;\\n  }\\n\\n  .empty-state {\\n    display: flex;\\n    align-items: center;\\n    justify-content: center;\\n    height: 100%;\\n    color: var(--color-text-secondary);\\n    font-style: italic;\\n  }\\n</style>"],"names":[],"mappings":"AA4BE,0CAAe,CACb,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,IAAI,aAAa,CAAC,CAC9B,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,IACd,CAEA,4BAAc,CAAC,gBAAG,CAChB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAClB,KAAK,CAAE,IAAI,eAAe,CAAC,CAC3B,SAAS,CAAE,MACb,CAEA,4CAAiB,CACf,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,aAAa,CAAE,IACjB,CAEA,yCAAc,CACZ,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACzC,WAAW,CAAE,IAAI,CACjB,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,SAAS,CAAE,MACb,CAEA,wCAAa,CACX,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,UAAU,CAAE,MACd"}`
};
const ArticlePanel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { reference: reference2 } = $$props;
  let { article = null } = $$props;
  if ($$props.reference === void 0 && $$bindings.reference && reference2 !== void 0) $$bindings.reference(reference2);
  if ($$props.article === void 0 && $$bindings.article && article !== void 0) $$bindings.article(article);
  $$result.css.add(css$6);
  return `<div class="article-panel svelte-qm6k1r">${article ? `<h2 class="svelte-qm6k1r">${escape(article.title || "Article")}</h2> <div class="article-content svelte-qm6k1r">${article.content ? `<!-- HTML_TAG_START -->${article.content}<!-- HTML_TAG_END -->` : `<p data-svelte-h="svelte-1efiv4r">Article content not available.</p>`}</div> ${article.rcUri ? `<div class="article-meta svelte-qm6k1r"><small>RC URI: ${escape(article.rcUri)}</small></div>` : ``}` : `<div class="empty-state svelte-qm6k1r" data-svelte-h="svelte-4425or"><p>No article selected.</p></div>`} </div>`;
});
const messages = writable([]);
const chatStore = {
  messages
};
const EMOJI_MAPPINGS = {
  // Translation-specific content
  translation: {
    patterns: [
      { regex: /\b(translat(e|ion|ing|ed))\b/gi, emoji: "🔄" },
      { regex: /\b(interpret(ation|ing|ed)?)\b/gi, emoji: "🔍" },
      { regex: /\b(meaning|means)\b/gi, emoji: "💡" },
      { regex: /\b(context|contextual)\b/gi, emoji: "🎯" },
      { regex: /\b(original|source)\s+(text|language)\b/gi, emoji: "📜" },
      { regex: /\b(greek|hebrew|aramaic)\b/gi, emoji: "🏛️" },
      { regex: /\b(manuscript|manuscripts)\b/gi, emoji: "📋" },
      { regex: /\b(variant|variants)\b/gi, emoji: "🔀" }
    ]
  },
  // Biblical content
  biblical: {
    patterns: [
      { regex: /\b(god|lord|yahweh|jehovah)\b/gi, emoji: "✨" },
      { regex: /\b(jesus|christ|messiah)\b/gi, emoji: "✝️" },
      { regex: /\b(holy spirit|spirit)\b/gi, emoji: "🕊️" },
      { regex: /\b(scripture|bible|biblical)\b/gi, emoji: "📖" },
      { regex: /\b(verse|verses)\b/gi, emoji: "📝" },
      { regex: /\b(chapter|chapters)\b/gi, emoji: "📄" },
      { regex: /\b(psalm|psalms)\b/gi, emoji: "🎵" },
      { regex: /\b(prophet|prophetic|prophecy)\b/gi, emoji: "🔮" },
      { regex: /\b(temple|sanctuary)\b/gi, emoji: "🏛️" },
      { regex: /\b(covenant|promise)\b/gi, emoji: "🤝" },
      { regex: /\b(kingdom|reign)\b/gi, emoji: "👑" },
      { regex: /\b(shepherd|flock)\b/gi, emoji: "🐑" },
      { regex: /\b(light|darkness)\b/gi, emoji: "💡" },
      { regex: /\b(water|river|sea)\b/gi, emoji: "🌊" },
      { regex: /\b(mountain|hill)\b/gi, emoji: "⛰️" },
      { regex: /\b(desert|wilderness)\b/gi, emoji: "🏜️" },
      { regex: /\b(harvest|grain|wheat)\b/gi, emoji: "🌾" },
      { regex: /\b(vine|vineyard|grapes)\b/gi, emoji: "🍇" },
      { regex: /\b(olive|oil)\b/gi, emoji: "🫒" }
    ]
  },
  // Cultural and historical
  cultural: {
    patterns: [
      { regex: /\b(culture|cultural|custom)\b/gi, emoji: "🏺" },
      { regex: /\b(historical|history|ancient)\b/gi, emoji: "⏳" },
      { regex: /\b(tradition|traditional)\b/gi, emoji: "🎭" },
      { regex: /\b(jewish|judaism)\b/gi, emoji: "✡️" },
      { regex: /\b(roman|rome)\b/gi, emoji: "🏛️" },
      { regex: /\b(israel|israelite)\b/gi, emoji: "🇮🇱" },
      { regex: /\b(egypt|egyptian)\b/gi, emoji: "🐪" },
      { regex: /\b(babylon|babylonian)\b/gi, emoji: "🏗️" },
      { regex: /\b(gentile|nations)\b/gi, emoji: "🌍" },
      { regex: /\b(feast|festival|celebration)\b/gi, emoji: "🎉" },
      { regex: /\b(sacrifice|offering)\b/gi, emoji: "🔥" },
      { regex: /\b(priest|priesthood)\b/gi, emoji: "👨‍💼" },
      { regex: /\b(king|royal|throne)\b/gi, emoji: "👑" }
    ]
  },
  // Literary and linguistic
  literary: {
    patterns: [
      { regex: /\b(metaphor|metaphorical)\b/gi, emoji: "🎨" },
      { regex: /\b(symbol|symbolic|symbolism)\b/gi, emoji: "🔣" },
      { regex: /\b(parable|allegory)\b/gi, emoji: "📚" },
      { regex: /\b(poetry|poetic)\b/gi, emoji: "🎭" },
      { regex: /\b(parallel|parallelism)\b/gi, emoji: "↔️" },
      { regex: /\b(emphasis|emphasize)\b/gi, emoji: "❗" },
      { regex: /\b(contrast|compare|comparison)\b/gi, emoji: "⚖️" },
      { regex: /\b(chiasm|chiastic)\b/gi, emoji: "🔄" },
      { regex: /\b(repetition|repeated)\b/gi, emoji: "🔁" }
    ]
  },
  // Actions and emotions
  actions: {
    patterns: [
      { regex: /\b(love|beloved|loving)\b/gi, emoji: "❤️" },
      { regex: /\b(joy|joyful|rejoice)\b/gi, emoji: "😊" },
      { regex: /\b(peace|peaceful)\b/gi, emoji: "☮️" },
      { regex: /\b(hope|hopeful)\b/gi, emoji: "🌟" },
      { regex: /\b(faith|faithful|believe)\b/gi, emoji: "🙏" },
      { regex: /\b(worship|praise|glorify)\b/gi, emoji: "🙌" },
      { regex: /\b(pray|prayer|praying)\b/gi, emoji: "🙏" },
      { regex: /\b(blessing|blessed|bless)\b/gi, emoji: "✨" },
      { regex: /\b(forgive|forgiveness)\b/gi, emoji: "🤗" },
      { regex: /\b(repent|repentance)\b/gi, emoji: "💔" },
      { regex: /\b(sin|sinful|evil)\b/gi, emoji: "⚠️" },
      { regex: /\b(righteous|righteousness)\b/gi, emoji: "⚖️" },
      { regex: /\b(wise|wisdom)\b/gi, emoji: "🦉" },
      { regex: /\b(teach|teaching|learn)\b/gi, emoji: "📚" },
      { regex: /\b(journey|travel|walk)\b/gi, emoji: "🚶" },
      { regex: /\b(fight|battle|war)\b/gi, emoji: "⚔️" },
      { regex: /\b(victory|triumph)\b/gi, emoji: "🏆" },
      { regex: /\b(servant|serve|service)\b/gi, emoji: "🤲" }
    ]
  },
  // Question and answer patterns
  discourse: {
    patterns: [
      { regex: /^#{1,6}\s*(.+)$/gm, emoji: "📍", position: "before" },
      // Headers
      { regex: /\?\s*$/gm, emoji: "❓", position: "after" },
      // Questions
      { regex: /!\s*$/gm, emoji: "❗", position: "after" },
      // Exclamations
      { regex: /\b(important|crucial|key|essential)\b/gi, emoji: "🔑" },
      { regex: /\b(note|notice|observe)\b/gi, emoji: "👁️" },
      { regex: /\b(consider|think about|reflect)\b/gi, emoji: "🤔" },
      { regex: /\b(remember|recall)\b/gi, emoji: "💭" },
      { regex: /\b(challenge|difficult|complexity)\b/gi, emoji: "🧩" },
      { regex: /\b(solution|answer|resolve)\b/gi, emoji: "💡" },
      { regex: /\b(example|instance|illustration)\b/gi, emoji: "📋" },
      { regex: /\b(summary|conclusion|in summary)\b/gi, emoji: "📊" }
    ]
  }
};
function enhanceWithEmojis(text, options = {}) {
  const { enabled = true, maxEmojisPerResponse = 8, excludeCategories = [] } = options;
  if (!enabled || !text || typeof text !== "string") {
    return text || "";
  }
  let enhancedText = text;
  let emojiCount = 0;
  const usedEmojis = /* @__PURE__ */ new Set();
  Object.entries(EMOJI_MAPPINGS).forEach(([category, { patterns }]) => {
    if (excludeCategories.includes(category) || emojiCount >= maxEmojisPerResponse) {
      return;
    }
    patterns.forEach(({ regex, emoji, position = "after" }) => {
      if (emojiCount >= maxEmojisPerResponse) return;
      if (usedEmojis.has(emoji)) return;
      const matches = enhancedText.match(regex);
      if (matches && matches.length > 0) {
        const firstMatch = matches[0];
        const matchIndex = enhancedText.indexOf(firstMatch);
        if (matchIndex !== -1) {
          const beforeText = enhancedText.substring(0, matchIndex);
          const afterText = enhancedText.substring(matchIndex + firstMatch.length);
          if (position === "before") {
            enhancedText = beforeText + emoji + " " + firstMatch + afterText;
          } else {
            enhancedText = beforeText + firstMatch + " " + emoji + afterText;
          }
          usedEmojis.add(emoji);
          emojiCount++;
        }
      }
    });
  });
  return enhancedText;
}
function addSectionEmojis(text) {
  if (!text || typeof text !== "string") return text || "";
  let enhancedText = text;
  const headingPatterns = [
    { regex: /^(#{1,6}\s*)(.*translation.*)/gim, emoji: "🔄" },
    { regex: /^(#{1,6}\s*)(.*meaning.*|.*definition.*)/gim, emoji: "💡" },
    { regex: /^(#{1,6}\s*)(.*context.*|.*background.*)/gim, emoji: "🎯" },
    { regex: /^(#{1,6}\s*)(.*challenge.*|.*difficult.*)/gim, emoji: "🧩" },
    { regex: /^(#{1,6}\s*)(.*example.*|.*illustration.*)/gim, emoji: "📋" },
    { regex: /^(#{1,6}\s*)(.*summary.*|.*conclusion.*)/gim, emoji: "📊" },
    { regex: /^(#{1,6}\s*)(.*key.*|.*important.*)/gim, emoji: "🔑" },
    { regex: /^(#{1,6}\s*)(.*note.*|.*observation.*)/gim, emoji: "📝" }
  ];
  headingPatterns.forEach(({ regex, emoji }) => {
    if (enhancedText && typeof enhancedText === "string") {
      enhancedText = enhancedText.replace(regex, `$1${emoji} $2`);
    }
  });
  const listPatterns = [
    { regex: /^(\s*[-*+]\s*)(.*translation.*)/gim, emoji: "🔄" },
    { regex: /^(\s*[-*+]\s*)(.*meaning.*)/gim, emoji: "💡" },
    { regex: /^(\s*[-*+]\s*)(.*context.*)/gim, emoji: "🎯" },
    { regex: /^(\s*[-*+]\s*)(.*key.*|.*important.*)/gim, emoji: "🔑" },
    { regex: /^(\s*[-*+]\s*)(.*challenge.*)/gim, emoji: "🧩" },
    { regex: /^(\s*[-*+]\s*)(.*example.*)/gim, emoji: "📋" }
  ];
  listPatterns.forEach(({ regex, emoji }) => {
    if (enhancedText && typeof enhancedText === "string") {
      enhancedText = enhancedText.replace(regex, `$1${emoji} $2`);
    }
  });
  return enhancedText || "";
}
function enhanceLLMResponse(response, options = {}) {
  if (!response || typeof response !== "string") return response || "";
  let enhanced = addSectionEmojis(response);
  enhanced = enhanceWithEmojis(enhanced, {
    ...options,
    excludeCategories: [...options.excludeCategories || [], "discourse"]
    // Skip general discourse patterns that overlap with section emojis
  });
  return enhanced || "";
}
const css$5 = {
  code: ".chat-panel.svelte-s35tb8.svelte-s35tb8{display:flex;flex-direction:column;height:100%;background:var(--color-panel);border:1px solid var(--color-border);border-radius:8px;overflow:hidden}.chat-header.svelte-s35tb8.svelte-s35tb8{display:flex;justify-content:space-between;align-items:center;padding:1rem;background:var(--color-header);border-bottom:1px solid var(--color-border);flex-shrink:0}.header-title.svelte-s35tb8 h3.svelte-s35tb8{margin:0;color:var(--color-text);font-size:1.1rem}.subtitle.svelte-s35tb8.svelte-s35tb8{color:var(--color-text-secondary);font-size:0.8rem}.header-actions.svelte-s35tb8.svelte-s35tb8{display:flex;align-items:center;gap:1rem}.context-indicator.svelte-s35tb8.svelte-s35tb8{display:flex;align-items:center;gap:0.5rem;padding:0.25rem 0.5rem;background:var(--color-secondary-alpha);border-radius:4px;font-size:0.8rem}.context-icon.svelte-s35tb8.svelte-s35tb8{font-size:1rem}.context-text.svelte-s35tb8.svelte-s35tb8{color:var(--color-text-secondary)}.session-cost-indicator.svelte-s35tb8.svelte-s35tb8{display:flex;align-items:center;gap:0.25rem;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.8rem;font-weight:500}.session-cost-low.svelte-s35tb8.svelte-s35tb8{background:var(--color-success-alpha);color:var(--color-success)}.session-cost-medium.svelte-s35tb8.svelte-s35tb8{background:var(--color-warning-alpha);color:var(--color-warning)}.session-cost-high.svelte-s35tb8.svelte-s35tb8{background:var(--color-error-alpha);color:var(--color-error)}.clear-button.svelte-s35tb8.svelte-s35tb8{background:transparent;border:none;color:var(--color-text-secondary);cursor:pointer;padding:0.25rem;border-radius:4px;font-size:1rem;transition:all 0.2s ease}.clear-button.svelte-s35tb8.svelte-s35tb8:hover:not(:disabled){background:var(--color-hover);color:var(--color-text)}.clear-button.svelte-s35tb8.svelte-s35tb8:disabled{opacity:0.5;cursor:not-allowed}.welcome-message.svelte-s35tb8.svelte-s35tb8{flex:1;padding:2rem;text-align:center;overflow-y:auto}.welcome-icon.svelte-s35tb8.svelte-s35tb8{margin-bottom:1rem}.welcome-message.svelte-s35tb8 h4.svelte-s35tb8{color:var(--color-primary);margin-bottom:1rem}.welcome-message.svelte-s35tb8 p.svelte-s35tb8{color:var(--color-text-secondary);margin-bottom:1rem}.welcome-message.svelte-s35tb8 ul.svelte-s35tb8{text-align:left;max-width:400px;margin:0 auto 2rem;color:var(--color-text-secondary)}.available-resources.svelte-s35tb8.svelte-s35tb8{margin:2rem 0;padding:1rem;background:var(--color-background);border-radius:8px}.resources-list.svelte-s35tb8.svelte-s35tb8{display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:center}.resource-tag.svelte-s35tb8.svelte-s35tb8{background:var(--color-success-alpha);color:var(--color-success);padding:0.25rem 0.5rem;border-radius:4px;font-size:0.8rem;font-weight:500}.prompt-suggestions.svelte-s35tb8.svelte-s35tb8{margin-top:2rem}.suggestions-list.svelte-s35tb8.svelte-s35tb8{display:flex;flex-direction:column;gap:0.5rem;max-width:500px;margin:0 auto}.suggestion-button.svelte-s35tb8.svelte-s35tb8{background:var(--color-background);border:1px solid var(--color-border);color:var(--color-text);padding:0.8rem;border-radius:6px;cursor:pointer;text-align:left;transition:all 0.2s ease}.suggestion-button.svelte-s35tb8.svelte-s35tb8:hover:not(:disabled){background:var(--color-hover);border-color:var(--color-primary)}.suggestion-button.svelte-s35tb8.svelte-s35tb8:disabled{opacity:0.5;cursor:not-allowed}.messages-container.svelte-s35tb8.svelte-s35tb8{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:1rem}.message.svelte-s35tb8.svelte-s35tb8{display:flex;flex-direction:column;max-width:80%}.user-message.svelte-s35tb8.svelte-s35tb8{align-self:flex-end}.assistant-message.svelte-s35tb8.svelte-s35tb8{align-self:flex-start}.error-message.svelte-s35tb8.svelte-s35tb8{align-self:center;max-width:90%}.message-content.svelte-s35tb8.svelte-s35tb8{background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;padding:0.8rem}.user-message.svelte-s35tb8 .message-content.svelte-s35tb8{background:var(--color-primary-alpha);border-color:var(--color-primary)}.error-message.svelte-s35tb8 .message-content.svelte-s35tb8{background:var(--color-error-alpha);border-color:var(--color-error);color:var(--color-error)}.message-text.svelte-s35tb8.svelte-s35tb8{margin-bottom:0.5rem;line-height:1.5}.message-time.svelte-s35tb8.svelte-s35tb8{display:flex;align-items:center;gap:0.5rem;font-size:0.8rem;color:var(--color-text-secondary)}.cost-badge.svelte-s35tb8.svelte-s35tb8{background:var(--color-secondary-alpha);color:var(--color-secondary);padding:0.1rem 0.3rem;border-radius:3px;font-size:0.7rem;font-weight:500}.mock-badge.svelte-s35tb8.svelte-s35tb8{background:var(--color-warning-alpha);color:var(--color-warning);padding:0.1rem 0.3rem;border-radius:3px;font-size:0.7rem;font-weight:500}.loading-message.svelte-s35tb8.svelte-s35tb8{align-self:flex-start;max-width:80%}.loading-message.svelte-s35tb8 .message-content.svelte-s35tb8{display:flex;align-items:center;gap:0.5rem}.typing-indicator.svelte-s35tb8.svelte-s35tb8{display:flex;gap:0.2rem}.typing-indicator.svelte-s35tb8 span.svelte-s35tb8{width:6px;height:6px;background:var(--color-text-secondary);border-radius:50%;animation:svelte-s35tb8-typing 1.4s infinite}.typing-indicator.svelte-s35tb8 span.svelte-s35tb8:nth-child(2){animation-delay:0.2s}.typing-indicator.svelte-s35tb8 span.svelte-s35tb8:nth-child(3){animation-delay:0.4s}@keyframes svelte-s35tb8-typing{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-10px)}}.loading-text.svelte-s35tb8.svelte-s35tb8{color:var(--color-text-secondary);font-style:italic;font-size:0.9rem}.chat-input.svelte-s35tb8.svelte-s35tb8{padding:1rem;border-top:1px solid var(--color-border);background:var(--color-header);flex-shrink:0}.input-container.svelte-s35tb8.svelte-s35tb8{display:flex;gap:0.5rem;align-items:end}.message-input.svelte-s35tb8.svelte-s35tb8{flex:1;padding:0.8rem;border:1px solid var(--color-border);border-radius:6px;background:var(--color-background);color:var(--color-text);font-family:inherit;font-size:0.9rem;resize:none;min-height:44px;max-height:120px;overflow-y:auto}.message-input.svelte-s35tb8.svelte-s35tb8:focus{outline:none;border-color:var(--color-primary)}.message-input.svelte-s35tb8.svelte-s35tb8:disabled{opacity:0.5;cursor:not-allowed}.send-button.svelte-s35tb8.svelte-s35tb8{background:var(--color-primary);color:white;border:none;border-radius:6px;padding:0.8rem 1rem;cursor:pointer;font-size:1rem;min-width:44px;height:44px;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease}.send-button.svelte-s35tb8.svelte-s35tb8:hover:not(:disabled){background:var(--color-primary-hover);transform:translateY(-1px)}.send-button.svelte-s35tb8.svelte-s35tb8:disabled{opacity:0.5;cursor:not-allowed}@media(max-width: 768px){.chat-header.svelte-s35tb8.svelte-s35tb8{flex-direction:column;gap:0.5rem;align-items:flex-start}.header-actions.svelte-s35tb8.svelte-s35tb8{width:100%;justify-content:space-between}.welcome-message.svelte-s35tb8.svelte-s35tb8{padding:1rem}.message.svelte-s35tb8.svelte-s35tb8{max-width:95%}.suggestions-list.svelte-s35tb8.svelte-s35tb8{max-width:100%}.resources-list.svelte-s35tb8.svelte-s35tb8{flex-direction:column}}",
  map: `{"version":3,"file":"LLMChatPanel.svelte","sources":["LLMChatPanel.svelte"],"sourcesContent":["<script>\\n  import { onMount, onDestroy, afterUpdate } from 'svelte';\\n  import { chatStore } from '$lib/stores/chat.js';\\n  import { resourcesStore } from '$lib/stores/resources.js';\\n  import { sendChatMessage } from '$lib/services/llmChatService.js';\\n  import { processMarkdownWithRcLinks } from '$lib/utils/markdownUtils.js';\\n  import { enhanceLLMResponse } from '$lib/utils/emojiEnhancer.js';\\n  import { extractVerseText, extractChapterText, validateCleanText, emergencyUSFMExtract } from '$lib/utils/usfmTextExtractor.js';\\n  import TabIcon from '$lib/components/shared/TabIcon.svelte';\\n\\n  let userInput = '';\\n  let isSubmitting = false;\\n  let sessionCost = 0;\\n  let messagesEndRef;\\n  let textareaRef;\\n\\n  // Subscribe to stores\\n  let resources = {};\\n  let messages = [];\\n  let reference = null;\\n\\n  // Store subscriptions\\n  const unsubscribeResources = resourcesStore.subscribe((value) => {\\n    resources = value;\\n  });\\n\\n  const unsubscribeMessages = chatStore.messages.subscribe((value) => {\\n    messages = value;\\n  });\\n\\n  const unsubscribeReference = resourcesStore.reference.subscribe((value) => {\\n    reference = value;\\n  });\\n\\n  // Ensure all resources are active for comprehensive AI context\\n  onMount(() => {\\n    // Self-activating ALL resources for comprehensive AI context\\n    ['scripture', 'notes', 'questions', 'words', 'links'].forEach(resource => {\\n      resourcesStore.activateResource(resource);\\n    });\\n    \\n    // Activate AI tab when component mounts\\n    chatStore.activateAITab();\\n  });\\n\\n  // Auto-scroll to bottom when new messages arrive\\n  afterUpdate(() => {\\n    if (messagesEndRef) {\\n      messagesEndRef.scrollIntoView({ behavior: 'smooth' });\\n    }\\n  });\\n\\n  // Auto-resize textarea\\n  $: if (textareaRef) {\\n    textareaRef.style.height = 'auto';\\n    textareaRef.style.height = \`\${textareaRef.scrollHeight}px\`;\\n  }\\n\\n  // Enhanced clear messages that also resets session cost\\n  function clearMessages() {\\n    chatStore.clearMessages();\\n    sessionCost = 0;\\n  }\\n\\n  // Get formatted context for LLM - ALWAYS ready and consistent\\n  function getFormattedContext() {\\n    // Extract clean scripture text for LLM at runtime from raw USFM (antifragile pattern)\\n    let scriptureForLLM = null;\\n    let scriptureMetadata = null;\\n    \\n    if (resources.scripture && reference) {\\n      // Raw USFM is the single source of truth - extract clean text at runtime\\n      const rawUsfm = resources.scripture;\\n      \\n      try {\\n        // Extract clean text - try chapter first for broader context, then specific verse\\n        let cleanText;\\n        let extractionMethod;\\n        \\n        try {\\n          // PRIMARY: Extract entire chapter with verse numbers for comprehensive LLM context\\n          cleanText = extractChapterText(rawUsfm, reference.chapter);\\n          extractionMethod = 'chapter';\\n        } catch (chapterError) {\\n          console.warn('🔍 LLM Context: Chapter extraction failed, trying single verse:', chapterError.message);\\n          // Fallback: Extract specific verse with verse number\\n          cleanText = extractVerseText(rawUsfm, reference.chapter, reference.verse);\\n          extractionMethod = 'verse';\\n        }\\n        \\n        const isClean = validateCleanText(cleanText);\\n        \\n        // If extraction returned empty or failed validation, log details\\n        if (!cleanText || cleanText.trim().length === 0) {\\n          throw new Error(\`Extraction returned empty text for \${reference.citation}\`);\\n        }\\n        \\n        if (!isClean) {\\n          console.warn('⚠️ LLM Context: Extracted text contains markup patterns!');\\n        }\\n        \\n        scriptureForLLM = cleanText;\\n        scriptureMetadata = {\\n          extractedAt: new Date().toISOString(),\\n          isClean,\\n          originalLength: rawUsfm.length,\\n          cleanLength: cleanText.length,\\n          reference: reference.citation,\\n          extractionMethod: extractionMethod\\n        };\\n        \\n      } catch (error) {\\n        console.error('❌ LLM Context: Failed to extract clean text from USFM:', error);\\n        console.error('❌ LLM Context: Error details:', error.message, error.stack);\\n        console.log('🚨 LLM Context: Attempting emergency fallback extraction');\\n        \\n        // EMERGENCY FALLBACK: Use simple string operations for aligned Bibles\\n        try {\\n          const emergencyText = emergencyUSFMExtract(rawUsfm, reference.chapter, reference.verse);\\n          if (emergencyText && emergencyText.trim().length > 0) {\\n            scriptureForLLM = emergencyText;\\n            scriptureMetadata = {\\n              extractedAt: new Date().toISOString(),\\n              isClean: false, // Emergency extraction may not be perfectly clean\\n              originalLength: rawUsfm.length,\\n              cleanLength: emergencyText.length,\\n              reference: reference.citation,\\n              extractionMethod: 'emergency',\\n              fallbackReason: error.message\\n            };\\n            console.log('✅ LLM Context: Emergency extraction successful');\\n          } else {\\n            throw new Error('Emergency extraction also failed');\\n          }\\n        } catch (emergencyError) {\\n          console.error('🚨 LLM Context: Emergency extraction failed:', emergencyError);\\n          \\n          // FINAL FALLBACK: Provide a helpful message instead of raw USFM\\n          scriptureForLLM = \`[Scripture text for \${reference.citation} is temporarily unavailable due to formatting complexity. Translation resources are still available.]\`;\\n          scriptureMetadata = {\\n            extractedAt: new Date().toISOString(),\\n            isClean: true,\\n            originalLength: rawUsfm.length,\\n            cleanLength: scriptureForLLM.length,\\n            reference: reference.citation,\\n            extractionMethod: 'fallback-message',\\n            fallbackReason: 'All extraction methods failed'\\n          };\\n          console.log('📝 LLM Context: Using fallback message for user-friendly experience');\\n        }\\n      }\\n    }\\n    \\n    const formattedContext = {\\n      reference: reference || null,\\n      resources: {\\n        scripture: scriptureForLLM,\\n        translationNotes: resources.notes || [],\\n        translationQuestions: resources.questions || [],\\n        translationWords: resources.words || [],\\n        translationWordLinks: resources.links || [],\\n      },\\n      metadata: {\\n        timestamp: Date.now(),\\n        contextSize: 0,\\n        resourceLoadingStatus: {\\n          scripture: !!scriptureForLLM,\\n          translationNotes: (resources.notes || []).length > 0,\\n          translationQuestions: (resources.questions || []).length > 0,\\n          translationWords: (resources.words || []).length > 0,\\n          translationWordLinks: (resources.links || []).length > 0,\\n        },\\n        scriptureMetadata: scriptureMetadata,\\n      },\\n    };\\n    \\n    return formattedContext;\\n  }\\n\\n  async function handleSendMessage() {\\n    if (!userInput.trim() || isSubmitting) return;\\n\\n    const message = userInput.trim();\\n    userInput = '';\\n    isSubmitting = true;\\n\\n    // Reset textarea height\\n    if (textareaRef) {\\n      textareaRef.style.height = 'auto';\\n    }\\n\\n    try {\\n      // Add user message\\n      chatStore.addMessage({ role: 'user', content: message });\\n      \\n      // Context is ALWAYS ready and consistent\\n      const formattedContext = getFormattedContext();\\n      \\n      // Send to LLM service with context\\n      const response = await sendChatMessage(message, formattedContext);\\n      \\n      // Handle response properly\\n      if (response.success) {\\n        // Add successful AI response\\n        chatStore.addMessage({ \\n          role: 'assistant', \\n          content: response.response,\\n          costEstimate: response.costEstimate,\\n          metadata: response.metadata\\n        });\\n        \\n        // Update session cost if available\\n        if (response.costEstimate?.totalCost) {\\n          sessionCost += response.costEstimate.totalCost;\\n        }\\n      } else {\\n        // Add error message\\n        chatStore.addMessage({ \\n          role: 'error', \\n          content: response.error || 'Unknown error occurred while processing your message.'\\n        });\\n      }\\n      \\n      // Activate AI tab to show the response\\n      chatStore.activateAITab();\\n      \\n    } catch (error) {\\n      console.error('Error sending message:', error);\\n      \\n      // Add user-friendly error message\\n      let errorMessage = 'Sorry, there was an error processing your message. ';\\n      \\n      if (error.message?.includes('timeout')) {\\n        errorMessage += 'The request timed out. Please try again with a shorter message.';\\n      } else if (error.message?.includes('network')) {\\n        errorMessage += 'Network connection issue. Please check your connection and try again.';\\n      } else {\\n        errorMessage += 'Please try again in a moment.';\\n      }\\n      \\n      chatStore.addMessage({ \\n        role: 'error', \\n        content: errorMessage\\n      });\\n    } finally {\\n      isSubmitting = false;\\n    }\\n  }\\n\\n  function handleKeyPress(e) {\\n    if (e.key === 'Enter' && !e.shiftKey) {\\n      e.preventDefault();\\n      handleSendMessage();\\n    }\\n  }\\n\\n  function formatTimestamp(timestamp) {\\n    return new Date(timestamp).toLocaleTimeString([], {\\n      hour: '2-digit',\\n      minute: '2-digit',\\n    });\\n  }\\n\\n  function formatCostDisplay(cost) {\\n    if (cost < 0.0001) {\\n      return '<$0.0001';\\n    }\\n    return \`$\${cost.toFixed(4)}\`;\\n  }\\n\\n  function getSessionCostColor(total) {\\n    if (total < 0.01) return 'session-cost-low';\\n    if (total < 0.1) return 'session-cost-medium';\\n    return 'session-cost-high';\\n  }\\n\\n  // Handle clicking on prompt suggestions\\n  async function handlePromptSuggestionClick(prompt) {\\n    if (isSubmitting) return;\\n    userInput = prompt;\\n    // Auto-send the message\\n    setTimeout(() => handleSendMessage(), 100);\\n  }\\n\\n  // Get contextual prompt suggestions based on available resources\\n  function getPromptSuggestions() {\\n    const suggestions = [\\n      'What are the key translation challenges for this verse?',\\n      'Explain the cultural context of this passage',\\n      'What are the important words to understand in this verse?',\\n    ];\\n\\n    // Add resource-specific suggestions\\n    if ((resources.notes || []).length > 0) {\\n      suggestions.push('Summarize the translation notes for this verse');\\n    }\\n    \\n    if ((resources.questions || []).length > 0) {\\n      suggestions.push('What questions should translators consider?');\\n    }\\n    \\n    if ((resources.words || []).length > 0) {\\n      suggestions.push('Define the key theological terms in this passage');\\n    }\\n\\n    return suggestions.slice(0, 6);\\n  }\\n\\n  // Get current context info for display\\n  $: contextInfo = {\\n    reference: reference?.citation || 'No reference',\\n    resourceCount: (resources.scripture ? 1 : 0) +\\n                  (resources.notes?.length || 0) +\\n                  (resources.questions?.length || 0) +\\n                  (resources.words?.length || 0) +\\n                  (resources.links?.length || 0)\\n  };\\n\\n  onDestroy(() => {\\n    unsubscribeResources();\\n    unsubscribeMessages();\\n    unsubscribeReference();\\n  });\\n<\/script>\\n\\n<div class=\\"chat-panel\\" data-testid=\\"llm-chat-panel\\">\\n  <!-- Chat Header -->\\n  <div class=\\"chat-header\\">\\n    <div class=\\"header-title\\">\\n      <h3>Translation Assistant</h3>\\n      <span class=\\"subtitle\\">Powered by AI</span>\\n    </div>\\n    <div class=\\"header-actions\\">\\n      <div class=\\"context-indicator\\" title=\\"Current context\\">\\n        <span class=\\"context-icon\\">📚</span>\\n        <span class=\\"context-text\\">\\n          {contextInfo.reference} ({contextInfo.resourceCount} sources)\\n        </span>\\n      </div>\\n      \\n      {#if sessionCost > 0}\\n        <div class=\\"session-cost-indicator {getSessionCostColor(sessionCost)}\\" title=\\"Total conversation cost: {formatCostDisplay(sessionCost)}\\">\\n          <span class=\\"session-cost-icon\\">💰</span>\\n          <span class=\\"session-cost-text\\">{formatCostDisplay(sessionCost)}</span>\\n        </div>\\n      {/if}\\n      \\n      <button on:click={clearMessages} class=\\"clear-button\\" title=\\"Clear conversation\\" disabled={messages.length === 0}>🗑️</button>\\n    </div>\\n  </div>\\n\\n  <!-- Welcome Message -->\\n  {#if messages.length === 0}\\n    <div class=\\"welcome-message\\">\\n      <div class=\\"welcome-icon\\">\\n        <TabIcon type=\\"chat\\" class=\\"tab-icon\\" />\\n      </div>\\n      <h4>Welcome to Translation Assistant!</h4>\\n      <p>I can help with translation resources. Ask me anything about:</p>\\n      <ul>\\n        <li>Translation notes and explanations</li>\\n        <li>Key words and their meanings</li>\\n        <li>Cultural and historical context</li>\\n        <li>Translation questions and challenges</li>\\n      </ul>\\n      \\n      <!-- Show current resources -->\\n      {#if contextInfo.resourceCount > 0}\\n        <div class=\\"available-resources\\">\\n          <p><strong>Currently Available:</strong></p>\\n          <div class=\\"resources-list\\">\\n            {#if resources.scripture}\\n              <span class=\\"resource-tag\\">Scripture ✓</span>\\n            {/if}\\n            {#if (resources.notes?.length || 0) > 0}\\n              <span class=\\"resource-tag\\">Notes ({resources.notes.length}) ✓</span>\\n            {/if}\\n            {#if (resources.questions?.length || 0) > 0}\\n              <span class=\\"resource-tag\\">Questions ({resources.questions.length}) ✓</span>\\n            {/if}\\n            {#if (resources.words?.length || 0) > 0}\\n              <span class=\\"resource-tag\\">Words ({resources.words.length}) ✓</span>\\n            {/if}\\n            {#if (resources.links?.length || 0) > 0}\\n              <span class=\\"resource-tag\\">Links ({resources.links.length}) ✓</span>\\n            {/if}\\n          </div>\\n        </div>\\n      {/if}\\n      \\n      <div class=\\"prompt-suggestions\\">\\n        <p><strong>Try asking:</strong></p>\\n        <div class=\\"suggestions-list\\">\\n          {#each getPromptSuggestions() as suggestion}\\n            <button\\n              class=\\"suggestion-button\\"\\n              on:click={() => handlePromptSuggestionClick(suggestion)}\\n              disabled={isSubmitting}\\n            >\\n              {suggestion}\\n            </button>\\n          {/each}\\n        </div>\\n      </div>\\n    </div>\\n  {/if}\\n\\n  <!-- Messages - Only show when there are messages -->\\n  {#if messages.length > 0}\\n    <div class=\\"messages-container\\">\\n      {#each messages as message}\\n        <div class=\\"message {message.role === 'user' ? 'user-message' : 'assistant-message'} {message.role === 'error' ? 'error-message' : ''}\\">\\n          <div class=\\"message-content\\">\\n            <div class=\\"message-text\\">\\n              {#if message.role === 'assistant'}\\n                {@html processMarkdownWithRcLinks(enhanceLLMResponse(message.content, {\\n                  enabled: true,\\n                  maxEmojisPerResponse: 6,\\n                  excludeCategories: [],\\n                }), (rcLink) => {\\n                  // RC link clicked in chat\\n                })}\\n              {:else}\\n                {message.content}\\n              {/if}\\n            </div>\\n            <div class=\\"message-time\\">\\n              {formatTimestamp(message.timestamp)}\\n              {#if message.role === 'assistant' && message.costEstimate}\\n                <div class=\\"message-cost\\">\\n                  <span class=\\"cost-badge\\">{formatCostDisplay(message.costEstimate.totalCost)}</span>\\n                </div>\\n              {/if}\\n              {#if message.metadata?.mock}\\n                <span class=\\"mock-badge\\">MOCK</span>\\n              {/if}\\n            </div>\\n          </div>\\n        </div>\\n      {/each}\\n      \\n      {#if isSubmitting}\\n        <div class=\\"loading-message\\">\\n          <div class=\\"message-content\\">\\n            <div class=\\"typing-indicator\\">\\n              <span></span>\\n              <span></span>\\n              <span></span>\\n            </div>\\n            <div class=\\"loading-text\\">AI is thinking...</div>\\n          </div>\\n        </div>\\n      {/if}\\n      \\n      <div bind:this={messagesEndRef}></div>\\n    </div>\\n  {/if}\\n\\n  <!-- Chat Input -->\\n  <div class=\\"chat-input\\">\\n    <div class=\\"input-container\\">\\n      <textarea\\n        bind:this={textareaRef}\\n        bind:value={userInput}\\n        on:keypress={handleKeyPress}\\n        placeholder=\\"Ask about this verse...\\"\\n        class=\\"message-input\\"\\n        disabled={isSubmitting}\\n        rows=\\"1\\"\\n      />\\n      <button\\n        on:click={handleSendMessage}\\n        disabled={!userInput.trim() || isSubmitting}\\n        class=\\"send-button\\"\\n      >\\n        {isSubmitting ? '⏳' : '➤'}\\n      </button>\\n    </div>\\n  </div>\\n</div>\\n\\n<style>\\n  .chat-panel {\\n    display: flex;\\n    flex-direction: column;\\n    height: 100%;\\n    background: var(--color-panel);\\n    border: 1px solid var(--color-border);\\n    border-radius: 8px;\\n    overflow: hidden;\\n  }\\n\\n  .chat-header {\\n    display: flex;\\n    justify-content: space-between;\\n    align-items: center;\\n    padding: 1rem;\\n    background: var(--color-header);\\n    border-bottom: 1px solid var(--color-border);\\n    flex-shrink: 0;\\n  }\\n\\n  .header-title h3 {\\n    margin: 0;\\n    color: var(--color-text);\\n    font-size: 1.1rem;\\n  }\\n\\n  .subtitle {\\n    color: var(--color-text-secondary);\\n    font-size: 0.8rem;\\n  }\\n\\n  .header-actions {\\n    display: flex;\\n    align-items: center;\\n    gap: 1rem;\\n  }\\n\\n  .context-indicator {\\n    display: flex;\\n    align-items: center;\\n    gap: 0.5rem;\\n    padding: 0.25rem 0.5rem;\\n    background: var(--color-secondary-alpha);\\n    border-radius: 4px;\\n    font-size: 0.8rem;\\n  }\\n\\n  .context-icon {\\n    font-size: 1rem;\\n  }\\n\\n  .context-text {\\n    color: var(--color-text-secondary);\\n  }\\n\\n  .session-cost-indicator {\\n    display: flex;\\n    align-items: center;\\n    gap: 0.25rem;\\n    padding: 0.25rem 0.5rem;\\n    border-radius: 4px;\\n    font-size: 0.8rem;\\n    font-weight: 500;\\n  }\\n\\n  .session-cost-low {\\n    background: var(--color-success-alpha);\\n    color: var(--color-success);\\n  }\\n\\n  .session-cost-medium {\\n    background: var(--color-warning-alpha);\\n    color: var(--color-warning);\\n  }\\n\\n  .session-cost-high {\\n    background: var(--color-error-alpha);\\n    color: var(--color-error);\\n  }\\n\\n  .clear-button {\\n    background: transparent;\\n    border: none;\\n    color: var(--color-text-secondary);\\n    cursor: pointer;\\n    padding: 0.25rem;\\n    border-radius: 4px;\\n    font-size: 1rem;\\n    transition: all 0.2s ease;\\n  }\\n\\n  .clear-button:hover:not(:disabled) {\\n    background: var(--color-hover);\\n    color: var(--color-text);\\n  }\\n\\n  .clear-button:disabled {\\n    opacity: 0.5;\\n    cursor: not-allowed;\\n  }\\n\\n  .welcome-message {\\n    flex: 1;\\n    padding: 2rem;\\n    text-align: center;\\n    overflow-y: auto;\\n  }\\n\\n  .welcome-icon {\\n    margin-bottom: 1rem;\\n  }\\n\\n  .welcome-message h4 {\\n    color: var(--color-primary);\\n    margin-bottom: 1rem;\\n  }\\n\\n  .welcome-message p {\\n    color: var(--color-text-secondary);\\n    margin-bottom: 1rem;\\n  }\\n\\n  .welcome-message ul {\\n    text-align: left;\\n    max-width: 400px;\\n    margin: 0 auto 2rem;\\n    color: var(--color-text-secondary);\\n  }\\n\\n  .available-resources {\\n    margin: 2rem 0;\\n    padding: 1rem;\\n    background: var(--color-background);\\n    border-radius: 8px;\\n  }\\n\\n  .resources-list {\\n    display: flex;\\n    flex-wrap: wrap;\\n    gap: 0.5rem;\\n    justify-content: center;\\n  }\\n\\n  .resource-tag {\\n    background: var(--color-success-alpha);\\n    color: var(--color-success);\\n    padding: 0.25rem 0.5rem;\\n    border-radius: 4px;\\n    font-size: 0.8rem;\\n    font-weight: 500;\\n  }\\n\\n  .prompt-suggestions {\\n    margin-top: 2rem;\\n  }\\n\\n  .suggestions-list {\\n    display: flex;\\n    flex-direction: column;\\n    gap: 0.5rem;\\n    max-width: 500px;\\n    margin: 0 auto;\\n  }\\n\\n  .suggestion-button {\\n    background: var(--color-background);\\n    border: 1px solid var(--color-border);\\n    color: var(--color-text);\\n    padding: 0.8rem;\\n    border-radius: 6px;\\n    cursor: pointer;\\n    text-align: left;\\n    transition: all 0.2s ease;\\n  }\\n\\n  .suggestion-button:hover:not(:disabled) {\\n    background: var(--color-hover);\\n    border-color: var(--color-primary);\\n  }\\n\\n  .suggestion-button:disabled {\\n    opacity: 0.5;\\n    cursor: not-allowed;\\n  }\\n\\n  .messages-container {\\n    flex: 1;\\n    overflow-y: auto;\\n    padding: 1rem;\\n    display: flex;\\n    flex-direction: column;\\n    gap: 1rem;\\n  }\\n\\n  .message {\\n    display: flex;\\n    flex-direction: column;\\n    max-width: 80%;\\n  }\\n\\n  .user-message {\\n    align-self: flex-end;\\n  }\\n\\n  .assistant-message {\\n    align-self: flex-start;\\n  }\\n\\n  .error-message {\\n    align-self: center;\\n    max-width: 90%;\\n  }\\n\\n  .message-content {\\n    background: var(--color-background);\\n    border: 1px solid var(--color-border);\\n    border-radius: 8px;\\n    padding: 0.8rem;\\n  }\\n\\n  .user-message .message-content {\\n    background: var(--color-primary-alpha);\\n    border-color: var(--color-primary);\\n  }\\n\\n  .error-message .message-content {\\n    background: var(--color-error-alpha);\\n    border-color: var(--color-error);\\n    color: var(--color-error);\\n  }\\n\\n  .message-text {\\n    margin-bottom: 0.5rem;\\n    line-height: 1.5;\\n  }\\n\\n  .message-time {\\n    display: flex;\\n    align-items: center;\\n    gap: 0.5rem;\\n    font-size: 0.8rem;\\n    color: var(--color-text-secondary);\\n  }\\n\\n  .cost-badge {\\n    background: var(--color-secondary-alpha);\\n    color: var(--color-secondary);\\n    padding: 0.1rem 0.3rem;\\n    border-radius: 3px;\\n    font-size: 0.7rem;\\n    font-weight: 500;\\n  }\\n\\n  .mock-badge {\\n    background: var(--color-warning-alpha);\\n    color: var(--color-warning);\\n    padding: 0.1rem 0.3rem;\\n    border-radius: 3px;\\n    font-size: 0.7rem;\\n    font-weight: 500;\\n  }\\n\\n  .loading-message {\\n    align-self: flex-start;\\n    max-width: 80%;\\n  }\\n\\n  .loading-message .message-content {\\n    display: flex;\\n    align-items: center;\\n    gap: 0.5rem;\\n  }\\n\\n  .typing-indicator {\\n    display: flex;\\n    gap: 0.2rem;\\n  }\\n\\n  .typing-indicator span {\\n    width: 6px;\\n    height: 6px;\\n    background: var(--color-text-secondary);\\n    border-radius: 50%;\\n    animation: typing 1.4s infinite;\\n  }\\n\\n  .typing-indicator span:nth-child(2) {\\n    animation-delay: 0.2s;\\n  }\\n\\n  .typing-indicator span:nth-child(3) {\\n    animation-delay: 0.4s;\\n  }\\n\\n  @keyframes typing {\\n    0%, 60%, 100% {\\n      transform: translateY(0);\\n    }\\n    30% {\\n      transform: translateY(-10px);\\n    }\\n  }\\n\\n  .loading-text {\\n    color: var(--color-text-secondary);\\n    font-style: italic;\\n    font-size: 0.9rem;\\n  }\\n\\n  .chat-input {\\n    padding: 1rem;\\n    border-top: 1px solid var(--color-border);\\n    background: var(--color-header);\\n    flex-shrink: 0;\\n  }\\n\\n  .input-container {\\n    display: flex;\\n    gap: 0.5rem;\\n    align-items: end;\\n  }\\n\\n  .message-input {\\n    flex: 1;\\n    padding: 0.8rem;\\n    border: 1px solid var(--color-border);\\n    border-radius: 6px;\\n    background: var(--color-background);\\n    color: var(--color-text);\\n    font-family: inherit;\\n    font-size: 0.9rem;\\n    resize: none;\\n    min-height: 44px;\\n    max-height: 120px;\\n    overflow-y: auto;\\n  }\\n\\n  .message-input:focus {\\n    outline: none;\\n    border-color: var(--color-primary);\\n  }\\n\\n  .message-input:disabled {\\n    opacity: 0.5;\\n    cursor: not-allowed;\\n  }\\n\\n  .send-button {\\n    background: var(--color-primary);\\n    color: white;\\n    border: none;\\n    border-radius: 6px;\\n    padding: 0.8rem 1rem;\\n    cursor: pointer;\\n    font-size: 1rem;\\n    min-width: 44px;\\n    height: 44px;\\n    display: flex;\\n    align-items: center;\\n    justify-content: center;\\n    transition: all 0.2s ease;\\n  }\\n\\n  .send-button:hover:not(:disabled) {\\n    background: var(--color-primary-hover);\\n    transform: translateY(-1px);\\n  }\\n\\n  .send-button:disabled {\\n    opacity: 0.5;\\n    cursor: not-allowed;\\n  }\\n\\n  /* Responsive design */\\n  @media (max-width: 768px) {\\n    .chat-header {\\n      flex-direction: column;\\n      gap: 0.5rem;\\n      align-items: flex-start;\\n    }\\n\\n    .header-actions {\\n      width: 100%;\\n      justify-content: space-between;\\n    }\\n\\n    .welcome-message {\\n      padding: 1rem;\\n    }\\n\\n    .message {\\n      max-width: 95%;\\n    }\\n\\n    .suggestions-list {\\n      max-width: 100%;\\n    }\\n\\n    .resources-list {\\n      flex-direction: column;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AAkeE,uCAAY,CACV,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,IAAI,aAAa,CAAC,CAC9B,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,aAAa,CAAE,GAAG,CAClB,QAAQ,CAAE,MACZ,CAEA,wCAAa,CACX,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,aAAa,CAC9B,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,IAAI,cAAc,CAAC,CAC/B,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CAC5C,WAAW,CAAE,CACf,CAEA,2BAAa,CAAC,gBAAG,CACf,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,SAAS,CAAE,MACb,CAEA,qCAAU,CACR,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,SAAS,CAAE,MACb,CAEA,2CAAgB,CACd,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,IACP,CAEA,8CAAmB,CACjB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,MAAM,CACX,OAAO,CAAE,OAAO,CAAC,MAAM,CACvB,UAAU,CAAE,IAAI,uBAAuB,CAAC,CACxC,aAAa,CAAE,GAAG,CAClB,SAAS,CAAE,MACb,CAEA,yCAAc,CACZ,SAAS,CAAE,IACb,CAEA,yCAAc,CACZ,KAAK,CAAE,IAAI,sBAAsB,CACnC,CAEA,mDAAwB,CACtB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,OAAO,CACZ,OAAO,CAAE,OAAO,CAAC,MAAM,CACvB,aAAa,CAAE,GAAG,CAClB,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GACf,CAEA,6CAAkB,CAChB,UAAU,CAAE,IAAI,qBAAqB,CAAC,CACtC,KAAK,CAAE,IAAI,eAAe,CAC5B,CAEA,gDAAqB,CACnB,UAAU,CAAE,IAAI,qBAAqB,CAAC,CACtC,KAAK,CAAE,IAAI,eAAe,CAC5B,CAEA,8CAAmB,CACjB,UAAU,CAAE,IAAI,mBAAmB,CAAC,CACpC,KAAK,CAAE,IAAI,aAAa,CAC1B,CAEA,yCAAc,CACZ,UAAU,CAAE,WAAW,CACvB,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,MAAM,CAAE,OAAO,CACf,OAAO,CAAE,OAAO,CAChB,aAAa,CAAE,GAAG,CAClB,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IACvB,CAEA,yCAAa,MAAM,KAAK,SAAS,CAAE,CACjC,UAAU,CAAE,IAAI,aAAa,CAAC,CAC9B,KAAK,CAAE,IAAI,YAAY,CACzB,CAEA,yCAAa,SAAU,CACrB,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,WACV,CAEA,4CAAiB,CACf,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,MAAM,CAClB,UAAU,CAAE,IACd,CAEA,yCAAc,CACZ,aAAa,CAAE,IACjB,CAEA,8BAAgB,CAAC,gBAAG,CAClB,KAAK,CAAE,IAAI,eAAe,CAAC,CAC3B,aAAa,CAAE,IACjB,CAEA,8BAAgB,CAAC,eAAE,CACjB,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,aAAa,CAAE,IACjB,CAEA,8BAAgB,CAAC,gBAAG,CAClB,UAAU,CAAE,IAAI,CAChB,SAAS,CAAE,KAAK,CAChB,MAAM,CAAE,CAAC,CAAC,IAAI,CAAC,IAAI,CACnB,KAAK,CAAE,IAAI,sBAAsB,CACnC,CAEA,gDAAqB,CACnB,MAAM,CAAE,IAAI,CAAC,CAAC,CACd,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,IAAI,kBAAkB,CAAC,CACnC,aAAa,CAAE,GACjB,CAEA,2CAAgB,CACd,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,IAAI,CACf,GAAG,CAAE,MAAM,CACX,eAAe,CAAE,MACnB,CAEA,yCAAc,CACZ,UAAU,CAAE,IAAI,qBAAqB,CAAC,CACtC,KAAK,CAAE,IAAI,eAAe,CAAC,CAC3B,OAAO,CAAE,OAAO,CAAC,MAAM,CACvB,aAAa,CAAE,GAAG,CAClB,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GACf,CAEA,+CAAoB,CAClB,UAAU,CAAE,IACd,CAEA,6CAAkB,CAChB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,MAAM,CACX,SAAS,CAAE,KAAK,CAChB,MAAM,CAAE,CAAC,CAAC,IACZ,CAEA,8CAAmB,CACjB,UAAU,CAAE,IAAI,kBAAkB,CAAC,CACnC,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,OAAO,CAAE,MAAM,CACf,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,IAAI,CAChB,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IACvB,CAEA,8CAAkB,MAAM,KAAK,SAAS,CAAE,CACtC,UAAU,CAAE,IAAI,aAAa,CAAC,CAC9B,YAAY,CAAE,IAAI,eAAe,CACnC,CAEA,8CAAkB,SAAU,CAC1B,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,WACV,CAEA,+CAAoB,CAClB,IAAI,CAAE,CAAC,CACP,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,IAAI,CACb,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,IACP,CAEA,oCAAS,CACP,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,SAAS,CAAE,GACb,CAEA,yCAAc,CACZ,UAAU,CAAE,QACd,CAEA,8CAAmB,CACjB,UAAU,CAAE,UACd,CAEA,0CAAe,CACb,UAAU,CAAE,MAAM,CAClB,SAAS,CAAE,GACb,CAEA,4CAAiB,CACf,UAAU,CAAE,IAAI,kBAAkB,CAAC,CACnC,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,MACX,CAEA,2BAAa,CAAC,8BAAiB,CAC7B,UAAU,CAAE,IAAI,qBAAqB,CAAC,CACtC,YAAY,CAAE,IAAI,eAAe,CACnC,CAEA,4BAAc,CAAC,8BAAiB,CAC9B,UAAU,CAAE,IAAI,mBAAmB,CAAC,CACpC,YAAY,CAAE,IAAI,aAAa,CAAC,CAChC,KAAK,CAAE,IAAI,aAAa,CAC1B,CAEA,yCAAc,CACZ,aAAa,CAAE,MAAM,CACrB,WAAW,CAAE,GACf,CAEA,yCAAc,CACZ,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,MAAM,CACX,SAAS,CAAE,MAAM,CACjB,KAAK,CAAE,IAAI,sBAAsB,CACnC,CAEA,uCAAY,CACV,UAAU,CAAE,IAAI,uBAAuB,CAAC,CACxC,KAAK,CAAE,IAAI,iBAAiB,CAAC,CAC7B,OAAO,CAAE,MAAM,CAAC,MAAM,CACtB,aAAa,CAAE,GAAG,CAClB,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GACf,CAEA,uCAAY,CACV,UAAU,CAAE,IAAI,qBAAqB,CAAC,CACtC,KAAK,CAAE,IAAI,eAAe,CAAC,CAC3B,OAAO,CAAE,MAAM,CAAC,MAAM,CACtB,aAAa,CAAE,GAAG,CAClB,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GACf,CAEA,4CAAiB,CACf,UAAU,CAAE,UAAU,CACtB,SAAS,CAAE,GACb,CAEA,8BAAgB,CAAC,8BAAiB,CAChC,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,MACP,CAEA,6CAAkB,CAChB,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,MACP,CAEA,+BAAiB,CAAC,kBAAK,CACrB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,CACX,UAAU,CAAE,IAAI,sBAAsB,CAAC,CACvC,aAAa,CAAE,GAAG,CAClB,SAAS,CAAE,oBAAM,CAAC,IAAI,CAAC,QACzB,CAEA,+BAAiB,CAAC,kBAAI,WAAW,CAAC,CAAE,CAClC,eAAe,CAAE,IACnB,CAEA,+BAAiB,CAAC,kBAAI,WAAW,CAAC,CAAE,CAClC,eAAe,CAAE,IACnB,CAEA,WAAW,oBAAO,CAChB,EAAE,CAAE,GAAG,CAAE,IAAK,CACZ,SAAS,CAAE,WAAW,CAAC,CACzB,CACA,GAAI,CACF,SAAS,CAAE,WAAW,KAAK,CAC7B,CACF,CAEA,yCAAc,CACZ,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,UAAU,CAAE,MAAM,CAClB,SAAS,CAAE,MACb,CAEA,uCAAY,CACV,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACzC,UAAU,CAAE,IAAI,cAAc,CAAC,CAC/B,WAAW,CAAE,CACf,CAEA,4CAAiB,CACf,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,MAAM,CACX,WAAW,CAAE,GACf,CAEA,0CAAe,CACb,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,MAAM,CACf,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACrC,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,IAAI,kBAAkB,CAAC,CACnC,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,WAAW,CAAE,OAAO,CACpB,SAAS,CAAE,MAAM,CACjB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,IAAI,CAChB,UAAU,CAAE,KAAK,CACjB,UAAU,CAAE,IACd,CAEA,0CAAc,MAAO,CACnB,OAAO,CAAE,IAAI,CACb,YAAY,CAAE,IAAI,eAAe,CACnC,CAEA,0CAAc,SAAU,CACtB,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,WACV,CAEA,wCAAa,CACX,UAAU,CAAE,IAAI,eAAe,CAAC,CAChC,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,MAAM,CAAC,IAAI,CACpB,MAAM,CAAE,OAAO,CACf,SAAS,CAAE,IAAI,CACf,SAAS,CAAE,IAAI,CACf,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IACvB,CAEA,wCAAY,MAAM,KAAK,SAAS,CAAE,CAChC,UAAU,CAAE,IAAI,qBAAqB,CAAC,CACtC,SAAS,CAAE,WAAW,IAAI,CAC5B,CAEA,wCAAY,SAAU,CACpB,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,WACV,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,wCAAa,CACX,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,MAAM,CACX,WAAW,CAAE,UACf,CAEA,2CAAgB,CACd,KAAK,CAAE,IAAI,CACX,eAAe,CAAE,aACnB,CAEA,4CAAiB,CACf,OAAO,CAAE,IACX,CAEA,oCAAS,CACP,SAAS,CAAE,GACb,CAEA,6CAAkB,CAChB,SAAS,CAAE,IACb,CAEA,2CAAgB,CACd,cAAc,CAAE,MAClB,CACF"}`
};
function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatCostDisplay(cost) {
  if (cost < 1e-4) {
    return "<$0.0001";
  }
  return `$${cost.toFixed(4)}`;
}
const LLMChatPanel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let contextInfo;
  let userInput = "";
  let isSubmitting = false;
  let messagesEndRef;
  let textareaRef;
  let resources2 = {};
  let messages2 = [];
  let reference2 = null;
  const unsubscribeResources = resourcesStore.subscribe((value) => {
    resources2 = value;
  });
  const unsubscribeMessages = chatStore.messages.subscribe((value) => {
    messages2 = value;
  });
  const unsubscribeReference = resourcesStore.reference.subscribe((value) => {
    reference2 = value;
  });
  function getPromptSuggestions() {
    const suggestions = [
      "What are the key translation challenges for this verse?",
      "Explain the cultural context of this passage",
      "What are the important words to understand in this verse?"
    ];
    if ((resources2.notes || []).length > 0) {
      suggestions.push("Summarize the translation notes for this verse");
    }
    if ((resources2.questions || []).length > 0) {
      suggestions.push("What questions should translators consider?");
    }
    if ((resources2.words || []).length > 0) {
      suggestions.push("Define the key theological terms in this passage");
    }
    return suggestions.slice(0, 6);
  }
  onDestroy(() => {
    unsubscribeResources();
    unsubscribeMessages();
    unsubscribeReference();
  });
  $$result.css.add(css$5);
  contextInfo = {
    reference: reference2?.citation || "No reference",
    resourceCount: (resources2.scripture ? 1 : 0) + (resources2.notes?.length || 0) + (resources2.questions?.length || 0) + (resources2.words?.length || 0) + (resources2.links?.length || 0)
  };
  return `<div class="chat-panel svelte-s35tb8" data-testid="llm-chat-panel"> <div class="chat-header svelte-s35tb8"><div class="header-title svelte-s35tb8" data-svelte-h="svelte-mdab8u"><h3 class="svelte-s35tb8">Translation Assistant</h3> <span class="subtitle svelte-s35tb8">Powered by AI</span></div> <div class="header-actions svelte-s35tb8"><div class="context-indicator svelte-s35tb8" title="Current context"><span class="context-icon svelte-s35tb8" data-svelte-h="svelte-1tzlhu1">📚</span> <span class="context-text svelte-s35tb8">${escape(contextInfo.reference)} (${escape(contextInfo.resourceCount)} sources)</span></div> ${``} <button class="clear-button svelte-s35tb8" title="Clear conversation" ${messages2.length === 0 ? "disabled" : ""}>🗑️</button></div></div>  ${messages2.length === 0 ? `<div class="welcome-message svelte-s35tb8"><div class="welcome-icon svelte-s35tb8">${validate_component(TabIcon, "TabIcon").$$render($$result, { type: "chat", class: "tab-icon" }, {}, {})}</div> <h4 class="svelte-s35tb8" data-svelte-h="svelte-hivav1">Welcome to Translation Assistant!</h4> <p class="svelte-s35tb8" data-svelte-h="svelte-3swf6a">I can help with translation resources. Ask me anything about:</p> <ul class="svelte-s35tb8" data-svelte-h="svelte-1nb7mzl"><li>Translation notes and explanations</li> <li>Key words and their meanings</li> <li>Cultural and historical context</li> <li>Translation questions and challenges</li></ul>  ${contextInfo.resourceCount > 0 ? `<div class="available-resources svelte-s35tb8"><p class="svelte-s35tb8" data-svelte-h="svelte-5xzsne"><strong>Currently Available:</strong></p> <div class="resources-list svelte-s35tb8">${resources2.scripture ? `<span class="resource-tag svelte-s35tb8" data-svelte-h="svelte-1quawq0">Scripture ✓</span>` : ``} ${(resources2.notes?.length || 0) > 0 ? `<span class="resource-tag svelte-s35tb8">Notes (${escape(resources2.notes.length)}) ✓</span>` : ``} ${(resources2.questions?.length || 0) > 0 ? `<span class="resource-tag svelte-s35tb8">Questions (${escape(resources2.questions.length)}) ✓</span>` : ``} ${(resources2.words?.length || 0) > 0 ? `<span class="resource-tag svelte-s35tb8">Words (${escape(resources2.words.length)}) ✓</span>` : ``} ${(resources2.links?.length || 0) > 0 ? `<span class="resource-tag svelte-s35tb8">Links (${escape(resources2.links.length)}) ✓</span>` : ``}</div></div>` : ``} <div class="prompt-suggestions svelte-s35tb8"><p class="svelte-s35tb8" data-svelte-h="svelte-120tdvj"><strong>Try asking:</strong></p> <div class="suggestions-list svelte-s35tb8">${each(getPromptSuggestions(), (suggestion) => {
    return `<button class="suggestion-button svelte-s35tb8" ${""}>${escape(suggestion)} </button>`;
  })}</div></div></div>` : ``}  ${messages2.length > 0 ? `<div class="messages-container svelte-s35tb8">${each(messages2, (message) => {
    return `<div class="${"message " + escape(
      message.role === "user" ? "user-message" : "assistant-message",
      true
    ) + " " + escape(message.role === "error" ? "error-message" : "", true) + " svelte-s35tb8"}"><div class="message-content svelte-s35tb8"><div class="message-text svelte-s35tb8">${message.role === "assistant" ? `<!-- HTML_TAG_START -->${processMarkdownWithRcLinks(
      enhanceLLMResponse(
        message.content,
        {
          enabled: true,
          maxEmojisPerResponse: 6,
          excludeCategories: []
        }
      )
    )}<!-- HTML_TAG_END -->` : `${escape(message.content)}`}</div> <div class="message-time svelte-s35tb8">${escape(formatTimestamp(message.timestamp))} ${message.role === "assistant" && message.costEstimate ? `<div class="message-cost"><span class="cost-badge svelte-s35tb8">${escape(formatCostDisplay(message.costEstimate.totalCost))}</span> </div>` : ``} ${message.metadata?.mock ? `<span class="mock-badge svelte-s35tb8" data-svelte-h="svelte-jk0sab">MOCK</span>` : ``} </div></div> </div>`;
  })} ${``} <div${add_attribute("this", messagesEndRef, 0)}></div></div>` : ``}  <div class="chat-input svelte-s35tb8"><div class="input-container svelte-s35tb8"><textarea placeholder="Ask about this verse..." class="message-input svelte-s35tb8" ${""} rows="1"${add_attribute("this", textareaRef, 0)}>${escape("")}</textarea> <button ${!userInput.trim() || isSubmitting ? "disabled" : ""} class="send-button svelte-s35tb8">${escape("➤")}</button></div></div> </div>`;
});
const css$4 = {
  code: ".fia-item.svelte-1d58pcb.svelte-1d58pcb{background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;overflow:hidden;transition:all 0.2s ease}.fia-item.svelte-1d58pcb.svelte-1d58pcb:hover{border-color:var(--color-primary-alpha);box-shadow:0 2px 8px rgba(0, 0, 0, 0.1)}.item-header.svelte-1d58pcb.svelte-1d58pcb{display:flex;justify-content:space-between;align-items:center;padding:0.75rem;background:var(--color-header);border-bottom:1px solid var(--color-border)}.reference.svelte-1d58pcb.svelte-1d58pcb{font-weight:600;color:var(--color-primary);font-size:0.9rem}.toggle-button.svelte-1d58pcb.svelte-1d58pcb{background:none;border:none;color:var(--color-text-secondary);cursor:pointer;padding:0.25rem;border-radius:4px;font-size:0.9rem;transition:all 0.2s ease}.toggle-button.svelte-1d58pcb.svelte-1d58pcb:hover{background:var(--color-hover);color:var(--color-text)}.media-container.svelte-1d58pcb.svelte-1d58pcb{position:relative;aspect-ratio:16/9;background:var(--color-background);display:flex;align-items:center;justify-content:center}.media-image.svelte-1d58pcb.svelte-1d58pcb{width:100%;height:100%;object-fit:cover;transition:transform 0.2s ease}.media-image.svelte-1d58pcb.svelte-1d58pcb:hover{transform:scale(1.02)}.media-fallback.svelte-1d58pcb.svelte-1d58pcb{display:flex;flex-direction:column;align-items:center;gap:0.5rem;color:var(--color-text-secondary);text-align:center;padding:1rem}.fallback-icon.svelte-1d58pcb.svelte-1d58pcb{font-size:2rem;opacity:0.6}.media-fallback.svelte-1d58pcb p.svelte-1d58pcb{margin:0;font-size:0.9rem}.media-fallback.svelte-1d58pcb small.svelte-1d58pcb{font-size:0.8rem;opacity:0.8;word-break:break-all}.item-details.svelte-1d58pcb.svelte-1d58pcb{padding:0.75rem;background:var(--color-panel);border-top:1px solid var(--color-border);display:flex;flex-direction:column;gap:0.5rem}.detail-row.svelte-1d58pcb.svelte-1d58pcb{display:flex;gap:0.5rem;font-size:0.9rem}.detail-row.svelte-1d58pcb strong.svelte-1d58pcb{color:var(--color-text);min-width:80px}.detail-row.svelte-1d58pcb.svelte-1d58pcb{color:var(--color-text-secondary);word-break:break-all}@media(max-width: 768px){.item-header.svelte-1d58pcb.svelte-1d58pcb{padding:0.5rem}.reference.svelte-1d58pcb.svelte-1d58pcb{font-size:0.8rem}.toggle-button.svelte-1d58pcb.svelte-1d58pcb{font-size:0.8rem}.media-fallback.svelte-1d58pcb.svelte-1d58pcb{padding:0.75rem}.item-details.svelte-1d58pcb.svelte-1d58pcb{padding:0.5rem}.detail-row.svelte-1d58pcb.svelte-1d58pcb{font-size:0.8rem}}",
  map: `{"version":3,"file":"FiaItem.svelte","sources":["FiaItem.svelte"],"sourcesContent":["<script>\\n  import { onMount } from 'svelte';\\n\\n  export let item;\\n  export let type;\\n  export let fiaData;\\n\\n  let imageError = false;\\n  let showDetails = false;\\n\\n  // Use the resolveMediaUrl function from fiaData which has the correct repository URLs\\n  $: mediaUrl = fiaData?.resolveMediaUrl ? fiaData.resolveMediaUrl(item.HREF, type) : null;\\n\\n  function toggleDetails() {\\n    showDetails = !showDetails;\\n  }\\n\\n  function handleImageError() {\\n    imageError = true;\\n  }\\n<\/script>\\n\\n<div class=\\"fia-item\\">\\n  <div class=\\"item-header\\">\\n    <span class=\\"reference\\">{item.REF}</span>\\n    <button \\n      class=\\"toggle-button\\"\\n      on:click={toggleDetails}\\n      title=\\"Show details\\"\\n    >\\n      {showDetails ? '▼' : '▶'}\\n    </button>\\n  </div>\\n\\n  <!-- Media display with fallback -->\\n  <div class=\\"media-container\\">\\n    {#if !imageError && mediaUrl}\\n      <img\\n        src={mediaUrl}\\n        alt=\\"FIA {type} for {item.REF}\\"\\n        class=\\"media-image\\"\\n        loading=\\"lazy\\"\\n        on:error={handleImageError}\\n      />\\n    {:else}\\n      <div class=\\"media-fallback\\">\\n        <span class=\\"fallback-icon\\">\\n          {type === 'images' ? '🖼️' : '🗺️'}\\n        </span>\\n        <p>Media not available</p>\\n        <small>{item.HREF}</small>\\n        {#if mediaUrl}\\n          <small>URL: {mediaUrl}</small>\\n        {/if}\\n      </div>\\n    {/if}\\n  </div>\\n\\n  <!-- Expandable details -->\\n  {#if showDetails}\\n    <div class=\\"item-details\\">\\n      <div class=\\"detail-row\\">\\n        <strong>ID:</strong> {item.ID || 'N/A'}\\n      </div>\\n      <div class=\\"detail-row\\">\\n        <strong>Path:</strong> {item.HREF || 'N/A'}\\n      </div>\\n      <div class=\\"detail-row\\">\\n        <strong>Resolved URL:</strong> {mediaUrl || 'N/A'}\\n      </div>\\n      {#if item.TAGS}\\n        <div class=\\"detail-row\\">\\n          <strong>Tags:</strong> {item.TAGS}\\n        </div>\\n      {/if}\\n      {#if item.SUPPORT}\\n        <div class=\\"detail-row\\">\\n          <strong>Support:</strong> {item.SUPPORT}\\n        </div>\\n      {/if}\\n    </div>\\n  {/if}\\n</div>\\n\\n<style>\\n  .fia-item {\\n    background: var(--color-background);\\n    border: 1px solid var(--color-border);\\n    border-radius: 8px;\\n    overflow: hidden;\\n    transition: all 0.2s ease;\\n  }\\n\\n  .fia-item:hover {\\n    border-color: var(--color-primary-alpha);\\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\\n  }\\n\\n  .item-header {\\n    display: flex;\\n    justify-content: space-between;\\n    align-items: center;\\n    padding: 0.75rem;\\n    background: var(--color-header);\\n    border-bottom: 1px solid var(--color-border);\\n  }\\n\\n  .reference {\\n    font-weight: 600;\\n    color: var(--color-primary);\\n    font-size: 0.9rem;\\n  }\\n\\n  .toggle-button {\\n    background: none;\\n    border: none;\\n    color: var(--color-text-secondary);\\n    cursor: pointer;\\n    padding: 0.25rem;\\n    border-radius: 4px;\\n    font-size: 0.9rem;\\n    transition: all 0.2s ease;\\n  }\\n\\n  .toggle-button:hover {\\n    background: var(--color-hover);\\n    color: var(--color-text);\\n  }\\n\\n  .media-container {\\n    position: relative;\\n    aspect-ratio: 16/9;\\n    background: var(--color-background);\\n    display: flex;\\n    align-items: center;\\n    justify-content: center;\\n  }\\n\\n  .media-image {\\n    width: 100%;\\n    height: 100%;\\n    object-fit: cover;\\n    transition: transform 0.2s ease;\\n  }\\n\\n  .media-image:hover {\\n    transform: scale(1.02);\\n  }\\n\\n  .media-fallback {\\n    display: flex;\\n    flex-direction: column;\\n    align-items: center;\\n    gap: 0.5rem;\\n    color: var(--color-text-secondary);\\n    text-align: center;\\n    padding: 1rem;\\n  }\\n\\n  .fallback-icon {\\n    font-size: 2rem;\\n    opacity: 0.6;\\n  }\\n\\n  .media-fallback p {\\n    margin: 0;\\n    font-size: 0.9rem;\\n  }\\n\\n  .media-fallback small {\\n    font-size: 0.8rem;\\n    opacity: 0.8;\\n    word-break: break-all;\\n  }\\n\\n  .item-details {\\n    padding: 0.75rem;\\n    background: var(--color-panel);\\n    border-top: 1px solid var(--color-border);\\n    display: flex;\\n    flex-direction: column;\\n    gap: 0.5rem;\\n  }\\n\\n  .detail-row {\\n    display: flex;\\n    gap: 0.5rem;\\n    font-size: 0.9rem;\\n  }\\n\\n  .detail-row strong {\\n    color: var(--color-text);\\n    min-width: 80px;\\n  }\\n\\n  .detail-row {\\n    color: var(--color-text-secondary);\\n    word-break: break-all;\\n  }\\n\\n  /* Responsive design */\\n  @media (max-width: 768px) {\\n    .item-header {\\n      padding: 0.5rem;\\n    }\\n\\n    .reference {\\n      font-size: 0.8rem;\\n    }\\n\\n    .toggle-button {\\n      font-size: 0.8rem;\\n    }\\n\\n    .media-fallback {\\n      padding: 0.75rem;\\n    }\\n\\n    .item-details {\\n      padding: 0.5rem;\\n    }\\n\\n    .detail-row {\\n      font-size: 0.8rem;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"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"}`
};
const FiaItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let mediaUrl;
  let { item } = $$props;
  let { type } = $$props;
  let { fiaData } = $$props;
  if ($$props.item === void 0 && $$bindings.item && item !== void 0) $$bindings.item(item);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0) $$bindings.type(type);
  if ($$props.fiaData === void 0 && $$bindings.fiaData && fiaData !== void 0) $$bindings.fiaData(fiaData);
  $$result.css.add(css$4);
  mediaUrl = fiaData?.resolveMediaUrl ? fiaData.resolveMediaUrl(item.HREF, type) : null;
  return `<div class="fia-item svelte-1d58pcb"><div class="item-header svelte-1d58pcb"><span class="reference svelte-1d58pcb">${escape(item.REF)}</span> <button class="toggle-button svelte-1d58pcb" title="Show details">${escape("▶")}</button></div>  <div class="media-container svelte-1d58pcb">${mediaUrl ? `<img${add_attribute("src", mediaUrl, 0)} alt="${"FIA " + escape(type, true) + " for " + escape(item.REF, true)}" class="media-image svelte-1d58pcb" loading="lazy">` : `<div class="media-fallback svelte-1d58pcb"><span class="fallback-icon svelte-1d58pcb">${escape(type === "images" ? "🖼️" : "🗺️")}</span> <p class="svelte-1d58pcb" data-svelte-h="svelte-wgqn2q">Media not available</p> <small class="svelte-1d58pcb">${escape(item.HREF)}</small> ${mediaUrl ? `<small class="svelte-1d58pcb">URL: ${escape(mediaUrl)}</small>` : ``}</div>`}</div>  ${``} </div>`;
});
const css$3 = {
  code: ".fia-panel.svelte-1r7avg1.svelte-1r7avg1{padding:1rem;background:var(--color-panel);border-radius:8px;height:100%;overflow-y:auto;display:flex;flex-direction:column;gap:1rem}.header.svelte-1r7avg1.svelte-1r7avg1{display:flex;flex-direction:column;gap:0.5rem;border-bottom:1px solid var(--color-border);padding-bottom:1rem}.header.svelte-1r7avg1 h3.svelte-1r7avg1{margin:0;font-size:1.3rem;font-weight:600;color:var(--color-text)}.subtitle.svelte-1r7avg1.svelte-1r7avg1{margin:0;color:var(--color-text-secondary);font-size:0.9rem}.panel-header.svelte-1r7avg1.svelte-1r7avg1{font-size:1.2rem;font-weight:600;margin:0;color:var(--color-text);display:flex;align-items:center;gap:0.5rem}.org-badge.svelte-1r7avg1.svelte-1r7avg1{background:var(--color-secondary-alpha);color:var(--color-secondary);padding:0.2rem 0.5rem;border-radius:4px;font-size:0.8rem;font-weight:500}.section.svelte-1r7avg1.svelte-1r7avg1{display:flex;flex-direction:column;gap:1rem}.section-title.svelte-1r7avg1.svelte-1r7avg1{margin:0;font-size:1.1rem;font-weight:600;color:var(--color-primary);display:flex;align-items:center;gap:0.5rem}.items-grid.svelte-1r7avg1.svelte-1r7avg1{display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:1rem}.fia-item.svelte-1r7avg1.svelte-1r7avg1{background:var(--color-background);border:1px solid var(--color-border);border-radius:8px;overflow:hidden;transition:all 0.2s ease}.fia-item.svelte-1r7avg1.svelte-1r7avg1:hover{border-color:var(--color-primary-alpha);box-shadow:0 2px 8px rgba(0, 0, 0, 0.1)}.item-header.svelte-1r7avg1.svelte-1r7avg1{display:flex;justify-content:space-between;align-items:center;padding:0.75rem;background:var(--color-header);border-bottom:1px solid var(--color-border)}.reference.svelte-1r7avg1.svelte-1r7avg1{font-weight:600;color:var(--color-primary);font-size:0.9rem}.media-container.svelte-1r7avg1.svelte-1r7avg1{position:relative;aspect-ratio:16/9;background:var(--color-background);display:flex;align-items:center;justify-content:center}.media-fallback.svelte-1r7avg1.svelte-1r7avg1{display:flex;flex-direction:column;align-items:center;gap:0.5rem;color:var(--color-text-secondary);text-align:center;padding:1rem}.fallback-icon.svelte-1r7avg1.svelte-1r7avg1{font-size:2rem;opacity:0.6}.media-fallback.svelte-1r7avg1 p.svelte-1r7avg1{margin:0;font-size:0.9rem}.media-fallback.svelte-1r7avg1 small.svelte-1r7avg1{font-size:0.8rem;opacity:0.8;word-break:break-all}.tip-section.svelte-1r7avg1.svelte-1r7avg1{background:var(--color-info-alpha);border:1px solid var(--color-info);border-radius:8px;padding:1rem;margin-top:1rem}.tip-text.svelte-1r7avg1.svelte-1r7avg1{margin:0;color:var(--color-text);display:flex;align-items:flex-start;gap:0.5rem}.tip-icon.svelte-1r7avg1.svelte-1r7avg1{font-size:1.2rem;flex-shrink:0}.tip-bold.svelte-1r7avg1.svelte-1r7avg1{font-weight:600;color:var(--color-info)}.empty-state.svelte-1r7avg1.svelte-1r7avg1{display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-secondary);font-style:italic}.empty-state.svelte-1r7avg1 p.svelte-1r7avg1{margin:0;font-size:1.1rem}@media(max-width: 768px){.fia-panel.svelte-1r7avg1.svelte-1r7avg1{padding:0.5rem}.items-grid.svelte-1r7avg1.svelte-1r7avg1{grid-template-columns:1fr}.header.svelte-1r7avg1 h3.svelte-1r7avg1{font-size:1.2rem}.section-title.svelte-1r7avg1.svelte-1r7avg1{font-size:1rem}.panel-header.svelte-1r7avg1.svelte-1r7avg1{font-size:1.1rem;flex-direction:column;align-items:flex-start;gap:0.25rem}.tip-text.svelte-1r7avg1.svelte-1r7avg1{flex-direction:column;gap:0.25rem}}",
  map: `{"version":3,"file":"FiaPanel.svelte","sources":["FiaPanel.svelte"],"sourcesContent":["<script>\\n  import { onMount } from 'svelte';\\n  import { resourcesStore } from '$lib/stores/resources.js';\\n  import ResourceMetadataCard from './shared/ResourceMetadataCard.svelte';\\n  import HelpsBreadcrumbs from './shared/HelpsBreadcrumbs.svelte';\\n  import FiaItem from './FiaItem.svelte';\\n\\n  export let reference;\\n\\n  let fiaData = null;\\n  let hasTriedLoading = false;\\n\\n  // Subscribe to stores\\n  const unsubscribeResources = resourcesStore.subscribe((resources) => {\\n    fiaData = resources.fia;\\n  });\\n\\n  // Self-activate FIA resources (following existing panel patterns)\\n  onMount(() => {\\n    resourcesStore.activateResource('fia');\\n    hasTriedLoading = true;\\n    \\n    return () => {\\n      unsubscribeResources();\\n    };\\n  });\\n\\n  $: hasFiaContent = fiaData && fiaData.hasContent && \\n    ((fiaData.images && fiaData.images.length > 0) || (fiaData.maps && fiaData.maps.length > 0));\\n<\/script>\\n\\n<!-- Show empty state with consistent styling -->\\n{#if hasTriedLoading && !hasFiaContent && reference?.verse}\\n  <section data-testid=\\"fia-panel\\" class=\\"fia-panel\\">\\n    <!-- Breadcrumbs -->\\n    <HelpsBreadcrumbs\\n      resourceType=\\"fia\\"\\n      languageId=\\"en\\"\\n      organization=\\"BurritoTruck\\"\\n      onStartNavigation={() => {}}\\n    />\\n\\n    <h3 class=\\"panel-header\\">\\n      FIA\\n      <span class=\\"org-badge\\">from BurritoTruck</span>\\n    </h3>\\n\\n    <div class=\\"items-grid\\">\\n      <div class=\\"fia-item\\">\\n        <div class=\\"item-header\\">\\n          <span class=\\"reference\\">No FIA Resources</span>\\n        </div>\\n        <div class=\\"media-container\\">\\n          <div class=\\"media-fallback\\">\\n            <span class=\\"fallback-icon\\">🗺️</span>\\n            <p>No FIA images or maps available for this verse.</p>\\n            <small>Current verse: <strong>{reference.bookId} {reference.chapter}:{reference.verse}</strong></small>\\n          </div>\\n        </div>\\n      </div>\\n    </div>\\n\\n    <div class=\\"tip-section\\">\\n      <p class=\\"tip-text\\">\\n        <span class=\\"tip-icon\\">💡</span>\\n        <span class=\\"tip-bold\\">Tip:</span> Try navigating to a different verse that may have more content.\\n      </p>\\n    </div>\\n\\n    <!-- Resource Metadata Card - Moved to bottom -->\\n    <ResourceMetadataCard\\n      organization=\\"BurritoTruck\\"\\n      title=\\"FIA Resources\\"\\n      languageId=\\"en\\"\\n      resourceType=\\"fia\\"\\n    />\\n  </section>\\n<!-- Show loading state if not tried loading yet -->\\n{:else if !hasFiaContent}\\n  <div class=\\"fia-panel\\">\\n    <div class=\\"empty-state\\">\\n      <p>Loading FIA content...</p>\\n    </div>\\n  </div>\\n<!-- Show FIA content when available -->\\n{:else}\\n  <div class=\\"fia-panel\\">\\n    <div class=\\"header\\">\\n      <h3>FIA Resources</h3>\\n      <p class=\\"subtitle\\">Visual context for Bible study</p>\\n    </div>\\n\\n    {#if fiaData.images && fiaData.images.length > 0}\\n      <div class=\\"section\\">\\n        <h4 class=\\"section-title\\">\\n          📸 Images ({fiaData.images.length})\\n        </h4>\\n        <div class=\\"items-grid\\">\\n          {#each fiaData.images as item, index}\\n            <FiaItem \\n              {item}\\n              type=\\"images\\"\\n              {fiaData}\\n            />\\n          {/each}\\n        </div>\\n      </div>\\n    {/if}\\n\\n    {#if fiaData.maps && fiaData.maps.length > 0}\\n      <div class=\\"section\\">\\n        <h4 class=\\"section-title\\">\\n          🗺️ Maps ({fiaData.maps.length})\\n        </h4>\\n        <div class=\\"items-grid\\">\\n          {#each fiaData.maps as item, index}\\n            <FiaItem \\n              {item}\\n              type=\\"maps\\"\\n              {fiaData}\\n            />\\n          {/each}\\n        </div>\\n      </div>\\n    {/if}\\n  </div>\\n{/if}\\n\\n<style>\\n  .fia-panel {\\n    padding: 1rem;\\n    background: var(--color-panel);\\n    border-radius: 8px;\\n    height: 100%;\\n    overflow-y: auto;\\n    display: flex;\\n    flex-direction: column;\\n    gap: 1rem;\\n  }\\n\\n  .header {\\n    display: flex;\\n    flex-direction: column;\\n    gap: 0.5rem;\\n    border-bottom: 1px solid var(--color-border);\\n    padding-bottom: 1rem;\\n  }\\n\\n  .header h3 {\\n    margin: 0;\\n    font-size: 1.3rem;\\n    font-weight: 600;\\n    color: var(--color-text);\\n  }\\n\\n  .subtitle {\\n    margin: 0;\\n    color: var(--color-text-secondary);\\n    font-size: 0.9rem;\\n  }\\n\\n  .panel-header {\\n    font-size: 1.2rem;\\n    font-weight: 600;\\n    margin: 0;\\n    color: var(--color-text);\\n    display: flex;\\n    align-items: center;\\n    gap: 0.5rem;\\n  }\\n\\n  .org-badge {\\n    background: var(--color-secondary-alpha);\\n    color: var(--color-secondary);\\n    padding: 0.2rem 0.5rem;\\n    border-radius: 4px;\\n    font-size: 0.8rem;\\n    font-weight: 500;\\n  }\\n\\n  .section {\\n    display: flex;\\n    flex-direction: column;\\n    gap: 1rem;\\n  }\\n\\n  .section-title {\\n    margin: 0;\\n    font-size: 1.1rem;\\n    font-weight: 600;\\n    color: var(--color-primary);\\n    display: flex;\\n    align-items: center;\\n    gap: 0.5rem;\\n  }\\n\\n  .items-grid {\\n    display: grid;\\n    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));\\n    gap: 1rem;\\n  }\\n\\n  .fia-item {\\n    background: var(--color-background);\\n    border: 1px solid var(--color-border);\\n    border-radius: 8px;\\n    overflow: hidden;\\n    transition: all 0.2s ease;\\n  }\\n\\n  .fia-item:hover {\\n    border-color: var(--color-primary-alpha);\\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\\n  }\\n\\n  .item-header {\\n    display: flex;\\n    justify-content: space-between;\\n    align-items: center;\\n    padding: 0.75rem;\\n    background: var(--color-header);\\n    border-bottom: 1px solid var(--color-border);\\n  }\\n\\n  .reference {\\n    font-weight: 600;\\n    color: var(--color-primary);\\n    font-size: 0.9rem;\\n  }\\n\\n  .media-container {\\n    position: relative;\\n    aspect-ratio: 16/9;\\n    background: var(--color-background);\\n    display: flex;\\n    align-items: center;\\n    justify-content: center;\\n  }\\n\\n  .media-fallback {\\n    display: flex;\\n    flex-direction: column;\\n    align-items: center;\\n    gap: 0.5rem;\\n    color: var(--color-text-secondary);\\n    text-align: center;\\n    padding: 1rem;\\n  }\\n\\n  .fallback-icon {\\n    font-size: 2rem;\\n    opacity: 0.6;\\n  }\\n\\n  .media-fallback p {\\n    margin: 0;\\n    font-size: 0.9rem;\\n  }\\n\\n  .media-fallback small {\\n    font-size: 0.8rem;\\n    opacity: 0.8;\\n    word-break: break-all;\\n  }\\n\\n  .tip-section {\\n    background: var(--color-info-alpha);\\n    border: 1px solid var(--color-info);\\n    border-radius: 8px;\\n    padding: 1rem;\\n    margin-top: 1rem;\\n  }\\n\\n  .tip-text {\\n    margin: 0;\\n    color: var(--color-text);\\n    display: flex;\\n    align-items: flex-start;\\n    gap: 0.5rem;\\n  }\\n\\n  .tip-icon {\\n    font-size: 1.2rem;\\n    flex-shrink: 0;\\n  }\\n\\n  .tip-bold {\\n    font-weight: 600;\\n    color: var(--color-info);\\n  }\\n\\n  .empty-state {\\n    display: flex;\\n    align-items: center;\\n    justify-content: center;\\n    height: 100%;\\n    color: var(--color-text-secondary);\\n    font-style: italic;\\n  }\\n\\n  .empty-state p {\\n    margin: 0;\\n    font-size: 1.1rem;\\n  }\\n\\n  /* Responsive design */\\n  @media (max-width: 768px) {\\n    .fia-panel {\\n      padding: 0.5rem;\\n    }\\n\\n    .items-grid {\\n      grid-template-columns: 1fr;\\n    }\\n\\n    .header h3 {\\n      font-size: 1.2rem;\\n    }\\n\\n    .section-title {\\n      font-size: 1rem;\\n    }\\n\\n    .panel-header {\\n      font-size: 1.1rem;\\n      flex-direction: column;\\n      align-items: flex-start;\\n      gap: 0.25rem;\\n    }\\n\\n    .tip-text {\\n      flex-direction: column;\\n      gap: 0.25rem;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"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"}`
};
const FiaPanel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let hasFiaContent;
  let { reference: reference2 } = $$props;
  let fiaData = null;
  resourcesStore.subscribe((resources2) => {
    fiaData = resources2.fia;
  });
  if ($$props.reference === void 0 && $$bindings.reference && reference2 !== void 0) $$bindings.reference(reference2);
  $$result.css.add(css$3);
  hasFiaContent = fiaData && fiaData.hasContent && (fiaData.images && fiaData.images.length > 0 || fiaData.maps && fiaData.maps.length > 0);
  return ` ${`${!hasFiaContent ? `<div class="fia-panel svelte-1r7avg1" data-svelte-h="svelte-680rsh"><div class="empty-state svelte-1r7avg1"><p class="svelte-1r7avg1">Loading FIA content...</p></div></div> ` : `<div class="fia-panel svelte-1r7avg1"><div class="header svelte-1r7avg1" data-svelte-h="svelte-n9agvd"><h3 class="svelte-1r7avg1">FIA Resources</h3> <p class="subtitle svelte-1r7avg1">Visual context for Bible study</p></div> ${fiaData.images && fiaData.images.length > 0 ? `<div class="section svelte-1r7avg1"><h4 class="section-title svelte-1r7avg1">📸 Images (${escape(fiaData.images.length)})</h4> <div class="items-grid svelte-1r7avg1">${each(fiaData.images, (item, index) => {
    return `${validate_component(FiaItem, "FiaItem").$$render($$result, { item, type: "images", fiaData }, {}, {})}`;
  })}</div></div>` : ``} ${fiaData.maps && fiaData.maps.length > 0 ? `<div class="section svelte-1r7avg1"><h4 class="section-title svelte-1r7avg1">🗺️ Maps (${escape(fiaData.maps.length)})</h4> <div class="items-grid svelte-1r7avg1">${each(fiaData.maps, (item, index) => {
    return `${validate_component(FiaItem, "FiaItem").$$render($$result, { item, type: "maps", fiaData }, {}, {})}`;
  })}</div></div>` : ``}</div>`}`}`;
});
function filterFiaData$1(fiaData) {
  if (!fiaData) return null;
  return {
    ...fiaData,
    maps: [],
    // Hide maps for this panel
    hasContent: fiaData?.images && fiaData.images.length > 0
  };
}
const FiaImagesPanel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { reference: reference2 } = $$props;
  if ($$props.reference === void 0 && $$bindings.reference && reference2 !== void 0) $$bindings.reference(reference2);
  return `${validate_component(FiaPanel, "FiaPanel").$$render($$result, { reference: reference2, filterData: filterFiaData$1 }, {}, {})}`;
});
function filterFiaData(fiaData) {
  if (!fiaData) return null;
  return {
    ...fiaData,
    images: [],
    // Hide images for this panel
    hasContent: fiaData?.maps && fiaData.maps.length > 0
  };
}
const FiaMapsPanel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { reference: reference2 } = $$props;
  if ($$props.reference === void 0 && $$bindings.reference && reference2 !== void 0) $$bindings.reference(reference2);
  return `${validate_component(FiaPanel, "FiaPanel").$$render($$result, { reference: reference2, filterData: filterFiaData }, {}, {})}`;
});
const css$2 = {
  code: ".helps-tabs.svelte-nisrcy{display:flex;flex-direction:column;height:100%;background:var(--color-background);border-radius:8px;overflow:hidden}.tabs-header.svelte-nisrcy{display:flex;background:var(--color-header);border-bottom:1px solid var(--color-border);padding:0 0.5rem;overflow-x:auto;scrollbar-width:thin}.tabs-header.svelte-nisrcy::-webkit-scrollbar{height:4px}.tabs-header.svelte-nisrcy::-webkit-scrollbar-track{background:var(--color-background)}.tabs-header.svelte-nisrcy::-webkit-scrollbar-thumb{background:var(--color-border);border-radius:2px}.tab-container.svelte-nisrcy{display:flex;align-items:center;position:relative;flex-shrink:0}.tab-button.svelte-nisrcy{display:flex;align-items:center;gap:0.5rem;padding:0.75rem 1rem;background:transparent;border:none;color:var(--color-text-secondary);cursor:pointer;font-size:0.9rem;font-weight:500;white-space:nowrap;transition:all 0.2s ease;border-bottom:2px solid transparent;position:relative}.tab-button.svelte-nisrcy:hover{color:var(--color-text);background:var(--color-hover)}.tab-button.active.svelte-nisrcy{color:var(--color-primary);border-bottom-color:var(--color-primary);background:var(--color-background)}.tab-button.loading.svelte-nisrcy{opacity:0.7}.desktop-label.svelte-nisrcy{display:block}.mobile-label.svelte-nisrcy{display:none}.count-badge.svelte-nisrcy{background:var(--color-primary);color:white;font-size:0.75rem;font-weight:600;padding:0.15rem 0.4rem;border-radius:10px;min-width:18px;text-align:center;line-height:1;display:flex;align-items:center;justify-content:center}.count-badge.zero.svelte-nisrcy{background:var(--color-text-secondary);opacity:0.6}.count-badge.loading-badge.svelte-nisrcy{background:var(--color-secondary);padding:0.2rem 0.4rem}.close-button.svelte-nisrcy{background:none;border:none;color:var(--color-text-secondary);cursor:pointer;font-size:1.2rem;font-weight:bold;padding:0.25rem;margin-left:0.25rem;border-radius:3px;transition:all 0.2s ease;line-height:1}.close-button.svelte-nisrcy:hover{color:var(--color-error);background:var(--color-error-alpha)}.main-tab-content.svelte-nisrcy{flex:1;overflow:hidden;position:relative}.tab-panel.svelte-nisrcy{height:100%;overflow:hidden}@media(max-width: 768px){.desktop-label.svelte-nisrcy{display:none}.mobile-label.svelte-nisrcy{display:block}.tab-button.svelte-nisrcy{padding:0.5rem 0.75rem;font-size:0.8rem}.tabs-header.svelte-nisrcy{padding:0 0.25rem}}.tab-button.svelte-nisrcy:focus{outline:2px solid var(--color-primary);outline-offset:-2px}.close-button.svelte-nisrcy:focus{outline:2px solid var(--color-error);outline-offset:-2px}",
  map: `{"version":3,"file":"HelpsTabs.svelte","sources":["HelpsTabs.svelte"],"sourcesContent":["<script>\\n  import { onMount } from 'svelte';\\n  import { resourcesStore } from '$lib/stores/resources.js';\\n  import LoadingOverlay from './shared/LoadingOverlay.svelte';\\n  import LoadingSpinner from './shared/LoadingSpinner.svelte';\\n  import TabIcon from './shared/TabIcon.svelte';\\n  import TranslationNotesPanel from './TranslationNotesPanel.svelte';\\n  import TranslationQuestionsPanel from './TranslationQuestionsPanel.svelte';\\n  import TranslationWordsPanel from './TranslationWordsPanel.svelte';\\n  import ArticlePanel from './ArticlePanel.svelte';\\n  import LLMChatPanel from './LLMChatPanel.svelte';\\n  import FiaImagesPanel from './FiaImagesPanel.svelte';\\n  import FiaMapsPanel from './FiaMapsPanel.svelte';\\n\\n  export let reference;\\n\\n  let activeTab = 'tn';\\n  let dynamicTabs = [];\\n  let resources = {};\\n  let loadingResources = new Set();\\n\\n  // Static tabs configuration\\n  const STATIC_TABS = [\\n    { id: \\"tn\\", label: \\"Notes\\", mobileLabel: \\"Notes\\", icon: \\"notes\\", component: TranslationNotesPanel, isStatic: true },\\n    { id: \\"tq\\", label: \\"Questions\\", mobileLabel: \\"Q&A\\", icon: \\"questions\\", component: TranslationQuestionsPanel, isStatic: true },\\n    { id: \\"tw\\", label: \\"Words\\", mobileLabel: \\"Words\\", icon: \\"words\\", component: TranslationWordsPanel, isStatic: true },\\n    { id: \\"fia-images\\", label: \\"Images\\", mobileLabel: \\"Pics\\", icon: \\"images\\", component: FiaImagesPanel, isStatic: true },\\n    { id: \\"fia-maps\\", label: \\"Maps\\", mobileLabel: \\"Maps\\", icon: \\"maps\\", component: FiaMapsPanel, isStatic: true },\\n    { id: \\"chat\\", label: \\"AI Assistant\\", mobileLabel: \\"AI\\", icon: \\"chat\\", component: LLMChatPanel, isStatic: true },\\n  ];\\n\\n  // Subscribe to stores\\n  const unsubscribeResources = resourcesStore.subscribe((store) => {\\n    resources = store;\\n  });\\n\\n  const unsubscribeLoadingResources = resourcesStore.loadingResources.subscribe((loading) => {\\n    loadingResources = loading;\\n  });\\n\\n  onMount(() => {\\n    return () => {\\n      unsubscribeResources();\\n      unsubscribeLoadingResources();\\n    };\\n  });\\n\\n  // Helper function to check if a specific resource is loading\\n  function isResourceLoading(tabId) {\\n    const resourceMap = {\\n      'tn': 'notes',\\n      'tq': 'questions', \\n      'tw': 'words',\\n      'fia-images': 'fia',\\n      'fia-maps': 'fia'\\n    };\\n    const resourceType = resourceMap[tabId];\\n    return resourceType && loadingResources.has(resourceType);\\n  }\\n\\n  // Helper function to get count for each resource type\\n  function getResourceCount(tabId) {\\n    // Show loading spinner in badge if resource is loading\\n    if (isResourceLoading(tabId)) {\\n      return 'loading';\\n    }\\n\\n    switch (tabId) {\\n      case 'tn':\\n        return Array.isArray(resources.notes) ? resources.notes.length : 0;\\n      case 'tq':\\n        return Array.isArray(resources.questions) ? resources.questions.length : 0;\\n      case 'tw':\\n        // Count both words and links\\n        const wordsCount = Array.isArray(resources.words) ? resources.words.length : 0;\\n        const linksCount = Array.isArray(resources.links) ? resources.links.length : 0;\\n        return Math.max(wordsCount, linksCount); // Use the higher count\\n      case 'fia-images':\\n        if (resources.fia?.hasContent) {\\n          return Array.isArray(resources.fia.images) ? resources.fia.images.length : 0;\\n        }\\n        return 0;\\n      case 'fia-maps':\\n        if (resources.fia?.hasContent) {\\n          return Array.isArray(resources.fia.maps) ? resources.fia.maps.length : 0;\\n        }\\n        return 0;\\n      case 'chat':\\n        // Return total items loaded across all resources\\n        const totalItems = (\\n          (Array.isArray(resources.notes) ? resources.notes.length : 0) +\\n          (Array.isArray(resources.questions) ? resources.questions.length : 0) +\\n          (Array.isArray(resources.words) ? resources.words.length : 0) +\\n          (resources.fia?.hasContent ? (\\n            (Array.isArray(resources.fia.images) ? resources.fia.images.length : 0) +\\n            (Array.isArray(resources.fia.maps) ? resources.fia.maps.length : 0)\\n          ) : 0)\\n        );\\n        return totalItems > 0 ? totalItems : null;\\n      default:\\n        return null;\\n    }\\n  }\\n\\n  // Combine static and dynamic tabs\\n  $: allTabs = [...STATIC_TABS, ...dynamicTabs];\\n\\n  // Public API for parent components (equivalent to useImperativeHandle)\\n  export function switchToTab(tabId) {\\n    if (allTabs.find((tab) => tab.id === tabId)) {\\n      activeTab = tabId;\\n    }\\n  }\\n\\n  export function getActiveTab() {\\n    return activeTab;\\n  }\\n\\n  export function openArticleTab(article) {\\n    // Check if tab already exists by rcUri\\n    const existingTab = dynamicTabs.find((tab) => tab.articleData?.rcUri === article.rcUri);\\n    if (existingTab) {\\n      activeTab = existingTab.id;\\n      return;\\n    }\\n\\n    // Use provided id or generate one from rcUri\\n    const tabId = article.id || article.rcUri.replace(/[^a-zA-Z0-9]/g, \\"_\\");\\n\\n    // Create new dynamic tab\\n    const newTab = {\\n      id: tabId,\\n      label: article.title || \\"Article\\",\\n      component: ArticlePanel,\\n      isStatic: false,\\n      articleData: article,\\n    };\\n\\n    dynamicTabs = [...dynamicTabs, newTab];\\n    activeTab = tabId;\\n  }\\n\\n  export function closeTab(tabId) {\\n    // Only allow closing dynamic tabs\\n    const tabToClose = dynamicTabs.find((tab) => tab.id === tabId);\\n    if (tabToClose) {\\n      dynamicTabs = dynamicTabs.filter((tab) => tab.id !== tabId);\\n\\n      // If closing active tab, switch to first available tab\\n      if (activeTab === tabId) {\\n        const remainingTabs = allTabs.filter((tab) => tab.id !== tabId);\\n        if (remainingTabs.length > 0) {\\n          activeTab = remainingTabs[0].id;\\n        }\\n      }\\n    }\\n  }\\n\\n  function handleTabChange(tabId) {\\n    activeTab = tabId;\\n  }\\n\\n  function handleCloseTab(tabId, event) {\\n    event.stopPropagation();\\n    const tabToClose = dynamicTabs.find((tab) => tab.id === tabId);\\n    if (tabToClose) {\\n      dynamicTabs = dynamicTabs.filter((tab) => tab.id !== tabId);\\n\\n      // If closing active tab, switch to first available tab\\n      if (activeTab === tabId) {\\n        const remainingTabs = allTabs.filter((tab) => tab.id !== tabId);\\n        if (remainingTabs.length > 0) {\\n          activeTab = remainingTabs[0].id;\\n        }\\n      }\\n    }\\n  }\\n<\/script>\\n\\n<div class=\\"helps-tabs\\" data-testid=\\"helps-tabs\\">\\n  <div class=\\"tabs-header\\" role=\\"tablist\\" aria-label=\\"Translation helps tabs\\">\\n    {#each allTabs as tab (tab.id)}\\n      {@const count = getResourceCount(tab.id)}\\n      {@const isActive = activeTab === tab.id}\\n      {@const tabIsLoading = isResourceLoading(tab.id)}\\n      \\n      <div class=\\"tab-container\\">\\n        <button\\n          role=\\"tab\\"\\n          aria-selected={isActive}\\n          aria-controls=\\"tabpanel-{tab.id}\\"\\n          id=\\"tab-{tab.id}\\"\\n          on:click={() => handleTabChange(tab.id)}\\n          data-testid=\\"tab-{tab.id}\\"\\n          class=\\"tab-button {isActive ? 'active' : ''} {tabIsLoading ? 'loading' : ''}\\"\\n          tabindex={isActive ? 0 : -1}\\n        >\\n          {#if tab.icon}\\n            <TabIcon type={tab.icon} />\\n          {/if}\\n          <span class=\\"desktop-label\\">{tab.label}</span>\\n          <span class=\\"mobile-label\\">{tab.mobileLabel || tab.label}</span>\\n          {#if count !== null}\\n            <span \\n              class=\\"count-badge {count === 0 ? 'zero' : ''} {count === 'loading' ? 'loading-badge' : ''}\\"\\n              aria-label={count === 'loading' ? 'Loading...' : \`\${count} items\`}\\n            >\\n              {#if count === 'loading'}\\n                <LoadingSpinner size=\\"small\\" variant=\\"white\\" />\\n              {:else}\\n                {count}\\n              {/if}\\n            </span>\\n          {/if}\\n        </button>\\n        {#if !tab.isStatic}\\n          <button\\n            on:click={(e) => handleCloseTab(tab.id, e)}\\n            class=\\"close-button\\"\\n            aria-label=\\"Close {tab.label} tab\\"\\n            tabindex={isActive ? 0 : -1}\\n          >\\n            ×\\n          </button>\\n        {/if}\\n      </div>\\n    {/each}\\n  </div>\\n  \\n  <div class=\\"main-tab-content\\">\\n    <!-- Always render all static panels but only show the active one -->\\n    \\n    <LoadingOverlay \\n      isVisible={activeTab === 'tn' && isResourceLoading('tn')}\\n      text=\\"Loading Notes...\\"\\n    >\\n      <div \\n        role=\\"tabpanel\\"\\n        id=\\"tabpanel-tn\\"\\n        aria-labelledby=\\"tab-tn\\"\\n        data-testid=\\"tab-content-tn\\"\\n        class=\\"tab-panel\\"\\n        style=\\"display: {activeTab === 'tn' ? 'block' : 'none'}\\"\\n        tabindex={activeTab === 'tn' ? 0 : -1}\\n      >\\n        <TranslationNotesPanel {reference} />\\n      </div>\\n    </LoadingOverlay>\\n    \\n    <LoadingOverlay \\n      isVisible={activeTab === 'tq' && isResourceLoading('tq')}\\n      text=\\"Loading Questions...\\"\\n    >\\n      <div \\n        role=\\"tabpanel\\"\\n        id=\\"tabpanel-tq\\"\\n        aria-labelledby=\\"tab-tq\\"\\n        data-testid=\\"tab-content-tq\\"\\n        class=\\"tab-panel\\"\\n        style=\\"display: {activeTab === 'tq' ? 'block' : 'none'}\\"\\n        tabindex={activeTab === 'tq' ? 0 : -1}\\n      >\\n        <TranslationQuestionsPanel {reference} />\\n      </div>\\n    </LoadingOverlay>\\n    \\n    <LoadingOverlay \\n      isVisible={activeTab === 'tw' && isResourceLoading('tw')}\\n      text=\\"Loading Words...\\"\\n    >\\n      <div \\n        role=\\"tabpanel\\"\\n        id=\\"tabpanel-tw\\"\\n        aria-labelledby=\\"tab-tw\\"\\n        data-testid=\\"tab-content-tw\\"\\n        class=\\"tab-panel\\"\\n        style=\\"display: {activeTab === 'tw' ? 'block' : 'none'}\\"\\n        tabindex={activeTab === 'tw' ? 0 : -1}\\n      >\\n        <TranslationWordsPanel {reference} />\\n      </div>\\n    </LoadingOverlay>\\n    \\n    <LoadingOverlay \\n      isVisible={activeTab === 'fia-images' && isResourceLoading('fia-images')}\\n      text=\\"Loading FIA Images...\\"\\n    >\\n      <div \\n        role=\\"tabpanel\\"\\n        id=\\"tabpanel-fia-images\\"\\n        aria-labelledby=\\"tab-fia-images\\"\\n        data-testid=\\"tab-content-fia-images\\"\\n        class=\\"tab-panel\\"\\n        style=\\"display: {activeTab === 'fia-images' ? 'block' : 'none'}\\"\\n        tabindex={activeTab === 'fia-images' ? 0 : -1}\\n      >\\n        <FiaImagesPanel {reference} />\\n      </div>\\n    </LoadingOverlay>\\n    \\n    <LoadingOverlay \\n      isVisible={activeTab === 'fia-maps' && isResourceLoading('fia-maps')}\\n      text=\\"Loading FIA Maps...\\"\\n    >\\n      <div \\n        role=\\"tabpanel\\"\\n        id=\\"tabpanel-fia-maps\\"\\n        aria-labelledby=\\"tab-fia-maps\\"\\n        data-testid=\\"tab-content-fia-maps\\"\\n        class=\\"tab-panel\\"\\n        style=\\"display: {activeTab === 'fia-maps' ? 'block' : 'none'}\\"\\n        tabindex={activeTab === 'fia-maps' ? 0 : -1}\\n      >\\n        <FiaMapsPanel {reference} />\\n      </div>\\n    </LoadingOverlay>\\n    \\n    <div \\n      role=\\"tabpanel\\"\\n      id=\\"tabpanel-chat\\"\\n      aria-labelledby=\\"tab-chat\\"\\n      data-testid=\\"tab-content-chat\\"\\n      class=\\"tab-panel\\"\\n      style=\\"display: {activeTab === 'chat' ? 'block' : 'none'}\\"\\n      tabindex={activeTab === 'chat' ? 0 : -1}\\n    >\\n      <LLMChatPanel {reference} />\\n    </div>\\n    \\n    <!-- Dynamic tabs (articles) - only render when active -->\\n    {#each dynamicTabs as tab (tab.id)}\\n      <div\\n        role=\\"tabpanel\\"\\n        id=\\"tabpanel-{tab.id}\\"\\n        aria-labelledby=\\"tab-{tab.id}\\"\\n        data-testid=\\"tab-content-{tab.id}\\"\\n        class=\\"tab-panel\\"\\n        style=\\"display: {activeTab === tab.id ? 'block' : 'none'}\\"\\n        tabindex={activeTab === tab.id ? 0 : -1}\\n      >\\n        <ArticlePanel {reference} article={tab.articleData} />\\n      </div>\\n    {/each}\\n  </div>\\n</div>\\n\\n<style>\\n  .helps-tabs {\\n    display: flex;\\n    flex-direction: column;\\n    height: 100%;\\n    background: var(--color-background);\\n    border-radius: 8px;\\n    overflow: hidden;\\n  }\\n\\n  .tabs-header {\\n    display: flex;\\n    background: var(--color-header);\\n    border-bottom: 1px solid var(--color-border);\\n    padding: 0 0.5rem;\\n    overflow-x: auto;\\n    scrollbar-width: thin;\\n  }\\n\\n  .tabs-header::-webkit-scrollbar {\\n    height: 4px;\\n  }\\n\\n  .tabs-header::-webkit-scrollbar-track {\\n    background: var(--color-background);\\n  }\\n\\n  .tabs-header::-webkit-scrollbar-thumb {\\n    background: var(--color-border);\\n    border-radius: 2px;\\n  }\\n\\n  .tab-container {\\n    display: flex;\\n    align-items: center;\\n    position: relative;\\n    flex-shrink: 0;\\n  }\\n\\n  .tab-button {\\n    display: flex;\\n    align-items: center;\\n    gap: 0.5rem;\\n    padding: 0.75rem 1rem;\\n    background: transparent;\\n    border: none;\\n    color: var(--color-text-secondary);\\n    cursor: pointer;\\n    font-size: 0.9rem;\\n    font-weight: 500;\\n    white-space: nowrap;\\n    transition: all 0.2s ease;\\n    border-bottom: 2px solid transparent;\\n    position: relative;\\n  }\\n\\n  .tab-button:hover {\\n    color: var(--color-text);\\n    background: var(--color-hover);\\n  }\\n\\n  .tab-button.active {\\n    color: var(--color-primary);\\n    border-bottom-color: var(--color-primary);\\n    background: var(--color-background);\\n  }\\n\\n  .tab-button.loading {\\n    opacity: 0.7;\\n  }\\n\\n  .desktop-label {\\n    display: block;\\n  }\\n\\n  .mobile-label {\\n    display: none;\\n  }\\n\\n  .count-badge {\\n    background: var(--color-primary);\\n    color: white;\\n    font-size: 0.75rem;\\n    font-weight: 600;\\n    padding: 0.15rem 0.4rem;\\n    border-radius: 10px;\\n    min-width: 18px;\\n    text-align: center;\\n    line-height: 1;\\n    display: flex;\\n    align-items: center;\\n    justify-content: center;\\n  }\\n\\n  .count-badge.zero {\\n    background: var(--color-text-secondary);\\n    opacity: 0.6;\\n  }\\n\\n  .count-badge.loading-badge {\\n    background: var(--color-secondary);\\n    padding: 0.2rem 0.4rem;\\n  }\\n\\n  .close-button {\\n    background: none;\\n    border: none;\\n    color: var(--color-text-secondary);\\n    cursor: pointer;\\n    font-size: 1.2rem;\\n    font-weight: bold;\\n    padding: 0.25rem;\\n    margin-left: 0.25rem;\\n    border-radius: 3px;\\n    transition: all 0.2s ease;\\n    line-height: 1;\\n  }\\n\\n  .close-button:hover {\\n    color: var(--color-error);\\n    background: var(--color-error-alpha);\\n  }\\n\\n  .main-tab-content {\\n    flex: 1;\\n    overflow: hidden;\\n    position: relative;\\n  }\\n\\n  .tab-panel {\\n    height: 100%;\\n    overflow: hidden;\\n  }\\n\\n  /* Responsive design */\\n  @media (max-width: 768px) {\\n    .desktop-label {\\n      display: none;\\n    }\\n\\n    .mobile-label {\\n      display: block;\\n    }\\n\\n    .tab-button {\\n      padding: 0.5rem 0.75rem;\\n      font-size: 0.8rem;\\n    }\\n\\n    .tabs-header {\\n      padding: 0 0.25rem;\\n    }\\n  }\\n\\n  /* Focus styles for accessibility */\\n  .tab-button:focus {\\n    outline: 2px solid var(--color-primary);\\n    outline-offset: -2px;\\n  }\\n\\n  .close-button:focus {\\n    outline: 2px solid var(--color-error);\\n    outline-offset: -2px;\\n  }\\n</style>"],"names":[],"mappings":"AA2VE,yBAAY,CACV,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,IAAI,kBAAkB,CAAC,CACnC,aAAa,CAAE,GAAG,CAClB,QAAQ,CAAE,MACZ,CAEA,0BAAa,CACX,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,IAAI,cAAc,CAAC,CAC/B,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CAC5C,OAAO,CAAE,CAAC,CAAC,MAAM,CACjB,UAAU,CAAE,IAAI,CAChB,eAAe,CAAE,IACnB,CAEA,0BAAY,mBAAoB,CAC9B,MAAM,CAAE,GACV,CAEA,0BAAY,yBAA0B,CACpC,UAAU,CAAE,IAAI,kBAAkB,CACpC,CAEA,0BAAY,yBAA0B,CACpC,UAAU,CAAE,IAAI,cAAc,CAAC,CAC/B,aAAa,CAAE,GACjB,CAEA,4BAAe,CACb,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,QAAQ,CAAE,QAAQ,CAClB,WAAW,CAAE,CACf,CAEA,yBAAY,CACV,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,MAAM,CACX,OAAO,CAAE,OAAO,CAAC,IAAI,CACrB,UAAU,CAAE,WAAW,CACvB,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,MAAM,CAAE,OAAO,CACf,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GAAG,CAChB,WAAW,CAAE,MAAM,CACnB,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CACzB,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CACpC,QAAQ,CAAE,QACZ,CAEA,yBAAW,MAAO,CAChB,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,UAAU,CAAE,IAAI,aAAa,CAC/B,CAEA,WAAW,qBAAQ,CACjB,KAAK,CAAE,IAAI,eAAe,CAAC,CAC3B,mBAAmB,CAAE,IAAI,eAAe,CAAC,CACzC,UAAU,CAAE,IAAI,kBAAkB,CACpC,CAEA,WAAW,sBAAS,CAClB,OAAO,CAAE,GACX,CAEA,4BAAe,CACb,OAAO,CAAE,KACX,CAEA,2BAAc,CACZ,OAAO,CAAE,IACX,CAEA,0BAAa,CACX,UAAU,CAAE,IAAI,eAAe,CAAC,CAChC,KAAK,CAAE,KAAK,CACZ,SAAS,CAAE,OAAO,CAClB,WAAW,CAAE,GAAG,CAChB,OAAO,CAAE,OAAO,CAAC,MAAM,CACvB,aAAa,CAAE,IAAI,CACnB,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,MAAM,CAClB,WAAW,CAAE,CAAC,CACd,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MACnB,CAEA,YAAY,mBAAM,CAChB,UAAU,CAAE,IAAI,sBAAsB,CAAC,CACvC,OAAO,CAAE,GACX,CAEA,YAAY,4BAAe,CACzB,UAAU,CAAE,IAAI,iBAAiB,CAAC,CAClC,OAAO,CAAE,MAAM,CAAC,MAClB,CAEA,2BAAc,CACZ,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,MAAM,CAAE,OAAO,CACf,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,IAAI,CACjB,OAAO,CAAE,OAAO,CAChB,WAAW,CAAE,OAAO,CACpB,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CACzB,WAAW,CAAE,CACf,CAEA,2BAAa,MAAO,CAClB,KAAK,CAAE,IAAI,aAAa,CAAC,CACzB,UAAU,CAAE,IAAI,mBAAmB,CACrC,CAEA,+BAAkB,CAChB,IAAI,CAAE,CAAC,CACP,QAAQ,CAAE,MAAM,CAChB,QAAQ,CAAE,QACZ,CAEA,wBAAW,CACT,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,MACZ,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,4BAAe,CACb,OAAO,CAAE,IACX,CAEA,2BAAc,CACZ,OAAO,CAAE,KACX,CAEA,yBAAY,CACV,OAAO,CAAE,MAAM,CAAC,OAAO,CACvB,SAAS,CAAE,MACb,CAEA,0BAAa,CACX,OAAO,CAAE,CAAC,CAAC,OACb,CACF,CAGA,yBAAW,MAAO,CAChB,OAAO,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,eAAe,CAAC,CACvC,cAAc,CAAE,IAClB,CAEA,2BAAa,MAAO,CAClB,OAAO,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,aAAa,CAAC,CACrC,cAAc,CAAE,IAClB"}`
};
const HelpsTabs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let allTabs;
  let { reference: reference2 } = $$props;
  let activeTab = "tn";
  let dynamicTabs = [];
  let resources2 = {};
  let loadingResources2 = /* @__PURE__ */ new Set();
  const STATIC_TABS = [
    {
      id: "tn",
      label: "Notes",
      mobileLabel: "Notes",
      icon: "notes",
      component: TranslationNotesPanel,
      isStatic: true
    },
    {
      id: "tq",
      label: "Questions",
      mobileLabel: "Q&A",
      icon: "questions",
      component: TranslationQuestionsPanel,
      isStatic: true
    },
    {
      id: "tw",
      label: "Words",
      mobileLabel: "Words",
      icon: "words",
      component: TranslationWordsPanel,
      isStatic: true
    },
    {
      id: "fia-images",
      label: "Images",
      mobileLabel: "Pics",
      icon: "images",
      component: FiaImagesPanel,
      isStatic: true
    },
    {
      id: "fia-maps",
      label: "Maps",
      mobileLabel: "Maps",
      icon: "maps",
      component: FiaMapsPanel,
      isStatic: true
    },
    {
      id: "chat",
      label: "AI Assistant",
      mobileLabel: "AI",
      icon: "chat",
      component: LLMChatPanel,
      isStatic: true
    }
  ];
  resourcesStore.subscribe((store) => {
    resources2 = store;
  });
  resourcesStore.loadingResources.subscribe((loading) => {
    loadingResources2 = loading;
  });
  function isResourceLoading(tabId) {
    const resourceMap = {
      "tn": "notes",
      "tq": "questions",
      "tw": "words",
      "fia-images": "fia",
      "fia-maps": "fia"
    };
    const resourceType = resourceMap[tabId];
    return resourceType && loadingResources2.has(resourceType);
  }
  function getResourceCount(tabId) {
    if (isResourceLoading(tabId)) {
      return "loading";
    }
    switch (tabId) {
      case "tn":
        return Array.isArray(resources2.notes) ? resources2.notes.length : 0;
      case "tq":
        return Array.isArray(resources2.questions) ? resources2.questions.length : 0;
      case "tw":
        const wordsCount = Array.isArray(resources2.words) ? resources2.words.length : 0;
        const linksCount = Array.isArray(resources2.links) ? resources2.links.length : 0;
        return Math.max(wordsCount, linksCount);
      case "fia-images":
        if (resources2.fia?.hasContent) {
          return Array.isArray(
            resources2.fia.images
          ) ? resources2.fia.images.length : 0;
        }
        return 0;
      case "fia-maps":
        if (resources2.fia?.hasContent) {
          return Array.isArray(resources2.fia.maps) ? resources2.fia.maps.length : 0;
        }
        return 0;
      case "chat":
        const totalItems = (Array.isArray(resources2.notes) ? resources2.notes.length : 0) + (Array.isArray(resources2.questions) ? resources2.questions.length : 0) + (Array.isArray(resources2.words) ? resources2.words.length : 0) + (resources2.fia?.hasContent ? (Array.isArray(resources2.fia.images) ? resources2.fia.images.length : 0) + (Array.isArray(resources2.fia.maps) ? resources2.fia.maps.length : 0) : 0);
        return totalItems > 0 ? totalItems : null;
      default:
        return null;
    }
  }
  function switchToTab(tabId) {
    if (allTabs.find((tab) => tab.id === tabId)) {
      activeTab = tabId;
    }
  }
  function getActiveTab() {
    return activeTab;
  }
  function openArticleTab(article) {
    const existingTab = dynamicTabs.find((tab) => tab.articleData?.rcUri === article.rcUri);
    if (existingTab) {
      activeTab = existingTab.id;
      return;
    }
    const tabId = article.id || article.rcUri.replace(/[^a-zA-Z0-9]/g, "_");
    const newTab = {
      id: tabId,
      label: article.title || "Article",
      component: ArticlePanel,
      isStatic: false,
      articleData: article
    };
    dynamicTabs = [...dynamicTabs, newTab];
    activeTab = tabId;
  }
  function closeTab(tabId) {
    const tabToClose = dynamicTabs.find((tab) => tab.id === tabId);
    if (tabToClose) {
      dynamicTabs = dynamicTabs.filter((tab) => tab.id !== tabId);
      if (activeTab === tabId) {
        const remainingTabs = allTabs.filter((tab) => tab.id !== tabId);
        if (remainingTabs.length > 0) {
          activeTab = remainingTabs[0].id;
        }
      }
    }
  }
  if ($$props.reference === void 0 && $$bindings.reference && reference2 !== void 0) $$bindings.reference(reference2);
  if ($$props.switchToTab === void 0 && $$bindings.switchToTab && switchToTab !== void 0) $$bindings.switchToTab(switchToTab);
  if ($$props.getActiveTab === void 0 && $$bindings.getActiveTab && getActiveTab !== void 0) $$bindings.getActiveTab(getActiveTab);
  if ($$props.openArticleTab === void 0 && $$bindings.openArticleTab && openArticleTab !== void 0) $$bindings.openArticleTab(openArticleTab);
  if ($$props.closeTab === void 0 && $$bindings.closeTab && closeTab !== void 0) $$bindings.closeTab(closeTab);
  $$result.css.add(css$2);
  allTabs = [...STATIC_TABS, ...dynamicTabs];
  return `<div class="helps-tabs svelte-nisrcy" data-testid="helps-tabs"><div class="tabs-header svelte-nisrcy" role="tablist" aria-label="Translation helps tabs">${each(allTabs, (tab) => {
    let count = getResourceCount(tab.id), isActive = activeTab === tab.id, tabIsLoading = isResourceLoading(tab.id);
    return `   <div class="tab-container svelte-nisrcy"><button role="tab"${add_attribute("aria-selected", isActive, 0)} aria-controls="${"tabpanel-" + escape(tab.id, true)}" id="${"tab-" + escape(tab.id, true)}" data-testid="${"tab-" + escape(tab.id, true)}" class="${"tab-button " + escape(isActive ? "active" : "", true) + " " + escape(tabIsLoading ? "loading" : "", true) + " svelte-nisrcy"}"${add_attribute("tabindex", isActive ? 0 : -1, 0)}>${tab.icon ? `${validate_component(TabIcon, "TabIcon").$$render($$result, { type: tab.icon }, {}, {})}` : ``} <span class="desktop-label svelte-nisrcy">${escape(tab.label)}</span> <span class="mobile-label svelte-nisrcy">${escape(tab.mobileLabel || tab.label)}</span> ${count !== null ? `<span class="${"count-badge " + escape(count === 0 ? "zero" : "", true) + " " + escape(count === "loading" ? "loading-badge" : "", true) + " svelte-nisrcy"}"${add_attribute("aria-label", count === "loading" ? "Loading..." : `${count} items`, 0)}>${count === "loading" ? `${validate_component(LoadingSpinner, "LoadingSpinner").$$render($$result, { size: "small", variant: "white" }, {}, {})}` : `${escape(count)}`} </span>` : ``}</button> ${!tab.isStatic ? `<button class="close-button svelte-nisrcy" aria-label="${"Close " + escape(tab.label, true) + " tab"}"${add_attribute("tabindex", isActive ? 0 : -1, 0)}>×
          </button>` : ``} </div>`;
  })}</div> <div class="main-tab-content svelte-nisrcy"> ${validate_component(LoadingOverlay, "LoadingOverlay").$$render(
    $$result,
    {
      isVisible: activeTab === "tn" && isResourceLoading("tn"),
      text: "Loading Notes..."
    },
    {},
    {
      default: () => {
        return `<div role="tabpanel" id="tabpanel-tn" aria-labelledby="tab-tn" data-testid="tab-content-tn" class="tab-panel svelte-nisrcy" style="${"display: " + escape(activeTab === "tn" ? "block" : "none", true)}"${add_attribute("tabindex", activeTab === "tn" ? 0 : -1, 0)}>${validate_component(TranslationNotesPanel, "TranslationNotesPanel").$$render($$result, { reference: reference2 }, {}, {})}</div>`;
      }
    }
  )} ${validate_component(LoadingOverlay, "LoadingOverlay").$$render(
    $$result,
    {
      isVisible: activeTab === "tq" && isResourceLoading("tq"),
      text: "Loading Questions..."
    },
    {},
    {
      default: () => {
        return `<div role="tabpanel" id="tabpanel-tq" aria-labelledby="tab-tq" data-testid="tab-content-tq" class="tab-panel svelte-nisrcy" style="${"display: " + escape(activeTab === "tq" ? "block" : "none", true)}"${add_attribute("tabindex", activeTab === "tq" ? 0 : -1, 0)}>${validate_component(TranslationQuestionsPanel, "TranslationQuestionsPanel").$$render($$result, { reference: reference2 }, {}, {})}</div>`;
      }
    }
  )} ${validate_component(LoadingOverlay, "LoadingOverlay").$$render(
    $$result,
    {
      isVisible: activeTab === "tw" && isResourceLoading("tw"),
      text: "Loading Words..."
    },
    {},
    {
      default: () => {
        return `<div role="tabpanel" id="tabpanel-tw" aria-labelledby="tab-tw" data-testid="tab-content-tw" class="tab-panel svelte-nisrcy" style="${"display: " + escape(activeTab === "tw" ? "block" : "none", true)}"${add_attribute("tabindex", activeTab === "tw" ? 0 : -1, 0)}>${validate_component(TranslationWordsPanel, "TranslationWordsPanel").$$render($$result, { reference: reference2 }, {}, {})}</div>`;
      }
    }
  )} ${validate_component(LoadingOverlay, "LoadingOverlay").$$render(
    $$result,
    {
      isVisible: activeTab === "fia-images" && isResourceLoading("fia-images"),
      text: "Loading FIA Images..."
    },
    {},
    {
      default: () => {
        return `<div role="tabpanel" id="tabpanel-fia-images" aria-labelledby="tab-fia-images" data-testid="tab-content-fia-images" class="tab-panel svelte-nisrcy" style="${"display: " + escape(activeTab === "fia-images" ? "block" : "none", true)}"${add_attribute("tabindex", activeTab === "fia-images" ? 0 : -1, 0)}>${validate_component(FiaImagesPanel, "FiaImagesPanel").$$render($$result, { reference: reference2 }, {}, {})}</div>`;
      }
    }
  )} ${validate_component(LoadingOverlay, "LoadingOverlay").$$render(
    $$result,
    {
      isVisible: activeTab === "fia-maps" && isResourceLoading("fia-maps"),
      text: "Loading FIA Maps..."
    },
    {},
    {
      default: () => {
        return `<div role="tabpanel" id="tabpanel-fia-maps" aria-labelledby="tab-fia-maps" data-testid="tab-content-fia-maps" class="tab-panel svelte-nisrcy" style="${"display: " + escape(activeTab === "fia-maps" ? "block" : "none", true)}"${add_attribute("tabindex", activeTab === "fia-maps" ? 0 : -1, 0)}>${validate_component(FiaMapsPanel, "FiaMapsPanel").$$render($$result, { reference: reference2 }, {}, {})}</div>`;
      }
    }
  )} <div role="tabpanel" id="tabpanel-chat" aria-labelledby="tab-chat" data-testid="tab-content-chat" class="tab-panel svelte-nisrcy" style="${"display: " + escape(activeTab === "chat" ? "block" : "none", true)}"${add_attribute("tabindex", activeTab === "chat" ? 0 : -1, 0)}>${validate_component(LLMChatPanel, "LLMChatPanel").$$render($$result, { reference: reference2 }, {}, {})}</div>  ${each(dynamicTabs, (tab) => {
    return `<div role="tabpanel" id="${"tabpanel-" + escape(tab.id, true)}" aria-labelledby="${"tab-" + escape(tab.id, true)}" data-testid="${"tab-content-" + escape(tab.id, true)}" class="tab-panel svelte-nisrcy" style="${"display: " + escape(activeTab === tab.id ? "block" : "none", true)}"${add_attribute("tabindex", activeTab === tab.id ? 0 : -1, 0)}>${validate_component(ArticlePanel, "ArticlePanel").$$render($$result, { reference: reference2, article: tab.articleData }, {}, {})} </div>`;
  })}</div> </div>`;
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
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\n  import MainView from '$lib/components/MainView.svelte';\\n<\/script>\\n\\n<MainView />\\n\\n<style>\\n  /* Page-specific styles if needed */\\n  :global(body) {\\n    margin: 0;\\n    padding: 0;\\n    overflow: hidden;\\n  }\\n</style>"],"names":[],"mappings":"AAQU,IAAM,CACZ,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,MACZ"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `${validate_component(MainView, "MainView").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
