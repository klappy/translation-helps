# Resource Service Quick Reference Card

## 🚨 NEVER DO THIS
```javascript
// ❌ WRONG: Hardcoded file naming
const filePath = `tn_${bookId.toUpperCase()}.tsv`;
const filePath = `tq_${bookId.toUpperCase()}.tsv`;
const filePath = `tw_${bookId.toUpperCase()}.tsv`;
```

## ✅ ALWAYS DO THIS
```javascript
// ✅ CORRECT: Use ingredients array
const ingredient = resourceData.ingredients.find(ing => ing.identifier === bookId);
const filePath = ingredient ? ingredient.path : `fallback_${bookId.toUpperCase()}.tsv`;
```

---

## Service Function Template

```javascript
export async function getResourceWithResourceData(
  bookId,
  chapter,
  verse,
  resourceData, // ← Always require this!
  languageId = "en"
) {
  if (!resourceData) {
    throw new Error(`No resource data provided`);
  }

  // 1. Get file path from ingredients
  let filePath;
  if (resourceData.ingredients?.length > 0) {
    const ingredient = resourceData.ingredients.find(ing => ing.identifier === bookId);
    filePath = ingredient?.path || `fallback_${bookId.toUpperCase()}.tsv`;
  } else {
    filePath = `fallback_${bookId.toUpperCase()}.tsv`;
  }

  // 2. Get organization from resource data
  const organization = resourceData.owner?.login || resourceData.organization || "unfoldingWord";

  // 3. Fetch using actual file path
  const content = await fetchResourceFile(languageId, RESOURCE_ID, filePath, organization);
  
  // 4. Process and return
  return processContent(content);
}
```

---

## ResourcesContext Pattern

```javascript
// 1. Get resource data from catalog API
const resourceData = await getResourceData(resourceType, config);

// 2. Use enhanced service if available
let result;
if (resourceData) {
  result = await getResourceWithResourceData(bookId, chapter, verse, resourceData, languageId);
} else {
  result = await getResourceFallback(bookId, chapter, verse, organization, languageId);
}
```

---

## Debugging Checklist

### ✅ Success Indicators
- Console shows: `Found file path in ingredients: 01-GEN.tsv`
- Network tab shows: `200 OK` for resource files
- AI Assistant shows: `>0 items` for all resource types

### ❌ Failure Indicators  
- Console shows: `Failed to load tn_GEN.tsv: Not Found`
- Network tab shows: `404 Not Found` for resource files
- AI Assistant shows: `0 items` for resource types

---

## Import Checklist

```javascript
// Required imports for enhanced services
import { searchAllResourcesForLanguage } from "../services/catalogService";
import { getNotesForVerseWithResourceData } from "../services/tnService";
import { getQuestionsForVerseWithResourceData } from "../services/tqService";
```

---

**💡 Remember: The catalog API knows the truth. Trust the ingredients array!** 