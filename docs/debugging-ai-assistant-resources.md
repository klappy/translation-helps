# Debugging AI Assistant Resource Loading Issues

## 🐛 Quick Diagnosis Guide

**Symptoms**: AI Assistant shows "0 resources" but panels show data  
**Root Cause**: Services using hardcoded file paths instead of catalog API ingredients  
**Solution**: Use ingredients-based file resolution

---

## Step-by-Step Debugging Process

### 1. Open Browser Console
Navigate to Genesis 1:1 and open Developer Tools → Console

### 2. Check Resource Loading Logs
Look for these patterns:

#### ✅ HEALTHY LOGS (Working)
```
🔄 ResourcesContext: Loading TN for gen 1:1 from unfoldingWord/en
🔍 Getting resource data for tn: unfoldingWord_en_tn
✅ Found resource data for tn: { id: "tn", subject: "Translation Notes", ingredientsCount: 66 }
🔄 TN Service: Loading with resource data for gen 1:1
✅ TN Service: Found file path in ingredients: 01-GEN.tsv
✅ TN Service: Loaded 45 notes using 01-GEN.tsv
✅ ResourcesContext: TN loaded - 45 notes found
```

#### ❌ BROKEN LOGS (Not Working)
```
🔄 ResourcesContext: Loading TN for gen 1:1 from unfoldingWord/en
❌ ResourcesContext: Failed to load translation notes: Failed to load tn_GEN.tsv for en_tn: Not Found
```

### 3. Use Debug Button
Click the 🐛 Debug button in AI Assistant panel and check console for:

```
🐛 DEBUG: LLMChatPanel context inspection
📋 Direct ResourcesContext data: { reference: {...}, resources: {...} }
🔍 Resource breakdown:
  - Scripture: AVAILABLE
  - Translation Notes: 0 items  ← PROBLEM!
  - Translation Questions: 0 items  ← PROBLEM!
  - Translation Words: 5 items  ← Working
  - Translation Word Links: 3 items  ← Working
```

### 4. Check Network Tab
1. Open Developer Tools → Network tab
2. Filter by "tsv" or "usfm"
3. Look for failed requests (red status)

#### Common Failed URLs
```
❌ https://git.door43.org/unfoldingWord/en_tn/raw/branch/master/tn_GEN.tsv (404)
❌ https://git.door43.org/unfoldingWord/en_tq/raw/branch/master/tq_GEN.tsv (404)
```

#### Correct URLs (after fix)
```
✅ https://git.door43.org/unfoldingWord/en_tn/raw/branch/master/01-GEN.tsv (200)
✅ https://git.door43.org/unfoldingWord/en_tq/raw/branch/master/01-GEN.tsv (200)
```

---

## Common Issues & Solutions

### Issue 1: Service Using Hardcoded Naming
**Symptom**: `Failed to load tn_GEN.tsv`  
**Cause**: Service not using ingredients array  
**Fix**: Update service to use `getNotesForVerseWithResourceData()`

### Issue 2: No Resource Data
**Symptom**: `No resource data provided for Translation Notes`  
**Cause**: ResourcesContext not getting catalog API data  
**Fix**: Check `getResourceData()` function in ResourcesContext

### Issue 3: Missing Ingredients Array
**Symptom**: `No ingredients array, using naming convention`  
**Cause**: Catalog API response missing ingredients  
**Fix**: Verify catalog API endpoint and response structure

### Issue 4: Book Not Found in Ingredients
**Symptom**: `Book gen not found in ingredients`  
**Cause**: Book identifier mismatch  
**Fix**: Check ingredient identifiers vs bookId format

---

## Manual Testing Checklist

### Before Fix (Expected Failures)
- [ ] Navigate to Genesis 1:1
- [ ] Open AI Assistant tab
- [ ] Click debug button
- [ ] Verify Translation Notes: 0 items
- [ ] Verify Translation Questions: 0 items
- [ ] Check console for 404 errors
- [ ] Check Network tab for failed tsv requests

### After Fix (Expected Success)
- [ ] Navigate to Genesis 1:1
- [ ] Open AI Assistant tab
- [ ] Click debug button
- [ ] Verify Translation Notes: >0 items
- [ ] Verify Translation Questions: >0 items
- [ ] Check console for successful loading logs
- [ ] Check Network tab for 200 responses
- [ ] Send test message to AI - should include all resources

---

## Code Inspection Points

### 1. ResourcesContext.jsx
Check if using enhanced services:
```javascript
// ✅ CORRECT
import { getNotesForVerseWithResourceData } from "../services/tnService";

const tnResourceData = await getResourceData('tn', tnConfig);
if (tnResourceData) {
  result = await getNotesForVerseWithResourceData(bookId, chapter, verse, tnResourceData, languageId);
}

// ❌ WRONG
import { getNotesForVerse } from "../services/tnService";
const result = await getNotesForVerse(bookId, chapter, verse, tnConfig.organization, languageId);
```

### 2. Service Files (tnService.js, tqService.js)
Check for enhanced functions:
```javascript
// ✅ CORRECT - Has enhanced function
export async function getNotesForVerseWithResourceData(bookId, chapter, verse, resourceData, languageId) {
  const ingredient = resourceData.ingredients.find(ing => ing.identifier === bookId);
  const filePath = ingredient ? ingredient.path : `tn_${bookId.toUpperCase()}.tsv`;
  // ...
}

// ❌ WRONG - Only hardcoded function
export async function getNotesForVerse(bookId, chapter, verse, organization, languageId) {
  const filePath = `tn_${bookId.toUpperCase()}.tsv`; // Hardcoded!
  // ...
}
```

### 3. Catalog Service Import
Check ResourcesContext imports:
```javascript
// ✅ CORRECT
import { searchAllResourcesForLanguage } from "../services/catalogService";

// ❌ WRONG - Missing catalog service
// No import for getting resource data
```

---

## Performance Impact

### Before Fix
- Multiple 404 errors (wasted bandwidth)
- Empty AI context (poor user experience)
- Inconsistent behavior across organizations

### After Fix
- Efficient resource loading with correct paths
- Complete AI context with all resources
- Consistent behavior across all organizations
- Proper caching of resource data

---

## Monitoring & Alerts

### Console Patterns to Monitor
```javascript
// Set up monitoring for these error patterns
const errorPatterns = [
  /Failed to load.*\.tsv.*Not Found/,
  /No resource data provided/,
  /Book .* not found in ingredients/
];

// Success patterns to verify
const successPatterns = [
  /Found file path in ingredients/,
  /Loaded \d+ notes using/,
  /TN loaded - \d+ notes found/
];
```

### Health Check Function
```javascript
function checkResourceLoadingHealth() {
  const context = window._resourcesContext?.getFormattedContext();
  return {
    scripture: !!context?.resources?.scripture,
    translationNotes: (context?.resources?.translationNotes?.length || 0) > 0,
    translationQuestions: (context?.resources?.translationQuestions?.length || 0) > 0,
    translationWords: (context?.resources?.translationWords?.length || 0) > 0,
    translationWordLinks: (context?.resources?.translationWordLinks?.length || 0) > 0
  };
}
```

---

**🔧 Remember: When in doubt, check the ingredients! The catalog API knows the real file paths.** 