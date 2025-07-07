/**
 * Chat Store - Svelte Port
 * Manages LLM chat state and messages
 */

import { writable } from 'svelte/store';

export const messages = writable([]);
export const currentInput = writable('');
export const isSubmitting = writable(false);
export const sessionCost = writable(0);

export function addMessage(message) {
  messages.update(msgs => [...msgs, message]);
}

export function clearMessages() {
  messages.set([]);
  sessionCost.set(0);
}

export function setSubmitting(status) {
  isSubmitting.set(status);
}

export function updateSessionCost(cost) {
  sessionCost.update(current => current + cost);
}

export const chatStore = {
  messages,
  currentInput,
  isSubmitting,
  sessionCost,
  addMessage,
  clearMessages,
  setSubmitting,
  updateSessionCost
};