"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchAuthSession, getCurrentUser } from "@aws-amplify/auth";
import * as authService from "@/services/auth";
import type { AuthSession, LoginPayload, RegisterPayload, User } from "@/types/auth";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (payload: LoginPayload) => Promise<AuthSession>;
  register: (payload: RegisterPayload) => Promise<AuthSession>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize auth from Cognito
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();

        if (currentUser && session?.tokens?.accessToken) {
          setUser({
            id: currentUser.userId,
            email: currentUser.username,
            name: currentUser.username.split("@")[0],
            created_at: ""
          });

          setToken(session.tokens.accessToken.toString());
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        // User not authenticated
        setUser(null);
        setToken(null);
      } finally {
        setIsReady(true);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const session = await authService.login(payload);
      setToken(session.token);
      setUser(session.user);
      return session;
    },
    []
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const session = await authService.register(payload);
      setToken(session.token);
      setUser(session.user);
      return session;
    },
    []
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    const handleUnauthorized = async () => {
      await logout();
    };

    window.addEventListener("cloudnotes:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("cloudnotes:unauthorized", handleUnauthorized);
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isReady,
      login,
      register,
      logout
    }),
    [user, token, isReady, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
