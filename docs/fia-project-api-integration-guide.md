# FIA Project GraphQL API Integration Guide

## Overview

The FIA Project (Fia) provides a comprehensive GraphQL API for accessing Bible translation resources with a focus on oral learning strategies. This guide documents how to integrate FIA resources into the Translation Helps application.

## Table of Contents

1. [API Architecture](#api-architecture)
2. [Authentication](#authentication)
3. [Core Data Types](#core-data-types)
4. [Available Resources](#available-resources)
5. [Query Examples](#query-examples)
6. [Media Assets](#media-assets)
7. [Integration Strategy](#integration-strategy)
8. [Resource Tab Implementation](#resource-tab-implementation)

## API Architecture

### GraphQL Endpoint
- **URL**: `https://api.fiaproject.org/graphql`
- **Type**: GraphQL API (currently in beta)
- **Documentation**: https://api.fiaproject.org/docs/introduction/about

### Key Features
- 6-step internalization process for every pericope
- Audio/video format content
- Attached media assets (photos, videos, illustrations, diagrams, maps)
- Multi-language support (14 languages including ASL)
- 2,893 pericopes covering the entire Bible

## Authentication

The API uses token-based authentication:

```graphql
# Request access token
mutation RequestAccessToken {
  requestAccessToken(email: "user@example.com", password: "password") {
    token
    expiresAt
  }
}

# Use token in headers
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

## Core Data Types

### 1. Pericope
A narrative unit or passage in Scripture.

```graphql
type Pericope {
  id: ID!
  book: Book!
  startChapter: Int!
  startVerse: Int!
  endChapter: Int!
  endVerse: Int!
  pericopeTranslations: [PericopeTranslation!]!
}
```

### 2. Step
Part of the 6-step internalization process.

```graphql
type Step {
  id: ID!
  number: Int!
  stepTranslations: [StepTranslation!]!
  stepRenderings: [StepRendering!]!
}
```

### 3. MediaAsset
Photos, videos, illustrations attached to content.

```graphql
type MediaAsset {
  id: ID!
  assetType: AssetType!
  mediaAssetTranslations: [MediaAssetTranslation!]!
  mediaAssetAttachment: MediaAssetAttachment
}
```

### 4. Language
Supported languages for content.

```graphql
type Language {
  id: ID!
  code: String!
  name: String!
  direction: String! # ltr or rtl
}
```

## Available Resources

### 1. Pericopes with Steps
Query pericopes by book, chapter, and verse with their 6-step process:

```graphql
query GetPericope($bookId: ID!, $chapter: Int!, $verse: Int!) {
  pericopes(
    filter: {
      book: { id: { eq: $bookId } }
      startChapter: { lte: $chapter }
      endChapter: { gte: $chapter }
      startVerse: { lte: $verse }
      endVerse: { gte: $verse }
    }
  ) {
    edges {
      node {
        id
        pericopeTranslations(filter: { language: { code: { eq: "en" } } }) {
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

### 2. Step Renderings (Audio/Video)
Get audio/video content for each step:

```graphql
query GetStepRenderings($pericopeId: ID!, $languageCode: String!) {
  stepRenderings(
    filter: {
      step: { pericope: { id: { eq: $pericopeId } } }
      language: { code: { eq: $languageCode } }
    }
  ) {
    edges {
      node {
        id
        step {
          number
          stepTranslations {
            edges {
              node {
                name
                description
              }
            }
          }
        }
        audioUrl
        videoUrl
        duration
      }
    }
  }
}
```

### 3. Media Assets
Query related media for a pericope:

```graphql
query GetMediaAssets($pericopeId: ID!) {
  mediaAssets(
    filter: {
      pericopes: { some: { id: { eq: $pericopeId } } }
    }
  ) {
    edges {
      node {
        id
        assetType {
          name
        }
        mediaAssetAttachment {
          url
          thumbnailUrl
          mimeType
        }
        mediaAssetTranslations {
          edges {
            node {
              title
              description
              language {
                code
              }
            }
          }
        }
      }
    }
  }
}
```

### 4. Terms and Definitions
Biblical terms with explanations:

```graphql
query GetTerms($pericopeId: ID!) {
  terms(
    filter: {
      pericopes: { some: { id: { eq: $pericopeId } } }
    }
  ) {
    edges {
      node {
        id
        termTranslations {
          edges {
            node {
              name
              definition
              language {
                code
              }
            }
          }
        }
      }
    }
  }
}
```

## Media Assets from Google Drive

### Structure
- **Base URL**: https://drive.google.com/drive/folders/1-ganNTE3ad4rrk83NFXkr19j8TSLLVB4
- **Languages**: 22 folders (ASL, English, Spanish, etc.)
- **File Sizes**: xsmall, small, medium, large
- **License**: CC BY-SA

### Accessing Media Files
1. Navigate to language folder
2. Select appropriate size (xsmall for thumbnails, large for full quality)
3. Use Google Drive API or direct download links

### Example Structure:
```
/English/
  /large/     # High quality media
  /medium/    # Standard quality
  /small/     # Mobile optimized
  /xsmall/    # Thumbnails
```

## Integration Strategy

### 1. Create FIA Service
```javascript
// src/services/fiaService.js
export class FiaService {
  constructor() {
    this.endpoint = 'https://api.fiaproject.org/graphql';
    this.token = null;
  }

  async authenticate(credentials) {
    // Implement token authentication
  }

  async getPericopeForReference(book, chapter, verse, language = 'en') {
    // Query pericope containing the reference
  }

  async getStepRenderings(pericopeId, language) {
    // Get 6-step audio/video content
  }

  async getMediaAssets(pericopeId) {
    // Get associated media
  }

  async getTerms(pericopeId, language) {
    // Get biblical terms
  }
}
```

### 2. Add to ResourcesContext
```javascript
// In ResourcesContext.jsx
const activateResource = async (type) => {
  if (type === 'fia') {
    const fiaData = await fiaService.getPericopeForReference(
      book, chapter, verse, language
    );
    setResources(prev => ({
      ...prev,
      fia: fiaData
    }));
  }
};
```

### 3. Create FIA Panel Component
```javascript
// src/components/FiaPanel.jsx
export function FiaPanel() {
  const { resources, activateResource } = useResourcesContext();
  
  useEffect(() => {
    activateResource('fia');
  }, []);

  const fiaData = resources.fia;
  
  return (
    <div>
      {/* Render 6-step process */}
      {/* Display media assets */}
      {/* Show terms */}
    </div>
  );
}
```

## Resource Tab Implementation

### 1. Tab Structure
```javascript
// Add to HelpsTabs.jsx
const tabs = [
  // ... existing tabs
  {
    id: 'fia',
    label: 'FIA Steps',
    icon: <AudioIcon />,
    component: FiaPanel
  }
];
```

### 2. Component Features
- **Step Navigation**: Allow users to navigate through 6 steps
- **Audio/Video Player**: Embedded player for step renderings
- **Media Gallery**: Display associated images/videos
- **Terms Glossary**: Show biblical terms with definitions
- **Language Selector**: Switch between available languages

### 3. UI Components Needed
```javascript
// Step Navigator
<StepNavigator 
  currentStep={1}
  totalSteps={6}
  onStepChange={handleStepChange}
/>

// Media Player
<MediaPlayer
  audioUrl={stepRendering.audioUrl}
  videoUrl={stepRendering.videoUrl}
  duration={stepRendering.duration}
/>

// Asset Gallery
<AssetGallery
  assets={mediaAssets}
  onAssetClick={handleAssetClick}
/>

// Terms List
<TermsList
  terms={terms}
  language={selectedLanguage}
/>
```

## Visual Bible Dictionary Integration

The Visual Bible Dictionary YouTube channel provides additional video content:
- **Channel**: https://www.youtube.com/@VideoBibleDictionary
- **Content**: Biblical terms explained through video
- **Integration**: Link to relevant videos based on current passage

### YouTube API Integration
```javascript
async function getRelatedVideos(term) {
  const response = await youtube.search.list({
    part: 'snippet',
    channelId: 'VISUAL_BIBLE_DICTIONARY_CHANNEL_ID',
    q: term,
    type: 'video'
  });
  return response.data.items;
}
```

## Performance Considerations

### 1. Caching Strategy
- Cache pericope data by reference
- Store media URLs with expiration
- Implement progressive loading for steps

### 2. Media Optimization
- Use appropriate media sizes based on device
- Lazy load images and videos
- Implement thumbnail previews

### 3. Offline Support
- Cache audio files for offline playback
- Store step text content locally
- Sync when connection restored

## Error Handling

### 1. API Errors
```javascript
try {
  const data = await fiaService.getPericopeForReference(book, chapter, verse);
} catch (error) {
  if (error.code === 'UNAUTHENTICATED') {
    // Re-authenticate
  } else if (error.code === 'NOT_FOUND') {
    // No pericope for reference
  }
}
```

### 2. Media Loading Errors
- Provide fallback content
- Retry with different quality
- Show error message with retry option

## Testing Strategy

### 1. Unit Tests
```javascript
describe('FiaService', () => {
  it('should fetch pericope for reference', async () => {
    const pericope = await service.getPericopeForReference('GEN', 1, 1);
    expect(pericope).toBeDefined();
    expect(pericope.steps).toHaveLength(6);
  });
});
```

### 2. Integration Tests
- Test API authentication flow
- Verify media asset loading
- Check language switching

### 3. E2E Tests
```javascript
test('FIA tab displays 6-step process', async ({ page }) => {
  await page.goto('/?book=GEN&chapter=1&verse=1');
  await page.click('[data-testid="fia-tab"]');
  await expect(page.locator('.step-navigator')).toBeVisible();
  await expect(page.locator('.step-content')).toContainText('Step 1');
});
```

## Migration Path

### Phase 1: Basic Integration
1. Implement FIA service with authentication
2. Add basic pericope fetching
3. Create simple FIA panel

### Phase 2: Media Support
1. Add media asset fetching
2. Implement media gallery
3. Add audio/video players

### Phase 3: Full Features
1. Complete 6-step navigation
2. Add terms glossary
3. Implement language switching

### Phase 4: Optimization
1. Add caching layer
2. Implement offline support
3. Optimize media loading

## Conclusion

The FIA Project API provides rich multimedia content for Bible study through its 6-step internalization process. Integration into Translation Helps will:

1. **Enhance Learning**: Audio/visual content aids comprehension
2. **Support Oral Learners**: Primary focus on audio/video over text
3. **Provide Context**: Media assets illustrate biblical concepts
4. **Multi-language Access**: 14 languages including sign language

The modular architecture of Translation Helps makes it straightforward to add FIA as a new resource type following the established patterns.
