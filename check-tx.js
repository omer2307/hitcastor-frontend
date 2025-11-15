// Check transaction status and details
import { createPublicClient, http } from 'viem'
import { bscTestnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http('https://bsc-testnet-dataseed.bnbchain.org')
})

const TX_HASH = '0x32511da88e48fd55b36982d6893ab164b6af692306b6c0a07f88e19fa95bb3be'

async function checkTransaction() {
  try {
    console.log('🔍 Checking transaction:', TX_HASH)
    
    // Get transaction receipt
    const receipt = await publicClient.getTransactionReceipt({
      hash: TX_HASH
    })
    
    console.log('\n📋 Transaction Receipt:')
    console.log('- Status:', receipt.status === 'success' ? '✅ SUCCESS' : '❌ FAILED')
    console.log('- Gas Used:', receipt.gasUsed.toString())
    console.log('- From:', receipt.from)
    console.log('- To:', receipt.to)
    console.log('- Logs Count:', receipt.logs.length)
    
    if (receipt.status === 'reverted') {
      console.log('💥 Transaction was reverted!')
      return
    }
    
    // Get actual transaction data
    const tx = await publicClient.getTransaction({
      hash: TX_HASH
    })
    
    console.log('\n📋 Transaction Data:')
    console.log('- To Contract:', tx.to)
    console.log('- Value:', tx.value.toString())
    console.log('- Input Data:', tx.input)
    
    // Decode the input data to see what function was called
    if (tx.input.startsWith('0x095ea7b3')) {
      console.log('✅ This is an approve() function call')
      console.log('- Function selector: 0x095ea7b3 (approve)')
      
      // Extract spender and amount from input data
      const spender = '0x' + tx.input.slice(34, 74) // bytes 4-36
      const amount = '0x' + tx.input.slice(74, 138) // bytes 36-68
      
      console.log('- Spender:', spender)
      console.log('- Amount (hex):', amount)
      console.log('- Amount (decimal):', BigInt(amount).toString())
    } else {
      console.log('❌ This is NOT an approve() function call')
      console.log('- Function selector:', tx.input.slice(0, 10))
    }
    
    // Check if there are any logs (events)
    if (receipt.logs.length > 0) {
      console.log('\n📋 Transaction Logs:')
      receipt.logs.forEach((log, i) => {
        console.log(`Log ${i}:`, {
          address: log.address,
          topics: log.topics,
          data: log.data
        })
      })
    } else {
      console.log('\n⚠️  No logs found - this is suspicious for an approve transaction')
    }
    
  } catch (error) {
    console.error('💥 Failed to check transaction:', error.message)
  }
}

checkTransaction()