/**
 * FIA Service Tests
 * Tests for DCS-based FIA resource loading
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getVerseFiaImages, getVerseFiaMaps, getVerseFiaContent, resolveFiaMediaUrl } from './fiaService';

// Mock fetch globally
global.fetch = vi.fn();

describe('FIA Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('getVerseFiaImages', () => {
    it('should fetch and parse FIA images TSV data', async () => {
      const mockTsvData = 'REF\tID\tTAGS\tSUPPORT\tQUOTE\tOCCURENCES\tHREF\n14:1\tea9004e\t\t\t\t\t./payload/t/tar-pit-wide\n14:2\t9cbb0d8\t\t\t\t\t./payload/t/tar-pit-wide';
      
      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockTsvData)
      });

      const result = await getVerseFiaImages('GEN', 14, 1);
      
      expect(fetch).toHaveBeenCalledWith(
        'https://git.door43.org/BurritoTruck/en_fiaimages/raw/branch/master/ingredients/GEN.tsv'
      );
      expect(result).toHaveLength(1);
      expect(result[0].REF).toBe('14:1');
      expect(result[0].HREF).toBe('./payload/t/tar-pit-wide');
    });

    it('should return null when no data for verse', async () => {
      const mockTsvData = 'REF\tID\tTAGS\tSUPPORT\tQUOTE\tOCCURENCES\tHREF\n15:1\tea9004e\t\t\t\t\t./payload/t/tar-pit-wide';
      
      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockTsvData)
      });

      const result = await getVerseFiaImages('GEN', 14, 1);
      
      expect(result).toBeNull();
    });

    it('should handle fetch errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getVerseFiaImages('GEN', 14, 1);
      
      expect(result).toBeNull();
    });

    it('should handle 404 responses gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await getVerseFiaImages('GEN', 14, 1);
      
      expect(result).toBeNull();
    });
  });

  describe('getVerseFiaMaps', () => {
    it('should fetch and parse FIA maps TSV data', async () => {
      const mockTsvData = 'REF\tID\tTAGS\tSUPPORT\tQUOTE\tOCCURENCES\tHREF\n24:62\t9800f44\t\t\t\t\t./payload/h/hebron-canaan-negev-and-beer-lahai-roi';
      
      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockTsvData)
      });

      const result = await getVerseFiaMaps('GEN', 24, 62);
      
      expect(fetch).toHaveBeenCalledWith(
        'https://git.door43.org/BurritoTruck/en_fiamaps/raw/branch/master/ingredients/GEN.tsv'
      );
      expect(result).toHaveLength(1);
      expect(result[0].REF).toBe('24:62');
      expect(result[0].HREF).toBe('./payload/h/hebron-canaan-negev-and-beer-lahai-roi');
    });
  });

  describe('getVerseFiaContent', () => {
    it('should fetch both images and maps', async () => {
      const mockImagesData = 'REF\tID\tHREF\n14:1\tabc\t./payload/image1';
      const mockMapsData = 'REF\tID\tHREF\n14:1\txyz\t./payload/map1';
      
      fetch
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(mockImagesData)
        })
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(mockMapsData)
        });

      const result = await getVerseFiaContent('GEN', 14, 1);
      
      expect(result).toEqual({
        images: [{ REF: '14:1', ID: 'abc', HREF: './payload/image1' }],
        maps: [{ REF: '14:1', ID: 'xyz', HREF: './payload/map1' }],
        hasContent: true
      });
    });

    it('should return null when no content available', async () => {
      fetch
        .mockResolvedValueOnce({ ok: false, status: 404 })
        .mockResolvedValueOnce({ ok: false, status: 404 });

      const result = await getVerseFiaContent('GEN', 14, 1);
      
      expect(result).toBeNull();
    });
  });

  describe('resolveFiaMediaUrl', () => {
    it('should resolve HREF to media URL', () => {
      const href = './payload/t/tar-pit-wide';
      const result = resolveFiaMediaUrl(href, 'images');
      
      expect(result).toBe('https://fia-media-cdn.example.com/images/t/tar-pit-wide.jpg');
    });

    it('should handle different media types', () => {
      const href = './payload/h/hebron-map';
      const result = resolveFiaMediaUrl(href, 'maps');
      
      expect(result).toBe('https://fia-media-cdn.example.com/maps/h/hebron-map.jpg');
    });

    it('should return null for empty href', () => {
      const result = resolveFiaMediaUrl('');
      
      expect(result).toBeNull();
    });
  });
}); 