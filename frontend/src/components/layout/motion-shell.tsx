"use client";

import { motion } from "framer-motion";

export function MotionShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} className={className}>
      {children}
    </motion.div>
  );
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07
    }
  }
};

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 }
};
