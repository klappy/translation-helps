# ⚠️ PROSKOMMA DEPRECATION HISTORY - DO NOT USE ⚠️

## 🚨 CRITICAL WARNING FOR AI AGENTS 🚨

**PROSKOMMA HAS BEEN COMPLETELY REMOVED FROM THIS PROJECT**

- **DO NOT** suggest using Proskomma for any purpose
- **DO NOT** recommend proskomma-react-hooks
- **DO NOT** suggest installing proskomma or uw-proskomma packages
- **DO NOT** reference any Proskomma-based solutions
- The project now uses **custom USFM parsing** that is 85% faster

**This document exists only to explain WHY Proskomma was removed and what problems it caused.**

---

## Executive Summary: Why Proskomma Was Abandoned

The translation-helps project **completely removed Proskomma** due to:

1. **Severe Performance Issues**: 14+ renders per page load, unusable on large books
2. **Overcomplexity**: Proskomma was overkill for non-scripture resources (TSV/Markdown)
3. **Better Custom Solution**: Custom USFM parser is 85% faster and simpler
4. **Type Mismatch Bugs**: String vs integer comparison failures
5. **Maintenance Burden**: Complex mocking, testing, and debugging

**Current State**: Zero Proskomma dependencies, custom USFM parsing for scripture only.

---

## Migration Timeline and Reasoning

### Phase 1: Initial Proskomma Adoption (Historical)

**What Was Tried**: Using proskomma-react-hooks for scripture rendering

**Problems Encountered**:

- Duplicate import errors when navigating chapters
- Complex mocking required for tests
- Performance overhead for simple tasks

**Attempted Fix**: Added useCatalog hook to prevent duplicate imports

```javascript
// This approach was ABANDONED - DO NOT USE
const catalogHook = useCatalog({
  ...proskommaHook,
  verbose: false,
});
```

### Phase 2: Enhanced Proskomma Implementation (Historical)

**What Was Tried**: Advanced proskomma-react-hooks features

**Features Implemented**:

- usePassage hook for chapter-specific queries
- useSearchForPassages for scripture search
- Enhanced document management with useCatalog

**Problems That Remained**:

- Still too complex for simple verse rendering
- Large bundle size increase
- Difficult testing and debugging

### Phase 3: Custom Proskomma Migration (Historical)

**What Was Tried**: CustomProskomma class to avoid uw-proskomma dependency

**Approach**:

```javascript
// This approach was ABANDONED - DO NOT USE
export class CustomProskomma extends Proskomma {
  importDocument(selectors, contentType, contentString) {
    if (contentType === "usfm") {
      contentString = contentString.replace(/\\s5/g, "\\ts\\*");
    }
    return super.importDocument(selectors, contentType, contentString);
  }
}
```

**Why This Failed**: Still had the fundamental performance and complexity issues

### Phase 4: Complete Proskomma Removal (Current Solution)

**Final Decision**: Remove all Proskomma dependencies and create custom USFM parser

**Performance Results**:

- **Before**: 14+ renders per page load
- **After**: 2 renders per page load (85% reduction)
- **Before**: Complex GraphQL queries
- **After**: Simple regex-based verse parsing
- **Before**: 0 verses parsed (due to type bugs)
- **After**: All verses parsed correctly

---

## Detailed Problems with Proskomma

### 1. Severe Performance Issues

**Evidence from User Logs**:

```
[Log] [ScripturePanelRCL] About to render provider with: – {usfmContentLength: 136216...}
// This log repeated 14+ times for a single page load!
```

**Root Causes**:

- Excessive re-renders (14+ per page)
- Missing React.memo optimization
- Heavy USFM processing on every render
- Complex dependency arrays causing unnecessary effects

### 2. Type Mismatch Bugs

**Critical Bug**: String vs integer comparison failure

```javascript
// This bug caused 0 verses to be parsed
inTargetChapter = chapterNum === chapter; // "1" !== 1 (always false!)
```

### 3. Overcomplexity for Simple Tasks

**TSV Resources (Translation Notes, Questions, etc.)**:

```javascript
// Simple, efficient approach (current):
const data = parseTsv(tsvContent);
const filtered = data.filter((row) => row.Reference === `${chapter}:${verse}`);

// Complex Proskomma approach (ABANDONED):
const pseudoUSFM = convertTSVtoUSFM(tsvContent); // Why?!
proskomma.importDocument(selectors, "usfm", pseudoUSFM);
const result = proskomma.gqlQuerySync(`complex GraphQL query`);
return parseBackToNotes(result); // Another conversion!
```

### 4. Resource Type Mismatch

**Proskomma is designed for**: USFM scripture with verse boundaries
**Translation resources are**:

- TSV tables (flat data)
- Markdown articles (document format)
- No verse hierarchy needed

**Performance Comparison**:
| Resource | Current (TSV/MD) | Proskomma Approach | Overhead |
|----------|------------------|-------------------|----------|
| tn (TSV) | 1-5ms parse | 3-10x slower | +500KB bundle |
| tq (TSV) | 1-3ms parse | 3-10x slower | +500KB bundle |
| ta (MD) | 2-8ms parse | 2-5x slower | +500KB bundle |

### 5. Testing and Maintenance Burden

**Testing Complexity**:

- Required complex mocking of proskomma-react-hooks
- GraphQL query testing
- Document state management testing
- Error scenarios difficult to reproduce

**Bundle Size Impact**: 500KB+ added for minimal benefit

---

## Architectural Decision: Resource-Specific Parsers

### Current Optimal Architecture

Each resource type uses its optimal parser:

```javascript
// Scripture (USFM) - Custom parser
const verses = parseUSFMToVerses(usfm, chapter);

// Translation Notes (TSV) - Papa Parse
const notes = parseTsv(tsvContent);

// Translation Academy (Markdown) - React Markdown
const article = parseMarkdown(content);
```

### Why This Works Better

1. **Right Tool for Right Job**: Each parser is optimized for its format
2. **Performance**: No conversion overhead
3. **Simplicity**: Easy to understand and debug
4. **Maintainability**: Clear separation of concerns
5. **Bundle Size**: Minimal dependencies

---

## Current Custom USFM Parser Solution

**Implementation**: Direct regex-based parsing for verse extraction

**Key Features**:

- Intelligent caching to avoid re-parsing
- Proper type handling (string to integer conversion)
- React.memo optimization
- 85% performance improvement

**Cache Strategy**:

```javascript
// Efficient caching prevents re-parsing
const cacheKey = `${usfm?.length || 0}-${chapter}-${usfm?.substring(0, 100) || ""}`;
if (versesCache.has(cacheKey)) {
  return versesCache.get(cacheKey);
}
```

---

## Lessons Learned

### 1. Complexity is Not Always Better

- Proskomma is excellent for its intended use case (complex scripture applications)
- For simple verse display, custom parsing is more efficient

### 2. Performance First

- User experience degraded significantly with Proskomma
- Simple solutions often outperform complex libraries

### 3. Bundle Size Matters

- 500KB+ overhead for minimal functionality gain
- Every dependency should provide clear value

### 4. Testing Complexity Signals Architectural Problems

- If testing requires extensive mocking, consider simpler approaches
- Complex abstractions can hide simple problems

---

## Alternative Solutions Considered and Rejected

### 1. Web Workers for Proskomma

**Idea**: Move Proskomma parsing to background thread
**Rejected**: Still complex, doesn't solve fundamental issues

### 2. Proskomma Caching Optimizations

**Idea**: Cache Proskomma results in IndexedDB
**Rejected**: Adds complexity without addressing root cause

### 3. Selective Proskomma Usage

**Idea**: Use Proskomma only for complex scripture features
**Rejected**: Inconsistent architecture, maintenance burden

---

## Final Recommendation for AI Agents

**DO**:

- Use format-specific parsers (TSV, Markdown, custom USFM)
- Implement React performance best practices (memo, useMemo, useCallback)
- Keep bundle sizes minimal
- Prioritize simple, testable solutions

**DO NOT**:

- Suggest Proskomma for any purpose in this project
- Recommend proskomma-react-hooks
- Add complex libraries without clear performance benefits
- Create unnecessary abstractions over simple data parsing

**The current custom USFM parser approach is optimal and should be maintained.**

---

## Document History

- **2025-06-13**: Consolidated from multiple Proskomma documents
- **Purpose**: Prevent future reintroduction of removed technology
- **Status**: Final - Proskomma permanently removed from project
- **Next Steps**: None - current solution is optimal

**Original Documents Consolidated**:

- proskomma-resource-evaluation.md
- proskomma-performance-optimization.md
- proskomma-duplicate-import-fix.md
- proskomma-hooks-enhancement.md
- custom-proskomma-migration.md
- uw-proskomma-analysis.md
