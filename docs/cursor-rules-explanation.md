# Cursor Rules for Deployment Workflow

## Corrected Approach

The Cursor rules now work correctly:
- **Cursor rules (.mdc files)**: Contain quick commands and immediate guidance
- **Markdown docs (.md files)**: Contain detailed explanations, context, and reasoning

## How It Works

### Cursor Rules Provide:
- Exact git commands to use
- Quick workflow reminders  
- Critical "don't do this" warnings
- Environment URLs
- Essential procedures

### Markdown Docs Provide:
- WHY we use this workflow
- Detailed setup instructions
- Troubleshooting guidance
- Complete context and reasoning
- Configuration procedures

## Created Rules

### 1. `deployment-workflow-enforcement.mdc`
**Contains**: Essential git commands, branch usage rules, promotion commands
**Points to**: Detailed docs for complete procedures and context

### 2. `documentation-authority.mdc`  
**Contains**: Quick reference commands, key principles, environment URLs
**Points to**: Full documentation for detailed explanations

## Example Interaction

**You ask**: "How do I start new work?"
**AI provides**: 
```bash
git checkout dev
git pull origin dev
git checkout -b feature/descriptive-name
```
**And says**: "For complete workflow details, see `docs/development-workflow-guide.md`"

## Benefits

✅ **Immediate action**: Get the right commands instantly
✅ **Detailed learning**: Reference docs for full understanding  
✅ **Consistency**: Same commands every time
✅ **Context**: Understand the reasoning behind the workflow
✅ **No forgetting**: Rules enforce proper procedures

## File Structure

```
.cursor/rules/
├── deployment-workflow-enforcement.mdc  ← Commands & procedures
└── documentation-authority.mdc          ← Quick reference

docs/
├── development-workflow-guide.md        ← Complete workflow explanation
├── deployment-strategy-netlify-ui.md    ← Detailed deployment setup
├── deployment-quick-reference.md        ← All commands with context
└── netlify-config-analysis.md          ← Technical configuration details
```

## Rule Logic (Corrected)

1. **User asks deployment question**
2. **Cursor rule provides immediate commands**
3. **Rule points to relevant .md docs for details**
4. **User gets both quick action AND full context**

This prevents forgetting the workflow while providing both immediate help and detailed learning resources.
