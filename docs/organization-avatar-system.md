# Organization Avatar System Documentation

## Overview

The organization avatar system displays logos/avatars for Bible resource organizations (unfoldingWord, WycliffeAssociates, ru_gt, etc.) throughout the navigation interface. This system was implemented as part of the visual enhancements in version 2.12.1.

## System Architecture

### Data Flow
1. **API Response** → `catalogService.js` extracts organization metadata
2. **Organization Data** → Passed to React components via props
3. **Component Rendering** → ResourceSelector displays logos with fallbacks
4. **Error Handling** → Automatic fallback to initials if image fails

### Key Components

#### 1. Data Extraction (`src/services/catalogService.js`)
```javascript
// Organization metadata extraction from API response
const organizationData = resource.repo?.owner || null;
resource.organizationData = organizationData;
```

**Critical Fields:**
- `avatar_url`: Direct URL to organization logo image
- `full_name`: Display name (e.g., "unfoldingWord®")
- `login`: Organization identifier (e.g., "unfoldingWord")

#### 2. Component Display (`src/components/ScripturePanelRCL/selectors/ResourceSelector.jsx`)
```javascript
// Organization object construction
const orgObject = {
  id: org, 
  name: org,
  avatar_url: organizationData?.avatar_url,  // ← Key field
  full_name: organizationData?.full_name || org,
  login: organizationData?.login || org
};
```

#### 3. Visual Rendering
```jsx
{group.organization.avatar_url ? (
  <img 
    src={group.organization.avatar_url} 
    alt={group.organization.full_name || group.organization.name}
    className={styles.organizationLogo}
    onError={handleAvatarError}
  />
) : (
  <div className={styles.organizationInitials}>
    {getOrganizationAvatar(group.organization).value}
  </div>
)}
```

## Expected Behavior

### ✅ Normal Operation
- **unfoldingWord**: Shows official logo from `https://git.door43.org/avatars/1bc81b740b4286613cdaa55ddfe4b1fc`
- **WycliffeAssociates**: Shows Wycliffe logo from `https://git.door43.org/avatars/467b375345ba5c6b78026babfd29bbf7`
- **ru_gt**: Shows organization avatar from `https://git.door43.org/avatars/3e4f5bf948d2224abea31d2d2def30ba`
- **Other orgs**: Show their respective avatars when available

### 🔄 Fallback System
- **Image Load Error**: Automatically shows organization initials (e.g., "uW", "WA", "RG")
- **No Avatar URL**: Shows initials immediately
- **Network Issues**: Graceful degradation to initials

## Common Issues & Solutions

### Issue 1: "Organizations showing letters instead of logos"
**Root Cause**: Browser caching of old version before avatar system was implemented

**Solution Steps**:
1. Hard refresh: `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear browser cache for the site
3. Test in incognito/private window
4. Check DevTools Console for avatar loading errors

**Debugging**:
```javascript
// Check organization data in browser console
console.log('Organization object:', group.organization);
console.log('Avatar URL:', group.organization.avatar_url);
```

### Issue 2: "Avatar URLs not being extracted from API"
**Root Cause**: API response format changes or organization metadata missing

**Debugging Script**:
```javascript
// Test organization data extraction
import { searchResourcesAcrossOrgs } from './src/services/catalogService.js';

const resources = await searchResourcesAcrossOrgs('en', 'Aligned Bible,Bible');
Object.entries(resources).forEach(([org, orgResources]) => {
  const firstResource = orgResources[0];
  console.log(`${org}:`, firstResource?.organizationData?.avatar_url);
});
```

### Issue 3: "Images failing to load"
**Root Cause**: Network issues, CORS problems, or invalid URLs

**Verification**:
```bash
# Test avatar URL accessibility
curl -I "https://git.door43.org/avatars/1bc81b740b4286613cdaa55ddfe4b1fc"
```

**Expected Response**: `HTTP/1.1 200 OK` with `Content-Type: image/png`

## API Integration Details

### DCS Catalog API v1
- **Endpoint**: `https://git.door43.org/api/v1/catalog/search`
- **Organization Data Location**: `resource.repo.owner`
- **Avatar URL Format**: `https://git.door43.org/avatars/{hash}`

### Organization Metadata Structure
```javascript
{
  id: 613,
  login: 'unfoldingWord',
  full_name: 'unfoldingWord®',
  avatar_url: 'https://git.door43.org/avatars/1bc81b740b4286613cdaa55ddfe4b1fc',
  html_url: 'https://git.door43.org/unfoldingWord',
  // ... other fields
}
```

## Visual Helpers Integration

The avatar system integrates with `src/utils/visualHelpers.js`:

```javascript
// Fallback avatar generation
export function getOrganizationAvatar(organization) {
  const name = organization.full_name || organization.name || organization.login || 'ORG';
  const initials = name.split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
  
  return {
    type: 'initials',
    value: initials
  };
}
```

## CSS Styling

### Organization Logo Styles (`ResourceSelector.module.css`)
```css
.organizationLogo {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.organizationInitials {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  background-color: var(--color-primary);
  color: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 600;
  border: 1px solid var(--color-border);
}
```

## Testing & Verification

### Manual Testing Checklist
- [ ] Organization logos display correctly in ResourceSelector
- [ ] Fallback initials work when avatars fail to load
- [ ] Error handling logs failures to console
- [ ] CSS styling is consistent across themes
- [ ] Avatar URLs are accessible via direct HTTP requests

### Automated Testing
```javascript
// Test organization data extraction
describe('Organization Avatar System', () => {
  test('extracts avatar URLs from API response', async () => {
    const resources = await searchResourcesAcrossOrgs('en', 'Bible');
    expect(resources.unfoldingWord[0].organizationData.avatar_url).toBeTruthy();
  });
  
  test('generates fallback initials', () => {
    const avatar = getOrganizationAvatar({ name: 'unfoldingWord' });
    expect(avatar.value).toBe('UW');
  });
});
```

## Maintenance Guidelines

### When Adding New Organizations
1. Verify organization has `avatar_url` in API response
2. Test avatar URL accessibility
3. Ensure fallback initials generate correctly
4. Update visual helpers if special handling needed

### When API Changes
1. Update organization data extraction in `catalogService.js`
2. Verify avatar URL format remains consistent
3. Test with multiple organizations
4. Update documentation with new API structure

### When Styling Changes
1. Maintain consistent sizing (20x20px for logos)
2. Ensure proper contrast in both light/dark themes
3. Test fallback initials visibility
4. Verify border and border-radius consistency

## Related Documentation
- `docs/visual-helpers-system.md` - Visual elements utility functions
- `docs/api-integration-patterns.md` - DCS API integration guidelines
- `docs/theme-system.md` - CSS variables and theming
- `docs/component-architecture.md` - React component patterns

## Version History
- **v2.12.1**: Initial implementation with error handling and fallbacks
- **v2.12.0**: Visual enhancements system introduction
- **Future**: Planned caching system for avatar images 