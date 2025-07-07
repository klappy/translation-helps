import Greeter from './Greeter.svelte';

export default {
  title: 'DesignSystem/Greeter',
  component: Greeter,
  argTypes: {
    name: { control: 'text' }
  }
};

export const Default = {
  args: { name: 'Storybook' }
};