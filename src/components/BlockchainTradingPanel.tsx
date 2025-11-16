import { useState, useEffect } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Minus, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { approve, swapQuoteForYes, swapQuoteForNo, getAllowance, readQuoteTokenAddress, redeemTo, getMarketOutcome, getMarketOutcomeFromAPI, hasUserRedeemed, getTokenBalance, getTokenAddresses } from '@/lib/trade'
import { parseUnits, formatUnits, Address } from 'viem'

interface BlockchainTradingPanelProps {
  marketId: string
  ammAddress: Address
  quoteToken: string
  yesPrice: number
  noPrice: number
  cutoffUtc: string
  yesToken?: Address
  noToken?: Address
  onTradeSuccess?: () => void
}

export function BlockchainTradingPanel({ 
  marketId, 
  ammAddress, 
  quoteToken, 
  yesPrice, 
  noPrice,
  cutoffUtc,
  yesToken,
  noToken,
  onTradeSuccess 
}: BlockchainTradingPanelProps) {
  const { address, isConnected } = useAccount()
  const config = useConfig()
  const { toast } = useToast()
  
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [betType, setBetType] = useState<'yes' | 'no'>('yes')
  const [shares, setShares] = useState(10)
  const [limitPrice, setLimitPrice] = useState(yesPrice)
  const [isApproving, setIsApproving] = useState(false)
  const [isTrading, setIsTrading] = useState(false)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [allowance, setAllowance] = useState(0n)
  const [quoteTokenAddress, setQuoteTokenAddress] = useState<Address | null>(null)
  const [marketOutcome, setMarketOutcome] = useState(0)
  const [hasRedeemed, setHasRedeemed] = useState(false)
  const [yesBalance, setYesBalance] = useState(0n)
  const [noBalance, setNoBalance] = useState(0n)
  const [tokenAddresses, setTokenAddresses] = useState<{ yesToken: Address; noToken: Address } | null>(null)

  // Resolve quote token address
  useEffect(() => {
    async function resolveQuoteToken() {
      try {
        if (quoteToken.toUpperCase() === 'USDT') {
          const usdtAddress = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd' as Address
          setQuoteTokenAddress(usdtAddress)
          return
        }
        
        // Try to read from contract
        const tokenAddress = await readQuoteTokenAddress(ammAddress)
        setQuoteTokenAddress(tokenAddress)
      } catch (error) {
        console.error('Failed to resolve quote token:', error)
        toast({
          title: 'Error',
          description: 'Failed to resolve quote token address',
          variant: 'destructive'
        })
      }
    }
    
    if (ammAddress && quoteToken) {
      resolveQuoteToken()
    }
  }, [ammAddress, quoteToken, toast])

  // Check allowance when wallet connects or token address changes
  useEffect(() => {
    async function checkAllowance() {
      if (isConnected && address && quoteTokenAddress) {
        try {
          const currentAllowance = await getAllowance(quoteTokenAddress, address, ammAddress)
          setAllowance(currentAllowance)
        } catch (error) {
          console.error('Failed to check allowance:', error)
        }
      }
    }
    
    checkAllowance()
  }, [isConnected, address, quoteTokenAddress, ammAddress])

  // Check market state and user positions
  useEffect(() => {
    async function checkMarketState() {
      if (isConnected && address && ammAddress) {
        try {
          // Get market outcome (use API for testing when blockchain isn't resolved)
          const outcome = await getMarketOutcomeFromAPI(marketId)
          setMarketOutcome(outcome)
          
          // Check if user has redeemed
          const redeemed = await hasUserRedeemed(ammAddress, address)
          setHasRedeemed(redeemed)
          
          // Get token addresses - use props if provided, otherwise fetch from blockchain
          let addresses
          if (yesToken && noToken) {
            addresses = { yesToken, noToken }
          } else {
            addresses = await getTokenAddresses(ammAddress)
          }
          setTokenAddresses(addresses)
          
          // Get user's YES and NO token balances
          const [yBal, nBal] = await Promise.all([
            getTokenBalance(addresses.yesToken, address),
            getTokenBalance(addresses.noToken, address)
          ])
          setYesBalance(yBal)
          setNoBalance(nBal)
        } catch (error) {
          console.error('Failed to check market state:', error)
        }
      }
    }
    
    checkMarketState()
  }, [isConnected, address, ammAddress, yesToken, noToken])

  const tradeAmount = shares * (betType === 'yes' ? yesPrice : noPrice) / 100
  const needsApproval = quoteTokenAddress && allowance < parseUnits(tradeAmount.toString(), 18)
  
  // Check market state for UI logic
  const now = new Date()
  const cutoff = new Date(cutoffUtc)
  const pastCutoff = now > cutoff
  const hasTokens = yesBalance > 0n || noBalance > 0n
  const isResolved = marketOutcome > 0
  const canRedeem = pastCutoff && hasTokens && !hasRedeemed && isResolved
  const isLocked = pastCutoff && !isResolved

  const handleApprove = async () => {
    if (!isConnected || !address || !quoteTokenAddress) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      })
      return
    }

    setIsApproving(true)
    try {
      const amount = parseUnits('1000', 18) // Approve 1000 tokens
      await approve(config, quoteTokenAddress, ammAddress, amount)
      
      // Update allowance
      const newAllowance = await getAllowance(quoteTokenAddress, address, ammAddress)
      setAllowance(newAllowance)
      
      toast({
        title: 'Approval successful',
        description: 'You can now place trades'
      })
    } catch (error: any) {
      console.error('Approval failed:', error)
      toast({
        title: 'Approval failed',
        description: error.message || 'Transaction failed',
        variant: 'destructive'
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleTrade = async () => {
    if (!isConnected || !address || !quoteTokenAddress) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      })
      return
    }

    if (needsApproval) {
      toast({
        title: 'Approval required',
        description: 'Please approve the token first',
        variant: 'destructive'
      })
      return
    }

    setIsTrading(true)
    try {
      const amount = parseUnits(tradeAmount.toString(), 18)
      const minOut = 0n // For simplicity, no slippage protection in UI
      
      if (betType === 'yes') {
        await swapQuoteForYes(config, ammAddress, amount, minOut)
        toast({
          title: 'Trade successful!',
          description: `Bought ${shares} YES shares for $${tradeAmount.toFixed(2)}`
        })
      } else {
        await swapQuoteForNo(config, ammAddress, amount, minOut)
        toast({
          title: 'Trade successful!',
          description: `Bought ${shares} NO shares for $${tradeAmount.toFixed(2)}`
        })
      }
      
      onTradeSuccess?.()
    } catch (error: any) {
      console.error('Trade failed:', error)
      toast({
        title: 'Trade failed',
        description: error.message || 'Transaction failed',
        variant: 'destructive'
      })
    } finally {
      setIsTrading(false)
    }
  }

  const handleRedeem = async () => {
    if (!isConnected || !address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      })
      return
    }

    setIsRedeeming(true)
    try {
      await redeemTo(config, ammAddress, address)
      
      // Update state after successful redemption
      setHasRedeemed(true)
      
      toast({
        title: 'Redemption successful!',
        description: 'Your tokens have been redeemed for USDT'
      })
      
      onTradeSuccess?.()
    } catch (error: any) {
      console.error('Redeem failed:', error)
      toast({
        title: 'Redemption failed',
        description: error.message || 'Transaction failed',
        variant: 'destructive'
      })
    } finally {
      setIsRedeeming(false)
    }
  }

  const currentPrice = betType === 'yes' ? yesPrice : noPrice
  const toWin = shares

  return (
    <Card className="p-5 shadow-lg">
      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-5 h-11">
          <TabsTrigger value="buy" className="text-sm font-semibold">Buy</TabsTrigger>
          <TabsTrigger value="sell" className="text-sm font-semibold">Sell</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-5 mt-0">
          {/* Order Type Selector */}
          <div className="flex gap-2">
            <Button
              variant={orderType === "market" ? "secondary" : "ghost"}
              size="sm"
              className="flex-1 text-xs font-medium h-9"
              onClick={() => setOrderType("market")}
            >
              Market
            </Button>
            <Button
              variant={orderType === "limit" ? "secondary" : "ghost"}
              size="sm"
              className="flex-1 text-xs font-medium h-9"
              onClick={() => setOrderType("limit")}
            >
              Limit
            </Button>
          </div>

          {/* Yes/No Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              className={`h-14 rounded-xl font-semibold text-base ${betType === "yes" ? "bg-accent hover:bg-accent/90" : "bg-accent/20 hover:bg-accent/30"}`}
              size="lg"
              onClick={() => setBetType("yes")}
            >
              Yes {yesPrice}¢
            </Button>
            <Button 
              variant="outline" 
              className={`h-14 border-2 rounded-xl font-semibold text-base ${betType === "no" ? "bg-destructive/20 border-destructive hover:bg-destructive/30" : "hover:bg-muted"}`}
              size="lg"
              onClick={() => setBetType("no")}
            >
              No {noPrice}¢
            </Button>
          </div>

          {/* Limit Price */}
          {orderType === "limit" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Limit price</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  onClick={() => setLimitPrice(Math.max(1, limitPrice - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(Number(e.target.value))}
                  className="text-center h-10 font-medium"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  onClick={() => setLimitPrice(Math.min(99, limitPrice + 1))}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Shares */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Shares</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3"
                onClick={() => setShares(Math.max(1, shares - 10))}
              >
                -10
              </Button>
              <Input
                type="number"
                value={shares}
                onChange={(e) => setShares(Number(e.target.value))}
                className="text-center h-10 font-medium"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3"
                onClick={() => setShares(shares + 10)}
              >
                +10
              </Button>
            </div>
          </div>

          {/* Set Expiration Toggle */}
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm font-medium">Set expiration</Label>
            <Switch />
          </div>

          {/* Summary */}
          <div className="pt-4 space-y-3 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg price</span>
              <span className="font-medium">{currentPrice}¢</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-lg">${tradeAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">To Win</span>
              <span className="font-semibold text-accent text-base">${toWin.toFixed(2)}</span>
            </div>
          </div>

          {/* Trade/Redeem Buttons */}
          {!isConnected ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              Connect wallet to trade
            </div>
          ) : canRedeem ? (
            <div className="space-y-3">
              <div className="text-sm text-center text-muted-foreground">
                Market ended • {hasTokens && `You have ${formatUnits(yesBalance, 18)} YES, ${formatUnits(noBalance, 18)} NO tokens`}
              </div>
              <Button 
                className="w-full h-12 rounded-xl font-semibold text-base bg-green-600 hover:bg-green-700" 
                size="lg"
                onClick={handleRedeem}
                disabled={isRedeeming}
              >
                {isRedeeming ? 'Redeeming...' : 'Redeem Tokens'}
              </Button>
            </div>
          ) : hasRedeemed ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              ✅ You have already redeemed your tokens
            </div>
          ) : isLocked ? (
            <div className="space-y-3">
              <div className="text-center text-sm text-muted-foreground py-4">
                🔒 Locked - awaiting resolution
              </div>
              {hasTokens && (
                <div className="text-xs text-center text-muted-foreground">
                  You have {formatUnits(yesBalance, 18)} YES, {formatUnits(noBalance, 18)} NO tokens
                </div>
              )}
            </div>
          ) : pastCutoff && !hasTokens ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              Market ended • No tokens to redeem
            </div>
          ) : needsApproval ? (
            <Button 
              className="w-full h-12 rounded-xl font-semibold text-base" 
              size="lg"
              onClick={handleApprove}
              disabled={isApproving || isLocked}
            >
              {isApproving ? 'Approving...' : `Approve ${quoteToken}`}
            </Button>
          ) : (
            <Button 
              className="w-full h-12 rounded-xl font-semibold text-base" 
              size="lg"
              onClick={handleTrade}
              disabled={isTrading || isLocked}
            >
              {isTrading ? 'Trading...' : `Buy ${betType.toUpperCase()} - $${tradeAmount.toFixed(2)}`}
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}