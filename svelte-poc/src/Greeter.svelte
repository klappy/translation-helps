<script>
  export let name = 'Cybertron';
  let count = 0;
  function increment() {
    count += 1;
  }
</script>

<style>
  :host {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg,#ff3e00 0%,#ff7b00 100%);
    color: #fff;
    border-radius: 8px;
    font-family: system-ui, sans-serif;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }
  button {
    background: rgba(255,255,255,0.15);
    border: 0;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
  }
  button:hover {
    background: rgba(255,255,255,0.25);
  }
</style>

Hello {name}! ⚡

<button on:click={increment}>Clicked {count} times</button>