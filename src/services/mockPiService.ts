import type { PIDataPoint } from './piWebAPI'

export const mockPiService = {
  async getStreamValue(_webId: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return {
      Timestamp: new Date().toISOString(),
      Value: 50 + Math.random() * 50 // Random value between 50 and 100
    }
  },

  async getStreamRecorded(webId: string, startTime: string, endTime: string) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const start = new Date(startTime).getTime()
    const end = endTime === '*' ? Date.now() : new Date(endTime).getTime()
    const points: PIDataPoint[] = []
    
    // Generate 100 points
    const count = 100
    const step = (end - start) / count
    
    for (let i = 0; i <= count; i++) {
      const time = start + (step * i)
      // Add some sine wave pattern + noise based on webId hash or similar to make it look different per tag
      const offset = webId.length * 10
      const value = 50 + Math.sin((i + offset) * 0.1) * 30 + (Math.random() * 10 - 5)
      
      points.push({
        Timestamp: new Date(time).toISOString(),
        Value: value
      })
    }
    
    return points
  },

  async getStreamPlot(webId: string, startTime: string, endTime: string, intervals: number) {
    await new Promise(resolve => setTimeout(resolve, 500))

    const start = new Date(startTime).getTime()
    const end = endTime === '*' ? Date.now() : new Date(endTime).getTime()
    const points: PIDataPoint[] = []
    
    const step = (end - start) / intervals
    
    for (let i = 0; i <= intervals; i++) {
      const time = start + (step * i)
      let value = 0

      if (webId.toLowerCase().includes('freq')) {
        // Frequency: 60Hz +/- 0.05
        value = 60 + (Math.random() * 0.1 - 0.05) + Math.sin(i * 0.1) * 0.02
      } else if (webId.toLowerCase().includes('load')) {
        // Load: 40k - 60k MW, daily curve
        // Simulate a daily curve based on hour of day
        const date = new Date(time)
        const hour = date.getHours() + date.getMinutes() / 60
        // Peak at 17:00 (5 PM), Low at 04:00
        const normalizedTime = (hour - 4) / 24 * 2 * Math.PI
        const dailyShape = -Math.cos(normalizedTime) // -1 at 4am, 1 at 4pm roughly
        
        const baseLoad = 50000
        const swing = 15000
        value = baseLoad + (dailyShape * swing) + (Math.random() * 500 - 250)
      } else {
        const offset = webId.length * 10
        value = 50 + Math.sin((i + offset) * 0.1) * 30 + (Math.random() * 10 - 5)
      }
      
      points.push({
        Timestamp: new Date(time).toISOString(),
        Value: value
      })
    }
    
    return points
  }
}
