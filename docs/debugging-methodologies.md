# Debugging Methodologies Documentation

## Overview

This document outlines systematic debugging approaches used to resolve complex issues in the translation-helps application. These methodologies were proven effective during the resolution of organization avatar display issues and API integration problems in version 2.12.1.

**Note**: As of version 3.1.1, the application uses a centralized logger utility (`src/utils/logger.js`) set to WARN level by default to reduce console noise. When debugging, you may need to temporarily adjust the log level to INFO or DEBUG for detailed output.

## Systematic Debugging Approach

### 1. Issue Isolation Methodology

#### Step 1: Define the Problem Precisely
```
❌ Vague: "Organizations not showing logos"
✅ Specific: "Organization avatars displaying as initials instead of logo images in ResourceSelector component for unfoldingWord, WycliffeAssociates, and ru_gt organizations"
```

#### Step 2: Identify the Data Flow
```
API Response → catalogService.js → ResourceSelector.jsx → DOM Rendering
```

#### Step 3: Test Each Layer Independently
1. **API Layer**: Verify raw API response contains avatar URLs
2. **Service Layer**: Confirm data extraction preserves avatar URLs  
3. **Component Layer**: Check props contain correct avatar URLs
4. **Rendering Layer**: Verify DOM elements receive correct src attributes

### 2. API Debugging Patterns

#### Direct API Testing
```bash
# Test API endpoint directly
curl -I "https://git.door43.org/api/v1/catalog/search?metadataType=rc&lang=en&limit=5&subject=Bible"

# Expected: HTTP/1.1 200 OK
# If 422: Check required parameters (metadataType=rc)
# If 404: Verify endpoint URL format
```

#### API Response Analysis Script
```javascript
#!/usr/bin/env node
import { searchResourcesAcrossOrgs } from './src/services/catalogService.js';

async function debugApiResponse() {
  try {
    const resources = await searchResourcesAcrossOrgs('en', 'Bible');
    
    console.log('📊 API Response Analysis:');
    console.log('='.repeat(50));
    
    Object.entries(resources).forEach(([org, orgResources]) => {
      const firstResource = orgResources[0];
      console.log(`\n🏢 Organization: ${org}`);
      console.log(`   Raw owner data:`, firstResource?.repo?.owner);
      console.log(`   Extracted organizationData:`, firstResource?.organizationData);
      console.log(`   Avatar URL:`, firstResource?.organizationData?.avatar_url);
    });
    
  } catch (error) {
    console.error('❌ API Debug failed:', error.message);
  }
}

debugApiResponse();
```

### 3. Component State Debugging

#### Props Verification Pattern
```javascript
// Add temporary debugging in component
console.log('🔍 Component Props Debug:', {
  organizationData: group.organization,
  hasAvatarUrl: !!group.organization.avatar_url,
  avatarUrl: group.organization.avatar_url
});
```

#### React DevTools Integration
```javascript
// Expose context for debugging in development
if (process.env.NODE_ENV === 'development') {
  window.debugResourcesContext = useContext(ResourcesContext);
  window.debugReferenceContext = useContext(ReferenceContext);
}
```

### 4. Network Resource Debugging

#### Image Loading Verification
```javascript
// Test image accessibility
const testImageLoad = (url) => {
  const img = new Image();
  img.onload = () => console.log(`✅ Image loaded: ${url}`);
  img.onerror = () => console.log(`❌ Image failed: ${url}`);
  img.src = url;
};

// Test all organization avatars
testImageLoad('https://git.door43.org/avatars/1bc81b740b4286613cdaa55ddfe4b1fc');
```

#### CORS and Network Analysis
```bash
# Check image headers and CORS
curl -I "https://git.door43.org/avatars/1bc81b740b4286613cdaa55ddfe4b1fc"

# Look for:
# - HTTP/1.1 200 OK
# - Content-Type: image/png
# - Access-Control-Allow-Origin: *
```

### 5. Browser Debugging Techniques

#### Cache Investigation
```javascript
// Check if caching is the issue
// 1. Hard refresh: Ctrl+F5 / Cmd+Shift+R
// 2. Incognito window test
// 3. Clear application cache in DevTools
// 4. Check Network tab for 304 vs 200 responses
```

#### Console Debugging Patterns
```javascript
// Strategic console logging
console.group('🏢 Organization Avatar Debug');
console.log('Organization data:', organizationData);
console.log('Avatar URL present:', !!avatarUrl);
console.log('Image element created:', imgElement);
console.groupEnd();
```

## Root Cause Analysis Framework

### 1. The "5 Whys" Technique

**Problem**: Organizations showing letters instead of logos

1. **Why are letters showing?** → Fallback initials are displaying
2. **Why are fallback initials displaying?** → Image elements not rendering
3. **Why are image elements not rendering?** → Component logic choosing initials path
4. **Why is component choosing initials?** → avatar_url prop is missing/undefined
5. **Why is avatar_url missing?** → Browser cache serving old version without avatar system

### 2. Hypothesis Testing

#### Hypothesis: "Browser caching issue"
**Test**: Load in incognito window
**Result**: ✅ Logos display correctly in incognito
**Conclusion**: Confirmed browser caching

#### Hypothesis: "API data missing"
**Test**: Console log organization data
**Result**: ✅ Avatar URLs present in data
**Conclusion**: API data is correct

#### Hypothesis: "Component logic error"
**Test**: Trace component rendering logic
**Result**: ✅ Logic correctly checks for avatar_url
**Conclusion**: Component logic is sound

### 3. Data Verification Patterns

#### End-to-End Data Flow Testing
```javascript
// Test complete data pipeline
async function testDataPipeline() {
  // 1. Test API response
  const apiResponse = await fetch('https://git.door43.org/api/v1/catalog/search?metadataType=rc&lang=en&limit=1&subject=Bible');
  const apiData = await apiResponse.json();
  console.log('1. API Response:', apiData.data[0]?.repo?.owner?.avatar_url);
  
  // 2. Test service processing
  const processedData = await searchResourcesAcrossOrgs('en', 'Bible');
  console.log('2. Processed Data:', processedData.unfoldingWord?.[0]?.organizationData?.avatar_url);
  
  // 3. Test component props (add to component)
  console.log('3. Component Props:', group.organization.avatar_url);
  
  // 4. Test DOM rendering (check Elements tab)
  // Look for <img src="..." /> vs <div>initials</div>
}
```

## Error Pattern Recognition

### Common Error Signatures

#### 1. API Integration Errors
```
Pattern: 422 Unprocessable Entity
Cause: Missing metadataType=rc parameter
Solution: Update to v1 API format with required parameters
```

#### 2. Organization Context Errors
```
Pattern: Resources loading from wrong organization
Cause: Organization info not passed through component hierarchy
Solution: Ensure organization prop passed in onSelect callbacks
```

#### 3. Caching-Related Issues
```
Pattern: New features not appearing for existing users
Cause: Browser cache serving old JavaScript/CSS
Solution: Cache-busting techniques, version headers
```

#### 4. Image Loading Failures
```
Pattern: Images showing briefly then disappearing
Cause: CORS issues or network timeouts
Solution: Error handling with fallback systems
```

## Debugging Tool Creation

### 1. Quick Debug Scripts

#### API Endpoint Tester
```javascript
// scripts/test-api-endpoint.js
const testEndpoint = async (endpoint, params) => {
  const url = `${endpoint}?${new URLSearchParams(params)}`;
  console.log(`Testing: ${url}`);
  
  try {
    const response = await fetch(url);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Data count: ${data.data?.length || 0}`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};
```

#### Component State Inspector
```javascript
// Add to component for debugging
const debugComponentState = () => {
  console.table({
    'Props Received': Object.keys(props),
    'State Variables': Object.keys(state),
    'Context Values': Object.keys(context),
    'Avatar URLs': resources.map(r => r.avatar_url).filter(Boolean)
  });
};
```

### 2. Automated Debugging

#### Health Check Function
```javascript
export async function runHealthCheck() {
  const checks = {
    'API v1 Endpoint': await testApiEndpoint(),
    'Organization Data': await testOrganizationExtraction(),
    'Avatar URLs': await testAvatarAccessibility(),
    'Component Rendering': testComponentLogic()
  };
  
  console.table(checks);
  return checks;
}
```

## Prevention Strategies

### 1. Defensive Programming Patterns

#### Safe Data Access
```javascript
// Always use optional chaining and fallbacks
const avatarUrl = resource?.organizationData?.avatar_url || null;
const orgName = resource?.organizationData?.full_name || 
                resource?.organizationData?.login || 
                'Unknown Organization';
```

#### Error Boundary Implementation
```javascript
// Wrap components with error boundaries
<ErrorBoundary fallback={<OrganizationFallback />}>
  <OrganizationDisplay organization={org} />
</ErrorBoundary>
```

### 2. Logging and Monitoring

#### Strategic Logging Points
```javascript
// Log at critical decision points
console.log('🔍 Resource selection:', { resourceId, organizationId });
console.log('🏢 Organization context:', { current: currentOrg, selected: selectedOrg });
console.log('🖼️ Avatar loading:', { url: avatarUrl, fallback: showFallback });
```

#### Performance Monitoring
```javascript
// Track API response times
const startTime = performance.now();
const result = await apiCall();
const duration = performance.now() - startTime;
console.log(`API call took ${duration.toFixed(2)}ms`);
```

### 3. Testing Integration

#### Debug-Friendly Test Setup
```javascript
// Create test utilities that expose internal state
export const createTestableComponent = (Component) => {
  return (props) => {
    const internalState = useInternalState();
    
    // Expose state for testing
    if (process.env.NODE_ENV === 'test') {
      Component.lastInternalState = internalState;
    }
    
    return <Component {...props} />;
  };
};
```

## Documentation Integration

### 1. Issue Documentation Template
```markdown
## Issue: [Brief Description]

### Environment
- Browser: [Chrome 91.0.4472.124]
- OS: [macOS 11.4]
- App Version: [2.12.1]

### Steps to Reproduce
1. [Specific step]
2. [Specific step]
3. [Observed behavior]

### Expected vs Actual
- Expected: [Specific expectation]
- Actual: [Specific observation]

### Investigation
- [ ] API response verified
- [ ] Component props checked
- [ ] Console errors reviewed
- [ ] Network requests analyzed

### Root Cause
[Detailed explanation of underlying cause]

### Solution
[Specific changes made to resolve issue]

### Prevention
[Changes made to prevent recurrence]
```

### 2. Debugging Runbook
```markdown
## Debugging Runbook: Organization Avatars

### Quick Checks
1. Hard refresh browser (Ctrl+F5)
2. Check browser console for errors
3. Verify API endpoint in Network tab
4. Test in incognito window

### Deep Investigation
1. Run API debug script
2. Check organization data extraction
3. Verify component prop passing
4. Test image URL accessibility

### Common Solutions
- Clear browser cache
- Update API parameters
- Fix organization context passing
- Add error handling for images
```

## Related Documentation
- `docs/organization-avatar-system.md` - Avatar system architecture
- `docs/api-integration-patterns.md` - API debugging patterns
- `docs/component-architecture.md` - Component debugging strategies
- `docs/testing-strategies.md` - Automated debugging approaches

## Version History
- **v2.12.1**: Established systematic debugging for avatar issues
- **v2.12.0**: Created debugging framework for visual enhancements
- **Future**: Automated health checks and monitoring systems 