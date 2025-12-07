/**
 * ERCOT Grid Data Simulation Service
 * 
 * Simulates realistic Texas ERCOT grid data patterns based on actual
 * grid characteristics observed from the ERCOT public dashboard.
 * 
 * Data patterns modeled:
 * - Grid Frequency: 59.96 - 60.02 Hz, centered on 60.00 Hz
 * - System Demand: 43,000 - 70,000+ MW with daily/seasonal patterns
 * - Available Capacity: ~71,000 - 91,000 MW
 * - Wind Generation: 0 - 40,600 MW (highly variable)
 * - Solar Generation: 0 - 34,800 MW (follows sun)
 * - Natural Gas: 10,000 - 68,000 MW (base + peaking)
 * - Nuclear: ~5,100 - 5,268 MW (base load)
 * - Coal: 7,000 - 13,700 MW (declining)
 * - Energy Storage: -2,600 to +1,600 MW (charging/discharging)
 */

import type { PIDataPoint } from './piWebAPI'

// ERCOT tag definitions with realistic characteristics
export const ERCOT_TAGS = {
  // Grid Frequency - the heartbeat of the grid
  GRID_FREQUENCY: {
    webId: 'ERCOT.GRID_FREQ',
    name: 'Grid Frequency',
    unit: 'Hz',
    nominal: 60.0,
    min: 59.90,
    max: 60.10,
    description: 'ERCOT System Frequency'
  },
  // Total System Demand
  SYSTEM_DEMAND: {
    webId: 'ERCOT.SYSTEM_LOAD',
    name: 'System Demand',
    unit: 'MW',
    nominal: 50000,
    min: 35000,
    max: 85000,
    description: 'Total ERCOT System Load'
  },
  // Total System Capacity
  AVAILABLE_CAPACITY: {
    webId: 'ERCOT.AVAIL_CAPACITY',
    name: 'Available Capacity',
    unit: 'MW',
    nominal: 80000,
    min: 70000,
    max: 95000,
    description: 'Total Available Generation Capacity'
  },
  // Operating Reserves
  OPERATING_RESERVES: {
    webId: 'ERCOT.OP_RESERVES',
    name: 'Operating Reserves',
    unit: 'MW',
    nominal: 10000,
    min: 3000,
    max: 25000,
    description: 'Operating Reserve Margin'
  },
  // Wind Generation
  WIND_GENERATION: {
    webId: 'ERCOT.WIND_GEN',
    name: 'Wind Generation',
    unit: 'MW',
    nominal: 15000,
    min: 0,
    max: 40629,
    description: 'Total Wind Generation'
  },
  // Solar Generation
  SOLAR_GENERATION: {
    webId: 'ERCOT.SOLAR_GEN',
    name: 'Solar Generation',
    unit: 'MW',
    nominal: 10000,
    min: 0,
    max: 34808,
    description: 'Total Solar Generation'
  },
  // Natural Gas Generation
  GAS_GENERATION: {
    webId: 'ERCOT.GAS_GEN',
    name: 'Natural Gas Generation',
    unit: 'MW',
    nominal: 30000,
    min: 8000,
    max: 67998,
    description: 'Natural Gas Power Generation'
  },
  // Nuclear Generation
  NUCLEAR_GENERATION: {
    webId: 'ERCOT.NUCLEAR_GEN',
    name: 'Nuclear Generation',
    unit: 'MW',
    nominal: 5100,
    min: 4800,
    max: 5268,
    description: 'Nuclear Power Generation (Comanche Peak + STP)'
  },
  // Coal Generation
  COAL_GENERATION: {
    webId: 'ERCOT.COAL_GEN',
    name: 'Coal Generation',
    unit: 'MW',
    nominal: 8000,
    min: 4000,
    max: 13705,
    description: 'Coal and Lignite Generation'
  },
  // Energy Storage
  STORAGE_OUTPUT: {
    webId: 'ERCOT.STORAGE_NET',
    name: 'Energy Storage Net Output',
    unit: 'MW',
    nominal: 0,
    min: -2659,
    max: 1600,
    description: 'Battery Energy Storage Net Output (negative = charging)'
  },
  // Wholesale Price
  REAL_TIME_PRICE: {
    webId: 'ERCOT.RT_PRICE',
    name: 'Real-Time Hub Average',
    unit: '$/MWh',
    nominal: 35,
    min: -50,
    max: 5000,
    description: 'Real-Time Hub Average Price'
  },
  // Total Outages
  TOTAL_OUTAGES: {
    webId: 'ERCOT.OUTAGES',
    name: 'Total Outages',
    unit: 'MW',
    nominal: 15000,
    min: 5000,
    max: 35000,
    description: 'Total Generation Outages (Planned + Forced)'
  }
} as const

// Get hour of day (0-24) accounting for timezone (Central)
function getHourOfDay(date: Date): number {
  // Assume Central time - rough approximation
  const utcHour = date.getUTCHours()
  const centralHour = (utcHour - 6 + 24) % 24
  return centralHour + date.getMinutes() / 60
}

// Get day of year for seasonal patterns
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// Generate grid frequency with realistic variance
function generateFrequency(time: Date): number {
  // Grid frequency varies slightly around 60 Hz
  // More variance during peak demand times
  const hour = getHourOfDay(time)
  const isPeakTime = hour >= 14 && hour <= 20
  
  const baseVariance = 0.02 // +/- 0.02 Hz normal
  const peakVariance = isPeakTime ? 0.015 : 0
  
  // Add some autocorrelation (slight randomness)
  const randomWalk = Math.sin(time.getTime() / 10000) * 0.005
  const noise = (Math.random() - 0.5) * (baseVariance + peakVariance)
  
  return 60.0 + randomWalk + noise
}

// Generate system demand with realistic daily/seasonal patterns
function generateSystemDemand(time: Date): number {
  const hour = getHourOfDay(time)
  const dayOfYear = getDayOfYear(time)
  
  // Seasonal adjustment: higher in summer (cooling) and winter (heating)
  // Peak in August (~day 220), secondary peak in January (~day 15)
  const summerPeak = Math.cos((dayOfYear - 220) / 365 * 2 * Math.PI) * 8000
  const winterPeak = dayOfYear < 60 || dayOfYear > 320 ? 3000 : 0
  const seasonalBase = 50000 + summerPeak + winterPeak
  
  // Daily pattern: low at 4am (~38k), peak at 5-6pm (~65k+)
  // Using a more realistic multi-modal daily curve
  let dailyFactor: number
  if (hour < 4) {
    // Night valley
    dailyFactor = 0.82 + (hour / 4) * 0.03
  } else if (hour < 7) {
    // Early morning ramp
    dailyFactor = 0.85 + ((hour - 4) / 3) * 0.1
  } else if (hour < 14) {
    // Morning plateau with solar suppression
    dailyFactor = 0.95 + ((hour - 7) / 7) * 0.05
  } else if (hour < 18) {
    // Afternoon ramp to peak
    dailyFactor = 1.0 + ((hour - 14) / 4) * 0.15
  } else if (hour < 21) {
    // Evening peak
    dailyFactor = 1.15 - ((hour - 18) / 3) * 0.1
  } else {
    // Night decline
    dailyFactor = 1.05 - ((hour - 21) / 3) * 0.2
  }
  
  // Weekend adjustment (10% lower)
  const dayOfWeek = time.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  const weekendFactor = isWeekend ? 0.9 : 1.0
  
  const noise = (Math.random() - 0.5) * 1500
  
  return seasonalBase * dailyFactor * weekendFactor + noise
}

// Generate wind generation (highly variable, often higher at night)
function generateWindGeneration(time: Date): number {
  const hour = getHourOfDay(time)
  const dayOfYear = getDayOfYear(time)
  
  // Wind tends to be stronger in West Texas evenings/nights
  // and during spring (March-May, days 60-150)
  const springBonus = (dayOfYear > 60 && dayOfYear < 150) ? 5000 : 0
  
  // Night wind tendency
  const hourFactor = hour < 6 || hour > 20 ? 1.2 : 0.9
  
  // Base wind capacity varies widely - simulate weather patterns
  const weatherPattern = Math.sin(time.getTime() / (3600000 * 6)) // 6 hour cycles
  const baseWind = 12000 + weatherPattern * 8000
  
  const noise = (Math.random() - 0.5) * 3000
  
  return Math.max(500, Math.min(40629, (baseWind + springBonus) * hourFactor + noise))
}

// Generate solar generation (follows sun position)
function generateSolarGeneration(time: Date): number {
  const hour = getHourOfDay(time)
  const dayOfYear = getDayOfYear(time)
  
  // No solar at night
  if (hour < 6.5 || hour > 19.5) {
    return 0
  }
  
  // Solar curve - peaks at solar noon (~1pm Central in Texas)
  const solarNoon = 13
  const hoursFromNoon = Math.abs(hour - solarNoon)
  const dayLength = 12 // hours of usable daylight
  
  // Bell curve shape
  const solarFactor = Math.max(0, Math.cos((hoursFromNoon / (dayLength / 2)) * (Math.PI / 2)))
  
  // Seasonal adjustment - longer, more intense summer days
  const summerBoost = Math.cos((dayOfYear - 172) / 365 * 2 * Math.PI) * 0.3 + 0.7
  
  // Max solar capacity ~35 GW in ERCOT
  const maxSolar = 34808
  
  // Cloud cover simulation (random reduction)
  const cloudFactor = 0.7 + Math.random() * 0.3
  
  return Math.max(0, maxSolar * solarFactor * summerBoost * cloudFactor)
}

// Generate gas generation (fills the gap)
function generateGasGeneration(demand: number, wind: number, solar: number, nuclear: number, coal: number): number {
  // Gas is the balancing fuel - fills the gap between demand and other sources
  const otherGen = wind + solar + nuclear + coal
  const needed = demand - otherGen

  // Add some realistic gas dynamics
  const noise = (Math.random() - 0.5) * 1000

  return Math.max(8000, Math.min(67998, needed + noise))
}

// Generate nuclear (base load, very stable)
function generateNuclearGeneration(time: Date): number {
  // ERCOT has ~5,268 MW nuclear capacity
  // Usually runs at ~97% capacity factor
  const baseNuclear = 5117
  const smallVariance = (Math.random() - 0.5) * 100
  
  // Occasional refueling outages (simulate with date)
  const dayOfYear = getDayOfYear(time)
  const refuelingReduction = (dayOfYear % 180 < 30) ? -500 : 0
  
  return Math.max(4800, Math.min(5268, baseNuclear + smallVariance + refuelingReduction))
}

// Generate coal generation (declining, but still significant)
function generateCoalGeneration(time: Date): number {
  const hour = getHourOfDay(time)
  
  // Coal runs more during peak hours when prices are higher
  const peakFactor = (hour > 14 && hour < 20) ? 1.3 : 1.0
  const baseCoal = 7500
  const noise = (Math.random() - 0.5) * 1000
  
  return Math.max(4000, Math.min(13705, baseCoal * peakFactor + noise))
}

// Generate storage output (negative = charging, usually during solar peak)
function generateStorageOutput(time: Date, solar: number): number {
  const hour = getHourOfDay(time)
  
  // Charge during solar peak (10am - 3pm), discharge during evening peak (5pm - 9pm)
  if (hour > 10 && hour < 15 && solar > 5000) {
    // Charging during high solar
    return -1500 - Math.random() * 1000
  } else if (hour > 17 && hour < 21) {
    // Discharging during evening peak
    return 800 + Math.random() * 800
  } else if (hour > 5 && hour < 8) {
    // Morning discharge
    return 400 + Math.random() * 600
  } else {
    // Idle/minimal activity
    return (Math.random() - 0.5) * 400
  }
}

// Generate wholesale price
function generatePrice(demand: number, reserves: number): number {
  // Price correlates with demand and inversely with reserves
  const basePrice = 25 + (demand / 50000) * 20
  const reservesPenalty = reserves < 5000 ? (5000 - reserves) / 100 : 0
  const scarcityPremium = reserves < 3000 ? 200 : 0
  const noise = (Math.random() - 0.5) * 15
  
  return Math.max(-20, basePrice + reservesPenalty + scarcityPremium + noise)
}

// Generate outages
function generateOutages(time: Date): number {
  const dayOfYear = getDayOfYear(time)
  
  // More outages during maintenance seasons (spring and fall)
  const isMaintenance = (dayOfYear > 75 && dayOfYear < 135) || (dayOfYear > 270 && dayOfYear < 320)
  const baseOutages = isMaintenance ? 25000 : 15000
  const noise = (Math.random() - 0.5) * 5000
  
  return Math.max(5000, baseOutages + noise)
}

// Main generator function for a specific tag at a specific time
function generateValueForTag(tagId: string, time: Date): number {
  switch (tagId.toUpperCase()) {
    case 'ERCOT.GRID_FREQ':
      return generateFrequency(time)
    
    case 'ERCOT.SYSTEM_LOAD': {
      return generateSystemDemand(time)
    }
    
    case 'ERCOT.AVAIL_CAPACITY': {
      const demand = generateSystemDemand(time)
      const reserves = 8000 + Math.random() * 4000
      return demand + reserves
    }
    
    case 'ERCOT.OP_RESERVES': {
      const demand = generateSystemDemand(time)
      const capacity = demand + 8000 + Math.random() * 4000
      return capacity - demand
    }
    
    case 'ERCOT.WIND_GEN':
      return generateWindGeneration(time)
    
    case 'ERCOT.SOLAR_GEN':
      return generateSolarGeneration(time)
    
    case 'ERCOT.GAS_GEN': {
      const demand = generateSystemDemand(time)
      const wind = generateWindGeneration(time)
      const solar = generateSolarGeneration(time)
      const nuclear = generateNuclearGeneration(time)
      const coal = generateCoalGeneration(time)
      return generateGasGeneration(demand, wind, solar, nuclear, coal)
    }
    
    case 'ERCOT.NUCLEAR_GEN':
      return generateNuclearGeneration(time)
    
    case 'ERCOT.COAL_GEN':
      return generateCoalGeneration(time)
    
    case 'ERCOT.STORAGE_NET': {
      const solar = generateSolarGeneration(time)
      return generateStorageOutput(time, solar)
    }
    
    case 'ERCOT.RT_PRICE': {
      const demand = generateSystemDemand(time)
      const reserves = 8000 + Math.random() * 4000
      return generatePrice(demand, reserves)
    }
    
    case 'ERCOT.OUTAGES':
      return generateOutages(time)
    
    default:
      // Generic fallback
      return 50 + Math.random() * 50
  }
}

// Export the ERCOT service with the same interface as mockPiService
export const ercotService = {
  /**
   * Get current value for a tag
   */
  async getStreamValue(webId: string) {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const time = new Date()
    return {
      Timestamp: time.toISOString(),
      Value: generateValueForTag(webId, time)
    }
  },

  /**
   * Get recorded values for a time range
   */
  async getStreamRecorded(webId: string, startTime: string, endTime: string) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const start = new Date(startTime).getTime()
    const end = endTime === '*' ? Date.now() : new Date(endTime).getTime()
    const points: PIDataPoint[] = []
    
    // Generate points at 5-minute intervals like ERCOT does
    const intervalMs = 5 * 60 * 1000 // 5 minutes
    const count = Math.min(288, Math.ceil((end - start) / intervalMs)) // Max 24 hours at 5 min intervals
    const step = (end - start) / count
    
    for (let i = 0; i <= count; i++) {
      const time = new Date(start + (step * i))
      points.push({
        Timestamp: time.toISOString(),
        Value: generateValueForTag(webId, time)
      })
    }
    
    return points
  },

  /**
   * Get plot values for visualization (interpolated)
   */
  async getStreamPlot(webId: string, startTime: string, endTime: string, intervals: number) {
    await new Promise(resolve => setTimeout(resolve, 200))

    const start = new Date(startTime).getTime()
    const end = endTime === '*' ? Date.now() : new Date(endTime).getTime()
    const points: PIDataPoint[] = []
    
    const step = (end - start) / intervals
    
    for (let i = 0; i <= intervals; i++) {
      const time = new Date(start + (step * i))
      points.push({
        Timestamp: time.toISOString(),
        Value: generateValueForTag(webId, time)
      })
    }
    
    return points
  },

  /**
   * Get list of available ERCOT tags (for tag browser)
   */
  async searchTags(query: string) {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const allTags = Object.values(ERCOT_TAGS)
    const lowerQuery = query.toLowerCase()
    
    return allTags.filter(tag => 
      tag.name.toLowerCase().includes(lowerQuery) ||
      tag.webId.toLowerCase().includes(lowerQuery) ||
      tag.description.toLowerCase().includes(lowerQuery)
    ).map(tag => ({
      WebId: tag.webId,
      Name: tag.name,
      Path: `\\\\ERCOT\\${tag.webId.replace('ERCOT.', '')}`,
      Description: tag.description,
      Unit: tag.unit
    }))
  },

  /**
   * Get all available tags
   */
  async getAllTags() {
    await new Promise(resolve => setTimeout(resolve, 50))
    
    return Object.values(ERCOT_TAGS).map(tag => ({
      WebId: tag.webId,
      Name: tag.name,
      Path: `\\\\ERCOT\\${tag.webId.replace('ERCOT.', '')}`,
      Description: tag.description,
      Unit: tag.unit
    }))
  }
}
