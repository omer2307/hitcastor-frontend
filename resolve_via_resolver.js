import { createWalletClient, createPublicClient, http, parseAbi } from 'viem'
import { bscTestnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

const rpc = 'https://bsc-testnet.publicnode.com'
const pc = createPublicClient({ chain: bscTestnet, transport: http(rpc) })

const resolverKey = '0x90b5e07a03ad94d89acf98f3c32df9f596fa32b86d8757388ca50895bc937352'
const resolverAccount = privateKeyToAccount(resolverKey)

const wc = createWalletClient({
  account: resolverAccount,
  chain: bscTestnet,
  transport: http(rpc)
})

async function resolveMarket() {
  const resolverAddress = '0xFc3930B0E48F6CB36C3179108779f14add11d667'
  const ammAddress = '0x3b943c51d1fd2b423a6500c3dbd2874ec122dd3d'
  
  console.log('🎯 Resolving Market 1 via resolver contract')
  console.log('  Resolver:', resolverAddress)
  console.log('  Market:', ammAddress)
  console.log('  Account:', resolverAccount.address)
  
  const resolverAbi = parseAbi([
    'function resolve(address market, uint8 outcome) external',
    'function commit(uint256 marketId, uint8 outcome, uint16 rank) external'
  ])
  
  try {
    console.log('🔄 Calling resolver.resolve...')
    const hash = await wc.writeContract({
      address: resolverAddress,
      abi: resolverAbi,
      functionName: 'resolve',
      args: [ammAddress, 1]
    })
    
    console.log('⏳ Transaction submitted:', hash)
    const receipt = await pc.waitForTransactionReceipt({ hash })
    
    if (receipt.status === 'success') {
      console.log('✅ Resolution successful!')
      
      const marketAbi = parseAbi(['function outcome() view returns (uint8)'])
      const outcome = await pc.readContract({
        address: ammAddress,
        abi: marketAbi,
        functionName: 'outcome'
      })
      console.log('🎉 Market outcome:', outcome, outcome === 1 ? '(YES WINS)' : '(NO WINS)')
    } else {
      console.log('❌ Transaction failed')
    }
    
  } catch (error) {
    console.error('❌ Resolution failed:', error.message)
    
    // Try alternative: commit function
    if (error.message.includes('resolve')) {
      console.log('🔄 Trying commit function instead...')
      try {
        const hash2 = await wc.writeContract({
          address: resolverAddress,
          abi: resolverAbi,
          functionName: 'commit',
          args: [1, 1, 12] // marketId, outcome, rank
        })
        
        console.log('⏳ Commit transaction:', hash2)
        const receipt2 = await pc.waitForTransactionReceipt({ hash: hash2 })
        console.log('Commit result:', receipt2.status)
        
      } catch (error2) {
        console.error('❌ Commit also failed:', error2.message)
      }
    }
  }
}

await resolveMarket()
