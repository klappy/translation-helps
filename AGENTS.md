# AGENTS.md

name: ETEN Innovation Lab Translation Helps
description: An application for viewing Bible translation resources from ETEN Innovation Lab and partner organizations including Translation Notes (tN), Translation Questions (tQ), Translation Words (tW), and the new Translation Words Links (TWL) format.

## 🧭 Project Structure

- `src/`: Main React app source
- `docs/`: Developer documentation (architecture, TWL, resource guides, DCS)
- `public/`: Static assets
- `package.json`: Project config and dependencies
- `CHANGELOG.md`: Documentation of all changes following semantic versioning

## 📚 Documentation Structure

### Tier 1: Core Documentation (Essential Reading)
- [`docs/tier1-core/PRINCIPLES.md`](docs/tier1-core/PRINCIPLES.md): **FUNDAMENTAL PRINCIPLES** - Architectural decisions and guidelines
- [`docs/tier1-core/ARCHITECTURE.md`](docs/tier1-core/ARCHITECTURE.md): **SYSTEM ARCHITECTURE** - Official architecture with Simple Verse-Loading Pattern  
- [`docs/tier1-core/DEVELOPMENT-WORKFLOW.md`](docs/tier1-core/DEVELOPMENT-WORKFLOW.md): **GIT WORKFLOW** - Branch strategy and development process
- [`docs/tier1-core/DEPLOYMENT-STRATEGY.md`](docs/tier1-core/DEPLOYMENT-STRATEGY.md): **DEPLOYMENT GUIDE** - Environment strategy and deployment process

### Tier 2: Feature Documentation (Domain-Specific)
- [`docs/tier2-features/api-integration/`](docs/tier2-features/api-integration/): **API INTEGRATION** - DCS API patterns and optimization
- [`docs/tier2-features/ui-components/`](docs/tier2-features/ui-components/): **UI COMPONENTS** - Component architecture and theme system
- [`docs/tier2-features/translation-resources/`](docs/tier2-features/translation-resources/): **TRANSLATION RESOURCES** - tN, tQ, tW, TWL implementations
- [`docs/tier2-features/llm-integration/`](docs/tier2-features/llm-integration/): **LLM FEATURES** - AI chat and context management

### Tier 3: Implementation Details
- [`docs/tier3-implementation/patterns/`](docs/tier3-implementation/patterns/): **DESIGN PATTERNS** - Simple Verse-Loading and other patterns
- [`docs/tier3-implementation/deprecated/`](docs/tier3-implementation/deprecated/): **DEPRECATED PATTERNS** - What NOT to use (manifests, Proskomma)
- [`docs/tier3-implementation/troubleshooting/`](docs/tier3-implementation/troubleshooting/): **TROUBLESHOOTING** - Common issues and solutions
- `app-overview.md`: Defines application purpose, target audience, and supported resources
- `ui-map.md`: UI layout, screen regions, and component interactions
- `component-map.md`: Key React components with paths and descriptions
- `TWL_Integration_Documentation.md`: Guide for the new TWL resource
- `Translation_Notes_Implementation.md`: Implementation details for Translation Notes (tN)
- `DCS_Integration_Documentation.md`: Explains access patterns to Door43 Content Service
- `Resource_Integration_Overview.md`: Outlines all supported translation resource types
- `usfm-semantic-rendering.md`: **CRITICAL** - Custom USFM 3.0 semantic rendering system (replaces Proskomma)
- `proskomma-deprecation-history.md`: **CRITICAL WARNING** - Why Proskomma was removed and must NOT be used
- `codex-version-guard.md`: Policy and CLI guard for verifying package versions against Codex model cutoff date
- `changelog-process.md`: Guidelines for maintaining CHANGELOG.md
- `separation-of-concerns.md`: Architectural guidance for component responsibilities and data flow
- `llm-chat-feature.md`: LLM chat integration and AI-powered assistance features
- `ai-response-formatting-enhancement.md`: AI response formatting and enhancement strategies
- `llm-response-styling-improvements.md`: LLM response styling and presentation improvements
- `clickable-rc-links-feature.md`: Clickable RC (Resource Catalog) links feature implementation
- `rc-links-specification.md`: Resource Catalog links specification and standards
- `hidden-content-chat-context-feature.md`: Hidden content handling in chat context
- `verse-1-test-case.md`: Verse 1 rendering test case documentation
- `organization-avatar-system.md`: Organization logo/avatar display system architecture and debugging
- `api-integration-patterns.md`: DCS API integration patterns, error handling, and best practices
- `debugging-methodologies.md`: Systematic debugging approaches and troubleshooting frameworks
- `cross-organization-resource-loading.md`: Cross-organization resource loading system architecture, bug fixes, and maintenance guidelines
- `catalog-api-optimization.md`: **API PERFORMANCE** - Language loading and subject filtering optimizations with 90% performance improvements

## 🛠️ Development Environment

- React + Material UI
- Capacitor (for native builds)
- Loads data from Door43 Git-based repos
- Uses TSV and Markdown content structures

## 🧠 Assistant Tips (for AGENTS)

- **Repo Owner:** `klappy`
- **🎯 PRIMARY ARCHITECTURE**: Follow the **Simple Verse-Loading Pattern** documented in `docs/tier3-implementation/patterns/SIMPLE-VERSE-LOADING-PATTERN.md`
- **🚨 CRITICAL PRINCIPLE**: ResourcesContext loads ALL data, panels self-activate their resources
- **✅ CORRECT PATTERN**: Panels use `const { resources, activateResource } = useResourcesContext()` and call `activateResource('type')`
- **✅ URL-DRIVEN**: Support URL parameters like `?scriptures=[/unfoldingWord/en/ult/tit/1/1]&resources=[/unfoldingWord/en/tn,/unfoldingWord/en/tq]`
- **❌ ANTI-PATTERN**: Never add complex loading logic to panels
- **⚠️ CRITICAL: DO NOT USE PROSKOMMA** - Use custom USFM semantic rendering system in `src/components/ScripturePanelRCL/`
- **🚀 API-DIRECT ONLY**: Use catalog API with ingredients array, NO manifest files ever
- **📈 API OPTIMIZATION**: DCS catalog search uses subject filtering to reduce payloads by 15.4% - see `catalogService.js` `appSupportedSubjects` array
- TWL is a new addition that replaces Greek inline tags—point devs to TWL documentation
- UI/UX tests use Vitest and React Testing Library
- **LLM Chat**: Direct ResourcesContext access, no panel refs or polling

## 🔄 GitFlow Branch Strategy

This project follows the GitFlow branching model:

### Core Branches

- **master**: Historical reference and tagged releases. No direct deploys.
- **production**: Live production environment. Only merged from staging branch.
- **staging**: QA testing and pre-production. Only merged from dev branch.
- **dev**: Integration branch for ongoing development. Features are merged here.

### Supporting Branches

- **feature/[feature-name]**: Created from `dev` for new features. Merge back to `dev` when complete.
- **bugfix/[bug-name]**: Created from `dev` for non-critical bugs. Merge to `dev`.
- **hotfix/[fix-name]**: Created from `production` for critical production fixes. Merge to both `production` and `dev`.

### Branch Naming Conventions

- Feature branches: `feature/[issue-id]-short-description`
- Bugfix branches: `bugfix/[issue-id]-short-description`
- Hotfix branches: `hotfix/[issue-id]-short-description`
- Release branches: `release/v[semver]`

Example: `feature/42-add-translation-notes-filtering`

### Branch Lifecycle

1. Create branch from appropriate base (dev for features/bugfixes, production for hotfixes)
2. Develop and commit changes
3. Create pull request to target branch (dev or production)
4. Review, test, and approve
5. Merge and delete feature branch
6. Update CHANGELOG.md according to the changes

## 📝 GitHub Issue Management

This project uses GitHub Issues for tracking development tasks, bugs, and features. The GitHub MCP integration enables LLMs to manage issues directly through the GitHub API.

### Issue Creation Process

1. Use the GitHub MCP tool `create_issue` to create a new issue:

   ```
   owner: [repository-owner]
   repo: [repository-name]
   title: [Issue title]
   body: [Detailed issue description with acceptance criteria]
   labels: [array of labels like "bug", "enhancement", "documentation"]
   assignees: [array of GitHub usernames]
   ```

2. Issue Format

   - Title: Clear, descriptive title
   - Body:
     - **Issue Description**: Brief overview of the problem/requirement
     - **Detailed Information**: Problem details, root cause analysis, investigation steps
     - **Acceptance Criteria**: Checkbox list of requirements using `- [ ] Requirement`
     - **Test Instructions**: How to verify the fix
     - **Additional Context**: Any other relevant information

3. Metadata Requirements
   - Labels should include:
     - Type: `bug`, `feature`, `enhancement`, `documentation`, etc.
     - Priority: `priority:low`, `priority:medium`, `priority:high`, `priority:critical`
     - Scope: `ui`, `service`, `test`, etc.
     - Versioning impact: `semver:patch`, `semver:minor`, `semver:major`
     - Changelog category: `changelog:added`, `changelog:changed`, `changelog:fixed`, etc.

### Issue Resolution Workflow

AGENTIC AI should:

1. Use `list_issues` to get open issues for the repository
2. For each issue:

   - Use `get_issue` to fetch issue details
   - Create an appropriate branch using `create_branch` following GitFlow naming conventions
   - Locate and update relevant code files (typically under `src/`)
   - Implement the requested behavior
   - Implement, review and update unit tests
   - Confirm visually through Playwright test that implementation works
   - Update documentation as described
   - **Review and align documentation** with code changes
   - Update `package.json` version using `update_version` according to semver impact
   - Update `CHANGELOG.md` with an entry using `update_changelog`
   - Close the issue using `close_issue` with a detailed comment summarizing the changes

3. Don't EVER claim that implementation is complete or close the issue when you have not done the following:
   - Updated the tests to cover changes
   - Run the tests and all the tests pass
   - Have visual confirmation through Playwright and/or
   - Manually clicking around to confirm

### Issue Completion Checklist

Before closing an issue:

1. All acceptance criteria must be met
2. Tests must be passing
3. Documentation must be updated
4. CHANGELOG.md must be updated
5. Version in package.json must be bumped appropriately
6. Any related PRs must be linked in the issue comment

## 📊 Semantic Versioning (SemVer)

The project follows semantic versioning (MAJOR.MINOR.PATCH):

- **PATCH (0.0.X)**: Bug fixes, documentation updates, test improvements, refactoring with no API changes
- **MINOR (0.X.0)**: New features, new components, non-breaking API additions
- **MAJOR (X.0.0)**: Breaking changes, API removals, incompatible behavior changes

### Version Bumping Rules

- **Patch** (x.y.Z+1): Use for `semver:patch` labeled issues
- **Minor** (x.Y+1.0): Use for `semver:minor` labeled issues
- **Major** (X+1.0.0): Use for `semver:major` labeled issues

The version should be updated in:

- `package.json`: `"version": "X.Y.Z"`

## 📝 CHANGELOG.md Process

The project maintains a comprehensive CHANGELOG.md file documenting all changes:

### Structure

```markdown
# Changelog

## [NEW_VERSION] - YYYY-MM-DD

### [CHANGELOG_CATEGORY]

- [CHANGELOG_DESCRIPTION with details]
  - ✅ Implementation detail 1
  - ✅ Implementation detail 2
  - ...
```

### Categories

- **Added**: New features or capabilities
- **Changed**: Changes to existing functionality
- **Deprecated**: Features that will be removed in future versions
- **Removed**: Features removed in this version
- **Fixed**: Bug fixes
- **Security**: Security-related changes

### Best Practices

1. Add entries at the top of the file (newest first)
2. Include detailed implementation bullets beneath main entries
3. Mark completed items with ✅
4. Group entries by category (Added, Changed, Fixed, etc.)
5. Include technical details and user experience benefits where relevant
6. Link to relevant GitHub issues where appropriate

### Changelog Entry Example

```markdown
## [0.11.0] - 2025-06-06

### Added

- **Milestone Marker Rendering with Mode-Aware Decorators - COMPLETED**
  - ✅ Implemented comprehensive milestone marker rendering system
  - ✅ Created `src/utils/milestoneDecorators.js` with factory function
  - ✅ Added support for all USFM milestone marker types
```

## 🚧 Workflow Summary for LLMs

1. **Issue Analysis**

   - Use GitHub MCP tools to list and examine open issues
   - Check related documentation and existing implementation
   - Identify affected files and dependencies

2. **Branch Creation** (via GitHub API)

   - Base branch selection (develop or main) based on issue type
   - Branch naming following GitFlow conventions

3. **Implementation**

   - Develop the solution following established patterns
   - Write tests to validate functionality
   - Update documentation to reflect changes

4. **Testing**

   - Run unit tests to verify implementation
   - Visual confirmation with Playwright tests
   - Manual verification as needed

5. **Documentation**

   - Update project documentation
   - Ensure all documentation is in sync with code changes

6. **Version and Changelog Updates**

   - Increment version number in package.json according to semver impact
   - Add detailed changelog entry with implementation bullets
   - Follow established changelog format and standards

7. **Issue Closure**
   - Update the GitHub issue with a detailed completion summary
   - Reference all relevant commits and PRs
   - Close the issue through GitHub API
   - Verify all acceptance criteria have been met

## 🚨 CRITICAL: NO MANIFESTS! API-DIRECT ARCHITECTURE ONLY 🚨

**⚠️ BEFORE MAKING ANY CHANGES: This app uses API-direct architecture**

- ❌ **NEVER use `manifest.yaml` files**
- ❌ **NEVER call `fetchManifest()`**
- ❌ **NEVER use manifest-based file path resolution**
- ✅ **ALWAYS use `ingredients` array from catalog API**
- ✅ **ALWAYS use resource data directly from API**

**📖 Read `docs/tier3-implementation/deprecated/NO-MANIFESTS-API-DIRECT.md` for full details!**

---

## Overview

This is a React-based web application for viewing and working with Bible translation resources. The app provides access to:

- Scripture texts (USFM format)
- Translation Notes (tN)
- Translation Questions (tQ) 
- Translation Words (tW)
- Translation Word Links (tWL)

## Key Architecture Principles

### 1. API-Direct Resource Loading
- Resources are discovered via DCS Catalog API (`/api/v1/catalog/search`)
- File paths come from `ingredients` array in API response
- No manifest files are used for file path resolution

### 2. Cross-Organization Support
- Users can mix resources from different organizations
- Advanced mode allows per-resource-type organization selection
- Resource availability is discovered dynamically

### 3. URL-Driven State
- All app state is reflected in URL parameters
- Direct linking to specific references works
- Browser navigation (back/forward) works correctly

## File Structure

```
src/
├── components/          # React components
├── context/            # React context providers
├── services/           # API and data services (NO MANIFESTS!)
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── styles/             # CSS and styling
```

## Services Architecture

### Scripture Service (`src/services/scriptureService.js`)
- ✅ Uses `resourceData.ingredients` for file paths
- ✅ Fetches USFM content directly from DCS
- ❌ NO manifest dependencies

### Translation Helps Services
- `tnService.js` - Translation Notes (uses `resourceData.ingredients` for file paths)
- `tqService.js` - Translation Questions (uses `resourceData.ingredients` for file paths)  
- `twlService.js` - Translation Word Links (uses `resourceData.ingredients` for file paths)
- `twService.js` - Translation Words (fetches from links)