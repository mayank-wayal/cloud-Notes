"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthForm } from "@/components/forms/auth-form";
import { AuthLayout } from "@/components/layout/auth-layout";
import { MotionShell } from "@/components/layout/motion-shell";
import { useToast } from "@/components/providers/toast-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiError } from "@/services/api";
import type { LoginPayload, RegisterPayload } from "@/types/auth";
import { useAuth } from "./auth-provider";

type AuthPageProps = {
  mode: "login" | "register";
};

export function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const { authBusy, isAuthenticated, isConfigured, isLoading, login, register } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isRegister = mode === "register";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (payload: LoginPayload | RegisterPayload) => {
    if (loading || authBusy || isAuthenticated) return;
    setError("");
    setLoading(true);

    try {
      if (!isConfigured) {
        throw new Error("Cognito is not configured. Add your User Pool ID and App Client ID to frontend/.env.local.");
      }

      if (isRegister) {
        const result = await register(payload as RegisterPayload);
        if ("status" in result && result.status === "CONFIRM_SIGN_UP") {
          toast({ type: "success", title: "Check your email", description: "Enter the verification code to activate your account." });
          router.replace(`/confirm?email=${encodeURIComponent(result.email)}`);
          return;
        }
        toast({ type: "success", title: "Account created", description: "Welcome to CloudNotes." });
      } else {
        await login(payload as LoginPayload);
        toast({ type: "success", title: "Signed in", description: "Your workspace is ready." });
      }
      router.replace("/dashboard");
    } catch (submitError) {
      setError(getApiError(submitError));
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <AuthLayout title="Checking your session" subtitle="We are restoring your CloudNotes workspace.">
        <MotionShell>
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-5 h-11 w-full" />
          <Skeleton className="mt-3 h-11 w-full" />
        </MotionShell>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={isRegister ? "Create your account" : "Welcome back"}
      subtitle={isRegister ? "Start with a secure workspace for every note and upload." : "Sign in to manage notes and private downloads."}
    >
      <MotionShell>
        <AuthForm mode={mode} loading={loading || authBusy} error={error} onSubmit={handleSubmit} />
        <p className="mt-6 text-center text-sm text-slate-400">
          {isRegister ? "Already have an account?" : "New to CloudNotes?"}{" "}
          <Link className="font-semibold text-white underline-offset-4 transition hover:underline" href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
        {!isRegister ? (
          <p className="mt-3 text-center text-sm text-slate-500">
            <Link className="font-semibold text-slate-200 underline-offset-4 transition hover:text-white hover:underline" href="/forgot-password">
              Forgot password?
            </Link>
          </p>
        ) : null}
      </MotionShell>
    </AuthLayout>
  );
}
