"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "indigo" | "blue" | "violet";
  delay?: number;
};

const tones = {
  indigo: "from-indigo-500/18 to-transparent text-indigo-200",
  blue: "from-blue-500/18 to-transparent text-blue-200",
  violet: "from-violet-500/18 to-transparent text-violet-200"
};

export function StatCard({ label, value, detail, icon: Icon, tone = "indigo", delay = 0 }: StatCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay }} whileHover={{ y: -4 }}>
      <Card className="group relative overflow-hidden transition duration-200 hover:border-indigo-300/20">
        <div className={`absolute inset-0 bg-gradient-to-br ${tones[tone]} opacity-80`} />
        <CardContent className="relative p-6">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">{label}</span>
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-200 transition group-hover:scale-105">
              <Icon size={17} />
            </span>
          </div>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: delay + 0.05 }} className="text-4xl font-bold tracking-tight text-white">
            {value}
          </motion.p>
          <p className="mt-3 text-sm text-slate-500">{detail}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
