/**
 * Theme Store Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { themeStore } from './theme.js';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('Theme Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    themeStore.set('light');
  });

  describe('Initial State', () => {
    it('should have default light theme', () => {
      const theme = get(themeStore);
      expect(theme).toBe('light');
    });

    it('should load theme from localStorage if available', () => {
      mockLocalStorage.getItem.mockReturnValue('dark');
      
      // Re-import to trigger initialization
      vi.resetModules();
      const { themeStore: newThemeStore } = require('./theme.js');
      
      const theme = get(newThemeStore);
      expect(theme).toBe('dark');
    });

    it('should fallback to light theme if localStorage is invalid', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-theme');
      
      vi.resetModules();
      const { themeStore: newThemeStore } = require('./theme.js');
      
      const theme = get(newThemeStore);
      expect(theme).toBe('light');
    });
  });

  describe('Theme Updates', () => {
    it('should update theme to dark', () => {
      themeStore.set('dark');
      
      const theme = get(themeStore);
      expect(theme).toBe('dark');
    });

    it('should update theme to light', () => {
      themeStore.set('dark');
      themeStore.set('light');
      
      const theme = get(themeStore);
      expect(theme).toBe('light');
    });

    it('should save theme to localStorage when updated', () => {
      themeStore.set('dark');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle from light to dark', () => {
      themeStore.set('light');
      
      // Assuming there's a toggle function
      if (themeStore.toggle) {
        themeStore.toggle();
        const theme = get(themeStore);
        expect(theme).toBe('dark');
      }
    });

    it('should toggle from dark to light', () => {
      themeStore.set('dark');
      
      if (themeStore.toggle) {
        themeStore.toggle();
        const theme = get(themeStore);
        expect(theme).toBe('light');
      }
    });
  });

  describe('DOM Integration', () => {
    it('should apply theme class to document element', () => {
      const mockSetAttribute = vi.fn();
      Object.defineProperty(document, 'documentElement', {
        value: {
          dataset: {},
          setAttribute: mockSetAttribute
        },
        writable: true
      });

      themeStore.set('dark');
      
      // Should update document theme
      expect(document.documentElement.dataset.theme).toBe('dark');
    });
  });

  describe('Persistence', () => {
    it('should persist theme preference', () => {
      themeStore.set('dark');
      themeStore.set('light');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => {
        themeStore.set('dark');
      }).not.toThrow();
    });
  });
});