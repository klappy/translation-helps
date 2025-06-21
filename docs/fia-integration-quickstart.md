# FIA Integration Quick Start Guide (DCS-Based)

## 🚀 Overview

FIA (Familiarization, Internalization, Application) resources are available on DCS as Scripture Burrito format. This guide shows how to integrate them using existing TSV patterns.

## 📦 Resources Available

- **FIA Images**: `https://git.door43.org/BurritoTruck/en_fiaimages`
- **FIA Maps**: `https://git.door43.org/BurritoTruck/en_fiamaps`

## 🛠️ Implementation Steps

### Step 1: Add to ResourcesContext (30 min)

In `src/context/ResourcesContext.jsx`, update `loadResourceForType`:

```javascript
// Add new cases
case 'fiaimages':
  return await getVerseFiaImages(bookId, chapter, verse, language);
case 'fiamaps':
  return await getVerseFiaMaps(bookId, chapter, verse, language);
```

Add to initial state:
```javascript
resources: {
  // ... existing
  fiaimages: null,
  fiamaps: null
}
```

### Step 2: Create FIA Service (1 hour)

Create `src/services/fiaService.js`:

```javascript
import { parseTsv } from '../utils/parseTsv';

const DCS_BASE_URL = 'https://git.door43.org';

export async function getVerseFiaImages(bookId, chapter, verse, language = 'en') {
  try {
    const url = `${DCS_BASE_URL}/BurritoTruck/${language}_fiaimages/raw/branch/master/ingredients/${bookId}.tsv`;
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const tsvText = await response.text();
    const rows = parseTsv(tsvText);
    
    const verseRef = `${chapter}:${verse}`;
    return rows.filter(row => row.REF === verseRef);
  } catch (error) {
    console.warn('FIA images not available:', error);
    return null;
  }
}

// Similar function for getVerseFiaMaps
```

### Step 3: Create FIA Panel (2 hours)

Create `src/components/FiaPanel.jsx`:

```javascript
import React, { useEffect } from 'react';
import { useResourcesContext } from '../context/ResourcesContext';
import styles from './FiaPanel.module.css';

export function FiaPanel() {
  const { resources, activateResource } = useResourcesContext();
  
  useEffect(() => {
    activateResource('fiaimages');
    activateResource('fiamaps');
  }, [activateResource]);

  // Display logic here
}
```

### Step 4: Add to Navigation (30 min)

In `src/components/HelpsTabs.jsx`, add FIA tab:

```javascript
const tabs = [
  // ... existing tabs
  ...(resources.fiaimages || resources.fiamaps ? [{
    id: 'fia',
    label: 'FIA',
    icon: '🖼️',
    component: FiaPanel
  }] : [])
];
```

## 📝 TSV Data Format

FIA TSV files contain:
```
REF     ID      TAGS    SUPPORT QUOTE   OCCURENCES      HREF
14:1    ea9004e                                 ./payload/t/tar-pit-wide
```

- **REF**: Bible reference (chapter:verse)
- **ID**: Unique identifier
- **HREF**: Path to media resource

## 🖼️ Media Display (Enhancement)

To display actual images/maps:

```javascript
// Convert HREF to actual URL
export function resolveFiaMediaUrl(href) {
  // Remove ./payload/ prefix
  const mediaPath = href.replace('./payload/', '');
  
  // Return CDN URL (coordinate with FIA team for actual CDN)
  return `https://fia-media-cdn.example.com/${mediaPath}.jpg`;
}

// Image component with fallback
export function FiaImage({ fiaRow }) {
  const [error, setError] = useState(false);
  const url = resolveFiaMediaUrl(fiaRow.HREF);
  
  if (error) {
    return <div>Image unavailable</div>;
  }
  
  return (
    <img 
      src={url}
      alt={`FIA content for ${fiaRow.REF}`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
```

## �� Testing

```javascript
// Test service
describe('FIA Service', () => {
  it('fetches and parses TSV data', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('REF\tID\tHREF\n1:1\tabc\t./payload/test')
      })
    );
    
    const result = await getVerseFiaImages('GEN', 1, 1);
    expect(result).toHaveLength(1);
    expect(result[0].REF).toBe('1:1');
  });
});
```

## ✅ Checklist

- [ ] ResourcesContext updated with FIA cases
- [ ] FIA service created following TSV patterns
- [ ] FIA panel component self-activates
- [ ] Tab appears in navigation
- [ ] TSV data displays correctly
- [ ] Error handling implemented
- [ ] Tests written and passing

## 🎯 Next Steps

1. **Coordinate with FIA team** for actual media CDN URLs
2. **Add image display** once URLs are confirmed
3. **Enhance UI** based on user feedback
4. **Add caching** if performance needs improvement

## 💡 Tips

- Follow existing TN/TQ patterns exactly
- Use `parseTsv` utility - don't reinvent
- Keep it simple - text first, media later
- Test with verses that have FIA content
- Check browser console for fetch errors

## 📚 Resources

- [DCS API Documentation](https://git.door43.org/api/swagger)
- [Scripture Burrito Spec](https://docs.burrito.bible/)
- [App Architecture Guide](./ARCHITECTURE.md)
- [Similar TSV Services](../src/services/tnService.js)
