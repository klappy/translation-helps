import { c as create_ssr_component, e as escape, a as subscribe, v as validate_component } from "../../../../chunks/ssr.js";
import { p as page } from "../../../../chunks/stores.js";
/* empty css                                                               */
const css = {
  code: ".content-container.svelte-w3slr5{padding:2rem;max-width:800px;margin:0 auto;background:var(--color-background);border-radius:8px;height:100%;overflow-y:auto}.content-header.svelte-w3slr5{margin-bottom:2rem;border-bottom:1px solid var(--color-border);padding-bottom:1rem}.content-title.svelte-w3slr5{font-size:2rem;font-weight:bold;margin:0 0 1rem 0;color:var(--color-text)}.content-meta.svelte-w3slr5{display:flex;align-items:center;gap:1rem}.section-badge.svelte-w3slr5{background:var(--color-primary);color:white;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.8rem;font-weight:500}.last-updated.svelte-w3slr5{color:var(--color-text-secondary);font-size:0.9rem}.content-body.svelte-w3slr5{line-height:1.7;color:var(--color-text);margin-bottom:2rem}.content-body.svelte-w3slr5 h1{font-size:1.8rem;margin:2rem 0 1rem 0;color:var(--color-primary)}.content-body.svelte-w3slr5 h2{font-size:1.4rem;margin:1.5rem 0 0.75rem 0;color:var(--color-text)}.content-body.svelte-w3slr5 strong{font-weight:600;color:var(--color-primary)}.content-footer.svelte-w3slr5{border-top:1px solid var(--color-border);padding-top:1rem}.footer-actions.svelte-w3slr5{display:flex;gap:1rem}.feedback-button.svelte-w3slr5,.share-button.svelte-w3slr5{background:var(--color-secondary);color:white;border:none;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-size:0.9rem;transition:background 0.2s ease}.feedback-button.svelte-w3slr5:hover,.share-button.svelte-w3slr5:hover{background:var(--color-secondary-hover)}@media(max-width: 768px){.content-container.svelte-w3slr5{padding:1rem}.content-title.svelte-w3slr5{font-size:1.6rem}.content-meta.svelte-w3slr5{flex-direction:column;align-items:flex-start;gap:0.5rem}.footer-actions.svelte-w3slr5{flex-direction:column}}",
  map: `{"version":3,"file":"ShowcaseContent.svelte","sources":["ShowcaseContent.svelte"],"sourcesContent":["<script>\\n  export let section = 'overview';\\n\\n  // Simple content structure to fix build\\n  const sectionContent = {\\n    overview: {\\n      title: '🚀 Welcome to Translation Helps Showcase',\\n      content: \`# Welcome to Our Showcase!\\n\\nThis interactive showcase demonstrates the **Translation Helps** application - a powerful platform for Bible translation resources built with modern Svelte architecture.\\n\\n## 🎯 Purpose\\n\\nThis showcase serves as a comprehensive demonstration of our React to Svelte migration project.\\n\\n## 🏗️ What We Built\\n\\n- **Simple Verse-Loading Pattern** - Elegant architecture that scales\\n- **Self-Activating Panels** - Components that manage their own resources  \\n- **Cross-Organization Support** - Mix resources from different organizations\\n- **FIA Integration** - Rich multimedia Bible study resources\\n- **LLM Chat Integration** - AI-powered assistance\\n- **Theme System** - Beautiful light/dark mode support\\n\\n## 💡 Get Inspired!\\n\\nThis is the result of our comprehensive React to Svelte migration. See what we built, understand how we approached challenges, and explore the fully migrated application.\`\\n    },\\n    architecture: {\\n      title: '🏗️ Architecture Gallery',\\n      content: '# Architecture Gallery\\\\n\\\\nExploring our design patterns and system architecture.'\\n    },\\n    components: {\\n      title: '🎨 Component Showcase', \\n      content: '# Component Showcase\\\\n\\\\nInteractive UI components and examples.'\\n    },\\n    performance: {\\n      title: '⚡ Performance Victories',\\n      content: '# Performance Victories\\\\n\\\\nOptimization achievements and metrics.'\\n    },\\n    innovation: {\\n      title: '💡 Innovation Highlights',\\n      content: '# Innovation Highlights\\\\n\\\\nCutting-edge features and capabilities.'\\n    },\\n    interactive: {\\n      title: '🎮 Interactive Experiences',\\n      content: '# Interactive Experiences\\\\n\\\\nHands-on demos and playgrounds.'\\n    },\\n    metrics: {\\n      title: '📊 Metrics & Achievements',\\n      content: '# Metrics & Achievements\\\\n\\\\nProject statistics and impact.'\\n    }\\n  };\\n\\n  $: content = sectionContent[section] || sectionContent.overview;\\n<\/script>\\n\\n<div class=\\"content-container\\">\\n  <header class=\\"content-header\\">\\n    <h1 class=\\"content-title\\">{content.title}</h1>\\n    <div class=\\"content-meta\\">\\n      <span class=\\"section-badge\\">{section}</span>\\n      <span class=\\"last-updated\\">Updated: {new Date().toLocaleDateString()}</span>\\n    </div>\\n  </header>\\n\\n  <div class=\\"content-body\\">\\n    {@html content.content.replace(/\\\\n/g, '<br>').replace(/##\\\\s+(.+)/g, '<h2>$1</h2>').replace(/#\\\\s+(.+)/g, '<h1>$1</h1>').replace(/\\\\*\\\\*(.+?)\\\\*\\\\*/g, '<strong>$1</strong>')}\\n  </div>\\n\\n  <footer class=\\"content-footer\\">\\n    <div class=\\"footer-actions\\">\\n      <button class=\\"feedback-button\\">\\n        💬 Feedback\\n      </button>\\n      <button class=\\"share-button\\">\\n        🔗 Share Section\\n      </button>\\n    </div>\\n  </footer>\\n</div>\\n\\n<style>\\n  .content-container {\\n    padding: 2rem;\\n    max-width: 800px;\\n    margin: 0 auto;\\n    background: var(--color-background);\\n    border-radius: 8px;\\n    height: 100%;\\n    overflow-y: auto;\\n  }\\n\\n  .content-header {\\n    margin-bottom: 2rem;\\n    border-bottom: 1px solid var(--color-border);\\n    padding-bottom: 1rem;\\n  }\\n\\n  .content-title {\\n    font-size: 2rem;\\n    font-weight: bold;\\n    margin: 0 0 1rem 0;\\n    color: var(--color-text);\\n  }\\n\\n  .content-meta {\\n    display: flex;\\n    align-items: center;\\n    gap: 1rem;\\n  }\\n\\n  .section-badge {\\n    background: var(--color-primary);\\n    color: white;\\n    padding: 0.25rem 0.5rem;\\n    border-radius: 4px;\\n    font-size: 0.8rem;\\n    font-weight: 500;\\n  }\\n\\n  .last-updated {\\n    color: var(--color-text-secondary);\\n    font-size: 0.9rem;\\n  }\\n\\n  .content-body {\\n    line-height: 1.7;\\n    color: var(--color-text);\\n    margin-bottom: 2rem;\\n  }\\n\\n  .content-body :global(h1) {\\n    font-size: 1.8rem;\\n    margin: 2rem 0 1rem 0;\\n    color: var(--color-primary);\\n  }\\n\\n  .content-body :global(h2) {\\n    font-size: 1.4rem;\\n    margin: 1.5rem 0 0.75rem 0;\\n    color: var(--color-text);\\n  }\\n\\n  .content-body :global(strong) {\\n    font-weight: 600;\\n    color: var(--color-primary);\\n  }\\n\\n  .content-footer {\\n    border-top: 1px solid var(--color-border);\\n    padding-top: 1rem;\\n  }\\n\\n  .footer-actions {\\n    display: flex;\\n    gap: 1rem;\\n  }\\n\\n  .feedback-button,\\n  .share-button {\\n    background: var(--color-secondary);\\n    color: white;\\n    border: none;\\n    padding: 0.5rem 1rem;\\n    border-radius: 6px;\\n    cursor: pointer;\\n    font-size: 0.9rem;\\n    transition: background 0.2s ease;\\n  }\\n\\n  .feedback-button:hover,\\n  .share-button:hover {\\n    background: var(--color-secondary-hover);\\n  }\\n\\n  /* Responsive design */\\n  @media (max-width: 768px) {\\n    .content-container {\\n      padding: 1rem;\\n    }\\n\\n    .content-title {\\n      font-size: 1.6rem;\\n    }\\n\\n    .content-meta {\\n      flex-direction: column;\\n      align-items: flex-start;\\n      gap: 0.5rem;\\n    }\\n\\n    .footer-actions {\\n      flex-direction: column;\\n    }\\n  }\\n</style>"],"names":[],"mappings":"AAmFE,gCAAmB,CACjB,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,KAAK,CAChB,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,UAAU,CAAE,IAAI,kBAAkB,CAAC,CACnC,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,IACd,CAEA,6BAAgB,CACd,aAAa,CAAE,IAAI,CACnB,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CAC5C,cAAc,CAAE,IAClB,CAEA,4BAAe,CACb,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,IAAI,CACjB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAClB,KAAK,CAAE,IAAI,YAAY,CACzB,CAEA,2BAAc,CACZ,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,IACP,CAEA,4BAAe,CACb,UAAU,CAAE,IAAI,eAAe,CAAC,CAChC,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,OAAO,CAAC,MAAM,CACvB,aAAa,CAAE,GAAG,CAClB,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GACf,CAEA,2BAAc,CACZ,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,SAAS,CAAE,MACb,CAEA,2BAAc,CACZ,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,aAAa,CAAE,IACjB,CAEA,2BAAa,CAAS,EAAI,CACxB,SAAS,CAAE,MAAM,CACjB,MAAM,CAAE,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CACrB,KAAK,CAAE,IAAI,eAAe,CAC5B,CAEA,2BAAa,CAAS,EAAI,CACxB,SAAS,CAAE,MAAM,CACjB,MAAM,CAAE,MAAM,CAAC,CAAC,CAAC,OAAO,CAAC,CAAC,CAC1B,KAAK,CAAE,IAAI,YAAY,CACzB,CAEA,2BAAa,CAAS,MAAQ,CAC5B,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,eAAe,CAC5B,CAEA,6BAAgB,CACd,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,cAAc,CAAC,CACzC,WAAW,CAAE,IACf,CAEA,6BAAgB,CACd,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,IACP,CAEA,8BAAgB,CAChB,2BAAc,CACZ,UAAU,CAAE,IAAI,iBAAiB,CAAC,CAClC,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,MAAM,CAAC,IAAI,CACpB,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,OAAO,CACf,SAAS,CAAE,MAAM,CACjB,UAAU,CAAE,UAAU,CAAC,IAAI,CAAC,IAC9B,CAEA,8BAAgB,MAAM,CACtB,2BAAa,MAAO,CAClB,UAAU,CAAE,IAAI,uBAAuB,CACzC,CAGA,MAAO,YAAY,KAAK,CAAE,CACxB,gCAAmB,CACjB,OAAO,CAAE,IACX,CAEA,4BAAe,CACb,SAAS,CAAE,MACb,CAEA,2BAAc,CACZ,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,UAAU,CACvB,GAAG,CAAE,MACP,CAEA,6BAAgB,CACd,cAAc,CAAE,MAClB,CACF"}`
};
const ShowcaseContent = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let content;
  let { section = "overview" } = $$props;
  const sectionContent = {
    overview: {
      title: "🚀 Welcome to Translation Helps Showcase",
      content: `# Welcome to Our Showcase!

This interactive showcase demonstrates the **Translation Helps** application - a powerful platform for Bible translation resources built with modern Svelte architecture.

## 🎯 Purpose

This showcase serves as a comprehensive demonstration of our React to Svelte migration project.

## 🏗️ What We Built

- **Simple Verse-Loading Pattern** - Elegant architecture that scales
- **Self-Activating Panels** - Components that manage their own resources  
- **Cross-Organization Support** - Mix resources from different organizations
- **FIA Integration** - Rich multimedia Bible study resources
- **LLM Chat Integration** - AI-powered assistance
- **Theme System** - Beautiful light/dark mode support

## 💡 Get Inspired!

This is the result of our comprehensive React to Svelte migration. See what we built, understand how we approached challenges, and explore the fully migrated application.`
    },
    architecture: {
      title: "🏗️ Architecture Gallery",
      content: "# Architecture Gallery\n\nExploring our design patterns and system architecture."
    },
    components: {
      title: "🎨 Component Showcase",
      content: "# Component Showcase\n\nInteractive UI components and examples."
    },
    performance: {
      title: "⚡ Performance Victories",
      content: "# Performance Victories\n\nOptimization achievements and metrics."
    },
    innovation: {
      title: "💡 Innovation Highlights",
      content: "# Innovation Highlights\n\nCutting-edge features and capabilities."
    },
    interactive: {
      title: "🎮 Interactive Experiences",
      content: "# Interactive Experiences\n\nHands-on demos and playgrounds."
    },
    metrics: {
      title: "📊 Metrics & Achievements",
      content: "# Metrics & Achievements\n\nProject statistics and impact."
    }
  };
  if ($$props.section === void 0 && $$bindings.section && section !== void 0) $$bindings.section(section);
  $$result.css.add(css);
  content = sectionContent[section] || sectionContent.overview;
  return `<div class="content-container svelte-w3slr5"><header class="content-header svelte-w3slr5"><h1 class="content-title svelte-w3slr5">${escape(content.title)}</h1> <div class="content-meta svelte-w3slr5"><span class="section-badge svelte-w3slr5">${escape(section)}</span> <span class="last-updated svelte-w3slr5">Updated: ${escape((/* @__PURE__ */ new Date()).toLocaleDateString())}</span></div></header> <div class="content-body svelte-w3slr5"><!-- HTML_TAG_START -->${content.content.replace(/\n/g, "<br>").replace(/##\s+(.+)/g, "<h2>$1</h2>").replace(/#\s+(.+)/g, "<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}<!-- HTML_TAG_END --></div> <footer class="content-footer svelte-w3slr5" data-svelte-h="svelte-1wpf2y7"><div class="footer-actions svelte-w3slr5"><button class="feedback-button svelte-w3slr5">💬 Feedback</button> <button class="share-button svelte-w3slr5">🔗 Share Section</button></div></footer> </div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let section;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  section = $page.params.section || "overview";
  $$unsubscribe_page();
  return `${validate_component(ShowcaseContent, "ShowcaseContent").$$render($$result, { section }, {}, {})}`;
});
export {
  Page as default
};
