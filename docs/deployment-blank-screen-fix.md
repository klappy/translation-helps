# Deployment Blank Screen Fix

## Problem Summary

The deployment at https://deploy-preview-88--translation-helps.netlify.app showed a blank white screen after switching from `@sveltejs/adapter-auto` to `@sveltejs/adapter-static`.

## Root Cause Analysis

### Initial Issue
- `@sveltejs/adapter-auto` couldn't detect Netlify as deployment environment
- Build was failing to generate proper static files

### Secondary Issue (Blank Screen)
- After switching to `@sveltejs/adapter-static`, the app became a Single Page Application (SPA)
- SPA requires JavaScript to load content, but Netlify wasn't configured to serve the fallback HTML for all routes
- Missing `_redirects` file for proper SPA routing
- Layout using browser-specific APIs (localStorage) needed proper SSR configuration

## Complete Solution

### 1. SvelteKit Configuration

**File**: `svelte.config.js`
```javascript
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',  // Critical for SPA routing
      precompress: false,
      strict: false
    }),
    prerender: {
      handleHttpError: 'warn',
      handleMissingId: 'warn',
      origin: 'https://translation-helps.netlify.app'
    },
    alias: {
      $lib: 'src/lib',
      $components: 'src/lib/components',
      $stores: 'src/lib/stores',
      $services: 'src/lib/services',
      $utils: 'src/lib/utils'
    }
  }
};

export default config;
```

### 2. Layout Configuration

**File**: `src/routes/+layout.js`
```javascript
// This tells SvelteKit how to handle this layout during build
// We need to disable prerendering for routes that use browser-specific APIs
export const prerender = false;
export const ssr = false;
```

### 3. Netlify SPA Routing

**File**: `static/_redirects`
```
/*    /index.html   200
```

This file gets copied to `build/_redirects` during build and tells Netlify to serve `index.html` for all routes, allowing the SPA to handle routing client-side.

### 4. Layout Browser API Handling

**File**: `src/routes/+layout.svelte`
```svelte
<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  // ... other imports

  let showSplash = false;

  onMount(() => {
    // Browser-specific code runs only after component mounts
    // No need to check for 'browser' since onMount only runs in browser
    const hasSeenSplash = localStorage.getItem('hasSeenSplash');
    const showSplashParam = $page.url.searchParams.get('splash');
    
    showSplash = !hasSeenSplash || showSplashParam === 'true';

    // Theme initialization
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia && 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  });

  function handleSplashComplete() {
    localStorage.setItem('hasSeenSplash', 'true');
    showSplash = false;
  }
</script>

<!-- Rest of template -->
```

## Why This Works

### Static Adapter Configuration
- `fallback: 'index.html'` ensures all routes serve the main HTML file
- `prerender: false` prevents build-time rendering of browser-dependent code
- `ssr: false` disables server-side rendering for browser-specific functionality

### Netlify Routing
- `_redirects` file configures Netlify to serve `index.html` for all routes
- This allows the SPA to handle routing client-side
- The `200` status code ensures it's a rewrite, not a redirect

### Browser API Handling
- `onMount` ensures browser APIs are only called after hydration
- Removed unnecessary `browser` checks since `onMount` only runs in browser
- Proper separation of server-safe and client-only code

## Testing the Fix

### Local Testing
```bash
npm run build
npm run preview
```

### Deployment Testing
1. Push changes to trigger new deploy preview
2. Verify routes work correctly (no blank screen)
3. Test browser navigation and refresh
4. Confirm splash screen and theme functionality

## Key Lessons

1. **Adapter Selection**: Use `@sveltejs/adapter-static` for Netlify static deployments
2. **SPA Configuration**: Always include `_redirects` for SPA routing
3. **Browser APIs**: Use `onMount` for browser-specific code in SSR/static contexts
4. **Fallback Pages**: Configure fallback HTML for client-side routing
5. **Testing**: Always test deployment builds locally before deploying

## Prevention

To prevent similar issues:

1. **Always test builds locally** with `npm run build && npm run preview`
2. **Use proper SvelteKit patterns** for browser API access
3. **Configure deployment settings** correctly for your hosting platform
4. **Implement visual testing** (see `docs/visual-testing-implementation.md`)
5. **Monitor deployment logs** for build warnings and errors

## Files Modified

- ✅ `svelte.config.js` - Fixed adapter configuration
- ✅ `src/routes/+layout.js` - Added proper SSR configuration
- ✅ `src/routes/+layout.svelte` - Cleaned up browser API usage
- ✅ `static/_redirects` - Added SPA routing configuration

## Verification Checklist

- [ ] Build completes successfully
- [ ] `build/_redirects` file exists
- [ ] Local preview works correctly
- [ ] All routes load without blank screen
- [ ] Browser APIs (localStorage, theme) work properly
- [ ] Mobile navigation functions correctly
- [ ] Splash screen displays when expected

---

*This fix addresses both the immediate blank screen issue and implements proper SvelteKit static deployment patterns for Netlify hosting.*