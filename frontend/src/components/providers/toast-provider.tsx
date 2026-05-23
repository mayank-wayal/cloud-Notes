"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
};

type ToastContextValue = {
  toast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (nextToast: Omit<Toast, "id">) => {
      const id = Date.now();
      setToasts((current) => [...current, { ...nextToast, id }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.98 }}
              className="rounded-lg border border-slate-800 bg-slate-950 p-4 shadow-soft"
              role={item.type === "error" ? "alert" : "status"}
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  {item.description ? <p className="mt-1 text-sm text-slate-400">{item.description}</p> : null}
                </div>
                <button className="text-slate-500 transition hover:text-white" onClick={() => dismiss(item.id)} aria-label="Dismiss">
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
