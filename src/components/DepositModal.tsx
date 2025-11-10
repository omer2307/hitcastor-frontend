import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, CreditCard, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DepositModal = ({ open, onOpenChange }: DepositModalProps) => {
  const { user, deposit } = useAuth();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  const depositOptions = [
    {
      id: "crypto",
      icon: Wallet,
      title: "Transfer Crypto",
      description: "No limit - Instant",
      logos: ["ETH", "USDC", "USDT"],
    },
    {
      id: "card",
      icon: CreditCard,
      title: "Deposit with Card",
      description: "$50,000 limit - 5 min",
      logos: ["Visa", "Mastercard"],
    },
    {
      id: "paypal",
      icon: CreditCard,
      title: "Deposit with PayPal",
      description: "$10,000 limit - 5 min",
      logos: ["PayPal"],
    },
  ];

  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    if (!selectedMethod || !depositAmount || depositAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    const method = depositOptions.find(opt => opt.id === selectedMethod);
    deposit(depositAmount, method?.title || "");
    
    toast({
      title: "Deposit successful",
      description: `$${depositAmount.toFixed(2)} has been added to your cash balance`,
    });

    setAmount("");
    setSelectedMethod(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Deposit</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Polymarket Balance: <span className="font-semibold">${user?.wallet.cashBalance.toFixed(2)}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!selectedMethod ? (
            <div className="space-y-3">
              {depositOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedMethod(option.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary transition-colors text-left group"
                >
                  <div className="p-3 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                    <option.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{option.title}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {option.logos.map((logo, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded bg-muted flex items-center justify-center text-[10px] font-medium"
                      >
                        {logo.slice(0, 2)}
                      </div>
                    ))}
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedMethod(null)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleDeposit}>
                  Confirm Deposit
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
