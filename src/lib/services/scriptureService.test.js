/**
 * Scripture Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadScripture, extractVerseText, parseUSFM } from './scriptureService.js';
import * as dcsClient from './dcsClient.js';

// Mock the DCS client
vi.mock('./dcsClient.js', () => ({
  fetchResourceFile: vi.fn(),
  fetchManifest: vi.fn()
}));

describe('Scripture Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadScripture', () => {
    it('should load scripture successfully', async () => {
      const mockUSFM = '\\c 1\n\\v 1 In the beginning God created the heavens and the earth.';
      
      dcsClient.fetchResourceFile.mockResolvedValueOnce(mockUSFM);

      const result = await loadScripture({
        bookId: 'gen',
        chapter: 1,
        verse: 1
      }, {
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult'
      });

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        'unfoldingWord',
        'en',
        'ult',
        'gen',
        expect.stringContaining('.usfm')
      );
      expect(result).toContain('In the beginning God created');
    });

    it('should handle cross-organization loading', async () => {
      const mockUSFM = '\\c 1\n\\v 1 En el principio creó Dios los cielos y la tierra.';
      
      dcsClient.fetchResourceFile.mockResolvedValueOnce(mockUSFM);

      const result = await loadScripture({
        bookId: 'gen',
        chapter: 1,
        verse: 1
      }, {
        organization: 'Door43-Catalog',
        languageId: 'es',
        resourceId: 'ust'
      });

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        'Door43-Catalog',
        'es',
        'ust',
        'gen',
        expect.stringContaining('.usfm')
      );
      expect(result).toContain('En el principio creó Dios');
    });

    it('should handle different book formats', async () => {
      const mockUSFM = '\\c 3\n\\v 16 For God so loved the world.';
      
      dcsClient.fetchResourceFile.mockResolvedValueOnce(mockUSFM);

      await loadScripture({
        bookId: 'jhn',
        chapter: 3,
        verse: 16
      }, {
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult'
      });

      expect(dcsClient.fetchResourceFile).toHaveBeenCalledWith(
        'unfoldingWord',
        'en',
        'ult',
        'jhn',
        expect.stringContaining('.usfm')
      );
    });

    it('should handle loading errors gracefully', async () => {
      dcsClient.fetchResourceFile.mockRejectedValueOnce(new Error('File not found'));

      await expect(loadScripture({
        bookId: 'gen',
        chapter: 1,
        verse: 1
      }, {
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult'
      })).rejects.toThrow('File not found');
    });
  });

  describe('extractVerseText', () => {
    it('should extract single verse text', () => {
      const usfm = '\\c 1\n\\v 1 In the beginning God created the heavens and the earth.\n\\v 2 Now the earth was formless and empty.';
      
      const result = extractVerseText(usfm, 1, 1);
      
      expect(result).toBe('In the beginning God created the heavens and the earth.');
    });

    it('should extract verse from different chapters', () => {
      const usfm = '\\c 1\n\\v 1 Chapter 1 verse 1\n\\c 2\n\\v 1 Chapter 2 verse 1';
      
      const result = extractVerseText(usfm, 2, 1);
      
      expect(result).toBe('Chapter 2 verse 1');
    });

    it('should handle verses with multiple parts', () => {
      const usfm = '\\c 1\n\\v 1 In the beginning \\add God\\add* created the heavens and the earth.';
      
      const result = extractVerseText(usfm, 1, 1);
      
      expect(result).toBe('In the beginning God created the heavens and the earth.');
    });

    it('should handle missing verses gracefully', () => {
      const usfm = '\\c 1\n\\v 1 First verse\n\\v 3 Third verse';
      
      const result = extractVerseText(usfm, 1, 2);
      
      expect(result).toBe(''); // Should return empty string for missing verse
    });

    it('should handle missing chapters gracefully', () => {
      const usfm = '\\c 1\n\\v 1 First verse';
      
      const result = extractVerseText(usfm, 2, 1);
      
      expect(result).toBe(''); // Should return empty string for missing chapter
    });
  });

  describe('parseUSFM', () => {
    it('should parse basic USFM structure', () => {
      const usfm = '\\c 1\n\\v 1 First verse\n\\v 2 Second verse';
      
      const result = parseUSFM(usfm);
      
      expect(result).toHaveProperty('chapters');
      expect(result.chapters).toHaveProperty('1');
      expect(result.chapters['1']).toHaveProperty('verses');
      expect(result.chapters['1'].verses).toHaveProperty('1');
      expect(result.chapters['1'].verses['1']).toBe('First verse');
    });

    it('should handle multiple chapters', () => {
      const usfm = '\\c 1\n\\v 1 Chapter 1\n\\c 2\n\\v 1 Chapter 2';
      
      const result = parseUSFM(usfm);
      
      expect(result.chapters).toHaveProperty('1');
      expect(result.chapters).toHaveProperty('2');
      expect(result.chapters['2'].verses['1']).toBe('Chapter 2');
    });

    it('should handle USFM formatting tags', () => {
      const usfm = '\\c 1\n\\v 1 In the \\add beginning\\add* God \\nd Lord\\nd* created.';
      
      const result = parseUSFM(usfm);
      
      expect(result.chapters['1'].verses['1']).toBe('In the beginning God Lord created.');
    });

    it('should handle section headings', () => {
      const usfm = '\\c 1\n\\s Creation\n\\v 1 In the beginning God created.';
      
      const result = parseUSFM(usfm);
      
      expect(result.chapters['1']).toHaveProperty('heading');
      expect(result.chapters['1'].heading).toBe('Creation');
    });

    it('should handle paragraph markers', () => {
      const usfm = '\\c 1\n\\p\n\\v 1 In the beginning God created.';
      
      const result = parseUSFM(usfm);
      
      expect(result.chapters['1'].verses['1']).toBe('In the beginning God created.');
    });

    it('should handle footnotes', () => {
      const usfm = '\\c 1\n\\v 1 In the beginning\\f + \\ft footnote text\\f* God created.';
      
      const result = parseUSFM(usfm);
      
      expect(result.chapters['1'].verses['1']).toBe('In the beginning God created.');
      expect(result.chapters['1'].verses['1-footnotes']).toContain('footnote text');
    });

    it('should handle cross-references', () => {
      const usfm = '\\c 1\n\\v 1 In the beginning\\x + \\xo 1:1 \\xt Gen 2:4\\x* God created.';
      
      const result = parseUSFM(usfm);
      
      expect(result.chapters['1'].verses['1']).toBe('In the beginning God created.');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed USFM', () => {
      const malformedUSFM = 'Not valid USFM content';
      
      expect(() => parseUSFM(malformedUSFM)).not.toThrow();
    });

    it('should handle empty USFM', () => {
      const emptyUSFM = '';
      
      expect(() => parseUSFM(emptyUSFM)).not.toThrow();
    });

    it('should handle USFM with only chapter markers', () => {
      const usfm = '\\c 1\n\\c 2\n\\c 3';
      
      const result = parseUSFM(usfm);
      
      expect(result.chapters).toHaveProperty('1');
      expect(result.chapters).toHaveProperty('2');
      expect(result.chapters).toHaveProperty('3');
    });
  });

  describe('Performance', () => {
    it('should handle large USFM files efficiently', () => {
      const largeUSFM = Array.from({ length: 1000 }, (_, i) => 
        `\\c ${i + 1}\n\\v 1 Chapter ${i + 1} verse 1`
      ).join('\n');
      
      const start = performance.now();
      const result = parseUSFM(largeUSFM);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should parse within 100ms
      expect(Object.keys(result.chapters)).toHaveLength(1000);
    });
  });
});