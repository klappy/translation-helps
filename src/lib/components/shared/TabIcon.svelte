<script>
  export let type;

  const iconMap = {
    notes: '📝',
    questions: '❓',
    words: '📚',
    images: '🖼️',
    maps: '🗺️',
    chat: '💬',
    article: '📄'
  };

  $: icon = iconMap[type] || '📄';
</script>

<span class="tab-icon" aria-hidden="true">
  {icon}
</span>

<style>
  .tab-icon {
    font-size: 1rem;
    display: inline-block;
  }
</style>