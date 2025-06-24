# 🎯 Core Principles

**Tier 1 Core Documentation**  
*Fundamental principles guiding all architectural and development decisions*

---

## 🏛️ Architectural Principles

### 1. **Simplicity First**
> "The best architecture is the one you don't notice."

- **Simple Verse-Loading Pattern**: Load only current verse data (~10KB vs 420KB)
- **Single Context Provider**: ResourcesContext as single source of truth
- **Self-Activating Components**: Panels request what they need, nothing more
- **No Over-Engineering**: Solve today's problems, not tomorrow's maybes

**Decision Impact**: Chose Simple Verse-Loading over complex caching systems
**Related**: [ARCHITECTURE.md](ARCHITECTURE.md#simple-verse-loading-pattern)

### 2. **API-Direct Architecture**
> "Eliminate intermediary complexity."

- **❌ NO MANIFESTS**: Never use `manifest.yaml` files or `fetchManifest()` calls
- **✅ Ingredients Array**: Use catalog API resource data directly
- **✅ Standard Naming**: Follow `{type}_{BOOK_ID}.tsv` patterns where possible
- **✅ Direct File Access**: Fetch content directly from DCS

**Decision Impact**: 90% performance improvement by eliminating manifest layer
**Related**: [NO-MANIFESTS-API-DIRECT.md](../tier3-implementation/deprecated/no-manifests-api-direct.md)

### 3. **Separation of Concerns**
> "Each component has one job and does it well."

- **Context Providers**: Manage state only
- **Service Layer**: Handle API calls and data transformation
- **UI Components**: Display data and handle user interaction
- **Utility Functions**: Pure functions for data processing

**Decision Impact**: Clear boundaries prevent bugs and improve maintainability
**Related**: [Component Architecture](../tier2-features/ui-components/README.md)

### 4. **Antifragile Design**
> "The system gets stronger when things go wrong."

- **Graceful Degradation**: Missing resources don't break other panels
- **Error Boundaries**: Isolate failures to prevent cascade
- **Fallback Strategies**: Multiple approaches for resource loading
- **Progressive Enhancement**: Core functionality works, extras enhance

**Decision Impact**: Individual panel failures don't crash entire application

### 5. **URL-Driven State**
> "The URL is the API of the web."

- **Deep Linking**: Every app state has a URL
- **Shareable URLs**: Users can bookmark and share specific references
- **Browser Navigation**: Back/forward buttons work correctly
- **State Restoration**: Refresh preserves user context

**Decision Impact**: Professional web app behavior, improved user experience
**Related**: [URL-PARAMETER-SPECIFICATION.md](../tier3-implementation/patterns/url-parameter-specification.md)

---

## 🚀 Performance Principles

### 6. **Verse-Specific Loading**
> "Load what you need, when you need it."

- **Minimal Payloads**: ~10KB per verse vs 420KB full chapters
- **Browser Caching**: Let the browser cache what it can
- **Parallel Loading**: Load multiple resource types simultaneously
- **Smart Activation**: Only load resources that panels actually need

**Decision Impact**: Sub-second navigation, 90% reduction in data transfer

### 7. **Progressive Enhancement**
> "Start with the essentials, add the extras."

- **Core First**: Scripture and basic notes load first
- **Enhanced Features**: LLM chat, advanced features layer on top
- **Mobile First**: Optimize for mobile, enhance for desktop
- **Accessibility**: Screen readers and keyboard navigation built-in

**Decision Impact**: Fast initial load, enhanced experience for capable devices

---

## 🛡️ Reliability Principles

### 8. **No Single Points of Failure**
> "When one thing breaks, everything else keeps working."

- **Independent Panels**: Each panel can fail without affecting others
- **Multiple Resource Sources**: Support cross-organization resources
- **Fallback Mechanisms**: Alternative approaches when primary fails
- **Error Recovery**: Clear error messages with actionable solutions

**Decision Impact**: Robust application that handles real-world conditions

### 9. **Consistent Error Handling**
> "Errors should be informative, not terrifying."

- **User-Friendly Messages**: Explain what happened and what to do
- **Technical Details**: Available for debugging but not overwhelming
- **Recovery Actions**: Suggest concrete steps to resolve issues
- **Logging Strategy**: Capture enough info for debugging without spam

**Decision Impact**: Better user experience, faster debugging

---

## 🔄 Development Principles

### 10. **Documentation as Code**
> "If it's not documented, it doesn't exist."

- **Tier System**: Organized hierarchy from macro to micro
- **Living Documentation**: Updated with code changes
- **Cross-References**: Link related concepts and dependencies
- **Decision Records**: Capture why choices were made

**Decision Impact**: Faster onboarding, fewer repeated mistakes
**Related**: This document and the entire docs/ structure

### 11. **Test-Driven Confidence**
> "Tests are specifications that execute."

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows with Playwright
- **Visual Testing**: Catch UI regressions

**Decision Impact**: Confidence in deployments, fewer production bugs

### 12. **Continuous Deployment**
> "Small changes, deployed frequently."

- **Branch Strategy**: dev → staging → production pipeline
- **Automated Testing**: Tests run on every commit
- **Environment Parity**: All environments configured identically
- **Rollback Ready**: Quick revert procedures for issues

**Decision Impact**: Faster feature delivery, reduced deployment risk
**Related**: [DEPLOYMENT-STRATEGY.md](DEPLOYMENT-STRATEGY.md)

---

## 🎨 User Experience Principles

### 13. **Responsive Design**
> "One codebase, all devices."

- **Mobile First**: Design for mobile, enhance for larger screens
- **Touch Friendly**: Large tap targets, swipe gestures
- **Progressive Enhancement**: Works on all browsers, best on modern ones
- **Theme Support**: Light/dark mode with system preference detection

**Decision Impact**: Accessible to users on any device

### 14. **Contextual Intelligence**
> "The app should understand what the user is trying to do."

- **Smart Defaults**: Reasonable choices without configuration
- **Context Preservation**: Remember user preferences and state
- **Predictive Loading**: Anticipate what user might need next
- **Minimal Cognitive Load**: Don't make users think unnecessarily

**Decision Impact**: Intuitive user experience, reduced learning curve

---

## 🔧 Technical Principles

### 15. **Modern React Patterns**
> "Use the platform, don't fight it."

- **Functional Components**: Hooks over class components
- **Context for State**: Avoid prop drilling
- **CSS Variables**: Theme system using CSS custom properties
- **Standard Tools**: Vite, Vitest, Playwright - proven solutions

**Decision Impact**: Maintainable codebase using current best practices

### 16. **API-First Integration**
> "Design for the API, not the implementation."

- **DCS Catalog API**: Primary source of resource metadata
- **RESTful Patterns**: Predictable API interactions
- **Error Handling**: Robust handling of API failures
- **Rate Limiting**: Respectful of API constraints

**Decision Impact**: Reliable integration with external services
**Related**: [API Integration](../tier2-features/api-integration/README.md)

---

## 🚨 Anti-Patterns (What NOT to Do)

### ❌ Complexity Anti-Patterns
- **Don't**: Use Proskomma for non-scripture resources
- **Don't**: Create manifest-based file resolution
- **Don't**: Over-engineer for hypothetical future needs
- **Don't**: Add features without clear user benefit

### ❌ Performance Anti-Patterns
- **Don't**: Load entire chapters when only verse is needed
- **Don't**: Make sequential API calls that could be parallel
- **Don't**: Ignore browser caching capabilities
- **Don't**: Load resources that aren't being displayed

### ❌ Maintainability Anti-Patterns
- **Don't**: Create circular dependencies between components
- **Don't**: Mix UI logic with business logic
- **Don't**: Skip documentation for "obvious" code
- **Don't**: Make breaking changes without migration plan

---

## 🎯 Decision Framework

When making architectural decisions, consider:

1. **Does this align with our core principles?**
2. **Does this solve a real user problem?**
3. **Is this the simplest solution that works?**
4. **How will this impact performance?**
5. **What happens when this fails?**
6. **Can this be easily tested?**
7. **Will this be maintainable in 6 months?**

---

## 📚 Related Documentation

### Tier 1 Core
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design implementation
- [DEVELOPMENT-WORKFLOW.md](DEVELOPMENT-WORKFLOW.md) - How we build features
- [DEPLOYMENT-STRATEGY.md](DEPLOYMENT-STRATEGY.md) - How we ship code

### Tier 2 Features
- [API Integration](../tier2-features/api-integration/README.md) - API principles in practice
- [UI Components](../tier2-features/ui-components/README.md) - Component design principles

### Tier 3 Implementation
- [Design Patterns](../tier3-implementation/patterns/) - Specific pattern implementations
- [Deprecated Patterns](../tier3-implementation/deprecated/) - What we've moved away from

---

## 🔄 Evolution of Principles

These principles evolve based on:
- **Real-world usage** and user feedback
- **Performance measurements** and optimization opportunities
- **Developer experience** and maintainability lessons
- **Technology advances** and ecosystem changes

When principles conflict, **simplicity and user value win**.

---

*Last Updated: 2025-01-27*  
*Guides all architectural and development decisions*  
*Referenced by: All other documentation* 