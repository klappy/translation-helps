import App from './App.svelte';
import Greeter from './Greeter.svelte';
import './lib/theme/theme.css';

const app = new App({
  target: document.getElementById('app'),
  props: {
    name: 'Autobots'
  }
});

customElements.define('svelte-greeter', Greeter);

export default app;