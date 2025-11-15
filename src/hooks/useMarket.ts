import { useQuery } from '@tanstack/react-query'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

export type MarketDetail = {
  marketId: string
  songId: string
  title?: string
  artist?: string
  ammAddress: `0x${string}`
  yesToken?: `0x${string}`
  noToken?: `0x${string}`
  quoteToken?: string // Can be symbol or address
  status?: string
  finalized?: boolean
  reserves?: { 
    reserveYes?: string
    reserveNo?: string
    reserveQuote?: string
    priceYes?: number
    priceNo?: number
    poolUSD?: number
  }
  t0Rank?: number
  cutoffUtc?: string
  outcome?: any
}

export function useMarket(id: number){
  return useQuery({
    queryKey: ['market', id],
    queryFn: async (): Promise<MarketDetail> => {
      const r = await fetch(`${API}/markets/${id}`)
      if(!r.ok) throw new Error(`/markets/${id} ${r.status}`)
      return r.json()
    },
    refetchInterval: 3000,
  })
}