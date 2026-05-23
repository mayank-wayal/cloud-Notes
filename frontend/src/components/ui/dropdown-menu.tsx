"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type DropdownAction = {
  label: string;
  onClick: () => void;
  destructive?: boolean;
};

export function DropdownMenu({ actions, label = "Open actions" }: { actions: DropdownAction[]; label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="grid h-9 w-9 place-items-center rounded-md border border-slate-800 bg-slate-950 text-slate-400 transition hover:text-white"
        aria-label={label}
      >
        <MoreHorizontal size={17} />
      </button>
      <AnimatePresence>
        {open ? (
          <>
            <button className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} aria-label="Close menu" />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              className="absolute right-0 top-11 z-50 w-40 overflow-hidden rounded-md border border-slate-800 bg-slate-950 p-1 shadow-soft"
            >
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    action.onClick();
                    setOpen(false);
                  }}
                  className={cn(
                    "block h-9 w-full rounded px-3 text-left text-sm transition hover:bg-slate-900",
                    action.destructive ? "text-red-300" : "text-slate-300"
                  )}
                >
                  {action.label}
                </button>
              ))}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
