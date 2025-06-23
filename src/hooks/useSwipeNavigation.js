/**
 * useSwipeNavigation.js
 * Custom hook for swipe gestures to navigate between chapters
 * Inspired by YouVersion Bible App patterns
 */
import { useEffect, useCallback, useRef } from 'react';

export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
  threshold = 50,
  restraint = 100,
  allowedTime = 300
}) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const elementRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (!enabled) return;
    
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
  }, [enabled]);

  const handleTouchEnd = useCallback((e) => {
    if (!enabled) return;

    const touch = e.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    const touchEndTime = Date.now();

    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    const elapsedTime = touchEndTime - touchStartTime.current;

    // Check if swipe meets criteria
    if (elapsedTime <= allowedTime) {
      // Check if horizontal swipe distance is sufficient
      if (Math.abs(deltaX) >= threshold) {
        // Check if vertical movement is within restraint (to avoid conflicts with scrolling)
        if (Math.abs(deltaY) <= restraint) {
          if (deltaX > 0) {
            // Swipe right - previous chapter
            onSwipeRight?.();
          } else {
            // Swipe left - next chapter
            onSwipeLeft?.();
          }
        }
      }
    }
  }, [enabled, threshold, restraint, allowedTime, onSwipeLeft, onSwipeRight]);

  const handleTouchMove = useCallback((e) => {
    // Prevent default behavior for horizontal swipes to avoid page navigation
    if (!enabled) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartX.current);
    const deltaY = Math.abs(touch.clientY - touchStartY.current);

    // If horizontal movement is greater than vertical, prevent default
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
  }, [enabled]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    // Add event listeners with passive: false to allow preventDefault
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [enabled, handleTouchStart, handleTouchEnd, handleTouchMove]);

  return elementRef;
}

export default useSwipeNavigation; 