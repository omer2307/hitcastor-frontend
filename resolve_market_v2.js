import { createWalletClient, createPublicClient, http, parseAbi } from 'viem'
import { bscTestnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

const rpc = 'https://bsc-testnet.publicnode.com'
const pc = createPublicClient({ chain: bscTestnet, transport: http(rpc) })

// Admin private key from environment
const adminPrivateKey = '0x90b5e07a03ad94d89acf98f3c32df9f596fa32b86d8757388ca50895bc937352'
const account = privateKeyToAccount(adminPrivateKey)

const wc = createWalletClient({
  account,
  chain: bscTestnet,
  transport: http(rpc)
})

const marketAbi = parseAbi([
  'function outcome() view returns (uint8)',
  'function applyOutcome(uint8 _outcome, uint16 _t0Rank) external',
  'function resolver() view returns (address)',
  'function cutoff() view returns (uint64)',
  'function songId() view returns (uint256)',
  'function t0Rank() view returns (uint16)'
])

async function resolveMarket(ammAddress, outcome) {
  console.log(`🎯 Resolving market ${ammAddress} with outcome ${outcome}`)
  
  try {
    // Check current state
    const [currentOutcome, resolver, cutoff, songId, t0Rank] = await Promise.all([
      pc.readContract({ address: ammAddress, abi: marketAbi, functionName: 'outcome' }),
      pc.readContract({ address: ammAddress, abi: marketAbi, functionName: 'resolver' }),
      pc.readContract({ address: ammAddress, abi: marketAbi, functionName: 'cutoff' }),
      pc.readContract({ address: ammAddress, abi: marketAbi, functionName: 'songId' }),
      pc.readContract({ address: ammAddress, abi: marketAbi, functionName: 't0Rank' })
    ])
    
    console.log('📊 Market State:')
    console.log('  - Current outcome:', currentOutcome, currentOutcome === 0 ? '(UNRESOLVED)' : currentOutcome === 1 ? '(YES WINS)' : '(NO WINS)')
    console.log('  - Resolver:', resolver)
    console.log('  - Song ID:', songId.toString())
    console.log('  - T0 Rank:', t0Rank.toString())
    console.log('  - Cutoff:', new Date(Number(cutoff) * 1000).toISOString())
    console.log('  - Admin account:', account.address)
    console.log('  - Current time:', new Date().toISOString())
    
    if (currentOutcome !== 0) {
      console.log('❌ Market already resolved!')
      return
    }
    
    if (resolver.toLowerCase() !== account.address.toLowerCase()) {
      console.log('❌ Admin account is not the resolver!')
      console.log(`   Expected: ${resolver}`)
      console.log(`   Got:      ${account.address}`)
      return
    }
    
    // Apply the outcome
    console.log(`🔄 Calling applyOutcome(${outcome}, ${t0Rank})...`)
    const hash = await wc.writeContract({
      address: ammAddress,
      abi: marketAbi,
      functionName: 'applyOutcome',
      args: [outcome, t0Rank]
    })
    
    console.log('⏳ Transaction submitted:', hash)
    console.log('⏳ Waiting for confirmation...')
    
    const receipt = await pc.waitForTransactionReceipt({ hash })
    
    if (receipt.status === 'success') {
      console.log('✅ Market resolved successfully!')
      
      // Verify resolution
      const newOutcome = await pc.readContract({ 
        address: ammAddress, 
        abi: marketAbi, 
        functionName: 'outcome' 
      })
      console.log('🎉 New outcome:', newOutcome, newOutcome === 1 ? '(YES WINS)' : '(NO WINS)')
    } else {
      console.log('❌ Transaction failed!')
    }
    
  } catch (error) {
    console.error('❌ Error resolving market:', error.message)
  }
}

// Usage: resolve market with outcome (1 = YES wins, 2 = NO wins)
const ammAddress = '0x3b943c51d1fd2b423a6500c3dbd2874ec122dd3d'
const outcome = process.argv[2] ? parseInt(process.argv[2]) : 1 // Default: YES wins

await resolveMarket(ammAddress, outcome)
