import { mergeConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

/** @type { import('@storybook/svelte-vite').StorybookConfig } */
const config = {
  stories: [
    '../svelte-poc/src/**/*.stories.@(js|jsx|ts|tsx|svelte)'
  ],
  addons: [
    '@storybook/addon-essentials'
  ],
  framework: {
    name: '@storybook/svelte-vite',
    options: {}
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [svelte({ compilerOptions: { customElement: true } })]
    });
  }
};
export default config;