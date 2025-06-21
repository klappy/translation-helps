# ⚠️ CRITICAL: NO MANIFESTS - API-DIRECT ARCHITECTURE ONLY

## 🚨 DO NOT USE MANIFESTS! 🚨

This application uses **API-direct architecture** which means:

- ❌ **NO `manifest.yaml` files**
- ❌ **NO `fetchManifest()` calls**  
- ❌ **NO manifest-based file path resolution**
- ✅ **Use `ingredients` array from catalog API**
- ✅ **Use resource data directly from API**

## Why No Manifests?

1. **Performance**: Manifests require extra API calls (1 per resource)
2. **Reliability**: Manifest files can be missing or malformed
3. **Efficiency**: Catalog API already provides all needed metadata
4. **Simplicity**: Direct file access is faster and more reliable

## Correct Approach: Use Ingredients Array

### ✅ CORRECT - Use ingredients from resource data:

```javascript
// Get resource data from catalog API
const resourceData = await searchResourcesAcrossOrgs(languageId, 'Bible');
const resource = resourceData.resources[org].find(r => r.id === 'ult');

// Use ingredients array for file paths
const ingredient = resource.ingredients.find(ing => ing.identifier === bookId);
const filePath = ingredient.path; // e.g., "57-TIT.usfm"

// Fetch the file
const usfm = await fetchResourceFile(languageId, resourceId, filePath, organization);
```

### ❌ WRONG - Don't use manifests:

```javascript
// DON'T DO THIS!
const manifest = await fetchManifest(languageId, resourceId, organization);
const project = manifest.projects.find(p => p.identifier === bookId);
const filePath = project.path;
```

## Resource Data Structure

The catalog API returns resources with this structure:

```javascript
{
  id: "ult",
  name: "en_ult", 
  organization: "unfoldingWord",
  books: ["gen", "exo", "tit", ...],           // Book list
  ingredients: [                               // File paths!
    {
      identifier: "tit",
      path: "./57-TIT.usfm"                   // Actual file path
    },
    {
      identifier: "gen", 
      path: "./01-GEN.usfm"
    }
  ]
}
```

## Service Functions

### Scripture Service (`scriptureService.js`)

- ✅ `fetchBook()` - Uses `resourceData.ingredients` for file paths
- ✅ `isBookAvailable()` - Checks `ingredients` and `books` arrays
- ❌ ~~`fetchManifest()`~~ - REMOVED
- ❌ ~~manifest-based functions~~ - DEPRECATED

### Translation Helps Services

All translation helps services use **ingredients-based file resolution**:

- **Translation Notes**: Use `resourceData.ingredients` to find actual file paths
- **Translation Questions**: Use `resourceData.ingredients` to find actual file paths  
- **Translation Word Links**: Use `resourceData.ingredients` to find actual file paths

### ✅ CORRECT - Use ingredients from resource data:
```javascript
// Get resource data from catalog API
const resourceData = await searchAllResourcesForLanguage(languageId);
const resource = resourceData.resources[org].find(r => r.subject === 'Translation Notes');

// Use ingredients array for file paths
const ingredient = resource.ingredients.find(ing => ing.identifier === bookId);
const filePath = ingredient.path; // e.g., "01-GEN.tsv" (actual file name!)

// Fetch the file
const content = await fetchResourceFile(languageId, 'tn', filePath, organization);
```

### ❌ WRONG - Don't use hardcoded naming:
```javascript
// DON'T DO THIS! Files may have different names
const filePath = `tn_${bookId.toUpperCase()}.tsv`; // May not exist!
```

### Enhanced Service Functions
Use the new enhanced service functions that accept resource data:
- `getNotesForVerseWithResourceData()` - Translation Notes with ingredients
- `getQuestionsForVerseWithResourceData()` - Translation Questions with ingredients
- Legacy functions available as fallback but may cause 404 errors

## Common Mistakes to Avoid

### 1. ❌ Reverting to manifest thinking
```javascript
// DON'T DO THIS!
const manifest = await fetchManifest(...);
const project = manifest.projects.find(...);
```

### 2. ❌ Hardcoding file names incorrectly
```javascript
// DON'T DO THIS!
const fileName = `${bookId}.usfm`; // Wrong! File is "57-TIT.usfm", not "tit.usfm"
```

### 3. ❌ Not using ingredients array
```javascript
// DON'T DO THIS!
const filePath = `${bookId}.usfm`; // Use ingredients array instead!
```

## Testing Guidelines

When writing tests:

1. ✅ Mock resource data with `ingredients` array
2. ✅ Test direct file access patterns
3. ❌ Don't mock `fetchManifest` calls
4. ❌ Don't test manifest-based logic

### Example Test Data:

```javascript
const mockResourceData = {
  id: "ult",
  books: ["tit", "gen"],
  ingredients: [
    { identifier: "tit", path: "./57-TIT.usfm" },
    { identifier: "gen", path: "./01-GEN.usfm" }
  ]
};
```

## Migration Checklist

If you find manifest references:

- [ ] Replace `fetchManifest()` calls with catalog API
- [ ] Update file path resolution to use `ingredients`
- [ ] Remove manifest-based logic
- [ ] Update tests to use resource data
- [ ] Add deprecation warnings to old functions

## Emergency Recovery

If the app breaks due to manifest reversion:

1. Check `scriptureService.js` - ensure it uses `ingredients` array
2. Check service calls - ensure they pass `resourceData`, not `manifest`
3. Check tests - ensure they mock resource data, not manifests
4. Look for `fetchManifest` calls and remove them

## Remember: NO MANIFESTS EVER! 🚨 