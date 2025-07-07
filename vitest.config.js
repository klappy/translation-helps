import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    coverage: {
      reporter: ['text', 'html', 'clover', 'json'],
      include: ['src/**/*.{js,ts,svelte}'],
      exclude: [
        'src/**/*.test.{js,ts}',
        'src/**/*.spec.{js,ts}',
        'src/test/**',
        'src/app.html',
        'src/app.css'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    ui: true,
    reporters: ['verbose', 'html'],
    outputFile: 'test-results.html'
  }
});