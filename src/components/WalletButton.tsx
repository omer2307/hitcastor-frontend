import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Button } from '@/components/ui/button'
import { Wallet, LogOut } from 'lucide-react'

export default function WalletButton(){
  const { address, isConnected } = useAccount()
  const { connect, status } = useConnect()
  const { disconnect } = useDisconnect()

  if(isConnected) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => disconnect()}
        className="text-sm"
      >
        <Wallet className="h-4 w-4 mr-2" />
        {address?.slice(0,6)}…{address?.slice(-4)}
        <LogOut className="h-3 w-3 ml-2" />
      </Button>
    )
  }
  
  return (
    <Button
      size="sm"
      onClick={() => connect({ connector: injected() })}
      disabled={status === 'pending'}
      className="text-sm"
    >
      <Wallet className="h-4 w-4 mr-2" />
      {status === 'pending' ? 'Connecting…' : 'Connect Wallet'}
    </Button>
  )
}