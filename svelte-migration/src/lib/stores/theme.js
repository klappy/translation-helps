/**
 * Theme Store - Svelte Port
 * Manages theme state (light/dark mode)
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const isDark = writable(true); // Default to dark mode like the React app

export function initializeTheme() {
  if (!browser) return;
  
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  const isThemeDark = theme === 'dark';
  isDark.set(isThemeDark);
  document.documentElement.setAttribute('data-theme', theme);
}

export function toggleTheme() {
  if (!browser) return;
  
  isDark.update(current => {
    const newTheme = current ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    return !current;
  });
}

export const themeStore = {
  isDark,
  initializeTheme,
  toggleTheme
};