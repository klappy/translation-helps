#!/bin/bash
# Promote dev to staging with safety checks

set -e

echo "🚀 Translation Helps - Promote to Staging"
echo "========================================"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "dev" ]; then
    echo "❌ Error: You must be on the 'dev' branch to promote to staging"
    echo "Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Ensure dev is up to date
echo "📥 Updating dev branch..."
git pull origin dev

# Run tests
echo "🧪 Running tests..."
yarn test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Fix issues before promoting to staging."
    exit 1
fi

# Build check
echo "�� Checking build..."
yarn build
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix issues before promoting to staging."
    exit 1
fi

# Switch to staging
echo "🔄 Switching to staging branch..."
git checkout staging
git pull origin staging

# Merge dev into staging
echo "🔀 Merging dev into staging..."
git merge dev -m "Promote dev to staging"

# Push to staging
echo "📤 Pushing to staging..."
git push origin staging

echo "✅ Successfully promoted to staging!"
echo "🌐 Deployment will begin at: https://staging--translation-helps.netlify.app"
echo ""
echo "Next steps:"
echo "1. Monitor deployment in Netlify dashboard"
echo "2. Run QA tests on staging environment"
echo "3. If all tests pass, create PR to production"

# Return to dev branch
git checkout dev
