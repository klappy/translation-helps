# 🎨 Design Mockups

**Design Mockups and Visual Explorations**  
*HTML design mockups for UI/UX exploration*

---

## 📋 Overview

This folder contains standalone HTML design mockups used for UI/UX exploration, visual design iteration, and design system validation. These files are not part of the main application but serve as design references and visual documentation.

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
- **Visual Mockups**: Static HTML/CSS mockups for design exploration
- **Design Iteration**: Fast visual exploration of UI concepts and layouts
- **Stakeholder Review**: Shareable design mockups for feedback and approval

### Design Reference
- **Visual Documentation**: HTML/CSS patterns for design reference
- **Design System Validation**: Testing of theme variables and visual components
- **Cross-Browser Design**: Visual consistency testing across browsers

### Documentation
- **Visual Documentation**: Living examples of design decisions
- **Historical Reference**: Evolution of UI patterns and approaches
- **Design Rationale**: Context for why certain patterns were chosen

---

## 🚀 Usage

### Viewing Mockups
```bash
# Open any mockup file directly in browser
open mockups/demo-dark-mode-showcase.html

# Or serve locally for development
python -m http.server 8000
# Then visit: http://localhost:8000/mockups/
```

### Creating New Design Mockups
1. **Copy Template**: Use existing mockup as starting point
2. **Standalone HTML**: Keep mockups self-contained with embedded CSS
3. **Theme Variables**: Use CSS custom properties matching main app
4. **Responsive Design**: Include mobile and desktop breakpoints

### Best Practices
- **Self-Contained**: Each mockup should work independently
- **Documented**: Include comments explaining the design purpose
- **Consistent**: Use same CSS variables as main application
- **Accessible**: Include proper ARIA labels and semantic HTML

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

### Design Patterns
Visual patterns from mockups inform React component development in:
- `src/components/` - Component implementations based on design mockups
- `src/styles/` - CSS patterns derived from mockup explorations

### Theme System
Mockup themes correspond to main app themes:
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
- **Review Relevance**: Remove outdated mockups that no longer reflect current design direction
- **Update Variables**: Keep CSS variables in sync with main application
- **Visual Testing**: Verify mockups display correctly in supported browsers
- **Documentation**: Update README when adding new mockup categories

### Cleanup Guidelines
- **Archive Old**: Move superseded mockups to archive folder
- **Document Changes**: Note why mockups were removed or updated
- **Preserve History**: Keep important design evolution examples

---

*Last Updated: 2025-01-27*  
*Purpose: Design mockups and visual exploration*  
*Maintenance: Regular review and cleanup of outdated mockups* 