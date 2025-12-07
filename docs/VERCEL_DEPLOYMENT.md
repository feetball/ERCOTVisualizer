# Vercel Configuration Guide

This project is configured for deployment on Vercel with automatic CI/CD via GitHub Actions.

## Quick Start

### Option 1: Vercel Dashboard (Easiest)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `feetball/ERCOTVisualizer`
3. Vercel will auto-detect the Vite framework
4. Click "Deploy"

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

## Environment Variables

Configure in Vercel Dashboard → Project → Settings → Environment Variables

### Required Variables

| Variable | Production | Preview | Description |
|----------|-----------|---------|-------------|
| `VITE_USE_MOCK_DATA` | `true` | `true` | Use ERCOT simulation data |
| `VITE_PI_WEB_API_URL` | - | - | PI Web API URL (only if mock=false) |

### Adding Variables

**Via Dashboard:**
1. Navigate to Settings → Environment Variables
2. Add each variable with values for:
   - Production (applies to main branch)
   - Preview (applies to PRs and other branches)
   - Development (local dev, optional)

**Via CLI:**
```bash
vercel env add VITE_USE_MOCK_DATA production
# Enter value: true

vercel env add VITE_USE_MOCK_DATA preview
# Enter value: true
```

## GitHub Actions Setup

The repo includes `.github/workflows/vercel-deploy.yml` for automatic deployments.

### Required GitHub Secrets

Add these in: Repository → Settings → Secrets and variables → Actions

1. **VERCEL_TOKEN**
   - Get from: https://vercel.com/account/tokens
   - Create a new token with full access

2. **VERCEL_ORG_ID** and **VERCEL_PROJECT_ID**
   ```bash
   # Link your project first
   vercel link
   
   # Get IDs from the generated file
   cat .vercel/project.json
   ```
   - Copy `orgId` → `VERCEL_ORG_ID`
   - Copy `projectId` → `VERCEL_PROJECT_ID`

### Workflow Behavior

- **Push to `main`**: Deploys to production
- **Pull Request**: Creates preview deployment and comments PR with URL
- **Other branches**: No automatic deployment

### Manual Workflow Trigger

```bash
# Push changes
git add .
git commit -m "Update deployment"
git push

# Or create a PR
git checkout -b feature/new-widget
git push -u origin feature/new-widget
# Create PR on GitHub
```

## Advanced Configuration

### Custom Domain

**Via Dashboard:**
1. Project → Settings → Domains
2. Add your domain
3. Configure DNS (Vercel provides instructions)

**Via CLI:**
```bash
vercel domains add yourdomain.com
```

### Performance & Caching

The `vercel.json` includes optimized caching headers:
- Static assets (CSS, JS, images): 1 year cache
- HTML: No cache (always fresh)

### Regions

Default deployment region: `iad1` (Washington, D.C.)

To change, edit `vercel.json`:
```json
{
  "regions": ["sfo1", "iad1"]
}
```

Available regions: https://vercel.com/docs/concepts/edge-network/regions

## Troubleshooting

### Build Fails

Check build logs in Vercel Dashboard:
1. Project → Deployments
2. Click on failed deployment
3. View build logs

Common issues:
- **TypeScript errors**: Run `npm run build` locally first
- **Missing dependencies**: Check `package.json`
- **Environment variables**: Ensure all required vars are set

### Preview URL Not Working

- Verify GitHub Action secrets are set correctly
- Check workflow run logs in GitHub → Actions tab
- Ensure Vercel project is linked to the correct repository

### Environment Variables Not Applied

- Environment variables are build-time, not runtime
- Must redeploy after changing env vars
- Prefix Vite variables with `VITE_`

## Local Testing of Production Build

```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview

# Or use Vercel CLI
vercel dev
```

## Cost & Limits

**Free Tier (Hobby):**
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Preview deployments

**Pro Tier:**
- Commercial use
- Team collaboration
- 1 TB bandwidth/month
- Advanced analytics

See: https://vercel.com/pricing

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite on Vercel](https://vercel.com/docs/frameworks/vite)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)
