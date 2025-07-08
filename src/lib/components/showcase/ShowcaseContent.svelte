<script>
  export let section = 'overview';

  // Simple content structure to fix build
  const sectionContent = {
    overview: {
      title: '🚀 Welcome to Translation Helps Showcase',
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
      title: '🏗️ Architecture Gallery',
      content: '# Architecture Gallery\n\nExploring our design patterns and system architecture.'
    },
    components: {
      title: '🎨 Component Showcase', 
      content: '# Component Showcase\n\nInteractive UI components and examples.'
    },
    performance: {
      title: '⚡ Performance Victories',
      content: '# Performance Victories\n\nOptimization achievements and metrics.'
    },
    innovation: {
      title: '💡 Innovation Highlights',
      content: '# Innovation Highlights\n\nCutting-edge features and capabilities.'
    },
    interactive: {
      title: '🎮 Interactive Experiences',
      content: '# Interactive Experiences\n\nHands-on demos and playgrounds.'
    },
    metrics: {
      title: '📊 Metrics & Achievements',
      content: '# Metrics & Achievements\n\nProject statistics and impact.'
    }
  };

  $: content = sectionContent[section] || sectionContent.overview;
</script>

<div class="content-container">
  <header class="content-header">
    <h1 class="content-title">{content.title}</h1>
    <div class="content-meta">
      <span class="section-badge">{section}</span>
      <span class="last-updated">Updated: {new Date().toLocaleDateString()}</span>
    </div>
  </header>

  <div class="content-body">
    {@html content.content.replace(/\n/g, '<br>').replace(/##\s+(.+)/g, '<h2>$1</h2>').replace(/#\s+(.+)/g, '<h1>$1</h1>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}
  </div>

  <footer class="content-footer">
    <div class="footer-actions">
      <button class="feedback-button">
        💬 Feedback
      </button>
      <button class="share-button">
        🔗 Share Section
      </button>
    </div>
  </footer>
</div>

<style>
  .content-container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    background: var(--color-background);
    border-radius: 8px;
    height: 100%;
    overflow-y: auto;
  }

  .content-header {
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 1rem;
  }

  .content-title {
    font-size: 2rem;
    font-weight: bold;
    margin: 0 0 1rem 0;
    color: var(--color-text);
  }

  .content-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .section-badge {
    background: var(--color-primary);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .last-updated {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }

  .content-body {
    line-height: 1.7;
    color: var(--color-text);
    margin-bottom: 2rem;
  }

  .content-body :global(h1) {
    font-size: 1.8rem;
    margin: 2rem 0 1rem 0;
    color: var(--color-primary);
  }

  .content-body :global(h2) {
    font-size: 1.4rem;
    margin: 1.5rem 0 0.75rem 0;
    color: var(--color-text);
  }

  .content-body :global(strong) {
    font-weight: 600;
    color: var(--color-primary);
  }

  .content-footer {
    border-top: 1px solid var(--color-border);
    padding-top: 1rem;
  }

  .footer-actions {
    display: flex;
    gap: 1rem;
  }

  .feedback-button,
  .share-button {
    background: var(--color-secondary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s ease;
  }

  .feedback-button:hover,
  .share-button:hover {
    background: var(--color-secondary-hover);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .content-container {
      padding: 1rem;
    }

    .content-title {
      font-size: 1.6rem;
    }

    .content-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .footer-actions {
      flex-direction: column;
    }
  }
</style>