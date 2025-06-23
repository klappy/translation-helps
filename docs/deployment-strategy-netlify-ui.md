# Deployment Strategy - Netlify UI Configuration

## Crisis Resolution: Safe Deployment Strategy

After discovering that modifying netlify.toml caused build failures, we've developed a safer approach using Netlify's dashboard configuration instead of file changes.

## Why Netlify UI Instead of File Configuration?

1. **Original netlify.toml is hand-tuned** - Extensive debugging went into the current config
2. **Undocumented Netlify behaviors** - Some settings work differently than documented
3. **NODE_ENV intentionally set to "development"** - Even in production (critical for build)
4. **Simple build process** - No test integration, minimal complexity
5. **Safer to iterate** - UI changes can be reverted instantly

## Deployment Strategy Using Netlify Dashboard

### Branch Structure (Already Created ✅)
- **dev** → Development environment
- **staging** → QA testing environment  
- **production** → Live production environment
- **master** → Protected reference branch

### Configuration Steps

#### Step 1: Set Production Branch
1. **Netlify Dashboard** → Your Site → **Site Settings**
2. **Build & deploy** → **Continuous Deployment**
3. **Production branch**: Change from `refactor` to `production`
4. **Save**

#### Step 2: Enable Branch Deploys
1. Same section: **Branch deploys**
2. **Edit settings**
3. **Deploy only these branches**: Add `dev`, `staging`
4. **Save**

#### Step 3: Configure Environment Variables (Per Branch)
1. **Site Settings** → **Environment variables**
2. **Add variable** → **Choose scopes**

**For Production Branch:**
```
VITE_API_ENV = "production" (Scopes: Production)
VITE_ENABLE_DEBUG = "false" (Scopes: Production)
```

**For Staging Branch:**
```
VITE_API_ENV = "staging" (Scopes: staging branch)
VITE_ENABLE_DEBUG = "true" (Scopes: staging branch)
```

**For Dev Branch:**
```
VITE_API_ENV = "development" (Scopes: dev branch)
VITE_ENABLE_DEBUG = "true" (Scopes: dev branch)
```

#### Step 4: Build Commands (Optional - Advanced)
If you need different build commands per environment:

1. **Site Settings** → **Build & deploy** → **Build settings**
2. **Edit settings** → **Branch deploys**
3. Configure per branch:
   - **Production**: `yarn install && yarn run build`
   - **Staging**: `yarn install && yarn run build`
   - **Dev**: `yarn install && yarn run build`

**Note**: Keep it simple! The original doesn't run tests during build.

## Deployment URLs

Once configured, you'll have:

- **Production**: https://translation-helps.netlify.app
- **Staging**: https://staging--translation-helps.netlify.app
- **Dev**: https://dev--translation-helps.netlify.app

## Deployment Workflow

### Daily Development
```bash
# Work on feature branch
git checkout -b feature/my-feature
# Make changes, commit
git push origin feature/my-feature

# Create PR to dev branch
# Merge PR → Automatically deploys to dev environment
```

### Promotion to Staging
```bash
git checkout staging
git merge dev
git push origin staging
# Automatically deploys to staging environment
```

### Production Release
```bash
# Create PR from staging to production
# Get approval, merge PR
# Automatically deploys to production
```

## Key Advantages of This Approach

1. **Preserves working netlify.toml** - No risk of breaking builds
2. **Granular control** - Different settings per branch
3. **Easy to modify** - Change environment variables without code commits
4. **Instant rollback** - Revert changes in UI immediately
5. **Visual feedback** - See deployment status in dashboard

## Troubleshooting

### Build Still Failing?
1. Check **Deploy logs** in Netlify dashboard
2. Verify **Environment variables** are set correctly
3. Ensure **Branch names** match exactly
4. Clear **Build cache** and retry

### Environment Variables Not Working?
1. Check **Variable scopes** match branch names
2. Verify **VITE_** prefix for client-side variables
3. **Redeploy** after changing variables

### Branch Not Deploying?
1. Verify branch exists on GitHub
2. Check **Branch deploy settings** in Netlify
3. Ensure **Build command** is correct

## Testing the Setup

1. **Make small change** in dev branch
2. **Push to GitHub**
3. **Verify deploy** in Netlify dashboard
4. **Check environment** at dev URL
5. **Repeat for staging** and production

## Migration Path

This approach gives you all the benefits of multi-environment deployment without the risk of breaking your carefully tuned build process.

**The netlify.toml stays unchanged and working.**
**All environment-specific configuration happens in the UI.**
**Your deployment branches are ready to use.**

## Next Steps

1. ✅ Branches created and fixed
2. 🔄 Configure Netlify UI settings (10 minutes)
3. 🧪 Test deployment to dev environment
4. 🚀 Promote through staging to production

You now have a robust deployment strategy that respects your existing, working configuration!
