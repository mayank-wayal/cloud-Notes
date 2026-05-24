import { Suspense } from "react";
import { ConfirmSignupPage } from "@/features/auth/confirm-signup-page";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConfirmPage() {
  return (
    <Suspense fallback={<Skeleton className="m-8 h-80" />}>
      <ConfirmSignupPage />
    </Suspense>
  );
}
