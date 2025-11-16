import { Search, Bell, Settings, Trophy, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import WalletButton from "@/components/WalletButton";

interface HeaderProps {
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  onDepositClick?: () => void;
}

export const Header = ({ onLoginClick, onSignUpClick, onDepositClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  useState(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const handleLeaderboard = () => {
    console.log("Navigate to leaderboard");
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-105">
              H
            </div>
            <span className="hidden sm:inline-block font-semibold text-foreground">
              Hitcastor
            </span>
          </Link>
          <Link
            to="/how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            How it works
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search markets..."
              className="w-[300px] pl-9 bg-secondary/50"
            />
          </div>
          
          {isAuthenticated ? (
            <>
              <Link to="/portfolio" className="hidden sm:flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">Portfolio</span>
                <span className="font-semibold text-green-600">
                  ${user?.wallet.portfolioBalance.toFixed(2)}
                </span>
              </Link>
              <Link to="/portfolio" className="hidden sm:flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">Cash</span>
                <span className="font-semibold text-green-600">
                  ${user?.wallet.cashBalance.toFixed(2)}
                </span>
              </Link>
              <Button size="sm" onClick={onDepositClick}>
                Deposit
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Bell className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs font-semibold">
                        {user?.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur">
                  <div className="flex items-center gap-3 px-2 py-3 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm font-semibold">
                        {user?.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{user?.username}</div>
                      <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => navigate("/settings")}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <DropdownMenuItem onClick={handleLeaderboard} className="cursor-pointer py-3">
                    <Trophy className="h-4 w-4 mr-3" />
                    Leaderboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-3">
                    <LogOut className="h-4 w-4 mr-3" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <WalletButton />
              <Button variant="ghost" size="sm" onClick={onLoginClick}>
                Log In
              </Button>
              <Button size="sm" onClick={onSignUpClick}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
