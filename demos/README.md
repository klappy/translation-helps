# 🎨 Demos

**Development Demos and Prototypes**  
*HTML prototypes and design exploration files*

---

## 📋 Overview

This folder contains standalone HTML demonstration files used for UI/UX prototyping, design exploration, and feature development. These files are not part of the main application but serve as development tools and design references.

---

## 📁 Demo Files

### Design System Showcases
- **`demo-dark-mode-showcase.html`** - Dark mode theme demonstration
- **`demo-light-mode-showcase.html`** - Light mode theme demonstration  
- **`demo-light-mode-branding-showcase.html`** - ETEN Lab branding showcase

### Navigation Prototypes
- **`demo-chapter-navigation.html`** - Chapter navigation system prototype
- **`demo-refined-mobile-navigation.html`** - Mobile navigation improvements
- **`demo-reused-navigation-patterns.html`** - Navigation pattern consistency
- **`demo-mobile-chapter-solutions.html`** - Mobile chapter navigation solutions

### Layout Experiments
- **`demo-split-view.html`** - Split view layout exploration
- **`demo-tabbed-view.html`** - Tabbed interface prototype
- **`demo-parallel-columns.html`** - Parallel column layout design

---

## 🎯 Purpose

These demo files serve multiple purposes:

### Design Exploration
- **Rapid Prototyping**: Quick HTML/CSS prototypes without React setup
- **Design Iteration**: Fast visual exploration of UI concepts
- **Stakeholder Review**: Shareable prototypes for feedback and approval

### Development Reference
- **Implementation Guidance**: HTML/CSS patterns for React implementation
- **Design System Testing**: Validation of theme variables and components
- **Browser Compatibility**: Cross-browser testing of CSS features

### Documentation
- **Visual Documentation**: Living examples of design decisions
- **Historical Reference**: Evolution of UI patterns and approaches
- **Design Rationale**: Context for why certain patterns were chosen

---

## 🚀 Usage

### Viewing Demos
```bash
# Open any demo file directly in browser
open demos/demo-dark-mode-showcase.html

# Or serve locally for development
python -m http.server 8000
# Then visit: http://localhost:8000/demos/
```

### Creating New Demos
1. **Copy Template**: Use existing demo as starting point
2. **Standalone HTML**: Keep demos self-contained with embedded CSS
3. **Theme Variables**: Use CSS custom properties matching main app
4. **Responsive Design**: Include mobile and desktop breakpoints

### Best Practices
- **Self-Contained**: Each demo should work independently
- **Documented**: Include comments explaining the purpose
- **Consistent**: Use same CSS variables as main application
- **Accessible**: Include proper ARIA labels and keyboard navigation

---

## 🔗 Integration with Main App

### CSS Variables
Demos use the same CSS custom properties as the main application:

```css
:root {
  --color-primary: #c1d72e;        /* ETEN Lab green */
  --color-background: #ffffff;     /* Page background */
  --color-surface: #ffffff;        /* Card backgrounds */
  --color-text: #1e293b;          /* Primary text */
  /* ... other variables */
}
```

### Component Patterns
HTML patterns from demos are implemented as React components in:
- `src/components/` - Main component implementations
- `src/styles/` - Shared CSS patterns and variables

### Theme System
Demo themes correspond to main app themes:
- **Light Mode**: Default theme with ETEN Lab branding
- **Dark Mode**: Dark theme with proper contrast ratios
- **Mobile**: Responsive patterns for mobile devices

---

## 📚 Related Documentation

### Tier 2 Features
- [UI Components](../docs/tier2-features/ui-components/README.md) - Component architecture
- [Translation Resources](../docs/tier2-features/translation-resources/README.md) - Resource display patterns

### Tier 1 Core
- [PRINCIPLES.md](../docs/tier1-core/PRINCIPLES.md#responsive-design) - Design principles
- [ARCHITECTURE.md](../docs/tier1-core/ARCHITECTURE.md) - System architecture

---

## 🧹 Maintenance

### Regular Tasks
- **Review Relevance**: Remove outdated demos that no longer reflect current patterns
- **Update Variables**: Keep CSS variables in sync with main application
- **Browser Testing**: Verify demos work in supported browsers
- **Documentation**: Update README when adding new demo types

### Cleanup Guidelines
- **Archive Old**: Move superseded demos to archive folder
- **Document Changes**: Note why demos were removed or updated
- **Preserve History**: Keep important design evolution examples

---

*Last Updated: 2025-01-27*  
*Purpose: Design exploration and rapid prototyping*  
*Maintenance: Regular review and cleanup of outdated demos* 