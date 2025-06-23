# Splash Screen Feature Documentation

## Overview

The Translation Helps application includes an elegant splash screen that introduces users to the app's purpose, features, and unique AI-built nature. The splash screen appears on first visit and can be triggered manually via URL parameter.

## Architecture

### Components

1. **SplashScreen.jsx** - Main component handling animations and content display
2. **SplashScreen.module.css** - Theme-aware styling with animations
3. **splash-content.md** - Editable markdown file for easy content updates

### Integration Points

- **App.jsx** - Controls splash screen display logic
- **localStorage** - Tracks if user has seen splash (`hasSeenSplash`)
- **URL Parameter** - Force display with `?splash=true`

## Features

### Visual Design

- **Animated Logo**: Pulsing ETEN Lab green logo with "TH" branding
- **Staggered Animations**: Content reveals in sequence for visual appeal
- **Floating Elements**: Subtle background animations for depth
- **Theme Support**: Full light/dark mode compatibility

### Content Sections

1. **Header**: Logo, title, and ETEN Lab branding
2. **Tagline**: Mission statement about Bible translation
3. **Features Grid**: Icon-based feature showcase
4. **AI Badge**: Highlights 100% AI-built nature
5. **CTA Button**: "Begin Exploring" with hover effects
6. **Footer Quote**: Inspirational closing message

### Accessibility

- **Skip Button**: Allows immediate bypass for returning users
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels

## Content Management

The splash screen content is loaded from `/public/docs/splash-content.md`, allowing easy updates without code changes:

```markdown
# ETEN Innovation Lab Translation Helps

## Welcome to the Future of Bible Translation
[Tagline content]

### Key Features
#### 📖 Scripture Panel
[Feature description]
```

## Usage

### First Visit
The splash screen automatically displays on first visit to the application.

### Manual Trigger
Add `?splash=true` to the URL to force display:
```
https://translation-helps.netlify.app/?splash=true
```

### Programmatic Control
```javascript
// Clear splash seen flag
localStorage.removeItem('hasSeenSplash');

// Check if user has seen splash
const hasSeenSplash = localStorage.getItem('hasSeenSplash');
```

## Styling

The component uses CSS modules with theme variables:

```css
.splashContainer {
  background: var(--color-background);
  color: var(--color-text);
}

.logo {
  background: var(--color-primary);
  box-shadow: 0 8px 32px rgba(193, 215, 46, 0.3);
}
```

## Animation Sequence

1. **0ms**: Logo fade in
2. **200ms**: Title fade in
3. **400ms**: Tagline fade in
4. **600ms**: Features grid staggered fade in
5. **1200ms**: CTA button fade in
6. **1400ms**: Footer quote fade in

## Performance

- **Lazy Loading**: Content loaded asynchronously
- **Fallback Content**: Hardcoded backup if markdown fails
- **Smooth Transitions**: Hardware-accelerated animations
- **Minimal Re-renders**: Self-contained state management

## Testing

Run tests with:
```bash
npm test SplashScreen.test.jsx
```

Tests cover:
- Component rendering
- Content loading
- User interactions
- Theme compatibility
- Animation completion

## Future Enhancements

1. **Analytics Integration**: Track engagement metrics
2. **A/B Testing**: Test different content variations
3. **Video Background**: Optional video for more impact
4. **Multi-language**: Localized splash content
5. **Tour Integration**: Connect to app walkthrough
