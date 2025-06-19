# ETEN Lab Font System Integration

## Overview

Based on analysis of the ETEN Lab website (etenlab.org), their brand uses a sophisticated font system that creates a modern, technical, and accessible visual hierarchy. This document outlines the fonts used and recommendations for implementation in the translationHelps Viewer.

## ETEN Lab Font Analysis

### Primary Font Families

#### 1. **Figtree** (Primary Brand Font)
- **Role**: Main brand font for all UI elements
- **Variants Used**: 
  - Light (300)
  - Regular (400) 
  - SemiBold (600)
  - Bold (700)
  - ExtraBold (800)
  - Black (900)
- **Usage**: Headers, body text, navigation, buttons
- **Characteristics**: Modern, clean, highly readable

#### 2. **Jura** (Secondary Brand Font)
- **Role**: Technical/accent font for special elements
- **Variants Used**:
  - Light (300)
  - Medium (500)
  - SemiBold (600)
  - Bold (700)
- **Usage**: Special headings, technical content, emphasis
- **Characteristics**: Geometric, technical feel, distinctive

#### 3. **DIN Next** (Tertiary Font)
- **Role**: Small text and metadata
- **Variants Used**: Light (300)
- **Usage**: Captions, timestamps, version numbers
- **Characteristics**: Ultra-clean, technical, space-efficient

#### 4. **Madefor Text** (Body Font)
- **Role**: Long-form readable content
- **Usage**: Scripture text, help content, documentation
- **Characteristics**: Optimized for extended reading

#### 5. **System Fonts** (Fallback)
- **Role**: Performance and compatibility fallback
- **Stack**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif

## Recommended Implementation

### CSS Variable System

```css
:root {
  /* ETEN Lab Font Families */
  --font-family-primary: "Figtree", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-family-heading: "Jura", "Figtree", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-body: "Madefor Text", "Figtree", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-mono: "Monaco", "Menlo", "Ubuntu Mono", "Courier New", monospace;
  --font-family-meta: "DIN Next", "Figtree", -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Default font family (maps to primary) */
  --font-family: var(--font-family-primary);
  
  /* Font Weights - Aligned with available weights */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
  --font-weight-black: 900;
}
```

### Font Loading Strategy

#### Option 1: Google Fonts (Recommended for Figtree)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">
```

#### Option 2: Self-Hosted Fonts
```css
@font-face {
  font-family: 'Figtree';
  src: url('/fonts/Figtree-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
/* Repeat for each weight */
```

### Usage Patterns

#### 1. **Headers and Titles**
```css
h1, h2, h3 {
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
}

.panel-title {
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-semibold);
}
```

#### 2. **Body Text**
```css
.scripture-text {
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-regular);
  line-height: 1.6;
}

.help-content {
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-regular);
}
```

#### 3. **UI Elements**
```css
.btn {
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.01em;
}

.navigation-item {
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-regular);
}
```

#### 4. **Technical Content**
```css
.verse-number {
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.reference-code {
  font-family: var(--font-family-mono);
  font-size: 0.9em;
}
```

#### 5. **Metadata**
```css
.timestamp,
.version-info,
.status-text {
  font-family: var(--font-family-meta);
  font-weight: var(--font-weight-light);
  font-size: var(--font-size-xs);
  letter-spacing: 0.02em;
}
```

## Component-Specific Applications

### Scripture Panel
- **Chapter Headers**: Jura Bold
- **Verse Numbers**: Jura SemiBold (ETEN Lab green)
- **Scripture Text**: Madefor Text Regular
- **Footnotes**: DIN Next Light

### Navigation
- **Main Menu**: Figtree Regular
- **Active Items**: Figtree SemiBold
- **Breadcrumbs**: DIN Next Light

### Chat Interface
- **User Messages**: Figtree Regular
- **AI Responses**: Madefor Text Regular
- **Timestamps**: DIN Next Light
- **Cost Pills**: Figtree Medium

### Help Panel
- **Section Headers**: Jura Bold
- **Content**: Madefor Text Regular
- **Resource Links**: Figtree Medium
- **Metadata**: DIN Next Light

## Performance Considerations

### Font Loading Optimization
1. **Use font-display: swap** for better perceived performance
2. **Subset fonts** to include only needed characters
3. **Preload critical fonts** in document head
4. **Use variable fonts** where available (reduces file count)

### Fallback Strategy
```css
/* Progressive enhancement approach */
.text {
  /* System fonts load immediately */
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

/* When custom fonts load */
.fonts-loaded .text {
  font-family: var(--font-family-primary);
}
```

## Accessibility

### Font Size Minimums
- Body text: 14px (0.875rem) minimum
- Small text: 12px (0.75rem) minimum
- Mobile: Consider 16px base for better readability

### Line Height Guidelines
- Body text: 1.5-1.6 for optimal readability
- Headers: 1.2-1.3 for compact display
- Small text: 1.4 minimum

### Contrast Requirements
- Ensure all text meets WCAG AA standards
- Test fonts at different weights with theme colors
- Lighter weights need higher contrast

## Migration Path

### Phase 1: Core Implementation
1. Add font variables to globals.css
2. Update --font-family to use Figtree
3. Test fallback behavior

### Phase 2: Component Updates
1. Update headers to use Jura
2. Apply Madefor Text to scripture/help content
3. Use DIN Next for metadata

### Phase 3: Refinement
1. Adjust letter-spacing for optimal display
2. Fine-tune font weights per component
3. Optimize loading performance

## Testing Checklist

- [ ] Fonts load correctly on all browsers
- [ ] Fallback fonts display properly
- [ ] Text remains readable during font swap
- [ ] Performance metrics remain acceptable
- [ ] Accessibility standards maintained
- [ ] Dark mode contrast verified
- [ ] Mobile readability confirmed

## Conclusion

The ETEN Lab font system creates a sophisticated, modern interface that balances technical precision with readability. By implementing these fonts systematically, the translationHelps Viewer will align perfectly with ETEN Lab's brand identity while maintaining excellent usability and performance. 