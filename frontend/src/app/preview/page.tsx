import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PreviewPageClient } from "@/features/preview/preview-page-client";

export default function PreviewPage() {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-80" />}>
      <PreviewPageClient />
    </Suspense>
  );
}
