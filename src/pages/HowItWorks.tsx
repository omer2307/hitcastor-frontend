import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { DepositModal } from "@/components/DepositModal";
import { Music, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

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

  const steps = [
    {
      icon: Music,
      title: "Pick a Song",
      description:
        "Buy 'Yes' or 'No' shares on whether a song will climb the charts. Odds update in real time as others place their bets.",
      color: "from-primary to-primary/80",
    },
    {
      icon: DollarSign,
      title: "Place a Bet",
      description:
        "Fund your account via crypto, card, or bank transfer. No bet limits or hidden fees. Just pure prediction power.",
      color: "from-accent to-accent/80",
    },
    {
      icon: TrendingUp,
      title: "Profit 🤑",
      description:
        "Sell your shares anytime or wait for market resolution. Each winning share is worth $1. Track your performance and climb the leaderboard.",
      color: "from-primary via-accent to-primary",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onLoginClick={handleLoginClick}
        onSignUpClick={handleSignUpClick}
        onDepositClick={handleDepositClick}
      />

      <main className="flex-1">
        <div className="container px-4 py-12 md:py-20">
          <div className="mx-auto max-w-4xl space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                How It Works
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Three simple steps to start predicting chart hits
              </p>
            </div>

            <div className="space-y-16">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-8 items-start"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                    >
                      <step.icon className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground">
                        STEP {index + 1}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <h2 className="text-3xl font-bold">{step.title}</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 md:p-12 text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready to get started?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of music fans predicting chart movements and earning from their knowledge.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" onClick={handleSignUpClick}>
                  Create Account
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/")}>
                  Browse Markets
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={authMode}
      />
      <DepositModal open={depositModalOpen} onOpenChange={setDepositModalOpen} />
    </div>
  );
};

export default HowItWorks;
