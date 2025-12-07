#!/bin/bash

# Version bump script for ERCOTVisualizer
# Usage: ./bump.sh [major|minor|patch]
# Default: minor

BUMP_TYPE="${1:-minor}"

if [[ ! "$BUMP_TYPE" =~ ^(major|minor|patch)$ ]]; then
  echo "Error: Invalid bump type. Use: major, minor, or patch"
  echo "Usage: ./bump.sh [major|minor|patch]"
  exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not installed."
  echo "Install with: sudo apt-get install jq  (or brew install jq on macOS)"
  exit 1
fi

# Read current version
CURRENT_VERSION=$(jq -r '.version' package.json)
echo "Current version: $CURRENT_VERSION"

# Split version into parts
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

# Bump the appropriate part
case "$BUMP_TYPE" in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  patch)
    PATCH=$((PATCH + 1))
    ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
echo "New version: $NEW_VERSION"

# Update package.json
jq --arg version "$NEW_VERSION" '.version = $version' package.json > package.json.tmp
mv package.json.tmp package.json

echo "✓ Version bumped to $NEW_VERSION"
echo ""
echo "Next steps:"
echo "  git add package.json"
echo "  git commit -m 'Bump version to $NEW_VERSION'"
echo "  git push"
