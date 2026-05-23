"use client";

import "@/config/cognito";
import { AuthProvider } from "@/features/auth/auth-provider";
import { ToastProvider } from "./toast-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
