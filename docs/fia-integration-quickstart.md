# FIA Integration Quick Start Guide

## 🚀 Quick Overview

The FIA Project provides multimedia Bible resources through a GraphQL API:
- **6-step internalization process** for every Bible passage
- **Audio/video content** in 14 languages (including ASL)
- **Media assets** (photos, illustrations, maps)
- **Biblical terms** with definitions

## 🔧 Implementation Checklist

### Step 1: Add FIA Service
```javascript
// src/services/fiaService.js
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.fiaproject.org/graphql',
  cache: new InMemoryCache()
});

export const fiaService = {
  async getPericope(book, chapter, verse) {
    const { data } = await client.query({
      query: GET_PERICOPE,
      variables: { book, chapter, verse }
    });
    return data.pericopes.edges[0]?.node;
  }
};
```

### Step 2: Update ResourcesContext
```javascript
// In src/context/ResourcesContext.jsx
import { fiaService } from '../services/fiaService';

// Add to activateResource function
if (type === 'fia') {
  const fiaData = await fiaService.getPericope(book, chapter, verse);
  setResources(prev => ({ ...prev, fia: fiaData }));
}
```

### Step 3: Create FIA Panel
```javascript
// src/components/FiaPanel.jsx
export function FiaPanel() {
  const { resources, activateResource } = useResourcesContext();
  
  useEffect(() => {
    activateResource('fia');
  }, []);

  return <div>{/* Render FIA content */}</div>;
}
```

### Step 4: Add to Tabs
```javascript
// In src/components/HelpsTabs.jsx
tabs.push({
  id: 'fia',
  label: 'FIA Steps',
  component: FiaPanel
});
```

## 📊 Key GraphQL Queries

### Get Pericope
```graphql
query GetPericope($book: String!, $chapter: Int!, $verse: Int!) {
  pericopes(filter: {
    book: { code: { eq: $book } }
    startChapter: { lte: $chapter }
    endChapter: { gte: $chapter }
  }) {
    edges {
      node {
        id
        pericopeTranslations {
          edges {
            node {
              title
              description
            }
          }
        }
      }
    }
  }
}
```

### Get Step Renderings
```graphql
query GetSteps($pericopeId: ID!) {
  stepRenderings(filter: {
    step: { pericope: { id: { eq: $pericopeId } } }
  }) {
    edges {
      node {
        step { number }
        audioUrl
        videoUrl
      }
    }
  }
}
```

## 🎨 UI Components Needed

1. **StepNavigator** - Navigate through 6 steps
2. **MediaPlayer** - Audio/video playback
3. **AssetGallery** - Display images/illustrations
4. **TermsGlossary** - Show biblical terms

## 🔗 Media Access

### Google Drive Structure
```
https://drive.google.com/drive/folders/[LANGUAGE_FOLDER_ID]/
├── xsmall/  (thumbnails)
├── small/   (mobile)
├── medium/  (standard)
└── large/   (high quality)
```

### YouTube Videos
- Channel: https://www.youtube.com/@VideoBibleDictionary
- Use YouTube Data API v3
- Search by biblical terms

## ⚡ Performance Tips

1. **Cache Aggressively**
   ```javascript
   const cache = new InMemoryCache({
     typePolicies: {
       Pericope: {
         keyFields: ["id"],
         merge: true
       }
     }
   });
   ```

2. **Lazy Load Media**
   ```javascript
   const LazyImage = ({ src, alt }) => (
     <img loading="lazy" src={src} alt={alt} />
   );
   ```

3. **Progressive Enhancement**
   - Load text first
   - Add media as available
   - Provide fallbacks

## 🧪 Testing

### Basic Test
```javascript
test('FIA panel loads pericope', async () => {
  render(<FiaPanel />);
  await waitFor(() => {
    expect(screen.getByText(/Step 1/)).toBeInTheDocument();
  });
});
```

### E2E Test
```javascript
test('Navigate FIA steps', async ({ page }) => {
  await page.goto('/?book=GEN&chapter=1&verse=1');
  await page.click('[data-testid="fia-tab"]');
  await page.click('[data-testid="next-step"]');
  await expect(page.locator('.step-indicator')).toContainText('2');
});
```

## 🚨 Common Issues

1. **CORS Errors**
   - Use proxy in development
   - Ensure proper headers in production

2. **Large Media Files**
   - Implement quality selection
   - Use appropriate CDN endpoints

3. **Authentication**
   - Store tokens securely
   - Implement token refresh

## 📚 Resources

- [FIA API Docs](https://api.fiaproject.org/docs)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [Full Integration Guide](./fia-project-api-integration-guide.md)
- [Comparison Document](./multi-resource-api-comparison.md)

## 🎯 MVP Goals

**Week 1-2:**
- [ ] Basic FIA service implementation
- [ ] Simple pericope display
- [ ] Step navigation UI

**Week 3-4:**
- [ ] Media gallery
- [ ] Audio player
- [ ] Caching layer

**Future:**
- [ ] Offline support
- [ ] Video player
- [ ] YouTube integration
