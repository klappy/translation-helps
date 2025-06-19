# Cross-Organization Resource Loading Documentation

## Overview

The cross-organization resource loading system allows users to select and view Bible resources from any organization (unfoldingWord, MVHS, Door43-Catalog, WycliffeAssociates, etc.) without being restricted to a single organization. This system was enhanced in version 2.12.1 to fix critical bugs where resources would load from the wrong organization.

## System Architecture

### Data Flow
1. **Resource Selection** → User selects resource from ResourceSelector
2. **Organization Context** → Resource organization passed to ReferenceContext
3. **Scripture Loading** → Scripture fetched from correct organization
4. **Error Handling** → Graceful fallback if resource not available

### Key Components

#### 1. Resource Selection (`src/components/ScripturePanelRCL/selectors/ResourceSelector.jsx`)
```javascript
const handleResourceSelect = (resource) => {
  onSelect({
    id: resource.id,
    organization: resource.organization,  // ← Critical: Pass organization
    name: resource.name || resource.title || resource.id.toUpperCase(),
    type: resource.type || resource.subject
  });
};
```

#### 2. Navigation Handler (`src/components/ScripturePanelRCL/ScripturePanelNavigation.jsx`)
```javascript
const handleResourceSelect = (resource) => {
  updateContext({ 
    resourceId: resource.id,
    resourceOrganization: resource.organization,  // ← Critical: Set organization context
    reference: reference?.bookId 
      ? reference 
      : { bookId: null, chapter: 1, verse: 1 }
  });
};
```

#### 3. Context Management (`src/context/ReferenceContext.jsx`)
```javascript
const getResourceOrganization = (resourceType = 'scripture') => {
  // Always check for resource-specific organization first (not just in advanced mode)
  if (resourceType === 'scripture' && resourceOrganization) {
    return resourceOrganization;  // ← Returns correct organization
  }
  
  // Fall back to global organization
  return organization;
};
```

#### 4. Scripture Loading (`src/components/ScripturePanelRCL/ScripturePanelRCL.jsx`)
```javascript
const effectiveOrganization = getResourceOrganization ? 
  getResourceOrganization('scripture') : organization;

const rawUSFM = await fetchBook({
  languageId,
  resourceId: selectedResourceId,
  bookId,
  manifest: selectedManifest,
  organization: effectiveOrganization,  // ← Uses correct organization
  signal: abortController.signal,
});
```

## Critical Bug Fixes (v2.12.1)

### Bug 1: Advanced Mode Requirement
Prior to v2.12.1, the `getResourceOrganization` function only returned the resource-specific organization when `advancedMode` was enabled:

```javascript
// ❌ BROKEN (Before Fix)
const getResourceOrganization = (resourceType = 'scripture') => {
  if (advancedMode) {  // ← Only worked in advanced mode
    if (resourceType === 'scripture' && resourceOrganization) {
      return resourceOrganization;
    }
  }
  return organization;  // ← Always returned global organization in basic mode
};
```

### The Fix
Removed the `advancedMode` requirement for cross-organization resource loading:

```javascript
// ✅ FIXED (After Fix)
const getResourceOrganization = (resourceType = 'scripture') => {
  // Always check for resource-specific organization first (not just in advanced mode)
  if (resourceType === 'scripture' && resourceOrganization) {
    return resourceOrganization;  // ← Works in all modes
  }
  return organization;
};
```

### Bug 2: URL Organization Context
The URL update logic only used the global organization, not the resource-specific organization:

```javascript
// ❌ BROKEN (Before Fix)
useEffect(() => {
  const context = {
    organization,  // ← Always used global organization
    languageId,
    resourceId,
    reference,
  };
  updateQueryFromContext(context);
}, [organization, languageId, resourceId, reference]);  // ← Missing resourceOrganization
```

### The Fix
Updated URL logic to use effective organization and include resourceOrganization in dependencies:

```javascript
// ✅ FIXED (After Fix)
useEffect(() => {
  // Use the effective organization for URL (resource-specific if available, otherwise global)
  const effectiveOrganization = resourceOrganization || organization;
  
  const context = {
    organization: effectiveOrganization,  // ← Uses resource organization
    languageId,
    resourceId,
    reference,
  };
  updateQueryFromContext(context);
}, [organization, languageId, resourceId, reference, resourceOrganization]);  // ← Added resourceOrganization
```

### Bug 3: unfoldingWord Default Everywhere
Changed default organization from "unfoldingWord" to "Door43-Catalog" throughout the codebase to better reflect the multi-organization nature of the catalog.

### Combined Impact
- **Before**: User selects MVHS resource → Scripture loads from unfoldingWord → URL shows `owner=unfoldingWord` → Error message
- **After**: User selects MVHS resource → Scripture loads from MVHS → URL shows `owner=MVHS` → Success

## Expected Behavior

### ✅ Normal Cross-Organization Flow
1. User navigates to French language
2. User sees resources from multiple organizations (MVHS, Door43-Catalog, unfoldingWord)
3. User selects "fr_glt" from MVHS organization
4. App loads scripture from MVHS/fr_glt (not unfoldingWord/fr_glt)
5. Scripture displays correctly

### ✅ Organization Context Persistence
- Organization context persists throughout navigation within same resource
- Context cleared when language changes (resources may not be available)
- Context cleared when explicitly selecting different organization

### ✅ Error Handling
- If resource not available from selected organization, show helpful error
- Error message includes correct organization name (not default unfoldingWord)
- Graceful fallback suggestions provided

## Common Issues & Solutions

### Issue 1: "Resource loads from wrong organization"
**Symptoms**: 
- User selects MVHS resource
- Error: "The selected Bible resource (GLT) is not available for unfoldingWord/fr"
- Should say: "...not available for MVHS/fr"

**Root Cause**: `getResourceOrganization` returning global organization instead of resource organization

**Solution**: Ensure resource organization context is properly passed through component hierarchy

**Debugging**:
```javascript
// Check organization context in browser console
console.log('Resource org:', resourceOrganization);
console.log('Global org:', organization);
console.log('Effective org:', getResourceOrganization('scripture'));
```

### Issue 2: "Organization context not cleared on language change"
**Symptoms**:
- User selects MVHS French resource
- User changes to English language
- App tries to load MVHS English resource (may not exist)

**Root Cause**: Resource organization not cleared when language changes

**Solution**: Clear `resourceOrganization` when `languageId` changes

```javascript
if (updates.languageId !== undefined) {
  setLanguageId(updates.languageId);
  // Clear resource organization when language changes
  if (updates.languageId !== languageId) {
    setResourceOrganization(null);
  }
}
```

### Issue 3: "Advanced mode required for cross-organization"
**Symptoms**: Cross-organization only works when advanced mode enabled

**Root Cause**: Logic incorrectly gated behind `advancedMode` flag

**Solution**: Remove `advancedMode` requirement for basic cross-organization support

## API Integration

### Organization Metadata Extraction
```javascript
// From catalogService.js
function processApiResponse(apiData) {
  apiData.data?.forEach(resource => {
    let organizationName;
    let organizationData = null;
    
    if (typeof resource.repo?.owner === 'string') {
      organizationName = resource.repo.owner;
    } else if (typeof resource.repo?.owner === 'object') {
      organizationName = resource.repo.owner.login || resource.repo.owner.username;
      organizationData = resource.repo.owner;
    }
    
    // Attach organization metadata to resource
    resource.organizationData = organizationData;
    resource.organization = organizationName;  // ← Critical for cross-org
  });
}
```

### Scripture Service Integration
```javascript
// From scriptureService.js
export async function fetchBook({ 
  languageId, 
  resourceId, 
  bookId, 
  organization,  // ← Must be correct organization
  manifest 
}) {
  const url = `https://git.door43.org/${organization}/${languageId}_${resourceId}/raw/branch/master/${bookId}.usfm`;
  // ... fetch logic
}
```

## Testing Strategies

### Manual Testing
1. **Multi-Organization Selection**:
   - Select French language
   - Verify resources from multiple organizations displayed
   - Select resource from non-unfoldingWord organization
   - Verify scripture loads correctly

2. **Organization Context Persistence**:
   - Select cross-organization resource
   - Navigate between chapters/verses
   - Verify organization context maintained

3. **Language Change Cleanup**:
   - Select cross-organization resource
   - Change language
   - Verify organization context cleared
   - Verify fallback to default organization

### Automated Testing
```javascript
describe('Cross-Organization Resource Loading', () => {
  test('loads resource from correct organization', async () => {
    const mockResource = { id: 'glt', organization: 'MVHS' };
    
    // Simulate resource selection
    await handleResourceSelect(mockResource);
    
    // Verify organization context
    expect(getResourceOrganization('scripture')).toBe('MVHS');
  });
  
  test('clears organization context on language change', async () => {
    // Set cross-organization resource
    updateContext({ resourceOrganization: 'MVHS' });
    
    // Change language
    updateContext({ languageId: 'es' });
    
    // Verify organization context cleared
    expect(resourceOrganization).toBeNull();
  });
});
```

### Debug Testing Script
```javascript
// test-cross-org-loading.js
import { searchResourcesAcrossOrgs } from './src/services/catalogService.js';

async function testCrossOrgLoading() {
  const resources = await searchResourcesAcrossOrgs('fr', 'Bible');
  
  Object.entries(resources).forEach(([org, orgResources]) => {
    console.log(`\n🏢 ${org}:`);
    orgResources.forEach(resource => {
      console.log(`   📖 ${resource.id}: organization=${resource.organization}`);
    });
  });
}
```

## State Management

### ReferenceContext State
```javascript
const [organization, setOrganization] = useState("unfoldingWord");      // Global org
const [resourceOrganization, setResourceOrganization] = useState(null); // Resource-specific org
const [advancedMode, setAdvancedMode] = useState(false);                // Advanced mode flag
```

### State Transitions
```javascript
// Initial state
organization: "unfoldingWord"
resourceOrganization: null
→ getResourceOrganization('scripture') returns "unfoldingWord"

// User selects MVHS resource
organization: "unfoldingWord"
resourceOrganization: "MVHS"
→ getResourceOrganization('scripture') returns "MVHS"

// User changes language
organization: "unfoldingWord"
resourceOrganization: null  // ← Cleared
→ getResourceOrganization('scripture') returns "unfoldingWord"
```

## Error Messages

### Correct Error Format
```javascript
const effectiveOrganization = getResourceOrganization('scripture');
const errorMessage = `The selected Bible resource (${resourceId.toUpperCase()}) is not available for ${effectiveOrganization}/${languageId}. Please try selecting a different resource from the dropdown above.`;
```

### Error Message Examples
- ✅ "The selected Bible resource (GLT) is not available for MVHS/fr. Please try selecting a different resource from the dropdown above."
- ❌ "The selected Bible resource (GLT) is not available for unfoldingWord/fr. Please try selecting a different resource from the dropdown above." (when MVHS was selected)

## Maintenance Guidelines

### When Adding New Organizations
1. Verify organization metadata extraction in catalogService
2. Test resource selection and organization context passing
3. Verify scripture loading from new organization
4. Update error handling if needed

### When Modifying Resource Selection
1. Ensure organization context always passed in `onSelect` callback
2. Test with resources from multiple organizations
3. Verify organization context persistence and cleanup
4. Update tests to cover new selection logic

### When Updating Context Management
1. Maintain backward compatibility with existing API
2. Ensure organization context cleared appropriately
3. Test both basic and advanced mode scenarios
4. Update documentation with any API changes

## Related Documentation
- `docs/api-integration-patterns.md` - API integration best practices
- `docs/organization-avatar-system.md` - Organization visual display system
- `docs/debugging-methodologies.md` - Debugging cross-organization issues
- `docs/Resource_Integration_Overview.md` - Overall resource integration architecture

## Version History
- **v2.12.1**: Fixed cross-organization loading by removing advancedMode requirement
- **v2.12.0**: Enhanced organization metadata extraction and context management
- **v2.11.x**: Initial cross-organization support (limited to advanced mode)

## Future Enhancements
- **URL Persistence**: Include organization context in URL parameters
- **Organization Preferences**: Remember user's preferred organizations
- **Mixed Organization Mode**: Allow different organizations for different resource types
- **Organization Discovery**: Automatic discovery of available organizations per language 