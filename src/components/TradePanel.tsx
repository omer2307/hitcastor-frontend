import { useMemo, useState, useEffect } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { Address, isAddress, createPublicClient, http } from 'viem'
import { bscTestnet } from 'viem/chains'
import { 
  getDecimals, 
  getAllowance, 
  approve, 
  swapQuoteForYes, 
  swapQuoteForNo, 
  redeemTo,
  readQuoteTokenAddress 
} from '@/lib/trade'
import { TokenUtils, TokenType } from 'hitcastor-sdk'

const pc = createPublicClient({ chain: bscTestnet, transport: http(import.meta.env.VITE_RPC_URL || 'https://bsc-testnet-dataseed.bnbchain.org') })

type Props = {
  marketId: number
  ammAddress: `0x${string}`
  quoteToken?: string // Can be "USDT" or "0x..." address
  finalized?: boolean
}

export default function TradePanel({ marketId, ammAddress, quoteToken, finalized }: Props){
  const { address } = useAccount()
  const config = useConfig()
  const [amt, setAmt] = useState('0.1') // Small test amount
  const [side, setSide] = useState<'YES'|'NO'>('YES')
  const [decimals, setDecimals] = useState(18)
  const [allowanceOk, setAllowanceOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const [quoteTokenAddress, setQuoteTokenAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(false)

  const refreshAllowance = async () => {
    if (address && quoteTokenAddress) {
      console.log('🔄 Manually refreshing allowance...')
      console.log('📝 Parameters:')
      console.log('  - Token:', quoteTokenAddress)
      console.log('  - Owner:', address)
      console.log('  - Spender:', ammAddress)
      
      try {
        const newAllowance = await getAllowance(quoteTokenAddress, address as Address, ammAddress as Address)
        const isOk = newAllowance >= amountIn && amountIn > 0n
        setAllowanceOk(isOk)
        console.log('✅ Allowance result:')
        console.log('  - Current allowance:', newAllowance.toString())
        console.log('  - Amount needed:', amountIn.toString())
        console.log('  - Is sufficient:', isOk)
      } catch (error) {
        console.error('❌ Failed to get allowance:', error)
        setAllowanceOk(false)
      }
    } else {
      console.log('❌ Missing parameters for allowance check:', {
        address: !!address,
        quoteTokenAddress: !!quoteTokenAddress
      })
    }
  }

  const amountIn = useMemo(()=>{
    try { 
      // Detect token type - default to QUOTE if unknown
      const tokenType = quoteToken === 'USDT' ? TokenType.USDT : TokenType.QUOTE;
      return parseTokenAmount(amt || '0', tokenType);
    } catch { return 0n }
  }, [amt, quoteToken])

  // Resolve quote token address (if API returns symbol like "USDT")
  useEffect(() => {
    async function resolveQuoteToken() {
      console.log('🔍 Resolving quote token:', quoteToken)
      if (!quoteToken) {
        console.log('❌ No quote token provided')
        return
      }
      
      // If it's already an address, use it directly
      if (isAddress(quoteToken)) {
        console.log('✅ Quote token is already an address:', quoteToken)
        setQuoteTokenAddress(quoteToken as Address)
        return
      }
      
      // Hardcoded fallback for BSC Testnet USDT
      if (quoteToken.toUpperCase() === 'USDT') {
        const usdtAddress = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd' as Address
        console.log('✅ Using hardcoded BSC Testnet USDT:', usdtAddress)
        setQuoteTokenAddress(usdtAddress)
        return
      }
      
      // If it's a symbol like "USDT", try reading from contract
      setLoading(true)
      console.log('🔄 Reading quote token from contract:', ammAddress)
      try {
        const addr = await readQuoteTokenAddress(ammAddress)
        if (addr && addr !== '0x0000000000000000000000000000000000000000') {
          setQuoteTokenAddress(addr)
          console.log(`✅ Resolved quote token "${quoteToken}" to address:`, addr)
        } else {
          throw new Error('Contract returned zero address')
        }
      } catch (error) {
        console.error('❌ Failed to resolve quote token address:', error)
        console.log('🔄 Falling back to hardcoded USDT address for testing')
        setQuoteTokenAddress('0x337610d27c682E347C9cD60BD4b3b107C9d34dDd' as Address)
      } finally {
        setLoading(false)
      }
    }
    
    resolveQuoteToken()
  }, [quoteToken, ammAddress])

  // Get decimals once we have the token address
  useEffect(()=> {
    (async ()=>{
      if (!quoteTokenAddress) return
      const d = await getDecimals(quoteTokenAddress)
      setDecimals(d)
      console.log(`Quote token decimals: ${d}`)
    })()
  }, [quoteTokenAddress])

  // Check allowance
  useEffect(()=> {
    (async ()=>{
      if(!address || !quoteTokenAddress) {
        setAllowanceOk(false)
        console.log('❌ Missing address or quote token for allowance check')
        return
      }
      
      console.log('🔄 Auto-checking allowance due to dependency change...')
      try {
        const a = await getAllowance(quoteTokenAddress, address as Address, ammAddress as Address)
        const isOk = a >= amountIn && amountIn > 0n
        setAllowanceOk(isOk)
        console.log('📊 Allowance check result:')
        console.log(`  - Allowance: ${a.toString()}`)
        console.log(`  - Needed: ${amountIn.toString()}`)
        console.log(`  - Sufficient: ${isOk}`)
      } catch (error) {
        console.error('❌ Auto allowance check failed:', error)
        setAllowanceOk(false)
      }
    })()
  }, [address, quoteTokenAddress, ammAddress, amountIn])

  async function onApprove(e?: React.MouseEvent){
    e?.preventDefault()
    e?.stopPropagation()
    console.log('🎯 Approve clicked!')
    console.log('📝 Config:', !!config)
    console.log('📝 Quote token address:', quoteTokenAddress)
    console.log('📝 AMM address:', ammAddress)
    console.log('📝 Decimals:', decimals)
    
    if(busy) {
      console.log('⏳ Already busy, ignoring click')
      return
    }
    if(!config) {
      console.log('❌ No config available')
      return
    }
    if(!quoteTokenAddress || quoteTokenAddress === '0x0000000000000000000000000000000000000000') {
      console.log('❌ Invalid quote token address:', quoteTokenAddress)
      alert('Invalid quote token address. Please wait for resolution.')
      return
    }
    
    setBusy(true)
    try{
      // Approve only 5 USDT for testing (don't waste your 10 USDT!)
      const tokenType = quoteToken === 'USDT' ? TokenType.USDT : TokenType.QUOTE;
      const big = parseTokenAmount('5', tokenType)
      console.log('💰 Approving amount:', big.toString(), '(5 USDT for testing)')
      console.log('🔄 Calling approve...')
      const tx = await approve(config, quoteTokenAddress, ammAddress as Address, big)
      console.log('✅ Approve completed, refreshing allowance...')
      
      // Refresh allowance immediately since we waited for confirmation
      if (address && quoteTokenAddress) {
        const newAllowance = await getAllowance(quoteTokenAddress, address as Address, ammAddress as Address)
        const isOk = newAllowance >= amountIn && amountIn > 0n
        setAllowanceOk(isOk)
        console.log('🔄 Updated allowance:', {
          allowance: newAllowance.toString(),
          needed: amountIn.toString(),
          sufficient: isOk
        })
      }
    } catch (error) {
      console.error('❌ Approval failed:', error)
      alert(`Approval failed: ${error.message || error}`)
    } finally { 
      setBusy(false) 
    }
  }

  async function onBuy(e?: React.MouseEvent){
    e?.preventDefault()
    e?.stopPropagation()
    console.log('🎯 Buy clicked!')
    
    if(busy) {
      console.log('⏳ Already busy, ignoring click')
      return
    }
    if(!config) return
    
    setBusy(true)
    try{
      const minOut = 0n // TODO: Add slippage protection
      const tx = side==='YES'
        ? await swapQuoteForYes(config, ammAddress as Address, amountIn, minOut)
        : await swapQuoteForNo(config, ammAddress as Address, amountIn, minOut)
      console.log('✅ Buy tx hash:', tx)
    } catch (error) {
      console.error('❌ Trade failed:', error)
      alert(`Trade failed: ${error.message || error}`)
    } finally { 
      setBusy(false) 
    }
  }

  async function onRedeem(e?: React.MouseEvent){
    e?.preventDefault()
    e?.stopPropagation()
    console.log('🎯 Redeem clicked!')
    
    if(busy) {
      console.log('⏳ Already busy, ignoring click')
      return
    }
    if(!config || !address) return
    
    setBusy(true)
    try{
      const tx = await redeemTo(config, ammAddress as Address, address as Address)
      console.log('✅ Redeem tx hash:', tx)
    } catch (error) {
      console.error('❌ Redeem failed:', error)
      alert(`Redeem failed: ${error.message || error}`)
    } finally { 
      setBusy(false) 
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border p-4">
        <div className="text-center py-4">Loading quote token...</div>
      </div>
    )
  }

  if (!quoteTokenAddress) {
    return (
      <div className="rounded-2xl border p-4">
        <div className="text-center py-4 text-red-500">
          Failed to resolve quote token address
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Trade</div>
        <div className="text-xs text-gray-500">Market #{marketId}</div>
      </div>

      <div className="text-xs text-gray-500 flex items-center justify-between">
        <span>Quote: {quoteToken} ({quoteTokenAddress.slice(0,6)}...{quoteTokenAddress.slice(-4)})</span>
        <div className="flex gap-2">
          <button 
            onClick={refreshAllowance}
            className="text-blue-500 hover:text-blue-700 text-xs underline"
            disabled={!address || !quoteTokenAddress}
          >
            Refresh
          </button>
          <button 
            onClick={async () => {
              if (!quoteTokenAddress) return;
              try {
                console.log('🔍 Testing token contract...');
                const decimals = await getDecimals(quoteTokenAddress);
                const name = await pc.readContract({ 
                  address: quoteTokenAddress, 
                  abi: [{"name":"name","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"string"}]}], 
                  functionName: 'name' 
                });
                console.log('✅ Token info:', { name, decimals });
                alert(`Token: ${name}, Decimals: ${decimals}`);
              } catch (error) {
                console.error('❌ Token contract test failed:', error);
                alert('Token contract test failed - check console');
              }
            }}
            className="text-orange-500 hover:text-orange-700 text-xs underline"
            disabled={!quoteTokenAddress}
          >
            Test Token
          </button>
          <button 
            onClick={async () => {
              if (!quoteTokenAddress || !address) return;
              try {
                console.log('🔍 Checking USDT balance...');
                const balance = await pc.readContract({ 
                  address: quoteTokenAddress, 
                  abi: [{"name":"balanceOf","type":"function","stateMutability":"view","inputs":[{"type":"address"}],"outputs":[{"type":"uint256"}]}], 
                  functionName: 'balanceOf',
                  args: [address]
                });
                console.log('💰 USDT Balance:', balance.toString());
                const balanceFormatted = Number(balance) / Math.pow(10, decimals);
                alert(`Your USDT Balance: ${balanceFormatted.toFixed(2)} USDT`);
              } catch (error) {
                console.error('❌ Balance check failed:', error);
                alert('Balance check failed - check console');
              }
            }}
            className="text-green-500 hover:text-green-700 text-xs underline"
            disabled={!quoteTokenAddress || !address}
          >
            Check Balance
          </button>
          <button 
            onClick={async () => {
              if (!quoteTokenAddress || !address) return;
              try {
                console.log('🔍 Direct allowance check with multiple methods...');
                
                // Method 1: Using our function
                const allowance1 = await getAllowance(quoteTokenAddress, address as Address, ammAddress as Address);
                console.log('Method 1 (getAllowance):', allowance1.toString());
                
                // Method 2: Direct contract call
                const allowance2 = await pc.readContract({ 
                  address: quoteTokenAddress, 
                  abi: [{"name":"allowance","type":"function","stateMutability":"view","inputs":[{"type":"address"},{"type":"address"}],"outputs":[{"type":"uint256"}]}], 
                  functionName: 'allowance',
                  args: [address, ammAddress]
                });
                console.log('Method 2 (direct):', allowance2.toString());
                
                // Check the approval was successful by looking at recent transactions
                alert(`Allowance Methods:\nMethod 1: ${allowance1}\nMethod 2: ${allowance2}\n\nCheck console for details`);
              } catch (error) {
                console.error('❌ Direct allowance check failed:', error);
                alert('Direct allowance check failed - check console');
              }
            }}
            className="text-purple-500 hover:text-purple-700 text-xs underline"
            disabled={!quoteTokenAddress || !address}
          >
            Debug Allowance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={()=>setSide('YES')} 
          className={`rounded border px-3 py-2 ${side==='YES'?'bg-green-50 border-green-400':'border-gray-200'}`}
        >
          YES
        </button>
        <button 
          onClick={()=>setSide('NO')}  
          className={`rounded border px-3 py-2 ${side==='NO'?'bg-red-50 border-red-400':'border-gray-200'}`}
        >
          NO
        </button>
      </div>

      <div>
        <label className="text-sm">Amount (quote)</label>
        <input 
          value={amt} 
          onChange={e=>setAmt(e.target.value)} 
          className="w-full rounded border px-3 py-2 mt-1" 
          placeholder="0.1" 
        />
        <div className="text-xs text-gray-500 mt-1">
          Allowance OK: {allowanceOk ? '✅ Yes' : '❌ No'} | Amount: {amt} tokens
        </div>
      </div>

      {!allowanceOk ? (
        <button 
          onClick={onApprove} 
          disabled={busy || !quoteTokenAddress || !config} 
          className="w-full rounded bg-gray-900 text-white py-2 disabled:opacity-50"
        >
          {busy ? 'Approving...' : 'Approve'}
        </button>
      ) : (
        <button 
          onClick={onBuy} 
          disabled={busy || amountIn===0n || !config} 
          className="w-full rounded bg-blue-600 text-white py-2 disabled:opacity-50"
        >
          {busy ? 'Trading...' : `Buy ${side}`}
        </button>
      )}

      <button 
        onClick={onRedeem} 
        disabled={busy || !config} 
        className="w-full rounded bg-emerald-600 text-white py-2 disabled:opacity-50"
        title={!finalized ? 'Testing enabled - normally only works after finalization' : ''}
      >
        {busy ? 'Redeeming...' : finalized ? 'Redeem' : 'Redeem (Test - Pre-Finalization)'}
      </button>

      <p className="text-xs text-gray-500">
        Using swapQuoteForYes/No(amountIn,minOut) and redeem(to) from Market ABI.
        {!allowanceOk && ' Approve first to enable trading.'}
        {!finalized && ' Redeem enabled for testing (normally requires finalization on 11/21/2025).'}
      </p>
    </div>
  )
}