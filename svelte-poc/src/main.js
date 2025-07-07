import App from './App.svelte';
import Greeter from './Greeter.svelte';
import NavigationBar from './lib/NavigationBar.svelte';
import './lib/theme/theme.css';
import Landing from './routes/Landing.svelte';
import Settings from './routes/Settings.svelte';
import Auth from './routes/Auth.svelte';
import DevelopmentReminder from './lib/DevelopmentReminder.svelte';
import NavigationBreadcrumbs from './widgets/NavigationBreadcrumbs.svelte';
import LoadingSpinner from './widgets/LoadingSpinner.svelte';
import VerseTabs from './widgets/VerseTabs.svelte';

const app = new App({
  target: document.getElementById('app'),
  props: {
    name: 'Autobots'
  }
});

customElements.define('svelte-greeter', Greeter);
customElements.define('svelte-nav-bar', NavigationBar);
customElements.define('landing-page', Landing);
customElements.define('settings-page', Settings);
customElements.define('auth-page', Auth);
customElements.define('dev-reminder', DevelopmentReminder);
customElements.define('nav-breadcrumbs', NavigationBreadcrumbs);
customElements.define('loading-spinner', LoadingSpinner);
customElements.define('verse-tabs', VerseTabs);

export default app;