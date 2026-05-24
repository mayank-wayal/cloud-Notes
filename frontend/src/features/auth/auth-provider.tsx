"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { isCognitoConfigured } from "@/config/cognito";
import * as authService from "@/features/auth/services/auth-service";
import type {
  AuthNextStep,
  AuthSession,
  ConfirmSignupPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User
} from "@/types/auth";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isReady: boolean;
  isConfigured: boolean;
  authBusy: boolean;
  login: (payload: LoginPayload) => Promise<AuthSession>;
  register: (payload: RegisterPayload) => Promise<AuthSession | AuthNextStep>;
  confirmSignup: (payload: ConfirmSignupPayload) => Promise<void>;
  requestPasswordReset: (payload: ForgotPasswordPayload) => Promise<AuthNextStep>;
  submitPasswordReset: (payload: ResetPasswordPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AuthSession | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const refreshPromiseRef = useRef<Promise<AuthSession | null> | null>(null);
  const actionPromiseRef = useRef<Promise<unknown> | null>(null);

  const applySession = useCallback((session: AuthSession | null) => {
    setUser(session?.user || null);
    setToken(session?.token || null);
  }, []);

  const refreshSession = useCallback(async () => {
    if (!isCognitoConfigured) {
      applySession(null);
      setIsReady(true);
      return null;
    }

    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = authService
      .getCurrentSession()
      .then((session) => {
        applySession(session);
        return session;
      })
      .catch(() => {
        applySession(null);
        return null;
      })
      .finally(() => {
        setIsReady(true);
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  }, [applySession]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      if (actionPromiseRef.current) throw new Error("Authentication is already in progress.");

      const action = (async () => {
        setAuthBusy(true);
        const existingSession = await refreshSession();
        if (existingSession) return existingSession;

        const session = await authService.login(payload);
        applySession(session);
        return session;
      })();

      actionPromiseRef.current = action;
      try {
        return await action;
      } finally {
        actionPromiseRef.current = null;
        setAuthBusy(false);
      }
    },
    [applySession, refreshSession]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      if (actionPromiseRef.current) throw new Error("Authentication is already in progress.");

      const action = (async () => {
        setAuthBusy(true);
        const existingSession = await refreshSession();
        if (existingSession) return existingSession;

        const session = await authService.register(payload);
        if ("token" in session) applySession(session);
        return session;
      })();

      actionPromiseRef.current = action;
      try {
        return await action;
      } finally {
        actionPromiseRef.current = null;
        setAuthBusy(false);
      }
    },
    [applySession, refreshSession]
  );

  const confirmSignup = useCallback(
    async (payload: ConfirmSignupPayload) => {
      if (actionPromiseRef.current) throw new Error("Authentication is already in progress.");

      const action = (async () => {
        setAuthBusy(true);
        const existingSession = await refreshSession();
        if (existingSession) return;
        await authService.confirmSignup(payload);
      })();

      actionPromiseRef.current = action;
      try {
        await action;
      } finally {
        actionPromiseRef.current = null;
        setAuthBusy(false);
      }
    },
    [refreshSession]
  );

  const requestPasswordReset = useCallback(async (payload: ForgotPasswordPayload) => {
    if (actionPromiseRef.current) throw new Error("Authentication is already in progress.");
    const action = authService.requestPasswordReset(payload);
    actionPromiseRef.current = action;
    setAuthBusy(true);
    try {
      return await action;
    } finally {
      actionPromiseRef.current = null;
      setAuthBusy(false);
    }
  }, []);

  const submitPasswordReset = useCallback(async (payload: ResetPasswordPayload) => {
    if (actionPromiseRef.current) throw new Error("Authentication is already in progress.");
    const action = authService.submitPasswordReset(payload);
    actionPromiseRef.current = action;
    setAuthBusy(true);
    try {
      await action;
    } finally {
      actionPromiseRef.current = null;
      setAuthBusy(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setAuthBusy(true);
      await authService.logout();
      applySession(null);
      router.replace("/login");
    } finally {
      setAuthBusy(false);
    }
  }, [applySession, router]);

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
      isLoading: !isReady,
      isReady,
      isConfigured: isCognitoConfigured,
      authBusy,
      login,
      register,
      confirmSignup,
      requestPasswordReset,
      submitPasswordReset,
      logout,
      refreshSession
    }),
    [user, token, isReady, authBusy, login, register, confirmSignup, requestPasswordReset, submitPasswordReset, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
