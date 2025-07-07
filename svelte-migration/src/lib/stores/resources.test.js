/**
 * Resources Store Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { resourcesStore } from './resources.js';

describe('Resources Store', () => {
  beforeEach(() => {
    resourcesStore.reset();
  });

  describe('Initial State', () => {
    it('should have default empty state', () => {
      const state = get(resourcesStore);
      
      expect(state.resources).toEqual({
        scripture: null,
        notes: [],
        questions: [],
        words: [],
        links: []
      });
      expect(state.loading).toEqual({
        scripture: false,
        notes: false,
        questions: false,
        words: false,
        links: false
      });
      expect(state.errors).toEqual({
        scripture: null,
        notes: null,
        questions: null,
        words: null,
        links: null
      });
    });
  });

  describe('Resource Updates', () => {
    it('should update scripture resource', () => {
      const scriptureData = {
        text: 'In the beginning God created the heavens and the earth.',
        reference: { bookId: 'gen', chapter: 1, verse: 1 }
      };

      resourcesStore.updateResource('scripture', scriptureData);

      const state = get(resourcesStore);
      expect(state.resources.scripture).toEqual(scriptureData);
    });

    it('should update notes resource', () => {
      const notesData = [
        { id: 1, quote: 'test', note: 'This is a test note' }
      ];

      resourcesStore.updateResource('notes', notesData);

      const state = get(resourcesStore);
      expect(state.resources.notes).toEqual(notesData);
    });

    it('should update questions resource', () => {
      const questionsData = [
        { id: 1, question: 'What is this?', answer: 'This is a test.' }
      ];

      resourcesStore.updateResource('questions', questionsData);

      const state = get(resourcesStore);
      expect(state.resources.questions).toEqual(questionsData);
    });

    it('should update words resource', () => {
      const wordsData = [
        { id: 1, title: 'Test Word', content: 'This is a test word.' }
      ];

      resourcesStore.updateResource('words', wordsData);

      const state = get(resourcesStore);
      expect(state.resources.words).toEqual(wordsData);
    });

    it('should update links resource', () => {
      const linksData = [
        { id: 1, rcLink: 'rc://*/tw/dict/bible/kt/test' }
      ];

      resourcesStore.updateResource('links', linksData);

      const state = get(resourcesStore);
      expect(state.resources.links).toEqual(linksData);
    });
  });

  describe('Loading States', () => {
    it('should set loading state for resource', () => {
      resourcesStore.setLoading('scripture', true);

      const state = get(resourcesStore);
      expect(state.loading.scripture).toBe(true);
    });

    it('should clear loading state for resource', () => {
      resourcesStore.setLoading('scripture', true);
      resourcesStore.setLoading('scripture', false);

      const state = get(resourcesStore);
      expect(state.loading.scripture).toBe(false);
    });

    it('should handle multiple loading states', () => {
      resourcesStore.setLoading('scripture', true);
      resourcesStore.setLoading('notes', true);

      const state = get(resourcesStore);
      expect(state.loading.scripture).toBe(true);
      expect(state.loading.notes).toBe(true);
      expect(state.loading.questions).toBe(false);
    });
  });

  describe('Error States', () => {
    it('should set error for resource', () => {
      const errorMessage = 'Failed to load scripture';
      resourcesStore.setError('scripture', errorMessage);

      const state = get(resourcesStore);
      expect(state.errors.scripture).toBe(errorMessage);
    });

    it('should clear error for resource', () => {
      resourcesStore.setError('scripture', 'Error');
      resourcesStore.setError('scripture', null);

      const state = get(resourcesStore);
      expect(state.errors.scripture).toBeNull();
    });

    it('should handle multiple error states', () => {
      resourcesStore.setError('scripture', 'Scripture error');
      resourcesStore.setError('notes', 'Notes error');

      const state = get(resourcesStore);
      expect(state.errors.scripture).toBe('Scripture error');
      expect(state.errors.notes).toBe('Notes error');
      expect(state.errors.questions).toBeNull();
    });
  });

  describe('Resource Configuration', () => {
    it('should get resource configuration for specific type', () => {
      // This should be implemented in the resources store
      expect(resourcesStore.getResourceConfig).toBeDefined();
    });

    it('should handle cross-organization resource loading', () => {
      const config = {
        organization: 'Door43-Catalog',
        languageId: 'es',
        resourceId: 'ust'
      };

      // This functionality should be available
      expect(typeof resourcesStore.loadResources).toBe('function');
    });
  });

  describe('Store Reset', () => {
    it('should reset all resources to initial state', () => {
      // Set some data
      resourcesStore.updateResource('scripture', { text: 'Test' });
      resourcesStore.setLoading('notes', true);
      resourcesStore.setError('questions', 'Error');

      // Reset
      resourcesStore.reset();

      const state = get(resourcesStore);
      expect(state.resources.scripture).toBeNull();
      expect(state.loading.notes).toBe(false);
      expect(state.errors.questions).toBeNull();
    });
  });

  describe('Derived Stores', () => {
    it('should provide access to specific resources', () => {
      const scriptureData = { text: 'Test scripture' };
      resourcesStore.updateResource('scripture', scriptureData);

      // Should have derived stores for easy access
      expect(resourcesStore.scripture).toBeDefined();
      expect(resourcesStore.notes).toBeDefined();
      expect(resourcesStore.questions).toBeDefined();
      expect(resourcesStore.words).toBeDefined();
      expect(resourcesStore.links).toBeDefined();
    });
  });
});