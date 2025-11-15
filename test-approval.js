// Independent test script to debug the approval issue
import { createPublicClient, createWalletClient, http, parseUnits } from 'viem'
import { bscTestnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// Configuration matching your exact setup
const USDT_ADDRESS = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'
const AMM_ADDRESS = '0xc89f383d692017cf1dfcdc14904db64fea559589' 
const YOUR_ADDRESS = '0x2e88162C709CB561AeB6C8D6EbE487850f107DAE'
const RPC_URL = 'https://bsc-testnet-dataseed.bnbchain.org'

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(RPC_URL)
})

// ERC20 ABI for allowance and balanceOf
const erc20Abi = [
  {
    "name": "allowance",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{"type": "address"}, {"type": "address"}],
    "outputs": [{"type": "uint256"}]
  },
  {
    "name": "balanceOf", 
    "type": "function",
    "stateMutability": "view",
    "inputs": [{"type": "address"}],
    "outputs": [{"type": "uint256"}]
  },
  {
    "name": "name",
    "type": "function", 
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"type": "string"}]
  },
  {
    "name": "decimals",
    "type": "function",
    "stateMutability": "view", 
    "inputs": [],
    "outputs": [{"type": "uint8"}]
  }
]

async function testTokenAndAllowance() {
  try {
    console.log('🔍 Testing USDT token at:', USDT_ADDRESS)
    
    // 1. Test if token contract exists and is valid
    console.log('\n1. Testing token contract...')
    try {
      const name = await publicClient.readContract({
        address: USDT_ADDRESS,
        abi: erc20Abi,
        functionName: 'name'
      })
      console.log('✅ Token name:', name)
      
      const decimals = await publicClient.readContract({
        address: USDT_ADDRESS,
        abi: erc20Abi,
        functionName: 'decimals'
      })
      console.log('✅ Token decimals:', decimals)
      
    } catch (error) {
      console.error('❌ Token contract test failed:', error.message)
      return
    }
    
    // 2. Check your USDT balance
    console.log('\n2. Checking USDT balance...')
    try {
      const balance = await publicClient.readContract({
        address: USDT_ADDRESS,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [YOUR_ADDRESS]
      })
      console.log('💰 USDT balance (raw):', balance.toString())
      console.log('💰 USDT balance (formatted):', Number(balance) / Math.pow(10, 18), 'USDT')
      
      if (balance === 0n) {
        console.log('⚠️  You have 0 USDT - this explains the approval issue!')
        return
      }
      
    } catch (error) {
      console.error('❌ Balance check failed:', error.message)
      return
    }
    
    // 3. Check current allowance
    console.log('\n3. Checking current allowance...')
    try {
      const allowance = await publicClient.readContract({
        address: USDT_ADDRESS,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [YOUR_ADDRESS, AMM_ADDRESS]
      })
      console.log('🔍 Current allowance (raw):', allowance.toString())
      console.log('🔍 Current allowance (formatted):', Number(allowance) / Math.pow(10, 18), 'USDT')
      
      if (allowance > 0n) {
        console.log('✅ Approval exists! The UI logic must be wrong.')
      } else {
        console.log('❌ No allowance found. Approve transaction may have failed.')
      }
      
    } catch (error) {
      console.error('❌ Allowance check failed:', error.message)
    }
    
    // 4. Test if the AMM address exists
    console.log('\n4. Testing AMM contract...')
    try {
      const code = await publicClient.getBytecode({ address: AMM_ADDRESS })
      if (code && code !== '0x') {
        console.log('✅ AMM contract exists')
      } else {
        console.log('❌ AMM contract does not exist or has no code')
      }
    } catch (error) {
      console.error('❌ AMM contract test failed:', error.message)
    }
    
    console.log('\n📋 Summary:')
    console.log('- USDT Token:', USDT_ADDRESS)
    console.log('- Your Address:', YOUR_ADDRESS)  
    console.log('- AMM Address:', AMM_ADDRESS)
    console.log('- Transaction:', '0x32511da88e48fd55b36982d6893ab164b6af692306b6c0a07f88e19fa95bb3be')
    
  } catch (error) {
    console.error('💥 Test script failed:', error)
  }
}

testTokenAndAllowance()