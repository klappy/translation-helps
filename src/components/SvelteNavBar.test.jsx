import { render, waitFor } from '@testing-library/react';
import SvelteNavBar from './SvelteNavBar';
import { describe, it, expect, vi } from 'vitest';

beforeAll(() => {
  global.fetch = vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('') }));
});

describe('SvelteNavBar', () => {
  it('mounts nav bar custom element', async () => {
    render(<SvelteNavBar />);
    await waitFor(() => document.querySelector('svelte-nav-bar'));
    expect(document.querySelector('svelte-nav-bar')).not.toBeNull();
  });
});