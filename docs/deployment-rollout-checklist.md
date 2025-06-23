# Deployment Rollout Checklist

## Pre-Implementation Verification

### 1. Current State Assessment
- [ ] Verify you're currently on `refactor` branch
- [ ] Confirm Netlify site is connected to this repository
- [ ] Check current production URL works

### 2. Required Access
- [ ] Admin access to GitHub repository
- [ ] Admin access to Netlify dashboard
- [ ] Ability to modify repository settings

## Implementation Steps

### Phase 1: Create Branches (5 minutes)

```bash
# From your current refactor branch
git checkout refactor
git pull origin refactor

# Create new branches based on current state
git checkout -b production
git push -u origin production

git checkout -b staging  
git push -u origin staging

git checkout -b dev
git push -u origin dev

# Return to refactor branch
git checkout refactor
```

### Phase 2: Netlify Configuration (10 minutes)

1. **Login to Netlify Dashboard**
   - https://app.netlify.com
   - Select your translation-helps site

2. **Update Production Branch**
   - Site settings → Build & deploy → Continuous deployment
   - Change "Production branch" from `refactor` to `production`
   - Save

3. **Enable Branch Deploys**
   - Same section, find "Branch deploys"
   - Click "Edit settings"
   - Select "All" or manually add: `dev`, `staging`
   - Save

4. **Verify Deploy Contexts**
   - The netlify.toml we created will automatically handle contexts
   - No additional configuration needed

### Phase 3: Initial Deployments (15 minutes)

1. **Deploy to Production**
   ```bash
   git checkout production
   git merge refactor
   git push origin production
   ```
   - Wait for Netlify to deploy
   - Verify site works at main URL

2. **Deploy to Staging**
   ```bash
   git checkout staging
   git merge production
   git push origin staging
   ```
   - Verify at: https://staging--translation-helps.netlify.app

3. **Deploy to Dev**
   ```bash
   git checkout dev
   git merge staging
   git push origin dev
   ```
   - Verify at: https://dev--translation-helps.netlify.app

### Phase 4: GitHub Protection Rules (10 minutes)

1. **Go to Repository Settings**
   - Settings → Branches → Add rule

2. **Protect Production Branch**
   - Pattern: `production`
   - Enable: Require pull request reviews
   - Enable: Require status checks
   - Save

3. **Protect Staging Branch** (Optional)
   - Pattern: `staging`
   - Enable: Require status checks
   - Save

### Phase 5: Update Documentation (5 minutes)

1. **Update README.md**
   ```bash
   git checkout dev
   # Edit README.md to mention branch strategy
   git add README.md
   git commit -m "docs: add deployment branch information"
   git push origin dev
   ```

2. **Create PR Template** (Optional)
   ```bash
   mkdir -p .github
   echo "## Deployment Checklist
   - [ ] Tests pass locally
   - [ ] Version bumped if needed
   - [ ] CHANGELOG updated
   - [ ] No console errors" > .github/pull_request_template.md
   git add .github/pull_request_template.md
   git commit -m "chore: add PR template"
   git push origin dev
   ```

## Verification Steps

### 1. Check All Environments
- [ ] Production: https://translation-helps.netlify.app (or your custom domain)
- [ ] Staging: https://staging--translation-helps.netlify.app
- [ ] Dev: https://dev--translation-helps.netlify.app

### 2. Test Deployment Flow
- [ ] Make small change in dev branch
- [ ] Verify auto-deploy to dev environment
- [ ] Use promotion script to move to staging
- [ ] Create PR from staging to production
- [ ] Verify PR checks and protection rules work

### 3. Environment Variables
- [ ] Check each environment shows correct API_ENV in console
- [ ] Verify debug mode enabled/disabled appropriately

## Potential Issues & Solutions

### Issue: Branch URLs Not Working
**Solution**: 
- Wait 2-3 minutes for DNS propagation
- Check Netlify dashboard for build status
- Ensure branch exists on GitHub

### Issue: Old refactor Branch Still Deploying
**Solution**:
- Double-check production branch setting in Netlify
- Clear build cache and trigger redeploy

### Issue: Protection Rules Not Working
**Solution**:
- Ensure you're repository admin
- Check exact branch name spelling
- Try removing and re-adding rules

### Issue: Scripts Not Executable
**Solution**:
```bash
chmod +x scripts/deployment/*.sh
git add scripts/deployment/*.sh
git commit -m "fix: make deployment scripts executable"
```

## Post-Implementation

### 1. Team Communication
- [ ] Notify team of new branch strategy
- [ ] Share quick reference guide
- [ ] Schedule brief training session

### 2. Update CI/CD
- [ ] Update any GitHub Actions to use new branches
- [ ] Update any external integrations

### 3. Clean Up
- [ ] Archive or delete old `refactor` branch (after confirming everything works)
- [ ] Update any bookmarks to new URLs

## Time Estimate

- **Total Time**: ~45 minutes
- **Active Work**: ~30 minutes  
- **Waiting Time**: ~15 minutes (for deployments)

## Success Criteria

✅ All three environments accessible via their URLs
✅ Changes to dev branch auto-deploy to dev environment
✅ Protection rules prevent direct pushes to production
✅ Team can follow documented procedures
✅ Rollback procedures tested and working

---

**Note**: This is a one-time setup. Once complete, daily operations will follow the quick reference guide.
