/**
 * useSwipeNavigation.test.js
 * Tests for YouVersion-style swipe gesture detection
 */

import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { useSwipeNavigation } from './useSwipeNavigation';

// Mock DOM element for testing
const createMockElement = () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
});

describe('useSwipeNavigation', () => {
  let mockOnSwipeLeft;
  let mockOnSwipeRight;
  let mockElement;

  beforeEach(() => {
    mockOnSwipeLeft = jest.fn();
    mockOnSwipeRight = jest.fn();
    mockElement = createMockElement();
    
    // Mock useRef to return our mock element
    jest.spyOn(require('react'), 'useRef').mockReturnValue({ current: mockElement });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a ref object', () => {
    const { result } = renderHook(() => 
      useSwipeNavigation({ onSwipeLeft: mockOnSwipeLeft, onSwipeRight: mockOnSwipeRight })
    );

    expect(result.current).toHaveProperty('current');
  });

  it('should add touch event listeners when enabled', () => {
    renderHook(() => 
      useSwipeNavigation({ 
        onSwipeLeft: mockOnSwipeLeft, 
        onSwipeRight: mockOnSwipeRight,
        enabled: true 
      })
    );

    expect(mockElement.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: true });
    expect(mockElement.addEventListener).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: true });
  });

  it('should not add event listeners when disabled', () => {
    renderHook(() => 
      useSwipeNavigation({ 
        onSwipeLeft: mockOnSwipeLeft, 
        onSwipeRight: mockOnSwipeRight,
        enabled: false 
      })
    );

    expect(mockElement.addEventListener).not.toHaveBeenCalled();
  });

  it('should remove event listeners on cleanup', () => {
    const { unmount } = renderHook(() => 
      useSwipeNavigation({ 
        onSwipeLeft: mockOnSwipeLeft, 
        onSwipeRight: mockOnSwipeRight,
        enabled: true 
      })
    );

    unmount();

    expect(mockElement.removeEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(mockElement.removeEventListener).toHaveBeenCalledWith('touchend', expect.any(Function));
  });

  it('should detect left swipe and call onSwipeLeft', () => {
    renderHook(() => 
      useSwipeNavigation({ onSwipeLeft: mockOnSwipeLeft, onSwipeRight: mockOnSwipeRight })
    );

    // Get the event handlers that were added
    const touchStartHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchstart'
    )[1];
    const touchEndHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchend'
    )[1];

    // Simulate left swipe (start right, end left)
    touchStartHandler({
      touches: [{ clientX: 200, clientY: 100 }]
    });

    touchEndHandler({
      changedTouches: [{ clientX: 50, clientY: 100 }]
    });

    expect(mockOnSwipeLeft).toHaveBeenCalledTimes(1);
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });

  it('should detect right swipe and call onSwipeRight', () => {
    renderHook(() => 
      useSwipeNavigation({ onSwipeLeft: mockOnSwipeLeft, onSwipeRight: mockOnSwipeRight })
    );

    const touchStartHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchstart'
    )[1];
    const touchEndHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchend'
    )[1];

    // Simulate right swipe (start left, end right)
    touchStartHandler({
      touches: [{ clientX: 50, clientY: 100 }]
    });

    touchEndHandler({
      changedTouches: [{ clientX: 200, clientY: 100 }]
    });

    expect(mockOnSwipeRight).toHaveBeenCalledTimes(1);
    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
  });

  it('should not trigger swipe for small movements', () => {
    renderHook(() => 
      useSwipeNavigation({ onSwipeLeft: mockOnSwipeLeft, onSwipeRight: mockOnSwipeRight })
    );

    const touchStartHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchstart'
    )[1];
    const touchEndHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchend'
    )[1];

    // Simulate small movement (below threshold)
    touchStartHandler({
      touches: [{ clientX: 100, clientY: 100 }]
    });

    touchEndHandler({
      changedTouches: [{ clientX: 120, clientY: 100 }]
    });

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });

  it('should not trigger swipe for vertical movements', () => {
    renderHook(() => 
      useSwipeNavigation({ onSwipeLeft: mockOnSwipeLeft, onSwipeRight: mockOnSwipeRight })
    );

    const touchStartHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchstart'
    )[1];
    const touchEndHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchend'
    )[1];

    // Simulate vertical movement
    touchStartHandler({
      touches: [{ clientX: 100, clientY: 50 }]
    });

    touchEndHandler({
      changedTouches: [{ clientX: 100, clientY: 200 }]
    });

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });

  it('should handle missing touch data gracefully', () => {
    renderHook(() => 
      useSwipeNavigation({ onSwipeLeft: mockOnSwipeLeft, onSwipeRight: mockOnSwipeRight })
    );

    const touchStartHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchstart'
    )[1];
    const touchEndHandler = mockElement.addEventListener.mock.calls.find(
      call => call[0] === 'touchend'
    )[1];

    // Simulate events with missing touch data
    touchStartHandler({ touches: [] });
    touchEndHandler({ changedTouches: [] });

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });
}); 