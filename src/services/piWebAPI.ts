import axios from 'axios'

const api = axios.create({
  baseURL: 'https://pi-web-api-server/piwebapi', // Configure this
  withCredentials: true
})

export interface PIDataPoint {
  Timestamp: string
  Value: any
}

export const piService = {
  async getStreamValue(webId: string) {
    const response = await api.get(`/streams/${webId}/value`)
    return response.data
  },

  async getStreamRecorded(webId: string, startTime: string, endTime: string) {
    const response = await api.get(`/streams/${webId}/recorded`, {
      params: { startTime, endTime }
    })
    return response.data.Items
  },

  async getStreamPlot(webId: string, startTime: string, endTime: string, intervals: number) {
    const response = await api.get(`/streams/${webId}/plot`, {
      params: { startTime, endTime, intervals }
    })
    return response.data.Items
  }
}
