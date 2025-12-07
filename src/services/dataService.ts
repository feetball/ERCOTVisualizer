import { piService } from './piWebAPI'
import { mockPiService } from './mockPiService'
import { ercotService, ERCOT_TAGS } from './ercotService'

// Data source options:
// - 'ercot': Realistic ERCOT grid simulation (default for development)
// - 'mock': Simple mock data with sine waves
// - 'pi': Real PI WebAPI connection (production)
const dataSourceEnv = import.meta.env.VITE_DATA_SOURCE || 'ercot'

function getDataService() {
  switch (dataSourceEnv) {
    case 'pi':
      return piService
    case 'mock':
      return mockPiService
    case 'ercot':
    default:
      return ercotService
  }
}

export const dataService = getDataService()

// Re-export ERCOT tags for easy access
export { ERCOT_TAGS } from './ercotService'

// Helper to check if using ERCOT simulation
export const isErcotSimulation = dataSourceEnv === 'ercot'
