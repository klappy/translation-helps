import { describe, it, expect, vi, beforeEach } from 'vitest';
import localforage from 'localforage';
import { fetchCachedFile, clearOfflineCache } from './offlineCacheService.js';

// Mock fetch
global.fetch = vi.fn();

describe('offlineCacheService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await clearOfflineCache();
  });

  it('fetches from network and caches the result', async () => {
    fetch.mockResolvedValueOnce({ ok: true, text: async () => 'data' });

    const result = await fetchCachedFile('http://example.com/file.txt');

    expect(result).toBe('data');
    expect(fetch).toHaveBeenCalledWith('http://example.com/file.txt');
    const stored = await localforage.getItem('http://example.com/file.txt');
    expect(stored).toBe('data');
  });

  it('returns cached data without network call', async () => {
    await localforage.setItem('http://example.com/file.txt', 'cached');

    const result = await fetchCachedFile('http://example.com/file.txt');

    expect(result).toBe('cached');
    expect(fetch).not.toHaveBeenCalled();
  });
});

