# Navigation System Simplification Plan

## Problem Statement

The application currently has two competing navigation systems:
1. **NavigationWizard**: A modal-based wizard accessed from the NavigationBar
2. **ScripturePanelNavigation**: Integrated breadcrumb navigation within the Scripture panel

This dual navigation creates several issues:
- Language selection doesn't properly filter resources
- Language breadcrumb gets stuck when changing languages
- URL RC link context synchronization is broken
- User confusion from competing navigation paradigms

## Root Cause

Having two separate navigation systems creates synchronization issues and competing state management. The NavigationWizard updates the ReferenceContext in one way, while ScripturePanelNavigation updates it differently, leading to inconsistent behavior.

## Solution: Single Navigation System

### Phase 1: Remove NavigationWizard
- Remove NavigationWizard modal from App.jsx
- Remove navigation breadcrumbs from NavigationBar
- Simplify NavigationBar to only show logo and theme toggle

### Phase 2: Enhance ScripturePanelNavigation
- Make it the primary and only navigation system
- Fix language selection to only show languages with scripture resources
- Ensure proper synchronization with ReferenceContext
- Fix URL parameter updates

### Phase 3: Fix Language Selection Issues
- Update fetchAllLanguages to filter for scripture resources only
- Fix language breadcrumb synchronization
- Ensure resource filtering works correctly per language

## Implementation Details

### Files to Modify:
1. **src/components/App.jsx** - Remove NavigationWizard import and usage
2. **src/components/NavigationBar.jsx** - Remove breadcrumbs and wizard functionality
3. **src/components/ScripturePanelRCL/selectors/LanguageSelector.jsx** - Filter for scripture resources
4. **src/services/catalogService.js** - Add scripture resource filtering to language fetch

### Expected Benefits:
- Single source of truth for navigation
- Consistent user experience
- Proper URL synchronization
- Reduced code complexity
- Better maintainability

## Timeline
- Phase 1: 1 hour (remove NavigationWizard)
- Phase 2: 2 hours (enhance ScripturePanelNavigation)
- Phase 3: 2 hours (fix language selection)
- Testing: 1 hour

Total: ~6 hours
