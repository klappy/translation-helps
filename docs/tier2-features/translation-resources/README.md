# 📖 Translation Resources

**Tier 2 Feature Documentation**  
*Translation Notes, Questions, Words, and Word Links implementation*

---

## 📋 Overview

This folder contains documentation for all translation resource types supported by the application, including their implementation patterns, data structures, and integration approaches.

### Supported Resource Types
- **Translation Notes (tN)**: Contextual notes explaining translation challenges
- **Translation Questions (tQ)**: Comprehension questions for translators
- **Translation Words (tW)**: Definitions of key biblical terms
- **Translation Word Links (TWL)**: Links connecting scripture to translation words

---

## 📚 Documentation Index

### Implementation Guides
- **[Translation_Notes_Implementation.md](Translation_Notes_Implementation.md)** - Translation Notes (tN) implementation details
- **[TWL_Integration_Documentation.md](TWL_Integration_Documentation.md)** - Translation Word Links (TWL) integration guide
- **[Resource_Integration_Overview.md](Resource_Integration_Overview.md)** - General resource integration patterns

### Related Documentation
- **[../api-integration/](../api-integration/)** - API patterns used by resources
- **[../../tier3-implementation/deprecated/](../../tier3-implementation/deprecated/)** - Deprecated resource patterns

---

## 🏗️ Resource Architecture

### Data Flow Pattern

```
User Navigates → ResourcesContext → Service Layer → DCS API → TSV/Markdown Content
                      ↓
               Panel Self-Activation → Display Formatted Content
```

### Service Layer Structure

```
src/services/
├── tnService.js          # Translation Notes
├── tqService.js          # Translation Questions  
├── twService.js          # Translation Words
├── twlService.js         # Translation Word Links
└── catalogService.js     # Resource discovery
```

---

## 🔄 Common Patterns

### Self-Activating Panel Pattern
```javascript
export function TranslationNotesPanel() {
  const { resources, activateResource } = useResourcesContext();
  
  // Self-activate this resource type
  useEffect(() => {
    activateResource('notes');
  }, [activateResource]);
  
  if (!resources.notes?.length) {
    return <div>No notes available for this verse</div>;
  }
  
  return (
    <div>
      {resources.notes.map(note => (
        <div key={note.id}>{note.text}</div>
      ))}
    </div>
  );
}
```

### Verse-Specific Service Pattern
```javascript
export async function getVerseNotes(
  bookId, 
  chapter, 
  verse, 
  organization = "unfoldingWord", 
  languageId = "en"
) {
  // 1. Get resource data from catalog API
  const resourceData = await searchAllResourcesForLanguage(languageId);
  
  // 2. Find specific resource
  const resource = resourceData.resources[organization]
    .find(r => r.subject === 'Translation Notes');
    
  // 3. Get file path from ingredients
  const ingredient = resource.ingredients
    .find(ing => ing.identifier === bookId);
  const filePath = ingredient.path.replace('./', '');
  
  // 4. Fetch and parse content
  const content = await fetchResourceFile(languageId, 'tn', filePath, organization);
  const notes = parseTSV(content);
  
  // 5. Filter to current verse only
  return notes.filter(note => 
    note.chapter == chapter && note.verse == verse
  );
}
```

---

## 📊 Resource Data Structures

### Translation Notes (TSV)
```
Book | Chapter | Verse | ID | SupportReference | OrigQuote | Occurrence | GLQuote | OccurrenceNote
tit  | 1       | 1     | 1  | rc://*/ta/man/... | Paul      | 1          | Paul    | This is the apostle Paul.
```

### Translation Questions (TSV)  
```
Reference | ID | Tags | Quote | Occurrence | Question | Response
1:1       | 1  |      | Paul  | 1          | Who wrote this letter? | Paul wrote this letter.
```

### Translation Word Links (TSV)
```
Reference | ID | Tags | OrigWords | Occurrence | TWLink
1:1       | 1  |      | Παῦλος    | 1          | rc://*/tw/dict/bible/names/paul
```

### Translation Words (Markdown)
```markdown
# Paul

## Facts:

Paul was an apostle of Jesus Christ...

## Translation Suggestions:

* Paul's name could be translated as...
```

---

## 🚀 Performance Optimizations

### Verse-Specific Loading
- Load only current verse data (~1-5KB per resource)
- Avoid loading entire chapter files (50-200KB)
- Browser caching for repeated verse visits

### API-Direct Architecture
- Use catalog API `ingredients` array for file paths
- No manifest.yaml dependencies
- Direct file fetching with standard naming patterns

### Smart Activation
- Resources only load when panels request them
- Parallel loading of multiple resource types
- Graceful degradation when resources unavailable

---

## 🛡️ Error Handling

### Resource Not Available
```javascript
if (!resource || !resource.ingredients) {
  console.warn(`Resource not available: ${resourceType} for ${languageId}/${organization}`);
  return [];
}
```

### File Not Found
```javascript
try {
  const content = await fetchResourceFile(languageId, resourceType, filePath, organization);
  return parseContent(content);
} catch (error) {
  if (error.status === 404) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }
  throw error; // Re-throw other errors
}
```

### Parsing Errors
```javascript
try {
  return parseTSV(content);
} catch (parseError) {
  console.error(`Failed to parse ${resourceType} content:`, parseError);
  return []; // Return empty array instead of crashing
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
describe('getVerseNotes', () => {
  it('should return notes for specific verse', async () => {
    const notes = await getVerseNotes('tit', 1, 1);
    expect(notes).toHaveLength(2);
    expect(notes[0].text).toContain('Paul');
  });
  
  it('should handle missing resources gracefully', async () => {
    const notes = await getVerseNotes('nonexistent', 1, 1);
    expect(notes).toEqual([]);
  });
});
```

### Integration Tests
- Test against live DCS API
- Verify cross-organization resource loading
- Performance benchmarking

### E2E Tests
- Complete user workflows with Playwright
- Resource switching scenarios
- Error recovery testing

---

## 🔧 Troubleshooting

### Common Issues

#### Resource Not Loading
1. Check resource availability in catalog API
2. Verify organization name spelling
3. Check ingredient paths in resource data
4. Verify file naming conventions

#### Parsing Errors
1. Check TSV format (tab-separated, proper headers)
2. Verify character encoding (UTF-8)
3. Check for malformed data rows
4. Validate markdown structure for tW

#### Performance Issues
1. Verify verse-specific filtering is working
2. Check for unnecessary full-chapter loading
3. Monitor network requests in browser dev tools
4. Verify browser caching is enabled

---

## 📚 Related Documentation

### Tier 1 Core
- [PRINCIPLES.md](../../tier1-core/PRINCIPLES.md#verse-specific-loading) - Resource loading principles
- [ARCHITECTURE.md](../../tier1-core/ARCHITECTURE.md) - System architecture

### Tier 2 Features
- [API Integration](../api-integration/README.md) - API patterns for resource loading
- [UI Components](../ui-components/README.md) - How panels display resources

### Tier 3 Implementation
- [Patterns](../../tier3-implementation/patterns/) - Specific implementation patterns
- [Deprecated](../../tier3-implementation/deprecated/) - Outdated approaches to avoid

---

## 🔄 Future Enhancements

### Planned Features
- Resource caching for offline support
- Advanced filtering and search
- Cross-reference linking between resources
- Performance metrics and monitoring

### API Evolution
- New resource types as they become available
- Enhanced metadata from catalog API
- Improved error reporting and diagnostics

---

*Last Updated: 2025-01-27*  
*Consolidates: Translation resource implementation documentation*  
*Pattern: Verse-specific loading with self-activating panels* 