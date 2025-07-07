/**
 * Chat Store Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { chatStore } from './chat.js';

describe('Chat Store', () => {
  beforeEach(() => {
    chatStore.reset();
  });

  describe('Initial State', () => {
    it('should have default empty state', () => {
      const state = get(chatStore);
      
      expect(state.messages).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Message Management', () => {
    it('should add user message', () => {
      const userMessage = {
        id: '1',
        role: 'user',
        content: 'Hello, what does this verse mean?',
        timestamp: new Date().toISOString()
      };

      chatStore.addMessage(userMessage);

      const state = get(chatStore);
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0]).toEqual(userMessage);
    });

    it('should add assistant message', () => {
      const assistantMessage = {
        id: '2',
        role: 'assistant',
        content: 'This verse means...',
        timestamp: new Date().toISOString()
      };

      chatStore.addMessage(assistantMessage);

      const state = get(chatStore);
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0]).toEqual(assistantMessage);
    });

    it('should maintain message order', () => {
      const message1 = {
        id: '1',
        role: 'user',
        content: 'First message',
        timestamp: new Date().toISOString()
      };

      const message2 = {
        id: '2',
        role: 'assistant',
        content: 'Second message',
        timestamp: new Date().toISOString()
      };

      chatStore.addMessage(message1);
      chatStore.addMessage(message2);

      const state = get(chatStore);
      expect(state.messages).toHaveLength(2);
      expect(state.messages[0]).toEqual(message1);
      expect(state.messages[1]).toEqual(message2);
    });

    it('should clear all messages', () => {
      chatStore.addMessage({
        id: '1',
        role: 'user',
        content: 'Test message',
        timestamp: new Date().toISOString()
      });

      chatStore.clearMessages();

      const state = get(chatStore);
      expect(state.messages).toHaveLength(0);
    });
  });

  describe('Loading States', () => {
    it('should set loading state', () => {
      chatStore.setLoading(true);

      const state = get(chatStore);
      expect(state.loading).toBe(true);
    });

    it('should clear loading state', () => {
      chatStore.setLoading(true);
      chatStore.setLoading(false);

      const state = get(chatStore);
      expect(state.loading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should set error state', () => {
      const errorMessage = 'Failed to send message';
      chatStore.setError(errorMessage);

      const state = get(chatStore);
      expect(state.error).toBe(errorMessage);
    });

    it('should clear error state', () => {
      chatStore.setError('Error');
      chatStore.setError(null);

      const state = get(chatStore);
      expect(state.error).toBeNull();
    });
  });

  describe('Chat Reset', () => {
    it('should reset chat to initial state', () => {
      chatStore.addMessage({
        id: '1',
        role: 'user',
        content: 'Test',
        timestamp: new Date().toISOString()
      });
      chatStore.setLoading(true);
      chatStore.setError('Error');

      chatStore.reset();

      const state = get(chatStore);
      expect(state.messages).toHaveLength(0);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Message Validation', () => {
    it('should validate message format', () => {
      const invalidMessage = {
        // Missing required fields
        content: 'Test message'
      };

      expect(() => {
        chatStore.addMessage(invalidMessage);
      }).not.toThrow(); // Should handle gracefully
    });

    it('should generate ID if not provided', () => {
      const message = {
        role: 'user',
        content: 'Test message'
      };

      chatStore.addMessage(message);

      const state = get(chatStore);
      expect(state.messages[0].id).toBeDefined();
    });

    it('should add timestamp if not provided', () => {
      const message = {
        id: '1',
        role: 'user',
        content: 'Test message'
      };

      chatStore.addMessage(message);

      const state = get(chatStore);
      expect(state.messages[0].timestamp).toBeDefined();
    });
  });
});