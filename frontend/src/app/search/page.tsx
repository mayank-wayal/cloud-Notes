import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchPageClient } from "@/features/search/search-page-client";

export default function SearchPage() {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-80" />}>
      <SearchPageClient />
    </Suspense>
  );
}
