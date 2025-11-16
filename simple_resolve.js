import { createWalletClient, createPublicClient, http, parseAbi } from 'viem'
import { bscTestnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

const rpc = 'https://bsc-testnet.publicnode.com'
const pc = createPublicClient({ chain: bscTestnet, transport: http(rpc) })

const adminPrivateKey = '0x90b5e07a03ad94d89acf98f3c32df9f596fa32b86d8757388ca50895bc937352'
const account = privateKeyToAccount(adminPrivateKey)

const wc = createWalletClient({
  account,
  chain: bscTestnet,
  transport: http(rpc)
})

const marketAbi = parseAbi([
  'function outcome() view returns (uint8)',
  'function applyOutcome(uint8 _outcome, uint16 _t0Rank) external'
])

async function resolveMarket(ammAddress, outcome) {
  console.log(`🎯 Resolving market ${ammAddress} with outcome ${outcome}`)
  
  try {
    // Check current outcome
    const currentOutcome = await pc.readContract({ 
      address: ammAddress, 
      abi: marketAbi, 
      functionName: 'outcome' 
    })
    
    console.log('📊 Current outcome:', currentOutcome, currentOutcome === 0 ? '(UNRESOLVED)' : currentOutcome === 1 ? '(YES WINS)' : '(NO WINS)')
    console.log('🔑 Resolver account:', account.address)
    
    if (currentOutcome !== 0) {
      console.log('❌ Market already resolved!')
      return
    }
    
    // Apply the outcome (using t0Rank = 12 from API data)
    console.log(`🔄 Calling applyOutcome(${outcome}, 12)...`)
    const hash = await wc.writeContract({
      address: ammAddress,
      abi: marketAbi,
      functionName: 'applyOutcome',
      args: [outcome, 12] // Using t0Rank = 12 from API
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
    if (error.message.includes('execution reverted')) {
      console.log('💡 This might mean:')
      console.log('   - Account is not authorized to resolve')
      console.log('   - Market cutoff has not been reached')
      console.log('   - Invalid outcome value')
    }
  }
}

const ammAddress = '0x3b943c51d1fd2b423a6500c3dbd2874ec122dd3d'
const outcome = process.argv[2] ? parseInt(process.argv[2]) : 1

await resolveMarket(ammAddress, outcome)
