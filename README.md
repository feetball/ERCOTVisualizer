# ERCOT Visualizer

Real-time ERCOT grid monitoring dashboard built with Vue 3, Vuetify, and ApexCharts.

## Features

- **Real-time Grid Data**: Simulated ERCOT grid data including frequency, demand, generation by fuel type
- **Responsive Design**: Works on mobile devices, desktops, and large displays
- **Drag-and-Drop Widgets**: Customizable dashboard layout with stat, gauge, chart, and stacked chart widgets
- **Edit Mode**: Toggle edit mode to add, remove, or rearrange widgets
- **Dark/Light Theme**: Toggle between dark and light themes
- **Auto-refresh**: Automatic data refresh with status bar indicators

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vuetify 3** - Material Design component library
- **ApexCharts** - Modern charting library
- **grid-layout-plus** - Draggable and resizable grid layout
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/feetball/ERCOTVisualizer.git
cd ERCOTVisualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

### Docker

```bash
# Build the Docker image
docker build -t ercot-visualizer .

# Run the container
docker run -p 8080:80 ercot-visualizer
```

### Kubernetes / Helm

```bash
# Install with Helm
helm install ercot-visualizer ./charts/ercot-visualizer

# Or with custom values
helm install ercot-visualizer ./charts/ercot-visualizer -f my-values.yaml
```

### Vercel Deployment

Vercel can deploy this app directly from GitHub.

#### Manual Deployment (Vercel Dashboard)

1. Import repository https://github.com/feetball/ERCOTVisualizer
2. Configure project:
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist`
   - Framework Preset: `Vite`
3. Add Environment Variables (Dashboard → Settings → Environment Variables):
   - `VITE_USE_MOCK_DATA` = `true` (or `false` for real PI API)
   - `VITE_PI_WEB_API_URL` = `https://your-pi-server/piwebapi` (only if mock=false)
4. Deploy

#### CLI Deployment

```bash
npm i -g vercel
vercel login
vercel --prod
```

#### Automated GitHub Actions Deployment

The repository includes a GitHub Action workflow (`.github/workflows/vercel-deploy.yml`) that automatically deploys to Vercel on push/PR.

**Setup:**

1. Install Vercel CLI and link your project:
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   ```

2. Get your Vercel credentials:
   ```bash
   # Get your Vercel token from https://vercel.com/account/tokens
   # Get org and project IDs:
   cat .vercel/project.json
   ```

3. Add GitHub Secrets (Repository → Settings → Secrets and variables → Actions):
   - `VERCEL_TOKEN` - Your Vercel API token
   - `VERCEL_ORG_ID` - From `.vercel/project.json`
   - `VERCEL_PROJECT_ID` - From `.vercel/project.json`

4. Push to main branch or create a PR - automatic deployment will trigger

**Environment Variables:**

Set these in Vercel Dashboard (not GitHub Secrets):
- Production: `VITE_USE_MOCK_DATA=true`
- Preview: `VITE_USE_MOCK_DATA=true`


## Project Structure

```
├── src/
│   ├── components/
│   │   ├── common/          # Shared components (TimeSelector)
│   │   ├── dashboard/       # Widget components (Stat, Gauge, Chart, etc.)
│   │   └── designer/        # Widget configuration dialogs
│   ├── services/
│   │   ├── dataService.ts   # Data fetching service
│   │   └── ercotService.ts  # ERCOT grid simulation
│   ├── views/               # Page components
│   ├── router/              # Vue Router configuration
│   └── plugins/             # Vuetify plugin setup
├── charts/                  # Helm charts for Kubernetes
├── Dockerfile              # Docker build configuration
└── nginx.conf              # Nginx configuration for production
```

## Available Widgets

- **Stat Widget**: Grafana-style stat with sparkline and trend indicator
- **Gauge Widget**: Radial gauge for percentage-based metrics
- **Chart Widget**: Time series line chart
- **Stacked Chart Widget**: Stacked area chart for generation mix

## ERCOT Data Tags

The simulator provides the following ERCOT-style tags:

| Tag | Description | Unit |
|-----|-------------|------|
| ERCOT.GRID_FREQ | Grid Frequency | Hz |
| ERCOT.SYSTEM_LOAD | Total System Demand | MW |
| ERCOT.WIND_GEN | Wind Generation | MW |
| ERCOT.SOLAR_GEN | Solar Generation | MW |
| ERCOT.GAS_GEN | Natural Gas Generation | MW |
| ERCOT.NUCLEAR_GEN | Nuclear Generation | MW |
| ERCOT.COAL_GEN | Coal Generation | MW |
| ERCOT.STORAGE_NET | Battery Storage (net) | MW |
| ERCOT.OP_RESERVES | Operating Reserves | MW |
| ERCOT.AVAIL_CAPACITY | Available Capacity | MW |
| ERCOT.RT_PRICE | Real-Time Hub Price | $/MWh |
| ERCOT.OUTAGES | Total Outages | MW |

## License

MIT
