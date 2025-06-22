/**
 * LoadingSpinner.test.jsx
 * Test suite for LoadingSpinner components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner, LoadingOverlay, LoadingCard } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading...');
  });

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Loading content..." />);
    
    expect(screen.getByText('Loading content...')).toBeInTheDocument();
  });

  it('renders with custom aria-label', () => {
    render(<LoadingSpinner aria-label="Custom loading message" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Custom loading message');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(document.querySelector('.small')).toBeInTheDocument();

    rerender(<LoadingSpinner size="large" />);
    expect(document.querySelector('.large')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<LoadingSpinner variant="primary" />);
    expect(document.querySelector('.primary')).toBeInTheDocument();

    rerender(<LoadingSpinner variant="secondary" />);
    expect(document.querySelector('.secondary')).toBeInTheDocument();
  });
});

describe('LoadingOverlay', () => {
  it('shows overlay when visible', () => {
    render(
      <LoadingOverlay isVisible={true} text="Loading...">
        <div>Content</div>
      </LoadingOverlay>
    );
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('hides overlay when not visible', () => {
    render(
      <LoadingOverlay isVisible={false} text="Loading...">
        <div>Content</div>
      </LoadingOverlay>
    );
    
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

describe('LoadingCard', () => {
  it('renders with default text', () => {
    render(<LoadingCard />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading content...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<LoadingCard text="Custom loading message" />);
    
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  it('applies custom height', () => {
    render(<LoadingCard height="300px" />);
    
    const card = document.querySelector('.loadingCard');
    expect(card).toHaveStyle({ minHeight: '300px' });
  });
}); 