/**
 * SplashScreen.test.jsx
 * Tests for the SplashScreen component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SplashScreen } from './SplashScreen';

// Mock fetch for splash content
global.fetch = vi.fn(() =>
  Promise.resolve({
    text: () => Promise.resolve(`
# ETEN Innovation Lab Translation Helps

## Welcome to the Future of Bible Translation

### Key Features

#### 📖 Scripture Panel
View Bible text

#### 📝 Translation Notes
Access detailed explanations
    `)
  })
);

describe('SplashScreen', () => {
  it('renders without crashing', async () => {
    render(<SplashScreen />);
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/Translation Helps/i)).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<SplashScreen />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('loads and displays content from markdown', async () => {
    render(<SplashScreen />);
    
    await waitFor(() => {
      expect(screen.getByText(/Translation Helps/i)).toBeInTheDocument();
    });
  });

  it('calls onComplete when continue button is clicked', async () => {
    const mockOnComplete = vi.fn();
    render(<SplashScreen onComplete={mockOnComplete} />);
    
    await waitFor(() => {
      const continueButton = screen.getByText(/Begin Exploring/i);
      expect(continueButton).toBeInTheDocument();
    });

    const continueButton = screen.getByText(/Begin Exploring/i);
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('calls onComplete when skip button is clicked', async () => {
    const mockOnComplete = vi.fn();
    render(<SplashScreen onComplete={mockOnComplete} />);
    
    // Wait for content to load first
    await waitFor(() => {
      expect(screen.getByText(/Skip intro/i)).toBeInTheDocument();
    });
    
    const skipButton = screen.getByText(/Skip intro/i);
    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('renders in both light and dark themes', async () => {
    // Test dark theme
    document.documentElement.setAttribute('data-theme', 'dark');
    const { rerender } = render(<SplashScreen />);
    
    await waitFor(() => {
      expect(screen.getByText(/Translation Helps/i)).toBeInTheDocument();
    });

    // Test light theme
    document.documentElement.setAttribute('data-theme', 'light');
    rerender(<SplashScreen />);
    
    await waitFor(() => {
      expect(screen.getByText(/Translation Helps/i)).toBeInTheDocument();
    });
  });
});
