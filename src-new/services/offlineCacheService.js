/**
 * offlineCacheService.js
 * Simple URL-based caching using localForage for offline support.
 */
import localforage from 'localforage';

// Create a dedicated instance so we don't pollute global storage
const store = localforage.createInstance({ name: 'offlineFileCache' });

/**
 * Fetch a URL and cache the response text for offline usage.
 * @param {string} url - The resource URL.
 * @returns {Promise<string>} The response text from cache or network.
 */
export async function fetchCachedFile(url) {
  if (!url) throw new Error('URL is required');

  // Check persistent cache first
  const cached = await store.getItem(url);
  if (cached) {
    return cached;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  await store.setItem(url, text);
  return text;
}

/**
 * Clear the offline cache.
 * @param {string} [url] - Specific URL to remove; clears all if omitted.
 */
export async function clearOfflineCache(url) {
  if (url) {
    await store.removeItem(url);
  } else {
    await store.clear();
  }
}

export default { fetchCachedFile, clearOfflineCache };

