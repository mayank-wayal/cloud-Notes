import { useMemo } from "react";
import { markdownToHtml } from "@/lib/markdown";
import { cn } from "@/lib/utils";

export function MarkdownPreview({ content, className }: { content: string; className?: string }) {
  const html = useMemo(() => markdownToHtml(content || "_Start writing to see a preview._"), [content]);

  return (
    <article
      className={cn(
        "prose-preview min-h-full text-slate-300",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
