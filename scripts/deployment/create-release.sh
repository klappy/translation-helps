#!/bin/bash
# Create a production release with proper tagging

set -e

echo "🎯 Translation Helps - Create Production Release"
echo "=============================================="

# Check if we have uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: You have uncommitted changes. Please commit or stash them."
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📌 Current version: $CURRENT_VERSION"

# Ask for version bump type
echo ""
echo "Select version bump type:"
echo "1) Patch (bug fixes) - X.X.+1"
echo "2) Minor (new features) - X.+1.0"
echo "3) Major (breaking changes) - +1.0.0"
read -p "Enter choice (1-3): " VERSION_TYPE

case $VERSION_TYPE in
    1) VERSION_BUMP="patch";;
    2) VERSION_BUMP="minor";;
    3) VERSION_BUMP="major";;
    *) echo "❌ Invalid choice"; exit 1;;
esac

# Update version
echo "📝 Updating version..."
npm version $VERSION_BUMP --no-git-tag-version

NEW_VERSION=$(node -p "require('./package.json').version")
echo "✨ New version: $NEW_VERSION"

# Update CHANGELOG
echo "📋 Updating CHANGELOG..."
TODAY=$(date +%Y-%m-%d)
cat > CHANGELOG.tmp.md << EOL
# Changelog

## [$NEW_VERSION] - $TODAY

### Added
- [Add new features here]

### Changed
- [Add changes here]

### Fixed
- [Add bug fixes here]

EOL

# Append existing changelog
tail -n +2 CHANGELOG.md >> CHANGELOG.tmp.md 2>/dev/null || true
mv CHANGELOG.tmp.md CHANGELOG.md

echo "⚠️  Please edit CHANGELOG.md to add release notes"
echo "Press enter when done..."
read

# Commit version bump
git add package.json CHANGELOG.md
git commit -m "chore: bump version to $NEW_VERSION"

# Create and push tag
git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"

echo ""
echo "✅ Release prepared!"
echo ""
echo "Next steps:"
echo "1. Push changes: git push origin $(git branch --show-current)"
echo "2. Push tag: git push origin v$NEW_VERSION"
echo "3. Create PR from staging to production"
echo "4. After merge, production will auto-deploy"
echo ""
echo "🎉 Version $NEW_VERSION is ready for release!"
