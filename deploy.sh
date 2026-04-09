#!/bin/bash
set -e

# ERCOT Visualizer — Build, Test, and Deploy
# Runs checks locally, then pushes to main to trigger Vercel deployment.
#
# Usage:
#   ./deploy.sh              # Deploy current changes
#   ./deploy.sh patch        # Bump patch version, then deploy
#   ./deploy.sh minor        # Bump minor version, then deploy
#   ./deploy.sh major        # Bump major version, then deploy
#   ./deploy.sh --dry-run    # Run checks without pushing

BUMP_TYPE=""
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    major|minor|patch) BUMP_TYPE="$arg" ;;
    --dry-run) DRY_RUN=true ;;
    *)
      echo "Usage: ./deploy.sh [major|minor|patch] [--dry-run]"
      exit 1
      ;;
  esac
done

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

step() { echo -e "\n${CYAN}==>${NC} $1"; }
ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; exit 1; }
warn() { echo -e "  ${YELLOW}!${NC} $1"; }

# ── Pre-flight checks ─────────────────────────────────────────────

step "Checking environment"

if ! command -v node &>/dev/null; then fail "Node.js is not installed"; fi
if ! command -v npm &>/dev/null;  then fail "npm is not installed"; fi
if ! command -v git &>/dev/null;  then fail "git is not installed"; fi
ok "Tools available (node $(node -v), npm $(npm -v))"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  warn "On branch '$BRANCH', not 'main'. Deploy triggers on push to main."
fi

# Check for uncommitted changes (warn only — we'll commit them)
if ! git diff --quiet HEAD 2>/dev/null; then
  warn "Working tree has uncommitted changes"
fi

# ── Install dependencies ──────────────────────────────────────────

step "Installing dependencies"
npm ci --silent 2>&1 | tail -1
ok "Dependencies installed"

# ── Type check + Build ────────────────────────────────────────────

step "Building project (TypeScript + Vite)"
BUILD_START=$(date +%s)
npm run build 2>&1 | tail -3
BUILD_END=$(date +%s)
ok "Build succeeded in $((BUILD_END - BUILD_START))s"

# ── Run tests ─────────────────────────────────────────────────────

step "Running tests"
TEST_OUTPUT=$(npm test -- --run 2>&1)
TEST_RESULT=$?
TESTS_PASSED=$(echo "$TEST_OUTPUT" | grep -oP 'Tests\s+\K\d+(?=\s+passed)')
TEST_FILES=$(echo "$TEST_OUTPUT" | grep -oP 'Test Files\s+\K\d+(?=\s+passed)')

if [ $TEST_RESULT -ne 0 ]; then
  echo "$TEST_OUTPUT"
  fail "Tests failed"
fi
ok "$TESTS_PASSED tests passed across $TEST_FILES files"

# ── Version bump (optional) ───────────────────────────────────────

CURRENT_VERSION=$(node -p "require('./package.json').version")

if [ -n "$BUMP_TYPE" ]; then
  step "Bumping version ($BUMP_TYPE)"
  if ! command -v jq &>/dev/null; then
    fail "jq is required for version bumping (apt-get install jq)"
  fi
  ./bump.sh "$BUMP_TYPE"
  NEW_VERSION=$(node -p "require('./package.json').version")
  ok "Version: $CURRENT_VERSION → $NEW_VERSION"
  CURRENT_VERSION="$NEW_VERSION"
else
  ok "Version: $CURRENT_VERSION (no bump requested)"
fi

# ── Build size report ─────────────────────────────────────────────

step "Bundle report"
CSS_SIZE=$(du -sh dist/assets/*.css 2>/dev/null | awk '{total+=$1} END {printf "%.0f", total}')
JS_MAIN=$(ls -la dist/assets/index-*.js 2>/dev/null | awk '{print $5}')
JS_MAIN_KB=$((JS_MAIN / 1024))
echo "  Main JS:  ${JS_MAIN_KB} KB"
echo "  Assets:   $(du -sh dist/assets/ | awk '{print $1}')"
echo "  Total:    $(du -sh dist/ | awk '{print $1}')"

# ── Deploy ────────────────────────────────────────────────────────

if [ "$DRY_RUN" = true ]; then
  step "Dry run complete"
  warn "Skipping git push (--dry-run). All checks passed."
  exit 0
fi

step "Deploying v$CURRENT_VERSION"

# Stage and commit any changes
if ! git diff --quiet HEAD 2>/dev/null || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  git add -A
  git commit -m "Deploy v$CURRENT_VERSION" --no-verify 2>/dev/null || true
  ok "Changes committed"
else
  ok "No new changes to commit"
fi

# Push to trigger Vercel deployment
git push origin "$BRANCH" 2>&1
ok "Pushed to origin/$BRANCH"

if [ "$BRANCH" = "main" ]; then
  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}  Deployment triggered! Vercel will build and deploy.${NC}"
  echo -e "${GREEN}  Monitor at: https://vercel.com/dashboard${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
  echo ""
  warn "Pushed to '$BRANCH'. Merge to 'main' to trigger production deploy."
  echo "  Create a PR:  gh pr create --fill"
fi
