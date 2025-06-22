# 🧪 FIA Testing Guide

## Issue Diagnosis
The FIA service works perfectly (tested with Genesis 14:1 returning 4 images + 1 map), but the UI shows "No FIA content available for this verse".

## Root Cause
The development server needs to restart to pick up the new FIA components.

## 🚀 How to Test FIA Integration

### Step 1: Restart Development Server
```bash
# Stop current server
pkill -f "netlify dev"

# Wait a moment
sleep 2

# Restart server
npm run dev
```

### Step 2: Navigate to Genesis 14:1
1. Open browser to: http://localhost:8888 (or whatever port netlify shows)
2. Navigate to: **Genesis 14:1**
3. Look for: **"FIA Resources"** tab in the helps section

### Step 3: Expected Results
You should see:
- ✅ FIA Resources tab appears
- ✅ Content shows: "📸 Images (4)" and "🗺️ Maps (1)"
- ✅ 4 image placeholders with fallback text
- ✅ 1 map placeholder with fallback text

### Step 4: Debug if Still Not Working

#### Check Browser Console
1. Open browser dev tools (F12)
2. Go to Console tab
3. Look for FIA-related logs:
   ```
   🎯 FIA Images: Fetching GEN 14:1 from https://...
   ✅ FIA Images: Found 4 items for GEN 14:1
   ✅ FIA Maps: Found 1 items for GEN 14:1
   ```

#### Check Network Tab
1. Go to Network tab in dev tools
2. Navigate to Genesis 14:1
3. Look for requests to:
   - `BurritoTruck/en_fiaimages/raw/branch/master/ingredients/GEN.tsv`
   - `BurritoTruck/en_fiamaps/raw/branch/master/ingredients/GEN.tsv`

#### Verify FIA Tab Exists
1. Right-click on the helps tabs area
2. "Inspect Element"
3. Look for: `data-testid="tab-fia"`

## 🎯 Test Verses with FIA Content

### Genesis Chapter 14 (Multiple verses)
- Genesis 14:1 ✅ (4 images, 1 map)
- Genesis 14:2 ✅ (images available)
- Genesis 14:3 ✅ (images available)

### Other Books
Check TSV files for other verses:
```bash
curl -s "https://git.door43.org/BurritoTruck/en_fiaimages/raw/branch/master/ingredients/GEN.tsv" | head -20
```

## 🔧 Troubleshooting

### If FIA Tab Doesn't Appear
1. Check browser console for JavaScript errors
2. Verify server restarted with new code
3. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)

### If Tab Shows "No FIA content available"
1. Check browser console for FIA service logs
2. Verify you're on Genesis 14:1 exactly
3. Check network requests are succeeding

### If Images Show Fallback Text
This is expected! The media URLs are placeholder:
```
https://fia-media-cdn.example.com/images/t/tar-pit-wide.jpg
```

The FIA team needs to provide actual CDN URLs for real images.

## ✅ Success Criteria

Phase 1 is working correctly when you see:
- ✅ FIA Resources tab appears
- ✅ Shows "📸 Images (4)" and "🗺️ Maps (1)"
- ✅ Displays 4 image placeholders with expand/collapse details
- ✅ Shows TSV data (REF, ID, HREF fields)
- ✅ Graceful fallback when media URLs don't resolve

The framework is ready for Phase 2 when actual media URLs are available!
