# 🎨 UI Components

**Tier 2 Feature Documentation**  
*Component architecture, theme system, and user interface patterns*

---

## 📋 Overview

This folder contains documentation for the user interface components, theme system, and design patterns used throughout the application.

### Core UI Concepts
- **Self-Activating Panels**: Components that request their own resources
- **Theme System**: CSS variables-based light/dark mode support
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Accessibility**: WCAG-compliant design with keyboard navigation

---

## 📚 Documentation Index

### Component Architecture
- **Panel System**: Self-activating panels that manage their own resource loading
- **Navigation Components**: Breadcrumbs, selectors, and navigation patterns
- **Resource Display**: How translation resources are rendered and styled
- **Loading States**: Consistent loading indicators across all components

### Theme System
- **CSS Variables**: Complete theme system using custom properties
- **ETEN Lab Branding**: Official brand colors and styling guidelines
- **Light/Dark Mode**: Automatic theme switching with system preference detection
- **Responsive Breakpoints**: Mobile-first responsive design patterns

### Design Patterns
- **Card Components**: Consistent card styling for resource content
- **Typography**: Font system and text hierarchy
- **Spacing System**: Consistent spacing using CSS custom properties
- **Color System**: Semantic color usage and accessibility compliance

---

## 🏗️ Component Hierarchy

### Main Application Structure
```
App (Theme Provider)
└── MainView (Layout)
    ├── NavigationBar
    │   ├── ReferenceSelector
    │   └── ThemeToggle
    ├── ScripturePanel (Self-Activating)
    └── HelpsTabs
        ├── TranslationNotesPanel (Self-Activating)
        ├── TranslationQuestionsPanel (Self-Activating)
        ├── TranslationWordsPanel (Self-Activating)
        ├── TWLPanel (Self-Activating)
        └── LLMChatPanel (Multi-Resource Activating)
```

### Self-Activating Panel Pattern
```javascript
export function ResourcePanel() {
  const { resources, activateResource } = useResourcesContext();
  
  // Self-activate this resource type
  useEffect(() => {
    activateResource('resourceType');
  }, [activateResource]);
  
  if (!resources.resourceType?.length) {
    return <EmptyState />;
  }
  
  return <ResourceContent data={resources.resourceType} />;
}
```

---

## 🎨 Theme System Architecture

### CSS Variables Structure
```css
:root {
  /* Colors */
  --color-primary: #c1d72e;        /* ETEN Lab green */
  --color-background: #ffffff;     /* Page background */
  --color-surface: #ffffff;        /* Card backgrounds */
  --color-text: #1e293b;          /* Primary text */
  
  /* Spacing */
  --spacing-1: 0.25rem;           /* 4px */
  --spacing-2: 0.5rem;            /* 8px */
  --spacing-3: 1rem;              /* 16px */
  --spacing-4: 1.5rem;            /* 24px */
  
  /* Typography */
  --font-family-primary: 'Figtree', sans-serif;
  --font-family-secondary: 'Jura', sans-serif;
}

[data-theme="dark"] {
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text: #ffffff;
}
```

### Theme Toggle Implementation
```javascript
const toggleTheme = () => {
  const newTheme = isDark ? 'light' : 'dark';
  setIsDark(!isDark);
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
};
```

---

## 📱 Responsive Design Patterns

### Breakpoint System
```css
/* Mobile First Approach */
.component {
  /* Mobile styles (default) */
}

@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop styles */
  }
}
```

### Component Responsiveness
- **Navigation**: Collapsible on mobile, full width on desktop
- **Panels**: Stack vertically on mobile, side-by-side on desktop
- **Text**: Responsive font sizes using CSS clamp()
- **Touch Targets**: Minimum 44px for mobile accessibility

---

## ♿ Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical tab sequence through all interactive elements
- **Focus Indicators**: Clear visual focus indicators on all focusable elements
- **Skip Links**: Skip to main content functionality
- **Escape Handling**: Modal and dropdown escape key support

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Semantic HTML**: Proper heading hierarchy and landmark elements
- **Live Regions**: Dynamic content updates announced to screen readers
- **Alternative Text**: Descriptive alt text for all images

### Visual Accessibility
- **Color Contrast**: WCAG AA compliant contrast ratios
- **Reduced Motion**: Respects user's motion preferences
- **Focus Management**: Proper focus handling in modals and navigation
- **Text Scaling**: Supports browser text scaling up to 200%

---

## 🧪 Testing Strategy

### Component Testing
```javascript
describe('ResourcePanel', () => {
  it('should self-activate resource on mount', () => {
    const mockActivateResource = jest.fn();
    render(<ResourcePanel />, { mockActivateResource });
    expect(mockActivateResource).toHaveBeenCalledWith('resourceType');
  });
});
```

### Accessibility Testing
- **Automated Testing**: axe-core integration for accessibility violations
- **Manual Testing**: Keyboard navigation and screen reader testing
- **Visual Testing**: Color contrast and responsive design verification

### Theme Testing
- **Theme Switching**: Verify proper theme application and persistence
- **System Preference**: Test automatic theme detection
- **CSS Variables**: Ensure all components use theme variables

---

## 🔧 Component Development Guidelines

### File Structure
```
src/components/ComponentName/
├── index.jsx                 # Main component export
├── ComponentName.jsx         # Component implementation
├── ComponentName.module.css  # Component-specific styles
└── ComponentName.test.jsx    # Component tests
```

### Styling Conventions
- **CSS Modules**: Use CSS modules for component-specific styles
- **Theme Variables**: Always use CSS custom properties for colors and spacing
- **BEM Methodology**: Use BEM naming convention for CSS classes
- **Mobile First**: Write mobile styles first, enhance for larger screens

### Performance Considerations
- **Code Splitting**: Lazy load non-critical components
- **Memoization**: Use React.memo for expensive components
- **CSS Optimization**: Minimize CSS bundle size and unused styles
- **Image Optimization**: Use appropriate image formats and sizes

---

## 📚 Related Documentation

### Tier 1 Core
- [PRINCIPLES.md](../../tier1-core/PRINCIPLES.md#responsive-design) - UI design principles
- [ARCHITECTURE.md](../../tier1-core/ARCHITECTURE.md) - Component architecture

### Tier 2 Features
- [Translation Resources](../translation-resources/README.md) - How resources are displayed
- [API Integration](../api-integration/README.md) - Data flow to components

### Tier 3 Implementation
- [Patterns](../../tier3-implementation/patterns/) - Specific UI patterns
- [Troubleshooting](../../tier3-implementation/troubleshooting/) - Common UI issues

---

## 🔄 Future Enhancements

### Planned Features
- **Component Library**: Storybook integration for component documentation
- **Design Tokens**: Enhanced design token system
- **Animation System**: Consistent animation patterns across components
- **Micro-Interactions**: Enhanced user feedback through subtle animations

### Performance Improvements
- **Virtual Scrolling**: For large resource lists
- **Progressive Loading**: Incremental component loading
- **CSS-in-JS Migration**: Potential migration to styled-components
- **Bundle Optimization**: Further CSS and JS bundle size reduction

---

*Last Updated: 2025-01-27*  
*Covers: Component architecture, theme system, responsive design*  
*Pattern: Self-activating components with consistent theming* 