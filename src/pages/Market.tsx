import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { DepositModal } from "@/components/DepositModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GradientBlur } from "@/components/ui/gradient-blur";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Share2,
  Maximize2,
  Flag,
  Bookmark,
  ChevronDown,
  TrendingUp,
  Minus,
  Plus,
  Clock,
} from "lucide-react";

const Market = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [betType, setBetType] = useState<"yes" | "no">("yes");
  const [shares, setShares] = useState(10);
  const [limitPrice, setLimitPrice] = useState(62);
  const [activeTab, setActiveTab] = useState<"comments" | "holders" | "activity">("comments");
  const [showMore, setShowMore] = useState(false);

  const handleLoginClick = () => {
    setAuthMode("login");
    setAuthModalOpen(true);
  };

  const handleSignUpClick = () => {
    setAuthMode("signup");
    setAuthModalOpen(true);
  };

  const handleDepositClick = () => {
    setDepositModalOpen(true);
  };

  const handlePlaceBet = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const betAmount = shares * (betType === "yes" ? market.yesPrice : market.noPrice) / 100;
    
    if (betAmount > user.wallet.cashBalance) {
      toast({
        title: "Insufficient funds",
        description: "Please deposit more funds to place this bet",
        variant: "destructive",
      });
      setDepositModalOpen(true);
      return;
    }

    // Place bet and update portfolio
    toast({
      title: "🎉 Congratulations!",
      description: `Your bet of ${shares} shares on ${betType === "yes" ? "Yes" : "No"} has been placed successfully!`,
    });

    // Add to portfolio (in a real app, this would update the context)
    // For now, just show success message
  };

  // Mock market data
  const market = {
    question: "Will 'Anti-Hero' by Taylor Swift improve its position on Spotify Global Top 50 by Mar 15, 2025?",
    songName: "Anti-Hero",
    artist: "Taylor Swift",
    chart: "Spotify Global Top 50",
    volume: "$12.4K",
    resolutionDate: "Mar 15, 2025",
    probability: 62,
    yesPrice: 62,
    noPrice: 38,
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop"
  };

  const mockHolders = [
    { name: "Sarah M.", position: "YES", shares: 450, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
    { name: "Mike R.", position: "YES", shares: 320, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    { name: "Emma K.", position: "NO", shares: 280, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  ];

  const mockComments = [
    { name: "Alex P.", time: "2h ago", text: "Taylor Swift has been trending lately, I think this is a solid bet!", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
    { name: "Jordan L.", time: "5h ago", text: "Not so sure about this one. Competition is tough this month.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header onDepositClick={handleDepositClick} />

      <main className="flex-1 bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Left Column - Main Content */}
            <div className="space-y-6">
              {/* Market Header */}
              <div className="flex items-start gap-4">
                <img
                  src={market.coverImage}
                  alt={market.songName}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-semibold leading-tight mb-3">
                    {market.question}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                    <span className="font-medium">${market.volume}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Dec 31, 2024
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Flag className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-xs">1D</Button>
                    <Button variant="ghost" size="sm" className="text-xs">1W</Button>
                    <Button variant="ghost" size="sm" className="text-xs">1M</Button>
                    <Button variant="ghost" size="sm" className="text-xs">ALL</Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <GradientBlur
                  radius={200}
                  opacityDecay={0.85}
                  backgroundColor="hsl(var(--muted) / 0.1)"
                  color="hsl(var(--primary) / 0.4)"
                  className="h-[320px] rounded-xl border border-border/50 flex flex-col items-center justify-center gap-4"
                >
                  <div className="w-20 h-20 rounded-full bg-background/40 backdrop-blur-sm border border-border/30 flex items-center justify-center">
                    <TrendingUp className="h-10 w-10 text-primary/60" strokeWidth={1.5} />
                  </div>
                  <div className="text-center space-y-2 backdrop-blur-sm bg-background/20 px-8 py-4 rounded-xl border border-border/20">
                    <p className="text-2xl font-semibold text-foreground">Stay tuned</p>
                    <p className="text-sm text-muted-foreground">Soon we will be open</p>
                  </div>
                </GradientBlur>
              </Card>

              {/* Tabs Section */}
              <Card className="p-6">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                    <TabsTrigger value="holders">Top Holders</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="comments" className="mt-0 space-y-6">
                    <div className="space-y-4">
                      <Input placeholder="Add a comment..." className="w-full" />
                      {mockComments.map((comment, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                            {comment.name.split(' ')[0][0]}{comment.name.split(' ')[1]?.[0]}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">{comment.name}</p>
                              <span className="text-xs text-muted-foreground">{comment.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="holders" className="mt-0">
                    <div className="grid grid-cols-2 gap-8">
                      {/* Yes Holders */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-accent uppercase tracking-wide mb-4">Yes holders</h3>
                        <div className="space-y-3">
                          {mockHolders.filter(h => h.position === 'YES').map((holder, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center font-semibold text-white text-xs">
                                {holder.name.split(' ')[0][0]}{holder.name.split(' ')[1]?.[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{holder.name}</p>
                              </div>
                              <span className="text-sm font-semibold text-accent">{holder.shares}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* No Holders */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-destructive uppercase tracking-wide mb-4">No holders</h3>
                        <div className="space-y-3">
                          {mockHolders.filter(h => h.position === 'NO').map((holder, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center font-semibold text-white text-xs">
                                {holder.name.split(' ')[0][0]}{holder.name.split(' ')[1]?.[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{holder.name}</p>
                              </div>
                              <span className="text-sm font-semibold text-destructive">{holder.shares}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="mt-0">
                    <p className="text-sm text-muted-foreground text-center py-12">No recent activity</p>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            {/* Right Sidebar - Trading Panel */}
            <div className="space-y-4 lg:sticky lg:top-8 self-start">
              {/* Trading Card */}
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
                        Yes {market.yesPrice}¢
                      </Button>
                      <Button 
                        variant="outline" 
                        className={`h-14 border-2 rounded-xl font-semibold text-base ${betType === "no" ? "bg-destructive/20 border-destructive hover:bg-destructive/30" : "hover:bg-muted"}`}
                        size="lg"
                        onClick={() => setBetType("no")}
                      >
                        No {market.noPrice}¢
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
                        <span className="font-medium">{market.yesPrice}¢</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold text-lg">${(shares * market.yesPrice / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">To Win</span>
                        <span className="font-semibold text-accent text-base">${shares.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Trade Button */}
                    <Button 
                      className="w-full h-12 rounded-xl font-semibold text-base" 
                      size="lg"
                      onClick={handlePlaceBet}
                    >
                      Place Bet
                    </Button>
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Related Markets */}
              <Card className="p-5">
                <h3 className="text-base font-semibold mb-4">Related markets</h3>
                <div className="space-y-2">
                  {[
                    { song: "As It Was", artist: "Harry Styles", prob: 45 },
                    { song: "Flowers", artist: "Miley Cyrus", prob: 78 },
                    { song: "Kill Bill", artist: "SZA", prob: 89 },
                  ].map((item, i) => (
                    <button
                      key={i}
                      className="w-full text-left p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.song}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.artist}</p>
                        </div>
                        <span className="text-sm font-semibold text-accent ml-3">{item.prob}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <DepositModal open={depositModalOpen} onOpenChange={setDepositModalOpen} />
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={authMode}
      />
    </div>
  );
};

export default Market;
