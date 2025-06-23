/**
 * SplashScreen.test.jsx
 * Tests for the interactive slideshow SplashScreen component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SplashScreen } from './SplashScreen';

describe('SplashScreen Slideshow', () => {
  it('renders without crashing', () => {
    render(<SplashScreen />);
    expect(screen.getByText(/Translation Helps/i)).toBeInTheDocument();
  });

  it('shows the first slide by default', () => {
    render(<SplashScreen />);
    expect(screen.getByText(/Proving the "Impossible"/i)).toBeInTheDocument();
    expect(screen.getByText(/Begin Journey/i)).toBeInTheDocument();
  });

  it('navigates to next slide when clicking next button', async () => {
    render(<SplashScreen />);
    
    const nextButton = screen.getByText(/Begin Journey/i);
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Aquifer Reference Implementation/i)).toBeInTheDocument();
    });
  });

  it('navigates using arrow buttons', async () => {
    render(<SplashScreen />);
    
    // Click Begin Journey to go to second slide
    fireEvent.click(screen.getByText(/Begin Journey/i));
    
    await waitFor(() => {
      expect(screen.getByText(/Aquifer Reference Implementation/i)).toBeInTheDocument();
    });

    // Find and click the next arrow button
    const nextArrow = screen.getByLabelText(/Next slide/i);
    fireEvent.click(nextArrow);

    await waitFor(() => {
      expect(screen.getByText(/They Said Flat Files Were Dead/i)).toBeInTheDocument();
    });

    // Find and click the previous arrow button
    const prevArrow = screen.getByLabelText(/Previous slide/i);
    fireEvent.click(prevArrow);

    await waitFor(() => {
      expect(screen.getByText(/Aquifer Reference Implementation/i)).toBeInTheDocument();
    });
  });

  it('navigates using keyboard', async () => {
    render(<SplashScreen />);
    
    // Press right arrow
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(screen.getByText(/Aquifer Reference Implementation/i)).toBeInTheDocument();
    });

    // Press space
    fireEvent.keyDown(window, { key: ' ' });

    await waitFor(() => {
      expect(screen.getByText(/They Said Flat Files Were Dead/i)).toBeInTheDocument();
    });

    // Press left arrow
    fireEvent.keyDown(window, { key: 'ArrowLeft' });

    await waitFor(() => {
      expect(screen.getByText(/Aquifer Reference Implementation/i)).toBeInTheDocument();
    });
  });

  it('calls onComplete when skip button is clicked', async () => {
    const mockOnComplete = vi.fn();
    render(<SplashScreen onComplete={mockOnComplete} />);
    
    const skipButton = screen.getByText(/Skip presentation/i);
    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('calls onComplete when pressing Escape', async () => {
    const mockOnComplete = vi.fn();
    render(<SplashScreen onComplete={mockOnComplete} />);
    
    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('navigates to specific slide using indicators', async () => {
    render(<SplashScreen />);
    
    // Click on the third indicator
    const indicators = screen.getAllByLabelText(/Go to slide/i);
    fireEvent.click(indicators[2]);

    await waitFor(() => {
      expect(screen.getByText(/They Said Flat Files Were Dead/i)).toBeInTheDocument();
    });
  });

  it('calls onComplete on the last slide CTA', async () => {
    const mockOnComplete = vi.fn();
    render(<SplashScreen onComplete={mockOnComplete} />);
    
    // Navigate to the last slide
    const indicators = screen.getAllByLabelText(/Go to slide/i);
    fireEvent.click(indicators[indicators.length - 1]);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Explore\?/i)).toBeInTheDocument();
    });

    // Click the Start Exploring button
    const startButton = screen.getByText(/Start Exploring/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('renders in both light and dark themes', () => {
    // Test dark theme
    document.documentElement.setAttribute('data-theme', 'dark');
    const { rerender } = render(<SplashScreen />);
    expect(screen.getByText(/Translation Helps/i)).toBeInTheDocument();

    // Test light theme
    document.documentElement.setAttribute('data-theme', 'light');
    rerender(<SplashScreen />);
    expect(screen.getByText(/Translation Helps/i)).toBeInTheDocument();
  });
});
