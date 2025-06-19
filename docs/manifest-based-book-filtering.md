# Manifest-Based Book Filtering Enhancement

## Overview

The BookSelector component has been enhanced to use resource manifest data to show only books that are actually available in the selected resource repository, rather than showing all possible books only to have users discover some don't exist.

## Implementation Details

### Key Changes

1. **Manifest Integration**: The BookSelector now consumes manifest data from the `ManifestsContext` to determine which books are available for the current resource.

2. **Smart Key Resolution**: The component tries multiple manifest key formats to find the correct manifest:
   - Simple resource ID (e.g., `ult`)
   - Organization/resource format (e.g., `unfoldingWord/ult`)
   - Language-prefixed resource ID handling

3. **Enhanced UI Indicators**:
   - Shows available book count in header: `Select Book (X available)`
   - Displays chapter counts from manifest: `Genesis (50 chapters)`
   - Loading state while manifests are being fetched

4. **Graceful Fallback**: If no manifest is available or manifest extraction fails, the component falls back to showing all standard books.

### Technical Implementation

#### Core Function: `extractAvailableBooks()`
- Located in `src/services/manifestService.js`
- Parses manifest YAML to extract book information
- Returns array of books with metadata (ID, title, chapters, sort order)

#### Error Handling
- Try/catch blocks around manifest extraction
- Console warnings for debugging
- Graceful degradation to full book list

#### Chapter Count Integration
- Uses `getBookChapterCount()` from manifest service
- Falls back to static chapter counts if manifest data unavailable
- Displayed in expandable chapter grids

### User Experience Benefits

1. **Reduced Frustration**: Users only see books that actually exist in the repository
2. **Better Information**: Shows actual chapter counts from the resource
3. **Performance**: Avoids failed requests for non-existent books
4. **Transparency**: Clear indication of how many books are available

### Testing

Comprehensive test suite covers:
- Loading states during manifest fetch
- Book filtering based on manifest data
- Fallback behavior when no manifest available
- Multiple manifest key format resolution
- Chapter expansion and selection
- Search functionality with filtered books

### Console Logging

For debugging, the component logs:
- `📋 Found manifest for {resource} using key: {key}` - Successful manifest resolution
- `📋 No manifest found for {resource}, tried keys: [{keys}]` - Failed manifest resolution
- `📚 Found {count} books in manifest for {resource}` - Successful book extraction
- `📚 No manifest data for {resource}, showing all books` - Fallback behavior

## Usage

The feature is automatically enabled when:
1. Advanced mode is active (where integrated scripture panel navigation is available)
2. A resource is selected in the scripture panel
3. User navigates to book selection

No additional configuration is required - the component automatically detects and uses available manifest data.

## Future Enhancements

Potential improvements could include:
- Caching manifest data for better performance
- Showing book descriptions from manifest
- Indicating partial vs. complete books
- Supporting custom book ordering from manifest 