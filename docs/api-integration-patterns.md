# API Integration Patterns and Best Practices

## Overview

This document captures the API integration patterns, best practices, and architectural decisions discovered during the translation-helps optimization project. These patterns resulted in 90% performance improvements and architectural simplification.

## Core Principles

### 1. API-First Architecture
- **Eliminate intermediary layers** (manifests, custom caching)
- **Use API data directly** rather than transforming it
- **Leverage API metadata** for enhanced functionality
- **Design for API evolution** with fallback strategies

### 2. Performance-First Design
- **Minimize network requests** through endpoint optimization
- **Cache strategically** at the right granularity
- **Prevent duplicate requests** with promise-based deduplication
- **Measure everything** with comprehensive performance logging

### 3. Reliability Through Redundancy
- **Always have fallbacks** for critical API calls
- **Graceful degradation** when enhanced endpoints fail
- **Error boundary isolation** to prevent cascade failures
- **Progressive enhancement** from basic to rich functionality

## API Endpoint Patterns

### Pattern 1: Dedicated vs. Generic Endpoints

#### ❌ Anti-Pattern: Generic Endpoint Abuse
```javascript
// BAD: Using search endpoint to get languages
async function fetchLanguages() {
  // Fetches 1000+ resources just to extract language codes
  const allResources = await fetch('/api/v1/catalog/search?subject=Bible');
  const languages = new Set();
  allResources.forEach(r => languages.add(r.name.split('_')[0]));
  return Array.from(languages);
}
```

#### ✅ Best Practice: Dedicated Endpoint First
```javascript
// GOOD: Use specific endpoint with fallback
async function fetchLanguages() {
  try {
    // Primary: Dedicated endpoint (fast, specific)
    const response = await fetch('/api/v1/catalog/list/languages?stage=prod&subject=Bible');
    return await response.json();
  } catch (error) {
    // Fallback: Generic endpoint (slower, but reliable)
    return await fetchLanguagesFromSearch();
  }
}
```

### Pattern 2: Rich Data Utilization

#### ❌ Anti-Pattern: Data Waste
```javascript
// BAD: Fetching rich data but using only basic fields
const resources = await fetchResources(); // Gets full resource objects
const titles = resources.map(r => r.title); // Only uses title
```

#### ✅ Best Practice: Full Data Utilization
```javascript
// GOOD: Use all available data for enhanced UX
const resources = await fetchResources();
const enhancedResources = resources.map(resource => ({
  ...resource,
  // Use ingredients for file paths
  availableBooks: resource.ingredients?.map(ing => ing.identifier) || resource.books,
  // Use checking data for quality indicators
  qualityLevel: getQualityLevel(resource.checking),
  // Use organization data for avatars
  organizationLogo: resource.repo?.owner?.avatar_url
}));
```

## Caching Patterns

### Pattern 1: Session-Based Caching
```javascript
// Cache data for user session only
export async function fetchWithSessionCache(cacheKey, fetcher) {
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (error) {
      sessionStorage.removeItem(cacheKey); // Clear corrupted cache
    }
  }
  
  const data = await fetcher();
  sessionStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
}
```

### Pattern 2: Promise-Based Deduplication
```javascript
// Prevent duplicate simultaneous requests
const pendingRequests = new Map();

export async function fetchWithDeduplication(key, fetcher) {
  if (pendingRequests.has(key)) {
    console.log(`Deduplicating request for ${key}`);
    return await pendingRequests.get(key);
  }
  
  const promise = fetcher();
  pendingRequests.set(key, promise);
  
  try {
    return await promise;
  } finally {
    pendingRequests.delete(key);
  }
}
```

### Pattern 3: Hierarchical Caching
```javascript
// Cache at multiple levels with different strategies
export class HierarchicalCache {
  constructor() {
    this.memoryCache = new Map();
    this.sessionCache = sessionStorage;
  }
  
  async get(key, fetcher, options = {}) {
    // Level 1: Memory cache (fastest)
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }
    
    // Level 2: Session cache (fast)
    if (!options.skipSession) {
      const cached = this.sessionCache.getItem(key);
      if (cached) {
        const data = JSON.parse(cached);
        this.memoryCache.set(key, data); // Promote to memory
        return data;
      }
    }
    
    // Level 3: Network fetch (slow)
    const data = await fetcher();
    
    // Store in all cache levels
    this.memoryCache.set(key, data);
    if (!options.skipSession) {
      this.sessionCache.setItem(key, JSON.stringify(data));
    }
    
    return data;
  }
}
```

## Error Handling Patterns

### Pattern 1: Graceful Degradation
```javascript
// Provide progressively enhanced functionality
export async function getEnhancedLanguageData(languageId) {
  const baseData = { identifier: languageId, title: languageId };
  
  try {
    // Try to get rich language data
    const enhanced = await fetchLanguageDetails(languageId);
    return { ...baseData, ...enhanced };
  } catch (error) {
    console.warn('Enhanced language data unavailable, using basic data:', error);
    return baseData; // Fallback to basic functionality
  }
}
```

### Pattern 2: Circuit Breaker
```javascript
// Prevent cascade failures with circuit breaker pattern
export class APICircuitBreaker {
  constructor(threshold = 5, timeout = 30000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }
  
  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}
```

## Data Transformation Patterns

### Pattern 1: Normalize at the Boundary
```javascript
// Transform API data to internal format at service boundary
export async function fetchNormalizedResources(filters) {
  const rawResources = await catalogAPI.search(filters);
  
  // Normalize at the boundary
  return rawResources.map(resource => ({
    id: resource.name,
    organization: resource.owner,
    title: resource.title,
    description: resource.description,
    version: resource.version,
    
    // Normalize book availability
    availableBooks: resource.ingredients?.map(ing => ing.identifier) || resource.books || [],
    
    // Normalize file paths
    filePaths: resource.ingredients?.reduce((acc, ing) => {
      acc[ing.identifier] = ing.path.replace('./', '');
      return acc;
    }, {}) || {},
    
    // Normalize quality indicators
    qualityLevel: normalizeQualityLevel(resource.checking),
    
    // Preserve raw data for debugging
    _raw: resource
  }));
}
```

### Pattern 2: Smart Defaults
```javascript
// Provide intelligent defaults for missing data
export function enrichResourceData(resource) {
  return {
    ...resource,
    
    // Smart defaults for missing fields
    title: resource.title || resource.name || resource.id,
    description: resource.description || `${resource.title} resource`,
    version: resource.version || '1.0',
    
    // Compute derived fields
    isComplete: (resource.books?.length || 0) >= 66,
    hasNewTestament: resource.books?.some(book => NEW_TESTAMENT_BOOKS.includes(book)),
    hasOldTestament: resource.books?.some(book => OLD_TESTAMENT_BOOKS.includes(book)),
    
    // Quality indicators
    qualityScore: calculateQualityScore(resource),
    recommendationLevel: getRecommendationLevel(resource)
  };
}
```

## Service Architecture Patterns

### Pattern 1: Service Independence
```javascript
// Each service handles its own resource discovery
export class TranslationNotesService {
  async getNotesForVerseWithResourceData(bookId, chapter, verse, resourceData, languageId, organization) {
    // Service uses ingredients array for actual file path
    const ingredient = resourceData.ingredients.find(ing => ing.identifier === bookId);
    const filePath = ingredient ? ingredient.path : `tn_${bookId.toUpperCase()}.tsv`; // fallback
    
    try {
      const content = await this.fetchResourceFile(languageId, 'tn', filePath, organization);
      return this.parseNotes(content, chapter, verse);
    } catch (error) {
      console.warn(`Translation notes not available for ${bookId} ${chapter}:${verse}:`, error);
      return [];
    }
  }
  
  // Service owns its resource fetching logic
  async fetchResourceFile(languageId, resourceType, filePath, organization) {
    const url = `https://git.door43.org/${organization}/${languageId}_${resourceType}/raw/branch/master/${filePath}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.text();
  }
}
```

### Pattern 2: Ingredients-Based File Resolution
```javascript
// Use ingredients array for actual file paths, with naming conventions as fallback
export const RESOURCE_FILE_RESOLUTION = {
  withResourceData: (resourceType, bookId, resourceData) => {
    const ingredient = resourceData?.ingredients?.find(ing => ing.identifier === bookId);
    if (ingredient) {
      return ingredient.path.replace('./', '');
    }
    
    // Fallback to naming conventions
    return FALLBACK_NAMING_PATTERNS[resourceType](bookId);
  }
};

export const FALLBACK_NAMING_PATTERNS = {
  translationNotes: (bookId) => `tn_${bookId.toUpperCase()}.tsv`,
  translationQuestions: (bookId) => `tq_${bookId.toUpperCase()}.tsv`,
  translationWords: (bookId) => `tw_${bookId.toUpperCase()}.tsv`,
  translationWordLinks: (bookId) => `twl_${bookId.toUpperCase()}.tsv`,
  scripture: (bookId) => `${bookId.toUpperCase()}.usfm`
};

// Use ingredients-based resolution with fallback
export function resolveResourcePath(resourceType, bookId, resourceData = null) {
  if (resourceData) {
    return RESOURCE_FILE_RESOLUTION.withResourceData(resourceType, bookId, resourceData);
  }
  
  const pattern = FALLBACK_NAMING_PATTERNS[resourceType];
  if (!pattern) {
    throw new Error(`Unknown resource type: ${resourceType}`);
  }
  
  return pattern(bookId);
}
```

## Context Management Patterns

### Pattern 1: Single Source of Truth
```javascript
// Centralize resource data in one context
export const ReferenceContext = createContext();

export function ReferenceProvider({ children }) {
  const [state, setState] = useState({
    // Single source of truth for current resource
    currentResourceData: null, // Contains full API response
    
    // Derived state (computed from resource data)
    availableBooks: [],
    filePaths: {},
    qualityLevel: null
  });
  
  // Auto-fetch resource data when reference changes
  useEffect(() => {
    if (needsResourceData()) {
      fetchAndStoreResourceData();
    }
  }, [languageId, resourceId, organization]);
  
  return (
    <ReferenceContext.Provider value={{ state, setState }}>
      {children}
    </ReferenceContext.Provider>
  );
}
```

### Pattern 2: Computed Properties
```javascript
// Use selectors for computed state
export function useResourceSelectors() {
  const { currentResourceData } = useContext(ReferenceContext);
  
  return useMemo(() => ({
    // Computed from current resource data
    availableBooks: currentResourceData?.ingredients?.map(ing => ing.identifier) || [],
    
    isBookAvailable: (bookId) => {
      const ingredients = currentResourceData?.ingredients || [];
      return ingredients.some(ing => ing.identifier === bookId);
    },
    
    getFilePath: (bookId) => {
      const ingredient = currentResourceData?.ingredients?.find(ing => ing.identifier === bookId);
      return ingredient?.path?.replace('./', '');
    },
    
    qualityIndicators: {
      isComplete: (currentResourceData?.books?.length || 0) >= 66,
      hasChecking: !!currentResourceData?.checking,
      version: currentResourceData?.version
    }
  }), [currentResourceData]);
}
```

## Performance Monitoring Patterns

### Pattern 1: Comprehensive Logging
```javascript
// Log performance metrics for all API calls
export function withPerformanceLogging(fn, operation) {
  return async function(...args) {
    const startTime = Date.now();
    const operationId = `${operation}_${Date.now()}`;
    
    console.log(`🚀 Starting ${operation}`, { operationId, args });
    
    try {
      const result = await fn.apply(this, args);
      const duration = Date.now() - startTime;
      
      console.log(`✅ Completed ${operation}`, {
        operationId,
        duration: `${duration}ms`,
        resultSize: JSON.stringify(result).length,
        success: true
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(`❌ Failed ${operation}`, {
        operationId,
        duration: `${duration}ms`,
        error: error.message,
        success: false
      });
      
      throw error;
    }
  };
}

// Usage
const fetchLanguages = withPerformanceLogging(
  async () => { /* fetch logic */ },
  'fetchLanguages'
);
```

### Pattern 2: Performance Budgets
```javascript
// Set performance budgets and warn when exceeded
export class PerformanceBudget {
  constructor(budgets) {
    this.budgets = budgets; // { operation: maxTimeMs }
  }
  
  async monitor(operation, fn) {
    const budget = this.budgets[operation];
    if (!budget) return await fn();
    
    const startTime = Date.now();
    const result = await fn();
    const duration = Date.now() - startTime;
    
    if (duration > budget) {
      console.warn(`⚠️ Performance budget exceeded for ${operation}`, {
        duration: `${duration}ms`,
        budget: `${budget}ms`,
        overage: `${duration - budget}ms`
      });
    }
    
    return result;
  }
}

// Usage
const budgets = new PerformanceBudget({
  fetchLanguages: 1000,    // Should complete in <1s
  fetchResources: 2000,    // Should complete in <2s
  fetchScripture: 500      // Should complete in <500ms
});
```

## Testing Patterns

### Pattern 1: API Contract Testing
```javascript
// Test API response structure and contracts
describe('Catalog API Contracts', () => {
  test('language endpoint returns expected structure', async () => {
    const languages = await fetchLanguages();
    
    expect(languages).toBeInstanceOf(Array);
    expect(languages.length).toBeGreaterThan(0);
    
    languages.forEach(lang => {
      expect(lang).toMatchObject({
        identifier: expect.any(String),
        title: expect.any(String),
        direction: expect.stringMatching(/^(ltr|rtl)$/),
        countries: expect.any(Array),
        gateway: expect.any(Boolean)
      });
    });
  });
  
  test('resource endpoint returns ingredients array', async () => {
    const resources = await fetchResources({ subject: 'Bible' });
    
    resources.forEach(resource => {
      if (resource.ingredients) {
        expect(resource.ingredients).toBeInstanceOf(Array);
        resource.ingredients.forEach(ingredient => {
          expect(ingredient).toMatchObject({
            identifier: expect.any(String),
            path: expect.any(String),
            title: expect.any(String)
          });
        });
      }
    });
  });
});
```

### Pattern 2: Performance Testing
```javascript
// Test performance requirements
describe('API Performance', () => {
  test('language loading completes within budget', async () => {
    const startTime = Date.now();
    const languages = await fetchLanguages();
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(1000); // <1 second budget
    expect(languages.length).toBeGreaterThan(50); // Reasonable result size
  });
  
  test('caching prevents duplicate requests', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    
    // First call should hit network
    await fetchLanguages();
    const firstCallCount = fetchSpy.mock.calls.length;
    
    // Second call should use cache
    await fetchLanguages();
    const secondCallCount = fetchSpy.mock.calls.length;
    
    expect(secondCallCount).toBe(firstCallCount); // No additional network calls
  });
});
```

## Migration Strategies

### Pattern 1: Feature Flags for Gradual Rollout
```javascript
// Use feature flags to gradually migrate to new patterns
export function useOptimizedAPI() {
  const [useOptimized, setUseOptimized] = useState(
    localStorage.getItem('useOptimizedAPI') === 'true'
  );
  
  return {
    useOptimized,
    toggleOptimized: () => {
      const newValue = !useOptimized;
      setUseOptimized(newValue);
      localStorage.setItem('useOptimizedAPI', newValue.toString());
    }
  };
}

// In components
function LanguageSelector() {
  const { useOptimized } = useOptimizedAPI();
  
  const fetchLanguages = useOptimized 
    ? fetchLanguagesOptimized 
    : fetchLanguagesLegacy;
    
  // Rest of component logic...
}
```

### Pattern 2: Parallel Implementation
```javascript
// Run old and new implementations in parallel for comparison
export async function migrateWithValidation(operation, oldImpl, newImpl) {
  const [oldResult, newResult] = await Promise.allSettled([
    oldImpl(),
    newImpl()
  ]);
  
  // Compare results for validation
  if (oldResult.status === 'fulfilled' && newResult.status === 'fulfilled') {
    const isValid = validateResults(oldResult.value, newResult.value);
    if (!isValid) {
      console.warn('New implementation produces different results', {
        old: oldResult.value,
        new: newResult.value
      });
    }
  }
  
  // Return new result if successful, fallback to old
  return newResult.status === 'fulfilled' 
    ? newResult.value 
    : oldResult.value;
}
```

## Conclusion

These API integration patterns represent battle-tested approaches that delivered:

- **90% performance improvements** through endpoint optimization
- **Architectural simplification** via manifest elimination  
- **Enhanced reliability** through fallback strategies
- **Better user experience** with rich metadata utilization

### Key Takeaways

1. **Always explore dedicated endpoints** before using generic search APIs
2. **Utilize all available API data** for enhanced functionality
3. **Implement robust caching** with deduplication and hierarchical strategies
4. **Design for failure** with circuit breakers and graceful degradation
5. **Monitor performance** with budgets and comprehensive logging
6. **Test API contracts** to catch breaking changes early
7. **Migrate gradually** using feature flags and parallel implementations

These patterns form the foundation for scalable, performant, and reliable API integrations that can evolve with changing requirements and API capabilities.

## Related Documentation
- [Manifest Elimination Guide](./manifest-elimination-and-api-discoveries.md)
- [Catalog API Optimization](./catalog-api-optimization.md)
- [Performance Monitoring](./debugging-methodologies.md) 