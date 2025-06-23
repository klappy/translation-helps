# ETEN Lab Translation Helps - Light Mode Branding Guide

## Brand Identity Overview

The ETEN Innovation Lab Translation Helps light mode theme provides a professional, accessible alternative to the default dark theme while maintaining complete brand consistency with ETEN Lab's visual identity.

### Core Brand Values
- **Innovation**: Cutting-edge technology for Bible translation
- **Accessibility**: Clear, readable design for all users
- **Professionalism**: Technical excellence with human warmth
- **Global Impact**: Serving diverse communities worldwide

## Color System

### Primary Brand Colors

#### ETEN Lab Green Family
```css
--color-primary: #c1d72e          /* ETEN Lab signature green */
--color-primary-light: #d4e157    /* Hover states, highlights */
--color-primary-dark: #afb42b     /* Active states, emphasis */
--color-primary-hover: #cddc39    /* Interactive feedback */
```

**Usage**: Primary buttons, links, focus indicators, brand accents, success states

**Accessibility**: Always pair with dark text (#1a1a1a) for WCAG AA compliance

### Surface Colors

#### Backgrounds & Surfaces
```css
--color-background: #fafafa       /* Main application background */
--color-surface: #ffffff          /* Cards, panels, primary content */
--color-surface-hover: #f5f5f5    /* Subtle hover states */
--color-surface-secondary: #f8f9fa /* Secondary content areas */
--color-surface-tertiary: #f0f2f4  /* Nested elements, sidebars */
--color-footer: #e8eaed           /* Footer background */
```

**Usage**: Application backgrounds, content cards, navigation panels, modal overlays

### Border System

#### Structural Borders
```css
--color-border: #e0e0e0           /* Standard borders, dividers */
--color-border-hover: #c6c6c6     /* Interactive border states */
--color-border-focus: #c1d72e     /* Focus indicators (green) */
--color-border-subtle: #f0f0f0    /* Very light dividers */
```

**Usage**: Card outlines, form fields, section dividers, table borders

### Typography Colors

#### Text Hierarchy
```css
--color-text: #202124             /* Primary text - almost black */
--color-text-secondary: #5f6368   /* Secondary text - medium grey */
--color-text-tertiary: #80868b    /* Tertiary text - light grey */
--color-text-muted: #9aa0a6       /* Muted text - very light grey */
--color-text-on-primary: #1a1a1a  /* Text on green backgrounds */
```

**Contrast Ratios**: All combinations meet WCAG AA standards (4.5:1 minimum)

### Accent Colors

#### Professional Palette
```css
--color-accent-blue: #1a73e8      /* Links, information */
--color-accent-orange: #f9ab00    /* Warnings, highlights */
--color-accent-purple: #9c27b0    /* Innovation, creativity */
--color-accent-teal: #00897b      /* Technical, data */
```

### State Colors

#### System Feedback
```css
--color-success: #1e8e3e          /* Success messages, confirmations */
--color-warning: #f9ab00          /* Warnings, cautions */
--color-error: #d93025            /* Errors, critical alerts */
--color-info: #1a73e8             /* Information, tips */
```

## Typography System

### Font Families

#### ETEN Lab Font Stack
```css
--font-family-primary: "Figtree", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-family-heading: "Jura", "Figtree", -apple-system, BlinkMacSystemFont, sans-serif;
--font-family-body: "Madefor Text", "Figtree", -apple-system, BlinkMacSystemFont, sans-serif;
--font-family-mono: "Monaco", "Menlo", "Ubuntu Mono", "Courier New", monospace;
```

### Font Scale

#### Hierarchical Sizing
```css
--font-size-xs: 0.75rem    /* 12px - Small labels, metadata */
--font-size-sm: 0.8125rem  /* 13px - Secondary text */
--font-size-md: 0.875rem   /* 14px - Body text */
--font-size-lg: 0.9375rem  /* 15px - Emphasized text */
--font-size-xl: 1rem       /* 16px - Headings */
--font-size-2xl: 1.125rem  /* 18px - Large headings */
```

### Font Weights
```css
--font-weight-light: 300     /* Light emphasis */
--font-weight-regular: 400   /* Body text */
--font-weight-medium: 500    /* UI elements */
--font-weight-semibold: 600  /* Subheadings */
--font-weight-bold: 700      /* Headings */
```

## Shadow System

### Elevation Hierarchy
```css
--shadow-sm: 0 1px 2px 0 rgba(60,64,67,0.08), 0 1px 3px 1px rgba(60,64,67,0.04);
--shadow-md: 0 1px 3px 0 rgba(60,64,67,0.12), 0 4px 8px 3px rgba(60,64,67,0.08);
--shadow-lg: 0 2px 6px 2px rgba(60,64,67,0.15), 0 8px 12px 4px rgba(60,64,67,0.10);
--shadow-xl: 0 4px 12px 4px rgba(60,64,67,0.18), 0 12px 24px 8px rgba(60,64,67,0.12);
```

**Usage Guidelines**:
- **sm**: Buttons, form fields
- **md**: Cards, panels
- **lg**: Modals, dropdowns
- **xl**: Major overlays, notifications

## Component Specifications

### Primary Buttons
```css
background: var(--color-primary);
color: var(--color-text-on-primary);
border: none;
border-radius: 6px;
padding: 12px 24px;
font-weight: var(--font-weight-medium);
box-shadow: var(--shadow-sm);
transition: all 150ms ease-in-out;
```

**Hover State**: Background lightens to `--color-primary-hover`, shadow increases to `--shadow-md`

### Secondary Buttons
```css
background: var(--color-surface);
color: var(--color-text);
border: 1px solid var(--color-border);
border-radius: 6px;
padding: 12px 24px;
font-weight: var(--font-weight-medium);
```

**Hover State**: Background to `--color-surface-hover`, border to `--color-border-hover`

### Cards
```css
background: var(--color-surface);
border: 1px solid var(--color-border-subtle);
border-radius: 8px;
padding: 24px;
box-shadow: var(--shadow-sm);
```

**Hover State**: Shadow increases to `--shadow-md`, subtle lift effect

### Form Fields
```css
background: var(--color-surface);
border: 1px solid var(--color-border);
border-radius: 4px;
padding: 12px 16px;
color: var(--color-text);
```

**Focus State**: Border color to `--color-border-focus` (green), shadow outline

## Interactive States

### Hover Effects
- **Buttons**: Background color shift + shadow increase
- **Cards**: Shadow elevation + subtle scale (102%)
- **Links**: Color shift to `--color-primary-hover`
- **Form Fields**: Border color darkens

### Focus Indicators
- **Color**: `--color-border-focus` (ETEN Lab green)
- **Width**: 2px solid outline
- **Offset**: 2px from element edge
- **Accessibility**: Meets WCAG 2.1 focus requirements

### Active States
- **Buttons**: Background to `--color-primary-dark`, shadow reduces
- **Form Fields**: Border remains green, background slightly darker
- **Navigation**: Green accent bar or background highlight

## Layout Guidelines

### Spacing System
```css
--spacing-1: 4px     /* Tight spacing */
--spacing-2: 8px     /* Normal spacing */
--spacing-3: 12px    /* Comfortable spacing */
--spacing-4: 16px    /* Generous spacing */
--spacing-6: 24px    /* Section spacing */
--spacing-8: 32px    /* Large spacing */
```

### Grid System
- **Base Unit**: 4px
- **Content Max Width**: 1200px
- **Breakpoints**: 768px (tablet), 1024px (desktop)
- **Margins**: 16px mobile, 24px tablet, 32px desktop

## Brand Applications

### Scripture Display
- **Verse Numbers**: `--color-primary` (green)
- **Selected Verses**: Light green background `rgba(193, 215, 46, 0.12)`
- **Hover States**: Subtle green tint `rgba(193, 215, 46, 0.08)`
- **Chapter Headers**: `--color-text` with green underline accent

### Navigation
- **Active States**: Green accent bar (3px) or background highlight
- **Breadcrumbs**: Secondary text color with green separators
- **Logo**: Full color on white background
- **Menu Items**: Hover with green background tint

### Help Panels
- **Border Accent**: 3px left border in ETEN Lab green
- **Background**: White with subtle shadow
- **Headers**: Medium weight in primary text color
- **Links**: Green color matching brand

### Chat Interface
- **User Messages**: Light green background `rgba(193, 215, 46, 0.08)`
- **System Messages**: White background with subtle border
- **Timestamps**: Muted text color
- **Input Field**: White background with green focus ring

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Text Contrast**: Minimum 4.5:1 ratio
- **Large Text**: Minimum 3:1 ratio
- **Focus Indicators**: 2px minimum, high contrast
- **Color Independence**: No information conveyed by color alone

### Keyboard Navigation
- **Tab Order**: Logical, predictable flow
- **Focus Visibility**: Clear green outlines
- **Skip Links**: Available for screen readers
- **ARIA Labels**: Proper semantic markup

## Implementation Checklist

### Phase 1: Core Variables
- [ ] Update CSS custom properties
- [ ] Test color contrast ratios
- [ ] Implement shadow system
- [ ] Add transition timing

### Phase 2: Components
- [ ] Button styles and states
- [ ] Form field styling
- [ ] Card components
- [ ] Navigation elements

### Phase 3: Interactive States
- [ ] Hover effects
- [ ] Focus indicators
- [ ] Active states
- [ ] Loading states

### Phase 4: Content Areas
- [ ] Scripture rendering
- [ ] Help panel styling
- [ ] Chat interface
- [ ] Modal dialogs

### Phase 5: Testing
- [ ] Cross-browser compatibility
- [ ] Accessibility audit
- [ ] Color contrast validation
- [ ] User testing feedback

## Design Tokens Reference

### Quick Reference Table
| Token | Light Mode Value | Usage |
|-------|------------------|-------|
| Primary | #c1d72e | Brand color, CTAs, links |
| Background | #fafafa | Main app background |
| Surface | #ffffff | Cards, panels, content |
| Text Primary | #202124 | Headings, body text |
| Text Secondary | #5f6368 | Labels, metadata |
| Border | #e0e0e0 | Dividers, outlines |
| Shadow | Multi-layer | Elevation, depth |

### Color Combinations
| Background | Text | Border | Usage |
|------------|------|--------|-------|
| #ffffff | #202124 | #e0e0e0 | Standard cards |
| #c1d72e | #1a1a1a | none | Primary buttons |
| #f8f9fa | #5f6368 | #e0e0e0 | Secondary areas |
| #fafafa | #202124 | none | App background |

## Brand Guidelines Summary

### Do's
✅ Use ETEN Lab green (#c1d72e) for all brand elements
✅ Maintain high contrast ratios for accessibility  
✅ Apply consistent spacing using the 4px grid
✅ Use subtle shadows for depth and hierarchy
✅ Implement smooth transitions (150ms) for interactions

### Don'ts
❌ Never use white text on green backgrounds
❌ Don't mix color systems from different themes
❌ Avoid harsh borders or high contrast outlines
❌ Don't ignore focus indicators for accessibility
❌ Never compromise on text readability

This branding guide ensures consistent implementation of the ETEN Lab light mode theme across all components while maintaining professional aesthetics and accessibility standards. 