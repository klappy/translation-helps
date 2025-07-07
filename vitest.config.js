import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.js'],
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