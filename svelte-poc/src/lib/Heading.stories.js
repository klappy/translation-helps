import Heading from './Heading.svelte';

export default {
  title: 'DesignSystem/Heading',
  component: Heading,
  argTypes: {
    level: { control: { type: 'number', min: 1, max: 6 } },
    text: { control: 'text' }
  }
};

export const H1 = { args: { level: 1, text: 'Heading 1' } };
export const H2 = { args: { level: 2, text: 'Heading 2' } };