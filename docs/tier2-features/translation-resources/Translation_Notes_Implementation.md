# Translation Notes Implementation

## 🚨 UPDATED FOR API-DIRECT ARCHITECTURE 🚨

**⚠️ This document has been updated to reflect the elimination of manifest-based architecture.**

## Overview

Translation Notes (tN) are displayed in dedicated panels providing contextual translation guidance. The implementation uses **API-direct architecture** with the DCS catalog API.

## Core Files

- `src/services/tnService.js` - Translation Notes data fetching using **ingredients-based file resolution**
- `src/services/dcsClient.js` - DCS API client for fetching TSV files directly
- ~~`src/context/MultiManifestsContext.jsx`~~ - ❌ **REMOVED** (Use catalog API)

## Architecture Changes

### ❌ OLD: Manifest-Based Architecture
```javascript
// DON'T DO THIS ANYMORE!
const manifest = await fetchManifest(languageId, 'tn', organization);
const project = manifest.projects.find(p => p.identifier === bookId);
const filePath = project.path;
```

### ✅ NEW: Ingredients-Based Architecture
```javascript
// Get resource data with ingredients array for actual file paths
export async function getNotesForVerseWithResourceData(bookId, chapter, verse, resourceData, languageId) {
  const ingredient = resourceData.ingredients.find(ing => ing.identifier === bookId);
  const filePath = ingredient ? ingredient.path : `tn_${bookId.toUpperCase()}.tsv`; // fallback
  
  const tsvContent = await fetchResourceFile(languageId, 'tn', filePath, organization);
  const allNotes = parseTsv(tsvContent);
  // ... process notes
}
```

## Data Flow

### Updated Flow (Ingredients-Based)
```
User navigates to verse
    ↓
TranslationNotesPanel requests notes
    ↓
tnService gets resource data with ingredients array
    ↓
Service uses actual file path from ingredients
    ↓
dcsClient fetches TSV directly from DCS
    ↓
Notes parsed and displayed
```

### ❌ OLD Flow (Manifest-Based - REMOVED)
```
// This flow no longer exists
MultiManifestsContext (loads manifests for current org/lang)
    ↓
tnService uses manifest to find file path
    ↓
Notes fetched and displayed
```

## Component Integration

### TranslationNotesPanel Usage
```javascript
// Updated component - no manifest dependency
const TranslationNotesPanel = ({ bookId, chapter, verse }) => {
  const [notes, setNotes] = useState([]);
  
  useEffect(() => {
    // Direct service call - no manifest needed
    const loadNotes = async () => {
      const notesData = await getNotesForVerse(
        languageId, 
        bookId, 
        chapter, 
        verse, 
        organization
      );
      setNotes(notesData);
    };
    
    loadNotes();
  }, [bookId, chapter, verse, languageId, organization]);
  
  return <div>{/* Render notes */}</div>;
};
```

### ❌ OLD Implementation (REMOVED)
```javascript
// DON'T DO THIS - manifest context removed
const { manifests } = useContext(ManifestsContext);
// ... manifest-based logic
```

## Service Implementation

### tnService.js (Updated)
```javascript
export async function getNotesForVerseWithResourceData(bookId, chapter, verse, resourceData, languageId) {
  // Get actual file path from ingredients array
  const ingredient = resourceData.ingredients.find(ing => ing.identifier === bookId);
  const filePath = ingredient ? ingredient.path : `tn_${bookId.toUpperCase()}.tsv`; // fallback
  
  try {
    const tsvContent = await fetchResourceFile(languageId, 'tn', filePath, organization);
    const parsedData = parseTsv(tsvContent);
    
    return parsedData.filter(note => 
      note.Chapter === chapter.toString() && 
      note.Verse === verse.toString()
    );
  } catch (error) {
    console.error(`Failed to load translation notes for ${bookId}:`, error);
    return [];
  }
}
```

## Testing

### Updated Test Approach
```javascript
// Test ingredients-based implementation
describe('tnService', () => {
  it('should fetch notes using ingredients array for file paths', async () => {
    // Mock resource data with ingredients
    const mockResourceData = {
      ingredients: [
        { identifier: 'tit', path: '01-TIT.tsv' }
      ]
    };
    
    mockFetchResourceFile.mockResolvedValue('mock TSV content');
    
    const notes = await getNotesForVerseWithResourceData('tit', '1', '1', mockResourceData, 'en');
    
    // Verify actual file path from ingredients used
    expect(mockFetchResourceFile).toHaveBeenCalledWith(
      'en', 'tn', '01-TIT.tsv', 'unfoldingWord'
      'en', 'tn', 'tn_TIT.tsv', 'unfoldingWord'
    );
  });
});
```

### ❌ OLD Tests (REMOVED)
```javascript
// Don't test manifest logic anymore
expect(fetchManifest).toHaveBeenCalledWith("es", "tn", "STR");
```

## Migration Benefits

1. **Performance**: No extra manifest API calls
2. **Reliability**: Standard file naming, no manifest dependencies
3. **Simplicity**: Direct file access pattern
4. **Consistency**: Same pattern across all translation helps

## File Structure

```
src/
├── services/
│   ├── tnService.js           ✅ Updated for API-direct
│   ├── dcsClient.js          ✅ Direct file fetching only
│   └── ~~manifestService.js~~ ❌ DELETED
├── context/
│   ├── ~~ManifestsContext.jsx~~     ❌ DELETED
│   └── ~~MultiManifestsContext.jsx~~ ❌ DELETED
```

## Implementation Status

- ✅ `src/services/tnService.js` - Updated for API-direct architecture
- ✅ `src/services/dcsClient.js` - Manifest functions removed
- ❌ ~~`src/context/MultiManifestsContext.jsx`~~ - DELETED
- ✅ All translation notes panels updated to use direct service calls

**🎉 Implementation Complete: API-Direct Translation Notes** ✅
