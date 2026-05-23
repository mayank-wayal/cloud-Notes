"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthForm } from "@/components/forms/auth-form";
import { AuthLayout } from "@/components/layout/auth-layout";
import { MotionShell } from "@/components/layout/motion-shell";
import { useToast } from "@/components/providers/toast-provider";
import { getApiError } from "@/services/api";
import type { LoginPayload, RegisterPayload } from "@/types/auth";
import { useAuth } from "./auth-provider";

type AuthPageProps = {
  mode: "login" | "register";
};

export function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isRegister = mode === "register";

  const handleSubmit = async (payload: LoginPayload | RegisterPayload) => {
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await register(payload as RegisterPayload);
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

  return (
    <AuthLayout
      title={isRegister ? "Create your account" : "Welcome back"}
      subtitle={isRegister ? "Start with a secure workspace for every note and upload." : "Sign in to manage notes and private downloads."}
    >
      <MotionShell>
        <AuthForm mode={mode} loading={loading} error={error} onSubmit={handleSubmit} />
        <p className="mt-6 text-center text-sm text-slate-400">
          {isRegister ? "Already have an account?" : "New to CloudNotes?"}{" "}
          <Link className="font-semibold text-white underline-offset-4 transition hover:underline" href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </MotionShell>
    </AuthLayout>
  );
}
