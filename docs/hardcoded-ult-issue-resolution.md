# Hardcoded ULT Issue Resolution

## Issue Summary

A major issue was discovered where ResourcesContext.jsx had hardcoded "ult" variables throughout the code, preventing dynamic resource selection based on URL parameters or user selection.

## Problems Identified

### 1. Hardcoded "ult" Resource ID

**Problem**: ResourcesContext was hardcoded to always use "ult" instead of the dynamic `resourceId` from ReferenceContext.

**Location**: `src/context/ResourcesContext.jsx`

**Root Cause**:

```javascript
// OLD - hardcoded fallback
const scriptureResourceId = reference?.resourceId || "ult";
```

**Solution**: Extract `resourceId` directly from ReferenceContext:

```javascript
// NEW - dynamic from ReferenceContext
const { reference, organization, languageId, resourceId } = useReferenceContext();
const scriptureResourceId = resourceId || "ult";
```

### 2. Broken Text Extraction

**Problem**: Verse text extraction showing "{_it_" instead of actual verse content.

**Root Cause**: Broken regex replacement pattern:

```javascript
// BROKEN - $1 wasn't capturing anything
verseText = verseText.replace(/\\w\s+[^|]*\|[^\\*]*\\*\\w\\*/g, "$1");
```

**Solution**: Fixed regex to properly extract word content:

```javascript
// FIXED - proper capture groups
verseText = verseText.replace(/\\w\s+([^|\\]*)\|[^\\]*\\*([^\\]*)\\w\\*/g, "$1");
```

### 3. Missing Verse Bridge Support

**Problem**: Could not find verses in verse bridges like `\v 4-5`.

**Solution**: Enhanced regex logic to detect verse bridges:

```javascript
// Enhanced verse bridge detection
if (!match) {
  const bridgeRegex = /\\v\s+(\d+)-(\d+)\s+([\s\S]*?)(?=(\\v\s+[\d\-]+|\\c\s+\d+|$))/gm;
  let bridgeMatch;
  while ((bridgeMatch = bridgeRegex.exec(usfmText)) !== null) {
    const startVerse = parseInt(bridgeMatch[1]);
    const endVerse = parseInt(bridgeMatch[2]);
    if (targetVerse >= startVerse && targetVerse <= endVerse) {
      match = [bridgeMatch[0], bridgeMatch[3]]; // Format: [fullMatch, capturedContent]
      break;
    }
  }
}
```

## Changes Made

### ResourcesContext.jsx Updates

1. **Dynamic Resource Loading**: Now uses `resourceId` from ReferenceContext
2. **Enhanced Text Processing**: Fixed USFM markup removal and text extraction
3. **Verse Bridge Support**: Added logic to find verses within verse bridges
4. **Dependency Updates**: Updated useCallback dependencies to include `scriptureResourceId`

### Key Function Improvements

- `loadManifests()`: Now uses dynamic `scriptureResourceId`
- `loadResources()`: Proper dependency array with `scriptureResourceId`
- `preprocessUSFMToPlainText()`: Enhanced verse extraction with bridge support

## Verification

✅ **Dynamic Resource Selection**: Navigation shows "EN_T4T" when URL contains `t4t`
✅ **Correct Data Loading**: Console logs show T4T USFM data being loaded
✅ **Text Extraction**: Verse text properly extracted without markup artifacts
✅ **AI Assistant Context**: Provides clean verse text to LLM for translation assistance

## Testing

Tested with URL: `http://localhost:5174/?owner=unfoldingWord&rc=/en/t4t/tit/3/5`

**Results**:

- ✅ ResourcesContext loads T4T instead of ULT
- ✅ Verse text properly extracted: "Even though we were behaving sinfully like this, he saved us! God our Savior acted kindly..."
- ✅ Navigation shows dynamic resource selection
- ✅ Verse bridge support implemented (ready for verses in bridges)

### 4. LLM Chat System Hardcoded Title Issue

**Problem**: The LLM chat system in `netlify/functions/chat.js` was not using the actual scripture resource title in citations, instead showing generic "Scripture Text".

**Root Cause**: The scripture section was hardcoded:

```javascript
// OLD - hardcoded title
if (resources.scripture) {
  prompt += `\n\n[SCRIPTURE] Scripture Text:
"${resources.scripture}"`;
}
```

**Solution**: Use dynamic title from metadata:

```javascript
// NEW - dynamic title from metadata
if (resources.scripture) {
  const scriptureTitle = contextData.metadata?.manifestTitles?.scripture || "Scripture Text";
  prompt += `\n\n[SCRIPTURE] ${scriptureTitle}:
"${resources.scripture}"`;
}
```

**Additional Enhancement**: Updated citation examples to explicitly instruct the LLM to use the exact title provided:

```javascript
- **Scripture**: "According to the scripture resource provided above (use the EXACT title shown after [SCRIPTURE]), verse 1 states... [SCRIPTURE]"
```

## Changes Made

### ResourcesContext.jsx Updates

1. **Dynamic Resource Loading**: Now uses `resourceId` from ReferenceContext
2. **Enhanced Text Processing**: Fixed USFM markup removal and text extraction
3. **Verse Bridge Support**: Added logic to find verses within verse bridges
4. **Dependency Updates**: Updated useCallback dependencies to include `scriptureResourceId`

### LLM Chat System Updates (netlify/functions/chat.js)

1. **Dynamic Scripture Titles**: Now uses `contextData.metadata?.manifestTitles?.scripture`
2. **Enhanced Citation Instructions**: Updated examples to emphasize using exact resource titles
3. **Improved Resource Attribution**: LLM responses will now show proper resource names like "Translation 4 Translators" instead of generic "Scripture Text"

## Impact

This comprehensive fix ensures the application properly supports multiple Bible translations and can dynamically switch resources based on URL parameters or user selection. The LLM chat system now provides accurate attribution to the specific scripture resource being used, resolving critical architectural limitations in both the resource loading system and AI assistant functionality.
