# ETEN Lab Translation Helps - Dark Mode Branding Guide

## Brand Identity Overview

The ETEN Innovation Lab Translation Helps dark mode theme serves as the primary theme, directly matching the official ETEN Lab website (etenlab.org) aesthetic. This theme provides an immersive, professional environment optimized for extended use while maintaining complete brand consistency.

### Core Brand Values
- **Innovation**: Cutting-edge technology with a sleek, modern interface
- **Focus**: Dark backgrounds reduce eye strain for extended translation work
- **Professionalism**: Technical excellence with sophisticated visual design
- **Brand Consistency**: Direct match with etenlab.org's dark aesthetic

## Color System

### Primary Brand Colors

#### ETEN Lab Green Family
```css
--color-primary: #c1d72e          /* ETEN Lab signature green - exact match */
--color-primary-light: #d1e74e    /* Brighter for dark backgrounds */
--color-primary-dark: #a1c70e     /* Deeper green for emphasis */
--color-primary-hover: #b8d025    /* Interactive feedback */
```

**Usage**: Primary buttons, links, focus indicators, brand accents, success states

**Accessibility**: Always pair with black text (#000000) for optimal contrast on green

### Surface Colors

#### Backgrounds & Surfaces - ETEN Lab Aesthetic
```css
--color-background: #000000       /* Pure black - matches etenlab.org */
--color-surface: #1a1a1a          /* Dark grey for content cards */
--color-surface-hover: #2d2d2d    /* Hover states for interactivity */
--color-surface-secondary: #2a2a2a /* Secondary content areas */
--color-surface-tertiary: #333333  /* Nested elements, sidebars */
--color-surface-quaternary: #404040 /* Quaternary surface for hover states */
--color-footer: #262626           /* Footer grey from ETEN Lab website */
```

**Usage**: Application backgrounds, content cards, navigation panels, modal overlays

### Border System

#### Structural Borders - Dark Theme Optimized
```css
--color-border: #333333           /* Standard borders, subtle definition */
--color-border-hover: #404040     /* Interactive border states */
--color-border-focus: #c1d72e     /* Focus indicators (ETEN Lab green) */
--color-border-secondary: #404040 /* Secondary border color */
--color-border-tertiary: #555555  /* Tertiary border color */
```

**Usage**: Card outlines, form fields, section dividers, table borders

### Typography Colors

#### Text Hierarchy - High Contrast for Dark Backgrounds
```css
--color-text: #ffffff             /* Pure white - primary text */
--color-text-primary: #ffffff     /* Primary text color */
--color-text-secondary: #cccccc   /* Secondary text - light grey */
--color-text-tertiary: #999999    /* Tertiary text - medium grey */
--color-text-light: #cccccc       /* Light text variant */
--color-text-muted: #999999       /* Muted text - subtle grey */
--color-text-on-primary: #000000  /* Black text on green backgrounds */
```

**Contrast Ratios**: All combinations optimized for dark backgrounds, meeting WCAG AA standards

### Accent Colors

#### Professional Dark Theme Palette
```css
--color-accent-blue: #0ea5e9      /* Bright blue for dark backgrounds */
--color-accent-orange: #facc15    /* Warm amber for warnings */
--color-accent-purple: #a855f7    /* Vibrant purple for creativity */
--color-accent-teal: #14b8a6      /* Technical teal for data */
```

### State Colors

#### System Feedback - Dark Theme Optimized
```css
--color-success: #c1d72e          /* ETEN Lab green for success */
--color-warning: #facc15          /* Bright amber for warnings */
--color-error: #ef4444            /* Vibrant red for errors */
--color-info: #0ea5e9             /* Bright blue for information */
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

#### Hierarchical Sizing - Optimized for Dark Backgrounds
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

### Elevation Hierarchy - Dark Theme Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-md: 0 2px 8px 0 rgba(0, 0, 0, 0.3);
--shadow-lg: 0 4px 16px 0 rgba(0, 0, 0, 0.3);
--shadow-xl: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
```

**Usage Guidelines**:
- **sm**: Buttons, form fields
- **md**: Cards, panels
- **lg**: Modals, dropdowns
- **xl**: Major overlays, notifications

**Note**: Dark theme shadows use pure black with higher opacity for dramatic depth

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
border: 1px solid var(--color-border);
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
- **Links**: Color shift to `--color-primary-light` (brighter for dark backgrounds)
- **Form Fields**: Border color lightens

### Focus Indicators
- **Color**: `--color-border-focus` (ETEN Lab green)
- **Width**: 2px solid outline
- **Offset**: 2px from element edge
- **Accessibility**: High contrast green on dark backgrounds

### Active States
- **Buttons**: Background to `--color-primary-dark`, shadow reduces
- **Form Fields**: Border remains green, background slightly lighter
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
- **Verse Numbers**: `--color-primary` (bright green on dark)
- **Selected Verses**: Green background `rgba(193, 215, 46, 0.15)`
- **Hover States**: Subtle green tint `rgba(193, 215, 46, 0.1)`
- **Chapter Headers**: `--color-text` (white) with green underline accent

### Navigation
- **Active States**: Green accent bar (3px) or background highlight
- **Breadcrumbs**: Secondary text color with green separators
- **Logo**: Full color on dark background
- **Menu Items**: Hover with green background tint

### Help Panels
- **Border Accent**: 4px left border in ETEN Lab green
- **Background**: Dark grey (#1a1a1a) with dramatic shadows
- **Headers**: Medium weight in white text
- **Links**: Bright green color for visibility

### Chat Interface
- **User Messages**: Dark green background `rgba(193, 215, 46, 0.15)`
- **System Messages**: Dark surface with subtle border
- **Timestamps**: Muted grey text
- **Input Field**: Dark background with green focus ring

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Text Contrast**: High contrast white/grey on dark backgrounds
- **Large Text**: Optimized for dark theme readability
- **Focus Indicators**: Bright green outlines for visibility
- **Color Independence**: No information conveyed by color alone

### Dark Theme Considerations
- **Eye Strain Reduction**: Pure black backgrounds for comfortable viewing
- **High Contrast**: White text on dark surfaces
- **Bright Accents**: Enhanced green visibility on dark backgrounds
- **Shadow Depth**: Dramatic shadows for clear hierarchy

## Implementation Checklist

### Phase 1: Core Variables
- [x] Dark background colors (black/grey)
- [x] High contrast text colors
- [x] Enhanced shadow system
- [x] Bright accent colors

### Phase 2: Components
- [x] Button styles with dark backgrounds
- [x] Form field styling for dark theme
- [x] Card components with shadows
- [x] Navigation elements

### Phase 3: Interactive States
- [x] Bright hover effects
- [x] Green focus indicators
- [x] Enhanced active states
- [x] Loading states

### Phase 4: Content Areas
- [x] Scripture rendering optimization
- [x] Help panel dark styling
- [x] Chat interface theming
- [x] Modal dialogs

### Phase 5: Testing
- [x] Cross-browser compatibility
- [x] Accessibility audit
- [x] Color contrast validation
- [x] User testing feedback

## Design Tokens Reference

### Quick Reference Table
| Token | Dark Mode Value | Usage |
|-------|-----------------|-------|
| Primary | #c1d72e | Brand color, CTAs, links |
| Background | #000000 | Main app background |
| Surface | #1a1a1a | Cards, panels, content |
| Text Primary | #ffffff | Headings, body text |
| Text Secondary | #cccccc | Labels, metadata |
| Border | #333333 | Dividers, outlines |
| Shadow | Black-based | Elevation, depth |

### Color Combinations
| Background | Text | Border | Usage |
|------------|------|--------|-------|
| #1a1a1a | #ffffff | #333333 | Standard cards |
| #c1d72e | #000000 | none | Primary buttons |
| #2a2a2a | #cccccc | #404040 | Secondary areas |
| #000000 | #ffffff | none | App background |

## Advanced Dark Theme Features

### Enhanced Highlights
```css
/* Dark theme specific highlights */
--color-highlight-green: rgba(193, 215, 46, 0.2);    /* More opacity for visibility */
--color-highlight-blue: rgba(193, 215, 46, 0.1);     /* Subtle blue highlights */
--color-highlight-orange: rgba(245, 158, 66, 0.1);   /* Orange accents */
--color-highlight-purple: rgba(193, 215, 46, 0.15);  /* Purple highlights */
```

### Status Colors - Dark Optimized
```css
/* Enhanced visibility for dark backgrounds */
--color-status-low: #0277bd;       /* Bright blue for low priority */
--color-status-medium: #f57c00;    /* Orange for medium priority */
--color-status-high: #c62828;      /* Red for high priority */
```

### Help Panel System
```css
/* Dark theme help panels */
--help-card-background: #1a1a1a;
--help-card-border: 4px solid var(--color-primary);
--help-quote-background: #2a2a2a;
--help-quote-color: #d1e74e;       /* Bright green for quotes */
--help-card-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
```

## Brand Guidelines Summary

### Do's
✅ Use pure black (#000000) for main backgrounds to match etenlab.org
✅ Maintain high contrast with white text on dark surfaces
✅ Use bright ETEN Lab green (#c1d72e) for all brand elements
✅ Apply dramatic shadows for depth and hierarchy
✅ Implement smooth transitions (150ms) for interactions

### Don'ts
❌ Never use light grey text on dark grey backgrounds (poor contrast)
❌ Don't use dim colors that get lost on dark backgrounds
❌ Avoid subtle borders that disappear in dark theme
❌ Don't ignore shadow depth - embrace dramatic elevation
❌ Never compromise on text readability in dark environments

## Performance Optimizations

### Dark Theme Benefits
- **Reduced Eye Strain**: Pure black backgrounds for comfortable extended use
- **Battery Savings**: OLED displays use less power with dark pixels
- **Professional Aesthetic**: Matches modern development tools and ETEN Lab branding
- **Focus Enhancement**: Dark backgrounds make content stand out

### Technical Implementation
- **CSS Variables**: Instant theme switching with zero JavaScript overhead
- **Optimized Shadows**: Black-based shadows for authentic dark theme depth
- **High Contrast**: White text ensures readability in all lighting conditions
- **Brand Consistency**: Direct match with etenlab.org aesthetic

## Future Enhancements

### Planned Improvements
1. **OLED Optimization** - Pure black backgrounds for maximum battery efficiency
2. **High Contrast Variant** - Enhanced accessibility for visually impaired users
3. **Ambient Light Adaptation** - Automatic brightness adjustments
4. **Custom Green Variants** - Organization-specific green shades
5. **Animation Preferences** - Respect `prefers-reduced-motion` settings

### Implementation Roadmap
```css
/* Future dark theme examples */
[data-theme="dark-high-contrast"] {
  --color-background: #000000;
  --color-text: #ffffff;
  --color-border: #ffffff;
  --color-primary: #d1e74e; /* Brighter green for high contrast */
}

[data-theme="dark-oled"] {
  --color-background: #000000;
  --color-surface: #000000;     /* Pure black for OLED optimization */
  --color-border: #333333;
}
```

## Conclusion

The ETEN Lab dark mode theme represents the pinnacle of professional Bible translation software design. By directly matching etenlab.org's aesthetic while optimizing for extended use, this theme provides:

- **Authentic Brand Experience** matching the official ETEN Lab website
- **Superior Readability** with high contrast white text on dark backgrounds
- **Professional Aesthetics** suitable for technical and academic work
- **Eye Strain Reduction** for comfortable extended translation sessions
- **Modern Interface Design** that appeals to contemporary users

The dark theme serves as the primary theme for the application, providing users with an immersive, focused environment that maintains complete brand consistency while delivering exceptional usability for Bible translation work.

## Technical Specifications

### Color Accuracy
All colors have been precisely matched to etenlab.org specifications:
- **Primary Green**: Exact hex match (#c1d72e)
- **Background Black**: Pure black (#000000) as used on the website
- **Surface Greys**: Carefully calibrated grey scale for optimal hierarchy

### Accessibility Compliance
- **WCAG 2.1 AA**: All text combinations exceed minimum contrast requirements
- **Focus Indicators**: Bright green outlines ensure keyboard navigation visibility
- **Color Independence**: All interface states remain clear without color dependence
- **Screen Reader Support**: Semantic markup maintained across all components

This comprehensive dark mode theme establishes ETEN Innovation Lab Translation Helps as a professional, modern tool that honors the brand while providing exceptional user experience for Bible translation work. 