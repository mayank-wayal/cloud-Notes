"use client";

import { motion } from "framer-motion";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { MotionShell } from "@/components/layout/motion-shell";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiError } from "@/services/api";
import { useAuth } from "./auth-provider";

export function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authBusy, isAuthenticated, isLoading, submitPasswordReset } = useAuth();
  const { toast } = useToast();
  const initialEmail = useMemo(() => searchParams?.get("email") || "", [searchParams]);
  const [values, setValues] = useState({ email: initialEmail, code: "", password: "" });
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
      await submitPasswordReset(values);
      toast({ type: "success", title: "Password updated", description: "Sign in with your new password." });
      router.replace("/login");
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
    <AuthLayout title="Create a new password" subtitle="Enter the recovery code and choose a new password for your CloudNotes account.">
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
            <Input type="email" value={values.email} onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))} autoComplete="email" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Reset code</span>
            <Input value={values.code} onChange={(event) => setValues((current) => ({ ...current, code: event.target.value }))} inputMode="numeric" autoComplete="one-time-code" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">New password</span>
            <Input type="password" value={values.password} onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))} autoComplete="new-password" required />
          </label>

          <Button className="h-11 w-full" disabled={loading || authBusy}>
            {loading || authBusy ? <Loader2 className="animate-spin" size={18} /> : <RotateCcw size={18} />}
            Update password
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Need a new code?{" "}
          <Link className="font-semibold text-white underline-offset-4 transition hover:underline" href="/forgot-password">
            Start over
          </Link>
        </p>
      </MotionShell>
    </AuthLayout>
  );
}
