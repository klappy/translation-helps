#!/bin/bash
# Emergency rollback script for production issues

set -e

echo "🚨 EMERGENCY ROLLBACK PROCEDURE 🚨"
echo "================================="
echo ""
echo "⚠️  This will rollback production to a previous version"
echo "⚠️  Use only in case of critical production issues"
echo ""

# Confirm action
read -p "Are you sure you want to rollback production? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Rollback cancelled"
    exit 0
fi

echo ""
echo "Choose rollback method:"
echo "1) Netlify Dashboard Rollback (Recommended - Instant)"
echo "2) Git Rollback (Manual - Requires new deployment)"
read -p "Enter choice (1-2): " METHOD

if [ "$METHOD" == "1" ]; then
    echo ""
    echo "📋 Netlify Dashboard Rollback Instructions:"
    echo "1. Go to: https://app.netlify.com"
    echo "2. Select: translation-helps site"
    echo "3. Navigate to: Deploys tab"
    echo "4. Find the last working deployment (green checkmark)"
    echo "5. Click the '...' menu → 'Publish deploy'"
    echo "6. Confirm the rollback"
    echo ""
    echo "⏱️  Rollback will be instant (< 1 minute)"
    echo ""
    echo "After rollback:"
    echo "- Document the issue in CHANGELOG.md"
    echo "- Create hotfix branch from last working commit"
    echo "- Fix the issue and test thoroughly"
    exit 0
fi

if [ "$METHOD" == "2" ]; then
    echo ""
    echo "🔍 Fetching recent production commits..."
    git fetch origin production
    git log origin/production --oneline -10
    
    echo ""
    read -p "Enter commit hash to rollback to: " COMMIT_HASH
    
    # Verify commit exists
    if ! git cat-file -e $COMMIT_HASH^{commit} 2>/dev/null; then
        echo "❌ Invalid commit hash"
        exit 1
    fi
    
    echo ""
    echo "⚠️  This will:"
    echo "- Reset production branch to: $COMMIT_HASH"
    echo "- Force push to origin"
    echo "- Trigger new deployment"
    echo ""
    read -p "Continue? (yes/no): " FINAL_CONFIRM
    
    if [ "$FINAL_CONFIRM" != "yes" ]; then
        echo "❌ Rollback cancelled"
        exit 0
    fi
    
    # Perform rollback
    git checkout production
    git pull origin production
    git reset --hard $COMMIT_HASH
    
    # Create rollback tag
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    git tag -a "rollback-$TIMESTAMP" -m "Emergency rollback to $COMMIT_HASH"
    
    # Force push (with lease for safety)
    git push --force-with-lease origin production
    git push origin "rollback-$TIMESTAMP"
    
    echo ""
    echo "✅ Git rollback complete!"
    echo "🚀 New deployment triggered"
    echo "📊 Monitor at: https://app.netlify.com"
    echo ""
    echo "Next steps:"
    echo "1. Monitor deployment completion"
    echo "2. Verify site is working"
    echo "3. Create hotfix branch from $COMMIT_HASH"
    echo "4. Document incident in post-mortem"
fi

echo ""
echo "📝 Don't forget to:"
echo "- Notify the team about the rollback"
echo "- Document the issue that caused the rollback"
echo "- Plan the fix and testing strategy"
