import React, { useEffect } from 'react';

export default function SvelteNavBar() {
  useEffect(() => {
    if (!document.querySelector('script[data-svelte-nav]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.dataset.svelteNav = 'true';
      script.src = 'http://localhost:5175/src/main.js'; // dev URL
      document.body.appendChild(script);
    }
  }, []);

  return <svelte-nav-bar />;
}