# Deployment Quick Reference

## Branch URLs (once configured in Netlify)
- **Dev**: https://dev--translation-helps.netlify.app
- **Staging**: https://staging--translation-helps.netlify.app  
- **Production**: https://translation-helps.netlify.app

## Common Commands

### Start New Feature
```bash
git checkout dev
git pull origin dev
git checkout -b feature/my-feature
```

### Deploy to Dev
```bash
git push origin feature/my-feature
# Create PR to dev branch on GitHub
# Merge PR (auto-deploys to dev)
```

### Promote to Staging
```bash
git checkout staging
git pull origin staging
git merge dev
git push origin staging
# Auto-deploys to staging
```

### Release to Production
```bash
# Create PR from staging to production on GitHub
# Get approval
# Merge PR (auto-deploys to production)
```

### Emergency Rollback
1. Go to Netlify Dashboard
2. Select site → Deploys
3. Find last working deploy
4. Click "..." → "Publish deploy"

### Version & Tag Release
```bash
# After production deploy succeeds
git checkout master
git merge production
npm version patch  # or minor/major
git push origin master --tags
```

## Environment Variables Quick Check
```bash
# Local development
cp .env.example .env.local
# Edit .env.local with your values

# Netlify environments are set in:
# Site settings → Environment variables
```

## Pre-deployment Checklist
- [ ] Tests pass: `yarn test`
- [ ] Build works: `yarn build`
- [ ] Version bumped: `package.json`
- [ ] Changelog updated: `CHANGELOG.md`
- [ ] No console errors in browser

## Branch Protection Setup (GitHub)
1. Go to Settings → Branches
2. Add rule for: `master`, `production`, `staging`
3. Enable:
   - Require PR reviews
   - Require status checks
   - Require up-to-date branches

## Monitoring Links
- Netlify Dashboard: https://app.netlify.com
- GitHub Actions: Check repo Actions tab
- Deploy Logs: Netlify → Deploys → View logs

## Who to Contact
- Dev issues: Development team lead
- Staging approval: QA team lead  
- Production release: Product owner
- Emergency: DevOps on-call

## Common Issues

### Build Failed
- Check Netlify deploy log
- Verify all env vars are set
- Run `yarn build` locally

### Wrong Environment
- Check VITE_API_ENV in Netlify
- Clear browser cache
- Verify branch context in netlify.toml

### Slow Deploys
- Check build command efficiency
- Consider caching dependencies
- Review asset optimization
