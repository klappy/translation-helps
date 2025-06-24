# 🚀 Deployment Strategy

**Tier 1 Core Documentation**  
*Authoritative guide for all deployment processes*

## 📋 Quick Reference

### Environment URLs
- **Dev**: https://dev--translation-helps.netlify.app
- **Staging**: https://staging--translation-helps.netlify.app  
- **Production**: https://translation-helps.netlify.app

### Daily Commands
```bash
# Start new feature
git checkout dev && git pull origin dev
git checkout -b feature/my-feature

# Deploy to dev (via PR merge)
git push origin feature/my-feature
# Create PR to dev → merge → auto-deploys

# Promote to staging
git checkout staging && git merge dev && git push origin staging

# Release to production
# Create PR staging → production → get approval → merge
```

---

## 🏗️ Architecture Overview

### Four-Tier Environment System

```
Feature Branch → dev → staging → production → master (tagged)
```

| Environment | Branch | Purpose | URL | Deploy Trigger |
|-------------|--------|---------|-----|----------------|
| **Development** | `dev` | Feature integration | dev--translation-helps.netlify.app | Push to dev |
| **Staging** | `staging` | QA testing | staging--translation-helps.netlify.app | Push to staging |
| **Production** | `production` | Live site | translation-helps.netlify.app | Push to production |
| **Reference** | `master` | Historical record | No deploy | Manual only |

### Branch Protection Rules

- **master**: 2 reviewers required, status checks, administrators included
- **production**: 1 reviewer required, status checks, no direct pushes
- **staging**: Status checks required, maintainer pushes allowed
- **dev**: Status checks required

---

## ⚙️ Configuration Strategy

### Netlify UI Configuration (Recommended)

**Why UI over netlify.toml?**
- Preserves hand-tuned build configuration
- Safer iteration with instant rollback
- Granular per-branch control
- No risk of breaking working builds

### Setup Steps

#### 1. Production Branch Configuration
```
Netlify Dashboard → Site Settings → Build & deploy → Continuous Deployment
- Production branch: "production"
- Branch deploys: Enable for "dev", "staging"
```

#### 2. Environment Variables (Per Branch Scope)
```
Site Settings → Environment variables → Add variable → Choose scopes

Production Branch:
VITE_API_ENV = "production"
VITE_ENABLE_DEBUG = "false"

Staging Branch:
VITE_API_ENV = "staging" 
VITE_ENABLE_DEBUG = "true"

Dev Branch:
VITE_API_ENV = "development"
VITE_ENABLE_DEBUG = "true"
```

#### 3. Build Settings (Keep Simple)
```
Build command: yarn install && yarn run build
Functions: netlify/functions
Publish: dist
```

**Note**: Original netlify.toml intentionally sets NODE_ENV="development" even in production - this is critical for builds.

---

## 🔄 Deployment Workflows

### Feature Development
```bash
# 1. Start from dev
git checkout dev
git pull origin dev
git checkout -b feature/descriptive-name

# 2. Develop and commit
git add .
git commit -m "feat: add new feature"
git push origin feature/descriptive-name

# 3. Create PR to dev
# GitHub → Create Pull Request → dev branch
# Get review → Merge → Auto-deploys to dev environment

# 4. Test in dev environment
# Visit: https://dev--translation-helps.netlify.app
```

### Staging Promotion
```bash
# After dev testing passes
git checkout staging
git pull origin staging
git merge dev
git push origin staging

# Auto-deploys to: https://staging--translation-helps.netlify.app
# QA team tests in staging environment
```

### Production Release
```bash
# After staging approval
# GitHub → Create PR: staging → production
# Get product owner approval
# Merge PR → Auto-deploys to production

# Tag the release
git checkout master
git merge production
npm version patch  # or minor/major based on changes
git push origin master --tags
```

### Hotfix Workflow (Emergency)
```bash
# Critical production issues only
git checkout production
git checkout -b hotfix/critical-issue
# Make minimal fix
git commit -m "hotfix: resolve critical issue"

# Fast-track to production
git checkout production
git merge hotfix/critical-issue
git push origin production

# Sync back to dev
git checkout dev
git merge hotfix/critical-issue
git push origin dev
```

---

## 🛡️ Safety & Rollback Procedures

### Quick Rollback (< 5 minutes)
1. **Netlify Dashboard** → Site → **Deploys**
2. Find last working deployment
3. Click **"..."** → **"Publish deploy"**

### Branch Rollback
```bash
# Identify last known good commit
git log --oneline -10

# Revert production branch
git checkout production
git reset --hard <good-commit-hash>
git push --force-with-lease origin production
```

### Emergency Procedures
1. **Immediate**: Netlify dashboard rollback
2. **Create hotfix** from last known good commit
3. **Minimal fix** only
4. **Fast-track** through staging to production

---

## 📊 Monitoring & Quality Gates

### Testing Requirements

#### Development Environment
- ✅ Unit tests pass (`yarn test`)
- ✅ Build successful (`yarn build`)
- ✅ No console errors
- ✅ Linting checks pass

#### Staging Environment  
- ✅ Full test suite passes
- ✅ E2E tests with Playwright
- ✅ Performance benchmarks
- ✅ Accessibility audit
- ✅ QA team approval

#### Production Environment
- ✅ Smoke tests post-deployment
- ✅ Critical path verification
- ✅ Performance monitoring active
- ✅ Error tracking confirmed

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] Documentation updated if needed
- [ ] PR approved by required reviewers
- [ ] No breaking changes without migration plan

### Post-Deployment Verification
- [ ] Deployment successful in Netlify
- [ ] Site loads correctly at target URL
- [ ] Key features functional
- [ ] No new errors in monitoring
- [ ] Performance within acceptable ranges

---

## 👥 Team Responsibilities

| Role | Responsibilities |
|------|------------------|
| **Developers** | Feature development, PR creation, dev testing |
| **QA Team** | Staging environment testing, promotion approval |
| **DevOps/Release Manager** | Branch promotions, deployment monitoring, rollbacks |
| **Product Owner** | Production release approval, feature sign-off |

---

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs in Netlify dashboard
# Verify environment variables are set correctly
# Test build locally: yarn build
# Check for missing dependencies
```

#### Environment Variable Issues
```bash  
# Ensure VITE_ prefix for client-side variables
# Verify variable scopes match branch names
# Redeploy after changing variables
# Clear browser cache after changes
```

#### Branch Deploy Issues
```bash
# Verify branch exists on GitHub
# Check branch deploy settings in Netlify
# Ensure branch names match exactly
# Clear build cache and retry
```

#### Wrong Environment Behavior
```bash
# Check VITE_API_ENV in Netlify settings
# Verify branch context configuration
# Clear browser cache
# Check API endpoints in network tab
```

---

## 📚 Related Documentation

### Tier 1 Core
- [DEVELOPMENT-WORKFLOW.md](DEVELOPMENT-WORKFLOW.md) - Git flow and branching
- [PRINCIPLES.md](PRINCIPLES.md) - Architectural decisions

### Tier 2 Features  
- [API Integration](../tier2-features/api-integration/README.md) - API configuration per environment

### Tier 3 Implementation
- [Troubleshooting Guide](../tier3-implementation/troubleshooting/deployment-issues.md)

---

## 📞 Emergency Contacts

- **Dev Issues**: Development team lead
- **Staging Approval**: QA team lead  
- **Production Release**: Product owner
- **Emergency Rollback**: DevOps on-call

---

*Last Updated: 2025-01-27*  
*Consolidates: deployment-strategy.md, deployment-strategy-netlify-ui.md, deployment-quick-reference.md* 