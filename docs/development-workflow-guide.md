# Development Workflow Guide

## 🛑 MANDATORY: Read WORKFLOW-PREFLIGHT.md First!

**Before ANY development work, you MUST complete the [WORKFLOW-PREFLIGHT.md](./WORKFLOW-PREFLIGHT.md) checklist.**

---

## Current Branch Status

After establishing our deployment pipeline, here's the current state:

- **dev** - Primary development branch (ALL WORK STARTS HERE)
- **staging** - QA testing branch
- **production** - Live production branch  
- **master** - Protected reference branch

## Recommended Development Workflow

### 🎯 PRIMARY DEVELOPMENT BRANCH: `dev`

**Answer: Start all new work from the `dev` branch BY CREATING A FEATURE BRANCH.**

⚠️ **NEVER work directly on `dev`. Always create a feature branch first!**

### Why Feature Branches?

1. **Protects dev branch** - No accidental breaks
2. **Enables code review** - PRs show exactly what changed
3. **Allows rollback** - Can revert entire features
4. **Parallel development** - Multiple features don't conflict
5. **Clear history** - Each feature is documented

### Daily Development Process

#### 1. Start New Feature (FOLLOW PREFLIGHT CHECKLIST)
```bash
# MANDATORY: Run preflight checklist first
# See docs/WORKFLOW-PREFLIGHT.md

# Quick version (after preflight):
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

#### 2. Create Pull Request
- Create PR from `feature/your-feature-name` → `dev`
- Get code review
- Merge to `dev`
- Feature automatically deploys to: https://dev--translation-helps.netlify.app

#### 3. Test in Dev Environment
- Verify your changes work in dev environment
- Test integration with other features
- Fix any issues with additional commits to your feature branch

### Feature Branch Naming

Use descriptive names:
- `feature/llm-chat-improvements`
- `feature/navigation-enhancement`
- `bugfix/scripture-panel-loading`
- `hotfix/critical-deployment-issue`

### Branch Promotion Flow

```
feature/xyz → dev → staging → production → master (tagged)
```

1. **Feature development** happens in feature branches
2. **Integration** happens in `dev`
3. **QA testing** happens in `staging`
4. **Production releases** happen from `production`
5. **Historical reference** maintained in `master`

### Environment Testing

- **Dev Environment**: https://dev--translation-helps.netlify.app
  - Test new features
  - Integration testing
  - Rapid iteration

- **Staging Environment**: https://staging--translation-helps.netlify.app
  - QA testing
  - User acceptance testing
  - Pre-production validation

- **Production Environment**: https://translation-helps.netlify.app
  - Live user traffic
  - Stable, tested features only

### When to Use Other Branches

#### `staging` Branch
- Don't work directly on staging
- Only merge `dev` into `staging` for QA testing
- Used for promotion, not development

#### `production` Branch  
- Never work directly on production
- Only merge `staging` into `production` for releases
- Represents live site state

#### `master` Branch
- Never work directly on master
- Only updated after successful production deployments
- Used for tagging releases and historical reference

### Hotfix Workflow

For critical production issues:

```bash
# Create hotfix from production
git checkout production
git checkout -b hotfix/critical-issue

# Fix the issue
git commit -m "hotfix: resolve critical issue"

# Merge back to production
git checkout production
git merge hotfix/critical-issue
git push origin production

# Also merge into dev to keep in sync
git checkout dev
git merge hotfix/critical-issue
git push origin dev
```

### Team Coordination

#### Multiple Developers
- Everyone branches from `dev`
- Create PRs back to `dev`
- Regular `dev` → `staging` promotions
- Scheduled `staging` → `production` releases

#### Code Reviews
- All feature branches require PR review
- `dev` → `staging` should be reviewed
- `staging` → `production` requires approval

#### Release Management
- Tag releases in `master` after production deployment
- Maintain CHANGELOG.md with each release
- Version bump in package.json

## Summary

**🎯 WORKFLOW IN 3 STEPS:**

1. **Complete WORKFLOW-PREFLIGHT.md checklist**
2. **Create feature branch from `dev`**
3. **Make changes, push, and create PR**

**Quick Commands:**
```bash
# EVERY TIME - NO EXCEPTIONS
git checkout dev
git pull origin dev  
git checkout -b feature/my-feature
# ... work ...
git push origin feature/my-feature
# Create PR on GitHub
```

This gives you a professional development workflow with proper testing environments and safe deployment practices.
