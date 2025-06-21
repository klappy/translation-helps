/**
 * loadResourceForType.test.js
 * Tests for the Resource Type Dispatcher - Simple Verse-Loading Pattern
 * Follows: docs/SIMPLE-VERSE-LOADING-PATTERN.md
 */

import { vi } from 'vitest';
import { loadResourceForType } from './loadResourceForType';

// Mock all the service modules
vi.mock('../services/scriptureService', () => ({
  fetchBookWithFallback: vi.fn(),
}));

vi.mock('../services/tnService', () => ({
  getNotesForVerse: vi.fn(),
  getNotesForVerseWithResourceData: vi.fn(),
}));

vi.mock('../services/tqService', () => ({
  getQuestionsForVerse: vi.fn(),
  getQuestionsForVerseWithResourceData: vi.fn(),
}));

vi.mock('../services/twlService', () => ({
  getLinksForVerse: vi.fn(),
  getLinksForVerseWithResourceData: vi.fn(),
}));

vi.mock('../services/twService', () => ({
  getArticlesForLinks: vi.fn(),
}));

// Import mocked services
import { fetchBookWithFallback } from '../services/scriptureService';
import { getNotesForVerse, getNotesForVerseWithResourceData } from '../services/tnService';
import { getQuestionsForVerse, getQuestionsForVerseWithResourceData } from '../services/tqService';
import { getLinksForVerse, getLinksForVerseWithResourceData } from '../services/twlService';
import { getArticlesForLinks } from '../services/twService';

describe('loadResourceForType - Resource Type Dispatcher', () => {
  const mockReference = { bookId: 'tit', chapter: 1, verse: 1 };
  const mockConfig = { organization: 'unfoldingWord', languageId: 'en', resourceId: 'ult' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Scripture Loading', () => {
    it('loads scripture using fetchBookWithFallback', async () => {
      const mockScripture = '\\c 1\n\\v 1 Paul, a servant of God and an apostle of Jesus Christ';
      fetchBookWithFallback.mockResolvedValue(mockScripture);

      const result = await loadResourceForType('scripture', mockReference, mockConfig);

      expect(fetchBookWithFallback).toHaveBeenCalledWith({
        bookId: 'tit',
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
      });
      expect(result).toBe(mockScripture);
    });

    it('handles scripture loading with cross-organization config', async () => {
      const crossOrgConfig = { organization: 'Door43-Catalog', languageId: 'es', resourceId: 'ust' };
      const mockScripture = '\\c 1\n\\v 1 Pablo, siervo de Dios';
      fetchBookWithFallback.mockResolvedValue(mockScripture);

      const result = await loadResourceForType('scripture', mockReference, crossOrgConfig);

      expect(fetchBookWithFallback).toHaveBeenCalledWith({
        bookId: 'tit',
        organization: 'Door43-Catalog',
        languageId: 'es',
        resourceId: 'ust',
      });
      expect(result).toBe(mockScripture);
    });

    it('handles scripture loading failures gracefully', async () => {
      fetchBookWithFallback.mockRejectedValue(new Error('Scripture not found'));

      const result = await loadResourceForType('scripture', mockReference, mockConfig);

      expect(result).toBeNull();
    });
  });

  describe('Translation Notes Loading', () => {
    it('loads translation notes using verse-specific service', async () => {
      const mockNotes = [
        { id: 1, quote: 'Paul', text: 'This is the Greek name Paulos.' },
        { id: 2, quote: 'servant', text: 'One who serves others.' }
      ];
      getNotesForVerse.mockResolvedValue(mockNotes);

      const result = await loadResourceForType('notes', mockReference, mockConfig);

      expect(getNotesForVerse).toHaveBeenCalledWith('tit', 1, 1, 'unfoldingWord', 'en');
      expect(result).toEqual(mockNotes);
    });

    it('uses resource data version when resource metadata provided', async () => {
      const configWithResource = { 
        ...mockConfig, 
        resourceData: { title: 'Translation Notes', organization: 'unfoldingWord' }
      };
      const mockNotes = [{ id: 1, quote: 'Paul', text: 'Greek name' }];
      getNotesForVerseWithResourceData.mockResolvedValue(mockNotes);

      const result = await loadResourceForType('notes', mockReference, configWithResource);

      expect(getNotesForVerseWithResourceData).toHaveBeenCalledWith(
        'tit', 1, 1, 
        configWithResource.resourceData, 
        'unfoldingWord', 
        'en'
      );
      expect(result).toEqual(mockNotes);
    });

    it('handles cross-organization notes loading', async () => {
      const crossOrgConfig = { organization: 'Door43-Catalog', languageId: 'fr' };
      const mockNotes = [{ id: 1, quote: 'Paul', text: 'Nom grec Paul.' }];
      getNotesForVerse.mockResolvedValue(mockNotes);

      const result = await loadResourceForType('notes', mockReference, crossOrgConfig);

      expect(getNotesForVerse).toHaveBeenCalledWith('tit', 1, 1, 'Door43-Catalog', 'fr');
      expect(result).toEqual(mockNotes);
    });

    it('handles notes loading failures gracefully', async () => {
      getNotesForVerse.mockRejectedValue(new Error('Notes service error'));

      const result = await loadResourceForType('notes', mockReference, mockConfig);

      expect(result).toEqual([]);
    });
  });

  describe('Translation Questions Loading', () => {
    it('loads translation questions using verse-specific service', async () => {
      const mockQuestions = [
        { id: 1, question: 'Who wrote this letter?', answer: 'Paul wrote this letter.' }
      ];
      getQuestionsForVerse.mockResolvedValue(mockQuestions);

      const result = await loadResourceForType('questions', mockReference, mockConfig);

      expect(getQuestionsForVerse).toHaveBeenCalledWith('tit', 1, 1, 'unfoldingWord', 'en');
      expect(result).toEqual(mockQuestions);
    });

    it('uses resource data version when available', async () => {
      const configWithResource = { 
        ...mockConfig, 
        resourceData: { title: 'Translation Questions' }
      };
      const mockQuestions = [{ id: 1, question: 'What is Paul?', answer: 'A servant and apostle.' }];
      getQuestionsForVerseWithResourceData.mockResolvedValue(mockQuestions);

      const result = await loadResourceForType('questions', mockReference, configWithResource);

      expect(getQuestionsForVerseWithResourceData).toHaveBeenCalledWith(
        'tit', 1, 1,
        configWithResource.resourceData,
        'unfoldingWord',
        'en'
      );
      expect(result).toEqual(mockQuestions);
    });

    it('handles questions loading failures gracefully', async () => {
      getQuestionsForVerse.mockRejectedValue(new Error('Questions service error'));

      const result = await loadResourceForType('questions', mockReference, mockConfig);

      expect(result).toEqual([]);
    });
  });

  describe('Translation Word Links Loading', () => {
    it('loads word links using verse-specific service', async () => {
      const mockLinks = [
        { id: 1, rcLink: 'rc://en/tw/dict/bible/names/paul' },
        { id: 2, rcLink: 'rc://en/tw/dict/bible/kt/god' }
      ];
      getLinksForVerse.mockResolvedValue(mockLinks);

      const result = await loadResourceForType('links', mockReference, mockConfig);

      expect(getLinksForVerse).toHaveBeenCalledWith('tit', 1, 1, 'unfoldingWord', 'en');
      expect(result).toEqual(mockLinks);
    });

    it('uses resource data version when available', async () => {
      const configWithResource = { 
        ...mockConfig, 
        resourceData: { title: 'Translation Word Links' }
      };
      const mockLinks = [{ id: 1, rcLink: 'rc://en/tw/dict/bible/kt/servant' }];
      getLinksForVerseWithResourceData.mockResolvedValue(mockLinks);

      const result = await loadResourceForType('links', mockReference, configWithResource);

      expect(getLinksForVerseWithResourceData).toHaveBeenCalledWith(
        'tit', 1, 1,
        configWithResource.resourceData,
        'unfoldingWord',
        'en'
      );
      expect(result).toEqual(mockLinks);
    });

    it('handles links loading failures gracefully', async () => {
      getLinksForVerse.mockRejectedValue(new Error('Links service error'));

      const result = await loadResourceForType('links', mockReference, mockConfig);

      expect(result).toEqual([]);
    });
  });

  describe('Translation Words (Articles) Loading', () => {
    beforeEach(() => {
      // Mock links loading first
      getLinksForVerse.mockResolvedValue([
        'rc://en/tw/dict/bible/names/paul',
        'rc://en/tw/dict/bible/kt/god'
      ]);
    });

    it('loads word articles by first getting links then articles', async () => {
      const mockArticles = [
        { id: 1, title: 'Paul', content: 'Paul was an apostle...', rcUri: 'rc://en/tw/dict/bible/names/paul' },
        { id: 2, title: 'God', content: 'God is the creator...', rcUri: 'rc://en/tw/dict/bible/kt/god' }
      ];
      getArticlesForLinks.mockResolvedValue(mockArticles);

      const result = await loadResourceForType('words', mockReference, mockConfig);

      expect(getLinksForVerse).toHaveBeenCalledWith('tit', 1, 1, 'unfoldingWord', 'en');
      expect(getArticlesForLinks).toHaveBeenCalledWith([
        'rc://en/tw/dict/bible/names/paul',
        'rc://en/tw/dict/bible/kt/god'
      ], 'en', 'unfoldingWord');
      expect(result).toEqual(mockArticles);
    });

    it('handles empty links gracefully', async () => {
      getLinksForVerse.mockResolvedValue([]);
      getArticlesForLinks.mockResolvedValue([]);

      const result = await loadResourceForType('words', mockReference, mockConfig);

      expect(getLinksForVerse).toHaveBeenCalled();
      expect(getArticlesForLinks).toHaveBeenCalledWith([], 'en', 'unfoldingWord');
      expect(result).toEqual([]);
    });

    it('handles words loading failures gracefully', async () => {
      getLinksForVerse.mockResolvedValue(['rc://en/tw/dict/bible/kt/god']);
      getArticlesForLinks.mockRejectedValue(new Error('Articles service error'));

      const result = await loadResourceForType('words', mockReference, mockConfig);

      expect(result).toEqual([]);
    });

    it('handles links loading failure in words', async () => {
      getLinksForVerse.mockRejectedValue(new Error('Links failed'));

      const result = await loadResourceForType('words', mockReference, mockConfig);

      expect(result).toEqual([]);
    });
  });

  describe('Unknown Resource Types', () => {
    it('returns null for unknown resource types', async () => {
      const result = await loadResourceForType('unknown', mockReference, mockConfig);

      expect(result).toBeNull();
    });

    it('handles null reference gracefully', async () => {
      const result = await loadResourceForType('scripture', null, mockConfig);

      expect(result).toBeNull();
    });

    it('handles null config gracefully with defaults', async () => {
      fetchBookWithFallback.mockResolvedValue('\\c 1\n\\v 1 Mock text');

      const result = await loadResourceForType('scripture', mockReference, null);

      expect(fetchBookWithFallback).toHaveBeenCalledWith({
        bookId: 'tit',
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
      });
      expect(result).toBe('\\c 1\n\\v 1 Mock text');
    });
  });

  describe('Configuration Defaults', () => {
    it('applies default organization when not specified', async () => {
      const minimalConfig = { languageId: 'en' };
      fetchBookWithFallback.mockResolvedValue('\\c 1\n\\v 1 Test');

      await loadResourceForType('scripture', mockReference, minimalConfig);

      expect(fetchBookWithFallback).toHaveBeenCalledWith(
        expect.objectContaining({
          organization: 'unfoldingWord',
        })
      );
    });

    it('applies default language when not specified', async () => {
      const minimalConfig = { organization: 'Door43-Catalog' };
      fetchBookWithFallback.mockResolvedValue('\\c 1\n\\v 1 Test');

      await loadResourceForType('scripture', mockReference, minimalConfig);

      expect(fetchBookWithFallback).toHaveBeenCalledWith(
        expect.objectContaining({
          languageId: 'en',
        })
      );
    });

    it('applies default scripture resource when not specified', async () => {
      const minimalConfig = { organization: 'unfoldingWord', languageId: 'en' };
      fetchBookWithFallback.mockResolvedValue('\\c 1\n\\v 1 Test');

      await loadResourceForType('scripture', mockReference, minimalConfig);

      expect(fetchBookWithFallback).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceId: 'ult',
        })
      );
    });
  });

  describe('Cross-Organization Resource Loading', () => {
    it('handles mixed organization configurations correctly', async () => {
      const scriptureConfig = { organization: 'unfoldingWord', languageId: 'en', resourceId: 'ult' };
      const notesConfig = { organization: 'Door43-Catalog', languageId: 'es' };
      
      fetchBookWithFallback.mockResolvedValue('\\c 1\n\\v 1 English text');
      getNotesForVerse.mockResolvedValue([{ id: 1, text: 'Spanish note' }]);

      const scriptureResult = await loadResourceForType('scripture', mockReference, scriptureConfig);
      const notesResult = await loadResourceForType('notes', mockReference, notesConfig);

      expect(fetchBookWithFallback).toHaveBeenCalledWith({
        bookId: 'tit',
        organization: 'unfoldingWord',
        languageId: 'en',
        resourceId: 'ult',
      });

      expect(getNotesForVerse).toHaveBeenCalledWith('tit', 1, 1, 'Door43-Catalog', 'es');

      expect(scriptureResult).toBe('\\c 1\n\\v 1 English text');
      expect(notesResult).toEqual([{ id: 1, text: 'Spanish note' }]);
    });
  });
}); 