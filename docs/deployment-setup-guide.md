# Deployment Environment Setup Guide

## Initial Setup (One-time)

### 1. Create Required Branches

```bash
# Ensure you're on the latest master
git checkout master
git pull origin master

# Create production branch
git checkout -b production
git push -u origin production

# Create staging branch
git checkout -b staging
git push -u origin staging

# Create dev branch
git checkout -b dev
git push -u origin dev
```

### 2. Configure Netlify

1. **Login to Netlify Dashboard**
   - Go to: https://app.netlify.com
   - Select your site

2. **Configure Branch Deploys**
   - Go to: Site settings → Build & deploy → Continuous deployment
   - Under "Branch deploys", click "Edit settings"
   - Add branches: `dev`, `staging`, `production`
   - Save changes

3. **Set Production Branch**
   - In same section, under "Production branch"
   - Change from `master` to `production`
   - Save changes

4. **Configure Deploy Contexts**
   - Netlify will automatically use the contexts from netlify.toml
   - Verify in deploy logs that correct context is used

### 3. GitHub Branch Protection

1. **Go to Repository Settings**
   - Navigate to: Settings → Branches
   - Click "Add rule"

2. **Master Branch Protection**
   ```
   Branch name pattern: master
   - ✅ Require pull request reviews (2)
   - ✅ Dismiss stale pull request approvals
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Include administrators
   - ✅ Restrict who can push (only admins)
   ```

3. **Production Branch Protection**
   ```
   Branch name pattern: production
   - ✅ Require pull request reviews (1)
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - Status checks: "netlify/translation-helps/deploy-preview"
   ```

4. **Staging Branch Protection**
   ```
   Branch name pattern: staging
   - ✅ Require status checks to pass
   - Status checks: "build", "test"
   ```

### 4. Environment Variables

1. **In Netlify Dashboard**
   - Go to: Site settings → Environment variables
   - Add variables for each deploy context

2. **Required Variables**
   ```bash
   # All environments
   VITE_DCS_BASE_URL="https://git.door43.org"
   
   # Production only
   NODE_ENV="production"
   VITE_API_ENV="production"
   VITE_ENABLE_DEBUG="false"
   
   # Staging only
   NODE_ENV="staging"
   VITE_API_ENV="staging"
   VITE_ENABLE_DEBUG="true"
   
   # Dev only
   NODE_ENV="development"
   VITE_API_ENV="development"
   VITE_ENABLE_DEBUG="true"
   ```

### 5. Verify Setup

1. **Check Branch Deploys**
   ```bash
   # Make a small change in each branch
   git checkout dev
   echo "# Dev Test" >> README.md
   git commit -am "test: dev deploy"
   git push origin dev
   
   # Check Netlify dashboard for:
   # https://dev--translation-helps.netlify.app
   ```

2. **Verify Environment Variables**
   - Open browser console on each environment
   - Check for correct API_ENV value
   - Verify debug mode is enabled/disabled

3. **Test Protection Rules**
   - Try to push directly to protected branches (should fail)
   - Create PR to protected branch (should require reviews)

### 6. Team Access Setup

1. **Netlify Team Members**
   - Invite team: Team settings → Members
   - Assign roles:
     - Developers: Developer role
     - QA: Developer role
     - DevOps: Owner/Admin role

2. **GitHub Access**
   - Add team members to repository
   - Configure team permissions:
     - Developers: Write access
     - QA: Write access
     - Release managers: Admin access

### 7. Monitoring Setup

1. **Netlify Notifications**
   - Go to: Site settings → Build & deploy → Deploy notifications
   - Add notifications for:
     - Deploy started
     - Deploy succeeded
     - Deploy failed
   - Configure Slack/Email webhooks

2. **GitHub Actions** (if applicable)
   - Ensure workflows run on correct branches
   - Add branch filters to workflows:
   ```yaml
   on:
     push:
       branches: [dev, staging, production]
     pull_request:
       branches: [dev, staging, production]
   ```

### 8. Documentation Updates

1. **Update README.md**
   - Add deployment badge status
   - Update contribution guidelines
   - Add branch strategy explanation

2. **Create .env.example**
   ```bash
   # Local development environment
   VITE_DCS_BASE_URL=https://git.door43.org
   VITE_API_ENV=development
   VITE_ENABLE_DEBUG=true
   ```

## Troubleshooting Setup Issues

### Branch Deploy Not Working
- Verify branch exists on GitHub
- Check Netlify branch deploy settings
- Look for build errors in Netlify logs

### Environment Variables Not Loading
- Check variable names (VITE_ prefix for Vite)
- Verify deploy context in netlify.toml
- Clear build cache and redeploy

### Protection Rules Not Enforced
- Ensure you're pushing to GitHub (not local)
- Check rule patterns match exactly
- Verify user permissions

## Next Steps

After setup is complete:

1. Run through a complete deployment cycle
2. Document any custom configurations
3. Train team on new workflow
4. Set up monitoring dashboards
5. Schedule regular deployment reviews

---

For questions or issues, contact the DevOps team.
