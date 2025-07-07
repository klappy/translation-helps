import ThemeToggle from './ThemeToggle.svelte';

/** @type { import('@storybook/svelte').Meta } */
const meta = {
  title: 'DesignSystem/ThemeToggle',
  component: ThemeToggle
};
export default meta;

export const Default = {
  render: () => ({ Component: ThemeToggle })
};