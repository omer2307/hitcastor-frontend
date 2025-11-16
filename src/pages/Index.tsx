import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarketCard } from "@/components/MarketCard";
import { AuthModal } from "@/components/AuthModal";
import { DepositModal } from "@/components/DepositModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { useAuth } from "@/contexts/AuthContext";
import { useMarkets } from "@/hooks/useMarkets";
import { Loader2 } from "lucide-react";
import { getCoverImage } from "@/lib/images";
const mockMarkets = [{
  id: 1,
  question: "Will 'Anti-Hero' by Taylor Swift improve its position on Spotify Global Top 50 by Mar 15, 2025?",
  songName: "Anti-Hero",
  artist: "Taylor Swift",
  chart: "Spotify Global",
  startDate: "Mar 1",
  resolutionDate: "Mar 15",
  yesPrice: 62,
  noPrice: 38,
  volume: "$12.4K",
  coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop"
}, {
  id: 2,
  question: "Will 'As It Was' by Harry Styles climb on Spotify Global by Mar 20, 2025?",
  songName: "As It Was",
  artist: "Harry Styles",
  chart: "Spotify Global",
  startDate: "Mar 5",
  resolutionDate: "Mar 20",
  yesPrice: 45,
  noPrice: 55,
  volume: "$8.2K",
  coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop"
}, {
  id: 3,
  question: "Will 'Flowers' by Miley Cyrus improve on Spotify Global by Mar 18, 2025?",
  songName: "Flowers",
  artist: "Miley Cyrus",
  chart: "Spotify Global",
  startDate: "Mar 1",
  resolutionDate: "Mar 18",
  yesPrice: 78,
  noPrice: 22,
  volume: "$15.7K",
  coverImage: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400&h=400&fit=crop"
}, {
  id: 4,
  question: "Will 'Unholy' by Sam Smith rise on Spotify Global by Mar 12, 2025?",
  songName: "Unholy",
  artist: "Sam Smith",
  chart: "Spotify Global",
  startDate: "Feb 28",
  resolutionDate: "Mar 12",
  yesPrice: 34,
  noPrice: 66,
  volume: "$6.1K",
  coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop"
}, {
  id: 5,
  question: "Will 'Kill Bill' by SZA climb on Spotify Global by Mar 25, 2025?",
  songName: "Kill Bill",
  artist: "SZA",
  chart: "Spotify Global",
  startDate: "Mar 10",
  resolutionDate: "Mar 25",
  yesPrice: 89,
  noPrice: 11,
  volume: "$22.3K",
  coverImage: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop"
}, {
  id: 6,
  question: "Will 'Calm Down' by Rema improve on Spotify Global by Mar 14, 2025?",
  songName: "Calm Down",
  artist: "Rema",
  chart: "Spotify Global",
  startDate: "Mar 1",
  resolutionDate: "Mar 14",
  yesPrice: 56,
  noPrice: 44,
  volume: "$9.8K",
  coverImage: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop"
}, {
  id: 7,
  question: "Will 'Creepin' by Metro Boomin rise on Spotify Global by Mar 22, 2025?",
  songName: "Creepin'",
  artist: "Metro Boomin",
  chart: "Spotify Global",
  startDate: "Mar 8",
  resolutionDate: "Mar 22",
  yesPrice: 41,
  noPrice: 59,
  volume: "$11.2K",
  coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop"
}, {
  id: 8,
  question: "Will 'Escapism' by RAYE climb on Spotify Global by Mar 16, 2025?",
  songName: "Escapism",
  artist: "RAYE",
  chart: "Spotify Global",
  startDate: "Mar 2",
  resolutionDate: "Mar 16",
  yesPrice: 67,
  noPrice: 33,
  volume: "$13.9K",
  coverImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop"
}, {
  id: 9,
  question: "Will 'Die For You' by The Weeknd improve on Spotify Global by Mar 19, 2025?",
  songName: "Die For You",
  artist: "The Weeknd",
  chart: "Spotify Global",
  startDate: "Mar 5",
  resolutionDate: "Mar 19",
  yesPrice: 52,
  noPrice: 48,
  volume: "$10.5K",
  coverImage: "https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=400&h=400&fit=crop"
}, {
  id: 10,
  question: "Will 'Boy's a Liar Pt. 2' by PinkPantheress rise on Spotify Global by Mar 17, 2025?",
  songName: "Boy's a Liar Pt. 2",
  artist: "PinkPantheress",
  chart: "Spotify Global",
  startDate: "Mar 3",
  resolutionDate: "Mar 17",
  yesPrice: 73,
  noPrice: 27,
  volume: "$17.6K",
  coverImage: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=400&h=400&fit=crop"
}, {
  id: 11,
  question: "Will 'Rich Flex' by Drake climb on Spotify Global by Mar 21, 2025?",
  songName: "Rich Flex",
  artist: "Drake",
  chart: "Spotify Global",
  startDate: "Mar 7",
  resolutionDate: "Mar 21",
  yesPrice: 48,
  noPrice: 52,
  volume: "$14.3K",
  coverImage: "https://images.unsplash.com/photo-1483412468200-72182dbbc544?w=400&h=400&fit=crop"
}, {
  id: 12,
  question: "Will 'Daylight' by David Kushner improve on Spotify Global by Mar 13, 2025?",
  songName: "Daylight",
  artist: "David Kushner",
  chart: "Spotify Global",
  startDate: "Mar 1",
  resolutionDate: "Mar 13",
  yesPrice: 81,
  noPrice: 19,
  volume: "$19.4K",
  coverImage: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400&fit=crop"
}, {
  id: 13,
  question: "Will 'Paint The Town Red' by Doja Cat rise on Spotify Global by Mar 24, 2025?",
  songName: "Paint The Town Red",
  artist: "Doja Cat",
  chart: "Spotify Global",
  startDate: "Mar 10",
  resolutionDate: "Mar 24",
  yesPrice: 59,
  noPrice: 41,
  volume: "$12.8K",
  coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop"
}, {
  id: 14,
  question: "Will 'Vampire' by Olivia Rodrigo climb on Spotify Global by Mar 11, 2025?",
  songName: "Vampire",
  artist: "Olivia Rodrigo",
  chart: "Spotify Global",
  startDate: "Feb 25",
  resolutionDate: "Mar 11",
  yesPrice: 44,
  noPrice: 56,
  volume: "$8.7K",
  coverImage: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop"
}, {
  id: 15,
  question: "Will 'Cruel Summer' by Taylor Swift improve on Spotify Global by Mar 23, 2025?",
  songName: "Cruel Summer",
  artist: "Taylor Swift",
  chart: "Spotify Global",
  startDate: "Mar 9",
  resolutionDate: "Mar 23",
  yesPrice: 71,
  noPrice: 29,
  volume: "$16.2K",
  coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop"
}, {
  id: 16,
  question: "Will 'greedy' by Tate McRae rise on Spotify Global by Mar 26, 2025?",
  songName: "greedy",
  artist: "Tate McRae",
  chart: "Spotify Global",
  startDate: "Mar 12",
  resolutionDate: "Mar 26",
  yesPrice: 85,
  noPrice: 15,
  volume: "$21.5K",
  coverImage: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=400&h=400&fit=crop"
}];
const Index = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated
  } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("spotify");
  
  // Fetch markets from API
  const { data: marketsData, isLoading: marketsLoading, error: marketsError } = useMarkets('OPEN');
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
  return <div className="flex flex-col min-h-screen">
      <Header onLoginClick={handleLoginClick} onSignUpClick={handleSignUpClick} onDepositClick={handleDepositClick} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="container relative px-4 py-20 md:py-32">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent animate-fade-in">
                Pick the hits. Predict the risers. Win big.
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto animate-fade-in">Predict music chart positions with nonstop real-time markets. </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <RainbowButton onClick={() => {
                  const firstMarket = marketsData?.markets?.[0]?.marketId || "2"
                  navigate(`/market/${firstMarket}`)
                }}>
                  Start Predicting
                </RainbowButton>
                <Button size="lg" variant="outline" className="text-base" onClick={() => navigate("/how-it-works")}>
                  Learn How
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Markets Grid */}
        <section className="container px-4 py-12 md:py-16">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Active Markets</h2>
              
            </div>
            
            {/* Platform Filter Bar */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              <button 
                onClick={() => setSelectedPlatform("spotify")} 
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap relative ${
                  selectedPlatform === "spotify" 
                    ? "text-primary font-semibold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:shadow-[0_0_10px_rgba(var(--primary),0.5)] after:animate-pulse" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                Spotify
              </button>
              <button onClick={() => setComingSoonOpen(true)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors whitespace-nowrap">
                Apple Music
              </button>
              <button onClick={() => setComingSoonOpen(true)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors whitespace-nowrap">
                YouTube
              </button>
              <button onClick={() => setComingSoonOpen(true)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors whitespace-nowrap">
                Billboard
              </button>
              <button onClick={() => setComingSoonOpen(true)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors whitespace-nowrap">
                Multi-Platform
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {marketsLoading && (
                <div className="col-span-full flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading markets...</span>
                </div>
              )}
              
              {marketsError && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Failed to load markets. Please try again later.
                </div>
              )}
              
              {marketsData?.markets?.map(market => {
                // Transform API data to MarketCard format
                const transformedMarket = {
                  id: parseInt(market.marketId),
                  question: `Will '${market.title}' by ${market.artist} improve its position on Spotify Global Top 50 by ${new Date(market.cutoffUtc).toLocaleDateString()}?`,
                  songName: market.title,
                  artist: market.artist,
                  chart: "Spotify Global",
                  startDate: "Mar 1",
                  resolutionDate: new Date(market.cutoffUtc).toLocaleDateString(),
                  yesPrice: Math.round(market.priceYes * 100),
                  noPrice: Math.round(market.priceNo * 100),
                  volume: `$${(market.poolUSD / 1000).toFixed(1)}K`,
                  coverImage: getCoverImage(market.artist, market.title)
                };
                
                return (
                  <MarketCard 
                    key={market.marketId} 
                    {...transformedMarket} 
                    onClick={() => navigate(`/market/${market.marketId}`)} 
                  />
                );
              })}
              
              {/* Fallback to mock markets if API fails */}
              {!marketsLoading && marketsError && mockMarkets.map(market => 
                <MarketCard key={market.id} {...market} onClick={() => navigate(`/market/${market.id}`)} />
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      {/* Twitter/X Icon - Bottom Left */}
      

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} mode={authMode} />
      <DepositModal open={depositModalOpen} onOpenChange={setDepositModalOpen} />
      
      {/* Coming Soon Dialog */}
      <Dialog open={comingSoonOpen} onOpenChange={setComingSoonOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Coming Soon</DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground py-4">
            Stay tuned — we will be opening this market soon.
          </p>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Index;