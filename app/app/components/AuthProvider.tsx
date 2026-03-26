"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AuthUser } from "@/lib/types";

interface AuthContextType {
  user: AuthUser | null;
  users: AuthUser[];
  setUser: (user: AuthUser | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  users: [],
  setUser: () => {},
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users);
        const savedId = localStorage.getItem("mockUserId");
        if (savedId) {
          const saved = data.users.find((u: AuthUser) => u.id === savedId);
          if (saved) setUserState(saved);
        }
        setLoading(false);
      });
  }, []);

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem("mockUserId", u.id);
    } else {
      localStorage.removeItem("mockUserId");
    }
  };

  return (
    <AuthContext.Provider value={{ user, users, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
