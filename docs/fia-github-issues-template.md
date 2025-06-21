# FIA Integration GitHub Issues Template

## 📋 Issue Creation Guide

This document provides templates for creating GitHub issues following the project's established patterns and standards.

## 🏷️ Label Categories

### Type Labels
- `feature` - New functionality
- `bug` - Something isn't working
- `enhancement` - Improvement to existing feature
- `documentation` - Documentation changes
- `test` - Testing related

### Priority Labels
- `priority:critical` - Must be fixed immediately
- `priority:high` - Important, should be next
- `priority:medium` - Normal priority
- `priority:low` - Nice to have

### Scope Labels
- `ui` - User interface changes
- `service` - Backend/API service changes
- `component` - React component changes
- `context` - Context provider changes
- `media` - Media/multimedia related
- `performance` - Performance optimization
- `security` - Security related
- `pwa` - Progressive Web App features

### Versioning Labels
- `semver:patch` - Bug fixes, docs (0.0.X)
- `semver:minor` - New features (0.X.0)
- `semver:major` - Breaking changes (X.0.0)

### Changelog Labels
- `changelog:added` - New features
- `changelog:changed` - Changes to existing
- `changelog:fixed` - Bug fixes
- `changelog:deprecated` - Soon to be removed
- `changelog:removed` - Removed features
- `changelog:security` - Security fixes

---

## 📝 Issue Templates

### Epic Template
```markdown
# Epic: [Epic Name]

## 🎯 Epic Goal
[Brief description of what this epic accomplishes]

## 📊 Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## 🔗 Related Issues
- #[issue-number] - [issue-title]
- #[issue-number] - [issue-title]

## 📅 Timeline
**Target Completion**: [Date]
**Dependencies**: [List any blocking epics/issues]

## 📋 Acceptance Criteria
- [ ] All child issues completed
- [ ] Integration testing passed
- [ ] Documentation updated
- [ ] Performance metrics met

## 🧪 Testing Requirements
- [ ] Unit tests for all new code
- [ ] Integration tests for epic functionality
- [ ] E2E tests for user workflows
- [ ] Performance testing completed

## 📚 Documentation Requirements
- [ ] Technical documentation updated
- [ ] User guide sections added
- [ ] API documentation updated (if applicable)
- [ ] Code comments and JSDoc added
```

### Feature Issue Template
```markdown
# Feature: [Feature Name]

## 📝 Issue Description
[Brief overview of the feature requirement]

## 🎯 User Story
As a [user type], I want [functionality] so that [benefit/value].

## 📋 Detailed Requirements
[Detailed description of what needs to be implemented]

## ✅ Acceptance Criteria
- [ ] Specific, testable requirement 1
- [ ] Specific, testable requirement 2
- [ ] Specific, testable requirement 3
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Responsive design verified
- [ ] Accessibility requirements met

## 🔧 Technical Requirements
```javascript
// Code structure example
interface ComponentProps {
  prop1: string;
  prop2: number;
  onAction: (data: any) => void;
}
```

## 🧪 Test Requirements
- [ ] Unit tests written with 90%+ coverage
- [ ] Component tests for UI elements
- [ ] Integration tests for API calls
- [ ] E2E tests for user workflows
- [ ] Error scenario testing

## 📚 Documentation Requirements
- [ ] Component documentation (JSDoc)
- [ ] Usage examples
- [ ] Props/API documentation
- [ ] Integration guide updates

## 🎨 Design Requirements
- [ ] Figma/design mockups reviewed
- [ ] Mobile responsive design
- [ ] Dark/light theme support
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Loading and error states designed

## 🔗 Dependencies
- Depends on: #[issue-number]
- Blocks: #[issue-number]

## ⚠️ Risks and Considerations
- [List any potential risks or technical challenges]

## 📏 Definition of Done
- [ ] All acceptance criteria met
- [ ] Code review approved
- [ ] Tests passing (unit, integration, E2E)
- [ ] Documentation updated
- [ ] Accessibility verified
- [ ] Performance impact assessed
- [ ] No regression in existing functionality
```

### Bug Issue Template
```markdown
# Bug: [Brief Bug Description]

## 🐛 Bug Description
[Clear description of what the bug is]

## 🔄 Steps to Reproduce
1. Go to [page/section]
2. Click on [element]
3. Enter [data]
4. See error

## 🎯 Expected Behavior
[What should happen]

## ❌ Actual Behavior
[What actually happens]

## 📱 Environment
- **Browser**: [Chrome 91, Firefox 89, etc.]
- **OS**: [Windows 10, macOS 11, etc.]
- **Device**: [Desktop, Mobile, Tablet]
- **Screen Size**: [1920x1080, Mobile viewport, etc.]
- **App Version**: [Version number]

## 📸 Screenshots/Videos
[Attach screenshots or videos if applicable]

## 🔍 Additional Context
[Any other context about the problem]

## 💥 Impact
- **Severity**: [Critical/High/Medium/Low]
- **Users Affected**: [Percentage or description]
- **Workaround Available**: [Yes/No - describe if yes]

## 🔧 Technical Investigation
### Root Cause Analysis
[What investigation has been done]

### Potential Solutions
1. [Solution option 1]
2. [Solution option 2]

## ✅ Acceptance Criteria
- [ ] Bug no longer reproduces
- [ ] No regression in related functionality
- [ ] Fix verified across browsers/devices
- [ ] Unit tests added to prevent regression
- [ ] Documentation updated if needed

## 🧪 Test Instructions
1. [Step to verify fix]
2. [Step to verify no regression]
3. [Step to test edge cases]

## 📏 Definition of Done
- [ ] Bug fixed and verified
- [ ] Regression tests added
- [ ] Code review approved
- [ ] Testing completed across environments
- [ ] Documentation updated if needed
```

### Service/API Issue Template
```markdown
# Service: [Service Name Implementation]

## 📝 Service Description
[What this service does and why it's needed]

## 🏗️ Architecture Requirements
```javascript
// Service interface
class ServiceName {
  async method1(params) { }
  async method2(params) { }
  handleError(error) { }
}
```

## 📋 API Integration Requirements
- **Endpoint**: [API endpoint URL]
- **Authentication**: [Auth method]
- **Rate Limits**: [Any rate limiting]
- **Error Handling**: [How to handle API errors]

## ✅ Acceptance Criteria
- [ ] Service class created with proper structure
- [ ] All required methods implemented
- [ ] Error handling for API failures
- [ ] Retry logic for transient failures
- [ ] Caching implementation (if applicable)
- [ ] Rate limiting handled
- [ ] Authentication flow working
- [ ] Unit tests with mocked API calls
- [ ] Integration tests with real API

## 🔧 Technical Implementation
### File Structure
```
src/services/
├── serviceName.js
├── serviceName.test.js
└── __mocks__/
    └── serviceName.js
```

### Dependencies
- [ ] Apollo Client (for GraphQL)
- [ ] Axios (for REST)
- [ ] Cache implementation
- [ ] Error boundary integration

## 🧪 Testing Requirements
- [ ] Unit tests for all methods
- [ ] Mock API responses
- [ ] Error scenario testing
- [ ] Rate limiting testing
- [ ] Authentication flow testing
- [ ] Integration tests with ResourcesContext

## 📚 Documentation Requirements
- [ ] Service API documentation
- [ ] Usage examples
- [ ] Error handling guide
- [ ] Integration patterns

## 🔗 Integration Points
- [ ] ResourcesContext integration
- [ ] Error boundary handling
- [ ] Loading state management
- [ ] Cache invalidation strategy

## 📏 Definition of Done
- [ ] Service fully implemented
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Integration verified
- [ ] Performance benchmarked
- [ ] Error handling robust
```

---

## 🚀 Issue Creation Workflow

### 1. Create Epic Issues First
```bash
# Epic issues provide high-level tracking
Title: "Epic: FIA Foundation & Core Services"
Labels: epic, feature, semver:minor, changelog:added
```

### 2. Create Feature Issues
```bash
# Feature issues for each major component
Title: "Feature: Create FIA GraphQL Service"
Labels: feature, service, semver:minor, changelog:added, priority:critical
```

### 3. Create Sub-task Issues (if needed)
```bash
# Break down large features into smaller tasks
Title: "Task: Implement FIA Authentication Flow"
Labels: feature, security, semver:minor, changelog:added
```

### 4. Link Issues Properly
- Use "Depends on #123" in issue descriptions
- Reference parent epic in child issues
- Use GitHub's task lists for tracking

### 5. Assign Labels Consistently
- Always include type (feature/bug/enhancement)
- Always include semver impact
- Always include changelog category
- Add priority and scope as appropriate

---

## 📊 Issue Tracking Templates

### Sprint Planning Template
```markdown
# Sprint [Number]: [Sprint Goal]

## 🎯 Sprint Goal
[What we want to accomplish this sprint]

## 📋 Sprint Backlog
### Epic 1: [Epic Name]
- [ ] #[issue] - [title] (Story Points: X)
- [ ] #[issue] - [title] (Story Points: X)

### Epic 2: [Epic Name]
- [ ] #[issue] - [title] (Story Points: X)
- [ ] #[issue] - [title] (Story Points: X)

## 📈 Sprint Metrics
- **Total Story Points**: [Number]
- **Team Capacity**: [Number]
- **Sprint Duration**: [X weeks]

## 🎯 Success Criteria
- [ ] All critical issues completed
- [ ] No regression bugs introduced
- [ ] Code coverage maintained above 90%
- [ ] All tests passing
```

### Release Planning Template
```markdown
# Release [Version]: [Release Name]

## 🎯 Release Goal
[What this release delivers to users]

## 📋 Features Included
- [ ] Epic 1: [Epic Name] - #[epic-issue]
- [ ] Epic 2: [Epic Name] - #[epic-issue]

## 🐛 Bugs Fixed
- [ ] #[bug-issue] - [bug description]
- [ ] #[bug-issue] - [bug description]

## 📊 Release Metrics
- **New Features**: [Number]
- **Bugs Fixed**: [Number]
- **Performance Improvements**: [Description]
- **Bundle Size Impact**: [Percentage change]

## 🧪 Testing Checklist
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance tests passing
- [ ] Accessibility audit complete
- [ ] Cross-browser testing complete

## 📚 Documentation Updates
- [ ] CHANGELOG.md updated
- [ ] User guide updated
- [ ] API documentation updated
- [ ] Developer documentation updated

## 🚀 Deployment Checklist
- [ ] Staging deployment successful
- [ ] Production deployment plan reviewed
- [ ] Rollback plan prepared
- [ ] Monitoring and alerts configured
```

---

This template system ensures consistent issue creation and tracking throughout the FIA integration project, following the established project patterns and standards.
