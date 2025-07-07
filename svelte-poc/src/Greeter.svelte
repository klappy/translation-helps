<script>
  export let name = 'Cybertron';
  let count = 0;
  function increment() {
    count += 1;
  }
</script>

<style>
  :host {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border-radius: 4px;
    font-family: system-ui, sans-serif;
  }
</style>

Hello {name}! ⚡

<button on:click={increment}>Clicked {count} times</button>