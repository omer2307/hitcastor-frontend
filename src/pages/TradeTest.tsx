import { useState, useEffect } from 'react'
import { useAccount, useWalletClient, useChainId, useConnect, useDisconnect, useConfig } from 'wagmi'
import { writeContract } from '@wagmi/core'
import { parseUnits } from 'viem'
import { injected } from 'wagmi/connectors'

// Simple hardcoded test - bypassing quote token resolution
const HARDCODED_QUOTE_TOKEN = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd' // USDT on BSC Testnet
const HARDCODED_AMM = '0xc89f383d692017cf1dfcdc14904db64fea559589' // From API

export default function TradeTest() {
  const { address, isConnected, connector } = useAccount()
  const chainId = useChainId()
  const { data: wallet } = useWalletClient()
  const { data: walletWithChain } = useWalletClient({ chainId })
  const config = useConfig()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [busy, setBusy] = useState(false)

  // Debug effect to log wallet client status changes
  useEffect(() => {
    console.log('🔍 Wallet client status changed:', {
      isConnected,
      address,
      walletExists: !!wallet,
      walletWithChainExists: !!walletWithChain,
      chainId,
      connectorName: connector?.name,
      wallet,
      walletWithChain
    })
  }, [wallet, walletWithChain, isConnected, address, chainId, connector])

  const handleApprove = async () => {
    console.log('🎯 SIMPLE APPROVE TEST')
    console.log('Address:', address)
    console.log('IsConnected:', isConnected)
    console.log('ChainId:', chainId, '(expected: 97)')
    console.log('Connector:', connector?.name)
    console.log('Connector type:', connector?.type)
    console.log('Connector uid:', connector?.uid)
    console.log('Wallet hook object (no params):', wallet)
    console.log('Wallet hook object (with chainId):', walletWithChain)
    console.log('Wallet exists (no params):', !!wallet)
    console.log('Wallet exists (with chainId):', !!walletWithChain)
    
    console.log('Quote token:', HARDCODED_QUOTE_TOKEN)
    console.log('AMM:', HARDCODED_AMM)
    
    const activeWallet = walletWithChain || wallet
    if (!activeWallet) {
      console.log('❌ Both wallet hooks returned null/undefined')
      alert(`Wallet not connected. IsConnected: ${isConnected}, Wallet: ${!!wallet}, WalletWithChain: ${!!walletWithChain}`)
      return
    }
    console.log('✅ Using wallet:', activeWallet === wallet ? 'no params' : 'with chainId')
    
    setBusy(true)
    
    try {
      // Simple ERC20 approve using basic viem
      const amount = parseUnits('1000', 18) // 1000 tokens
      
      console.log('🔄 Calling writeContract...')
      
      const hash = await activeWallet.writeContract({
        address: HARDCODED_QUOTE_TOKEN as `0x${string}`,
        abi: [
          {
            "name": "approve",
            "type": "function", 
            "stateMutability": "nonpayable",
            "inputs": [
              {"name": "spender", "type": "address"},
              {"name": "value", "type": "uint256"}
            ],
            "outputs": [{"type": "bool"}]
          }
        ],
        functionName: 'approve',
        args: [HARDCODED_AMM, amount]
      })
      
      console.log('✅ Approve success! Hash:', hash)
      alert(`Approve successful! Tx: ${hash}`)
      
    } catch (error) {
      console.error('❌ Approve failed:', error)
      alert(`Approve failed: ${error.message || error}`)
    } finally {
      setBusy(false)
    }
  }

  const handleApproveCore = async () => {
    console.log('🎯 WAGMI CORE APPROVE TEST')
    console.log('Address:', address)
    console.log('IsConnected:', isConnected)
    console.log('ChainId:', chainId, '(expected: 97)')
    
    if (!isConnected || !address) {
      console.log('❌ Not connected')
      alert('Not connected to wallet')
      return
    }

    setBusy(true)
    
    try {
      const amount = parseUnits('1000', 18)
      console.log('🔄 Calling writeContract from wagmi/core...')
      
      const hash = await writeContract(config, {
        address: HARDCODED_QUOTE_TOKEN as `0x${string}`,
        abi: [
          {
            "name": "approve",
            "type": "function", 
            "stateMutability": "nonpayable",
            "inputs": [
              {"name": "spender", "type": "address"},
              {"name": "value", "type": "uint256"}
            ],
            "outputs": [{"type": "bool"}]
          }
        ],
        functionName: 'approve',
        args: [HARDCODED_AMM, amount]
      })
      
      console.log('✅ Approve success! Hash:', hash)
      alert(`Approve successful! Tx: ${hash}`)
      
    } catch (error) {
      console.error('❌ Approve failed:', error)
      alert(`Approve failed: ${error.message || error}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Simple Approve Test</h1>
      
      <div style={{ marginBottom: 20 }}>
        <strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}
      </div>
      
      <div style={{ marginBottom: 20 }}>
        <strong>Wallet Client (no params):</strong> {wallet ? 'Available' : 'Undefined'}
      </div>
      
      <div style={{ marginBottom: 20 }}>
        <strong>Wallet Client (with chainId):</strong> {walletWithChain ? 'Available' : 'Undefined'}
      </div>
      
      {isConnected && (
        <div style={{ marginBottom: 20 }}>
          <strong>Address:</strong> {address}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {isConnected ? (
          <button 
            onClick={() => disconnect()} 
            style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4 }}
          >
            Disconnect
          </button>
        ) : (
          <button 
            onClick={() => connect({ connector: injected() })} 
            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}
          >
            Connect Wallet
          </button>
        )}
        
        <button 
          onClick={() => {
            console.log('🔄 Reconnecting wallet...')
            disconnect()
            setTimeout(() => connect({ connector: injected() }), 1000)
          }}
          style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: 4 }}
        >
          Reconnect
        </button>
        
        <button 
          onClick={() => {
            console.log('🧹 Clearing all storage...')
            localStorage.clear()
            sessionStorage.clear()
            disconnect()
            window.location.reload()
          }}
          style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: 4 }}
        >
          Clear & Reload
        </button>
      </div>
      
      <div style={{ marginBottom: 20, fontSize: 14, background: '#f5f5f5', padding: 10 }}>
        <div><strong>Test Parameters:</strong></div>
        <div>Quote Token: {HARDCODED_QUOTE_TOKEN}</div>
        <div>AMM: {HARDCODED_AMM}</div>
        <div>Amount: 1000 tokens</div>
      </div>
      
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button 
          onClick={handleApprove}
          disabled={!isConnected || busy}
          style={{ 
            padding: '12px 24px', 
            fontSize: 16,
            backgroundColor: busy ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: busy ? 'default' : 'pointer'
          }}
        >
          {busy ? 'Approving...' : 'Test Approve (Hook)'}
        </button>
        
        <button 
          onClick={handleApproveCore}
          disabled={!isConnected || busy}
          style={{ 
            padding: '12px 24px', 
            fontSize: 16,
            backgroundColor: busy ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: busy ? 'default' : 'pointer'
          }}
        >
          {busy ? 'Approving...' : 'Test Approve (Core)'}
        </button>
      </div>
      
      <div style={{ marginTop: 20, fontSize: 14, color: '#666' }}>
        <p>This bypasses all complex logic and directly calls ERC20 approve.</p>
        <p>Should open MetaMask with approval transaction.</p>
        <p>Check browser console for detailed logs.</p>
      </div>
    </div>
  )
}