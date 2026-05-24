import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EditorPageClient } from "@/features/editor/editor-page-client";

export default function EditorPage() {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-96" />}>
      <EditorPageClient />
    </Suspense>
  );
}
