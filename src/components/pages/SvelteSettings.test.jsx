import { render, waitFor, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SvelteSettings from './SvelteSettings';

beforeAll(() => {
  global.fetch = vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('') }));
});

describe('SvelteSettings', () => {
  it('renders settings page', async () => {
    render(<SvelteSettings />);
    await waitFor(() => document.querySelector('settings-page'));
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });
});