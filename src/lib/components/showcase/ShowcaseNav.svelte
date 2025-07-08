<script>
  export let selectedSection;
  export let onSectionSelect;

  const showcaseSections = [
    {
      id: 'overview',
      title: '🏠 Overview',
      description: 'Project introduction and showcase purpose'
    },
    {
      id: 'architecture',
      title: '🏗️ Architecture Gallery',
      description: 'Design patterns and system architecture',
      subsections: [
        { id: 'simple-pattern', title: 'Simple Verse-Loading Pattern' },
        { id: 'self-activating', title: 'Self-Activating Panels' },
        { id: 'url-driven', title: 'URL-Driven State' },
        { id: 'cross-org', title: 'Cross-Organization Support' }
      ]
    },
    {
      id: 'components',
      title: '🎨 Component Showcase',
      description: 'Interactive UI components and examples',
      subsections: [
        { id: 'navigation-wizard', title: 'Navigation Wizard' },
        { id: 'scripture-panel', title: 'Scripture Panel' },
        { id: 'translation-helps', title: 'Translation Helps' },
        { id: 'theme-system', title: 'Theme System' }
      ]
    },
    {
      id: 'performance',
      title: '⚡ Performance Victories',
      description: 'Optimization achievements and metrics',
      subsections: [
        { id: 'api-optimization', title: '90% API Optimization' },
        { id: 'loading-states', title: 'Loading States' },
        { id: 'error-handling', title: 'Error Handling' }
      ]
    },
    {
      id: 'innovation',
      title: '💡 Innovation Highlights',
      description: 'Cutting-edge features and capabilities',
      subsections: [
        { id: 'twl-integration', title: 'TWL Integration' },
        { id: 'fia-resources', title: 'FIA Resources' },
        { id: 'llm-chat', title: 'LLM Chat' },
        { id: 'rc-links', title: 'RC Links' }
      ]
    },
    {
      id: 'interactive',
      title: '🎮 Interactive Experiences',
      description: 'Hands-on demos and playgrounds',
      subsections: [
        { id: 'live-playground', title: 'Live Playground' },
        { id: 'pattern-explorer', title: 'Pattern Explorer' },
        { id: 'api-explorer', title: 'API Explorer' }
      ]
    },
    {
      id: 'metrics',
      title: '📊 Metrics & Achievements',
      description: 'Project statistics and impact',
      subsections: [
        { id: 'project-stats', title: 'Project Statistics' },
        { id: 'evolution-timeline', title: 'Architecture Evolution' },
        { id: 'community-impact', title: 'Community Impact' }
      ]
    }
  ];

  function handleSectionClick(sectionId) {
    onSectionSelect(sectionId);
  }

  function isActive(sectionId) {
    return selectedSection === sectionId || selectedSection?.startsWith(sectionId);
  }
</script>

<nav class="nav-container">
  <!-- Header -->
  <div class="nav-header">
    <h2 class="nav-title">
      🚀 Translation Helps Showcase
    </h2>
    <p class="nav-subtitle">
      Explore our achievements and get inspired!
    </p>
  </div>

  <!-- Navigation Items -->
  <div class="nav-items">
    {#each showcaseSections as section}
      <div class="nav-section">
        <button
          class="nav-button {isActive(section.id) ? 'active' : ''}"
          on:click={() => handleSectionClick(section.id)}
          title={section.description}
        >
          <span class="nav-button-title">{section.title}</span>
          {#if section.subsections}
            <span class="nav-button-arrow">
              {isActive(section.id) ? '▼' : '▶'}
            </span>
          {/if}
        </button>

        <!-- Subsections -->
        {#if section.subsections && isActive(section.id)}
          <div class="nav-subsections">
            {#each section.subsections as subsection}
              <button
                class="nav-sub-button {selectedSection === `${section.id}/${subsection.id}` ? 'active-subsection' : ''}"
                on:click={() => handleSectionClick(`${section.id}/${subsection.id}`)}
              >
                {subsection.title}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Footer -->
  <div class="nav-footer">
    <p class="nav-footer-text">
      Built with the Translation Helps architecture
    </p>
    <div class="nav-footer-links">
      <a href="/" class="nav-footer-link">← Back to App</a>
      <a href="https://github.com/klappy/translation-helps" target="_blank" rel="noopener noreferrer" class="nav-footer-link">
        GitHub →
      </a>
    </div>
  </div>
</nav>

<style>
  .nav-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
    background: var(--color-panel);
    border-right: 1px solid var(--color-border);
  }

  .nav-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .nav-title {
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0 0 0.5rem 0;
    color: var(--color-primary);
  }

  .nav-subtitle {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .nav-items {
    flex: 1;
    overflow-y: auto;
  }

  .nav-section {
    margin-bottom: 0.5rem;
  }

  .nav-button {
    width: 100%;
    padding: 0.8rem;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s ease;
    color: var(--color-text);
    font-size: 0.9rem;
  }

  .nav-button:hover {
    background: var(--color-hover);
  }

  .nav-button.active {
    background: var(--color-primary-alpha);
    color: var(--color-primary);
    font-weight: 600;
  }

  .nav-button-title {
    flex: 1;
  }

  .nav-button-arrow {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
  }

  .nav-subsections {
    margin-left: 1rem;
    margin-top: 0.5rem;
    padding-left: 0.5rem;
    border-left: 2px solid var(--color-border);
  }

  .nav-sub-button {
    width: 100%;
    padding: 0.5rem 0.8rem;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-align: left;
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    transition: all 0.2s ease;
    margin-bottom: 0.25rem;
  }

  .nav-sub-button:hover {
    background: var(--color-hover);
    color: var(--color-text);
  }

  .nav-sub-button.active-subsection {
    background: var(--color-primary-alpha);
    color: var(--color-primary);
    font-weight: 500;
  }

  .nav-footer {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
  }

  .nav-footer-text {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    margin: 0 0 0.5rem 0;
  }

  .nav-footer-links {
    display: flex;
    gap: 1rem;
  }

  .nav-footer-link {
    font-size: 0.8rem;
    color: var(--color-primary);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .nav-footer-link:hover {
    color: var(--color-primary-hover);
    text-decoration: underline;
  }
</style>