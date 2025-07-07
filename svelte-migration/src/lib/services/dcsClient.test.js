/**
 * DCS Client Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchCatalog, fetchManifest, fetchResourceFile } from './dcsClient.js';

// Mock fetch
global.fetch = vi.fn();

describe('DCS Client Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCatalog', () => {
    it('should fetch catalog successfully', async () => {
      const mockCatalog = {
        languages: [
          { identifier: 'en', title: 'English' },
          { identifier: 'es', title: 'Spanish' }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCatalog)
      });

      const result = await fetchCatalog('unfoldingWord');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://git.door43.org/api/v1/catalog/list/unfoldingWord'
      );
      expect(result).toEqual(mockCatalog);
    });

    it('should handle catalog fetch errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(fetchCatalog('invalid-org')).rejects.toThrow(
        'Failed to fetch catalog: 404 Not Found'
      );
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchCatalog('unfoldingWord')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('fetchManifest', () => {
    it('should fetch manifest successfully', async () => {
      const mockManifest = {
        projects: [
          { identifier: 'gen', title: 'Genesis' },
          { identifier: 'exo', title: 'Exodus' }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockManifest)
      });

      const result = await fetchManifest('unfoldingWord', 'en', 'ult');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://git.door43.org/unfoldingWord/en_ult/raw/branch/master/manifest.yaml'
      );
      expect(result).toEqual(mockManifest);
    });

    it('should handle manifest fetch errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(fetchManifest('unfoldingWord', 'en', 'ult')).rejects.toThrow(
        'Failed to fetch manifest: 404 Not Found'
      );
    });

    it('should construct correct URL for different organizations', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      await fetchManifest('Door43-Catalog', 'es', 'ust');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://git.door43.org/Door43-Catalog/es_ust/raw/branch/master/manifest.yaml'
      );
    });
  });

  describe('fetchResourceFile', () => {
    it('should fetch resource file successfully', async () => {
      const mockFileContent = '\\c 1\n\\v 1 In the beginning God created the heavens and the earth.';

      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockFileContent)
      });

      const result = await fetchResourceFile('unfoldingWord', 'en', 'ult', 'gen', '01.usfm');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://git.door43.org/unfoldingWord/en_ult/raw/branch/master/01-GEN/01.usfm'
      );
      expect(result).toBe(mockFileContent);
    });

    it('should handle resource file fetch errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(
        fetchResourceFile('unfoldingWord', 'en', 'ult', 'gen', '01.usfm')
      ).rejects.toThrow('Failed to fetch resource file: 404 Not Found');
    });

    it('should construct correct path for different file types', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('mock content')
      });

      await fetchResourceFile('unfoldingWord', 'en', 'tn', 'gen', 'notes.tsv');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://git.door43.org/unfoldingWord/en_tn/raw/branch/master/01-GEN/notes.tsv'
      );
    });

    it('should handle different book formats', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('mock content')
      });

      await fetchResourceFile('unfoldingWord', 'en', 'ult', 'jhn', '43.usfm');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://git.door43.org/unfoldingWord/en_ult/raw/branch/master/43-JHN/43.usfm'
      );
    });
  });

  describe('URL Construction', () => {
    it('should handle special characters in organization names', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      await fetchCatalog('Door43-Catalog');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://git.door43.org/api/v1/catalog/list/Door43-Catalog'
      );
    });

    it('should handle different language codes', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      await fetchManifest('unfoldingWord', 'zh-CN', 'ult');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://git.door43.org/unfoldingWord/zh-CN_ult/raw/branch/master/manifest.yaml'
      );
    });
  });

  describe('Error Handling', () => {
    it('should provide meaningful error messages', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(fetchCatalog('unfoldingWord')).rejects.toThrow(
        'Failed to fetch catalog: 500 Internal Server Error'
      );
    });

    it('should handle JSON parsing errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(fetchCatalog('unfoldingWord')).rejects.toThrow(
        'Invalid JSON'
      );
    });

    it('should handle text parsing errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.reject(new Error('Invalid text'))
      });

      await expect(
        fetchResourceFile('unfoldingWord', 'en', 'ult', 'gen', '01.usfm')
      ).rejects.toThrow('Invalid text');
    });
  });
});