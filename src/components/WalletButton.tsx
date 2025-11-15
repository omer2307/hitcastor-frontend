import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export default function WalletButton(){
  const { address, isConnected } = useAccount()
  const { connect, status } = useConnect()
  const { disconnect } = useDisconnect()

  if(isConnected) {
    return (
      <button onClick={()=>disconnect()} className="px-3 py-1.5 rounded border">
        {address?.slice(0,6)}…{address?.slice(-4)} — Disconnect
      </button>
    )
  }
  return (
    <button
      onClick={()=>connect({ connector: injected() })}
      disabled={status==='pending'}
      className="px-3 py-1.5 rounded border"
    >
      {status==='pending' ? 'Connecting…' : 'Connect Wallet'}
    </button>
  )
}