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
import { GradientBlur } from "@/components/ui/gradient-blur";
import { BlockchainTradingPanel } from "@/components/BlockchainTradingPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useMarketData } from "@/hooks/useMarketData";
import { useToast } from "@/hooks/use-toast";
import {
  Share2,
  Maximize2,
  Flag,
  Bookmark,
  TrendingUp,
  Clock,
  Loader2,
} from "lucide-react";

const BlockchainMarket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [activeTab, setActiveTab] = useState<"comments" | "holders" | "activity">("comments");
  const [showMore, setShowMore] = useState(false);

  const marketId = Number(id) || 1;
  const { data: market, isLoading, error, rawApiData } = useMarketData(marketId);

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

  const handleTradeSuccess = () => {
    toast({
      title: "🎉 Trade Successful!",
      description: "Your trade has been executed on the blockchain",
    });
  };

  // Mock data for tabs (can be replaced with real data later)
  const mockHolders = [
    { name: "Sarah M.", position: "YES", shares: 450, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
    { name: "Mike R.", position: "YES", shares: 320, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    { name: "Emma K.", position: "NO", shares: 280, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  ];

  const mockComments = [
    { name: "Alex P.", time: "2h ago", text: "Taylor Swift has been trending lately, I think this is a solid bet!", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
    { name: "Jordan L.", time: "5h ago", text: "Not so sure about this one. Competition is tough this month.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header onDepositClick={handleDepositClick} />
        <main className="flex-1 bg-background flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading market data...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header onDepositClick={handleDepositClick} />
        <main className="flex-1 bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Market not found</h2>
            <p className="text-muted-foreground mb-4">The market you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                    <span className="font-medium">{market.volume}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {market.resolutionDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">Market ID:</span>
                    <span className="text-sm font-mono">{market.marketId}</span>
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className="text-sm font-semibold">{market.status}</span>
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
                    <p className="text-2xl font-semibold text-foreground">Live Trading</p>
                    <p className="text-sm text-muted-foreground">Blockchain-powered predictions</p>
                    <p className="text-xs text-muted-foreground font-mono">{market.ammAddress}</p>
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

            {/* Right Sidebar - Blockchain Trading Panel */}
            <div className="space-y-4 lg:sticky lg:top-8 self-start">
              {rawApiData && (
                <BlockchainTradingPanel
                  marketId={market.marketId}
                  ammAddress={market.ammAddress as `0x${string}`}
                  quoteToken={market.quoteToken}
                  yesPrice={market.yesPrice}
                  noPrice={market.noPrice}
                  cutoffUtc={market.cutoffUtc}
                  yesToken={rawApiData.yesToken}
                  noToken={rawApiData.noToken}
                  onTradeSuccess={handleTradeSuccess}
                />
              )}

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

export default BlockchainMarket;