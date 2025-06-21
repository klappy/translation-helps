# USFM Text Extraction - Unified Server-Side Approach

## Overview

The USFM Text Extraction system provides clean, readable scripture text from USFM (Unified Standard Format Markers) content for LLM chat context. This system was completely rewritten in 2025 to use a unified server-side approach across all environments.

## Architecture

### Unified Extraction Strategy

**CRITICAL**: As of 2025, the system uses a **unified server-side regex-based extraction approach** for ALL environments (browser, server, test). This replaced the previous unreliable browser/server split approach.

```mermaid
graph TD
    A[Raw USFM Input] --> B[parseUSFMToHTML]
    B --> C[Semantic HTML Output]
    C --> D[Mock DOM Creation]
    D --> E[Server-Side Regex Filtering]
    E --> F[Clean Text Output]
    
    G[All Environments] --> D
    H[Browser] --> D
    I[Server] --> D
    J[Test] --> D
```

### Why Unified Approach?

**Previous Problem**: The old system attempted to use browser `innerText` with CSS hiding rules, but this was unreliable:
- Browser `innerText` didn't properly respect CSS `display: none` rules for USFM markup
- Test environments (jsdom) had inconsistent CSS behavior
- Server environments required different logic than browsers
- Result: 228KB of raw USFM contamination in production

**Current Solution**: All environments use the same proven server-side regex extraction:
- Consistent results across browser, server, and test environments
- Reliable USFM markup removal
- Perfect punctuation preservation
- 99%+ size reduction from raw USFM to clean text

## Core Functions

### `extractVerseText(usfmText, chapter, verse)`

Extracts clean text for a single verse with simple verse numbering.

**Input**: Raw USFM content with alignment data
**Output**: Clean text formatted as `"1 Paul, a servant of God and an apostle..."`

**Example**:
```javascript
const usfm = `\\v 1 \\zaln-s |x-strong="G39720"\\*\\w Paul\\w*\\zaln-e\\*`;
const result = extractVerseText(usfm, 1, 1);
// Result: "1 Paul, a servant of God..."
```

### `extractChapterText(usfmText, chapter)`

Extracts clean text for an entire chapter with all verses and verse numbers.

**Input**: Raw USFM content for full chapter
**Output**: Space-separated verses formatted as `"1 Paul, a servant... 2 And an apostle..."`

**Example**:
```javascript
const usfm = `\\c 1\\v 1 Paul\\v 2 And an apostle`;
const result = extractChapterText(usfm, 1);
// Result: "1 Paul, a servant of God 2 And an apostle of Jesus Christ"
```

### `validateCleanText(text)`

Validates that extracted text contains no USFM markup patterns.

**Purpose**: Regression testing to ensure extraction quality
**Returns**: `true` if clean, `false` if USFM contamination detected

## Technical Implementation

### Unified Extraction Logic

**ALL environments use this exact same process**:

1. **Parse USFM to HTML**: Use `parseUSFMToHTML(usfmText, "preview")`
2. **Create Mock DOM**: Use `createMockElement()` for consistent DOM simulation
3. **Apply Server-Side Filtering**: Remove all hidden elements via regex patterns
4. **Extract Clean Text**: Get final readable text with punctuation preserved

### Server-Side Filtering Process

The extraction removes hidden elements in this specific order:

1. **Marker Elements**: `<marker[^>]*>.*?</marker>` (USFM markup)
2. **Attributes Elements**: `<attributes[^>]*>.*?</attributes>` (alignment data)
3. **Number Elements**: `<number[^>]*>.*?</number>` (verse numbers - added back separately)
4. **Zaln Wrappers**: `<zaln[^>]*>` and `</zaln>` tags (keep content)
5. **Word Wrappers**: `<word[^>]*>` and `</word>` tags (keep content)
6. **Content Tags**: `<content[^>]*>` and `</content>` tags (extract text)
7. **Remaining Tags**: All other HTML tags
8. **Whitespace Cleanup**: Normalize spaces and trim

### Mock DOM Implementation

For consistent behavior across environments, the system uses a comprehensive mock DOM:

```javascript
function createMockElement() {
  return {
    innerHTML: "",
    querySelectorAll: function(selector) {
      // Supports: 'v', 'content', 'c', 'usfm'
    },
    querySelector: function(selector) {
      // Returns first match from querySelectorAll
    }
  };
}
```

**Supported Selectors**:
- `'v'` - Verse elements
- `'content'` - Word content elements
- `'c'` - Chapter elements  
- `'usfm'` - Root USFM container

## Validation and Quality Assurance

### USFM Markup Detection Patterns

The system validates clean text by checking for these contamination patterns:

```javascript
const usfmPatterns = [
  /\\zaln-[se]/,      // Alignment markup
  /\\w\s+[^|]*\|/,    // Word markup with pipes
  /\\w\*/,            // Word end markers
  /\|x-strong=/,      // Strong's numbers
  /\|x-lemma=/,       // Lemma data
  /\|x-morph=/,       // Morphology data
  /\|x-occurrence=/,  // Occurrence data
  /\|x-content=/,     // Content data
  /\\[a-z]+/,         // Any USFM markers
  /[{}]/,             // Curly braces
  /\|\|/,             // Double pipes
];
```

### Performance Requirements

- **Single Verse**: < 10ms extraction time
- **Full Chapter**: < 100ms for 100+ verses
- **Memory**: No memory leaks from DOM simulation
- **Reliability**: 100% success rate for valid USFM input

### Quality Guarantees

1. **Zero USFM Contamination**: `validateCleanText()` must return `true`
2. **Perfect Punctuation**: All commas, periods, and spacing preserved
3. **Simple Numbering**: Format as `"1 text"` not `"Verse 1: text"`
4. **Environment Consistency**: Identical output across all environments
5. **Error Handling**: Graceful degradation for invalid input

## Migration from Old Approach

### Deprecated Patterns (DO NOT USE)

❌ **Browser CSS-based extraction**:
```javascript
// DEPRECATED - Do not use
element.innerText; // Unreliable CSS hiding
getComputedStyle(); // Environment inconsistent
```

❌ **Environment detection**:
```javascript
// DEPRECATED - Do not use  
const isRealBrowser = typeof document !== 'undefined';
if (isRealBrowser) { /* browser logic */ }
```

❌ **Real DOM createElement**:
```javascript
// DEPRECATED - Do not use
const tempDiv = document.createElement("div"); // Browser-only
```

### Correct Current Pattern (USE THIS)

✅ **Unified server-side approach**:
```javascript
// CORRECT - Current unified approach
const tempDiv = createMockElement(); // Works everywhere
const cleanText = getVisibleText(targetElement); // Server-side logic
```

## Testing Strategy

### Comprehensive Test Coverage

The test suite covers:

1. **Single Verse Extraction**: `extractVerseText()` functionality
2. **Chapter Extraction**: `extractChapterText()` functionality  
3. **Validation**: `validateCleanText()` markup detection
4. **Environment Consistency**: Same output across all environments
5. **Complex Structures**: Nested alignment, verse bridges
6. **Performance**: Large content handling
7. **Edge Cases**: Malformed HTML, parsing errors
8. **Error Handling**: Invalid input, missing verses

### Regression Prevention

**Critical Tests**:
- ✅ No USFM markup in output (`validateCleanText(result) === true`)
- ✅ Punctuation preserved (`result.includes("Paul,")`)
- ✅ Simple numbering (`result.startsWith("1 ")`)
- ✅ Performance benchmarks (`extractionTime < 100ms`)

## File Structure

```
src/utils/
├── usfmTextExtractor.js          # Main implementation
├── usfmTextExtractor.test.js     # Comprehensive test suite
└── (deleted files)
    └── ResourcesContext.usfm-semantic-extraction.test.js  # Removed - outdated
```

## Best Practices

### For Developers

1. **Always use the unified functions**: `extractVerseText()` or `extractChapterText()`
2. **Never bypass validation**: Always call `validateCleanText()` on output
3. **Test across environments**: Verify consistency in browser, server, and tests
4. **Handle errors gracefully**: All functions return empty string on error
5. **Preserve this documentation**: Update this file when changing implementation

### For Maintenance

1. **Do not reintroduce environment detection**: Use unified approach only
2. **Do not use browser-specific APIs**: Stick to mock DOM simulation
3. **Maintain regex patterns**: Keep server-side filtering logic intact
4. **Update tests together**: Any changes require corresponding test updates
5. **Document breaking changes**: Update this file for any architectural changes

## Performance Characteristics

### Before Unified Approach
- **Context Size**: 228,301 characters of raw USFM with alignment data
- **Contamination**: Full USFM markup sent to LLM
- **Reliability**: Inconsistent across environments
- **Maintenance**: Complex browser/server split logic

### After Unified Approach  
- **Context Size**: ~2,000 characters of clean text
- **Contamination**: Zero USFM markup (validated)
- **Reliability**: 100% consistent across all environments
- **Maintenance**: Single extraction path, easy to test and debug

## Conclusion

The unified server-side approach provides:

- **Reliability**: Consistent behavior across all environments
- **Performance**: 99%+ size reduction from raw USFM
- **Quality**: Perfect punctuation preservation with zero markup contamination  
- **Maintainability**: Single code path, comprehensive test coverage
- **Future-proofing**: Environment-agnostic design

**This approach must be preserved to prevent regression to the previous 228KB USFM contamination issue.** 