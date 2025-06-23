# Translation Helps Deployment Strategy

## Overview

This document outlines the deployment strategy for the Translation Helps application using Netlify's branch deployment capabilities. We implement a four-tier environment system to ensure robust testing and safe deployments.

## Environment Structure

### 1. Development (`dev` branch)
- **Purpose**: Active development and feature integration
- **URL**: `dev--translation-helps.netlify.app`
- **Deploy Trigger**: Every push to `dev` branch
- **Use Case**: 
  - Feature development
  - Integration testing
  - Early bug detection

### 2. Staging (`staging` branch)
- **Purpose**: Pre-production testing environment
- **URL**: `staging--translation-helps.netlify.app`
- **Deploy Trigger**: Pull requests from `dev` to `staging`
- **Use Case**:
  - QA testing
  - Performance testing
  - User acceptance testing
  - Final bug fixes before production

### 3. Production (`production` branch)
- **Purpose**: Live production environment
- **URL**: `translation-helps.netlify.app`
- **Deploy Trigger**: Pull requests from `staging` to `production`
- **Use Case**:
  - Live user traffic
  - Stable, tested features only

### 4. Master (`master` branch)
- **Purpose**: Protected reference branch
- **Deploy**: No automatic deploys
- **Use Case**:
  - Historical reference
  - Emergency rollback source
  - Tagged releases

## Branch Protection Rules

### Master Branch
- Require pull request reviews (2 reviewers)
- Dismiss stale pull request approvals
- Require status checks to pass
- Require branches to be up to date
- Include administrators in restrictions

### Production Branch
- Require pull request reviews (1 reviewer)
- Require status checks to pass
- No direct pushes allowed

### Staging Branch
- Require status checks to pass
- Allow direct pushes from maintainers

## Deployment Flow

```
Feature Branch → dev → staging → production → master (tagged)
```

### Step-by-Step Process

1. **Feature Development**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git push origin feature/new-feature
   # Create PR to dev
   ```

2. **Integration to Development**
   - PR review required
   - Automated tests must pass
   - Merge to `dev` triggers deployment

3. **Promotion to Staging**
   ```bash
   git checkout staging
   git merge dev
   git push origin staging
   ```

4. **Production Release**
   - Create PR from `staging` to `production`
   - Require approval from team lead
   - Run full test suite
   - Deploy to production

5. **Master Update**
   - After successful production deployment
   - Create tagged release
   - Merge to master with version tag

## Netlify Configuration

### netlify.toml Updates

```toml
# Base configuration
[build]
  command = "yarn install && yarn run build"
  functions = "netlify/functions"
  publish = "dist"

# Production context
[context.production]
  environment = { NODE_ENV = "production", VITE_API_ENV = "production" }
  
# Staging context  
[context.staging]
  environment = { NODE_ENV = "staging", VITE_API_ENV = "staging" }

# Development context
[context.dev]
  environment = { NODE_ENV = "development", VITE_API_ENV = "development" }

# Branch deploy settings
[context.branch-deploy]
  environment = { NODE_ENV = "development" }

# Deploy preview settings
[context.deploy-preview]
  environment = { NODE_ENV = "development" }
```

## Environment Variables

### Required Variables per Environment

| Variable | Dev | Staging | Production | Description |
|----------|-----|---------|------------|-------------|
| NODE_ENV | development | staging | production | Node environment |
| VITE_API_ENV | development | staging | production | API environment |
| VITE_DCS_BASE_URL | https://git.door43.org | https://git.door43.org | https://git.door43.org | DCS API base |
| VITE_ENABLE_DEBUG | true | true | false | Debug logging |

## Rollback Procedures

### Quick Rollback (< 5 minutes)
1. Use Netlify dashboard "Rollback" feature
2. Select previous successful deployment
3. Click "Publish deploy"

### Branch Rollback
```bash
# Identify last known good commit
git log --oneline -10

# Revert to specific commit
git checkout production
git reset --hard <commit-hash>
git push --force-with-lease origin production
```

### Emergency Procedures
1. Immediate rollback via Netlify dashboard
2. Create hotfix branch from last known good commit
3. Apply minimal fix
4. Fast-track through staging to production

## Monitoring and Alerts

### Deployment Notifications
- Slack integration for deployment status
- Email notifications for failed builds
- GitHub status checks

### Health Checks
- Netlify Analytics for performance
- Error tracking integration
- Uptime monitoring

## Testing Requirements

### Per Environment

#### Development
- Unit tests must pass
- Linting checks
- Basic integration tests

#### Staging
- Full test suite
- E2E tests with Playwright
- Performance benchmarks
- Accessibility audit

#### Production
- Smoke tests post-deployment
- Critical path verification
- Performance monitoring

## Release Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] Documentation updated
- [ ] PR approved

### Post-deployment
- [ ] Verify deployment successful
- [ ] Run smoke tests
- [ ] Check error monitoring
- [ ] Update release notes
- [ ] Tag release in git

## Team Responsibilities

### Developers
- Feature development on feature branches
- Create PRs to dev branch
- Ensure tests pass

### QA Team
- Test features in dev environment
- Approve promotion to staging
- Execute test plans in staging

### DevOps/Release Manager
- Manage branch promotions
- Monitor deployments
- Handle rollbacks if needed

### Product Owner
- Approve staging → production promotions
- Sign off on releases

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Netlify
   - Verify environment variables
   - Check for missing dependencies

2. **Deploy Preview Issues**
   - Ensure branch is up to date
   - Check for merge conflicts
   - Verify netlify.toml syntax

3. **Environment Mismatch**
   - Verify environment variables
   - Check API endpoints
   - Confirm build context

## References

- [Netlify Branch Deploys Documentation](https://docs.netlify.com/site-deploys/overview/#branch-deploys)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
- [Git Flow Best Practices](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
