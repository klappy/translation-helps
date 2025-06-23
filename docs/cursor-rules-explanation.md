# Cursor Rules for Deployment Workflow - CORRECTED FORMAT

## Issue Resolution

The Cursor rules were not appearing in the app because they lacked the proper MDC (Markdown with metadata) front matter format required by Cursor IDE.

## Correct MDC Format

Cursor rules MUST include YAML front matter with these fields:

```yaml
---
description: Brief description of what this rule does
globs: File patterns this rule applies to (optional)
alwaysApply: true/false (whether to always include this rule)
---
```

## Our Fixed Rules

### 1. `deployment-workflow-enforcement.mdc`
```yaml
---
description: Deployment workflow enforcement and branch management for translation-helps project
globs: 
alwaysApply: true
---
```
- **Contains**: Essential git commands, branch usage rules, promotion commands
- **Always applies**: Yes - critical for all development work
- **Points to**: Detailed docs for complete procedures and context

### 2. `documentation-authority.mdc`  
```yaml
---
description: Documentation authority and quick reference commands for development workflow
globs: 
alwaysApply: false
---
```
- **Contains**: Quick reference commands, key principles, environment URLs
- **Always applies**: No - only when specifically needed
- **Points to**: Full documentation for detailed explanations

## How It Works Now

**When you ask deployment questions, Cursor will:**
1. **Load the relevant rule** (based on front matter settings)
2. **Provide immediate commands** from the rule content
3. **Reference specific .md docs** for detailed explanations

**Example interaction:**
- **You ask**: "How do I start new work?"
- **Cursor provides**: 
  ```bash
  git checkout dev
  git pull origin dev
  git checkout -b feature/your-feature
  ```
- **And says**: "For complete workflow details, see `docs/development-workflow-guide.md`"

## Why This Format Works

1. **Front matter is required** - Cursor uses it to understand when/how to apply rules
2. **Description helps AI selection** - Cursor's AI can choose relevant rules based on context
3. **alwaysApply controls loading** - Critical rules always load, others load when needed
4. **Globs target specific files** - Rules can activate for specific file patterns

## Verification

You should now see these rules in:
- **Cursor Settings > Rules** - Listed as project rules
- **Chat context** - Applied automatically based on front matter settings
- **Command suggestions** - When asking deployment questions

## File Structure

```
.cursor/rules/
├── deployment-workflow-enforcement.mdc  ← Always applies
└── documentation-authority.mdc          ← Applies when needed
```

The rules provide immediate commands while docs provide detailed context - exactly as intended!
