// Script to create a new market with correct parameters
import { createWalletClient, createPublicClient, http } from 'viem'
import { bscTestnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { readFileSync } from 'fs'

const MarketFactoryAbi = JSON.parse(readFileSync('./src/lib/../../../hitcastor-sdk/src/chain/abi/MarketFactory.json', 'utf8'))

// Configuration
const FACTORY_ADDRESS = '0x23057BF06D395e8f3Af646216a095F1788DE78A9'
const USDT_ADDRESS = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'  // BSC Testnet USDT
const RPC_URL = 'https://bsc-testnet-dataseed.bnbchain.org'

// You need to set this environment variable with your private key
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY
if (!PRIVATE_KEY) {
  console.error('❌ Please set ADMIN_PRIVATE_KEY environment variable')
  process.exit(1)
}

const account = privateKeyToAccount(PRIVATE_KEY)
console.log('🔑 Using account:', account.address)

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(RPC_URL)
})

const walletClient = createWalletClient({
  chain: bscTestnet,
  transport: http(RPC_URL),
  account
})

async function createNewMarket() {
  try {
    console.log('🏭 Creating new market with MarketFactory...')
    console.log('Factory:', FACTORY_ADDRESS)
    console.log('Quote Token (USDT):', USDT_ADDRESS)
    
    // Market parameters
    const songId = 1234567893n  // Different from existing markets
    const t0Rank = 25           // Initial rank
    const cutoffUtc = Math.floor((Date.now() + 30 * 60 * 1000) / 1000)  // 30 minutes from now
    const quoteToken = USDT_ADDRESS
    
    console.log('\n📋 Market Parameters:')
    console.log('- Song ID:', songId.toString())
    console.log('- T0 Rank:', t0Rank)
    console.log('- Cutoff UTC:', new Date(cutoffUtc * 1000).toISOString())
    console.log('- Quote Token:', quoteToken)
    
    console.log('\n🔄 Creating market...')
    
    const hash = await walletClient.writeContract({
      address: FACTORY_ADDRESS,
      abi: MarketFactoryAbi.abi,
      functionName: 'createMarket',
      args: [songId, t0Rank, cutoffUtc, quoteToken]
    })
    
    console.log('✅ Market creation transaction submitted:', hash)
    console.log('⏳ Waiting for confirmation...')
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    
    if (receipt.status === 'reverted') {
      console.error('❌ Market creation failed!')
      console.error('Gas used:', receipt.gasUsed.toString())
      process.exit(1)
    }
    
    console.log('✅ Market created successfully!')
    console.log('📊 Transaction details:')
    console.log('- Hash:', receipt.transactionHash)
    console.log('- Block:', receipt.blockNumber.toString())
    console.log('- Gas used:', receipt.gasUsed.toString())
    
    // Try to extract market address from logs
    const marketCreatedLog = receipt.logs.find(log => log.topics[0] === '0x...' || log.topics.length > 0)
    if (marketCreatedLog && marketCreatedLog.topics.length >= 3) {
      console.log('🎯 Potential market address from logs:', marketCreatedLog.topics[1])
    }
    
    // Now let's get the market ID to find the contract address
    console.log('\n🔍 Getting market address...')
    try {
      // The market ID should be sequential, let's try a few values
      for (let marketId = 0n; marketId <= 10n; marketId++) {
        try {
          const marketAddress = await publicClient.readContract({
            address: FACTORY_ADDRESS,
            abi: MarketFactoryAbi.abi,
            functionName: 'getMarket',
            args: [marketId]
          })
          
          if (marketAddress && marketAddress !== '0x0000000000000000000000000000000000000000') {
            console.log(`📍 Market ID ${marketId}: ${marketAddress}`)
            
            // Check if this is the newly created market by checking its parameters
            try {
              const MarketAbi = JSON.parse(readFileSync('./src/lib/../../../hitcastor-sdk/dist/chain/abi/Market.json', 'utf8'))
              
              const contractSongId = await publicClient.readContract({
                address: marketAddress,
                abi: MarketAbi.abi,
                functionName: 'songId'
              })
              
              if (contractSongId === songId) {
                console.log('🎯 Found our new market!')
                console.log('📍 Market Address:', marketAddress)
                console.log('🆔 Market ID:', marketId.toString())
                
                // Now update the database to use this new market
                console.log('\n📝 You need to update the database to point to this new market:')
                console.log(`UPDATE markets SET amm_address = decode('${marketAddress.slice(2)}', 'hex'), cutoff_utc = '${new Date(cutoffUtc * 1000).toISOString()}' WHERE market_id = '1';`)
                
                break
              }
            } catch (e) {
              // Skip if we can't read this contract
            }
          }
        } catch (e) {
          // Market ID doesn't exist, continue
        }
      }
    } catch (error) {
      console.error('❌ Failed to get market address:', error.message)
    }
    
  } catch (error) {
    console.error('💥 Market creation failed:', error)
    
    if (error.message.includes('ErrInvalidCutoff')) {
      console.log('💡 The cutoff time might be invalid. Ensure it\'s in the future.')
    }
    if (error.message.includes('ErrQuoteTokenNotAllowed')) {
      console.log('💡 The quote token might not be whitelisted in the factory.')
    }
    if (error.message.includes('ErrSongHasMarket')) {
      console.log('💡 A market for this song ID already exists. Try a different song ID.')
    }
  }
}

createNewMarket()