import { useState, useEffect } from 'react'
import { useMarket } from './useMarket'
import { getCoverImage } from '@/lib/images'

export interface MarketData {
  question: string
  songName: string
  artist: string
  chart: string
  volume: string
  resolutionDate: string
  probability: number
  yesPrice: number
  noPrice: number
  coverImage: string
  marketId: string
  ammAddress: string
  quoteToken: string
  cutoffUtc: string
  status: string
  reserves?: {
    priceYes: number
    priceNo: number
    poolUSD: number
  }
}

export function useMarketData(marketId: number) {
  const { data: apiData, isLoading, error } = useMarket(marketId)
  const [marketData, setMarketData] = useState<MarketData | null>(null)

  useEffect(() => {
    if (apiData) {
      // Transform API data to UI format
      const transformedData: MarketData = {
        question: `Will '${apiData.title}' by ${apiData.artist} improve its position on Spotify Global Top 50 by ${new Date(apiData.cutoffUtc).toLocaleDateString()}?`,
        songName: apiData.title || 'Unknown Song',
        artist: apiData.artist || 'Unknown Artist',
        chart: 'Spotify Global Top 50',
        volume: apiData.reserves?.poolUSD ? `$${(apiData.reserves.poolUSD / 1000).toFixed(1)}K` : '$0',
        resolutionDate: new Date(apiData.cutoffUtc).toLocaleDateString(),
        probability: Math.round((apiData.reserves?.priceYes || 0.5) * 100),
        yesPrice: Math.round((apiData.reserves?.priceYes || 0.5) * 100),
        noPrice: Math.round((apiData.reserves?.priceNo || 0.5) * 100),
        coverImage: getCoverImage(apiData.artist || 'Unknown Artist', apiData.title || 'Unknown Song'),
        marketId: apiData.marketId,
        ammAddress: apiData.ammAddress,
        quoteToken: apiData.quoteToken,
        cutoffUtc: apiData.cutoffUtc,
        status: apiData.status,
        reserves: apiData.reserves
      }
      setMarketData(transformedData)
    }
  }, [apiData])

  return {
    data: marketData,
    isLoading,
    error,
    rawApiData: apiData
  }
}