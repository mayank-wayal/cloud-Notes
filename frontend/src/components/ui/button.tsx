import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-white text-slate-950 shadow-[0_12px_30px_rgba(255,255,255,0.08)] hover:bg-slate-200",
  secondary: "border border-slate-800 bg-slate-900/80 text-slate-100 hover:bg-slate-800",
  ghost: "text-slate-300 hover:bg-slate-900 hover:text-white",
  danger: "border border-red-950/70 bg-red-950/30 text-red-200 hover:bg-red-950/50"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold outline-none transition duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-500",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
