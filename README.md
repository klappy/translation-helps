# ETEN Innovation Lab Translation Helps

## Version 3.10.0 (2025-01-30)


## 🚧 ACTIVE DEVELOPMENT TRACKING 🚧

### 🎯 Current Sprint: Documentation Showcase Site
**Status**: 🎉 SHOWCASE COMPLETE! (100% Complete)  
**Started**: 2025-01-08  
**Completed**: 2025-01-30 (3 weeks ahead of schedule!)  
**Tracking**: [Full Implementation Plan](docs/showcase-implementation-plan.md)

#### This Week's Focus
- [x] **DONE**: Set up showcase routing infrastructure
- [x] **DONE**: Create ShowcaseLayout component  
- [x] **DONE**: Implement documentation loading service
- [x] **DONE**: Basic navigation structure
- [x] **DONE**: Content display system with markdown rendering
- [x] **DONE**: Responsive design and mobile support
- [x] **DONE**: Fixed subsection routing (architecture/* pages working)
- [x] **DONE**: Component galleries with rich technical content
- [x] **DONE**: Performance victories showcase  
- [x] **DONE**: Architecture deep-dives
- [x] **DONE**: Innovation section - FIA Resources, LLM Chat, RC Links
- [x] **DONE**: Comprehensive metrics dashboard with achievements
- [x] **COMPLETE**: 🎉 Showcase finished 3 weeks ahead of schedule!

#### Progress Bar
```
Overall: ██████████ 100% 🎉 COMPLETE!
Phase 1: ██████████ 100% (Foundation) ✅
Phase 2: ██████████ 100% (Galleries) ✅
Innovation: ██████████ 100% (FIA, LLM, RC Links) ✅
Metrics: ██████████ 100% (Dashboard) ✅
```

### ⚠️ Don't Forget These!
- **FIA Implementation**: ⚠️ ONLY 20% COMPLETE! (Images/Maps done, but missing 80% of features)
- **Showcase Documentation**: 🔄 IN PROGRESS (don't let this slip!)
- **Next Priority**: Complete FIA GraphQL API integration (6-step process, audio/video, terms) - 128+ hours of work needed!

### 📊 Quick Links
- [Showcase Plan](docs/showcase-implementation-plan.md)
- [Progress Tracking Guide](docs/showcase-progress-tracking-guide.md)
- [Today's Tasks](#this-weeks-focus)
- [**🚨 CRITICAL: Full FIA Master Plan**](docs/fia-integration-master-plan.md) - 80% still not implemented!

### 🚨 **CRITICAL FIA REALITY CHECK**
**What We Have**: Basic TSV-based images/maps (20% of FIA)  
**What We're Missing**: Complete GraphQL multimedia system (80% of FIA)  
- 6-step internalization process
- Audio/video renderings (14 languages)
- Biblical terms & definitions
- Authentication system
- Pericope data integration

**Estimate for Complete FIA**: 128+ hours (3-4 months of development)

---


- Reference and resources context now always sync with the URL, ensuring correct context/resources on navigation and fresh load.
- LLM chat context always receives the exact raw USFM for the current chapter, matching what is rendered in the scripture pane.
- LLM prompt now includes explicit instructions for extracting verse text from USFM.
- Chat interface auto-starts a new conversation with updated resources when the reference changes, removing the blocking "Reference Changed" dialog.
- Fixed bugs where the app was stuck on Titus 1:1 or an uninitialized context after navigation or refresh.
- Improved reliability of context/resource synchronization across navigation and chat.

[https://etenlab.org]

## Purpose

All resources are currently integrated into the unfoldingWord Scripture drafting tool, translationStudio to aid in the translation process. Resources are also being integrated into the unfoldingWord Scripture checking tool, translationCore to aid in the checking process.

Outside of using tS, tC or downloading PDF files of the resources, there is a need to consume these resources in a similar Just in Time method that displays relevant information in an efficient manner.

### Use cases

- Drafting using tools other than tS including Autographa and even basic pen and paper.
- Community checking printed copies of translations where tC is not practical.
- Bible study and reference when drafting and checking are not taking place.

## Resource Integration

Resources are categorized by two categories. This is not an exclusive list of unfoldingWord resources.

### Scope

Most of these resources are in progress. The New Testament resources in English are complete enough to use.

### Scripture

- ULT - unfoldingWord Literal Text
- UST - unfoldingWord Simplified Text
- UGNT - unfoldingWord Greek New Testament

### translationHelps

- tN - translationNotes
- tA - translationAcademy
- tQ - translationQuestions
- tW - translationWords
- TWL - translationWords Links

## Development Environment

This project requires **Node.js 12.x–16.x**. To manage multiple Node versions easily, use [nvm](https://github.com/nvm-sh/nvm). A `.nvmrc` file is included to automatically select the correct version:

```bash
# Install and switch to the version specified in .nvmrc
nvm install
nvm use
```

After switching Node.js versions, reinstall dependencies. If you previously installed modules under a different Node version, remove your `node_modules` directory and run:

```bash
rm -rf node_modules
npm install
```

If you prefer not to use nvm and are running Node 17 or above, you can fall back to the legacy OpenSSL provider:

```bash
export NODE_OPTIONS=--openssl-legacy-provider
```

### Running the development server

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

   Or with yarn:

   ```bash
   yarn dev
   ```

### Debugging Dev Server Blank Screen

If the development server launches a blank page, check the following:

- Ensure `index.html` at project root contains a `<div id="root">`.
- Verify `src-new/main.jsx` mounts the `<App />` component using `ReactDOM.createRoot`.
- Wrap `<App />` with `BrowserRouter` and configure a `<Route path="/" element={<MainView />} />` in `App.jsx`.
- Open the browser console to inspect any import or runtime errors.
- Add an `ErrorBoundary` to catch render-time exceptions in the UI.

### Clearing Vite Optimization Cache

If you encounter 504 Gateway Timeout errors when loading optimized dependencies (e.g., `yaml.js`), clear the Vite dependency cache:

```bash
rm -rf node_modules/.vite
yarn dev
```

To avoid internal module resolution errors in the `yaml` package when building with Vite, add the following alias to your `vite.config.ts`:

```ts
resolve: {
  alias: {
    'yaml': 'yaml/browser'
  }
}
```

## Technical Overview

All resources are managed in Git repositories on (DCS)[https://git.door43.org]. Each repository is organized in a Resource Container Spec (RC). Each RC contains resource projects with metadata accessible through the DCS catalog API. The catalog API provides resource metadata including book lists and file paths through the `ingredients` array. By using the catalog API project file it can then be parsed by file type. Each resource project's data can then be integrated based on the relevant alignments and tags that link the resources together.

### Relationships

The relationships between the resources can be used to display relevant information where appropriate.

- ULT - (primary text organized by reference)
  - tN (tagged to UGNT and ULT by reference and quote)
    - tA (links in tN)
  - UGNT (aligned in ULT)
    - tW (tagged in UGNT)
  - tQ (tagged by reference)
  - UST - (secondary text organized by reference)

---

## CSS-First UI/UX Policy

This project prefers CSS-based solutions for UI/UX behaviors (such as show/hide, expand/collapse, hover effects, etc.) over JavaScript/React state, unless there is a clear technical reason to use JS. See [docs/css-collapsible-notes-pattern.md](docs/css-collapsible-notes-pattern.md) for the recommended pattern for collapsible notes and similar features.
