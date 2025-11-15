// Debug AMM contract to see why swapQuoteForYes fails
import { createPublicClient, http } from 'viem'
import { bscTestnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http('https://bsc-testnet-dataseed.bnbchain.org')
})

const AMM_ADDRESS = '0xc89f383d692017cf1dfcdc14904db64fea559589'
const YOUR_ADDRESS = '0x2e88162C709CB561AeB6C8D6EbE487850f107DAE'
const USDT_ADDRESS = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'

async function debugAMM() {
  console.log('🔍 Debugging AMM contract...')
  
  try {
    // 1. Check if AMM contract exists
    const code = await publicClient.getBytecode({ address: AMM_ADDRESS })
    if (!code || code === '0x') {
      console.log('❌ AMM contract does not exist!')
      return
    }
    console.log('✅ AMM contract exists')
    
    // 2. Check contract balance (should have YES/NO tokens)
    console.log('\n📊 Checking contract state...')
    
    // Try to get reserves using common AMM functions
    const reserveAbi = [
      {"name":"getReserves","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"uint112"},{"type":"uint112"},{"type":"uint32"}]},
      {"name":"reserves","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"uint256"},{"type":"uint256"}]},
      {"name":"reserveYes","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"uint256"}]},
      {"name":"reserveNo","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"uint256"}]},
      {"name":"reserveQuote","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"uint256"}]}
    ]
    
    for (const func of reserveAbi) {
      try {
        const result = await publicClient.readContract({
          address: AMM_ADDRESS,
          abi: [func],
          functionName: func.name
        })
        console.log(`✅ ${func.name}():`, result?.toString())
      } catch (error) {
        console.log(`❌ ${func.name}(): not available`)
      }
    }
    
    // 3. Check your USDT allowance to the AMM
    console.log('\n🔍 Checking USDT allowance...')
    const allowance = await publicClient.readContract({
      address: USDT_ADDRESS,
      abi: [{"name":"allowance","type":"function","stateMutability":"view","inputs":[{"type":"address"},{"type":"address"}],"outputs":[{"type":"uint256"}]}],
      functionName: 'allowance',
      args: [YOUR_ADDRESS, AMM_ADDRESS]
    })
    console.log('USDT Allowance:', allowance.toString())
    
    // 4. Check your USDT balance
    const balance = await publicClient.readContract({
      address: USDT_ADDRESS,
      abi: [{"name":"balanceOf","type":"function","stateMutability":"view","inputs":[{"type":"address"}],"outputs":[{"type":"uint256"}]}],
      functionName: 'balanceOf',
      args: [YOUR_ADDRESS]
    })
    console.log('Your USDT Balance:', balance.toString())
    
    // 5. Test if swapQuoteForYes function exists
    console.log('\n🔍 Testing function availability...')
    const swapFunctions = [
      'swapQuoteForYes',
      'swapQuoteForNo', 
      'swap',
      'trade',
      'buy',
      'buyYes',
      'buyNo'
    ]
    
    for (const funcName of swapFunctions) {
      try {
        // Try a static call to see if function exists (without executing)
        await publicClient.simulateContract({
          address: AMM_ADDRESS,
          abi: [{"name":funcName,"type":"function","stateMutability":"nonpayable","inputs":[{"type":"uint256"},{"type":"uint256"}],"outputs":[]}],
          functionName: funcName,
          args: [100000000000000000n, 0n], // 0.1 USDT, 0 min output
          account: YOUR_ADDRESS
        })
        console.log(`✅ ${funcName}(): exists and executable`)
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`❌ ${funcName}(): function does not exist`)
        } else {
          console.log(`⚠️  ${funcName}(): exists but failed:`, error.message.split('\n')[0])
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Debug failed:', error.message)
  }
}

debugAMM()