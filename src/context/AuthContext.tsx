import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────
export type AppRole = "citizen" | "agent" | "controller" | "admin" | "president";

interface User {
  id: string;
  email: string;
  displayName: string;
  role: AppRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: (role: AppRole) => void;
  logout: () => void;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Demo Users ──────────────────────────────────────────────────────
const DEMO_USERS: Record<AppRole, User> = {
  citizen: {
    id: "demo-citizen",
    email: "citoyen@idn.ga",
    displayName: "Citoyen Demo",
    role: "citizen",
  },
  agent: {
    id: "demo-agent",
    email: "agent@idn.ga",
    displayName: "Agent Demo",
    role: "agent",
  },
  controller: {
    id: "demo-controller",
    email: "controleur@idn.ga",
    displayName: "Contrôleur Demo",
    role: "controller",
  },
  admin: {
    id: "demo-admin",
    email: "admin@idn.ga",
    displayName: "Administrateur Demo",
    role: "admin",
  },
  president: {
    id: "demo-president",
    email: "president@idn.ga",
    displayName: "Président Demo",
    role: "president",
  },
};

const AUTH_STORAGE_KEY = "idn_auth_user";

// ─── Provider ────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, _password: string) => {
    // TODO: Replace with real Firebase Auth or Convex Auth
    const demoUser: User = {
      id: crypto.randomUUID(),
      email,
      displayName: email.split("@")[0],
      role: "citizen",
    };
    setUser(demoUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
  };

  const loginAsDemo = (role: AppRole) => {
    const demoUser = DEMO_USERS[role];
    setUser(demoUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const hasRole = (role: AppRole): boolean => {
    if (!user) return false;
    // Admin and president have access to everything
    if (user.role === "admin" || user.role === "president") return true;
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsDemo,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
