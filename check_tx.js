import { createPublicClient, http } from 'viem'
import { bscTestnet } from 'viem/chains'

const pc = createPublicClient({ 
  chain: bscTestnet, 
  transport: http('https://bsc-testnet.publicnode.com') 
})

const hash = '0x0a07b39a7018ff2846864166adb701db7413031423d699ce4a9a0ea0d8654e0a'

try {
  const receipt = await pc.getTransactionReceipt({ hash })
  console.log('📋 Transaction Receipt:')
  console.log('  Status:', receipt.status)
  console.log('  Gas Used:', receipt.gasUsed.toString())
  console.log('  Block:', receipt.blockNumber.toString())
  
  if (receipt.logs && receipt.logs.length > 0) {
    console.log('  Logs:', receipt.logs.length)
  }
  
  // Low gas usage suggests early revert
  if (Number(receipt.gasUsed) < 50000) {
    console.log('❌ Low gas usage indicates early revert - likely requires resolution first')
  }
  
} catch (error) {
  console.error('Error:', error.message)
}
