import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "trade";
  amount: number;
  timestamp: Date;
  method?: string;
}

interface UserWallet {
  portfolioBalance: number;
  cashBalance: number;
  positions: any[];
  transactions: Transaction[];
}

interface User {
  email: string;
  username: string;
  wallet: UserWallet;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  deposit: (amount: number, method: string) => void;
  withdraw: (amount: number) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "polymarket_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    // Save user to localStorage whenever it changes
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    // Fake login - accepts any input
    const newUser: User = {
      email,
      username: email.split("@")[0],
      wallet: {
        portfolioBalance: 0.91,
        cashBalance: 0.90,
        positions: [],
        transactions: [],
      },
    };
    setUser(newUser);
  };

  const signup = async (email: string, password: string) => {
    // Fake signup - same as login
    await login(email, password);
  };

  const loginWithGoogle = async () => {
    // Fake Google login
    const newUser: User = {
      email: "user@google.com",
      username: "googleuser",
      wallet: {
        portfolioBalance: 0.91,
        cashBalance: 0.90,
        positions: [],
        transactions: [],
      },
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const deposit = (amount: number, method: string) => {
    if (!user) return;

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: "deposit",
      amount,
      timestamp: new Date(),
      method,
    };

    setUser({
      ...user,
      wallet: {
        ...user.wallet,
        cashBalance: user.wallet.cashBalance + amount,
        transactions: [transaction, ...user.wallet.transactions],
      },
    });
  };

  const withdraw = (amount: number) => {
    if (!user) return;
    if (user.wallet.cashBalance < amount) return;

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: "withdraw",
      amount,
      timestamp: new Date(),
    };

    setUser({
      ...user,
      wallet: {
        ...user.wallet,
        cashBalance: user.wallet.cashBalance - amount,
        transactions: [transaction, ...user.wallet.transactions],
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        loginWithGoogle,
        logout,
        deposit,
        withdraw,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
