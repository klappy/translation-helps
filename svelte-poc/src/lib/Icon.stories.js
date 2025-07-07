import Icon from './Icon.svelte';
import HomeIcon from 'svelte-heroicons/solid/Home.svelte';

export default {
  title: 'DesignSystem/Icon',
  component: Icon,
  argTypes: {
    size: { control: { type: 'number', min: 16, max: 64 } }
  }
};

export const Home = {
  args: { icon: HomeIcon, size: 32 }
};