<script>
  import { onMount } from 'svelte';
  import { browser, dev } from '$app/environment';

  let isVisible = true;
  let progress = 20; // Update this as you make progress!

  // Only show in development
  $: showComponent = dev;

  // Load dismissed state from localStorage
  onMount(() => {
    if (browser && dev) {
      const dismissed = localStorage.getItem('showcase-reminder-dismissed');
      const dismissedDate = localStorage.getItem('showcase-reminder-dismissed-date');
      const today = new Date().toDateString();
      
      // Reset visibility each day
      if (dismissedDate !== today) {
        isVisible = true;
        localStorage.removeItem('showcase-reminder-dismissed');
      } else if (dismissed === 'true') {
        isVisible = false;
      }
    }
  });

  function handleDismiss() {
    if (browser) {
      isVisible = false;
      localStorage.setItem('showcase-reminder-dismissed', 'true');
      localStorage.setItem('showcase-reminder-dismissed-date', new Date().toDateString());
    }
  }
</script>

{#if showComponent && isVisible}
  <div class="development-reminder">
    <div class="title">
      🚧 Migration Development Active!
    </div>
    <div class="progress-text">
      Progress: {progress}% Complete
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progress}%"></div>
    </div>
    <div class="task">
      📋 Today's task: Complete React to Svelte migration
    </div>
    <div class="actions">
      <a 
        href="/docs/migration-status.md" 
        class="link"
        target="_blank"
      >
        View Status
      </a>
      <button 
        on:click={handleDismiss}
        class="dismiss-button"
      >
        Dismiss Today
      </button>
    </div>
  </div>
{/if}

<style>
  .development-reminder {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #ff6b6b, #ff8e53);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    max-width: 300px;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .title {
    font-weight: bold;
    margin-bottom: 8px;
    font-size: 16px;
  }

  .progress-text {
    font-size: 14px;
    margin-bottom: 10px;
  }

  .progress-bar {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    height: 8px;
    margin-bottom: 10px;
    overflow: hidden;
  }

  .progress-fill {
    background: white;
    height: 100%;
    transition: width 0.3s ease;
  }

  .task {
    font-size: 12px;
    margin-bottom: 10px;
  }

  .actions {
    display: flex;
    gap: 10px;
    font-size: 12px;
  }

  .link {
    color: white;
    text-decoration: underline;
  }

  .dismiss-button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }

  .dismiss-button:hover {
    background: rgba(255, 255, 255, 0.3);
  }
</style>