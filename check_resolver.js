import { createPublicClient, http, parseAbi } from 'viem'
import { bscTestnet } from 'viem/chains'

const pc = createPublicClient({ 
  chain: bscTestnet, 
  transport: http('https://bsc-testnet.publicnode.com') 
})

const ammAddress = '0x3b943c51d1fd2b423a6500c3dbd2874ec122dd3d'
const abi = parseAbi([
  'function resolver() view returns (address)',
  'function outcome() view returns (uint8)',
  'function cutoff() view returns (uint64)'
])

try {
  const [resolver, outcome] = await Promise.all([
    pc.readContract({ address: ammAddress, abi, functionName: 'resolver' }),
    pc.readContract({ address: ammAddress, abi, functionName: 'outcome' })
  ])
  
  console.log('📊 Market Contract State:')
  console.log('  Resolver:', resolver)
  console.log('  Current outcome:', outcome, outcome === 0 ? '(UNRESOLVED)' : outcome === 1 ? '(YES)' : '(NO)')
  console.log('  Our admin account:', '0x2e88162C709CB561AeB6C8D6EbE487850f107DAE')
  console.log('  Match:', resolver.toLowerCase() === '0x2e88162C709CB561AeB6C8D6EbE487850f107DAE'.toLowerCase() ? '✅ YES' : '❌ NO')
  
} catch (error) {
  console.error('Error:', error.message)
}
