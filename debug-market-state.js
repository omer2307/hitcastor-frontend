// Check market state and requirements
import { createPublicClient, http } from 'viem'
import { bscTestnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http('https://bsc-testnet-dataseed.bnbchain.org')
})

const AMM_ADDRESS = '0xc89f383d692017cf1dfcdc14904db64fea559589'

// Common state functions for prediction markets
const stateFunctions = [
  {"name":"paused","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"bool"}]},
  {"name":"active","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"bool"}]},
  {"name":"closed","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"bool"}]},
  {"name":"finalized","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"bool"}]},
  {"name":"cutoffUtc","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"uint256"}]},
  {"name":"songId","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"uint256"}]},
  {"name":"t0Rank","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"uint256"}]},
  {"name":"yesToken","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"address"}]},
  {"name":"noToken","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"address"}]},
  {"name":"quoteToken","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"address"}]}
]

async function checkMarketState() {
  console.log('🔍 Checking market state...')
  
  const state = {}
  
  for (const func of stateFunctions) {
    try {
      const result = await publicClient.readContract({
        address: AMM_ADDRESS,
        abi: [func],
        functionName: func.name
      })
      state[func.name] = result
      console.log(`✅ ${func.name}:`, result?.toString())
    } catch (error) {
      console.log(`❌ ${func.name}: not available`)
    }
  }
  
  console.log('\n📋 Analysis:')
  
  // Check if market is paused
  if (state.paused === true) {
    console.log('🚨 Market is PAUSED - trading disabled!')
  }
  
  // Check if market is active
  if (state.active === false) {
    console.log('🚨 Market is INACTIVE - trading may be disabled!')
  }
  
  // Check if market is closed
  if (state.closed === true) {
    console.log('🚨 Market is CLOSED - trading disabled!')
  }
  
  // Check cutoff time
  if (state.cutoffUtc) {
    const cutoffDate = new Date(Number(state.cutoffUtc) * 1000)
    const now = new Date()
    console.log('⏰ Cutoff time:', cutoffDate.toISOString())
    console.log('⏰ Current time:', now.toISOString())
    
    if (now > cutoffDate) {
      console.log('🚨 PAST CUTOFF - trading should be disabled!')
    } else {
      console.log('✅ Before cutoff - trading should be allowed')
    }
  }
  
  // Check if tokens exist
  if (state.yesToken && state.yesToken !== '0x0000000000000000000000000000000000000000') {
    console.log('✅ YES token exists:', state.yesToken)
  } else {
    console.log('🚨 YES token not set or is zero address!')
  }
  
  if (state.noToken && state.noToken !== '0x0000000000000000000000000000000000000000') {
    console.log('✅ NO token exists:', state.noToken)
  } else {
    console.log('🚨 NO token not set or is zero address!')
  }
  
  console.log('\n🔧 Recommendations:')
  if (state.paused === true || state.active === false || state.closed === true) {
    console.log('- Market needs to be activated/unpaused by admin')
  }
  if (!state.yesToken || state.yesToken === '0x0000000000000000000000000000000000000000') {
    console.log('- YES/NO tokens need to be properly initialized')
  }
  if (state.cutoffUtc && new Date() > new Date(Number(state.cutoffUtc) * 1000)) {
    console.log('- Market is past cutoff - only redemption should work')
  }
}

checkMarketState()