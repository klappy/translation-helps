# Cursor Rules for Deployment Workflow

## Purpose

These Cursor rules ensure that AI assistants consistently follow the established deployment workflow and reference authoritative documentation rather than duplicating information.

## Created Rules

### 1. `deployment-workflow-enforcement.mdc`
**Purpose**: Prevents deviation from established deployment workflow
**Key Functions**:
- Enforces starting new work from `dev` branch
- Prevents direct work on staging/production/master
- Always references documentation instead of duplicating procedures
- Provides template responses that point to docs

### 2. `documentation-authority.mdc`  
**Purpose**: Ensures documentation remains the single source of truth
**Key Functions**:
- Requires checking documentation before responding
- Prevents inline duplication of documented procedures
- Enforces referencing specific files and sections
- Maintains documentation as authoritative source

## How These Rules Help

### Prevents Information Drift
- No duplicate deployment instructions in conversations
- Documentation stays current and authoritative
- Reduces confusion from multiple sources of truth

### Enforces Workflow Discipline
- AI will always remind about proper branch usage
- Consistent reference to established procedures
- Prevents accidental workflow violations

### Maintains Documentation Quality
- Forces regular reference to documentation
- Encourages keeping docs up-to-date
- Makes documentation the living reference

## Rule Behavior

When you ask deployment-related questions, the AI will:

✅ **Point you to specific documentation files**
✅ **Remind about key principles (dev branch, etc.)**
✅ **Provide minimal context, not full procedures**
✅ **Encourage reading complete documentation**

❌ **Won't duplicate git commands**
❌ **Won't recreate deployment procedures**
❌ **Won't override documented workflows**
❌ **Won't provide shortcuts that bypass docs**

## Example Interactions

**You ask**: "How do I start new work?"
**AI responds**: 
```
🔗 Please see `docs/development-workflow-guide.md` for the complete workflow.

Key point: Always start from the `dev` branch.
```

**You ask**: "What's the deployment process?"
**AI responds**:
```
🔗 See `docs/deployment-strategy-netlify-ui.md` for safe deployment configuration
and `docs/deployment-quick-reference.md` for commands.

Remember: Use Netlify UI, not netlify.toml modifications.
```

## Benefits

1. **Consistency**: Always get the same, correct workflow guidance
2. **Authority**: Documentation remains the definitive source
3. **Currency**: Forces documentation to stay up-to-date
4. **Discipline**: Prevents workflow shortcuts and mistakes
5. **Learning**: Encourages reading and understanding complete procedures

## Rule Files Location

- `.cursor/rules/deployment-workflow-enforcement.mdc`
- `.cursor/rules/documentation-authority.mdc`

These rules are version-controlled with your project and will persist across development sessions.

## Success Metrics

You'll know the rules are working when:
- AI consistently points you to documentation
- You develop the habit of checking docs first
- Documentation becomes your go-to reference
- Workflow violations become rare
- Team members follow consistent procedures

The rules help maintain the professional deployment workflow we've established while ensuring documentation remains authoritative and current.
