# ResourcesContext Synchronization Fix - Translation Questions Missing from LLM Chat

## Issue Summary

Translation questions were displaying correctly in the UI panels but were not being included in the LLM chat context, causing cost estimates to show `translationQuestions: 0` even when questions were available for the current verse.

## Root Cause Analysis

The issue was a **synchronization mismatch** between two components accessing translation questions:

### 1. TranslationQuestionsPanel (Working)

- Uses manifest to extract custom file paths from tQ manifest projects
- Calls `getQuestionsForVerse()` with custom file path parameter
- Example: `tq_TIT.tsv` for Titus

### 2. ResourcesContext (Broken)

- Was calling `getQuestionsForVerse()` without custom file path
- Used default naming conventions instead of manifest-defined paths
- Failed to access files that don't follow default naming

## Technical Solution

### Fixed ResourcesContext to Use Identical Logic

Updated `src-new/context/ResourcesContext.jsx` to extract custom file paths from manifest exactly like `TranslationQuestionsPanel`:

```javascript
// Translation Questions (with custom file path from manifest)
currentManifests.tq
  ? (async () => {
      // Extract custom file path from manifest (same logic as TranslationQuestionsPanel)
      let customFilePath = null;
      const tqManifest = currentManifests.tq;

      if (tqManifest) {
        const project = tqManifest.projects?.find((p) => p.identifier === bookId);
        if (project && project.path) {
          customFilePath = project.path.replace("./", "");
          console.log(`ResourcesContext tQ: Using manifest file path: ${customFilePath}`);
        } else {
          console.log(
            `ResourcesContext tQ: Book ${bookId} not found in manifest, using default naming`
          );
        }
      }

      return getQuestionsForVerse(
        bookId,
        chapter,
        verse,
        organization,
        languageId,
        customFilePath
      );
    })().catch(() => [])
  : Promise.resolve([]),
```

### Key Changes

1. **Manifest Path Extraction**: Added identical logic to extract `project.path` from tQ manifest
2. **Custom File Path**: Pass extracted path to `getQuestionsForVerse()`
3. **Debug Logging**: Added logging to verify correct file path usage
4. **Error Handling**: Maintained existing error handling patterns

## Verification

### Console Log Evidence

```
ResourcesContext tQ: Using manifest file path: tq_TIT.tsv
```

This confirms both components now use the same file path resolution logic.

### Expected Behavior

- Cost estimates now show accurate `translationQuestions: [actual_count]` instead of `translationQuestions: 0`
- LLM chat context includes complete translation question data when available
- Enhanced AI responses with access to verse-specific translation questions

## Impact

### Before Fix

- ❌ Translation questions visible in UI but missing from chat context
- ❌ Cost estimates showing `translationQuestions: 0` incorrectly
- ❌ LLM responses lacking important contextual information
- ❌ Synchronization mismatch between UI and chat data sources

### After Fix

- ✅ Translation questions properly included in LLM chat context
- ✅ Accurate cost estimates reflecting actual context sent to AI
- ✅ Enhanced AI responses with complete translation resource access
- ✅ Synchronized data access between UI panels and chat context

## Files Modified

- `src-new/context/ResourcesContext.jsx` - Added custom file path extraction logic for translation questions

## Version

Fixed in version 0.13.9 - 2025-06-12

## Related Documentation

- [LLM Chat Feature Documentation](./llm-chat-feature.md)
- [Translation Questions Implementation](./Translation_Notes_Implementation.md)
- [CHANGELOG.md](../CHANGELOG.md#0139---2025-06-12)
