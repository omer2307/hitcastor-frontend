// Check market outcome status
import { createPublicClient, http } from 'viem'
import { bscTestnet } from 'viem/chains'
import { readFileSync } from 'fs'

const MarketAbi = JSON.parse(readFileSync('./src/lib/../../../hitcastor-sdk/dist/chain/abi/Market.json', 'utf8'))

const AMM_ADDRESS = '0x25E876fC89FA85228a146eCC1014Baab9aC7ffb4'
const YOUR_ADDRESS = '0x2e88162C709CB561AeB6C8D6EbE487850f107DAE'
const RPC_URL = 'https://bsc-testnet-dataseed.bnbchain.org'

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(RPC_URL)
})

async function checkMarketStatus() {
  try {
    console.log('🔍 Checking market redemption status...')
    
    // Check market outcome
    try {
      const outcome = await publicClient.readContract({
        address: AMM_ADDRESS,
        abi: MarketAbi.abi,
        functionName: 'outcome'
      })
      console.log('📊 Market outcome:', outcome)
      
      if (outcome === 0) {
        console.log('❌ Market not resolved yet (outcome = 0 = UNRESOLVED)')
        console.log('💡 Redemption only works after outcome is applied by admin/resolver')
      } else if (outcome === 1) {
        console.log('✅ Market resolved: YES wins')
      } else if (outcome === 2) {
        console.log('✅ Market resolved: NO wins')
      }
    } catch (error) {
      console.error('❌ Failed to read outcome:', error.message)
    }
    
    // Check if user has already redeemed
    try {
      const hasRedeemed = await publicClient.readContract({
        address: AMM_ADDRESS,
        abi: MarketAbi.abi,
        functionName: 'hasRedeemed',
        args: [YOUR_ADDRESS]
      })
      console.log('🔄 Has user redeemed:', hasRedeemed)
    } catch (error) {
      console.error('❌ Failed to read hasRedeemed:', error.message)
    }
    
    // Check YES token balance
    try {
      const yesTokenAddress = await publicClient.readContract({
        address: AMM_ADDRESS,
        abi: MarketAbi.abi,
        functionName: 'yesToken'
      })
      console.log('🟢 YES token address:', yesTokenAddress)
      
      if (yesTokenAddress && yesTokenAddress !== '0x0000000000000000000000000000000000000000') {
        const erc20Abi = [
          {
            "name": "balanceOf",
            "type": "function",
            "stateMutability": "view",
            "inputs": [{"type": "address"}],
            "outputs": [{"type": "uint256"}]
          }
        ]
        
        const yesBalance = await publicClient.readContract({
          address: yesTokenAddress,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [YOUR_ADDRESS]
        })
        console.log('💰 Your YES token balance:', yesBalance.toString())
        
        if (yesBalance === 0n) {
          console.log('⚠️  You have no YES tokens to redeem')
        }
      }
    } catch (error) {
      console.error('❌ Failed to check YES token balance:', error.message)
    }
    
    // Check NO token balance
    try {
      const noTokenAddress = await publicClient.readContract({
        address: AMM_ADDRESS,
        abi: MarketAbi.abi,
        functionName: 'noToken'
      })
      console.log('🔴 NO token address:', noTokenAddress)
      
      if (noTokenAddress && noTokenAddress !== '0x0000000000000000000000000000000000000000') {
        const erc20Abi = [
          {
            "name": "balanceOf",
            "type": "function",
            "stateMutability": "view",
            "inputs": [{"type": "address"}],
            "outputs": [{"type": "uint256"}]
          }
        ]
        
        const noBalance = await publicClient.readContract({
          address: noTokenAddress,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [YOUR_ADDRESS]
        })
        console.log('💰 Your NO token balance:', noBalance.toString())
        
        if (noBalance === 0n) {
          console.log('⚠️  You have no NO tokens to redeem')
        }
      }
    } catch (error) {
      console.error('❌ Failed to check NO token balance:', error.message)
    }
    
    console.log('\n💡 Redemption requirements:')
    console.log('1. Market must be resolved (outcome != 0)')
    console.log('2. User must have YES or NO tokens')
    console.log('3. User must not have already redeemed')
    console.log('4. If outcome = YES, redeem YES tokens for USDT')
    console.log('5. If outcome = NO, redeem NO tokens for USDT')
    
  } catch (error) {
    console.error('💥 Check failed:', error)
  }
}

checkMarketStatus()