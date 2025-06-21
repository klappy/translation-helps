# Translation Helps Navigation System

## Overview

The Translation Helps Navigation System provides inline navigation within each translation helps panel (Notes, Questions, Words, TWL) to allow users to select alternative languages and organizations when resources are not available in their current selection.

This system maintains the user's primary Scripture selection while enabling cross-organization resource discovery for translation helps.

## User Experience Flow

### Current Behavior (Before)
1. User selects Scripture: English ULT from Door43-Catalog
2. Translation Notes panel shows: "Translation notes are not available for this selection"
3. User has no way to find Translation Notes in other languages/organizations

### New Behavior (After)
1. User selects Scripture: English ULT from Door43-Catalog
2. Translation Notes panel detects no notes available
3. Panel shows inline navigation: "Translation Notes not available. Find in another language/organization?"
4. User clicks to start navigation
5. Step 1: Language selection (English, Spanish, French, etc.)
6. Step 2: Organization/Resource selection (shows available Translation Notes resources)
7. User selects: Spanish Translation Notes from unfoldingWord
8. Panel updates to show Spanish Translation Notes for the same verse
9. Scripture panel remains unchanged (English ULT)

## Technical Architecture

### Core Components

#### 1. InlineHelpsNavigation Component
**Location**: `src/components/InlineHelpsNavigation/`

**Purpose**: Reusable navigation component for all translation helps panels

**Props**:
```jsx
<InlineHelpsNavigation
  resourceType="tn"                    // Resource type: tn, tq, tw, twl
  currentReference={reference}         // Current book/chapter/verse
  onResourceSelect={handleRcLinkClick} // RC link callback
  isResourceAvailable={false}          // Whether to show navigation
/>
```

**Features**:
- Reuses existing `LanguageSelector` and `ResourceSelector` components
- Filters search results by specific resource type
- Generates RC links for selected resources
- Matches Scripture panel UI patterns and styling

#### 2. RC Link Integration
**Existing System**: Uses established RC link format and handling

**RC Link Format**:
```
rc://{languageId}/{resourceType}/help/{bookId}/{chapter}/{verse}
```

**Examples**:
- `rc://es/tn/help/tit/01/01` - Spanish Translation Notes for Titus 1:1
- `rc://fr/tq/help/gen/01/01` - French Translation Questions for Genesis 1:1
- `rc://en/tw/help/mat/05/03` - English Translation Words for Matthew 5:3

**Integration Points**:
- Uses existing `handleRcLinkClick` from `MainView`
- Leverages existing RC link parsing in `rcLinkUtils`
- Maintains current URL persistence mechanism

#### 3. Context Integration
**ReferenceContext Enhancements**:
- `mixedResources` state tracks cross-organization selections
- URL parameters persist mixed resource selections
- Resource availability detection triggers navigation display

**URL Parameter Format**:
```
?scriptures=[/Door43-Catalog/en/ult/tit/1/1]&resources=[/Door43-Catalog/en/tn,/Door43-Catalog/en/tq]
&tn_org=unfoldingWord&tn_lang=es&tn_resource=tn
&tq_org=Door43-Catalog&tq_lang=fr&tq_resource=tq
```

### Resource Discovery

#### 1. Search Strategy
**API Calls**: Uses existing `searchResourcesAcrossOrgs()` function

**Search Filters**:
- Language-specific search
- Resource type filtering (Translation Notes, Translation Questions, etc.)
- Organization priority: unfoldingWord → Door43-Catalog → others
- Shows all available options

**Example Search**:
```javascript
// Search for Translation Notes in Spanish
const result = await searchResourcesAcrossOrgs('es', 'Translation Notes');
// Returns: { resources: { 'unfoldingWord': [...], 'Door43-Catalog': [...] } }
```

#### 2. Resource Selection Priority
1. **User's Primary Organization** (if available)
2. **Scripture Organization** (for consistency)
3. **unfoldingWord** (highest quality)
4. **Door43-Catalog** (comprehensive coverage)
5. **Other Organizations** (by quality metrics)

### Panel Integration

#### 1. Detection Logic
Each translation helps panel checks resource availability:

```javascript
// In TranslationNotesPanel.jsx
const isResourceAvailable = notes && notes.length > 0 && !error;
const showNavigation = !isResourceAvailable;
```

#### 2. Navigation Display
When resource is not available:
```jsx
{showNavigation && (
  <InlineHelpsNavigation
    resourceType="tn"
    currentReference={reference}
    onResourceSelect={handleRcLinkClick}
    isResourceAvailable={false}
  />
)}
```

#### 3. Resource Loading
After navigation selection:
```javascript
// RC link triggers resource loading
handleRcLinkClick('rc://es/tn/help/tit/01/01', 'es', 'unfoldingWord');
// Updates mixedResources in context
// Triggers panel re-render with new resource
```

## Implementation Plan

### Phase 1: Core Infrastructure ✅ COMPLETED
1. **Create InlineHelpsNavigation component** ✅
   - ✅ Reused existing LanguageSelector component
   - ✅ Implemented resource type filtering with searchResourcesAcrossOrgs
   - ✅ Added RC link generation following documented format
   - ✅ Created CSS module with consistent styling patterns

2. **Enhance ReferenceContext** ⏳ NEXT
   - Add mixed resource URL parameter handling
   - Implement resource availability detection
   - Add cross-organization state management

### Phase 2: Panel Integration ✅ COMPLETED
1. **Update TranslationNotesPanel** ✅
   - ✅ Added navigation component integration
   - ✅ Implemented resource availability detection
   - ✅ RC link handling ready for testing

2. **Update TranslationQuestionsPanel** ✅
   - ✅ Same pattern as Translation Notes
   - ✅ Resource type: 'tq'

3. **Update TranslationWordsPanel** ✅
   - ✅ Same pattern as Translation Notes
   - ✅ Resource type: 'tw'

4. **Update TWLPanel** ✅
   - ✅ Same pattern as Translation Notes
   - ✅ Resource type: 'twl'

### Phase 3: Enhancement & Polish
1. **URL Persistence**
   - Mixed resource parameters in URL
   - Browser navigation support
   - Direct linking to mixed resources

2. **User Experience**
   - Loading states during navigation
   - Error handling for failed searches
   - Accessibility improvements

3. **Performance Optimization**
   - Cache search results
   - Debounce API calls
   - Lazy load navigation components

## User Interface Patterns

### Navigation States

#### 1. Resource Available
```
┌─────────────────────────────────────┐
│ Translation Notes                   │
│ ┌─────────────────────────────────┐ │
│ │ Note 1: "In this verse..."      │ │
│ │ Note 2: "The word means..."     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### 2. Resource Not Available - Collapsed
```
┌─────────────────────────────────────┐
│ Translation Notes                   │
│ ┌─────────────────────────────────┐ │
│ │ Translation Notes not available │ │
│ │ [Find in another language/org]  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### 3. Resource Not Available - Navigation Active
```
┌─────────────────────────────────────┐
│ Translation Notes                   │
│ ┌─────────────────────────────────┐ │
│ │ ← Cancel  Select Translation Notes│ │
│ │                                 │ │
│ │ Step 1: Select Language         │ │
│ │ [🇺🇸 English] [🇪🇸 Spanish]      │ │
│ │ [🇫🇷 French]  [🇩🇪 German]       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### 4. Organization Selection
```
┌─────────────────────────────────────┐
│ Translation Notes                   │
│ ┌─────────────────────────────────┐ │
│ │ ← Back    Select Organization   │ │
│ │                                 │ │
│ │ unfoldingWord                   │ │
│ │ ├ 📝 Translation Notes v1.2     │ │
│ │                                 │ │
│ │ Door43-Catalog                  │ │
│ │ ├ 📝 Translation Notes v1.0     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Cross-Organization Indicators

#### 1. Organization Badge
When using different organization than Scripture:
```
┌─────────────────────────────────────┐
│ Translation Notes [from unfoldingWord] │
│ ┌─────────────────────────────────┐ │
│ │ Note content in Spanish...      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### 2. Language Indicator
When using different language than Scripture:
```
┌─────────────────────────────────────┐
│ Translation Notes [🇪🇸 Spanish]     │
│ ┌─────────────────────────────────┐ │
│ │ Contenido de la nota...         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Testing Strategy

### Unit Tests
1. **InlineHelpsNavigation Component**
   - Resource type filtering
   - Language selection
   - Organization selection
   - RC link generation

2. **ReferenceContext**
   - Mixed resource state management
   - URL parameter parsing
   - Resource availability detection

### Integration Tests
1. **Panel Integration**
   - Navigation trigger conditions
   - RC link handling
   - Resource loading after selection

2. **Cross-Panel Consistency**
   - Multiple panels with different resources
   - URL persistence across navigation
   - Browser back/forward support

### End-to-End Tests
1. **User Workflows**
   - Complete navigation flow
   - Mixed resource selection
   - URL sharing and direct linking

2. **Error Scenarios**
   - Network failures during search
   - Invalid resource selections
   - Malformed RC links

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**
   - Load navigation components only when needed
   - Defer resource searches until user interaction

2. **Caching**
   - Cache search results by language/resource type
   - Persist cache across sessions

3. **API Efficiency**
   - Batch resource searches when possible
   - Use existing catalog service optimizations

### Resource Management
1. **Memory Usage**
   - Unload unused navigation components
   - Limit cached search results

2. **Network Usage**
   - Minimize redundant API calls
   - Use efficient search filters

## Accessibility

### Keyboard Navigation
- Tab through language options
- Arrow keys for selection grids
- Enter/Space for selection
- Escape to cancel navigation

### Screen Reader Support
- Proper ARIA labels for navigation states
- Announce resource availability changes
- Clear navigation instructions

### Visual Indicators
- High contrast for navigation states
- Clear focus indicators
- Loading and error state announcements

## Future Enhancements

### Advanced Features
1. **Resource Recommendations**
   - Suggest best alternative resources
   - Quality-based rankings
   - User preference learning

2. **Bulk Operations**
   - Select organization for all helps at once
   - Save preferred organization combinations
   - Quick switching between resource sets

3. **Offline Support**
   - Cache resource availability data
   - Offline navigation capabilities
   - Sync preferences across devices

### Analytics Integration
1. **Usage Tracking**
   - Navigation usage patterns
   - Resource selection preferences
   - Cross-organization usage metrics

2. **Performance Monitoring**
   - Navigation completion rates
   - Search response times
   - Error frequency tracking

---

## Summary

The Translation Helps Navigation System provides a seamless way for users to access translation resources across different languages and organizations while maintaining their primary Scripture selection. By reusing existing UI patterns and RC link infrastructure, the system integrates naturally with the current application architecture while providing powerful new capabilities for resource discovery and selection. 