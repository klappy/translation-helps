# FIA Integration Master Plan (DCS-BASED)

## 🎯 Project Overview - DCS-BASED APPROACH

**Goal**: Integrate FIA Project's multimedia Bible resources from DCS into Translation Helps application
**Timeline**: 1 week (using existing DCS patterns)
**Impact**: Add multimedia Bible study features while maintaining app simplicity
**Philosophy**: Simple > Complex, Reuse > Rebuild, Proven Patterns > New Complexity

### Key Discovery
FIA resources are already available on DCS as Scripture Burrito format:
- **Images**: https://git.door43.org/BurritoTruck/en_fiaimages
- **Maps**: https://git.door43.org/BurritoTruck/en_fiamaps
- **Format**: TSV files (same as TN/TQ/TW)
- **Access**: Standard DCS API (no authentication needed)

## 📋 Epic Breakdown - ULTRA-SIMPLIFIED

### Epic 1: Core FIA Integration (Days 1-3)
**Goal**: Get FIA content displaying using existing TSV patterns
**Dependencies**: None
**Deliverables**: Working FIA service, self-activating panel, TSV parsing

### Epic 2: Media Enhancement (Days 4-5)
**Goal**: Display media referenced in TSV files
**Dependencies**: Epic 1 complete
**Deliverables**: Image display with fallbacks, lazy loading

### Epic 3: Polish & Testing (Days 6-7)
**Goal**: Production readiness
**Dependencies**: Epic 2 complete
**Deliverables**: Error boundaries, tests, documentation

---

## 📊 Epic 1: Core FIA Integration (Days 1-3)

### Issue 1.1: Add FIA Resources to ResourcesContext
**Priority**: Critical
**Estimate**: 4 hours
**Labels**: `feature`, `context`, `semver:minor`, `changelog:added`

#### Acceptance Criteria
- [ ] Add 'fiaimages' and 'fiamaps' cases to `loadResourceForType`
- [ ] Update ResourcesContext state structure for FIA
- [ ] Follow existing TSV resource patterns exactly
- [ ] No breaking changes to existing code

#### Technical Requirements
```javascript
// In loadResourceForType (following TN/TQ pattern)
case 'fiaimages':
  return await getVerseFiaImages(bookId, chapter, verse, language);
case 'fiamaps':
  return await getVerseFiaMaps(bookId, chapter, verse, language);

// ResourcesContext state addition
resources: {
  // ... existing resources
  fiaimages: null,  // Array of TSV rows or null
  fiamaps: null     // Array of TSV rows or null
}
```

#### Definition of Done
- [ ] FIA resources activate like TN/TQ
- [ ] No regression in existing functionality
- [ ] Integration tests passing

---

### Issue 1.2: Create DCS-Based FIA Service
**Priority**: Critical
**Estimate**: 4 hours
**Labels**: `feature`, `service`, `semver:minor`, `changelog:added`

#### Acceptance Criteria
- [ ] Create `src/services/fiaService.js` following tnService.js pattern
- [ ] Fetch TSV files from DCS repositories
- [ ] Parse TSV data using existing parseTsv utility
- [ ] Return verse-specific rows
- [ ] Graceful error handling with null returns

#### Technical Requirements
```javascript
// fiaService.js - Following existing TSV patterns
import { parseTsv } from '../utils/parseTsv';

const DCS_BASE_URL = 'https://git.door43.org';

export async function getVerseFiaImages(bookId, chapter, verse, language = 'en') {
  try {
    // Build URL following DCS patterns
    const url = `${DCS_BASE_URL}/BurritoTruck/${language}_fiaimages/raw/branch/master/ingredients/${bookId}.tsv`;
    
    // Fetch TSV data
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const tsvText = await response.text();
    const rows = parseTsv(tsvText);
    
    // Filter for specific verse
    const verseRef = `${chapter}:${verse}`;
    return rows.filter(row => row.REF === verseRef);
    
  } catch (error) {
    console.warn('FIA images not available:', error);
    return null; // Graceful degradation
  }
}

export async function getVerseFiaMaps(bookId, chapter, verse, language = 'en') {
  // Same pattern for maps
  try {
    const url = `${DCS_BASE_URL}/BurritoTruck/${language}_fiamaps/raw/branch/master/ingredients/${bookId}.tsv`;
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const tsvText = await response.text();
    const rows = parseTsv(tsvText);
    
    const verseRef = `${chapter}:${verse}`;
    return rows.filter(row => row.REF === verseRef);
    
  } catch (error) {
    console.warn('FIA maps not available:', error);
    return null;
  }
}
```

#### Definition of Done
- [ ] Service fetches TSV data correctly
- [ ] Follows existing service patterns
- [ ] Unit tests with mocked responses
- [ ] No external dependencies added

---

### Issue 1.3: Basic FIA Panel Component
**Priority**: Critical
**Estimate**: 8 hours
**Labels**: `feature`, `ui`, `component`, `semver:minor`, `changelog:added`

#### Acceptance Criteria
- [ ] Create `src/components/FiaPanel.jsx` following panel patterns
- [ ] Self-activating for both fiaimages and fiamaps
- [ ] Display TSV data in readable format
- [ ] Show appropriate loading and empty states
- [ ] Follow existing CSS module patterns

#### Technical Requirements
```javascript
// FiaPanel.jsx - Following existing panel patterns
import React, { useEffect } from 'react';
import { useResourcesContext } from '../context/ResourcesContext';
import styles from './FiaPanel.module.css';

export function FiaPanel() {
  const { resources, activateResource } = useResourcesContext();
  
  // Self-activate both FIA resources
  useEffect(() => {
    activateResource('fiaimages');
    activateResource('fiamaps');
  }, [activateResource]);

  const hasImages = resources.fiaimages && resources.fiaimages.length > 0;
  const hasMaps = resources.fiamaps && resources.fiamaps.length > 0;

  if (!hasImages && !hasMaps) {
    return (
      <div className={styles.fiaPanel}>
        <p>No FIA content available for this verse</p>
      </div>
    );
  }

  return (
    <div className={styles.fiaPanel}>
      {hasImages && (
        <div className={styles.section}>
          <h3>FIA Images</h3>
          {resources.fiaimages.map((row, index) => (
            <div key={index} className={styles.fiaItem}>
              <span className={styles.reference}>{row.REF}</span>
              <span className={styles.href}>{row.HREF}</span>
            </div>
          ))}
        </div>
      )}
      
      {hasMaps && (
        <div className={styles.section}>
          <h3>FIA Maps</h3>
          {resources.fiamaps.map((row, index) => (
            <div key={index} className={styles.fiaItem}>
              <span className={styles.reference}>{row.REF}</span>
              <span className={styles.href}>{row.HREF}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Definition of Done
- [ ] Panel renders TSV data correctly
- [ ] Self-activation works
- [ ] Follows component patterns
- [ ] Component tests passing

---

### Issue 1.4: Add FIA Tab to Navigation
**Priority**: Medium
**Estimate**: 2 hours
**Labels**: `feature`, `ui`, `semver:minor`, `changelog:added`

#### Acceptance Criteria
- [ ] Add FIA tab to `src/components/HelpsTabs.jsx`
- [ ] Tab appears when FIA resources available
- [ ] Use appropriate icon (image/photo icon)
- [ ] Maintain existing tab functionality

#### Technical Requirements
```javascript
// In HelpsTabs.jsx
const tabs = [
  // ... existing tabs
  ...(resources.fiaimages || resources.fiamaps ? [{
    id: 'fia',
    label: 'FIA',
    icon: '🖼️', // or use proper icon component
    component: FiaPanel
  }] : [])
];
```

#### Definition of Done
- [ ] Tab appears conditionally
- [ ] No regression in existing tabs
- [ ] Visual consistency maintained

---

## 📊 Epic 2: Media Enhancement (Days 4-5)

### Issue 2.1: Media URL Resolution
**Priority**: High
**Estimate**: 4 hours
**Labels**: `feature`, `media`, `semver:minor`, `changelog:added`

#### Acceptance Criteria
- [ ] Convert TSV HREF paths to actual media URLs
- [ ] Support multiple CDN/hosting patterns
- [ ] Graceful fallbacks for missing media
- [ ] No external API dependencies

#### Technical Requirements
```javascript
// In fiaService.js or new mediaUrlResolver.js
export function resolveFiaMediaUrl(href, type = 'image') {
  // TSV contains: ./payload/t/tar-pit-wide
  // Need to resolve to actual CDN URL
  
  // Start with simple direct mapping
  const FIA_MEDIA_BASE = 'https://fia-media.example.com'; // TBD: Actual CDN
  
  // Remove ./payload/ prefix
  const mediaPath = href.replace('./payload/', '');
  
  // Build full URL
  return `${FIA_MEDIA_BASE}/${type}s/${mediaPath}.jpg`; // Adjust extension as needed
}
```

#### Definition of Done
- [ ] URLs resolve correctly
- [ ] Fallback strategy implemented
- [ ] Unit tests for URL patterns

---

### Issue 2.2: Image Display Component
**Priority**: High
**Estimate**: 4 hours
**Labels**: `feature`, `ui`, `media`, `semver:minor`, `changelog:added`

#### Acceptance Criteria
- [ ] Create reusable image display component
- [ ] Lazy loading for performance
- [ ] Error states with fallbacks
- [ ] Responsive sizing
- [ ] Alt text from TSV data

#### Technical Requirements
```javascript
// FiaImageDisplay.jsx
export function FiaImageDisplay({ fiaRow }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = resolveFiaMediaUrl(fiaRow.HREF);
  
  if (imgError) {
    return <div className={styles.imagePlaceholder}>Image unavailable</div>;
  }
  
  return (
    <img
      src={imageUrl}
      alt={`FIA content for ${fiaRow.REF}`}
      loading="lazy"
      onError={() => setImgError(true)}
      className={styles.fiaImage}
    />
  );
}
```

#### Definition of Done
- [ ] Images display correctly
- [ ] Graceful error handling
- [ ] Performance optimized
- [ ] Accessibility compliant

---

## 📊 Epic 3: Polish & Testing (Days 6-7)

### Issue 3.1: Comprehensive Error Handling
**Priority**: High
**Estimate**: 3 hours
**Labels**: `quality`, `error-handling`, `semver:patch`

#### Acceptance Criteria
- [ ] Add error boundaries around FIA components
- [ ] Handle network failures gracefully
- [ ] Provide user-friendly error messages
- [ ] Log errors for debugging

#### Technical Requirements
- Wrap FiaPanel in error boundary
- Add try-catch blocks in all async operations
- Implement retry logic for failed requests
- Clear error messaging

#### Definition of Done
- [ ] No uncaught errors
- [ ] User experience remains smooth
- [ ] Errors logged appropriately

---

### Issue 3.2: Unit and Integration Tests
**Priority**: High
**Estimate**: 4 hours
**Labels**: `test`, `quality`, `semver:patch`

#### Acceptance Criteria
- [ ] Unit tests for fiaService.js
- [ ] Component tests for FiaPanel
- [ ] Integration tests with ResourcesContext
- [ ] Mock DCS responses appropriately

#### Technical Requirements
```javascript
// fiaService.test.js
describe('FIA Service', () => {
  it('fetches and parses FIA images TSV', async () => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('REF\tID\tHREF\n1:1\tabc\t./payload/test')
      })
    );
    
    const result = await getVerseFiaImages('GEN', 1, 1);
    expect(result).toHaveLength(1);
    expect(result[0].HREF).toBe('./payload/test');
  });
});
```

#### Definition of Done
- [ ] All tests passing
- [ ] Good test coverage
- [ ] CI/CD integration

---

### Issue 3.3: Documentation and Examples
**Priority**: Medium
**Estimate**: 2 hours
**Labels**: `documentation`, `semver:patch`

#### Acceptance Criteria
- [ ] Update README with FIA feature
- [ ] Add inline code documentation
- [ ] Create usage examples
- [ ] Document media URL patterns

#### Definition of Done
- [ ] Documentation complete
- [ ] Examples working
- [ ] Code well-commented

---

## 🎯 Success Metrics

### Simplicity Achieved
- **Total LOC**: <200 lines (vs 1000+ in original plan)
- **New Dependencies**: 0 (vs 5+ in original plan)
- **New Patterns**: 0 (reuses existing TSV pattern)
- **Time to Ship**: 1 week (vs 8 weeks originally)

### Risk Mitigation
- **No Authentication**: Public DCS resources
- **No API Limits**: Static TSV files
- **No Complex State**: Simple resource activation
- **Proven Patterns**: Exactly like TN/TQ/TW

### Maintainability
- **Onboarding Time**: <30 minutes (uses familiar patterns)
- **Debugging**: Standard DCS/TSV issues only
- **Enhancement Path**: Clear and incremental

---

## 🚀 Implementation Notes

### Day 1-3 Focus
1. Get TSV data loading and displaying
2. Follow TN/TQ patterns exactly
3. Basic panel with text display only

### Day 4-5 Enhancement
1. Resolve media URLs (coordinate with FIA team if needed)
2. Add image display with fallbacks
3. Optimize performance

### Day 6-7 Polish
1. Comprehensive testing
2. Error handling
3. Documentation

### Future Enhancements (Post-MVP)
- Add caching for TSV files
- Support for audio/video if available in TSV
- Enhanced media gallery view
- Offline support

---

## ✅ Why This Approach Wins

1. **Leverages Existing Infrastructure**: TSV parsing, DCS fetching, panel patterns all exist
2. **Zero New Dependencies**: No GraphQL, no auth libraries, no media APIs
3. **Proven Patterns**: Developers already know how TN/TQ work
4. **Fast Delivery**: 1 week vs 8 weeks
5. **Low Risk**: Using battle-tested code paths
6. **Easy Maintenance**: Just another TSV resource

The DCS-based approach transforms FIA integration from a complex multi-month project into a straightforward one-week enhancement that fits perfectly into the app's existing architecture.

---

## 📋 Appendix: Complete FIA Process

### What's Available on DCS
- ✅ **FIA Images** - Visual aids for passages
- ✅ **FIA Maps** - Geographical context

### What's NOT on DCS (Yet)
- ❌ **Audio Narrations** - Step 1 listening component
- ❌ **Background Info** - Step 2 understanding materials  
- ❌ **Discussion Guides** - Step 3 group interaction
- ❌ **Activity Instructions** - Steps 4-6 (dramatize, story, apply)

### Progressive Enhancement Strategy
1. **Week 1**: Ship with maps and images (immediate value)
2. **Future**: Add components as they become available
3. **UI Design**: Build framework to accommodate all 6 steps
4. **No Blocking**: Don't wait for complete resources

This approach aligns with the app's philosophy:
- Ship early with partial value
- Enhance progressively
- No complex dependencies
- Graceful degradation

Even with just maps and images, users get valuable visual context for Bible study. The complete FIA experience can be added incrementally without breaking changes.
