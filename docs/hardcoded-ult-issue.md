# 🚀 EPIC: Fix Hardcoded 'ult' References & Implement Multi-Scripture Architecture

## 📋 Problem Statement

There is widespread hardcoding of the "ult" resource identifier throughout the codebase, particularly in `ResourcesContext.jsx`. This prevents the application from dynamically loading different Bible translations based on URL parameters or user selection.

### 🔍 Current Issues

#### Critical Hardcoding Problems

**ResourcesContext.jsx (Lines 62, 69-73, 409-413)**

```javascript
// Line 62 - Hardcoded manifest loading
fetchManifest(languageId, "ult", organization).catch(() => null),

// Lines 69-73 - Fixed manifest structure
setManifests({
  ult: ultManifest,  // Hardcoded key
  tn: tnManifest,
  tq: tqManifest,
  tw: twManifest,
  twl: twlManifest,
});

// Lines 409-413 - Hardcoded diagnostics
manifestsAvailable: {
  ult: !!manifests.ult,  // Hardcoded reference
  tn: !!manifests.tn,
  // ...
}
```

**ReferenceContext.jsx**

```javascript
// Default fallback - acceptable
resourceId: "ult", setResourceId("ult");
```

#### Impact

- Prevents loading other Bible translations (UST, UDB, original languages)
- Breaks URL parameter functionality for resource selection
- Limits user choice in scripture selection step
- Makes the app inflexible for different translation workflows

---

## 🎯 Vision: Multi-Scripture Architecture

Transform the app to support **simultaneous viewing of multiple Bible translations** for enhanced translation work.

### 🖼️ UI Mockups

Three interactive demo designs have been created for comparison:

1. **[Split View Demo](../demo-split-view.html)** - Side-by-side scripture panels
2. **[Tabbed View Demo](../demo-tabbed-view.html)** - Tab-based scripture switching
3. **[Parallel Columns Demo](../demo-parallel-columns.html)** - Multi-column parallel view ⭐ **RECOMMENDED**

### ✨ Key Features

- **Multiple Scripture Resources**: View ULT + UST + Original languages simultaneously
- **Dynamic Resource Loading**: Load any Bible translation based on URL params or user selection
- **Synchronized Navigation**: All resources stay in sync when navigating verses
- **Primary Resource Concept**: One resource drives translation helps (notes, questions, etc.)
- **Flexible Layout**: Resizable columns, hide/show resources, reorder
- **Enhanced LLM Context**: Multi-translation context for better AI assistance

---

## 🏗️ Technical Architecture

### URL Structure

```
// Single scripture (backward compatible)
?owner=unfoldingWord&rc=/en/ult/gen/1/1

// Multiple scriptures
?owner=unfoldingWord&rc=/en/ult/gen/1/1&scriptures=ult,ust,grc_ugnt&primary=ult
```

### Data Structure

```javascript
// ReferenceContext Updates
{
  // Single mode (backward compatible)
  resourceId: "ult",

  // Multi-scripture mode
  scriptureSelections: [
    { id: "en_ult", languageId: "en", resourceId: "ult", isPrimary: true, isVisible: true },
    { id: "en_ust", languageId: "en", resourceId: "ust", isPrimary: false, isVisible: true },
    { id: "grc_ugnt", languageId: "grc", resourceId: "ugnt", isPrimary: false, isVisible: false }
  ]
}

// ResourcesContext Structure
{
  resources: {
    scriptures: {
      "en_ult": { resourceId: "ult", languageId: "en", usfm: "...", manifest: {...} },
      "en_ust": { resourceId: "ust", languageId: "en", usfm: "...", manifest: {...} },
      "grc_ugnt": { resourceId: "ugnt", languageId: "grc", usfm: "...", manifest: {...} }
    },
    primaryScriptureId: "en_ult",
    translationNotes: [...], // Based on primary scripture
    translationQuestions: [...],
    translationWords: [...]
  }
}
```

### LLM Context Enhancement

```javascript
{
  reference: { book: "gen", chapter: 1, verse: 1 },
  resources: {
    scriptureTexts: [
      { resourceId: "ult", title: "ULT", text: "In the beginning...", isPrimary: true },
      { resourceId: "ust", title: "UST", text: "Long ago...", isPrimary: false },
      { resourceId: "ugnt", title: "Greek", text: "ἐν ἀρχῇ...", isPrimary: false }
    ],
    translationNotes: [...],
    alignmentData: [...] // From primary scripture only
  },
  metadata: {
    scriptureCount: 3,
    languages: ["en", "grc"],
    primaryResource: "ult"
  }
}
```

---

## 📅 Implementation Plan

### 🏃‍♂️ Phase 1: Fix Current Hardcoding (1-2 days)

**Priority: CRITICAL** ✅ **COMPLETED**

- [x] Replace hardcoded "ult" in ResourcesContext.jsx
- [x] Implement dynamic manifest loading based on reference.resourceId
- [x] Update manifest structure to use keyed approach
- [x] Maintain backward compatibility
- [x] Fix diagnostic/debug references

### 🚀 Phase 2: Multi-Scripture Foundation (3-5 days)

**Priority: HIGH**

- [ ] Update ReferenceContext with scriptureSelections array
- [ ] Implement multi-scripture manifest loading
- [ ] Create scripture selection management functions
- [ ] Update URL parsing for multiple resources
- [ ] Enhance LLM context formatting

### 🎨 Phase 3: UI Implementation (3-4 days)

**Priority: MEDIUM**

- [ ] Create ScriptureMultiView component (parallel columns)
- [ ] Implement scripture selector UI
- [ ] Add synchronized scrolling
- [ ] Create column resize/reorder functionality
- [ ] Update navigation components

### 🧪 Phase 4: Testing & Polish (2-3 days)

**Priority: MEDIUM**

- [ ] Unit tests for multi-scripture contexts
- [ ] Integration tests for resource switching
- [ ] Playwright tests for UI interactions
- [ ] Performance optimization
- [ ] Mobile responsive design

---

## 🎯 Success Criteria

- ✅ No hardcoded "ult" references in production code
- ✅ URL parameters correctly load any Bible translation
- ✅ Scripture selection step works with all available resources
- ✅ Multi-scripture viewing works seamlessly
- ✅ LLM receives enhanced context with multiple translations
- ✅ Performance remains acceptable with multiple USFM files
- ✅ Backward compatibility maintained

---

## 💡 Future Enhancements

- **Interlinear View**: Word-by-word alignment between original and translation
- **Translation Comparison**: Highlight differences between translations
- **Custom Resource Sets**: Save/load preferred resource combinations
- **Multi-Language Support**: Hebrew/Greek + multiple target languages
- **Advanced Word Study**: Cross-reference original language tools

---

## 📁 Deliverables Created

### UI Demo Files

- `demo-split-view.html` - Split-screen layout prototype
- `demo-tabbed-view.html` - Tabbed interface prototype
- `demo-parallel-columns.html` - Parallel columns layout (recommended)

### Documentation

- `docs/hardcoded-ult-issue.md` - This comprehensive analysis

---

_This epic addresses both the immediate hardcoding issue and provides a roadmap for advanced multi-scripture functionality that will significantly enhance the translation workflow._
