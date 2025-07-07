<script>
  export let size = 24;
</script>

<div class="spinner" style="width:{size}px;height:{size}px"></div>

<style>
  .spinner{
    border: 2px solid rgba(0,0,0,0.1);
    border-top-color: var(--color-primary);
    border-radius:50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin{to{transform:rotate(360deg);}}
</style>