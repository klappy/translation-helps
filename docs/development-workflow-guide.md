# Development Workflow Guide

## Current Branch Status

After establishing our deployment pipeline, here's the current state:

- **refactor** (current) - Has latest documentation but is transition branch
- **dev** - Primary development branch (1 commit behind)
- **staging** - QA testing branch
- **production** - Live production branch  
- **master** - Protected reference branch

## Recommended Development Workflow

### 🎯 PRIMARY DEVELOPMENT BRANCH: `dev`

**Answer: Start all new work from the `dev` branch.**

### Why `dev` Branch?

1. **Designed for active development** - This is its purpose in our pipeline
2. **Automatic deployment** - Changes deploy to dev environment for testing
3. **Integration point** - Where feature branches merge
4. **Stable foundation** - Regularly promoted to staging/production
5. **Team collaboration** - Everyone works from the same base

### Daily Development Process

#### 1. Start New Feature
```bash
# Switch to dev branch
git checkout dev

# Get latest changes
git pull origin dev

# Create feature branch
git checkout -b feature/your-feature-name

# Work on your feature
# Make commits
git add .
git commit -m "feat: add new feature"

# Push feature branch
git push origin feature/your-feature-name
```

#### 2. Create Pull Request
- Create PR from `feature/your-feature-name` → `dev`
- Get code review
- Merge to `dev`
- Feature automatically deploys to: https://dev--translation-helps.netlify.app

#### 3. Test in Dev Environment
- Verify your changes work in dev environment
- Test integration with other features
- Fix any issues with additional commits to `dev`

### Branch Transition Strategy

Since we're currently on `refactor` and it has the latest docs, we need to sync:

#### Option 1: Merge refactor into dev (Recommended)
```bash
git checkout dev
git merge refactor
git push origin dev
```

#### Option 2: Make dev the new primary
```bash
# Update dev with latest
git checkout dev
git merge refactor
git push origin dev

# Archive refactor branch
git branch -d refactor  # (after confirming dev is updated)
```

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

#### `refactor` Branch
- Transition branch (current situation)
- Should be merged into `dev` and then archived
- Not part of ongoing workflow

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

**🎯 Start new work from: `dev` branch**

**Workflow:**
1. `git checkout dev`
2. `git pull origin dev`  
3. `git checkout -b feature/my-feature`
4. Work, commit, push
5. Create PR to `dev`
6. Test in dev environment
7. Promote through staging to production

This gives you a professional development workflow with proper testing environments and safe deployment practices.
