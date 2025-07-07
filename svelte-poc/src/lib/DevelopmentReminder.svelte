<script>
  import { onMount } from 'svelte';
  export let progress = 10;
  let isVisible = true;
  const today = new Date().toDateString();
  onMount(() => {
    const dismissedDate = localStorage.getItem('showcase-reminder-dismissed-date');
    const dismissed = localStorage.getItem('showcase-reminder-dismissed');
    if (dismissedDate !== today) {
      isVisible = true;
      localStorage.removeItem('showcase-reminder-dismissed');
    } else if (dismissed === 'true') {
      isVisible = false;
    }
  });
  function dismiss(){
    isVisible = false;
    localStorage.setItem('showcase-reminder-dismissed', 'true');
    localStorage.setItem('showcase-reminder-dismissed-date', today);
  }
</script>

{#if process.env.NODE_ENV === 'development' && isVisible}
  <div class="banner">
    <div class="title">🚧 Showcase Development Active!</div>
    <div class="pct">Progress: {progress}% Complete</div>
    <div class="bar"><span style="width:{progress}%" /></div>
    <div class="task">📋 Today's task: Set up routing infrastructure</div>
    <div class="links">
      <a href="/docs/showcase-implementation-plan.md" target="_blank">View Plan</a>
      <button on:click={dismiss}>Dismiss Today</button>
    </div>
  </div>
{/if}

<style>
  .banner{position:fixed;bottom:20px;right:20px;padding:15px 20px;max-width:300px;z-index:9999;
    background:linear-gradient(135deg,#ff6b6b,#ff8e53);color:#fff;border-radius:var(--radius-md);
    box-shadow:0 4px 6px rgba(0,0,0,.1);font-family:var(--font-family);}
  .title{font-weight:700;margin-bottom:8px;font-size:var(--font-size-base);}
  .pct{font-size:var(--font-size-sm);margin-bottom:10px;}
  .bar{background:rgba(255,255,255,.3);height:8px;border-radius:4px;margin-bottom:10px;overflow:hidden;}
  .bar span{display:block;background:#fff;height:100%;transition:width .3s;}
  .task{font-size:var(--font-size-xs);margin-bottom:10px;}
  .links{display:flex;gap:10px;font-size:var(--font-size-xs);}  
  a{color:#fff;text-decoration:underline;}
  button{background:rgba(255,255,255,.2);border:0;color:#fff;padding:2px 8px;border-radius:4px;cursor:pointer;}
</style>