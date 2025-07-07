import { render, screen, waitFor } from '@testing-library/react';
import SvelteGreeterDemo from './SvelteGreeterDemo';
import { describe, it, expect } from 'vitest';

// Mock dynamic script injection to avoid network hit in unit test
beforeAll(() => {
  global.fetch = vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('') }));
});

describe('SvelteGreeterDemo', () => {
  it('renders greeter custom element', async () => {
    render(<SvelteGreeterDemo />);
    // Wait for custom element added to DOM
    await waitFor(() => expect(document.querySelector('svelte-greeter')).not.toBeNull());
    const heading = screen.getByRole('heading', { name: /react hosts svelte greeter/i });
    expect(heading).toBeInTheDocument();
  });
});