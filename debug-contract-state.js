// Debug script to check contract state and understand revert reason
import { createPublicClient, http } from 'viem'
import { bscTestnet } from 'viem/chains'
import { readFileSync } from 'fs'

const MarketAbi = JSON.parse(readFileSync('./src/lib/../../../hitcastor-sdk/dist/chain/abi/Market.json', 'utf8'))

const AMM_ADDRESS = '0x84FE38dF17fFD33FAf4a09ec9FC287930e8a2040'  // New market
const QUOTE_TOKEN = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'
const YOUR_ADDRESS = '0x2e88162C709CB561AeB6C8D6EbE487850f107DAE'
const RPC_URL = 'https://bsc-testnet-dataseed.bnbchain.org'

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(RPC_URL)
})

async function debugContractState() {
  try {
    console.log('🔍 Debugging contract state...')
    console.log('AMM:', AMM_ADDRESS)
    console.log('Quote Token:', QUOTE_TOKEN)
    console.log('Your Address:', YOUR_ADDRESS)
    console.log()

    // 1. Check if contract exists
    const code = await publicClient.getBytecode({ address: AMM_ADDRESS })
    if (!code || code === '0x') {
      console.error('❌ Contract does not exist')
      return
    }
    console.log('✅ Contract exists')

    // 2. Check contract cutoff time
    try {
      const cutoffUtc = await publicClient.readContract({
        address: AMM_ADDRESS,
        abi: MarketAbi.abi,
        functionName: 'cutoffUtc'
      })
      const cutoffDate = new Date(Number(cutoffUtc) * 1000)
      const now = new Date()
      console.log(`⏰ Contract cutoff: ${cutoffDate.toISOString()} (${Number(cutoffUtc)})`)
      console.log(`⏰ Current time:   ${now.toISOString()} (${Math.floor(now.getTime() / 1000)})`)
      console.log(`⏰ Time left:      ${cutoffDate.getTime() - now.getTime()}ms`)
      
      if (cutoffDate < now) {
        console.log('❌ Market is past cutoff! This is likely the issue.')
      } else {
        console.log('✅ Market is within trading window')
      }
    } catch (error) {
      console.error('❌ Failed to read cutoff:', error.message)
    }

    // 3. Check if contract is paused
    try {
      const paused = await publicClient.readContract({
        address: AMM_ADDRESS,
        abi: MarketAbi.abi,
        functionName: 'paused'
      })
      console.log(`🔒 Contract paused: ${paused}`)
      if (paused) {
        console.log('❌ Contract is paused! This could be the issue.')
      }
    } catch (error) {
      console.log('⚠️  Could not read paused status (method may not exist)')
    }

    // 4. Check market status
    try {
      const status = await publicClient.readContract({
        address: AMM_ADDRESS,
        abi: MarketAbi.abi,
        functionName: 'status'
      })
      console.log(`📊 Market status: ${status}`)
    } catch (error) {
      console.error('❌ Failed to read status:', error.message)
    }

    // 5. Check quote token configuration
    try {
      const contractQuoteToken = await publicClient.readContract({
        address: AMM_ADDRESS,
        abi: MarketAbi.abi,
        functionName: 'quoteToken'
      })
      console.log(`💰 Contract quote token: ${contractQuoteToken}`)
      console.log(`💰 Expected quote token: ${QUOTE_TOKEN}`)
      
      if (contractQuoteToken.toLowerCase() !== QUOTE_TOKEN.toLowerCase()) {
        console.log('❌ Quote token mismatch! This is likely the issue.')
        console.log('Contract expects:', contractQuoteToken)
        console.log('We are using:', QUOTE_TOKEN)
      } else {
        console.log('✅ Quote token matches')
      }
    } catch (error) {
      console.error('❌ Failed to read quote token:', error.message)
    }

    // 6. Check reserves
    try {
      const reserves = await publicClient.readContract({
        address: AMM_ADDRESS,
        abi: MarketAbi.abi,
        functionName: 'reserves'
      })
      console.log(`📦 Reserves - YES: ${reserves[0]}, NO: ${reserves[1]}`)
      
      if (reserves[0] === 0n || reserves[1] === 0n) {
        console.log('⚠️  Zero reserves detected - may cause slippage issues')
      }
    } catch (error) {
      console.error('❌ Failed to read reserves:', error.message)
    }

    // 7. Check quote vault
    try {
      const quoteVault = await publicClient.readContract({
        address: AMM_ADDRESS,
        abi: MarketAbi.abi,
        functionName: 'quoteVault'
      })
      console.log(`💰 Quote vault: ${quoteVault}`)
      
      if (quoteVault === 0n) {
        console.log('⚠️  Quote vault is empty - may indicate liquidity issues')
      }
    } catch (error) {
      console.error('❌ Failed to read quote vault:', error.message)
    }

    // 8. Test quote calculation for 10 USDT input
    try {
      const tenUSDT = 10n * 10n ** 18n  // 10 USDT
      const quote = await publicClient.readContract({
        address: AMM_ADDRESS,
        abi: MarketAbi.abi,
        functionName: 'quoteYesOut',
        args: [tenUSDT]
      })
      console.log(`🧮 10 USDT would buy: ${quote[0]} YES tokens`)
      console.log(`🧮 Price after: ${quote[1]}`)
      
      if (quote[0] === 0n) {
        console.log('❌ Quote returns 0 tokens - insufficient liquidity or other issue')
      }
    } catch (error) {
      console.error('❌ Failed to get quote:', error.message)
    }

    console.log('\n💡 Most likely causes of "execution reverted":')
    console.log('1. Market past cutoff time (check timestamps above)')
    console.log('2. Contract paused')
    console.log('3. Quote token mismatch')
    console.log('4. Insufficient liquidity')
    console.log('5. Slippage protection (minOut too high)')
    
  } catch (error) {
    console.error('💥 Debug script failed:', error)
  }
}

debugContractState()