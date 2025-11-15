import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ScrollToTop } from "./components/ScrollToTop";
import Providers from "./lib/providers";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import HowItWorks from "./pages/HowItWorks";
import Market from "./pages/Market";
import MarketPage from "./pages/MarketPage"; // New blockchain-integrated page
import DebugPage from "./pages/DebugPage"; // Debug page
import TradeTest from "./pages/TradeTest"; // Trade test page
import Portfolio from "./pages/Portfolio";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const App = () => (
  <Providers>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/market/:id" element={<Market />} />
            <Route path="/trade/:id" element={<MarketPage />} /> {/* New blockchain route */}
            <Route path="/debug" element={<DebugPage />} /> {/* Debug route */}
            <Route path="/test" element={<TradeTest />} /> {/* Simple approve test */}
            <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </Providers>
);

export default App;
