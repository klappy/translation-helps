# 🔄 Development Workflow

**Tier 1 Core Documentation**  
*Git flow, branching strategy, and development process*

## 🎯 PRIMARY DEVELOPMENT BRANCH: `dev`

**Always start new work from the `dev` branch.**

---

## 📋 Quick Commands

```bash
# Start new feature
git checkout dev
git pull origin dev
git checkout -b feature/descriptive-name

# Daily workflow
git add .
git commit -m "feat: descriptive commit message"
git push origin feature/descriptive-name

# Create PR to dev branch
# After merge, feature auto-deploys to dev environment
```

---

## 🌳 GitFlow Strategy

### Branch Hierarchy

```
Feature Branch → dev → staging → production → master (tagged)
```

### Core Branches

| Branch | Purpose | Deploys To | Merge From |
|--------|---------|------------|------------|
| **dev** | Integration & active development | dev--translation-helps.netlify.app | feature/* branches |
| **staging** | QA testing & pre-production | staging--translation-helps.netlify.app | dev branch |
| **production** | Live production site | translation-helps.netlify.app | staging branch |
| **master** | Historical reference & tags | No deploy | production branch |

### Supporting Branches

| Branch Type | Created From | Merged To | Purpose |
|-------------|--------------|-----------|---------|
| `feature/*` | dev | dev | New features |
| `bugfix/*` | dev | dev | Non-critical bugs |
| `hotfix/*` | production | production + dev | Critical production fixes |

---

## 🚀 Development Process

### 1. Feature Development

```bash
# Always start from dev
git checkout dev
git pull origin dev

# Create descriptive feature branch
git checkout -b feature/llm-chat-improvements
# OR
git checkout -b feature/42-add-translation-notes-filtering

# Work on feature
# Make commits with clear messages
git add .
git commit -m "feat: add translation notes filtering"

# Push feature branch
git push origin feature/llm-chat-improvements
```

### 2. Pull Request Process

1. **Create PR**: feature branch → `dev`
2. **Code Review**: Required for all features
3. **Tests**: Must pass before merge
4. **Merge**: Auto-deploys to dev environment
5. **Test**: Verify in dev environment

### 3. Integration Testing

- **Dev Environment**: https://dev--translation-helps.netlify.app
- Test feature integration
- Verify no regressions
- Fix issues with additional commits to dev

### 4. Promotion Pipeline

```bash
# After dev testing passes
# Promote to staging
git checkout staging
git pull origin staging
git merge dev
git push origin staging

# QA testing in staging environment
# After QA approval, promote to production
# Create PR: staging → production
# Get approval → merge → production deploy
```

---

## 📝 Branch Naming Conventions

### Feature Branches
```bash
feature/descriptive-name
feature/llm-chat-improvements
feature/navigation-enhancement
feature/42-add-translation-notes  # With issue number
```

### Bug Fix Branches
```bash
bugfix/descriptive-name
bugfix/scripture-panel-loading
bugfix/23-fix-verse-navigation
```

### Hotfix Branches
```bash
hotfix/critical-issue-name
hotfix/deployment-failure
hotfix/security-patch
```

---

## 🔥 Hotfix Workflow (Emergency)

For critical production issues that can't wait for normal pipeline:

```bash
# 1. Create hotfix from production
git checkout production
git pull origin production
git checkout -b hotfix/critical-issue

# 2. Fix the issue (minimal changes only)
git add .
git commit -m "hotfix: resolve critical production issue"

# 3. Deploy to production immediately
git checkout production
git merge hotfix/critical-issue
git push origin production

# 4. Sync back to dev to prevent conflicts
git checkout dev
git merge hotfix/critical-issue
git push origin dev

# 5. Clean up
git branch -d hotfix/critical-issue
```

---

## 👥 Team Collaboration

### Multiple Developers

1. **Everyone branches from dev**
2. **Regular dev sync**: `git pull origin dev` before starting work
3. **Small, focused PRs**: Easier to review and merge
4. **Frequent integration**: Don't let branches live too long

### Code Review Requirements

- **Feature → dev**: 1 reviewer required
- **dev → staging**: QA team approval
- **staging → production**: Product owner approval

### Conflict Resolution

```bash
# If your branch conflicts with dev
git checkout feature/my-feature
git pull origin dev
# Resolve conflicts
git add .
git commit -m "resolve merge conflicts with dev"
git push origin feature/my-feature
```

---

## 📊 Environment Testing Strategy

### Development Environment
- **Purpose**: Feature integration and developer testing
- **URL**: https://dev--translation-helps.netlify.app
- **Testing**: Unit tests, integration tests, manual verification

### Staging Environment  
- **Purpose**: QA testing and user acceptance
- **URL**: https://staging--translation-helps.netlify.app
- **Testing**: Full test suite, E2E tests, performance testing

### Production Environment
- **Purpose**: Live user traffic
- **URL**: https://translation-helps.netlify.app
- **Testing**: Smoke tests, monitoring, critical path verification

---

## 🔄 Release Management

### Version Bumping
```bash
# After successful production deployment
git checkout master
git merge production

# Bump version based on changes
npm version patch   # Bug fixes (0.0.X)
npm version minor   # New features (0.X.0)
npm version major   # Breaking changes (X.0.0)

git push origin master --tags
```

### Changelog Management
- Update `CHANGELOG.md` with each release
- Include implementation details
- Reference GitHub issues where applicable
- Follow semantic versioning categories

### Release Tagging
```bash
# After version bump
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin --tags
```

---

## ⚠️ Branch Protection Rules

### GitHub Settings Required

#### master Branch
- ✅ Require pull request reviews (2 reviewers)
- ✅ Dismiss stale pull request approvals
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators in restrictions

#### production Branch
- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks to pass
- ✅ No direct pushes allowed

#### staging Branch
- ✅ Require status checks to pass
- ✅ Allow direct pushes from maintainers

#### dev Branch
- ✅ Require status checks to pass
- ✅ Allow direct pushes from maintainers

---

## 🛠️ Troubleshooting

### Common Issues

#### Branch Behind Dev
```bash
# Update your feature branch
git checkout feature/my-feature
git pull origin dev
# Resolve conflicts if any
git push origin feature/my-feature
```

#### Merge Conflicts
```bash
# During PR merge
git checkout feature/my-feature
git pull origin dev
# Edit conflicted files
git add .
git commit -m "resolve conflicts with dev"
```

#### Wrong Base Branch
```bash
# If you accidentally branched from master
git checkout feature/my-feature
git rebase --onto dev master
```

#### Accidental Commit to Dev
```bash
# Move commits to feature branch
git checkout dev
git log --oneline -5  # Find commit hash
git reset --hard HEAD~1  # Remove last commit
git checkout -b feature/accidental-commits
git cherry-pick <commit-hash>
```

---

## 📚 Related Documentation

### Tier 1 Core
- [DEPLOYMENT-STRATEGY.md](DEPLOYMENT-STRATEGY.md) - Environment and deployment process
- [PRINCIPLES.md](PRINCIPLES.md) - Architectural decisions and guidelines

### Tier 2 Features
- [API Integration](../tier2-features/api-integration/README.md) - API development workflow

### Tier 3 Implementation
- [Troubleshooting](../tier3-implementation/troubleshooting/git-workflow-issues.md)

---

## 📞 Team Contacts

- **Dev Issues**: Development team lead
- **Code Review**: Senior developers
- **Merge Conflicts**: Team lead or DevOps
- **Branch Protection**: Repository administrator

---

*Last Updated: 2025-01-27*  
*Replaces: development-workflow-guide.md*  
*Standardizes on: `dev` branch (not `develop`)* 