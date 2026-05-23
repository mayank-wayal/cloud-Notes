import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-[linear-gradient(90deg,#0f172a_0,#1e293b_50%,#0f172a_100%)] bg-[length:700px_100%]",
        className
      )}
    />
  );
}
