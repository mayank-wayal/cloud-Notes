"use client";

import { cn } from "@/lib/utils";

type TabsProps = {
  value: string;
  onChange: (value: string) => void;
  items: { value: string; label: string; icon?: React.ElementType }[];
  className?: string;
};

export function Tabs({ value, onChange, items, className }: TabsProps) {
  return (
    <div className={cn("inline-flex rounded-md border border-slate-800 bg-slate-950 p-1", className)} role="tablist">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded px-3 text-sm font-medium transition",
              active ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-200"
            )}
          >
            {Icon ? <Icon size={15} /> : null}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
