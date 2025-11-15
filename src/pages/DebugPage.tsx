import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export default function DebugPage() {
  const { address, isConnected } = useAccount()
  const { connect, status } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = () => {
    console.log('🎯 Connect button clicked!')
    connect({ connector: injected() })
  }

  const handleTest = () => {
    console.log('🧪 Test button clicked!')
    console.log('Wallet connected:', isConnected)
    console.log('Address:', address)
    console.log('Status:', status)
    alert('Test button works! Check console.')
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Debug Page</h1>
      
      <div style={{ marginBottom: 20 }}>
        <strong>Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      
      {isConnected ? (
        <div style={{ marginBottom: 20 }}>
          <strong>Address:</strong> {address}
        </div>
      ) : null}
      
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {isConnected ? (
          <button onClick={() => disconnect()} style={{ padding: '8px 16px' }}>
            Disconnect Wallet
          </button>
        ) : (
          <button onClick={handleConnect} style={{ padding: '8px 16px' }}>
            Connect Wallet
          </button>
        )}
        
        <button onClick={handleTest} style={{ padding: '8px 16px' }}>
          Test Console Log
        </button>
      </div>

      <div style={{ fontSize: 14, color: '#666' }}>
        <p>1. Click "Test Console Log" - should show alert and console log</p>
        <p>2. Click "Connect Wallet" - should open MetaMask</p>
        <p>3. Open browser console (F12) to see logs</p>
      </div>
    </div>
  )
}