import { useQuery } from '@tanstack/react-query'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

export type Market = {
  marketId: string
  songId: string
  title: string
  artist: string
  t0Rank: number
  status: string
  cutoffUtc: string
  priceYes: number
  priceNo: number
  poolUSD: number
}

export type MarketsResponse = {
  markets: Market[]
  total: number
}

export function useMarkets(status?: 'OPEN' | 'COMMITTED' | 'RESOLVED', limit = 50) {
  return useQuery({
    queryKey: ['markets', status, limit],
    queryFn: async (): Promise<MarketsResponse> => {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      params.set('limit', limit.toString())
      
      const url = `${API}/markets?${params.toString()}`
      const r = await fetch(url)
      if (!r.ok) throw new Error(`/markets ${r.status}`)
      return r.json()
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}