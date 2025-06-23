# Chapter Navigation System

## Overview

The Chapter Navigation System provides intuitive, accessible navigation between scripture chapters with mobile-first design principles and YouVersion-style interaction patterns.

## Features

### 1. Enhanced Breadcrumb Navigation
- **Format**: "BookName Chapter:Verse" (e.g., "Genesis 3:16")
- **Behavior**: Click to toggle book/chapter selector
- **Smart Context**: Auto-opens current book and scrolls to position
- **Instant Toggle**: No slide animations on breadcrumb clicks

### 2. Floating Action Buttons (FABs)
- **Position**: Bottom center of scripture panel
- **Controls**: Previous (‹) and Next (›) chapter buttons
- **Responsive**: 56px desktop, 48px mobile for optimal thumb access
- **States**: Disabled at first/last chapter boundaries
- **Animation**: Smooth slide transitions between chapters

### 3. Swipe Gestures
- **Pattern**: YouVersion-style horizontal swipes
- **Left Swipe**: Next chapter
- **Right Swipe**: Previous chapter
- **Integration**: Works seamlessly with FAB buttons

### 4. Book/Chapter Selector
- **Auto-Expansion**: Current book automatically opens showing chapters
- **Smart Scrolling**: Auto-scrolls to current book position
- **Visual Feedback**: Current chapter highlighted with theme colors
- **Contrast**: Proper text contrast on selected backgrounds
- **Close Behavior**: X button goes directly to complete state

## Implementation

### Core Components

#### ScripturePanelRCL
```javascript
// Chapter navigation with proper integer handling
const handleNextChapter = useCallback(() => {
  const currentChapter = parseInt(reference?.chapter, 10) || 1;
  const maxChapters = getMaxChaptersForBook(reference?.bookId);
  
  if (currentChapter < maxChapters && !isSliding) {
    // Slide animation and reference update
  }
}, [reference?.chapter, reference?.bookId, currentReference, updateContext, isSliding]);
```

#### useSwipeNavigation Hook
```javascript
// YouVersion-style swipe detection
export function useSwipeNavigation({ onSwipeLeft, onSwipeRight, enabled = true }) {
  // Touch event handling for mobile swipe gestures
  // Configurable sensitivity and direction detection
}
```

#### BookSelector Enhancements
```javascript
// Auto-expansion and smart scrolling
useEffect(() => {
  if (isOpen && currentBook) {
    // Auto-expand current book
    setExpandedBooks(new Set([currentBook]));
    
    // Smart scroll to current book
    setTimeout(() => {
      const bookElement = document.querySelector(`[data-book-id="${currentBook}"]`);
      if (bookElement) {
        bookElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
}, [isOpen, currentBook]);
```

### CSS Architecture

#### FAB Positioning
```css
.chapterNavFabs {
  position: fixed;
  bottom: 20px;
  display: flex;
  justify-content: space-between;
  z-index: 1000;
  pointer-events: none;
}

.fabButton {
  pointer-events: auto;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  /* Theme-aware styling */
}

@media (max-width: 768px) {
  .fabButton {
    width: 48px;
    height: 48px;
  }
}
```

#### Slide Animations
```css
.scriptureSwipeContainer {
  transition: transform 0.3s ease-in-out;
}

.slideLeft {
  transform: translateX(-100%);
}

.slideRight {
  transform: translateX(100%);
}
```

## Bug Fixes Implemented

### 1. String Concatenation Bug
**Problem**: Chapter navigation from 4:1 went to chapter 41 instead of 5:1
**Solution**: Ensured integer parsing in URL helpers and navigation functions

```javascript
// Fixed in contextHelpers.js
reference: {
  bookId: bookId || null,
  chapter: chapter ? parseInt(chapter, 10) : null,
  verse: verse ? parseInt(verse, 10) : null,
}
```

### 2. Tab Click Misalignment
**Problem**: Click targets were shifted, causing wrong tab activation
**Solution**: Simplified tab button structure and removed nested spans

### 3. Resource Synchronization
**Problem**: Help panels not updating on chapter changes
**Solution**: Added chapter and verse to ResourcesContext dependency array

```javascript
// Fixed dependency array
}, [reference?.bookId, reference?.chapter, reference?.verse, activeResources, ...]);
```

## Performance Considerations

### 1. Animation Timing
- **Chapter Transitions**: 300ms for smooth feel without lag
- **Slide Preparation**: 150ms delay for visual feedback
- **Auto-scroll**: 100ms delay for DOM settling

### 2. Memory Management
- **Event Listeners**: Proper cleanup in useEffect returns
- **Animation States**: Reset after transitions complete
- **Portal Rendering**: FABs use React Portal for optimal positioning

### 3. Mobile Optimization
- **Touch Targets**: Minimum 48px for accessibility
- **Gesture Detection**: Debounced to prevent accidental triggers
- **Viewport Positioning**: Dynamic calculation for different screen sizes

## Accessibility

### 1. Keyboard Navigation
- **Tab Order**: Logical progression through navigation elements
- **Focus Management**: Proper focus states for all interactive elements
- **Screen Readers**: ARIA labels for all navigation buttons

### 2. Visual Accessibility
- **Contrast**: Sufficient contrast ratios on all backgrounds
- **Motion**: Respects `prefers-reduced-motion` settings
- **Size**: Touch targets meet WCAG guidelines

### 3. Semantic HTML
- **Button Elements**: Proper button semantics for all clickable elements
- **Landmarks**: Navigation regions properly marked
- **State Communication**: Disabled states clearly indicated

## Testing Strategy

### Unit Tests
- Chapter navigation logic
- Integer parsing validation
- Swipe gesture detection
- Auto-expansion behavior

### Integration Tests
- Full navigation flow
- Cross-panel synchronization
- URL parameter handling
- Animation state management

### E2E Tests
- Mobile swipe gestures
- FAB button interactions
- Keyboard navigation
- Accessibility compliance

## Future Enhancements

### Potential Improvements
1. **Verse-level Navigation**: Fine-grained verse jumping
2. **Bookmark Integration**: Quick access to saved references
3. **Search Integration**: Navigate to search results
4. **Reading Plans**: Structured navigation sequences

### Performance Optimizations
1. **Preloading**: Adjacent chapter content prefetching
2. **Caching**: Smart caching of navigation state
3. **Lazy Loading**: On-demand chapter list loading

## Migration Notes

### From Previous System
- Removed complex modal-based navigation
- Simplified breadcrumb interaction
- Eliminated sequential navigation patterns
- Streamlined CSS architecture

### Breaking Changes
- Navigation URLs now require integer chapter/verse values
- Removed deprecated navigation components
- Updated CSS class names for consistency

## Troubleshooting

### Common Issues
1. **FABs Not Appearing**: Check portal rendering and z-index
2. **Swipes Not Working**: Verify touch event handlers and enabled state
3. **Wrong Chapter Navigation**: Check integer parsing in URL helpers
4. **Animation Glitches**: Verify CSS transition timing and state management 