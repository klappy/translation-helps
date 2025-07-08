<script>
  export let rcUri;
  export let onRcLinkClick = null;

  function handleClick(event) {
    event.preventDefault();
    if (onRcLinkClick) {
      onRcLinkClick(rcUri);
    }
  }
</script>

<button
  on:click={handleClick}
  class="rc-link"
  title="Navigate to {rcUri}"
>
  <slot>{rcUri}</slot>
</button>

<style>
  .rc-link {
    background: none;
    border: none;
    color: var(--color-primary);
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    font: inherit;
    display: inline;
    transition: color 0.2s ease;
  }

  .rc-link:hover {
    color: var(--color-primary-hover);
  }

  .rc-link:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 1px;
  }
</style>