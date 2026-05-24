import { Suspense } from "react";
import { ResetPasswordPage } from "@/features/auth/reset-password-page";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResetPasswordRoute() {
  return (
    <Suspense fallback={<Skeleton className="m-8 h-80" />}>
      <ResetPasswordPage />
    </Suspense>
  );
}
