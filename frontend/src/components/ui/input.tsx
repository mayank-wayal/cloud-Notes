import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/15",
        className
      )}
      {...props}
    />
  );
}
