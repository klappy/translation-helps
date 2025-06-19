# DCS API Integration Patterns Documentation

## Overview

This document outlines the proper patterns for integrating with the Door43 Catalog Service (DCS) API. These patterns were established after resolving critical API issues in version 2.12.1 that caused resource loading failures and 422 errors.

## API Endpoint Evolution

### ❌ Legacy API (v5) - Deprecated
```
https://git.door43.org/api/catalog/v5/search
```
**Status**: Deprecated, returns 422 errors
**Issues**: Parameter format incompatibility, unreliable responses

### ✅ Current API (v1) - Active
```
https://git.door43.org/api/v1/catalog/search
```
**Status**: Active and stable
**Required Parameters**: `metadataType=rc`

## Core API Integration Patterns

### 1. Base Search Function Pattern
```javascript
/**
 * Search resources across all organizations
 * @param {string} languageId - Language code (e.g., 'en', 'es')
 * @param {string} subjects - Comma-separated subjects (e.g., 'Bible,Aligned Bible')
 * @returns {Object} Resources grouped by organization
 */
export async function searchResourcesAcrossOrgs(languageId, subjects) {
  const params = new URLSearchParams({
    metadataType: 'rc',        // ← REQUIRED for v1 API
    lang: languageId,
    stage: 'prod',
    limit: '100',
    subject: subjects          // ← Comma-separated works in v1
  });
  
  const url = `https://git.door43.org/api/v1/catalog/search?${params}`;
  console.log('🔍 Searching resources across organizations:', url);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return processApiResponse(data);
}
```

### 2. Organization Data Extraction Pattern
```javascript
/**
 * Extract organization metadata from API response
 * Critical: Handle both string and object formats for owner field
 */
function processApiResponse(apiData) {
  const resourcesByOrg = {};
  
  apiData.data?.forEach(resource => {
    // Handle owner field format variations
    let organizationName;
    let organizationData = null;
    
    if (typeof resource.repo?.owner === 'string') {
      organizationName = resource.repo.owner;
    } else if (typeof resource.repo?.owner === 'object') {
      organizationName = resource.repo.owner.login || resource.repo.owner.username;
      organizationData = resource.repo.owner;  // ← Store full metadata
    } else {
      organizationName = 'Unknown';
    }
    
    // Attach organization metadata to resource
    resource.organizationData = organizationData;
    
    if (!resourcesByOrg[organizationName]) {
      resourcesByOrg[organizationName] = [];
    }
    resourcesByOrg[organizationName].push(resource);
  });
  
  return resourcesByOrg;
}
```

### 3. Language Filtering Pattern
```javascript
/**
 * Fetch languages with scripture resources only
 * Prevents showing languages without Bible content
 */
export async function fetchAllLanguages() {
  const cacheKey = 'scripture-languages-v1';
  
  // Check cache first
  if (languageCache.has(cacheKey)) {
    return languageCache.get(cacheKey);
  }
  
  try {
    // Search for scripture resources across all languages
    const resources = await searchResourcesAcrossOrgs('*', 'Bible,Aligned Bible');
    
    // Extract unique languages from results
    const languageSet = new Set();
    Object.values(resources).flat().forEach(resource => {
      if (resource.language) {
        languageSet.add(resource.language);
      }
    });
    
    const languages = Array.from(languageSet).sort();
    
    // Cache results
    languageCache.set(cacheKey, languages);
    return languages;
    
  } catch (error) {
    console.error('Failed to fetch languages:', error);
    return []; // Graceful fallback
  }
}
```

## Critical API Requirements

### Required Parameters
- ✅ `metadataType=rc` - **MANDATORY** for v1 API
- ✅ `lang` - Language code or '*' for all languages
- ✅ `stage=prod` - Production resources only
- ✅ `limit` - Reasonable limit (e.g., 100) to prevent timeouts

### Optional Parameters
- `subject` - Resource types (comma-separated works)
- `owner` - Specific organization filter
- `repo` - Specific repository filter

### Parameter Format Rules
```javascript
// ✅ Correct v1 API parameter format
const params = new URLSearchParams({
  metadataType: 'rc',     // Required
  lang: 'en',
  stage: 'prod',
  limit: '100',
  subject: 'Bible,Aligned Bible'  // Comma-separated OK
});

// ❌ Incorrect - missing metadataType
const params = new URLSearchParams({
  lang: 'en',
  stage: 'prod',
  subject: 'Bible'
});
```

## Response Format Handling

### API Response Structure
```javascript
{
  data: [
    {
      id: "ult",
      name: "unfoldingWord Literal Text",
      repo: {
        owner: {  // ← Can be object or string
          id: 613,
          login: "unfoldingWord",
          full_name: "unfoldingWord®",
          avatar_url: "https://git.door43.org/avatars/...",
          // ... other fields
        }
      },
      language: "en",
      subject: "Aligned Bible",
      // ... other fields
    }
  ]
}
```

### Safe Data Access Pattern
```javascript
// Always use optional chaining and fallbacks
const organizationName = resource.repo?.owner?.login || 
                         resource.repo?.owner || 
                         'Unknown';

const avatarUrl = resource.repo?.owner?.avatar_url || null;
const fullName = resource.repo?.owner?.full_name || organizationName;
```

## Error Handling Patterns

### 1. Network Error Handling
```javascript
try {
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    // Log specific error details
    console.error(`API Error: ${response.status} ${response.statusText}`);
    console.error(`URL: ${apiUrl}`);
    
    // Provide specific error messages
    if (response.status === 422) {
      throw new Error('API parameter error - check metadataType=rc requirement');
    }
    
    throw new Error(`API request failed: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
  
} catch (error) {
  console.error('API request failed:', error);
  
  // Graceful fallback
  return { data: [] };
}
```

### 2. Data Validation Pattern
```javascript
function validateApiResponse(data) {
  if (!data || !Array.isArray(data.data)) {
    console.warn('Invalid API response format:', data);
    return { data: [] };
  }
  
  // Filter out invalid resources
  const validResources = data.data.filter(resource => {
    return resource.id && 
           resource.language && 
           resource.repo?.owner;
  });
  
  return { data: validResources };
}
```

## Caching Strategy

### Cache Key Patterns
```javascript
// Organization-specific caches
const orgCacheKey = `resources-${languageId}-${subjects}-v1`;

// Scripture-specific caches  
const scriptureKey = `scripture-languages-v1`;

// Version-aware cache keys prevent stale data
const versionedKey = `${baseKey}-v${API_VERSION}`;
```

### Cache Implementation
```javascript
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}
```

## Common Pitfalls & Solutions

### Pitfall 1: Using v5 API Endpoints
**Problem**: 422 "Unprocessable Entity" errors
**Solution**: Update to v1 API with `metadataType=rc`

### Pitfall 2: Missing Organization Context
**Problem**: Resources load from wrong organization
**Solution**: Always pass organization info through component props

```javascript
// ✅ Correct - pass organization context
onSelect({
  id: resource.id,
  organization: resource.organization,  // ← Critical
  name: resource.name
});

// ❌ Incorrect - missing organization context
onSelect({
  id: resource.id,
  name: resource.name
});
```

### Pitfall 3: Assuming Owner Field Format
**Problem**: Organization extraction fails when API changes format
**Solution**: Handle both string and object formats

```javascript
// ✅ Robust handling
const getOrganizationName = (owner) => {
  if (typeof owner === 'string') return owner;
  if (typeof owner === 'object') return owner.login || owner.username;
  return 'Unknown';
};
```

## Testing Patterns

### 1. API Endpoint Testing
```javascript
// Test API accessibility
describe('DCS API Integration', () => {
  test('v1 API endpoint responds correctly', async () => {
    const url = 'https://git.door43.org/api/v1/catalog/search?metadataType=rc&lang=en&limit=1';
    const response = await fetch(url);
    expect(response.ok).toBe(true);
  });
});
```

### 2. Organization Data Testing
```javascript
test('extracts organization data correctly', async () => {
  const resources = await searchResourcesAcrossOrgs('en', 'Bible');
  const unfoldingWordResources = resources.unfoldingWord;
  
  expect(unfoldingWordResources).toBeDefined();
  expect(unfoldingWordResources[0].organizationData).toBeTruthy();
  expect(unfoldingWordResources[0].organizationData.avatar_url).toBeTruthy();
});
```

### 3. Manual API Testing
```bash
# Test v1 API directly
curl "https://git.door43.org/api/v1/catalog/search?metadataType=rc&lang=en&limit=5&subject=Bible"

# Expected: 200 OK with JSON response
# If 422: Missing metadataType=rc parameter
```

## Migration Checklist

When updating API integrations:

- [ ] Update endpoint URL to v1 format
- [ ] Add `metadataType=rc` parameter
- [ ] Test with multiple organizations
- [ ] Verify organization data extraction
- [ ] Update cache keys to prevent stale data
- [ ] Test error handling with invalid parameters
- [ ] Verify avatar URLs are accessible
- [ ] Update documentation with changes

## Related Files

### Core API Integration
- `src/services/catalogService.js` - Main API integration logic
- `src/hooks/useResources.js` - Resource loading hooks
- `src/context/ResourcesContext.jsx` - Resource state management

### UI Components Using API Data
- `src/components/ScripturePanelRCL/selectors/ResourceSelector.jsx`
- `src/components/ScripturePanelRCL/selectors/LanguageSelector.jsx`
- `src/components/NavigationWizard/steps/ResourceStep.jsx`

## Version History

- **v2.12.1**: Fixed v5 to v1 API migration, organization context passing
- **v2.12.0**: Enhanced organization data extraction and visual display
- **v2.11.x**: Legacy v5 API integration (deprecated)

## Future Considerations

- **API Versioning**: Monitor for v2 API announcements
- **Rate Limiting**: Implement request throttling if needed
- **Offline Support**: Consider caching strategies for offline use
- **Performance**: Monitor API response times and optimize accordingly 