# 🔗 URL Parameter Specification

## Official URL Format for ETEN Innovation Lab Translation Helps

This document defines the **official URL parameter format** used by the application. This format is already implemented and must be followed.

---

## 📋 **URL Parameter Format**

### **Complete URL Structure**
```
https://app.example.com/?scriptures=[/org/lang/resource/book/chapter/verse]&resources=[/org/lang/type,/org/lang/type,...]
```

### **Parameter Breakdown**

| Parameter | Format | Required | Description |
|-----------|--------|----------|-------------|
| `scriptures` | `[/org/lang/resource/book/chapter/verse]` | ✅ | Scripture reference with organization, language, and resource type |
| `resources` | `[/org/lang/type,/org/lang/type,...]` | ❌ | Comma-separated list of translation resources to load |

---

## 🎯 **Parameter Details**

### **scriptures Parameter**
```
scriptures=[/Door43-Catalog/en/ult/tit/1/1]
```

**Format**: `[/organization/language/resourceType/bookId/chapter/verse]`

- **organization**: DCS organization (e.g., `unfoldingWord`, `Door43-Catalog`, `wycliffeAssociates`)
- **language**: Language code (e.g., `en`, `es`, `fr`, `hi`)
- **resourceType**: Scripture resource type (e.g., `ult`, `ust`, `glt`)
- **bookId**: 3-letter book identifier (e.g., `gen`, `tit`, `mat`, `jhn`)
- **chapter**: Chapter number (e.g., `1`, `5`, `23`)
- **verse**: Verse number (e.g., `1`, `16`, `31`)

### **resources Parameter**
```
resources=[/unfoldingWord/en/tn,/unfoldingWord/en/tq,/unfoldingWord/en/tw]
```

**Format**: `[/organization/language/type,/organization/language/type,...]`

- **organization**: DCS organization for this resource
- **language**: Language code for this resource
- **type**: Resource type identifier

**Supported Resource Types**:
- `tn` - Translation Notes
- `tq` - Translation Questions
- `tw` - Translation Words
- `twl` - Translation Word Links
- `ta` - Translation Academy

---

## 🌐 **Example URLs**

### **Basic Examples**

```javascript
// Titus 1:1 with unfoldingWord ULT and standard resources
http://localhost:5174/?scriptures=[/unfoldingWord/en/ult/tit/1/1]&resources=[/unfoldingWord/en/tn,/unfoldingWord/en/tq,/unfoldingWord/en/tw]

// Genesis 1:1 with Door43-Catalog scripture
http://localhost:5174/?scriptures=[/Door43-Catalog/en/ult/gen/1/1]&resources=[/unfoldingWord/en/tn,/unfoldingWord/en/tq]

// John 3:16 with minimal resources
http://localhost:5174/?scriptures=[/unfoldingWord/en/ult/jhn/3/16]&resources=[/unfoldingWord/en/tn]

// Scripture only (no additional resources)
http://localhost:5174/?scriptures=[/unfoldingWord/en/ult/mat/5/1]
```

### **Cross-Organization Examples**

```javascript
// Mixed organizations - Door43-Catalog scripture with unfoldingWord resources
http://localhost:5174/?scriptures=[/Door43-Catalog/en/ult/rom/3/23]&resources=[/unfoldingWord/en/tn,/Door43-Catalog/en/tq,/wycliffeAssociates/en/tw]

// Different language - Spanish resources
http://localhost:5174/?scriptures=[/unfoldingWord/es/ust/mat/5/1]&resources=[/unfoldingWord/es/tn,/unfoldingWord/es/tq]

// Multi-language resources (advanced use case)
http://localhost:5174/?scriptures=[/unfoldingWord/en/ult/gen/1/1]&resources=[/unfoldingWord/en/tn,/unfoldingWord/es/tq,/unfoldingWord/fr/tw]
```

---

## 🔧 **URL Processing Implementation**

### **Parsing Logic**

```javascript
function parseURLParameters() {
  const params = new URLSearchParams(window.location.search);
  
  // Parse scripture parameter
  const scripturesParam = params.get('scriptures');
  let reference = { bookId: 'gen', chapter: 1, verse: 1 };
  let scriptureConfig = { organization: 'unfoldingWord', languageId: 'en', resourceId: 'ult' };
  
  if (scripturesParam) {
    const scriptureMatch = scripturesParam.match(/\[\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(\d+)\/(\d+)\]/);
    if (scriptureMatch) {
      const [, org, lang, resource, book, chapter, verse] = scriptureMatch;
      reference = { bookId: book, chapter: parseInt(chapter), verse: parseInt(verse) };
      scriptureConfig = { organization: org, languageId: lang, resourceId: resource };
    }
  }
  
  // Parse resources parameter
  const resourcesParam = params.get('resources');
  const activeResources = new Set(['scripture']);
  const resourceConfigs = { scripture: scriptureConfig };
  
  if (resourcesParam) {
    const resourceMatches = resourcesParam.match(/\/([^\/,\]]+)\/([^\/,\]]+)\/([^\/,\]]+)/g);
    if (resourceMatches) {
      resourceMatches.forEach(match => {
        const [, org, lang, type] = match.match(/\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
        activeResources.add(type);
        resourceConfigs[type] = { organization: org, languageId: lang };
      });
    }
  } else {
    // Use default resources
    ['notes', 'questions'].forEach(type => {
      activeResources.add(type);
      resourceConfigs[type] = { organization: 'unfoldingWord', languageId: 'en' };
    });
  }
  
  return { reference, activeResources, resourceConfigs };
}
```

### **URL Generation Logic**

```javascript
function generateURL(reference, resourceConfigs, activeResources) {
  const params = new URLSearchParams();
  
  // Scripture parameter
  const scriptureConfig = resourceConfigs.scripture;
  const scriptureParam = `[/${scriptureConfig.organization}/${scriptureConfig.languageId}/${scriptureConfig.resourceId}/${reference.bookId}/${reference.chapter}/${reference.verse}]`;
  params.set('scriptures', scriptureParam);
  
  // Resources parameter
  const resourcePaths = [];
  activeResources.forEach(type => {
    if (type !== 'scripture' && resourceConfigs[type]) {
      const config = resourceConfigs[type];
      resourcePaths.push(`/${config.organization}/${config.languageId}/${type}`);
    }
  });
  
  if (resourcePaths.length > 0) {
    const resourcesParam = `[${resourcePaths.join(',')}]`;
    params.set('resources', resourcesParam);
  }
  
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}
```

---

## 📏 **URL Constraints & Considerations**

### **Length Limits**
- **Browser Limit**: ~2000 characters for most browsers
- **Practical Limit**: Keep URLs under 1000 characters for sharing
- **Long URLs**: Consider URL shortening for complex multi-resource configurations

### **Default Behavior**
```javascript
// No parameters - uses application defaults
http://localhost:5174/
// Equivalent to: ?scriptures=[/unfoldingWord/en/ult/gen/1/1]&resources=[/unfoldingWord/en/tn,/unfoldingWord/en/tq]
```

### **Error Handling**
- Invalid organization names → fallback to `unfoldingWord`
- Invalid language codes → fallback to `en`
- Invalid book/chapter/verse → fallback to `gen/1/1`
- Malformed parameters → use application defaults

---

## 🚨 **Important Notes**

### **DO NOT USE These Formats**
```javascript
// ❌ WRONG - Old format (deprecated)
?book=tit&chapter=1&verse=1&resources=scripture,notes,questions

// ❌ WRONG - Simple key-value pairs
?org=unfoldingWord&lang=en&book=tit&chapter=1&verse=1

// ❌ WRONG - Different bracket syntax
?scriptures=unfoldingWord/en/ult/tit/1/1&resources=unfoldingWord/en/tn,unfoldingWord/en/tq
```

### **Always Use This Format**
```javascript
// ✅ CORRECT - Established format
?scriptures=[/unfoldingWord/en/ult/tit/1/1]&resources=[/unfoldingWord/en/tn,/unfoldingWord/en/tq]
```

---

## 🔄 **URL State Synchronization**

### **Application State → URL**
When user navigates or changes resources:
1. Generate URL using `generateURL()` function
2. Update browser history with `history.pushState()`
3. Ensure URL reflects current application state

### **URL → Application State**
When application loads or URL changes:
1. Parse URL using `parseURLParameters()` function
2. Update ReferenceContext with parsed reference
3. Update ResourcesContext with parsed resource configurations
4. Trigger resource loading for active resources

---

## 📖 **Integration with ResourcesContext**

The URL parameters integrate directly with the Simple Verse-Loading Pattern:

```javascript
// ResourcesContext uses URL parameters for initialization
const [activeResources, setActiveResources] = useState(() => {
  const { activeResources } = parseURLParameters();
  return activeResources;
});

// Reference comes from URL
const [reference, setReference] = useState(() => {
  const { reference } = parseURLParameters();
  return reference;
});

// Resource configurations from URL
const [resourceConfigs, setResourceConfigs] = useState(() => {
  const { resourceConfigs } = parseURLParameters();
  return resourceConfigs;
});
```

---

This URL format enables:
- **Deep Linking**: Direct links to specific verses with specific resources
- **Bookmarking**: Users can bookmark and return to exact application state
- **Sharing**: URLs can be shared to show others specific content
- **Cross-Organization**: Mix resources from different organizations
- **Multi-Language**: Support for different language combinations 