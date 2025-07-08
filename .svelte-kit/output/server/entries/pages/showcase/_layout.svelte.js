import { c as create_ssr_component, b as each, d as add_attribute, e as escape, a as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { p as page } from "../../../chunks/stores.js";
import { g as goto } from "../../../chunks/client.js";
/* empty css                                                            */
const css$1 = {
  code: ".nav-container.svelte-z0s7d8{display:flex;flex-direction:column;height:100%;padding:1rem;background:var(--color-panel);border-right:1px solid var(--color-border)}.nav-header.svelte-z0s7d8{margin-bottom:2rem;padding-bottom:1rem;border-bottom:1px solid var(--color-border)}.nav-title.svelte-z0s7d8{font-size:1.2rem;font-weight:bold;margin:0 0 0.5rem 0;color:var(--color-primary)}.nav-subtitle.svelte-z0s7d8{font-size:0.9rem;color:var(--color-text-secondary);margin:0}.nav-items.svelte-z0s7d8{flex:1;overflow-y:auto}.nav-section.svelte-z0s7d8{margin-bottom:0.5rem}.nav-button.svelte-z0s7d8{width:100%;padding:0.8rem;background:transparent;border:none;border-radius:6px;cursor:pointer;text-align:left;display:flex;align-items:center;justify-content:space-between;transition:all 0.2s ease;color:var(--color-text);font-size:0.9rem}.nav-button.svelte-z0s7d8:hover{background:var(--color-hover)}.nav-button.active.svelte-z0s7d8{background:var(--color-primary-alpha);color:var(--color-primary);font-weight:600}.nav-button-title.svelte-z0s7d8{flex:1}.nav-button-arrow.svelte-z0s7d8{font-size:0.8rem;color:var(--color-text-secondary)}.nav-subsections.svelte-z0s7d8{margin-left:1rem;margin-top:0.5rem;padding-left:0.5rem;border-left:2px solid var(--color-border)}.nav-sub-button.svelte-z0s7d8{width:100%;padding:0.5rem 0.8rem;background:transparent;border:none;border-radius:4px;cursor:pointer;text-align:left;font-size:0.85rem;color:var(--color-text-secondary);transition:all 0.2s ease;margin-bottom:0.25rem}.nav-sub-button.svelte-z0s7d8:hover{background:var(--color-hover);color:var(--color-text)}.nav-sub-button.active-subsection.svelte-z0s7d8{background:var(--color-primary-alpha);color:var(--color-primary);font-weight:500}.nav-footer.svelte-z0s7d8{margin-top:2rem;padding-top:1rem;border-top:1px solid var(--color-border)}.nav-footer-text.svelte-z0s7d8{font-size:0.8rem;color:var(--color-text-secondary);margin:0 0 0.5rem 0}.nav-footer-links.svelte-z0s7d8{display:flex;gap:1rem}.nav-footer-link.svelte-z0s7d8{font-size:0.8rem;color:var(--color-primary);text-decoration:none;transition:color 0.2s ease}.nav-footer-link.svelte-z0s7d8:hover{color:var(--color-primary-hover);text-decoration:underline}",
  map: `{"version":3,"file":"ShowcaseNav.svelte","sources":["ShowcaseNav.svelte"],"sourcesContent":["<script>\\n  export let selectedSection;\\n  export let onSectionSelect;\\n\\n  const showcaseSections = [\\n    {\\n      id: 'overview',\\n      title: '🏠 Overview',\\n      description: 'Project introduction and showcase purpose'\\n    },\\n    {\\n      id: 'architecture',\\n      title: '🏗️ Architecture Gallery',\\n      description: 'Design patterns and system architecture',\\n      subsections: [\\n        { id: 'simple-pattern', title: 'Simple Verse-Loading Pattern' },\\n        { id: 'self-activating', title: 'Self-Activating Panels' },\\n        { id: 'url-driven', title: 'URL-Driven State' },\\n        { id: 'cross-org', title: 'Cross-Organization Support' }\\n      ]\\n    },\\n    {\\n      id: 'components',\\n      title: '🎨 Component Showcase',\\n      description: 'Interactive UI components and examples',\\n      subsections: [\\n        { id: 'navigation-wizard', title: 'Navigation Wizard' },\\n        { id: 'scripture-panel', title: 'Scripture Panel' },\\n        { id: 'translation-helps', title: 'Translation Helps' },\\n        { id: 'theme-system', title: 'Theme System' }\\n      ]\\n    },\\n    {\\n      id: 'performance',\\n      title: '⚡ Performance Victories',\\n      description: 'Optimization achievements and metrics',\\n      subsections: [\\n        { id: 'api-optimization', title: '90% API Optimization' },\\n        { id: 'loading-states', title: 'Loading States' },\\n        { id: 'error-handling', title: 'Error Handling' }\\n      ]\\n    },\\n    {\\n      id: 'innovation',\\n      title: '💡 Innovation Highlights',\\n      description: 'Cutting-edge features and capabilities',\\n      subsections: [\\n        { id: 'twl-integration', title: 'TWL Integration' },\\n        { id: 'fia-resources', title: 'FIA Resources' },\\n        { id: 'llm-chat', title: 'LLM Chat' },\\n        { id: 'rc-links', title: 'RC Links' }\\n      ]\\n    },\\n    {\\n      id: 'interactive',\\n      title: '🎮 Interactive Experiences',\\n      description: 'Hands-on demos and playgrounds',\\n      subsections: [\\n        { id: 'live-playground', title: 'Live Playground' },\\n        { id: 'pattern-explorer', title: 'Pattern Explorer' },\\n        { id: 'api-explorer', title: 'API Explorer' }\\n      ]\\n    },\\n    {\\n      id: 'metrics',\\n      title: '📊 Metrics & Achievements',\\n      description: 'Project statistics and impact',\\n      subsections: [\\n        { id: 'project-stats', title: 'Project Statistics' },\\n        { id: 'evolution-timeline', title: 'Architecture Evolution' },\\n        { id: 'community-impact', title: 'Community Impact' }\\n      ]\\n    }\\n  ];\\n\\n  function handleSectionClick(sectionId) {\\n    onSectionSelect(sectionId);\\n  }\\n\\n  function isActive(sectionId) {\\n    return selectedSection === sectionId || selectedSection?.startsWith(sectionId);\\n  }\\n<\/script>\\n\\n<nav class=\\"nav-container\\">\\n  <!-- Header -->\\n  <div class=\\"nav-header\\">\\n    <h2 class=\\"nav-title\\">\\n      🚀 Translation Helps Showcase\\n    </h2>\\n    <p class=\\"nav-subtitle\\">\\n      Explore our achievements and get inspired!\\n    </p>\\n  </div>\\n\\n  <!-- Navigation Items -->\\n  <div class=\\"nav-items\\">\\n    {#each showcaseSections as section}\\n      <div class=\\"nav-section\\">\\n        <button\\n          class=\\"nav-button {isActive(section.id) ? 'active' : ''}\\"\\n          on:click={() => handleSectionClick(section.id)}\\n          title={section.description}\\n        >\\n          <span class=\\"nav-button-title\\">{section.title}</span>\\n          {#if section.subsections}\\n            <span class=\\"nav-button-arrow\\">\\n              {isActive(section.id) ? '▼' : '▶'}\\n            </span>\\n          {/if}\\n        </button>\\n\\n        <!-- Subsections -->\\n        {#if section.subsections && isActive(section.id)}\\n          <div class=\\"nav-subsections\\">\\n            {#each section.subsections as subsection}\\n              <button\\n                class=\\"nav-sub-button {selectedSection === \`\${section.id}/\${subsection.id}\` ? 'active-subsection' : ''}\\"\\n                on:click={() => handleSectionClick(\`\${section.id}/\${subsection.id}\`)}\\n              >\\n                {subsection.title}\\n              </button>\\n            {/each}\\n          </div>\\n        {/if}\\n      </div>\\n    {/each}\\n  </div>\\n\\n  <!-- Footer -->\\n  <div class=\\"nav-footer\\">\\n    <p class=\\"nav-footer-text\\">\\n      Built with the Translation Helps architecture\\n    </p>\\n    <div class=\\"nav-footer-links\\">\\n      <a href=\\"/\\" class=\\"nav-footer-link\\">← Back to App</a>\\n      <a href=\\"https://github.com/klappy/translation-helps\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\" class=\\"nav-footer-link\\">\\n        GitHub →\\n      </a>\\n    </div>\\n  </div>\\n</nav>\\n\\n<style>\\n  .nav-container {\\n    display: flex;\\n    flex-direction: column;\\n    height: 100%;\\n    padding: 1rem;\\n    background: var(--color-panel);\\n    border-right: 1px solid var(--color-border);\\n  }\\n\\n  .nav-header {\\n    margin-bottom: 2rem;\\n    padding-bottom: 1rem;\\n    border-bottom: 1px solid var(--color-border);\\n  }\\n\\n  .nav-title {\\n    font-size: 1.2rem;\\n    font-weight: bold;\\n    margin: 0 0 0.5rem 0;\\n    color: var(--color-primary);\\n  }\\n\\n  .nav-subtitle {\\n    font-size: 0.9rem;\\n    color: var(--color-text-secondary);\\n    margin: 0;\\n  }\\n\\n  .nav-items {\\n    flex: 1;\\n    overflow-y: auto;\\n  }\\n\\n  .nav-section {\\n    margin-bottom: 0.5rem;\\n  }\\n\\n  .nav-button {\\n    width: 100%;\\n    padding: 0.8rem;\\n    background: transparent;\\n    border: none;\\n    border-radius: 6px;\\n    cursor: pointer;\\n    text-align: left;\\n    display: flex;\\n    align-items: center;\\n    justify-content: space-between;\\n    transition: all 0.2s ease;\\n    color: var(--color-text);\\n    font-size: 0.9rem;\\n  }\\n\\n  .nav-button:hover {\\n    background: var(--color-hover);\\n  }\\n\\n  .nav-button.active {\\n    background: var(--color-primary-alpha);\\n    color: var(--color-primary);\\n    font-weight: 600;\\n  }\\n\\n  .nav-button-title {\\n    flex: 1;\\n  }\\n\\n  .nav-button-arrow {\\n    font-size: 0.8rem;\\n    color: var(--color-text-secondary);\\n  }\\n\\n  .nav-subsections {\\n    margin-left: 1rem;\\n    margin-top: 0.5rem;\\n    padding-left: 0.5rem;\\n    border-left: 2px solid var(--color-border);\\n  }\\n\\n  .nav-sub-button {\\n    width: 100%;\\n    padding: 0.5rem 0.8rem;\\n    background: transparent;\\n    border: none;\\n    border-radius: 4px;\\n    cursor: pointer;\\n    text-align: left;\\n    font-size: 0.85rem;\\n    color: var(--color-text-secondary);\\n    transition: all 0.2s ease;\\n    margin-bottom: 0.25rem;\\n  }\\n\\n  .nav-sub-button:hover {\\n    background: var(--color-hover);\\n    color: var(--color-text);\\n  }\\n\\n  .nav-sub-button.active-subsection {\\n    background: var(--color-primary-alpha);\\n    color: var(--color-primary);\\n    font-weight: 500;\\n  }\\n\\n  .nav-footer {\\n    margin-top: 2rem;\\n    padding-top: 1rem;\\n    border-top: 1px solid var(--color-border);\\n  }\\n\\n  .nav-footer-text {\\n    font-size: 0.8rem;\\n    color: var(--color-text-secondary);\\n    margin: 0 0 0.5rem 0;\\n  }\\n\\n  .nav-footer-links {\\n    display: flex;\\n    gap: 1rem;\\n  }\\n\\n  .nav-footer-link {\\n    font-size: 0.8rem;\\n    color: var(--color-primary);\\n    text-decoration: none;\\n    transition: color 0.2s ease;\\n  }\\n\\n  .nav-footer-link:hover {\\n    color: var(--color-primary-hover);\\n    text-decoration: underline;\\n  }\\n</style>"],"names":[],"mappings":"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"}`
};
const ShowcaseNav = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { selectedSection } = $$props;
  let { onSectionSelect } = $$props;
  const showcaseSections = [
    {
      id: "overview",
      title: "🏠 Overview",
      description: "Project introduction and showcase purpose"
    },
    {
      id: "architecture",
      title: "🏗️ Architecture Gallery",
      description: "Design patterns and system architecture",
      subsections: [
        {
          id: "simple-pattern",
          title: "Simple Verse-Loading Pattern"
        },
        {
          id: "self-activating",
          title: "Self-Activating Panels"
        },
        {
          id: "url-driven",
          title: "URL-Driven State"
        },
        {
          id: "cross-org",
          title: "Cross-Organization Support"
        }
      ]
    },
    {
      id: "components",
      title: "🎨 Component Showcase",
      description: "Interactive UI components and examples",
      subsections: [
        {
          id: "navigation-wizard",
          title: "Navigation Wizard"
        },
        {
          id: "scripture-panel",
          title: "Scripture Panel"
        },
        {
          id: "translation-helps",
          title: "Translation Helps"
        },
        {
          id: "theme-system",
          title: "Theme System"
        }
      ]
    },
    {
      id: "performance",
      title: "⚡ Performance Victories",
      description: "Optimization achievements and metrics",
      subsections: [
        {
          id: "api-optimization",
          title: "90% API Optimization"
        },
        {
          id: "loading-states",
          title: "Loading States"
        },
        {
          id: "error-handling",
          title: "Error Handling"
        }
      ]
    },
    {
      id: "innovation",
      title: "💡 Innovation Highlights",
      description: "Cutting-edge features and capabilities",
      subsections: [
        {
          id: "twl-integration",
          title: "TWL Integration"
        },
        {
          id: "fia-resources",
          title: "FIA Resources"
        },
        { id: "llm-chat", title: "LLM Chat" },
        { id: "rc-links", title: "RC Links" }
      ]
    },
    {
      id: "interactive",
      title: "🎮 Interactive Experiences",
      description: "Hands-on demos and playgrounds",
      subsections: [
        {
          id: "live-playground",
          title: "Live Playground"
        },
        {
          id: "pattern-explorer",
          title: "Pattern Explorer"
        },
        {
          id: "api-explorer",
          title: "API Explorer"
        }
      ]
    },
    {
      id: "metrics",
      title: "📊 Metrics & Achievements",
      description: "Project statistics and impact",
      subsections: [
        {
          id: "project-stats",
          title: "Project Statistics"
        },
        {
          id: "evolution-timeline",
          title: "Architecture Evolution"
        },
        {
          id: "community-impact",
          title: "Community Impact"
        }
      ]
    }
  ];
  function isActive(sectionId) {
    return selectedSection === sectionId || selectedSection?.startsWith(sectionId);
  }
  if ($$props.selectedSection === void 0 && $$bindings.selectedSection && selectedSection !== void 0) $$bindings.selectedSection(selectedSection);
  if ($$props.onSectionSelect === void 0 && $$bindings.onSectionSelect && onSectionSelect !== void 0) $$bindings.onSectionSelect(onSectionSelect);
  $$result.css.add(css$1);
  return `<nav class="nav-container svelte-z0s7d8"> <div class="nav-header svelte-z0s7d8" data-svelte-h="svelte-2x4508"><h2 class="nav-title svelte-z0s7d8">🚀 Translation Helps Showcase</h2> <p class="nav-subtitle svelte-z0s7d8">Explore our achievements and get inspired!</p></div>  <div class="nav-items svelte-z0s7d8">${each(showcaseSections, (section) => {
    return `<div class="nav-section svelte-z0s7d8"><button class="${"nav-button " + escape(isActive(section.id) ? "active" : "", true) + " svelte-z0s7d8"}"${add_attribute("title", section.description, 0)}><span class="nav-button-title svelte-z0s7d8">${escape(section.title)}</span> ${section.subsections ? `<span class="nav-button-arrow svelte-z0s7d8">${escape(isActive(section.id) ? "▼" : "▶")} </span>` : ``}</button>  ${section.subsections && isActive(section.id) ? `<div class="nav-subsections svelte-z0s7d8">${each(section.subsections, (subsection) => {
      return `<button class="${"nav-sub-button " + escape(
        selectedSection === `${section.id}/${subsection.id}` ? "active-subsection" : "",
        true
      ) + " svelte-z0s7d8"}">${escape(subsection.title)} </button>`;
    })} </div>` : ``} </div>`;
  })}</div>  <div class="nav-footer svelte-z0s7d8" data-svelte-h="svelte-1iqsrbp"><p class="nav-footer-text svelte-z0s7d8">Built with the Translation Helps architecture</p> <div class="nav-footer-links svelte-z0s7d8"><a href="/" class="nav-footer-link svelte-z0s7d8">← Back to App</a> <a href="https://github.com/klappy/translation-helps" target="_blank" rel="noopener noreferrer" class="nav-footer-link svelte-z0s7d8">GitHub →</a></div></div> </nav>`;
});
const css = {
  code: ".showcase-container.svelte-1nfn3y5{display:flex;min-height:100vh;background:var(--color-background);color:var(--color-text)}.mobile-nav-toggle.svelte-1nfn3y5{display:none;position:fixed;top:1rem;left:1rem;z-index:1001;background:var(--color-primary);color:white;border:none;border-radius:4px;padding:0.5rem;cursor:pointer;font-size:1.2rem}.sidebar.svelte-1nfn3y5{width:300px;background:var(--color-panel);border-right:1px solid var(--color-border);overflow-y:auto;position:fixed;top:0;left:0;height:100vh;transform:translateX(-100%);transition:transform 0.3s ease;z-index:1000}.sidebar-open.svelte-1nfn3y5{transform:translateX(0)}.main-content.svelte-1nfn3y5{flex:1;padding:2rem;overflow-y:auto;margin-left:300px}.mobile-overlay.svelte-1nfn3y5{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0, 0, 0, 0.5);z-index:999}@media(min-width: 768px){.sidebar.svelte-1nfn3y5{position:relative;transform:translateX(0)}.main-content.svelte-1nfn3y5{margin-left:0}}@media(max-width: 767px){.mobile-nav-toggle.svelte-1nfn3y5{display:block}.main-content.svelte-1nfn3y5{margin-left:0;padding:1rem}}",
  map: `{"version":3,"file":"+layout.svelte","sources":["+layout.svelte"],"sourcesContent":["<script>\\n  import { page } from '$app/stores';\\n  import { goto } from '$app/navigation';\\n  import ShowcaseNav from '$lib/components/showcase/ShowcaseNav.svelte';\\n  import ShowcaseContent from '$lib/components/showcase/ShowcaseContent.svelte';\\n  \\n  let mobileNavOpen = false;\\n  \\n  $: selectedSection = $page.params.section || 'overview';\\n  \\n  function handleSectionSelect(section) {\\n    goto(\`/showcase/\${section}\`);\\n    mobileNavOpen = false; // Close mobile nav after selection\\n  }\\n  \\n  function toggleMobileNav() {\\n    mobileNavOpen = !mobileNavOpen;\\n  }\\n<\/script>\\n\\n<div class=\\"showcase-container\\">\\n  <!-- Mobile nav toggle -->\\n  <button \\n    class=\\"mobile-nav-toggle\\"\\n    on:click={toggleMobileNav}\\n    aria-label=\\"Toggle navigation\\"\\n  >\\n    ☰\\n  </button>\\n\\n  <!-- Sidebar Navigation -->\\n  <aside class=\\"sidebar {mobileNavOpen ? 'sidebar-open' : ''}\\">\\n    <ShowcaseNav \\n      {selectedSection}\\n      onSectionSelect={handleSectionSelect}\\n    />\\n  </aside>\\n\\n  <!-- Main Content Area -->\\n  <main class=\\"main-content\\">\\n    <slot />\\n  </main>\\n\\n  <!-- Mobile overlay -->\\n  {#if mobileNavOpen}\\n    <div \\n      class=\\"mobile-overlay\\"\\n      on:click={() => mobileNavOpen = false}\\n      on:keydown={() => mobileNavOpen = false}\\n    />\\n  {/if}\\n</div>\\n\\n<style>\\n  .showcase-container {\\n    display: flex;\\n    min-height: 100vh;\\n    background: var(--color-background);\\n    color: var(--color-text);\\n  }\\n\\n  .mobile-nav-toggle {\\n    display: none;\\n    position: fixed;\\n    top: 1rem;\\n    left: 1rem;\\n    z-index: 1001;\\n    background: var(--color-primary);\\n    color: white;\\n    border: none;\\n    border-radius: 4px;\\n    padding: 0.5rem;\\n    cursor: pointer;\\n    font-size: 1.2rem;\\n  }\\n\\n  .sidebar {\\n    width: 300px;\\n    background: var(--color-panel);\\n    border-right: 1px solid var(--color-border);\\n    overflow-y: auto;\\n    position: fixed;\\n    top: 0;\\n    left: 0;\\n    height: 100vh;\\n    transform: translateX(-100%);\\n    transition: transform 0.3s ease;\\n    z-index: 1000;\\n  }\\n\\n  .sidebar-open {\\n    transform: translateX(0);\\n  }\\n\\n  .main-content {\\n    flex: 1;\\n    padding: 2rem;\\n    overflow-y: auto;\\n    margin-left: 300px;\\n  }\\n\\n  .mobile-overlay {\\n    position: fixed;\\n    top: 0;\\n    left: 0;\\n    width: 100%;\\n    height: 100%;\\n    background: rgba(0, 0, 0, 0.5);\\n    z-index: 999;\\n  }\\n\\n  /* Desktop styles */\\n  @media (min-width: 768px) {\\n    .sidebar {\\n      position: relative;\\n      transform: translateX(0);\\n    }\\n\\n    .main-content {\\n      margin-left: 0;\\n    }\\n  }\\n\\n  /* Mobile styles */\\n  @media (max-width: 767px) {\\n    .mobile-nav-toggle {\\n      display: block;\\n    }\\n\\n    .main-content {\\n      margin-left: 0;\\n      padding: 1rem;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AAsDE,kCAAoB,CAClB,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,KAAK,CACjB,UAAU,CAAE,IAAI,kBAAkB,CAAC,CACnC,KAAK,CAAE,IAAI,YAAY,CACzB,CAEA,iCAAmB,CACjB,OAAO,CAAE,IAAI,CACb,QAAQ,CAAE,KAAK,CACf,GAAG,CAAE,IAAI,CACT,IAAI,CAAE,IAAI,CACV,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,IAAI,eAAe,CAAC,CAChC,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,MAAM,CACf,MAAM,CAAE,OAAO,CACf,SAAS,CAAE,MACb,CAEA,uBAAS,CACP,KAAK,CAAE,KAAK,CACZ,UAAU,CAAE,IAAI,aAAa,CAAC,CAC9B,YAAY,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CAC3C,UAAU,CAAE,IAAI,CAChB,QAAQ,CAAE,KAAK,CACf,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,KAAK,CACb,SAAS,CAAE,WAAW,KAAK,CAAC,CAC5B,UAAU,CAAE,SAAS,CAAC,IAAI,CAAC,IAAI,CAC/B,OAAO,CAAE,IACX,CAEA,4BAAc,CACZ,SAAS,CAAE,WAAW,CAAC,CACzB,CAEA,4BAAc,CACZ,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,IAAI,CAChB,WAAW,CAAE,KACf,CAEA,8BAAgB,CACd,QAAQ,CAAE,KAAK,CACf,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAC9B,OAAO,CAAE,GACX,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,uBAAS,CACP,QAAQ,CAAE,QAAQ,CAClB,SAAS,CAAE,WAAW,CAAC,CACzB,CAEA,4BAAc,CACZ,WAAW,CAAE,CACf,CACF,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,iCAAmB,CACjB,OAAO,CAAE,KACX,CAEA,4BAAc,CACZ,WAAW,CAAE,CAAC,CACd,OAAO,CAAE,IACX,CACF"}`
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let selectedSection;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let mobileNavOpen = false;
  function handleSectionSelect(section) {
    goto();
    mobileNavOpen = false;
  }
  $$result.css.add(css);
  selectedSection = $page.params.section || "overview";
  $$unsubscribe_page();
  return `<div class="showcase-container svelte-1nfn3y5"> <button class="mobile-nav-toggle svelte-1nfn3y5" aria-label="Toggle navigation" data-svelte-h="svelte-1j7nqy">☰</button>  <aside class="${"sidebar " + escape(mobileNavOpen ? "sidebar-open" : "", true) + " svelte-1nfn3y5"}">${validate_component(ShowcaseNav, "ShowcaseNav").$$render(
    $$result,
    {
      selectedSection,
      onSectionSelect: handleSectionSelect
    },
    {},
    {}
  )}</aside>  <main class="main-content svelte-1nfn3y5">${slots.default ? slots.default({}) : ``}</main>  ${mobileNavOpen ? `<div class="mobile-overlay svelte-1nfn3y5"></div>` : ``} </div>`;
});
export {
  Layout as default
};
