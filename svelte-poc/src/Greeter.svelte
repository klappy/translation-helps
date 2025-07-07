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
    padding: 1.25rem 1.5rem;
    background: linear-gradient(135deg, #ff512f 0%, #f09819 100%);
    color: #fff;
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    transition: transform 0.2s;
  }
  :host(:hover) {
    transform: translateY(-2px);
  }
  h2 {
    margin: 0;
    font-size: 1.2rem;
  }
  button {
    background: rgba(255,255,255,0.2);
    border: 0;
    padding: 0.45rem 0.9rem;
    border-radius: 6px;
    color: #fff;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
  }
  button:hover {
    background: rgba(255,255,255,0.3);
  }
</style>

Hello {name}! ⚡

<button aria-label="increment counter" on:click={increment}>Clicked {count} times</button>