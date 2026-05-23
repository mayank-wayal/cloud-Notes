"use client";

import { motion } from "framer-motion";
import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { fadeUp, staggerContainer } from "@/components/layout/motion-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { useAuth } from "@/features/auth/auth-provider";
import { formatDate } from "@/lib/utils";

export function SettingsPageClient() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.section variants={fadeUp} className="mb-6">
            <p className="text-sm font-medium text-slate-500">Settings</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Profile and workspace</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Review account details and security state for your CloudNotes workspace.</p>
          </motion.section>

          <motion.div variants={fadeUp} className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-white">Profile</h2>
                <p className="mt-1 text-sm text-slate-500">Account details come from your current authenticated session.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <UserRound size={15} />
                    Name
                  </span>
                  <Input value={user?.name || ""} readOnly />
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Mail size={15} />
                    Email
                  </span>
                  <Input value={user?.email || ""} readOnly />
                </label>
                <Button variant="secondary" disabled>
                  Profile editing not enabled by backend
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-semibold text-white">Security</h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                  <ShieldCheck className="mt-0.5 text-slate-300" size={19} />
                  <div>
                    <p className="font-medium text-white">JWT protected</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">Your dashboard requests use the existing bearer token auth flow.</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500">Member since {formatDate(user?.created_at)}</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
