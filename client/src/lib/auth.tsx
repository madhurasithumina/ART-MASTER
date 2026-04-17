import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";

export type User = {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
};

type AuthContextValue = {
  user: User | null;
  token: string;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") ?? "");
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    async function syncMe() {
      if (!token) return;
      try {
        const res = await apiFetch<{ user: User }>("/api/auth/me");
        setUser(res.user);
      } catch {
        setToken("");
        setUser(null);
      }
    }
    syncMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      token,
      isAdmin: user?.role === "admin",
      async login(email, password) {
        const res = await apiFetch<{ token: string; user: User }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(res.token);
        setUser(res.user);
      },
      async register(name, email, password) {
        const res = await apiFetch<{ token: string; user: User }>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        setToken(res.token);
        setUser(res.user);
      },
      logout() {
        setToken("");
        setUser(null);
      },
    };
  }, [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
