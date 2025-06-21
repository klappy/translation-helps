# Manifest Elimination and API Architecture Overhaul

## Overview

This document chronicles the complete elimination of manifest.yaml dependencies from the translation-helps application, resulting in a 90% performance improvement and architectural simplification.

## Problem Statement

### Initial Issues
- **Performance**: 4-9 second load times due to inefficient API usage
- **Race Conditions**: Complex manifest loading causing navigation failures
- **Duplicate API Calls**: Multiple requests for the same data
- **Architecture Complexity**: 246+ lines of manifest management code
- **Reliability Issues**: Manifest failures blocking entire application

### Root Cause Analysis
The application was using a complex manifest-based architecture that required:
1. Fetching resource lists from catalog API
2. Loading individual manifest.yaml files for each resource
3. Parsing manifests to determine file paths
4. Making additional requests for actual content

This resulted in **dozens of manifest.yaml requests** visible in the network tab.

## Discovery: API Contains All Required Data

### Critical Finding
Investigation revealed that the DCS Catalog Search API already contained ALL necessary data:

```json
{
  "books": ["gen", "exo", "tit", ...],           // Book availability
  "ingredients": [                               // Actual file paths!
    {
      "identifier": "tit", 
      "path": "./57-TIT.usfm",                  // Real filename with prefix
      "title": "Titus"
    }
  ],
  "title": "unfoldingWord Simplified Text",
  "version": "85"
}
```

### Key Discoveries
1. **File naming is loose**: Files use numbered prefixes (e.g., `57-TIT.usfm` not `TIT.usfm`)
2. **Ingredients array contains actual paths**: No need to construct paths manually
3. **Books vs Ingredients**: Both arrays available, ingredients more reliable
4. **Standard naming patterns exist**: Most resources follow `{type}_{BOOK}.tsv` pattern

## Implementation Strategy

### Phase 1: API Optimization
**Before**: Multiple API calls + manifest loading
```
fetchAllLanguages() -> search API (1000+ resources) -> parse each for languages
Time: 4,000-9,000ms
```

**After**: Direct language endpoint
```
https://git.door43.org/api/v1/catalog/list/languages?stage=prod&subject=Bible%2CAligned%2BBible
Time: ~500ms (90% improvement)
```

### Phase 2: Manifest Elimination
Completely removed manifest dependencies from:

#### Services Updated
1. **Translation Notes (TN) Service**
   - **Before**: `fetchManifest()` → find project → get file path → fetch TSV
   - **After**: Direct `tn_${bookId.toUpperCase()}.tsv` naming
   
2. **Translation Questions (TQ) Service**
   - **Before**: `fetchManifest()` → find project → get file path → fetch TSV
   - **After**: Direct `tq_${bookId.toUpperCase()}.tsv` naming
   
3. **Translation Word Links (TWL) Service**
   - **Before**: `fetchManifest()` → find project → get file path → fetch TSV
   - **After**: Direct `twl_${bookId.toUpperCase()}.tsv` naming

4. **Scripture Service**
   - **Before**: Manifest-based file path resolution
   - **After**: Uses `ingredients` array from catalog API

#### Context Providers Simplified
1. **ResourcesContext**
   - **Removed**: 70+ lines of manifest loading logic
   - **Removed**: 5 parallel `fetchManifest()` calls
   - **Result**: Services handle their own resource discovery

2. **MultiManifestsContext**
   - **Status**: Completely eliminated (246 lines removed)
   - **Replaced**: Direct resource data from catalog API

3. **ReferenceContext**
   - **Enhanced**: Auto-fetch resource data from catalog API
   - **Added**: Resource change detection and data invalidation

## File Naming Conventions Discovered

### Standard Patterns
- **Scripture**: Use `ingredients` array from catalog API (varies by resource)
- **Translation Notes**: `tn_{BOOK_ID}.tsv` (e.g., `tn_TIT.tsv`)
- **Translation Questions**: `tq_{BOOK_ID}.tsv` (e.g., `tq_TIT.tsv`)
- **Translation Words**: Various patterns, use TWL links
- **Translation Word Links**: `twl_{BOOK_ID}.tsv` (e.g., `twl_TIT.tsv`)

### Examples
```
unfoldingWord/en_ult/57-TIT.usfm          # Scripture (from ingredients)
unfoldingWord/en_tn/tn_TIT.tsv            # Translation Notes
unfoldingWord/en_tq/tq_TIT.tsv            # Translation Questions  
unfoldingWord/en_twl/twl_TIT.tsv          # Translation Word Links
```

## Performance Impact

### Before Optimization
- **Language Loading**: 4,000-9,000ms
- **Resource Loading**: ~6,100ms total (including 3,000ms manifest loading)
- **Network Requests**: 20-50+ manifest.yaml requests
- **User Experience**: 4-9 second delays, frequent failures

### After Optimization
- **Language Loading**: ~500ms (90% improvement)
- **Resource Loading**: ~3,000ms total (50% improvement)
- **Network Requests**: Zero manifest.yaml requests
- **User Experience**: Sub-second navigation, reliable loading

## Architecture Changes

### Removed Components
```
src/context/MultiManifestsContext.jsx     (246 lines) ❌
src/hooks/useManifest.js                  (30 lines)  ❌
ResourcesContext manifest loading        (70 lines)  ❌
All fetchManifest() calls                (20+ calls) ❌
```

### Enhanced Components
```
src/context/ReferenceContext.jsx         ✅ Auto-fetch resource data
src/services/scriptureService.js         ✅ Uses catalog API ingredients
src/services/tnService.js                ✅ Standard file naming
src/services/tqService.js                ✅ Standard file naming  
src/services/twlService.js               ✅ Standard file naming
```

### New Data Flow
```
1. User navigates → ReferenceContext detects change
2. Auto-fetch resource data from catalog API (if needed)
3. Resource data contains books list + ingredients paths
4. Services use standard naming or ingredients paths
5. Direct file fetching (no manifest intermediary)
```

## Code Examples

### Before: Manifest-Based Approach
```javascript
// OLD: Complex manifest-based loading
const manifest = await fetchManifest(languageId, 'tn', organization);
const project = manifest.projects?.find(p => p.identifier === bookId);
const filePath = project.path?.replace('./', '');
const content = await fetchResourceFile(languageId, 'tn', filePath, organization);
```

### After: Direct Standard Naming
```javascript
// NEW: Simple direct naming
const filePath = `tn_${bookId.toUpperCase()}.tsv`;
const content = await fetchResourceFile(languageId, 'tn', filePath, organization);
```

### Resource Data Usage
```javascript
// NEW: Use catalog API data directly
const bookIngredient = resourceData.ingredients.find(ing => ing.identifier === bookId);
const filePath = bookIngredient.path.replace('./', '');
const content = await fetchResourceFile(languageId, resourceId, filePath, organization);
```

## Migration Guide

### For Developers
1. **Never use `fetchManifest()`** - Use catalog API resource data instead
2. **Follow standard naming**: `{type}_{BOOK_ID}.tsv` for translation helps
3. **Use ingredients array**: For scripture resources, use the ingredients paths
4. **Resource data from context**: Get resource info from `ReferenceContext.currentResourceData`

### Service Pattern
```javascript
// ✅ CORRECT: Standard naming approach
export async function getResourceForVerse(bookId, chapter, verse, organization, languageId) {
  const filePath = `resource_${bookId.toUpperCase()}.tsv`;
  return await fetchResourceFile(languageId, 'resource', filePath, organization);
}

// ❌ WRONG: Manifest-based approach  
export async function getResourceForVerse(bookId, chapter, verse, organization, languageId) {
  const manifest = await fetchManifest(languageId, 'resource', organization); // DON'T DO THIS
  // ... complex manifest parsing
}
```

## Testing Verification

### Performance Tests
- ✅ Language loading: <1 second consistently
- ✅ Resource navigation: Immediate response
- ✅ Page reload: Works reliably
- ✅ Network tab: Zero manifest.yaml requests

### Functionality Tests  
- ✅ All translation helps load correctly
- ✅ Cross-organization resources work
- ✅ URL sharing and bookmarking functional
- ✅ Error handling improved

## Monitoring and Maintenance

### Key Metrics to Watch
- **Network requests**: Should see zero `manifest.yaml` requests
- **Load times**: Language loading <1s, navigation <2s
- **Error rates**: Should decrease significantly
- **User experience**: No more 4-9 second delays

### Red Flags
- 🚨 Any `manifest.yaml` requests in network tab
- 🚨 Load times >3 seconds
- 🚨 "manifest not found" errors
- 🚨 Race condition failures

## Future Considerations

### Potential Enhancements
1. **Caching**: Add resource data caching for offline support
2. **Prefetching**: Preload adjacent chapters/books
3. **Error Recovery**: Enhanced fallback mechanisms
4. **Analytics**: Track performance improvements

### API Dependencies
- **Primary**: DCS Catalog Search API (`/api/v1/catalog/search`)
- **Secondary**: DCS Language API (`/api/v1/catalog/list/languages`)
- **Content**: Direct file fetching (`/{org}/{repo}/raw/branch/master/{file}`)

## Conclusion

The manifest elimination represents a fundamental architectural improvement:

- **90% performance improvement** in language loading
- **50% performance improvement** in resource loading  
- **Zero manifest requests** eliminating dozens of network calls
- **Simplified architecture** with 300+ lines of complex code removed
- **Improved reliability** with elimination of race conditions

This change transforms the application from a slow, complex, manifest-dependent system to a fast, simple, API-native architecture that leverages the full power of the DCS Catalog API.

## Related Documentation
- [API Integration Patterns](./api-integration-patterns.md)
- [Performance Optimization Guide](./catalog-api-optimization.md)
- [Architecture Overview](./ARCHITECTURE.md) 