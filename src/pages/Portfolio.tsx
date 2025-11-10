import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DepositModal } from "@/components/DepositModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Portfolio = () => {
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDepositClick = () => {
    setDepositModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onDepositClick={handleDepositClick} />

      <div className="container mx-auto px-4 md:px-6 py-8 flex-1">
        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Balance Card */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <div className="w-6 h-6 rounded-full border-2 border-green-600 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                </div>
                <span>Portfolio</span>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold">${user?.wallet.portfolioBalance.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Today</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDepositClick}>Deposit</Button>
                <Button variant="outline">Withdraw</Button>
              </div>
            </div>
          </Card>

          {/* Profit/Loss Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-destructive">▼</span>
                <h2 className="text-sm font-medium text-muted-foreground">Profit/Loss</h2>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">1D</Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">1W</Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">1M</Button>
                <Button variant="secondary" size="sm" className="h-7 px-2 text-xs">ALL</Button>
              </div>
            </div>
            <div className="mb-4">
              <div className="text-3xl font-bold text-destructive">-$1,005.40</div>
              <div className="text-sm text-muted-foreground">All-Time</div>
            </div>
            <div className="h-24 relative">
              <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="profitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(210 100% 75%)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(210 100% 75%)" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 40 L 50 35 L 100 30 L 150 10 L 200 60 L 250 60 L 300 60"
                  fill="none"
                  stroke="hsl(210 100% 75%)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M 0 40 L 50 35 L 100 30 L 150 10 L 200 60 L 250 60 L 300 60 L 300 80 L 0 80 Z"
                  fill="url(#profitGradient)"
                />
              </svg>
            </div>
          </Card>
        </div>

        {/* Positions Table */}
        <Card className="p-6">
          <Tabs defaultValue="positions" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="positions">Positions</TabsTrigger>
                <TabsTrigger value="orders">Open orders</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <Button variant="ghost" size="sm">Current value</Button>
            </div>

            <TabsContent value="positions" className="mt-0 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search"
                  className="pl-9"
                />
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Market</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Avg → Now</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Bet</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">To Win</th>
                    </tr>
                  </thead>
                </table>
                <div className="py-24 text-center">
                  <p className="text-sm text-muted-foreground">No positions found.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <div className="py-24 text-center">
                <p className="text-sm text-muted-foreground">No open orders.</p>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <div className="py-24 text-center">
                <p className="text-sm text-muted-foreground">No history found.</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <Footer />
      <DepositModal open={depositModalOpen} onOpenChange={setDepositModalOpen} />
    </div>
  );
};

export default Portfolio;
