import { writable } from 'svelte/store';

const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
const prefersDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;

export const theme = writable(saved || (prefersDark ? 'dark' : 'light'));

theme.subscribe(val => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', val);
    localStorage.setItem('theme', val);
  }
});

export function toggleTheme(){
  theme.update(v => v === 'light' ? 'dark' : 'light');
}