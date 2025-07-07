import { render, waitFor, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SvelteAuth from './SvelteAuth';

beforeAll(() => {
  global.fetch = vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('') }));
});

describe('SvelteAuth', () => {
  it('renders auth page', async () => {
    render(<SvelteAuth />);
    await waitFor(() => document.querySelector('auth-page'));
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
});