# 🚨 DEPRECATED: Complex Patterns - DO NOT USE

This document lists all the complex patterns that have been deprecated in favor of the **Simple Verse-Loading Pattern**.

---

## ⚠️ **THESE PATTERNS ARE DEPRECATED**

### ❌ **Complex ResourcesContext Patterns**
- Multiple loading states (`resourceLoadingStates`, `loadingStates`, etc.)
- Complex resource coordination logic
- Resource refs and event systems
- Manifest-based loading
- Chapter-level data loading
- Caching layers and optimization

### ❌ **Panel Loading Patterns**
- `useEffect` for data loading in panels
- Service imports in panel components
- Complex error handling in panels
- Loading state management in panels
- Direct API calls from panels

### ❌ **LLM Chat Complexity**
- Panel refs (`panelRefs.scripturePanel.current.getData()`)
- Polling for resource updates (`setInterval(updateResourceCounts, 500)`)
- Complex resource collection logic
- DOM-based data extraction
- Resource counting and tracking

### ❌ **Service Complexity**
- Manifest-based file resolution
- Complex caching strategies
- Chapter-level data fetching
- Multiple loading strategies
- State machines for loading

---

## ✅ **USE THE SIMPLE PATTERN INSTEAD**

### **Single Source of Truth**
```javascript
// ResourcesContext loads ALL data
export function ResourcesProvider({ children }) {
  const { reference } = useReferenceContext();
  const [resources, setResources] = useState({});
  
  useEffect(() => {
    if (!reference?.bookId) return;
    const resourcesToLoad = Array.from(activeResources);
    Promise.allSettled(
      resourcesToLoad.map(type => loadResourceForType(type, reference))
    ).then(results => {
      const newResources = {};
      resourcesToLoad.forEach((type, index) => {
        newResources[type] = results[index].value || null;
      });
      setResources(newResources);
    });
  }, [reference]);
  
  return (
    <ResourcesContext.Provider value={resources}>
      {children}
    </ResourcesContext.Provider>
  );
}
```

### **Pure Display Panels**
```javascript
// Panels self-activate and display data
export function TranslationNotesPanel() {
  const { resources, activateResource } = useResourcesContext();
  
  // Self-activate this resource type
  useEffect(() => {
    activateResource('notes');
  }, [activateResource]);
  
  if (!resources.notes?.length) {
    return <div>No notes available</div>;
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

### **Direct Context Access**
```javascript
// LLM Chat self-activates all resources and uses direct context
export function LLMChatPanel() {
  const { resources, activateResource } = useResourcesContext();
  
  // Ensure all resources are active for comprehensive AI context
  useEffect(() => {
    ['scripture', 'notes', 'questions', 'words', 'links'].forEach(activateResource);
  }, [activateResource]);
  
  const sendMessage = async (message) => {
    const context = {
      reference: resources.reference,
      scripture: resources.scripture,
      notes: resources.notes,
      questions: resources.questions,
      words: resources.words,
      links: resources.links
    };
    
    const response = await llmService.send(message, context);
    // Handle response...
  };
}
```

---

## 📚 **Deprecated Documentation**

These documents contain deprecated patterns and should not be followed:

- `docs/ARCHITECTURE.md` - Contains complex loading patterns
- `docs/lifecycle.md` - Contains complex context flow descriptions
- Sections of `docs/llm-chat-feature.md` - Contains complex resource collection patterns

**👉 Use `docs/SIMPLE-VERSE-LOADING-PATTERN.md` instead**

---

## 🚫 **Anti-Patterns to Avoid**

### Don't Create Complex State
```javascript
// ❌ WRONG - Avoid complex state management
const [resources, setResources] = useState({});
const [manifests, setManifests] = useState({});
const [resourceLoadingStates, setResourceLoadingStates] = useState({});
const [metadata, setMetadata] = useState(null);
const resourcesRef = useRef({});
```

### Don't Load Data in Panels
```javascript
// ❌ WRONG - Don't load data in panels
useEffect(() => {
  async function loadNotes() {
    const notes = await getNotesForVerse(...);
    setNotes(notes);
  }
  loadNotes();
}, [reference]);
```

### Don't Use Panel Refs
```javascript
// ❌ WRONG - Don't use panel refs for data
const getResourcesFromPanels = useCallback(() => {
  const resources = {};
  if (panelRefs?.scripturePanel?.current) {
    const data = panelRefs.scripturePanel.current.getData?.();
    resources.scripture = data;
  }
  return resources;
}, [panelRefs]);
```

### Don't Poll for Updates
```javascript
// ❌ WRONG - Don't poll for resource updates
useEffect(() => {
  const interval = setInterval(updateResourceCounts, 500);
  return () => clearInterval(interval);
}, []);
```

---

## 🎯 **Migration Required**

If you see any of these deprecated patterns in the codebase:

1. **Stop immediately** - Don't continue with the old pattern
2. **Read the migration guide** - `docs/MIGRATION-TO-SIMPLE-PATTERN.md`
3. **Follow the simple pattern** - `docs/SIMPLE-VERSE-LOADING-PATTERN.md`
4. **Remove the complex code** - Simplify to the new pattern

---

## 🚨 **Why These Patterns Were Deprecated**

### Complexity Issues
- Too many moving parts
- Hard to debug and maintain
- Difficult for new developers to understand
- Prone to race conditions and bugs

### Performance Issues
- Loading too much data (420KB vs 10KB)
- Inefficient caching strategies
- Unnecessary API calls and polling
- Memory leaks and performance degradation

### Maintainability Issues
- Code scattered across multiple files
- Duplicate loading logic in every panel
- Complex error handling and recovery
- Difficult to add new resource types

---

## ✅ **The Simple Pattern Solves All These Issues**

- **Single source of truth** - One place to load data
- **Pure display components** - Panels just show data
- **Natural scalability** - Small requests scale better
- **Easy maintenance** - One place to fix issues
- **Simple testing** - Easy to mock and test
- **Fast development** - New features in minutes, not hours

---

**Remember: If it's complex, it's probably wrong. Keep it simple!** 