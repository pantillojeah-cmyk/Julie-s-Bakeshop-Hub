import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, loginUser } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("jbh_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { user: foundUser } = await loginUser(username, password);
      setUser(foundUser);
      localStorage.setItem("jbh_user", JSON.stringify(foundUser));
      return { ok: true };
    } catch (err: any) {
      console.error("Login failed:", err);
      return { ok: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("jbh_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
