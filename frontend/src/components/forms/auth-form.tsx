"use client";

import { motion } from "framer-motion";
import { AlertCircle, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LoginPayload, RegisterPayload } from "@/types/auth";

type AuthFormProps = {
  mode: "login" | "register";
  loading: boolean;
  error: string;
  onSubmit: (payload: LoginPayload | RegisterPayload) => Promise<void>;
};

export function AuthForm({ mode, loading, error, onSubmit }: AuthFormProps) {
  const isRegister = mode === "register";
  const [values, setValues] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    await onSubmit(isRegister ? values : { email: values.email, password: values.password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-md border border-red-950/70 bg-red-950/30 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </motion.div>
      ) : null}

      {isRegister ? (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Name</span>
          <span className="relative block">
            <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
            <Input className="pl-10" value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} autoComplete="name" required />
          </span>
        </label>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
        <span className="relative block">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
          <Input
            className="pl-10"
            type="email"
            value={values.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </span>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">Password</span>
        <span className="relative block">
          <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
          <Input
            className="pl-10"
            type="password"
            value={values.password}
            onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
            placeholder="Minimum 8 characters"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
          />
        </span>
      </label>

      <Button className="h-11 w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" size={18} /> : null}
        {isRegister ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}
