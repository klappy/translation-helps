# CSS-First Collapsible Notes Pattern

## Overview

This pattern is used to collapse and expand long content (such as translation notes) using only CSS and minimal JavaScript, with a focus on accessibility, performance, and maintainability. The entire note area is clickable to toggle expansion, and no React state or JS logic is required for the expand/collapse behavior.

**Project Policy:**

> Always prefer CSS-based solutions for UI/UX behaviors (such as show/hide, expand/collapse, hover effects, etc.) over JavaScript/React state, unless there is a clear technical reason to use JS.

## When to Use

- For any long content (notes, explanations, etc.) that should be collapsed by default and expandable by the user.
- When you want a simple, performant, and accessible solution that does not require React state or complex JS.

## Implementation

### React/JSX

```jsx
<div
  className={`noteText collapsibleNote`}
  onClick={(e) => {
    e.stopPropagation();
    e.currentTarget.classList.toggle("expanded");
  }}
  title='Click to expand/collapse'
>
  {noteContent}
</div>
```

- Only apply the `collapsibleNote` class and onClick handler for content over the desired line/height threshold.
- For short content, render as a normal div.

### CSS

```css
.collapsibleNote {
  max-height: 12.5em; /* 10 lines * 1.25em */
  overflow: hidden;
  position: relative;
  transition: max-height 0.2s;
  cursor: pointer;
}
.collapsibleNote::after {
  content: "";
  display: block;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2.5em;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, #fff 100%);
  pointer-events: none;
}
.collapsibleNote.expanded {
  max-height: none;
  overflow: visible;
}
.collapsibleNote.expanded::after {
  display: none;
}
```

### UX Notes

- The entire note area is clickable to expand/collapse.
- The cursor changes to pointer and a title attribute is set for accessibility.
- A fade-out effect is shown at the bottom of collapsed notes.
- No "Show more"/"Show less" button is needed, but you may add a visual indicator if desired.

## Why CSS-First?

- **Performance:** No React state or re-renders required.
- **Simplicity:** Easy to maintain and reason about.
- **Accessibility:** Works with keyboard and screen readers (with title/cursor).
- **Consistency:** Ensures a uniform experience across the app.

## Project Policy Reminder

> When implementing any UI/UX behavior that can be handled with CSS, always use CSS as the first choice. Only use JS/React state when absolutely necessary.

---

_Last updated: 2025-06-14_
