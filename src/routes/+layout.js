// This tells SvelteKit how to handle this layout during build
// We need to disable prerendering for routes that use browser-specific APIs
export const prerender = false;
export const ssr = false;