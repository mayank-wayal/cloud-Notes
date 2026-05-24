"use client";

import { motion } from "framer-motion";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { MotionShell } from "@/components/layout/motion-shell";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiError } from "@/services/api";
import { useAuth } from "./auth-provider";

export function ForgotPasswordPage() {
  const router = useRouter();
  const { authBusy, isAuthenticated, isLoading, requestPasswordReset } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || authBusy || isAuthenticated) return;
    setError("");
    setLoading(true);

    try {
      const result = await requestPasswordReset({ email });
      toast({ type: "success", title: "Code sent", description: "Check your email for the reset code." });
      router.replace(`/reset-password?email=${encodeURIComponent(result.email)}`);
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
        </MotionShell>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We will send a secure recovery code to the email on your Cognito account.">
      <MotionShell>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 rounded-md border border-red-950/70 bg-red-950/30 px-4 py-3 text-sm text-red-200" role="alert">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              {error}
            </motion.div>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </label>

          <Button className="h-11 w-full" disabled={loading || authBusy}>
            {loading || authBusy ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
            Send reset code
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Remembered it?{" "}
          <Link className="font-semibold text-white underline-offset-4 transition hover:underline" href="/login">
            Sign in
          </Link>
        </p>
      </MotionShell>
    </AuthLayout>
  );
}
