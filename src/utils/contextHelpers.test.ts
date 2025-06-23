/**
 * Tests for contextHelpers with new URL format
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateQueryFromContext, contextFromQuery, buildResourcePath } from './contextHelpers';

// Mock window.history.pushState
const mockPushState = vi.fn();
Object.defineProperty(window, 'history', {
  value: {
    pushState: mockPushState,
  },
  writable: true,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/',
    search: '',
  },
  writable: true,
});

describe('contextHelpers - New URL Format', () => {
  beforeEach(() => {
    mockPushState.mockClear();
    window.location.search = '';
  });

  describe('buildResourcePath', () => {
    it('should build resource path without reference', () => {
      const resource = {
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult'
      };
      
      const path = buildResourcePath(resource, false);
      expect(path).toBe('/unfoldingWord/en/ult');
    });

    it('should build resource path with reference', () => {
      const resource = {
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
        bookId: 'tit',
        chapter: '1',
        verse: '1'
      };
      
      const path = buildResourcePath(resource, true);
      expect(path).toBe('/unfoldingWord/en/ult/tit/1/1');
    });
  });

  describe('updateQueryFromContext - New Format', () => {
    it('should create new format URL with scriptures and resources', () => {
      const context = {
        reference: { bookId: 'tit', chapter: '1', verse: '1' },
        scriptures: ['/unfoldingWord/en/ult/tit/1/1'],
        resources: ['/Door43-Catalog/es/tn/', '/unfoldingWord/fr/tq/']
      };

      updateQueryFromContext(context);

      expect(mockPushState).toHaveBeenCalledWith(
        context,
        null,
        '/?scriptures=[/unfoldingWord/en/ult/tit/1/1]&resources=[/Door43-Catalog/es/tn/,/unfoldingWord/fr/tq/]'
      );
    });

    it('should fall back to legacy format when no new format data', () => {
      const context = {
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
        reference: { bookId: 'tit', chapter: '1', verse: '1' },
        scriptures: [], // Empty array triggers legacy format
        resources: []
      };

      updateQueryFromContext(context);

      expect(mockPushState).toHaveBeenCalledWith(
        context,
        null,
        '/?owner=unfoldingWord&rc=/en/ult/tit/1/1'
      );
    });
  });

  describe('contextFromQuery - New Format', () => {
    it('should parse new format URL with scriptures and resources', () => {
      window.location.search = '?scriptures=[/unfoldingWord/en/ult/tit/1/1]&resources=[/Door43-Catalog/es/tn/,/unfoldingWord/fr/tq/]';

      const context = contextFromQuery();

      expect(context).toEqual({
        hasUrlParams: true,
        isNewFormat: true,
        reference: { bookId: 'tit', chapter: 1, verse: 1 },
        scriptures: ['/unfoldingWord/en/ult/tit/1/1'],
        resources: ['/Door43-Catalog/es/tn/', '/unfoldingWord/fr/tq/'],
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult'
      });
    });

    it('should fall back to legacy format parsing', () => {
      window.location.search = '?owner=unfoldingWord&rc=/en/ult/tit/1/1';

      const context = contextFromQuery();

      expect(context).toEqual({
        hasUrlParams: true,
        isNewFormat: false,
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
        reference: { bookId: 'tit', chapter: 1, verse: 1 },
        scriptures: [],
        resources: []
      });
    });

    it('should handle empty URL parameters', () => {
      window.location.search = '';

      const context = contextFromQuery();

      expect(context).toEqual({
        hasUrlParams: false,
        isNewFormat: false,
        organization: null,
        languageId: null,
        resourceId: null,
        reference: { bookId: null, chapter: null, verse: null },
        scriptures: [],
        resources: []
      });
    });
  });
});

describe('contextHelpers - Legacy Format', () => {
  beforeEach(() => {
    mockPushState.mockClear();
    window.location.search = '';
  });

  it('should maintain backward compatibility with legacy URLs', () => {
    window.location.search = '?owner=Door43-Catalog&rc=/es/tn/gen/1/1';

    const context = contextFromQuery();

    expect(context.organization).toBe('Door43-Catalog');
    expect(context.languageId).toBe('es');
    expect(context.resourceId).toBe('tn');
    expect(context.reference).toEqual({
      bookId: 'gen',
      chapter: 1,
      verse: 1
    });
    expect(context.isNewFormat).toBe(false);
  });

  it('should parse chapter and verse as integers to prevent string concatenation bug', () => {
    window.location.search = '?owner=unfoldingWord&rc=/en/ult/tit/4/1';

    const context = contextFromQuery();

    expect(context.reference.chapter).toBe(4);
    expect(context.reference.verse).toBe(1);
    expect(typeof context.reference.chapter).toBe('number');
    expect(typeof context.reference.verse).toBe('number');
  });

  it('should handle new format integer parsing correctly', () => {
    window.location.search = '?scriptures=[/unfoldingWord/en/ult/tit/4/1]';

    const context = contextFromQuery();

    expect(context.reference.chapter).toBe(4);
    expect(context.reference.verse).toBe(1);
    expect(typeof context.reference.chapter).toBe('number');
    expect(typeof context.reference.verse).toBe('number');
  });

  it('should prevent the 4:1 -> 41 navigation bug', () => {
    // Test the specific case that was causing the bug
    window.location.search = '?owner=unfoldingWord&rc=/en/ult/tit/4/1';

    const context = contextFromQuery();

    // Simulate chapter navigation logic
    const currentChapter = parseInt(context.reference.chapter, 10) || 1;
    const nextChapter = currentChapter + 1;

    expect(currentChapter).toBe(4);
    expect(nextChapter).toBe(5); // Should be 5, not 41
    expect(nextChapter.toString()).toBe('5'); // Ensure it stringifies correctly
  });
}); 