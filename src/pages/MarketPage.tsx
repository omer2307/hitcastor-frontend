import WalletButton from '@/components/WalletButton'
import TradePanel from '@/components/TradePanel'
import { useMarket } from '@/hooks/useMarket'
import { useParams } from 'react-router-dom'

export default function MarketPage(){
  const params = useParams()
  const id = Number(params.id || import.meta.env.VITE_DEFAULT_MARKET_ID || 1)
  const { data, isLoading, error } = useMarket(id)

  return (
    <main style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontWeight: 700, fontSize: 22 }}>Market #{id}</h1>
        <WalletButton />
      </div>

      {isLoading && <div>Loading market…</div>}
      {error && <div style={{ color:'crimson' }}>Error: {(error as Error).message}</div>}

      {data && (
        <div style={{ display:'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', marginTop: 16 }}>
          <div className="rounded-2xl border p-4">
            <div style={{ fontWeight: 600 }}>{data.title} <span style={{ color:'#666' }}>— {data.artist}</span></div>
            <div style={{ fontSize: 14, color:'#666', marginTop: 8 }}>
              <div>Song ID: {data.songId}</div>
              <div>Initial Rank: {data.t0Rank}</div>
              <div>Cutoff: {data.cutoffUtc ? new Date(data.cutoffUtc).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div style={{ marginTop: 8, fontSize: 14, color:'#666' }}>
              AMM: {data.ammAddress?.slice(0,8)}…{data.ammAddress?.slice(-6)}
            </div>
            <div style={{ marginTop: 8, fontSize: 14 }}>
              <div>Reserves:</div>
              <ul style={{ marginLeft: 16 }}>
                <li>YES: {data.reserves?.reserveYes ?? '—'}</li>
                <li>NO: {data.reserves?.reserveNo ?? '—'}</li>
                <li>Quote: {data.reserves?.reserveQuote ?? '—'}</li>
              </ul>
              <div style={{ marginTop: 8 }}>
                <div>Prices: YES {((data.reserves?.priceYes ?? 0.5) * 100).toFixed(0)}¢ / NO {((data.reserves?.priceNo ?? 0.5) * 100).toFixed(0)}¢</div>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 14 }}>
              Status: <span style={{ fontWeight: 600 }}>{data.finalized ? 'Finalized' : (data.status || 'Open')}</span>
            </div>
          </div>

          <TradePanel
            marketId={id}
            ammAddress={data.ammAddress as `0x${string}`}
            quoteToken={data.quoteToken}
            finalized={!!data.finalized}
          />
        </div>
      )}
    </main>
  )
}