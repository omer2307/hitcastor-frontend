import { Address, erc20Abi, createPublicClient, createWalletClient, http, Hex } from 'viem'
import { bscTestnet } from 'viem/chains'
import { writeContract } from '@wagmi/core'
import { Config } from 'wagmi'
import ERC20 from 'hitcastor-sdk/dist/chain/abi/ERC20_MIN.json'
import MarketAbi from 'hitcastor-sdk/dist/chain/abi/Market.json'

const chain = bscTestnet // BSC Testnet - FREE for testing
const pc = createPublicClient({ chain, transport: http(import.meta.env.VITE_RPC_URL || 'https://bsc-testnet-dataseed.bnbchain.org') })

// Read quote token address from the AMM/Market contract.
// Tries common getters; then scans ABI for a 0-arg address-returning fn with "quote" in name.
export async function readQuoteTokenAddress(amm: Address): Promise<Address> {
  const tryNames = ['quoteToken','quote','getQuoteToken']
  for (const name of tryNames) {
    try {
      const addr: string = await pc.readContract({ address: amm, abi: MarketAbi.abi as any, functionName: name as any, args: [] })
      if (/^0x[0-9a-fA-F]{40}$/.test(addr)) return addr as Address
    } catch {}
  }
  const any = (MarketAbi.abi as any[]).find((fn: any) =>
    fn.type === 'function' &&
    (fn.inputs?.length ?? 0) === 0 &&
    (fn.outputs?.[0]?.type === 'address') &&
    /quote/i.test(fn.name)
  )
  if (any) {
    const addr: string = await pc.readContract({ address: amm, abi: MarketAbi.abi as any, functionName: any.name as any, args: [] })
    if (/^0x[0-9a-fA-F]{40}$/.test(addr)) return addr as Address
  }
  throw new Error('Quote token getter not found in ABI')
}

export async function getDecimals(token: Address): Promise<number> {
  try {
    const d = await pc.readContract({ address: token, abi: ERC20 as any, functionName: 'decimals' })
    return Number(d)
  } catch {
    return 18
  }
}

export async function getAllowance(token: Address, owner: Address, spender: Address){
  try {
    const a = await pc.readContract({ address: token, abi: ERC20 as any, functionName: 'allowance', args: [owner, spender] })
    return BigInt(a as any)
  } catch { return 0n }
}

export async function approve(config: Config, token: Address, spender: Address, amount: bigint){
  const hash = await writeContract(config, { address: token, abi: ERC20 as any, functionName: 'approve', args: [spender, amount] })
  console.log('🔄 Approve tx submitted, waiting for confirmation...', hash)
  
  // Wait for transaction to be mined
  const receipt = await pc.waitForTransactionReceipt({ hash })
  console.log('✅ Approve tx confirmed!', { status: receipt.status, gasUsed: receipt.gasUsed.toString() })
  
  return hash
}

// --- Trading (exact signatures from your audit) ---
export async function swapQuoteForYes(config: Config, amm: Address, amountIn: bigint, minOut: bigint){
  const hash = await writeContract(config, { address: amm, abi: MarketAbi.abi as any, functionName: 'swapQuoteForYes', args: [amountIn, minOut] })
  console.log('🔄 SwapQuoteForYes tx submitted, waiting for confirmation...', hash)
  
  // Wait for transaction to be mined
  const receipt = await pc.waitForTransactionReceipt({ hash })
  
  if (receipt.status === 'reverted') {
    console.error('❌ SwapQuoteForYes tx failed!', { hash, gasUsed: receipt.gasUsed.toString() })
    throw new Error(`Transaction failed: ${hash}`)
  }
  
  console.log('✅ SwapQuoteForYes tx confirmed!', { status: receipt.status, gasUsed: receipt.gasUsed.toString() })
  return hash
}

export async function swapQuoteForNo(config: Config, amm: Address, amountIn: bigint, minOut: bigint){
  const hash = await writeContract(config, { address: amm, abi: MarketAbi.abi as any, functionName: 'swapQuoteForNo', args: [amountIn, minOut] })
  console.log('🔄 SwapQuoteForNo tx submitted, waiting for confirmation...', hash)
  
  // Wait for transaction to be mined
  const receipt = await pc.waitForTransactionReceipt({ hash })
  
  if (receipt.status === 'reverted') {
    console.error('❌ SwapQuoteForNo tx failed!', { hash, gasUsed: receipt.gasUsed.toString() })
    throw new Error(`Transaction failed: ${hash}`)
  }
  
  console.log('✅ SwapQuoteForNo tx confirmed!', { status: receipt.status, gasUsed: receipt.gasUsed.toString() })
  return hash
}

// redeem(address to)
export async function redeemTo(config: Config, amm: Address, to: Address){
  const hash = await writeContract(config, { address: amm, abi: MarketAbi.abi as any, functionName: 'redeem', args: [to] })
  console.log('🔄 Redeem tx submitted, waiting for confirmation...', hash)
  
  // Wait for transaction to be mined
  const receipt = await pc.waitForTransactionReceipt({ hash })
  
  if (receipt.status === 'reverted') {
    console.error('❌ Redeem tx failed!', { hash, gasUsed: receipt.gasUsed.toString() })
    throw new Error(`Transaction failed: ${hash}`)
  }
  
  console.log('✅ Redeem tx confirmed!', { status: receipt.status, gasUsed: receipt.gasUsed.toString() })
  return hash
}