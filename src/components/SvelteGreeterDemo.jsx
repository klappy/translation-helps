import React, { useEffect } from 'react';

/**
 * Demonstrates embedding a Svelte custom element inside React.
 * During `yarn dev:both` the Svelte dev server runs on http://localhost:5175
 * which serves `/src/main.js` that defines <svelte-greeter>.
 */
export default function SvelteGreeterDemo() {
  useEffect(() => {
    // Inject module script only once
    if (!document.querySelector('script[data-svelte-greeter]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.dataset.svelteGreeter = 'true';
      // Dev-only URL; in production we will import from built bundle
      script.src = 'http://localhost:5175/src/main.js';
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>React hosts Svelte Greeter:</h2>
      {/* Custom element provided by Svelte */}
      <svelte-greeter name="Optimus Prime" />
    </div>
  );
}