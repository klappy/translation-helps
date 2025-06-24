# 🔌 API Integration

**Tier 2 Feature Documentation**  
*Door43 Content Service (DCS) integration architecture and patterns*

---

## 📋 Overview

This folder contains all documentation related to integrating with the Door43 Content Service (DCS) API, including resource discovery, content fetching, and optimization strategies.

### Core Principles
- **API-Direct Architecture**: No manifest intermediaries
- **Ingredients-Based**: Use catalog API resource metadata
- **Performance Optimized**: Subject filtering and efficient queries
- **Cross-Organization**: Support multiple content organizations

---

## 📚 Documentation Index

### Core Integration
- **[api-integration-patterns.md](api-integration-patterns.md)** - Comprehensive API integration patterns and best practices
- **[DCS_Integration_Documentation.md](DCS_Integration_Documentation.md)** - Door43 Content Service integration guide
- **[api-direct-service-architecture.md](api-direct-service-architecture.md)** - API-direct service architecture

### Performance & Optimization
- **[catalog-api-optimization.md](catalog-api-optimization.md)** - Performance optimizations with 90% improvements

### Legacy & Migration
- **[../tier3-implementation/deprecated/NO-MANIFESTS-API-DIRECT.md](../tier3-implementation/deprecated/NO-MANIFESTS-API-DIRECT.md)** - Why manifests were eliminated

---

## 🏗️ Architecture Overview

### API Integration Stack

```
┌─────────────────────────────────────────┐
│              React Components           │
├─────────────────────────────────────────┤
│           ResourcesContext              │
│        (Single Source of Truth)         │
├─────────────────────────────────────────┤
│            Service Layer                │
│  ├─ catalogService.js                   │
│  ├─ scriptureService.js                 │
│  ├─ tnService.js                        │
│  ├─ tqService.js                        │
│  └─ twlService.js                       │
├─────────────────────────────────────────┤
│             DCS Client                  │
│         (dcsClient.js)                  │
├─────────────────────────────────────────┤
│          Door43 Content Service        │
│  ├─ Catalog API (/api/v1/catalog/*)    │
│  ├─ Languages API                      │
│  └─ Raw Content (Git repos)            │
└─────────────────────────────────────────┘
```

### Key APIs

| API Endpoint | Purpose | Performance Notes |
|--------------|---------|-------------------|
| `/api/v1/catalog/search` | Resource discovery | Use subject filtering |
| `/api/v1/catalog/list/languages` | Language list | Direct endpoint (90% faster) |
| `/{org}/{repo}/raw/branch/master/{file}` | Content fetching | Browser caching enabled |

---

## 🚀 Quick Start

### Basic Resource Loading
```javascript
// 1. Discover resources
const resourceData = await searchAllResourcesForLanguage('en');

// 2. Find specific resource
const resource = resourceData.resources['unfoldingWord']
  .find(r => r.subject === 'Translation Notes');

// 3. Get file path from ingredients
const ingredient = resource.ingredients
  .find(ing => ing.identifier === 'tit');
const filePath = ingredient.path; // "./tn_TIT.tsv"

// 4. Fetch content
const content = await fetchResourceFile('en', 'tn', filePath, 'unfoldingWord');
```

### Performance Optimization
```javascript
// Use subject filtering to reduce payload by 15.4%
const searchParams = {
  subject: ['Bible', 'Aligned Bible', 'Translation Notes', 'Translation Questions']
};
```

---

## 🛡️ Error Handling Strategy

### Graceful Degradation
```javascript
// Multiple fallback strategies
try {
  return await primaryResourceLoad();
} catch (error) {
  try {
    return await fallbackResourceLoad();
  } catch (fallbackError) {
    return await defaultResourceLoad();
  }
}
```

### Common Error Scenarios
- **404 Not Found**: Resource or file doesn't exist
- **Network Timeout**: Slow or unreliable connection
- **Rate Limiting**: Too many requests
- **Invalid Response**: Malformed API response

---

## 📊 Performance Metrics

### Before Optimization
- Language loading: 4,000-9,000ms
- Resource discovery: 20-50+ manifest requests
- Data transfer: ~420KB per chapter

### After Optimization  
- Language loading: ~500ms (90% improvement)
- Resource discovery: 0 manifest requests
- Data transfer: ~10KB per verse (95% reduction)

---

## 🔄 Migration Guide

### From Manifest-Based to API-Direct

#### ❌ Old Pattern (Deprecated)
```javascript
const manifest = await fetchManifest(languageId, 'tn', organization);
const project = manifest.projects.find(p => p.identifier === bookId);
const filePath = project.path;
```

#### ✅ New Pattern (Current)
```javascript
const resourceData = await searchAllResourcesForLanguage(languageId);
const resource = resourceData.resources[organization].find(r => r.subject === 'Translation Notes');
const ingredient = resource.ingredients.find(ing => ing.identifier === bookId);
const filePath = ingredient.path.replace('./', '');
```

---

## 🧪 Testing Strategy

### Unit Tests
- Mock API responses with realistic data
- Test error handling scenarios
- Verify performance optimizations

### Integration Tests
- Test against live DCS API
- Verify cross-organization resource loading
- Performance benchmarking

### E2E Tests
- Complete user workflows
- Resource switching scenarios
- Error recovery testing

---

## 🔧 Troubleshooting

### Common Issues

#### Resource Not Found
```javascript
// Check resource availability
const available = resource.ingredients.some(ing => ing.identifier === bookId);
if (!available) {
  console.warn(`Book ${bookId} not available in ${resource.name}`);
}
```

#### Performance Issues
```javascript
// Enable subject filtering
const subjects = ['Bible', 'Translation Notes', 'Translation Questions'];
const params = { subject: subjects.join(',') };
```

#### Cross-Organization Conflicts
```javascript
// Ensure organization-specific resource selection
const orgResources = resourceData.resources[organization];
if (!orgResources) {
  throw new Error(`No resources found for organization: ${organization}`);
}
```

---

## 📚 Related Documentation

### Tier 1 Core
- [PRINCIPLES.md](../../tier1-core/PRINCIPLES.md#api-direct-architecture) - API-direct principles
- [ARCHITECTURE-OVERVIEW.md](../../tier1-core/ARCHITECTURE-OVERVIEW.md) - System architecture

### Tier 2 Features
- [Translation Resources](../translation-resources/README.md) - Resource-specific implementations
- [UI Components](../ui-components/README.md) - How components use APIs

### Tier 3 Implementation
- [Deprecated Patterns](../../tier3-implementation/deprecated/) - What not to do
- [Troubleshooting](../../tier3-implementation/troubleshooting/) - Common issues

---

## 🔄 Maintenance

### Regular Tasks
- Monitor API performance metrics
- Update subject filtering as new resource types added
- Review error logs for new failure patterns
- Benchmark against DCS API changes

### Documentation Updates
- Update when new DCS API endpoints available
- Document new resource types and subjects
- Maintain performance benchmarks
- Update error handling for new scenarios

---

*Last Updated: 2025-01-27*  
*Consolidates: Multiple API-related documentation files*  
*Performance: 90% improvement in language loading* 