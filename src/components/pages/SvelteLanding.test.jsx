import { render, waitFor, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SvelteLanding from './SvelteLanding';

beforeAll(() => {
  global.fetch = vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('') }));
});

describe('SvelteLanding', () => {
  it('renders landing page custom element', async () => {
    render(<SvelteLanding />);
    await waitFor(() => document.querySelector('landing-page'));
    expect(document.querySelector('landing-page')).not.toBeNull();
  });
  it('contains heading text', async () => {
    render(<SvelteLanding />);
    await waitFor(() => screen.getByRole('heading', { name: /translation helps/i }));
  });
});